const fs = require('node:fs');

import { BLK_PRODUCT_SITES, DATA_PATH, PRODUCT_FILE_SUFFIX, getSiteOption } from './utils'

export type Product = {
  assetClass: string,
  subAssetClass: string,
  marketType: string,
  region: string,
  name: string,
  isin: string,
  portfolioId: number,
  productPageUrl: string
}

export const downloadProducts = async (options: any) => {
  const site = getSiteOption(options);
  console.log('Downloading products from', site);
  const url = BLK_PRODUCT_SITES[site].host + BLK_PRODUCT_SITES[site].screener;
  const response = await fetch(url);
  const products = await response.json();

  const myProducts = parseProducts(products, site);
  saveProducts(myProducts, site + PRODUCT_FILE_SUFFIX)

  console.log('Done');
}

const parseProducts = (products: any, site: keyof typeof BLK_PRODUCT_SITES): Product[] => {
  let myProducts: Array<Product> = [];

  switch (site) {
    case 'UK-I':
      myProducts = parseUKProducts(products);
      break;
    case 'US-I':
      myProducts = parseUSProducts(products);;
      break;
    default:
      break;
  }

  return myProducts;
}

const parseUKProducts = (products: any): Product[] => {
  const myProducts: Array<Product> = [];

  for (const key in products) {
    const p = products[key];
    const myProduct: Product = {
      assetClass: p.aladdinAssetClass,
      subAssetClass: p.aladdinSubAssetClass,
      marketType: p.aladdinMarketType,
      region: p.aladdinRegion,
      name: p.fundName,
      isin: p.isin,
      portfolioId: p.portfolioId,
      productPageUrl: p.productPageUrl
    }
    myProducts.push(myProduct)
  }

  return myProducts;
}

const parseUSProducts = (products: any): Product[] => {
  const myProducts: Array<Product> = [];

  //hardcoded values; nobody should be punished by parsing data.tabledata.columns
  products.data.tableData.data.forEach((p: any) => {
    const myProduct: Product = {
      assetClass: p[0],
      subAssetClass: p[12],
      marketType: p[6],
      region: p[8],
      name: p[15],
      isin: '',
      portfolioId: p[29],
      productPageUrl: p[37]
    }
    myProducts.push(myProduct)
  })

  return myProducts;
}

const saveProducts = (products: Product[], filename: string) => {
  const content = JSON.stringify(products);
  fs.writeFileSync(DATA_PATH + filename, content);
}