import moment from 'moment';

//@TODO: design login so that it will return the credentials which can then be used by Hawk to authenticate
//@TODO: implement a consistent error interface like reject({ error: boolean data: string}). also implement error-codes
//@TODO: on each siteload check for valid JWT
export default function login(userData) {
  return new Promise((resolve, reject) => {
    console.log('searching for user: ' + userData.email);
    this.sqlTable.findOne({
      where: { email: userData.email }
    })
    .then((user) => {
      if(!user) {
        this.global.logger.error('someone tried to login as ' + userData.email + ' which is an inexistent user');
        reject(new Error('login failed!'));
      }
      else if(user.failedLoginAttempts >= 3) {// user is locked
        reject(new Error('User is locked'));
      }
      else { //User exists and is not locked
        this.crypto.validate(userData.password, user.passwordSalt, user.passwordHash, (error, isEqual) => {
          if(error) {
            this.global.logger.error(error);
            reject(new Error('authentication failed, hashing error'));
          }
          else if(isEqual) {
            this.sqlTable.update({
              "lastLogin":  moment().toISOString(),
              "failedLoginAttempts": 0
            }, {
              where: {userID: user.userID}
            }).then(() => {
              resolve(user);
            });
          }
          else { // login failed, wrong password
            this.sqlTable.update({
              "lastFailedLogin":  moment().toISOString(),
              "failedLoginAttempts": ++user.failedLoginAttempts
            }, {
              where: {userID: user.userID}
            }).then(() => {
              let message = 'somenone entered a wrong password for user: ';
              this.global.logger.info(message + user.email);
              reject(new Error('authentication failed, wrong login')); // If here an error is returned, login.js cant evaluate, object response will be undefined
            });
          }
        });
      }
    }, reject);
  });
}
