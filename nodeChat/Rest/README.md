# NodeChat - Rest Service

## Introduction
This is ...

## Requirements
- GitHub Credentials
- A server running Linux (preferred), Unix, Max or Windows (doh!)

## Installation

### PostgreSQL
1. Install [PostgreSQL][postgresql]
2. Harden [PostgreSQL][postgresql]
4. Create Database
5. Create Database User

### NodeJS
1. Install [NodeJS][nodejs] >= 4.2.1
   This will automatically include [npm][npm].

### NodeChat
1. Create directory for NodeChat
2. Change into that directory
3. `git clone http://192.168.1.73:8080/tfs/mows/_git/Node`
4. `cd Node/nodeChat/Rest`
5. `npm install`
   This will install [JSPM][jspm] and [PM2][pm2] globally before running the 'npm install' command.
   After 'npm install' finishes ist does a `jspm install` for you.
   Note: you may be prompted for your github credentials.
6. `cp config/example.json config/config.json`
7. Edit `config/config.json`
   Set Database Name, User, Password and Port (and mybe the connection type as you could use Unix Domain Sockets)
8. `cd ../WebApp`
9. `npm install`

- **Set a PM2_HOME environment variable and create that folder**

### TODO here
- use [PM2][pm2] to deploy
- use [PM2][pm2] to provide 0s updates

## Usage
```bash
cd <nodeChatRestDir>
npm start
```

It will use [PM2][pm2] to start the server (pm2 start bin/nodeChatRest -i 0) in cluster mode with as many processes as the server has CPU cores.

The logs folder will automatically be created on startup.

### TODO here
- fix logging in cluster mode (all workers use same file = problem?!?)

## Testing
TBD!!!

Use workers to simulate load then test cluster balancing on one machine and after that load balancing over multiple servers.

Automatic tests using a lib and npm test

## Useful debugging commands
- [Bunyan][bunyan] Dtrace support
- [PM2][pm2] Dtrace support
- various curl commands (@TODO: provide them here)
- curl -X POST -H "Content-Type: application/json" -d '{ "from": "1", "message": "Hapi is amazingly useful for building APIs.", "timestamp": 1442298859 }' -i http://127.0.0.1:3000/chat/v1/post


[postgresql]: http://www.postgresql.org/
[nodejs]: http://nodejs.org/
[npm]: https://www.npmjs.com/
[jspm]: http://jspm.io/
[bunyan]: https://github.com/trentm/node-bunyan
[pm2]: http://pm2.keymetrics.io/