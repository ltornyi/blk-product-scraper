import { getSiteOption } from "./utils";

export const downloadHoldings = async (options: any) => {
  const site = getSiteOption(options);
  console.log('Downloading holdings from', site);
  
  console.log('Done');
}