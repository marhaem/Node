
[TOC]

#how to set up a node webserver on linux using nvm, npm and jspm

##install nvm
```bash
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.3/install.sh | bash
```
verify installation:
```bash
command -v nvm
```

##install node.js via nvm
```bash
nvm install node
```

##install npm
```bash
npm init
```

##create a git repository
http://172.16.1.73:8080/tfs/mows/_git/Node


##install jspm via npm
```bash
npm install jspm
#check version
jspm -v
#create symlink on local jspm installation
#ln -s node_modules/.bin/jspm jspm
jspm init
#rename config.js to jspm_config.js
```

##useful commands
```bash
nvm use node
nvm run node --version
```

for more infos on nvm, look up [github](https://github.com/creationix/nvm)

#creating a mirrored space on a windows machine for development
- get [nvm](https://github.com/coreybutler/nvm-windows) for windows
- download [npm](https://nodejs.org/en/download/) installer

##install node.js via nvm
```bash
nvm install latest
```

##install npm
```bash
npm init
```

##install jspm via npm
```bash
npm install jspm
#check version
jspm -v
jspm init
```

#install several dependencies
+ hapi
+ bunyan
+ vision
+ handlebars
+ inert

```bash
jspm install npm:hapi
jspm install npm:bunyan
jspm install npm:vision
jspm install npm:handlebars
jspm install npm:inert
```
in webserver create directory src with an index.js file
create another folder inside src called bin with a file called webserver.js this is the entry point for our npm-start-script
to use `npm run start` modify the package.json in webserver add the following line under scripts:
`"start": "node src/bin/webserver.js"`




