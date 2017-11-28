import { Router } from 'express';

class PasswordServerExpress {
  constructor() {

    this.router = Router()
    .post('/password/register', this.register)
    .post('/password/verifyEmail', this.verifyEmail)
    .post('/password/resetPassword', this.resetPassword)
    .post('/password/sendVerificationEmail', this.sendVerificationEmail)
    .post('/password/sendResetPasswordEmail', this.sendResetPasswordEmail)
    .post('/password/authenticate', this.authenticate)
  }


  public register = async (req, res) => {
    const { username, password, email } = req.body;
    const userId = this.service.register({ username, password, email });
    res.json({userId});
  }

  public verifyEmail = async (req, res) => {
    const { token } = req.body;
    await this.service.verifyEmail(token);
    res.json({ message: 'Email verified' });
  }

  public resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    await this.service.resetPassword(token, newPassword);
    res.json({ message: 'Password changed' });
  }

  public sendVerificationEmail = async (req, res) => {
    const { email } = req.body;
    await this.service.sendVerificationEmail(email);
    res.json({ message: 'Email sent' });
  }

  public sendResetPasswordEmail = async (req, res) => {
    const { email } = req.body;
    await this.service.sendResetPasswordEmail(email);
    res.json({ message: 'Email sent' });
  }

  public authenticate = async (req, res) => {}
}
