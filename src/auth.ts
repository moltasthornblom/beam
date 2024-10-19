import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from './models/userModel';

const secretKey = process.env.JWT_SECRET_KEY as string;

async function register(username: string, password: string, role: string) {
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = new User({ username, password: hashedPassword, role });
  await user.save();
  return { message: 'User registered successfully' };
}

async function login(username: string, password: string) {
  const user = await User.findOne({ username });
  if(!user?.isVerified) {
    throw new Error('User is not verified');
  }
  if (user && bcrypt.compareSync(password, user.password)) {
    // TODO add refresh tokens and expiry
    // expiresIn: '1h'
    const token = jwt.sign({ username, userId: user._id, role: user.role }, secretKey, {});
    return { token };
  }
  throw new Error('Invalid username or password');
}

async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  if (!bcrypt.compareSync(currentPassword, user.password)) {
    throw new Error('Current password is incorrect');
  }
  const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
  user.password = hashedNewPassword;
  await user.save();
  return { message: 'Password changed successfully' };
}

export { register, login, changePassword };
