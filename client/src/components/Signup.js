import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = ({ setUser }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    profile: {
      avatar: '',
      bio: '',
      interests: [],
      education: '',
      goals: ''
    }
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleInterestChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        interests: checked
          ? [...prev.profile.interests, value]
          : prev.profile.interests.filter(interest => interest !== value)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/api/auth/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        profile: formData.profile
      });

      localStorage.setItem('token', response.data.token);
      const userData = {
        ...response.data.user,
        id: response.data.user.id
      };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  const handleGoogleSignup = () => {
    window.location.href = `${process.env.REACT_APP_SERVER_URL}/api/auth/google`;
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          value={formData.username}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          value={formData.password}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          value={formData.confirmPassword}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        />
      </div>

      <button
        type="button"
        onClick={() => setStep(2)}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Next
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="profile.avatar" className="block text-sm font-medium text-gray-700">
          Profile Picture URL
        </label>
        <input
          id="profile.avatar"
          name="profile.avatar"
          type="url"
          value={formData.profile.avatar}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="profile.bio" className="block text-sm font-medium text-gray-700">
          Bio
        </label>
        <textarea
          id="profile.bio"
          name="profile.bio"
          rows="3"
          value={formData.profile.bio}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Interests</label>
        <div className="mt-2 space-y-2">
          {['Mathematics', 'Science', 'History', 'Literature', 'Technology'].map(interest => (
            <label key={interest} className="inline-flex items-center mr-4">
              <input
                type="checkbox"
                value={interest}
                checked={formData.profile.interests.includes(interest)}
                onChange={handleInterestChange}
                className="form-checkbox h-4 w-4 text-primary"
              />
              <span className="ml-2 text-sm text-gray-700">{interest}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="profile.education" className="block text-sm font-medium text-gray-700">
          Education
        </label>
        <input
          id="profile.education"
          name="profile.education"
          type="text"
          value={formData.profile.education}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="profile.goals" className="block text-sm font-medium text-gray-700">
          Learning Goals
        </label>
        <textarea
          id="profile.goals"
          name="profile.goals"
          rows="3"
          value={formData.profile.goals}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        />
      </div>

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Back
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Complete Profile
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/login" className="font-medium text-primary hover:text-secondary">
            sign in to your account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 ? renderStep1() : renderStep2()}
          </form>

          {step === 2 && (
            <div className="mt-6">
              <button
                type="button"
                onClick={handleSkip}
                className="w-full text-sm text-gray-600 hover:text-gray-900"
              >
                Skip profile setup for now
              </button>
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or sign up with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleSignup}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
                </svg>
                Sign up with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup; 