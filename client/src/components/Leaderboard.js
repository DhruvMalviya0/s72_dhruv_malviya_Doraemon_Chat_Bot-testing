import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  TrophyIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  UserCircleIcon,
  AcademicCapIcon,
  StarIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import axiosInstance from '../utils/axios';

// Add medal icons
const MEDAL_ICONS = {
  'Gold Medal': '🥇',
  'Silver Medal': '🥈',
  'Bronze Medal': '🥉'
};

const Leaderboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [leaderboardData, setLeaderboardData] = useState({
    users: [],
    pagination: {
      total: 0,
      pages: 0,
      currentPage: 1,
      hasMore: false
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeframe, setTimeframe] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const timeframes = [
    { value: 'all', label: 'All Time' },
    { value: 'monthly', label: 'This Month' },
    { value: 'weekly', label: 'This Week' },
    { value: 'daily', label: 'Today' }
  ];

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      console.log('Token:', token);
      
      if (!token) {
        setError('Please log in to view the leaderboard');
        return;
      }

      console.log('Fetching leaderboard with params:', {
        timeframe,
        page: currentPage,
        limit: 10
      });

      const response = await axiosInstance.get('/api/leaderboard', {
        params: {
          timeframe,
          page: currentPage,
          limit: 10
        }
      });

      console.log('Leaderboard response:', response.data);

      if (!response.data || !response.data.users) {
        console.warn('Invalid response format:', response.data);
        setLeaderboardData({
          users: [],
          pagination: {
            total: 0,
            pages: 0,
            currentPage: 1,
            hasMore: false
          }
        });
        setError('Invalid response format from server');
        return;
      }

      setLeaderboardData(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      if (error.response?.status === 401) {
        const token = localStorage.getItem('token');
        console.log('Current token:', token);
        setError('Session expired. Please log in again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        setError('Failed to load leaderboard. Please try again.');
      }
      
      setLeaderboardData({
        users: [],
        pagination: {
          total: 0,
          pages: 0,
          currentPage: 1,
          hasMore: false
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setError('Please log in to view the leaderboard');
      return;
    }
    fetchLeaderboard();
  }, [timeframe, currentPage, isAuthenticated]);

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const getRankStyle = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-400 text-white';
      case 2:
        return 'bg-gray-400 text-white';
      case 3:
        return 'bg-amber-600 text-white';
      default:
        return 'bg-primary text-white';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <ExclamationCircleIcon className="w-12 h-12 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900">Authentication Required</h2>
            <p className="text-gray-600">Please log in to view the leaderboard</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <TrophyIcon className="w-8 h-8 text-yellow-400" />
            <h2 className="text-2xl font-bold text-gray-900">Leaderboard</h2>
          </div>
          
          {/* Timeframe filters */}
          <div className="flex space-x-2">
            {timeframes.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleTimeframeChange(value)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  timeframe === value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard table */}
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  XP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Badges
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaderboardData.users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${getRankStyle(user.rank)}`}>
                      {user.rank}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <UserCircleIcon className="w-10 h-10 text-gray-400" />
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <AcademicCapIcon className="w-5 h-5 text-primary mr-2" />
                      <span className="text-sm text-gray-900">Level {user.level}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">
                      {user.xp.toLocaleString()} XP
                    </div>
                    {user.quizStats && (
                      <div className="text-xs text-gray-500">
                        {user.quizStats.totalQuizzes} Quizzes Completed
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      {user.medal && (
                        <div
                          className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center"
                          title={user.medal.name}
                        >
                          <span className="text-xl">{user.medal.icon}</span>
                        </div>
                      )}
                      {user.badges?.slice(0, 3).map((badge, index) => (
                        <div
                          key={index}
                          className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center"
                          title={badge.name}
                        >
                          {badge.icon ? (
                            <span className="text-xl">{badge.icon}</span>
                          ) : (
                            <StarIcon className="w-5 h-5 text-yellow-400" />
                          )}
                        </div>
                      ))}
                      {user.badges?.length > 3 && (
                        <div className="text-sm text-gray-500">
                          +{user.badges.length - 3}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {leaderboardData.pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${
                  currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              
              {Array.from({ length: leaderboardData.pagination.pages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 ||
                  page === leaderboardData.pagination.pages ||
                  Math.abs(page - currentPage) <= 1
                )
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded-lg ${
                        currentPage === page
                          ? 'bg-primary text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!leaderboardData.pagination.hasMore}
                className={`p-2 rounded-lg ${
                  !leaderboardData.pagination.hasMore
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * 10) + 1} to{' '}
              {Math.min(currentPage * 10, leaderboardData.pagination.total)} of{' '}
              {leaderboardData.pagination.total} users
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard; 