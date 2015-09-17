# Single Sign On
Central Single Sign On service which stores only the central information about an account or user.

## Installation
1. Download and install [Node.js]
2. Install [Gulp] with [npm]: `npm install -g gulp`
3. Create a directory for SingleSignOn
4. npm install --save git+https://bitbucket.org/andreas-wagner/singlesignon.git
5. Enter credentials
5. Change into the node_modules/SingleSignOn/_build folder_
6. Type `gulp`

## Configuration
The configuration is one simple file `config/config.js`.
If using Unix Domain Sockets you **should** change the location of the socket file.

## Create socket folder
If using Unix Domain Sockets, the server will create a socket file for communication.
To make sure that other services can connect to that socket file you have to:

1. Create a directory **only** for the socket file
2. Assign it to the node user (user running the SingleSignOn service)
3. Assign it to whatever group the other services are in.
4. Set the group-id bit (SGID) on that directory.

Example (linux):
```
sudo groupadd nodegroup

sudo usermod -a -G nodegroup user

sudo mkdir -p /var/run/sso
sudo chown user:nodegroup /var/run/sso
sudo chmod g+rxs /var/run/sso
```
Example (mac):
```
sudo dscl . create /groups/node
sudo dscl . -append /groups/node gid 4200
sudo dscl . -append /groups/node passwd "*"

sudo dscl . -append /groups/node GroupMembership ssouser
sudo dscl . -append /groups/node GroupMembership client1user
sudo dscl . -append /groups/node GroupMembership client2user

mkdir -p /var/run/sso
sudo chown :node /var/run/sso
chmod g+rxs /var/run/sso
```

All files created inside this directory will now automatically be owned by the group the client application is in.

## Running
On Unix based systems:

- Change into the base SingleSignOn folder.
- Type `./bin/start`

On Windows systems:

- Change into the base SingleSignOn folder.
- Type `node bin/start`

## Usage
To be able to use the SingleSignOn service you first have to request **client/token** and sign the request with a **certificate**.
After that, you may use any route as you wish, as long as the token is still valid (not expired).

> **Note**
> ALL requests and responses use [Hawk]-Authentication and [JSON]!

## Routes
The following routes may be used to communicate with the service.

---

### /client/token
Generates a token for the client application/service that wants to use the SingleSignOnService.
Contains an expiration timestamp.

- ##### Request
    - **packageName**
        - Name of the client package requesting the token as a string.

    Example:
    ```
    { "packageName": "my.package.company.com" }
    ```

- ##### Response
    - **error**
        - `null` or `undefined`
            - All went well.
        - `EUNAUTHORIZED`
            - the request was not signed correctly.
            - the request was not signed with the correct certificate.
            - the certificate for signing/decrypting has expired.
        - `EMISSINGPARAM`
            - A parameter is missing.
    - **token**
        - The token (as a string) for the client to authenticate all other requests to the service.
          Internally there will be an expiration timestamp, which is renewed on every request.
          If the token is expired any request will result in an `EUNAUTHORIZED` error.

---

### /create
Creates a new account/user.
This will check all unique constraints (like if the email address or username already taken).
If successful a new _temporary_ password will be generated and sent to the user via mail.

- ##### Request
    - **token**
    - **email**
        - Has to be unique.
    - **username** (optional)
        - Has to be unique as well.
    - **passwordToSet** (optional)
        - New password to set.
    - **surname** (optional)
    - **lastname** (optional)
    - **title** (Optional)
    - **addressList**
        - Array of addresses. Each address has these values:
            - street
            - number
            - zip
            - city
            - surname (optional)
            - lastname (optional)
    - **phoneNumbers**
        - Array of phone numbers. Each phone number looks like this:
            - number
            - name (optional)
              To better identify the number for the user. Examples would be 'Work', 'Home' or 'Mobile'.

- ##### Response
    - **error**
        - `null` or `undefined`
            - All went well.
        - `EMISSINGPARAM`
            - A parameter is missing.
        - `EUNAUTHORIZED`
            - No token provided, invalid or expired token.
        - `ENOTDONE`
            - There was an error and nothing was done.
        - `EALREADYEXISTS`
            - Email address or username already exists. The account/user was not created.
        - `EPROVIDEPWD`
            - Client has to provide the password
            - It can be that the mailing service not available for whatever reason, so the only way to create a user and make sure that he knows his password is that he provides it at creation-time.
            - The account/user was not created.
        - `WMAILNOTSENTAUTORETRY`
            - Mail could not be sent for whatever reason and the SingleSignOn service will retry sending it (there will be a flag on the user).
    - **userId**
        - This will only be set if the process was successful.
          This id is needed for any other account/user related requests except **/create**, **/auth** and **/pwd**.

---

### /verify/mail
Verifies the email address using a code (long token).
The code is unique and corresponds to a single account/user only.

- ##### Request
    - **token**
    - **code**
        - Verification code.

- ##### Response
    - **error**
        - `null` or `undefined`
            - All went well.
        - `EMISSINGPARAM`
            - A parameter is missing.
        - `EUNAUTHORIZED`
            - No token provided, invalid or expired token.
        - `EINVALID`
            - Invalid code.
        - `ENOTDONE`
            - Some error occurred and nothing was done.

---

### /verify/phone
Not yet implemented.

---

### /auth
Authenticates a user by validating the provided username and password combination.
Accounts with expired passwords have to use **/recover**.
Accounts with a temporary password have to include a new password.
Locked / suspended accounts will not be authorized.

- ##### Request
    - **token**
    - **user**
        - This is either the email address or the username.
    - **password**
        - Password
    - **passwordToSet** (optional)
        - New password to set

