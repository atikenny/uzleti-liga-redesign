# How to

## Install & Config
* Install AWS CLI from here [AWS CLI](https://aws.amazon.com/cli/)
* Create a user in AWS Console in group developer (if does not exist already)
* Run aws configure on your machine, see description here: [aws configure](http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html)

## Update existing lambda
* Create zip file with the updated node modules and the index.js
* Run "aws lambda update-function-code --function-name <function-name> --zip-file fileb://<relative-path>.zip"

## Future improvements
* Add gulp task for zip and deploy
