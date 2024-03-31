import "styles/globals.scss";

import Head from "next/head";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Bolghera</title>
      </Head>
      <div data-theme="light">
        <Component {...pageProps} />
      </div>
    </>
  );
}

export default MyApp;
