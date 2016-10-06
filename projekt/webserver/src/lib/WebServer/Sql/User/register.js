export default function register(userData) {
  return new Promise((resolve, reject) => {
    this.sqlTable.findOne({
      where: { email: userData.email }
    })
    .then((user) => {
      if (user) {
        this.global.logger.info('user ' + user.email + 'already existing');
        reject(new Error('register user failed, already existing'));
      }
      else {
        let salt = this.crypto.generateSalt();
        this.crypto.getHash(userData.passwordHash, salt, (error, hash) => {
          if(error) {
            this.global.logger.info('generating hash failed');
            reject(new Error('register user failed, generating hash failed'));
          }
          else {
            this.userData = {
              "email": userData.email,
              "firstName": userData.firstName ? userData.firstName : '',
              "lastName": userData.lastName ? userData.lastName : '',
              "passwordHash": hash,
              "passwordSalt": salt
            };
            //@TODO: Catch validation error isEmail: function(){throw new Error('is not a valid email address')}

            this.sqlTable.create(this.userData)
            .then((user) => {
              user = user.get({
                plain: true
              });
              resolve('successfully registered user: ' + user.email);
            }, (err) => {
              reject(err);
            });
          }
        });
      }
    });
  });
}
