@echo off
jspm update npm:babel && jspm update npm:babel-runtime && jspm update npm:boom && jspm update npm:core-js && jspm update crypto && jspm update fs && jspm update handlebars && jspm update npm:hapi && jspm update npm:hapi-auth-jwt2 && jspm update npm:hapi-bunyan && jspm update npm:hawk && jspm update hoek && jspm update npm:inert && jspm update json && jspm update npm:jsonwebtoken && jspm update npm:moment && jspm update npm:mysql && jspm install npm:oz && jspm install path && jspm install npm:pg && jspm install npm:pg-hstore && jspm install npm:systemjs && jspm install npm:tedious && jspm install npm:vision
pause
::npm uninstall hapi && npm uninstall --save-dev hapi && npm uninstall --save-dev hapi-auth-jwt2 && npm uninstall --save-dev jsonwebtoken
