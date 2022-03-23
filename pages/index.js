import Head from 'next/head'
import { useRef, useState, useEffect } from 'react'

export default function Home() {
  const reach = useRef()
  const myAlgoConnect = useRef()
  const walletConnect = useRef()
  const [loading, setLoading] = useState(true)

  async function connectMyAlgoWallet() {
    setWallet({ MyAlgoConnect: myAlgoConnect.current })
    await connectWallet()
  }

  async function connectPeraWallet() {
    setWallet({ WalletConnect: walletConnect.current })
    await connectWallet()
  }

  function setWallet(wallet) {
    reach.current.setWalletFallback(reach.current.walletFallback({
      providerEnv: 'TestNet', ...wallet
    }))
  }

  async function connectWallet() {
    let account;
    try {
      account = await reach.current.getDefaultAccount()
    } catch (e) {
      console.error('Error when connecting to wallet', e)
      return;
    }
    const balance = await reach.current.balanceOf(account)
    reach.current.formatCurrency(balance, 4)
  }

  useEffect(() => {
    async function loadLibs() {
      let [reachStdlib, myAlgoConnectLib] = await Promise.all([
        import('@reach-sh/stdlib'),
        import('@reach-sh/stdlib/ALGO_MyAlgoConnect')
      ])
      reach.current = reachStdlib.loadStdlib({ ...process.env, 'REACH_CONNECTOR_MODE': 'ALGO' })
      myAlgoConnect.current = myAlgoConnectLib.default

      try {
        let walletConnectLib = await import('@reach-sh/stdlib/ALGO_WalletConnect')
        walletConnect.current = walletConnectLib.default
      } catch (e) {
        console.error('Error when loading ALGO_WalletConnect', e)
      }

      setLoading(false)
    }
    loadLibs()
  }, [])

  return (
    <div className="container">
      <Head>
        <title>Algorand Wallets with NextJS and Reach</title>
        <link rel="icon" href="/favicon.svg" />
      </Head>

      <main>
        <h1>Algorand Wallets with NextJS and Reach</h1>
        <header>NextJS React web application to allow users to connect to their Algorand wallets using the reach client library.</header>

        <nav>
          {loading && <div>Loading...</div>}
          {!loading &&
            <>
              <button onClick={connectMyAlgoWallet}>Connect to MyAlgo Wallet</button>
              <button onClick={connectPeraWallet}>Connect to Pera Wallet</button>
            </>
          }
        </nav>
      </main>
    </div>
  )
}
