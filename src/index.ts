const { Command } = require("commander");

import { downloadHoldings } from "./holdings";
import { downloadProducts } from "./products";

const main = async () => {
  const program = new Command();
  console.log('BLK Product scraper');
  program
    .name('blkprod')
    .version("1.0.0")
    .description("Scrape product information from BLK public sites");
  program
    .command('products')
    .description('Download product master list')
    .option("-s, --site [value]", "Which site to use. Supported: UK-I (UK individual), US-I (US individual) ")
    .action(downloadProducts);
  program
    .command('holdings')
    .description('Download holdings for products already downloaded')
    .option("-s, --site [value]", "Which site to use. Supported: UK-I (UK individual), US-I (US individual) ")
    .option("-p, --products [value]", "Which products to look at. Can be: all | top10 | <portfolioid> ")
    .action(downloadHoldings);
  await program.parseAsync(process.argv);
}

main();