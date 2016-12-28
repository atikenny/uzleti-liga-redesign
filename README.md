[![Dependency Status][david-badge]][david-badge-url]
[![devDependency Status][david-dev-badge]][david-dev-badge-url]

# uzleti-liga-redesign
Redesign for Üzleti Liga pages as a new web page

# Screenshots
## Matches
![matches](/docs/screenshots/v1.2.4/screenshot-2.png)

## Match details
![match details](/docs/screenshots/v1.2.4/screenshot-3.png)

## Standings
![standings](/docs/screenshots/v1.2.4/screenshot-4.png)

# How-To
## Run
```
npm i
npm start
```

This will start up a static file server that can be reach on this url: [https://localhost:3000](https://localhost:3000)

## Deploy lambda functions
```
// All lambda functions
npm run deploy:lambda

// A specific lambda function
npm run deploy:lambda -- --src lambdaFunctionName

// Multiple specific lambda functions
npm run deploy:lambda -- --src lambdaFunctionName --src otherLambda
```

## Support
Pull requests are welcome!

[david-badge]: https://david-dm.org/atikenny/uzleti-liga-redesign.svg
[david-badge-url]: https://david-dm.org/atikenny/uzleti-liga-redesign
[david-dev-badge]: https://david-dm.org/atikenny/uzleti-liga-redesign/dev-status.svg
[david-dev-badge-url]: https://david-dm.org/atikenny/uzleti-liga-redesign?type=dev
