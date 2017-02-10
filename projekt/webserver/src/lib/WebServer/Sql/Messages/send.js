export default function saveMessage(messageData) {
  return new Promise((resolve, reject) => {
    this.sqlTable.create(messageData).then((data) => {
      data = data.get({
        plain: true
      });
      resolve('successfully stored message: ' + data.msg + ' for user ' + data.userID);
    }, (error) => {
      reject(new Error('error storing message from user: ' +
              messageData.sentFromUserID +
              ' in chatID: ' +
              messageData.chatID +
              ' error.message: ' +
              error.message));
    });
  });
}
