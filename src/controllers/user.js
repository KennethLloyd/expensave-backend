const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const { User } = require('../models');
const { getEmailTransporter, err } = require('../helpers/utils');

/**
@api {post} /auth/signup Sign Up
@apiVersion 1.0.0
@apiName SignUp
@apiGroup Auth

@apiParamExample {json} Request-Example:
{
  "firstName": "Miyeon",
  "lastName": "Cho",
  "email": "miyeon@cube.com",
  "password": "12345aA!"
}

@apiSuccess {Object} user User details
@apiSuccess {String} token Auth token
@apiSuccessExample {json} Success-Response:
HTTP/1.1 201 Created
{
    "user": {
        "_id": "5f18d3e942e2bd44bcf1dd1f",
        "firstName": "Miyeon",
        "lastName": "Cho",
        "email": "miyeon@cube.com",
        "createdAt": "2020-07-23T00:03:53.910Z",
        "updatedAt": "2020-07-23T00:03:53.960Z",
        "__v": 1
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE4ZDNlOTQyZTJiZDQ0YmNmMWRkMWYiLCJpYXQiOjE1OTU0NjI2MzN9.ksS_P3da-Imj4WfErBK4wiCWZiGlsb2cqYLDv9Ny31E"
}
*/

const signUp = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email }).lean();

    if (user) {
      throw err(400, 'Email already exists');
    }

    const newUser = new User(req.body);

    await newUser.save();
    const token = await newUser.generateAuthToken();

    return res.status(201).send({ user: newUser, token });
  } catch (e) {
    console.log(e);

    if (e.status) {
      return res.status(e.status).send({ error: e.message });
    }
    return res.status(500).send({ error: 'Internal Server Error' });
  }
};

/**
@api {post} /users/login Log In User
@apiVersion 1.0.0
@apiName LogIn
@apiGroup User

@apiParamExample {json} Request-Example:
{
	 "email": "soyeon@cube.com",
	 "password": "12345aA!"
}

@apiSuccess {Object} user User details
@apiSuccess {String} token Auth token
@apiSuccessExample {json} Success-Response:
HTTP/1.1 200 OK
{
    "user": {
        "_id": "5f18e3c80e5cb76879bd768c",
        "firstName": "Soyeon",
        "lastName": "Jeon",
        "email": "soyeon@cube.com",
        "createdAt": "2020-07-23T01:11:36.416Z",
        "updatedAt": "2020-07-23T01:27:15.894Z",
        "__v": 3
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE4ZTNjODBlNWNiNzY4NzliZDc2OGMiLCJpYXQiOjE1OTU0Njc2MzV9.w2W6mWbsYjZv9DeGkignvBJHsK3GTsMNJsZMe3t_hpM"
}
*/

const logIn = async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password,
    );

    if (!user) {
      throw err(400, 'Invalid credentials');
    }

    const token = await user.generateAuthToken();

    return res.send({ user, token });
  } catch (e) {
    console.log(e);

    if (e.status) {
      return res.status(e.status).send({ error: e.message });
    }
    return res.status(500).send({ error: 'Internal Server Error' });
  }
};

/**
@api {post} /users/login/google Log In with Google
@apiVersion 1.0.0
@apiName LogInWithGoogle
@apiGroup User

@apiParamExample {json} Request-Example:
{
	 "googleToken": "eyJhkjdsqqqffsd88287.eydhhd686dsaqqxsfed121"
}

@apiSuccess {Object} user User details
@apiSuccess {String} token Auth token
@apiSuccessExample {json} Success-Response:
HTTP/1.1 200 OK
{
    "user": {
        "_id": "5f18e3c80e5cb76879bd768c",
        "firstName": "Minnie",
        "lastName": "Kim",
        "email": "minnie@cube.com",
        "createdAt": "2020-07-23T01:11:36.416Z",
        "updatedAt": "2020-07-23T01:27:15.894Z",
        "__v": 3
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE4ZTNjODBlNWNiNzY4NzliZDc2OGMiLCJpYXQiOjE1OTU0Njc2MzV9.w2W6mWbsYjZv9DeGkignvBJHsK3GTsMNJsZMe3t_hpM"
}
*/

const logInWithGoogle = async (req, res) => {
  try {
    const { googleToken } = req.body;
    const CLIENT_ID = config.get('googleClientID');
    const client = new OAuth2Client(CLIENT_ID);
    let user = null;

    const verify = async () => {
      const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: CLIENT_ID,
      });
      const payload = ticket.getPayload();

      user = await User.findByCredentials(payload['email'], payload['sub']);

      if (!user) {
        // create new account
        user = new User({
          firstName: payload['given_name'],
          lastName: payload['family_name'],
          email: payload['email'],
          password: payload['sub'],
          isNative: false,
        });

        await user.save();
        await insertInitialCategories(user._id);
      }

      const token = await user.generateAuthToken();
      return res.send({ user, token });
    };

    verify().catch(console.error());
  } catch (e) {
    console.log(e);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
};