- ##### Response
    - **error**
        - `null` or `undefined`
            - All went well.
        - `EMISSINGPARAM`
            - A parameter is missing.
        - `EUNAUTHORIZED`
            - No token provided, invalid or expired token.
        - `EINVALID`
            - User not found or password not correct.
        - `WLOCKED`
            - Account/user is locked (too many wrong logins?) use **/recover**.
        - `WSUSPENDED`
            - Account/user is suspended by an admin.
        - `ETEMPORARYPWD`
            - Password was temporary, use **/pwd**.
        - `EEXPIREDPWD`
            - Password is expired use **/recover**.
    - **userId**
        - This will only be set if the process was successful (error is not set).
          This id is needed for any other account/user related requests except **/create**, **/auth** and **/pwd**.

---

### /pwd
Used to change the password of an account/user.

- ##### Request
    - **token**
        - Client token obtained from **/client/token**.
    - **email**
        - Email address.
    - **username**
        - Username.
    - **password**
        - Current password.
    - **passwordToSet**
        - New password to set.

- ##### Response
    - **error**
        - `null` or `undefined`
            - All went well.
        - `EMISSINGPARAM`
            - A parameter is missing.
        - `EUNAUTHORIZED`
            - No token provided, invalid or expired token.
        - `EINVALID`
            - User not found or password not correct.
        - `ELOCKED`
            - Account/user is locked (too many wrong logins?) use **/recover**.
        - `ESUSPENDED`
            - Account/user is suspended by an admin.
        - `ETEMPORARYPWD`
            - Password was temporary, user needs to provide his own.
        - `EEXPIREDPWD`
            - Password is expired use **/recover**.
        - `ENOTDONE`
            - There was an error and nothing was done.

---

### /questions
Returns the secure questions for an account/user.

- ##### Request
    - **token**
    - **userId**

- ##### Response
    - **error**
        - `null` or `undefined`
            - All went well.
        - `EMISSINGPARAM`
            - A parameter is missing.
        - `EUNAUTHORIZED`
            - No token provided, invalid or expired token.
        - `EINVALID`
            - User id not found.
        - `ENOTDONE`
            - There was an error and nothing was done.
    - **questions**
        - Array of questions

    Example:
    ```
    { "error": undefined, "questions": ["Who slept in my bed?", "", "What is sqrt(money)?"]}
    ```

---

### /recover
Recovers lost passwords via answers to the secure questions and sends out a mail containing a _new_ *temporary* password.
Fallback for mail failure is to include the **passwordToSet**.
The account/user will be unlocked.

- ##### Request
    - **token**
    - **userId**
    - **answers**
        - Array of answers, in the same order as **/questions** provided
    - **passwordToSet** (optional)
        - New password to set

    Example:
    ```
    { "token": "some-token", "userId": 9723442, "answers": ["my feline warrior", "", "the-ev1l"]}
    ```

- ##### Response
    - **error**
        - `null` or `undefined`
            - All went well.
        - `EMISSINGPARAM`
            - A parameter is missing.
        - `EUNAUTHORIZED`
            - No token provided, invalid or expired token.
        - `EINVALID`
            - User id not found.
            - Invalid or missing answers.
        - `ENOTDONE`
            - There was an error and nothing was done.
        - `EPROVIDEPWD`
            - Client has to provide the password
            - It can be that the mailing service not available for whatever reason, so the only way to create a user and make sure that he knows his password is that he provides it at creation-time.
            - The account/user was not created.
        - `WMAILNOTSENTAUTORETRY`
            - Mail could not be sent for whatever reason and the SingleSignOn service will retry sending it (there will be a flag on the user).

---

### /modify
Does **not** modify the password, the locked or suspended state, the password type or the password timestamp!

- ##### Request
    - **token**
    - **userId**
    - **data**
        - See **/create**.

- ##### Response
    - **error**
        - `null` or `undefined`
            - All went well.
        - `EMISSINGPARAM`
            - A parameter is missing.
        - `EUNAUTHORIZED`
            - No token provided, invalid or expired token.
        - `EINVALID`
            - User id not found.
        - `ENOTDONE`
            - There was an error and nothing was done.
        - `EALREADYEXISTS`
            - Email address or username already exists.

---

### /approve
Locks/unlocks the account/user or suspends/unsuspends it.

- ##### Request
    - **token**
    - **userId**
    - **locked** (optional)
        - Boolean.
    - **suspended** (optional)
        - Boolean.

- ##### Response
    - **error**
        - `null` or `undefined`
            - All went well.
        - `EMISSINGPARAM`
            - A parameter is missing.
        - `EUNAUTHORIZED`
            - No token provided, invalid or expired token.
        - `EINVALID`
            - User id not found.
        - `ENOTDONE`
            - There was an error and nothing was done.

---

### /mail
Sends mails...

- ##### Request
    - **token**
    - **userId**
    - **type**
        - Type of mail to send can be 'Welcome', 'Password', 'VerifyMail' or 'VerifyPhone'.
    - **which**
        - Used for all verification mails, should be the email address or phone number.

- ##### Response
    - **error**
        - `null` or `undefined`
            - All went well.
        - `EMISSINGPARAM`
            - A parameter is missing.
        - `EUNAUTHORIZED`
            - No token provided, invalid or expired token.
        - `EINVALID`
            - User id not found, invalid mail type or address/phone number not found.
        - `ENOTDONE`
            - There was an error and nothing was done.
        - `WMAILNOTSENTAUTORETRY`
            - Mail could not be sent for whatever reason and the SingleSignOn service will retry sending it (there will be no flag on the user, but a mail queue).

[Node.js]: https://nodejs.org/
[npm]: https://www.npmjs.com/
[Gulp]: http://gulpjs.com/
[Hawk]: https://github.com/hueniverse/hawk/
[JSON]: http://json.org/