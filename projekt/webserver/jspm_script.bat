@echo off
jspm install hoek && jspm install npm:hapi && jspm install npm:hapi-bunyan && jspm install crypto && jspm install npm:sequelize && jspm install npm:mysql && jspm install npm:tedious
pause
::npm uninstall hapi && npm uninstall --save-dev hapi && npm uninstall --save-dev hapi-auth-jwt2 && npm uninstall --save-dev jsonwebtoken
