# NodeChat - Rest Service

## Introduction
This is ...

## Installation
git clone blubb
cd <nodeChatRestDir>
npm install

This will also install PM2 (http://pm2.keymetrics.io/)

### TODO here
- also install the WebApp along
- keep WebApp up to date
- use pm2 to deploy
- use pm2 to provide 0s updates

## Usage
cd <nodeChatRestDir>
npm start

This will set PM2's Home dir (PM2_HOME), but this has to be fixed somewhere else in the future!!!
After that it will use PM2 to start the server (pm2 start bin/nodeChatRest -i 0) in cluster mode with as amyn processes as the server has CPU cores.

The logs folder will automatically be created on startup.

### TODO here
- fix logging in cluster mode (all workers use same file = problem?!?)

## Testing
TBD!!!

Automatic tests using a lib and npm test

## Useful debugging commands
- bunyan Dtrace support
- PM2 Dtrace support
- various curl commands (@TODO: provide them here)
- curl -X POST -H "Content-Type: application/json" -d '{ "from": "1", "message": "Hapi is amazingly useful for building APIs.", "timestamp": 1442298859 }' -i http://127.0.0.1:3000/chat/v1/post
