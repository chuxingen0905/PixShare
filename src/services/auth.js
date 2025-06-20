import {
  signUp,
  signIn,
  signOut,
  confirmSignUp,
  resendSignUpCode,
  resetPassword,
  confirmResetPassword,
  getCurrentUser,
  fetchAuthSession
} from 'aws-amplify/auth';

import awsService from './aws.js';

class AuthService {
  // Sign up new user
  async register(email, password, username, name = '') {
    try {
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email,
            name
          },
          autoSignIn: false
        }
      });

      if (isSignUpComplete) {
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
        username,
        confirmationCode: code
      });

      try {
        await signOut({ global: true });
        console.log('Signed out user after confirmation');
      } catch (signOutError) {
        console.log('Sign out after confirmation failed:', signOutError);
      }

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
      await resendSignUpCode({ username });

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
      try {
        await this.handleAlreadySignedInError();
      } catch (_) {
        // Ignore if not signed in
      }

      const { isSignedIn, nextStep } = await signIn({
        username: email,
        password
      }); if (isSignedIn) {
        // Get full session including tokens and AWS credentials
        const session = await fetchAuthSession();

        // Save ID token for API calls authentication
        const idToken = session.tokens?.idToken?.toString();
        if (idToken) {
          localStorage.setItem('cognito_id_token', idToken);
        }

        // Save access token for protected resources
        const accessToken = session.tokens?.accessToken?.toString();
        if (accessToken) {
          localStorage.setItem('cognito_access_token', accessToken);
        }

        // Save refresh token for getting new tokens
        const refreshToken = session.tokens?.refreshToken?.toString();
        if (refreshToken) {
          localStorage.setItem('cognito_refresh_token', refreshToken);
        }

        // Save AWS credentials if available (from Identity Pool)
        if (session.credentials) {
          localStorage.setItem('aws_credentials', JSON.stringify({
            accessKeyId: session.credentials.accessKeyId,
            secretAccessKey: session.credentials.secretAccessKey,
            sessionToken: session.credentials.sessionToken,
            expiration: session.credentials.expiration
          }));
        }

        return {
          success: true,
          token: idToken,
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

      if (error.message?.includes('There is already a signed in user')) {
        try {
          const signedOut = await this.handleAlreadySignedInError();
          if (signedOut) {
            return await this.login(email, password);
          }
        } catch (retryError) {
          console.error('Retry login failed:', retryError);
        }
      }

      return {
        success: false,
        error: error.message || 'Login failed'
      };
    }
  }

  // Sign out user
  async logout() {
    try {
      await signOut({ global: true });

      // Clear all tokens and credentials
      localStorage.removeItem('cognito_id_token');
      localStorage.removeItem('cognito_access_token');
      localStorage.removeItem('cognito_refresh_token');
      localStorage.removeItem('aws_credentials');

      // For backward compatibility
      localStorage.removeItem('cognito_token');

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

  // Check if a user is authenticated
  async isAuthenticated() {
    try {
      await getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }

  // Initiate forgot password flow
  async forgotPassword(email) {
    try {
      await resetPassword({ username: email });

      return {
        success: true,
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

  // Confirm new password
  async confirmPasswordReset(email, code, newPassword) {
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword
      });

      return {
        success: true,
        message: 'Password reset successfully!'
      };
    } catch (error) {
      console.error('Confirm password reset error:', error);
      return {
        success: false,
        error: error.message || 'Failed to reset password'
      };
    }
  }  // Get the current auth session (tokens and credentials if available)
  async getSession() {
    try {
      const session = await fetchAuthSession();

      // Return a more complete session object
      return {
        tokens: session.tokens,
        credentials: session.credentials || null,
        identityId: session.identityId || null
      };
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  // Handle already signed-in user by signing out
  async handleAlreadySignedInError() {
    try {
      await signOut({ global: true });
      console.log('Signed out existing user session');
      return true;
    } catch (error) {
      console.error('Error signing out existing session:', error);
      return false;
    }
  }

  // Get stored ID token for API calls
  getIdToken() {
    return localStorage.getItem('cognito_id_token') || localStorage.getItem('cognito_token');
  }

  // Get Authorization header for API calls
  getAuthHeader() {
    const token = this.getIdToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // Refresh AWS credentials
  async refreshCredentials() {
    try {
      const session = await fetchAuthSession();

      if (session.credentials) {
        localStorage.setItem('aws_credentials', JSON.stringify({
          accessKeyId: session.credentials.accessKeyId,
          secretAccessKey: session.credentials.secretAccessKey,
          sessionToken: session.credentials.sessionToken,
          expiration: session.credentials.expiration
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing credentials:', error);
      return false;
    }
  }

  // Check token expiration and refresh if needed
  async ensureValidToken() {
    const token = this.getIdToken();
    if (!token) return false;

    try {
      // Parse JWT to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds

      // If token is expired or about to expire (within 5 minutes)
      if (Date.now() >= expirationTime - 5 * 60 * 1000) {
        console.log('Token expired or about to expire, refreshing session...');
        return await this.refreshSession();
      }

      return true;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return false;
    }
  }

  // Refresh the session
  async refreshSession() {
    try {
      const session = await fetchAuthSession();

      // Update stored tokens
      if (session.tokens?.idToken) {
        localStorage.setItem('cognito_id_token', session.tokens.idToken.toString());
      }
      if (session.tokens?.accessToken) {
        localStorage.setItem('cognito_access_token', session.tokens.accessToken.toString());
      }

      // Update AWS credentials
      if (session.credentials) {
        localStorage.setItem('aws_credentials', JSON.stringify({
          accessKeyId: session.credentials.accessKeyId,
          secretAccessKey: session.credentials.secretAccessKey,
          sessionToken: session.credentials.sessionToken,
          expiration: session.credentials.expiration
        }));
      }

      return true;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return false;
    }
  }
}

export default new AuthService();
