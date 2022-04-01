import Head from 'next/head'
import { loadStdlib } from '@reach-sh/stdlib';
import MyAlgoConnect from '@reach-sh/stdlib/ALGO_MyAlgoConnect';
const stdlib = loadStdlib({ ...process.env, 'REACH_CONNECTOR_MODE': 'ALGO' });

export default function Home() {
  async function connectMyAlgoWallet() {
    setWallet({ MyAlgoConnect: MyAlgoConnect })
    await connectWallet()
  }

  async function connectPeraWallet() {
  }

  function setWallet(wallet) {
    stdlib.setWalletFallback(stdlib.walletFallback({
      providerEnv: 'TestNet', ...wallet
    }))
  }

  async function connectWallet() {
    let account;
    try {
      account = await stdlib.getDefaultAccount()
    } catch (e) {
      console.error('Error when connecting to wallet', e)
      return;
    }
    const balance = await stdlib.balanceOf(account)
    stdlib.formatCurrency(balance, 4)
  }

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
          <button onClick={connectMyAlgoWallet}>Connect to MyAlgo Wallet</button>
          <button onClick={connectPeraWallet}>Connect to Pera Wallet</button>
        </nav>
      </main>
    </div>
  )
}
