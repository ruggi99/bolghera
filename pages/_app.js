import "styles/globals.scss";

import Head from "next/head";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <html data-theme="light" />
        <title>Bolghera</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
