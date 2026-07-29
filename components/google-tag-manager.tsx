"use client";

import Script from "next/script";

/**
 * Loads Google Tag Manager and initializes Consent Mode (default denied) before
 * it runs. Renders the `<noscript>` fallback too. Comment out the usage in the
 * layout to disable GTM entirely.
 */
export function GoogleTagManager({ gtmId }: { gtmId?: string }) {
  if (!gtmId) {
    return null;
  }

  return (
    <>
      {/* Initialize dataLayer + gtag and set default consent (denied) before GTM loads */}
      <Script id="gtm-consent-init" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'analytics_storage': 'denied',
            'functionality_storage': 'denied',
            'security_storage': 'granted',
            'personalization_storage': 'denied'
          });
        `}
      </Script>

      {/* Google Tag Manager loader */}
      <Script id="gtm-script" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
      </Script>

      {/* No-JS fallback */}
      <noscript>
        <iframe
          title="Google Tag Manager"
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>
    </>
  );
}
