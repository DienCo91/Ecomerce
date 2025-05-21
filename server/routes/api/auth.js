const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const passport = require('passport');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

const auth = require('../../middleware/auth');

// Bring in Models & Helpers
const User = require('../../models/user');
const mailchimp = require('../../services/mailchimp');
const mailgun = require('../../services/mailgun');
const keys = require('../../config/keys');
const { EMAIL_PROVIDER, JWT_COOKIE } = require('../../constants');

const { secret, tokenLife } = keys.jwt;

router.post('/login', async (req, res) => {
  try {
    const { email, password,deviceToken } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ error: 'You must enter an email address.' });
    }

    if (!password) {
      return res.status(400).json({ error: 'You must enter a password.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .send({ error: 'No user found for this email address.' });
    }

    if (user && user.provider !== EMAIL_PROVIDER.Email) {
      return res.status(400).send({
        error: `That email address is already in use using ${user.provider} provider.`
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'Password Incorrect'
      });
    }

    const payload = {
      id: user.id
    };

    const token = jwt.sign(payload, secret, { expiresIn: tokenLife });

    if (!token) {
      throw new Error();
    }
    console.log('deviceToken', deviceToken);
    if(deviceToken){

      user.deviceToken = deviceToken;
      await user.save();
    }

    res.status(200).json({
      success: true,
      token: `Bearer ${token}`,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phoneNumber:user.phoneNumber
      }
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, firstName, lastName, password, isSubscribed,deviceToken } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ error: 'You must enter an email address.' });
    }

    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'You must enter your full name.' });
    }

    if (!password) {
      return res.status(400).json({ error: 'You must enter a password.' });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: 'That email address is already in use.' });
    }

    let subscribed = false;
    if (isSubscribed) {
      const result = await mailchimp.subscribeToNewsletter(email);

      if (result.status === 'subscribed') {
        subscribed = true;
      }
    }

    const user = new User({
      email,
      password,
      firstName,
      lastName,
      deviceToken:deviceToken||"",
      
    });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);

    user.password = hash;
    const registeredUser = await user.save();

    const payload = {
      id: registeredUser.id
    };

    await mailgun.sendEmail(
      registeredUser.email,
      'signup',
      null,
      registeredUser
    );

    const token = jwt.sign(payload, secret, { expiresIn: tokenLife });

    res.status(200).json({
      success: true,
      subscribed,
      token: `Bearer ${token}`,
      user: {
        id: registeredUser.id,
        firstName: registeredUser.firstName,
        lastName: registeredUser.lastName,
        email: registeredUser.email,
        role: registeredUser.role
      }
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.post('/forgot', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ error: 'You must enter an email address.' });
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res
        .status(400)
        .send({ error: 'No user found for this email address.' });
    }

    const buffer = crypto.randomBytes(48);
    const resetToken = buffer.toString('hex');

    existingUser.resetPasswordToken = resetToken;
    existingUser.resetPasswordExpires = Date.now() + 3600000;

    existingUser.save();

    await mailgun.sendEmail(
      existingUser.email,
      'reset',
      req.headers.host,
      resetToken
    );

    res.status(200).json({
      success: true,
      message: 'Please check your email for the link to reset your password.'
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.post('/reset/:token', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'You must enter a password.' });
    }

    const resetUser = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!resetUser) {
      return res.status(400).json({
        error:
          'Your token has expired. Please attempt to reset your password again.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    resetUser.password = hash;
    resetUser.resetPasswordToken = undefined;
    resetUser.resetPasswordExpires = undefined;

    resetUser.save();

    await mailgun.sendEmail(resetUser.email, 'reset-confirmation');

    res.status(200).json({
      success: true,
      message:
        'Password changed successfully. Please login with your new password.'
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.post('/reset', auth, async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const email = req.user.email;

    if (!email) {
      return res.status(401).send('Unauthenticated');
    }

    if (!password) {
      return res.status(400).json({ error: 'You must enter a password.' });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(400)
        .json({ error: 'That email address is already in use.' });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ error: 'Please enter your correct old password.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(confirmPassword, salt);
    existingUser.password = hash;
    existingUser.save();

    await mailgun.sendEmail(existingUser.email, 'reset-confirmation');

    res.status(200).json({
      success: true,
      message:
        'Password changed successfully. Please login with your new password.'
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.get(
  '/google',
  passport.authenticate('google', {
    session: false,
    scope: ['profile', 'email'],
    accessType: 'offline',
    approvalPrompt: 'force'
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${keys.app.clientURL}/login`,
    session: false
  }),
  (req, res) => {
    const payload = {
      id: req.user.id
    };

    // TODO find another way to send the token to frontend
    const token = jwt.sign(payload, secret, { expiresIn: tokenLife });
    const jwtToken = `Bearer ${token}`;
    res.redirect(`${keys.app.clientURL}/auth/success?token=${jwtToken}`);
  }
);

router.get(
  '/facebook',
  passport.authenticate('facebook', {
    session: false,
    scope: ['public_profile', 'email']
  })
);

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: `${keys.app.clientURL}/login`,
    session: false
  }),
  (req, res) => {
    const payload = {
      id: req.user.id
    };
    const token = jwt.sign(payload, secret, { expiresIn: tokenLife });
    const jwtToken = `Bearer ${token}`;
    res.redirect(`${keys.app.clientURL}/auth/success?token=${jwtToken}`);
  }
);

router.post('/google', async (req, res) => {
  try {
    const { idToken,deviceToken } = req.body;
    console.log('deviceToken', deviceToken);
    
    if (!idToken) {
      return res.status(400).json({ error: 'Thiếu idToken' });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name,  uid } = decodedToken;

    if (!email || !name) {
      return res.status(400).json({ error: 'Không thể lấy thông tin từ token' });
    }

    let user = await User.findOne({ email });

    if(deviceToken){

      user.deviceToken = deviceToken;
      await user.save();
    }
    if (!user) {
      const [firstName, ...lastNameArr] = name.split(' ');
      const lastName = lastNameArr.join(' ');

      user = new User({
        email,
        firstName,
        lastName,
        password: '', 
        googleId: uid,
        deviceToken:deviceToken,
        
      });

      await user.save();
    }

    const payload = { id: user.id };
    const token = jwt.sign(payload, secret, { expiresIn: tokenLife });

    res.status(200).json({
      success: true,
      token: `Bearer ${token}`,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phoneNumber:user?.phoneNumber||"",
      },
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Xác thực Google thất bại.' });
  }
});

router.post('/logout', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { deviceToken: '' } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Logout successfully, device token cleared',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || 'An error occurred during logout',
    });
  }
});

const transporter = nodemailer.createTransport({
  secure: true,
  host: 'smtp.gmail.com',
  port: 465,
  auth: {
    user: 'nguyennhatminh89203@gmail.com',
    pass: 'yvzp mwfq pdtx cqih'
  }
});


const sendMail = (to, subject, html) => {
  return transporter.sendMail({
    from: '"E commerce" <nguyennhatminh89203@gmail.com>',
    to,
    subject,
    html
  });
};


router.post('/verify', async (req, res) => {
  try {
    const { email } = req.body;
    console.log("🚀 ~ router.post ~ email:", email)

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    user.otpCode = code;
    user.otpExpires = Date.now() + 10 * 60 * 1000; 
    await user.save();

    const htmlContent = `
      <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; background: #f9f9f9; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <div style="text-align: center;">
          <h2 style="color: #333;">🔒 Password reset request</h2>
          <p style="font-size: 16px; color: #555;">We have received your request to reset your account password.</p>
        </div>
        <div style="background: #fff; padding: 20px; margin-top: 20px; border-radius: 6px; border: 1px solid #eee;">
          <p style="margin: 0; color: #333; font-size: 15px;">Your confirmation code is:</p>
          <h2 style="color: #007bff; text-align: center; margin: 20px 0;">${code}</h2>
          <p style="font-size: 14px; color: #777;">Please use this code to complete the password reset process. The code is valid for 10 minutes.</p>
        </div>
        <div style="margin-top: 30px; text-align: center; font-size: 13px; color: #aaa;">
          <p>&copy; 2025 E-Commerce App</p>
        </div>
      </div>
    `;

    await sendMail(email, 'Verification Code - Reset Password', htmlContent);

    res.status(200).json({
      success: true,
      message: 'Verification code sent successfully'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error
    });
  }
});


router.post('/verify-code', async (req, res) => {
  const { email, code } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (
    user.otpCode !== code ||
    !user.otpExpires ||
    user.otpExpires < Date.now()
  ) {
    return res.status(400).json({
      success: false,
      message: 'Verification code is invalid or expired',
    });
  }

  user.otpCode = null;
  user.otpExpires = null;
  await user.save();

  return res.status(200).json({
    success: true,
  });
});


router.post('/change-password', async (req, res) => {
  const { email ,password} = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  user.password = hash;

  await user.save();

  return res.status(200).json({
    success: true,
  });
});


module.exports = router;
