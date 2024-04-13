const { Command } = require("commander");

import { downloadProducts } from "./products";

const main = async () => {
  const program = new Command();
  console.log('BLK Product scraper');
  program
    .name('blkprod')
    .version("1.0.0")
    .description("Scrape product information from BLK public sites")
    .command('download')
    .description('Download product master list')
    .option("-s, --site [value]", "Which site to use. Supported: UK-I (UK individual), US-I (US individual) ")
    .action(downloadProducts);
  await program.parseAsync(process.argv);
}

main();