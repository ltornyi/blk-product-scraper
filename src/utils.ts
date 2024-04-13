export const DATA_PATH = './data/';

export type SiteInfo = {
  host: string,
  screener: string
}

export type BlkProductSites = {
  [key: string]: SiteInfo
}

export const BLK_PRODUCT_SITES: BlkProductSites = {
  'UK-I': {
    host: 'https://www.blackrock.com',
    screener: '/uk/product-screener/product-screener-v3.1.jsn?dcrPath=/templatedata/config/product-screener-v3/data/en/uk/product-screener/product-screener-backend-config&userType=individual&siteEntryPassthrough=true'
  },
  'US-I': {
    host: 'https://www.blackrock.com',
    screener: '/us/individual/product-screener/product-screener-v3.jsn?dcrPath=/templatedata/config/product-screener-v3/data/en/one/one-v4&siteEntryPassthrough=true'
  }
}

export const getSiteOption = (option:any) => {
  const site = option.site ? option.site : 'UK-I';
  return site;
}