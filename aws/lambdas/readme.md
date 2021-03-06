# How to

## Install & Config
* Install AWS CLI from here [AWS CLI](https://aws.amazon.com/cli/)
* Create a user in AWS Console in group developer (if does not exist already)
* Run aws configure on your machine, see description here: [aws configure](http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html)

## Create new lambda
* Create zip file with the node modules (if any) and the index.js and name it build.zip (the name that is ignored in .gitignore)
* Run "aws lambda create-function --function-name <function-name> --runtime=nodejs4.3 --role <role:ARN> --zip-file fileb://build.zip --handler index.handler"

## Update existing lambda
* Create zip file with the updated node modules and the index.js and name it build.zip (the name that is ignored in .gitignore)
* Run "aws lambda update-function-code --function-name <function-name> --zip-file fileb://build.zip"

```
// All lambda functions
npm run deploy:lambda

// A specific lambda function
npm run deploy:lambda -- --src <lambdaFunctionFolder>

// Multiple specific lambda functions
npm run deploy:lambda -- --src <lambdaFunctionFolder> --src <otherLambdaFolder>
```

## Debug scripts in chrome devtool
Let's say we have a lambda function called: **getAllTheMoney**

This will reside in the folder: `aws/lambdas/getAllTheMoney`

It has an **index.js** file containing the logic.

```
npm run debug aws/lambdas/getAllTheMoney/index.js
```

This will start the node-nightly debug tool and opens a chrome with the devtool url.

## Future improvements
- [x] Add gulp task for zip and deploy
