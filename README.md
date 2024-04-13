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