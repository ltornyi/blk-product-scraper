import fs from 'node:fs';
import { ElementHandle, Page } from "puppeteer";
import { BLK_PRODUCT_SITES, DATA_PATH, HOLDINGS_FILE_SUFFIX, SITEENTRY_PASS, getBrowserAndPage, getProductsOption, getSiteOption } from "./utils";
import { Product, loadProducts } from "./products";

export type ProductHolding = {
  productPortfolioId: number,
  name: string,
  weight: number,
  ticker?: string,
  isin?: string,
  kind?: string
}

export const downloadHoldings = async (options: any) => {
  const site = getSiteOption(options);
  const host = BLK_PRODUCT_SITES[site].host;
  const products = getProductsOption(options);
  const productData = loadProducts(site);

  console.log(`Downloading holdings from ${site}, products: ${products}`);
  const { browser, page } = await getBrowserAndPage();

  switch (products) {
    case 'all':
      await downloadHoldingsForAll(page, host, productData, site)
      break;
    case 'top10':
      await downloadHoldingsForTop10(page, host, productData, site);
      break;
    default:
      await downloadHoldingsForOneProduct(page, host, productData, parseInt(products), site)
      break;
  }
  
  await browser.close();
  console.log('Done');
}

const downloadHoldingsForOneProduct = async (page: Page, host: string, productData: Product[], productPortfolioId: number, site: string|number) => {
  // find the product with the portfolio id
  const match = productData.filter(prd => prd.portfolioId === productPortfolioId)[0];
  if (match.productPageUrl) {
    const scraped = await scrapeHoldingsForProduct(page, productPortfolioId, host, match.productPageUrl)
    appendProductHoldings(scraped, site)
  }
}

const downloadHoldingsForAll = async (page: Page, host: string, productData: Product[], site: string|number) => {
  for (const prd of productData) {
    if (prd.productPageUrl) {
      const scraped = await scrapeHoldingsForProduct(page, prd.portfolioId, host, prd.productPageUrl);
      appendProductHoldings(scraped, site)
    }
  }
}

const downloadHoldingsForTop10 = async (page: Page, host: string, productData: Product[], site: string|number) => {
  for (const prd of productData.slice(0,10)) {
    if (prd.productPageUrl) {
      const scraped = await scrapeHoldingsForProduct(page, prd.portfolioId, host, prd.productPageUrl);
      appendProductHoldings(scraped, site)
    }
  };
}

const appendProductHoldings = (scraped:ProductHolding[], site: string | number) => {
  const content = JSON.stringify(scraped);
  fs.appendFileSync(DATA_PATH + site + HOLDINGS_FILE_SUFFIX, content + '\n');
}

const scrapeHoldingsForProduct = async (page: Page, productPortfolioId: number, host: string, productPageUrl: string) => {
  let productHoldings: ProductHolding[] = [];

  const url = host + productPageUrl + SITEENTRY_PASS;
  console.debug(`Goto page ${url}`);
  await page.goto(url);
  console.debug('Page loaded');

  const holdings = await page.$('#holdings');
  if (holdings) {
    console.debug('We have #holdings, looking for .icon-xls-export to see if we have download all link');
    const iconXlsExport = await holdings.$('a.icon-xls-export');
    if (iconXlsExport) {
      productHoldings = await getProductHoldingsFromXlsExport(iconXlsExport, productPortfolioId);
      await iconXlsExport.dispose();
    } else {
      console.debug('Looking for #allHoldingsTab');
      const allHoldingsTab = await holdings.$('#allHoldingsTab');
      if (allHoldingsTab) {
        const dataAjaxuri = await (await allHoldingsTab.getProperty('data-ajaxuri')).jsonValue() as string;
        if (dataAjaxuri) {
          console.debug(`We have allHoldingsTab with data-ajaxuri ${dataAjaxuri}`);
          productHoldings = await getProductHoldingsFromAjax(dataAjaxuri, productPortfolioId);
        } else {
          console.debug(`We have allHoldingsTab but data-ajaxuri is empty; we will try to look for the #tenLargestTab`);
          productHoldings = await extractFromTenLargestTab(holdings, productPortfolioId)
        }
        await allHoldingsTab.dispose();
      } else {
        console.debug('No allHoldingsTab, looking for #tenLargestTab');
        productHoldings = await extractFromTenLargestTab(holdings, productPortfolioId)
      }
    }
    await holdings.dispose();
  } else {
    console.debug('No holdings element');
  }

  return productHoldings;
}

