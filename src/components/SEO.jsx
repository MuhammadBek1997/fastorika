import { Helmet } from 'react-helmet-async';

const SEO = ({
  title = 'Fastorika',
  description = 'Send money internationally with Fastorika. Fast, secure and low-cost transfers to bank accounts, cards and crypto wallets worldwide.',
  keywords = 'money transfer, international transfer, send money, Fastorika',
  canonical,
  noindex = false
}) => {
  const fullTitle = title === 'Fastorika'
    ? 'Fastorika - Fast & Secure International Money Transfers'
    : `${title} | Fastorika`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />

      {/* Twitter */}
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
    </Helmet>
  );
};

export default SEO;
