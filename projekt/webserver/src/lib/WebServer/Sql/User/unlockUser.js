/*global console*/

export default function unlockUser(user) {
  return new Promise((resolve, reject) => {
    this.sqlTable.findOne({
      where: { email: user }
    })
    .then((user) => {
      if(!user) {
        reject(new Error('unlocking user failed'));
      }
      else {
        this.sqlTable.update({
          "failedLoginAttempts": 0
        }, {
          where: {email: user.email}
        }).then((a) => {
          console.log(a);
          resolve(user);
        });
      }
    });
  });
}
