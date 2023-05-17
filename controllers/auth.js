import crypto from 'crypto';

import UserInfo from '../models/user.js';
import ErrorResponse from '../utils/errorResponse.js';
import sendEmail from '../utils/sendEmail.js';

export const login = async (req, res, next) => {
  const { workEmail, password } = req.body;
  try {
    const existingUserFind = await UserInfo.findOne({ workEmail }).select('+password');
    if (!existingUserFind)
      return next(
        new ErrorResponse(
          'Username or password are invalid. Please enter correct username and password.',
          401
        )
      );
    const isPasswordCorrect = await existingUserFind.matchPasswords(password);
    if (!isPasswordCorrect)
      return next(
        new ErrorResponse(
          'Username or password are invalid. Please enter correct username and password.',
          401
        )
      );
      
    const existingUserAggregate = await UserInfo.findOne({ workEmail: workEmail })
    .populate('department', '-createdAt -_id -__v')
    .populate('leave', '-_id -__v')
    .populate('access', '-_id -__v')
    .select('-password -resetPasswordToken -resetPasswordExpire');

    sendToken(existingUserAggregate, existingUserFind, 200, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res, next) => {
  const { workEmail } = req.body;
  try {
    const existingUser = await UserInfo.findOne({ workEmail });
    if (!existingUser) return next(new ErrorResponse('User with this email doesnt exist.', 404));

    const resetToken = existingUser.getResetPasswordToken();
    await existingUser.save();
    const resetUrl = `http://1.215.140.110:888/passwordreset/${resetToken}`;
    const message = `
      <style>
            @font-face {
              font-family: &#x27;Postmates Std&#x27;;
              font-weight: 600;
              font-style: normal;
              src: local(&#x27;Postmates Std Bold&#x27;), url(https://s3-us-west-1.amazonaws.com/buyer-static.postmates.com/assets/email/postmates-std-bold.woff) format(&#x27;woff&#x27;);
            }

            @font-face {
              font-family: &#x27;Postmates Std&#x27;;
              font-weight: 500;
              font-style: normal;
              src: local(&#x27;Postmates Std Medium&#x27;), url(https://s3-us-west-1.amazonaws.com/buyer-static.postmates.com/assets/email/postmates-std-medium.woff) format(&#x27;woff&#x27;);
            }

            @font-face {
              font-family: &#x27;Postmates Std&#x27;;
              font-weight: 400;
              font-style: normal;
              src: local(&#x27;Postmates Std Regular&#x27;), url(https://s3-us-west-1.amazonaws.com/buyer-static.postmates.com/assets/email/postmates-std-regular.woff) format(&#x27;woff&#x27;);
            }
        </style>

      <style>
          .page-center {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
          
          .footer-center {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
        .resetBtn {
          background-color: #556ee6;
          color: white;
          padding: 1em 1.5em;
          text-decoration: none;
          text-transform: uppercase;
          border-radius:20px
        }
     </style>


  <body style="background-color: #f4f4f5;">
  <table cellpadding="0" cellspacing="0" style="width: 100%; height: 100%; background-color: #f4f4f5; text-align: center;">
    <tbody>
      <tr>
        <td style="text-align: center;">
          <table align="center" cellpadding="0" cellspacing="0" id="body" style="background-color: #fff; width: 100%; max-width: 680px; height: 100%;">
            <tbody>
              <tr>
                <td>
                  <table align="center" cellpadding="0" cellspacing="0" class="page-center" style="text-align: left; padding-bottom: 20px; width: 100%; padding-left: 120px; padding-right: 120px;">
                    <tbody>
                      <tr>
                        <td style="padding-top: 5px;">
                          <img src="https://cdn.statically.io/img/korupharma.com/wp-content/uploads/2022/02/Koru-Logo-for-Website-02.png?w=100&f=auto" style="width: 100px; height:100px;">
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top: 22px; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #000000; font-family: 'Postmates Std', 'Helvetica', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 48px; font-smoothing: always; font-style: normal; font-weight: 600; letter-spacing: -2.6px; line-height: 52px; mso-line-height-rule: exactly; text-decoration: none;">Reset your password</td>
                      </tr>
                      <tr>
                        <td>
                          <table cellpadding="0" cellspacing="0" style="width: 100%">
                            <tbody>
                              <tr>
                                <td style="width: 100%; height: 1px; max-height: 1px; background-color: #d9dbe0; opacity: 0.81"></td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="-ms-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #9095a2; font-family: 'Postmates Std', 'Helvetica', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 16px; font-smoothing: always; font-style: normal; font-weight: 400; letter-spacing: -0.18px; line-height: 24px; text-decoration: none; vertical-align: top; width: 100%;">
                          You're receiving this e-mail because you requested a password reset for your Postmates account.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top: 24px; -ms-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #9095a2; font-family: 'Postmates Std', 'Helvetica', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 16px; font-smoothing: always; font-style: normal; font-weight: 400; letter-spacing: -0.18px; line-height: 24px; mso-line-height-rule: exactly; text-decoration: none; vertical-align: top; width: 100%;">
                          Please tap the button below to choose a new password.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 2.5em;">
                          <a href=${resetUrl} style="background-color: #556ee6; color: white; padding: 1em 1.5em; text-decoration: none; text-transform: uppercase; border-radius:20px;">Reset Password</a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
          <table align="center" cellpadding="0" cellspacing="0" id="footer" style="background-color: #556ee6; width: 100%; max-width: 680px; height: 100%;">
            <tbody>
              <tr>
                <td>
                  <table align="center" cellpadding="0" cellspacing="0" class="footer-center" style="text-align: left; width: 100%; padding-left: 120px; padding-right: 120px;">
                    <tbody>
                      <tr>
                        <td colspan="2" style="padding-top: 24px; padding-bottom: 48px;">
                          <table cellpadding="0" cellspacing="0" style="width: 100%">
                            <tbody>
                              <tr>
                                <td style="width: 100%; height: 1px; max-height: 1px; background-color: #EAECF2; opacity: 0.19"></td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="-ms-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #fff; font-family: 'Postmates Std', 'Helvetica', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 15px; font-smoothing: always; font-style: normal; font-weight: 400; letter-spacing: 0; line-height: 24px; mso-line-height-rule: exactly; text-decoration: none; vertical-align: top; width: 100%;">
                          If you have any questions or concerns, we're here to help. Contact us via our <a data-click-track-id="1053" href="https://support.postmates.com/buyer" style="font-weight: 500; color: #ffffff" target="_blank">Help Center</a>.
                        </td>
                      </tr>
                      <tr>
                        <td style="height: 72px;"></td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
    `;
    try {
      await sendEmail({
        to: existingUser.workEmail,
        subject: 'Password Reset Request',
        text: message
      });
      res.status(200).json({ success: true, data: 'Email Sent' });
    } catch (error) {
      existingUser.resetPasswordToken = undefined;
      existingUser.resetPasswordExpire = undefined;
      await existingUser.save();
      return next(new ErrorResponse('Email could not be sent', 500));
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res, next) => {
  const { password, confpassword, resetToken } = req.body;
  const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  try {
    if (password !== confpassword) return next(new ErrorResponse('Passwords do not match', 401));
    if (password.length < 6)
      return next(
        new ErrorResponse('Password is too short. It should be not less than 6 characters!', 401)
      );
    const existingUser = await UserInfo.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    if (!existingUser) return next(new ErrorResponse('Invalid Reset Token.', 400));
    existingUser.password = password;
    existingUser.resetPasswordToken = undefined;
    existingUser.resetPasswordExpire = undefined;
    await existingUser.save();
    res.status(201).json({ success: true, data: 'Password Changed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendToken = (existingUserAggregate, existingUserFind, statusCode, res) => {
  const token = existingUserFind.getSignedToken();
  res.status(statusCode).json({ success: true, result: existingUserAggregate, token });
};
