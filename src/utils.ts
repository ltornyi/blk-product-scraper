import puppeteer, { Browser, Page } from "puppeteer";

export const DATA_PATH = './data/';
export const PRODUCT_FILE_SUFFIX = '.products.json';
export const HOLDINGS_FILE_SUFFIX = '.holdings.jsonl';
export const SITEENTRY_PASS = '?switchLocale=y&siteEntryPassthrough=true';

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
  return site as keyof typeof BLK_PRODUCT_SITES;
}

export const getProductsOption = (option:any) => {
  const products = (option.products ? option.products : 'all') as string;
  return products;
}

export const getContinueOption = (option:any) => {
  const cont = (option.continue ? option.continue : '') as string;
  return cont;
}

interface BrowserAndPage {
  browser: Browser;
  page: Page;
}

export const getBrowserAndPage = async (): Promise<BrowserAndPage> => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  return { browser, page };
};