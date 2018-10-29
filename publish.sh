rm index.zip 
cd lambda
npm install
zip -X -r ../index.zip *
cd .. 
aws lambda update-function-code --function-name ask-code-activity --zip-file fileb://index.zip
