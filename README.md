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
- Find its child node with id='allHoldingsTab'.
- - If this component exists and if it has a 'data-ajaxuri', then call the API and process the results.
- If there's no allHoldingsTab child node, find the child node with id='tenLargestTab'.
- - If this child exists, then find all the child table nodes of it and parse the body of each table.

Interesting examples:

    download link:                                      node dist/index.js holdings -p 227349 -s US-I
    no download link, all tab:                          node dist/index.js holdings -p 230317 -s US-I
    no download link, no all tab, only #tenLargestTab:  node dist/index.js holdings -p 227891 -s US-I
    download link:                                      node dist/index.js holdings -p 239726 -s US-I
    double tenLargestTab:                               node dist/index.js holdings -p 228282
    no product page url:                                node dist/index.js holdings -p 230120