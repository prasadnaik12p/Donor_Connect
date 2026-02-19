import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState(null);
  const [resendEmail, setResendEmail] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setVerificationStatus("error");
        setMessage(
          "Invalid verification link. Please check your email and try again.",
        );
        return;
      }

      try {
        const response = await axios.get(`/auth/verify-email?token=${token}`);

        if (response.data.success) {
          setVerificationStatus("success");
          setMessage(response.data.message);
          setUserData(response.data.user);

          // Store token and user data in localStorage
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
      } catch (error) {
        console.error("Email verification error:", error);
        setVerificationStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Email verification failed. Please try again.",
        );
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleRedirect = () => {
    navigate("/");
  };

  const handleResendVerification = async () => {
    try {
      const emailToResend = userData?.email || resendEmail;

      if (!emailToResend) {
        setMessage("Please enter your email address to resend verification.");
        return;
      }

      const response = await axios.post("/auth/resend-verification", {
        email: emailToResend,
      });

      if (response.data.success) {
        setMessage(
          "Verification email sent successfully! Please check your inbox.",
        );
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to resend verification email.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-3xl shadow-2xl mb-6 transform hover:scale-105 transition-all duration-300">
              {verificationStatus === 'verifying' && (
                <span className="text-3xl text-white">⏳</span>
              )}
              {verificationStatus === 'success' && (
                <span className="text-3xl text-white">✅</span>
              )}
              {verificationStatus === 'error' && (
                <span className="text-3xl text-white">❌</span>
              )}
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
              {verificationStatus === 'verifying' && 'Verifying Your Email'}
              {verificationStatus === 'success' && 'Email Verified!'}
              {verificationStatus === 'error' && 'Verification Failed'}
            </h1>
          </div>

          {/* Verification Card */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden transform hover:shadow-3xl transition-all duration-500">
            <div className="px-8 py-8">
              {/* Verification Status */}
              <div className="text-center mb-6">
                {verificationStatus === 'verifying' && (
                  <div className="space-y-4">
                    <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-600">Please wait while we verify your email address...</p>
                  </div>
                )}

                {verificationStatus === 'success' && (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-2xl text-green-600">🎉</span>
                    </div>
                    <p className="text-green-600 font-semibold text-lg">Congratulations!</p>
                    <p className="text-gray-600">{message}</p>
                    
                    {userData && (
                      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mt-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600">👤</span>
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-gray-900">{userData.name}</p>
                            <p className="text-sm text-gray-600">{userData.email}</p>
                            <p className="text-xs text-gray-500 capitalize">{userData.role}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {verificationStatus === 'error' && (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-2xl text-red-600">⚠️</span>
                    </div>
                    <p className="text-red-600 font-semibold text-lg">Verification Failed</p>
                    <p className="text-gray-600">{message}</p>
                    
                    {/* Email input for resend */}
                    {!userData && (
                      <div className="mt-4">
                        <label htmlFor="resendEmail" className="block text-sm font-medium text-gray-700 text-left mb-2">
                          Enter your email to resend verification:
                        </label>
                        <input
                          type="email"
                          id="resendEmail"
                          value={resendEmail}
                          onChange={(e) => setResendEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                {verificationStatus === 'success' && (
                  <button
                    onClick={handleRedirect}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-6 rounded-2xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center space-x-3"
                  >
                    <span>🚀</span>
                    <span>Go to Dashboard</span>
                  </button>
                )}

                {verificationStatus === 'error' && (
                  <div className="space-y-3">
                    <button
                      onClick={handleResendVerification}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-2xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center space-x-3"
                    >
                      <span>📧</span>
                      <span>Resend Verification Email</span>
                    </button>
                    
                    <Link
                      to="/login"
                      className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-2xl font-semibold hover:bg-gray-200 transition-all duration-300 text-center"
                    >
                      Back to Login
                    </Link>
                  </div>
                )}

                {verificationStatus === 'verifying' && (
                  <div className="text-center">
                    <p className="text-sm text-gray-500">
                      This may take a few moments...
                    </p>
                  </div>
                )}
              </div>

              {/* Message Display */}
              {message && (
                <div className={`mt-4 p-3 rounded-lg text-center ${
                  verificationStatus === 'success' ? 'bg-green-100 text-green-700' :
                  verificationStatus === 'error' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {message}
                </div>
              )}

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">Need help?</p>
                  <div className="flex justify-center space-x-4 text-sm">
                    <a href="mailto:support@donorconnect.com" className="text-blue-600 hover:text-blue-700 transition-colors">
                      Contact Support
                    </a>
                    <Link to="/help" className="text-blue-600 hover:text-blue-700 transition-colors">
                      Help Center
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Footer */}
            <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-4">What's next after verification?</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="flex items-center space-x-2 text-gray-600 justify-center">
                    <span className="text-green-500">✅</span>
                    <span>Complete Profile</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600 justify-center">
                    <span className="text-blue-500">🩸</span>
                    <span>Set Preferences</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600 justify-center">
                    <span className="text-purple-500">🤝</span>
                    <span>Join Community</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default VerifyEmail;