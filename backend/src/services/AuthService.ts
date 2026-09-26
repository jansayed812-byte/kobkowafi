import { userModel } from '../models/User';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import { generateApiKey, validateEmail } from '../utils/helpers';
import logger from '../config/logger';

export class AuthService {
  async register(email: string, password: string) {
    // Validate email
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    // Check if user exists
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await userModel.createUser(email, passwordHash, false);

    // Generate API key
    const apiKey = generateApiKey();
    await userModel.updateApiKey(user.id, apiKey);

    logger.info(`User registered: ${email}`);

    return {
      id: user.id,
      email: user.email,
      apiKey,
    };
  }

  async login(email: string, password: string) {
    // Find user by email
    const user = await userModel.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new Error('User account is disabled');
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const token = generateToken({
      userId: user.id,
      email: user.email,
      isAdmin: user.is_admin,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      isAdmin: user.is_admin,
    });

    logger.info(`User logged in: ${email}`);

    return {
      id: user.id,
      email: user.email,
      token,
      refreshToken,
      isAdmin: user.is_admin,
    };
  }

  async refreshToken(refreshToken: string) {
    // This would need JWT verification - simplified for now
    // In production, verify the refresh token and generate new token pair

    const newToken = generateToken({
      userId: 'placeholder',
      email: 'placeholder',
      isAdmin: false,
    });

    return {
      token: newToken,
    };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify old password
    const isPasswordValid = await comparePassword(oldPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await userModel.update(userId, { password_hash: newPasswordHash });

    logger.info(`Password changed for user: ${userId}`);

    return { success: true };
  }

  async generateNewApiKey(userId: string) {
    const apiKey = generateApiKey();
    await userModel.updateApiKey(userId, apiKey);

    logger.info(`New API key generated for user: ${userId}`);

    return { apiKey };
  }

  async getProfile(userId: string) {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      isAdmin: user.is_admin,
      isActive: user.is_active,
      createdAt: user.created_at,
    };
  }
}

export const authService = new AuthService();
