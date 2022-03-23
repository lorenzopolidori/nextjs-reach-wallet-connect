# NextJS + Algorand Wallets using Reach client library
We want to crate a simple NextJS React web application to allow users to connect to their Algorand wallets using the reach client library.

## How to import reach stdlib in a nextjs project
Nextjs web applications use Server Side Rendering (SSR) by default. This means that app dependencies are compiled and bundled in a node environment on the backend before generating the web pages and returning the HTML code to the browser. When doing so, the `window` object - that is normally available on a browser javascript environment - is not defined.

Let's try this firts hand. Let's create a simple nextjs app and install reach:

```bash
npx create-next-app --use-npm
npm install @reach-sh/stdlib
```

Let's now head to the `index.js` file and import reach and the wallet dependencies at the top:

```js
import { loadStdlib } from '@reach-sh/stdlib';
import MyAlgoConnect from '@reach-sh/stdlib/ALGO_MyAlgoConnect';
```

If we now run our app on a dev server:
```
npm run dev
```

We get this error message on the console:

```
ReferenceError: window is not defined

This error happened while generating the page. Any console logs will be displayed in the terminal window.
```

This happens because one of the dependencies of the `MyAlgoConnect` library uses `windows` in its implementation:

```
at Messenger._installListener (/node_modules/@randlabs/communication-bridge/lib/messenger.js:144:3)
at new Messenger (/node_modules/@randlabs/communication-bridge/lib/messenger.js:43:8)
at new Messaging (/node_modules/@randlabs/myalgo-connect/lib/messaging/Messaging.js:56:17)
```

We can solve this problem by dynamically loading `MyAlgoConnect` instead of compiling and bundling it into the app before generating the page. This way `MyAlgoConnect` will run within the browser context and `window` will be available to use.

Let's change the `index.js` file to dynamically import all Reach client libraries:

```js
import Head from 'next/head'
import { useRef, useState, useEffect } from 'react'

export default function Home() {
  const reach = useRef()
  const myAlgoConnect = useRef()
  const [loading, setLoading] = useState(true)

  async function connectMyAlgoWallet() {
    setWallet({ MyAlgoConnect: myAlgoConnect.current })
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
          {!loading && <button onClick={connectMyAlgoWallet}>Connect to MyAlgo</button>}
        </nav>
      </main>
    </div>
  )
}
```

This now works as expected. It also has the advantage of loading and rendering the static page very quickly, while the Reach client libraries are downloaded in the background. 
Loading `stdlib` and `ALGO_MyAlgoConnect` in parallel is also a further optimization and it works with no issues.

Let's not try to add support for WalletConnect, which will enable using Pera Wallet.

If we try to dynamically load `ALGO_WalletConnect` library in parallel with `stdlib` and `ALGO_MyAlgoConnect` in `useEffect`, as follows:

```js
let [reachStdlib, myAlgoConnectLib, walletConnectLib] = await Promise.all([
    import('@reach-sh/stdlib'),
    import('@reach-sh/stdlib/ALGO_MyAlgoConnect'),
    import('@reach-sh/stdlib/ALGO_WalletConnect')
])
```

we get the following error:
```
shared_backend.mjs?fa3d:187 Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'utils')
    at eval (shared_backend.mjs?fa3d:187:10)
    ...
    at eval (ALGO_WalletConnect.mjs:4:70)
    at Module../node_modules/@reach-sh/stdlib/ALGO_WalletConnect.mjs (node_modules_reach-sh_stdlib_ALGO_WalletConnect_mjs.js:2825:1)
    ...
    at async Promise.all (:3000/index 2)
```

It seems that `ALGO_WalletConnect` cannot find a `utils` variable used in `shared_backend.mjs`.
This might be because of missing dependencies defined in reach `stdlib`, so we can try to dynamically load as below:

```js
useEffect(() => {
    async function loadLibs() {
      let [reachStdlib, myAlgoConnectLib] = await Promise.all([
        import('@reach-sh/stdlib'),
        import('@reach-sh/stdlib/ALGO_MyAlgoConnect')
      ])
      reach.current = reachStdlib.loadStdlib({ ...process.env, 'REACH_CONNECTOR_MODE': 'ALGO' })
      myAlgoConnect.current = myAlgoConnectLib.default

      let walletConnectLib = await import('@reach-sh/stdlib/ALGO_WalletConnect')

      setLoading(false)
    }
    loadLibs()
}, [])
```

but with no luck, we still get the same error.


