import { signUp, signIn, signOut, confirmSignUp, resendSignUpCode, resetPassword, confirmResetPassword, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import awsService from './aws.js';

class AuthService {
  // Sign up new user
  async register(email, password, username, name = '') {
    try {
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username, // Use the username from the form, not email
        password,
        options: {
          userAttributes: {
            email,
            name
          },
          autoSignIn: true
        }
      });

      if (isSignUpComplete) {
        // Create user profile in database
        await awsService.createUserProfile({
          id: userId,
          email,
          username,
          name
        });
      }

      return {
        success: true,
        isSignUpComplete,
        nextStep,
        message: isSignUpComplete 
          ? 'Registration successful!' 
          : 'Please check your email for verification code.'
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.message || 'Registration failed'
      };
    }
  }

  // Confirm email verification
  async confirmEmail(username, code) {
    try {
      await confirmSignUp({
        username, // Use the username, not email
        confirmationCode: code
      });

      return {
        success: true,
        message: 'Email verified successfully!'
      };
    } catch (error) {
      console.error('Email confirmation error:', error);
      return {
        success: false,
        error: error.message || 'Email verification failed'
      };
    }
  }

  // Resend verification code
  async resendCode(username) {
    try {
      await resendSignUpCode({
        username // Use the username, not email
      });

      return {
        success: true,
        message: 'Verification code sent!'
      };
    } catch (error) {
      console.error('Resend code error:', error);
      return {
        success: false,
        error: error.message || 'Failed to resend code'
      };
    }
  }

  // Sign in user
  async login(email, password) {
    try {
      const { isSignedIn, nextStep } = await signIn({
        username: email,
        password
      });

      if (isSignedIn) {
        const user = await this.getCurrentUser();
        return {
          success: true,
          user,
          message: 'Login successful!'
        };
      } else {
        return {
          success: false,
          nextStep,
          message: 'Additional steps required'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Login failed'
      };
    }
  }

  // Sign out user
  async logout() {
    try {
      await signOut();
      return {
        success: true,
        message: 'Logged out successfully!'
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: error.message || 'Logout failed'
      };
    }
  }

  // Get current authenticated user
  async getCurrentUser() {
    try {
      const user = await getCurrentUser();
      return {
        id: user.userId,
        email: user.signInDetails?.loginId || user.username,
        username: user.username,
        attributes: user.attributes || {}
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Check if user is authenticated
  async isAuthenticated() {
    try {
      const session = await fetchAuthSession();
      return session.tokens !== undefined;
    } catch (error) {
      return false;
    }
  }

  // Reset password
  async forgotPassword(email) {
    try {
      const output = await resetPassword({
        username: email
      });

      return {
        success: true,
        nextStep: output.nextStep,
        message: 'Password reset code sent to your email!'
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send reset code'
      };
    }
  }

  // Confirm password reset
  async confirmPasswordReset(email, code, newPassword) {
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword
      });

      return {
        success: true,
        message: 'Password reset successful!'
      };
    } catch (error) {
      console.error('Confirm password reset error:', error);
      return {
        success: false,
        error: error.message || 'Password reset failed'
      };
    }
  }

  // Get user session/tokens
  async getSession() {
    try {
      const session = await fetchAuthSession();
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }
}

export default new AuthService();
