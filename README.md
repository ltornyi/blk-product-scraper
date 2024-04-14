# BLK product scraper

## Build

    npm run build

## Run

### Help

    node dist/index.js help

### Get list of products

Downloads product list. Run

    node dist/index.js help products

for syntax and supported sites.

### Get list of holdings for products

For some products, list is available via API. For others, holdings are part of the page response.

Approach:
- Render the product page and find the holdings component (id='holdings').
- Find a child anchor with class=.icon-xls-export
- - If this component exists, follow the href to download the holdings
- Otherwise, find the child node with id='allHoldingsTab'.
- - If this component exists and if it has a 'data-ajaxuri', then call the API and process the results.
- If there's no allHoldingsTab child node, find the child node with id='tenLargestTab'.
- - If this child exists, then find all the child table nodes of it and parse the body of each table.

Interesting examples:

    download link, file format1:                        node dist/index.js holdings -p 227349 -s US-I
    download link, file format2:                        node dist/index.js holdings -p 229607
    download link, file format3:                        node dist/index.js holdings -p 253743
    download link, file format4:                        node dist/index.js holdings -p 239726 -s US-I
    download link, file format5:                        node dist/index.js holdings -p 251911
    no download link, all tab:                          node dist/index.js holdings -p 230317 -s US-I
    no download link, no all tab, only #tenLargestTab:  node dist/index.js holdings -p 227891 -s US-I
    double tenLargestTab:                               node dist/index.js holdings -p 228282
    no product page url:                                node dist/index.js holdings -p 230120
    no holdings component:                              node dist/index.js holdings -p 283365