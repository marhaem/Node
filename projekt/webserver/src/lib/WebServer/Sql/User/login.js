import moment from 'moment';

export default function login(userData) {
  return new Promise((resolve, reject) => {
    this.sqlTable.findOne({
      where: { email: userData.email }
    })
    .then((user) => {
      if(!user) {
        this.global.logger.error('someone tried to login using ' + userData.email + ' which is an unexisting user');
        reject(new Error('authentication failed, user doesn\'t exist'));
      }
      else if(user.failedLoginAttempts >= 3) {// user is locked
        reject('User is locked');
      }
      else {
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
              resolve('user ' + user.email + ' logged in successfully');
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
              reject('authentication failed, wrong password'); // If here an error is returned, login.js cant evaluate, object response will be undefined
            });
          }
        });
      }
    }, reject);
  });
}
