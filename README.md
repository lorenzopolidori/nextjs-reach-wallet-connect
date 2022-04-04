# NextJS + Algorand Wallets using Reach client library
We want to crate a simple Next.js React web application to allow users to connect to their Algorand wallets using the reach client library.

## How to dynamically import reach stdlib in a Next.js project
Next.js web applications use Server Side Rendering (SSR) by default. This means that app dependencies are compiled and bundled in a node environment on the backend before generating the web pages and returning the HTML code to the browser. 
As `@reach-sh/stdlib` is big in size, it is a good idea to dynamically load it instead of bundling it together with the rest of the app. This way, we also make sure that, if `window` is used (as it is the case in some versions of the library), this is only used within the browser context, and not in the node.js backend at build time - which would trigger an error.

In this simple application, `@reach-sh/stdlib` is dynamically loaded in a `useEffect()` React hook in `index.js`. 

> Note: because of an [issue](https://github.com/reach-sh/reach-lang/issues/755) with the Reach `stdlib`, it is necessary to reload the page on the browser to switch between wallets.