const getProductHoldingsFromXlsExport = async (iconXlsExport: ElementHandle, productPortfolioId: number) => {
  const href = await (await iconXlsExport.getProperty('href')).jsonValue() as string;
  console.debug(`iconXlsExport href is ${href}`);
  return getProductHoldingsFromAjax(href, productPortfolioId);
}

const getProductHoldingsFromAjax = async (uri: string, productPortfolioId: number) => {
  const productHoldings: ProductHolding[] = [];
  const response = await fetch(uri);
  if (uri.indexOf('fileType=csv')) {
    const text = await response.text();
    const csv = text.split('\n').slice(3)
    // console.log('fileType=csv', csv)
    let i = 0;
    let line = csv[i].trim();
    while (line) {
      const cols = line.split(',')
      const name = cols[0].replace(/"/g,'')
      const weight = parseFloat(cols[1].replace(/"/g,''));
      const pr: ProductHolding = {productPortfolioId, name, weight}
      productHoldings.push(pr);
      i++;
      line = csv[i].trim();
    }
  } else {
    const json = await response.json();
    console.log('fileType!==csv', JSON.stringify(json))
  }

  return productHoldings;
}

const extractFromTenLargestTab = async (holdings: ElementHandle, productPortfolioId: number) => {
  let productHoldings: ProductHolding[] = [];
  const tenLargestTab = await holdings.$('#tenLargestTab');
  if (tenLargestTab) {
    productHoldings = await extractChildHoldingTables(tenLargestTab, productPortfolioId, 'unknown')
    console.debug(`Holdings extracted from tenLargestTab: ${JSON.stringify(productHoldings)}`)
    await tenLargestTab.dispose();
  } else {
    console.debug('No #tenLargestTab, looking for #tabsTop-holding-eq');
    const holdingEq = await holdings.$('#tabsTop-holding-eq');
    if (holdingEq) {
      productHoldings = await extractChildHoldingTables(holdingEq, productPortfolioId, 'equity')
      console.debug(`productHoldings extracted from tabsTop-holding-eq: ${JSON.stringify(productHoldings)}`)
      console.debug('Will find and click on tabsTop-holding-fi anchor');
      const holdingsTabsLastAnchor = await holdings.$('#holdingsTabs > a:last-child');
      await holdingsTabsLastAnchor?.click();
      const holdingFi = await holdings.$('#tabsTop-holding-fi');
      if (holdingFi) {
        const productHoldingsFi = await extractChildHoldingTables(holdingFi, productPortfolioId, 'fixed')
        console.debug(`productHoldings extracted from tabsTop-holding-fi: ${JSON.stringify(productHoldingsFi)}`)
        productHoldingsFi.forEach(pr => productHoldings.push(pr))
        await holdingFi.dispose();
      }
      await holdingsTabsLastAnchor?.dispose();
      await holdingEq.dispose();
    } else {
      console.debug('No #tabsTop-holding-eq, giving up')
    }
  }
  return productHoldings;
}

const extractChildHoldingTables = async (elementHandle: ElementHandle, productPortfolioId: number, kind: string) => {
  const holdings = await elementHandle.evaluate((h) => {
    const data = [];
    const tables = h.querySelectorAll('table');
    for (const t of tables) {
      for (const b of t.tBodies) {
        for (const row of b.rows) {
            const holding: ProductHolding = {
            productPortfolioId: 0,
            name: row.cells[0].textContent?.trim() ?? '',
            weight: parseFloat(row.cells[1].textContent ?? '0')
          }
          data.push(holding);
        }
      }
    }
    return data;
  });
  return holdings.map(h => {
    return {...h, productPortfolioId: productPortfolioId, kind:kind}
  })
}