const admin = require('firebase-admin');
const User = require('../models/user');

async function sendNotificationToUser(userId, type, title, body, id) {
  try {
    const user = await User.findById(userId).select('deviceToken');
    const deviceToken = user?.deviceToken;


    if (!deviceToken) {
      console.log(`Không tìm thấy deviceToken cho user ${userId}`);
      return;
    }
    console.log('id', id)
    const message = {
      data: {
        type: type,
        title,
        body,
        id: id,
      },
      notification: {
        title: title,
        body: body,
      },
      token: deviceToken,
    };

    await admin.messaging().send(message);
    console.log('Thông báo đã được gửi đến user:', userId);
  } catch (error) {
    console.error('Lỗi khi gửi thông báo:', error);
  }
}

module.exports = { sendNotificationToUser };