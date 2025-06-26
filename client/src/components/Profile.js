import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserCircleIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
        setEditedProfile(response.data.profile || {});
      } catch (error) {
        setError('Failed to load profile');
      }
    };

    fetchUserProfile();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(user.profile || {});
    setError('');
    setSuccess('');
    setImageError(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInterestChange = (interest) => {
    setEditedProfile(prev => ({
      ...prev,
      interests: prev.interests?.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...(prev.interests || []), interest]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_SERVER_URL}/api/auth/profile`,
        editedProfile,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setUser(prev => ({ ...prev, profile: response.data }));
      setIsEditing(false);
      setSuccess('Profile updated successfully');
      setError('');
      setImageError(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
      setSuccess('');
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center px-4 py-2 text-primary hover:text-secondary"
            >
              <PencilIcon className="w-5 h-5 mr-2" />
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                className="flex items-center px-4 py-2 text-red-600 hover:text-red-700"
              >
                <XMarkIcon className="w-5 h-5 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center px-4 py-2 text-green-600 hover:text-green-700"
              >
                <CheckIcon className="w-5 h-5 mr-2" />
                Save
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center space-x-4">
            {user.profile?.avatar && !imageError ? (
              <img
                src={user.profile.avatar}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
                onError={handleImageError}
              />
            ) : (
              <UserCircleIcon className="w-24 h-24 text-gray-400" />
            )}
            {isEditing && (
              <div className="flex-1">
                <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">
                  Profile Picture URL
                </label>
                <input
                  type="url"
                  id="avatar"
                  name="avatar"
                  value={editedProfile.avatar || ''}
                  onChange={handleChange}
                  placeholder="https://example.com/your-image.jpg"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter a valid image URL (e.g., from imgur, imgbb, or other image hosting services)
                </p>
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <p className="mt-1 text-gray-900">{user.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Level</label>
                <p className="mt-1 text-gray-900">{user.level}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">XP</label>
                <p className="mt-1 text-gray-900">{user.xp}</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Bio</label>
            {isEditing ? (
              <textarea
                name="bio"
                rows="3"
                value={editedProfile.bio || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            ) : (
              <p className="mt-1 text-gray-900">{user.profile?.bio || 'No bio yet'}</p>
            )}
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
            <div className="flex flex-wrap gap-2">
              {['Mathematics', 'Science', 'History', 'Literature', 'Technology'].map(interest => (
                <label
                  key={interest}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    isEditing
                      ? 'cursor-pointer'
                      : user.profile?.interests?.includes(interest)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={editedProfile.interests?.includes(interest)}
                      onChange={() => handleInterestChange(interest)}
                      className="sr-only"
                    />
                  ) : null}
                  {interest}
                </label>
              ))}
            </div>
          </div>

          {/* Education */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Education</label>
            {isEditing ? (
              <input
                type="text"
                name="education"
                value={editedProfile.education || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            ) : (
              <p className="mt-1 text-gray-900">{user.profile?.education || 'Not specified'}</p>
            )}
          </div>

          {/* Goals */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Learning Goals</label>
            {isEditing ? (
              <textarea
                name="goals"
                rows="3"
                value={editedProfile.goals || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            ) : (
              <p className="mt-1 text-gray-900">{user.profile?.goals || 'No goals set yet'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 