/**
@api {post} /users/login/fb Log In with Facebook
@apiVersion 1.0.0
@apiName LogInWithFacebook
@apiGroup User

@apiParamExample {json} Request-Example:
{
	 "fbToken":"EAAQ1zcVRuWIBAP6lHnGNTXMyduPV4HZA2",
	 "firstName": "Yuqi",
	 "lastName": "Song",
	 "email": "yuqi@cube.com"
}

@apiSuccess {Object} user User details
@apiSuccess {String} token Auth token
@apiSuccessExample {json} Success-Response:
HTTP/1.1 200 OK
{
    "user": {
        "_id": "5f18e3c80e5cb76879bd768c",
        "firstName": "Yuqi",
        "lastName": "Song",
        "email": "yuqi@cube.com",
        "createdAt": "2020-07-23T01:11:36.416Z",
        "updatedAt": "2020-07-23T01:27:15.894Z",
        "__v": 3
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE4ZTNjODBlNWNiNzY4NzliZDc2OGMiLCJpYXQiOjE1OTU0Njc2MzV9.w2W6mWbsYjZv9DeGkignvBJHsK3GTsMNJsZMe3t_hpM"
}
*/

const logInWithFacebook = async (req, res) => {
  try {
    const { fbToken, firstName, lastName, email } = req.body;
    const AppID = config.get('fbAppID');
    const AppSecret = config.get('fbAppSecret');
    let response = null;
    let user = null;

    response = await axios.get(
      `https://graph.facebook.com/oauth/access_token?client_id=${AppID}&client_secret=${AppSecret}&grant_type=client_credentials`,
    );

    const appToken = response.data.access_token;

    response = await axios.get(
      `https://graph.facebook.com/debug_token?input_token=${fbToken}&access_token=${appToken}`,
    );

    const { is_valid } = response.data.data;

    if (is_valid) {
      const { user_id } = response.data.data;

      user = await User.findByCredentials(email, user_id);

      if (!user) {
        // create new account
        user = new User({
          firstName,
          lastName,
          email,
          password: user_id,
          isNative: false,
        });

        await user.save();
        await insertInitialCategories(user._id);
      }

      const token = await user.generateAuthToken();
      return res.send({ user, token });
    } else {
      // invalid token
      return res.status(400).send({ error: 'Invalid credentials' });
    }
  } catch (e) {
    console.log(e);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
};

/**
@api {post} /users/forgot Forgot Password
@apiVersion 1.0.0
@apiName ForgotPassword
@apiGroup User

@apiParamExample {json} Request-Example:
{
    "email": "miyeon@cube.com"
}

@apiSuccess {String} message Response message
@apiSuccessExample {json} Success-Response:
HTTP/1.1 200 OK
{
    "message": "Password reset email successfully sent!"
}
*/

const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email, isNative: true });

    if (!user) {
      return res.status(404).send({ error: 'Email does not exist' });
    }

    user.resetPasswordToken = await user.generateResetToken();
    user.resetPasswordExpiry = format(
      add(new Date(), { hours: 1 }),
      'yyyy-MM-dd HH:mm',
    );

    await user.save();

    const emailer = await getEmailTransporter();

    // send mail with defined transport object
    await emailer.sendMail({
      from: `"Expensave" <${config.get('nodemailerEmail')}>`, // sender address
      to: user.email, // list of receivers
      subject: 'Reset your password', // Subject line
      html: `<p>Hi ${
        user.firstName
      },</p><p>Please follow this link to reset your password: ${config.get(
        'frontendURL',
      )}/reset-password/${
        user.resetPasswordToken
      }. This link is valid for only an hour.</p><p>Thanks!</p>`, // html body
    });

    res.send({ message: 'Password reset email successfully sent!' });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
};

/**
@api {post} /users/reset/:token Reset Password
@apiVersion 1.0.0
@apiName ResetPassword
@apiGroup User

@apiParamExample {json} Request-Example:
{
    "password": "54321aA!"
}

@apiSuccess {String} message Response message
@apiSuccessExample {json} Success-Response:
HTTP/1.1 200 OK
{
    "message": "Password changed successfully!"
}
*/

