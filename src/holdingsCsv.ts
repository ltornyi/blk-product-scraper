import { parse } from 'csv-parse';
import { ProductHolding } from "./holdings";

enum CsvType {
  NAME0_W1,
  NAME0_W3,
  NAME1_AC3_W5,
  NAME1_AC4_W6,
}

const HEADER_NAME = 'Name'
const HEADER_AC = 'Asset Class'
const HEADER_WEIGHT = 'Weight (%)'

export const processBlkCsv = (productPortfolioId: number, text: string) => {
  let arr: ProductHolding[] = [];
  let csv = text.split('\n').map(line => line.trim());
  //find first empty line and consider body starting after it
  let indexOfEmpty = csv.findIndex(line => !line);
  if (indexOfEmpty) {
    csv = csv.slice(indexOfEmpty + 1)
  }
  //find again the empty line and include lines only before it
  indexOfEmpty = csv.findIndex(line => !line)
  if (indexOfEmpty) {
    csv = csv.slice(0, indexOfEmpty)
  }
  const csvBody = csv.join('\n')
  parse(csvBody, (err, records) => {
    if (err) {
      console.error('CSV Err', err);
      throw Error(`CSV Err ${productPortfolioId}`)
    } else {
      const header = records[0];
      const body = records.slice(1);
      const csvType = getCsvTypeFromHeader(header);
      body.forEach((rec: string[]) => {
        const pr = getHoldingFromRecord(rec, csvType, productPortfolioId);
        arr.push(pr);
      })
    }
  });
  return arr;
}

const getHoldingFromRecord = (fields:string[], csvType: CsvType, productPortfolioId: number) => {
  let name: string = '', weight: number = 0, kind: string = 'unknown';
  switch (csvType) {
    case CsvType.NAME0_W1:
      name = fields[0];
      weight = parseFloat(fields[1])
      break;
    case CsvType.NAME0_W3:
      name = fields[0];
      weight = parseFloat(fields[3])
      break;
    case CsvType.NAME1_AC3_W5:
      name = fields[1];
      kind = fields[3];
      weight = parseFloat(fields[5])
      break;
    case CsvType.NAME1_AC4_W6:
      name = fields[1];
      kind = fields[4];
      weight = parseFloat(fields[6])
      break;
    default:
      break;
  }
  const pr: ProductHolding = {productPortfolioId, name, weight, kind };
  return pr;
}

const getCsvTypeFromHeader = (header: string[]) => {
  const indexName = header.findIndex(label => label == HEADER_NAME);
  const indexAC = header.findIndex(label => label == HEADER_AC);
  const indexWeight = header.findIndex(label => label == HEADER_WEIGHT);
  if (indexName == 1 && indexAC == 3 && indexWeight == 5) {
    return CsvType.NAME1_AC3_W5
  } else if (indexName == 1 && indexAC == 4 && indexWeight == 6) {
    return CsvType.NAME1_AC4_W6
  } else if (indexName == 0 && indexAC == -1 && indexWeight == 1) {
    return CsvType.NAME0_W1
  } else if (indexName == 0 && indexAC == -1 && indexWeight == 3) {
    return CsvType.NAME0_W3
  } else {
    throw Error(`Unknown CSV format ${header}`)
  }
}
