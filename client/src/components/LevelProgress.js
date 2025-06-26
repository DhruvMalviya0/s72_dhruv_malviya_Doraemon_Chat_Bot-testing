import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';

const LevelProgress = ({ xp, level, username }) => {
  const calculateNextLevelXP = (currentLevel) => {
    return Math.pow(currentLevel + 1, 2) * 100;
  };

  const currentLevelXP = Math.pow(level, 2) * 100;
  const nextLevelXP = calculateNextLevelXP(level);
  const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{username}</h3>
          <div className="flex items-center">
            <StarIcon className="w-5 h-5 text-yellow-400 mr-1" />
            <span className="text-sm text-gray-600">Level {level}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-primary">{xp}</span>
          <p className="text-sm text-gray-600">XP</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-primary h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* XP Info */}
      <div className="mt-2 flex justify-between text-sm text-gray-600">
        <span>{currentLevelXP} XP</span>
        <span>{nextLevelXP} XP</span>
      </div>

      {/* Badges */}
      <div className="mt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Badges</h4>
        <div className="flex space-x-2">
          {level >= 5 && (
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <StarIcon className="w-5 h-5 text-white" />
            </div>
          )}
          {level >= 10 && (
            <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
              <StarIcon className="w-5 h-5 text-white" />
            </div>
          )}
          {level >= 20 && (
            <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center">
              <StarIcon className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LevelProgress; 