const resetPassword = async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpiry: { $gt: format(new Date(), 'yyyy-MM-dd HH:mm') },
    });

    if (!user) {
      return res
        .status(404)
        .send({ error: 'Password reset token is invalid or has expired' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = '';
    user.resetPasswordExpiry = '';

    await user.save();
    res.send({ message: 'Password changed successfully!' });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
};

/**
@api {post} /users/logout Log out User
@apiVersion 1.0.0
@apiName LogOut
@apiGroup User

@apiHeaderExample {json} Header-Example:
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE4ZTNjODBlNWNiNzY4NzliZDc2OGMiLCJpYXQiOjE1OTU0NjY2OTZ9.zCJOK_0xANZ917ebDGH3G5oFGMp0OH-Kt5cwWIOyztM"
}

@apiSuccess {String} message Log out message
@apiSuccessExample {json} Success-Response:
HTTP/1.1 200 OK
{
    "message": "Logged out successfully!"
}
*/

const logOut = async (req, res) => {
  try {
    // remove the current token from the list of tokens to avoid logging out in other devices
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token,
    );

    await req.user.save();

    res.send({ message: 'Logged out successfully!' });
  } catch (e) {
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

/**
@api {post} /users/logoutAll Log out User on all devices
@apiVersion 1.0.0
@apiName LogOutAllDevices
@apiGroup User

@apiHeaderExample {json} Header-Example:
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE4ZTNjODBlNWNiNzY4NzliZDc2OGMiLCJpYXQiOjE1OTU0NjY2OTZ9.zCJOK_0xANZ917ebDGH3G5oFGMp0OH-Kt5cwWIOyztM"
}

@apiSuccess {String} message Log out message
@apiSuccessExample {json} Success-Response:
HTTP/1.1 200 OK
{
    "message": "Logged out all devices successfully!"
}
*/

const logOutAllDevices = async (req, res) => {
  try {
    req.user.tokens = [];

    await req.user.save();

    res.send({ message: 'Logged out all devices successfully!' });
  } catch (e) {
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

/**
@api {patch} /users/me Update Own Profile
@apiVersion 1.0.0
@apiName UpdateProfile
@apiGroup User

@apiHeaderExample {json} Header-Example:
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE4ZTNjODBlNWNiNzY4NzliZDc2OGMiLCJpYXQiOjE1OTU0NjY2OTZ9.zCJOK_0xANZ917ebDGH3G5oFGMp0OH-Kt5cwWIOyztM"
}

@apiParamExample {json} Request-Example:
{
	"firstName": "Soojin",
	"lastName": "Seo",
	"email": "soojin@cube.com"
}

@apiSuccess {Object} user User details
@apiSuccessExample {json} Success-Response:
HTTP/1.1 200 OK
{
    "user": {
        "_id": "5f18e3c80e5cb76879bd768c",
        "firstName": "Soojin",
        "lastName": "Seo",
        "email": "soojin@cube.com",
        "createdAt": "2020-07-23T01:11:36.416Z",
        "updatedAt": "2020-07-23T01:55:03.615Z",
        "__v": 9
    }
}
*/

const editProfile = async (req, res) => {
  const allowedUpdates = ['firstName', 'lastName', 'email', 'password'];
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update),
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates' });
  }

  try {
    updates.map((update) => (req.user[update] = req.body[update]));

    await req.user.save();

    return res.send({ user: req.user });
  } catch (e) {
    return res.status(500).send({ error: 'Internal Server Error' });
  }
};

/**
@api {delete} /users/me Delete Own Account
@apiVersion 1.0.0
@apiName DeleteProfile
@apiGroup User

@apiHeaderExample {json} Header-Example:
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE4ZTNjODBlNWNiNzY4NzliZDc2OGMiLCJpYXQiOjE1OTU0NjY2OTZ9.zCJOK_0xANZ917ebDGH3G5oFGMp0OH-Kt5cwWIOyztM"
}

@apiSuccess {Object} user User details
@apiSuccessExample {json} Success-Response:
HTTP/1.1 200 OK
{
    "user": {
        "_id": "5f18d3e942e2bd44bcf1dd1f",
        "firstName": "Shuhua",
        "lastName": "Yeh",
        "email": "shuhua@cube.com",
        "createdAt": "2020-07-23T00:03:53.910Z",
        "updatedAt": "2020-07-23T01:59:24.117Z",
        "__v": 4
    }
}
*/

const deleteAccount = async (req, res) => {
  try {
    await req.user.remove();

    res.send({ user: req.user });
  } catch (e) {
    res.status(400).send({ error: 'Internal Server Error' });
  }
};

module.exports = {
  logIn,
  logInWithGoogle,
  logInWithFacebook,
  signUp,
  forgotPassword,
  resetPassword,
  logOut,
  logOutAllDevices,
  editProfile,
  deleteAccount,
};
