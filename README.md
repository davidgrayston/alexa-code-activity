# Alexa Code Activity
Alexa Demo using GitHub API

🗣 _"Alexa, ask Code Activity for commits from {user}"_

## Setup
1. Install [ASK CLI](https://developer.amazon.com/docs/smapi/quick-start-alexa-skills-kit-command-line-interface.html)
2. Install [AWS CLI](https://developer.amazon.com/blogs/post/Tx1UE9W1NQ0GYII/Publishing-Your-Skill-Code-to-Lambda-via-the-Command-Line-Interface)

## Deployment 🚀
To deploy both Skill and the Lambda function:
```
ask deploy
```

To deploy only the skill:
```
ask deploy --target=skill
```

The following script will zip and deploy the Lambda function alone, using the `AWS CLI`.
```
./publish.sh
```
>Note: you will need to ensure this is deployed to the same region as the initial `ask deploy` deployment.

## Lambda Function λ
Endpoint for the Alexa skill that queries the GitHub API.
