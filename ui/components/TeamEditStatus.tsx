import React from 'react';

interface TeamEditStatusProps {
  onEditClick: () => void;
  deadline: Date;
}

export default function TeamEditStatus({ onEditClick, deadline }: TeamEditStatusProps) {
  const isDeadlinePassed = new Date() > deadline;
  
  const getTimeRemaining = () => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    
    if (diff <= 0) return 'Deadline passed';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days}d ${hours}h ${minutes}m remaining`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Team Editing Status:
          </span>
          <span className={`text-sm ${isDeadlinePassed ? 'text-red-500' : 'text-green-500'}`}>
            {isDeadlinePassed ? 'Closed' : 'Open'}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            {getTimeRemaining()}
          </span>
          <button
            onClick={onEditClick}
            disabled={isDeadlinePassed}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isDeadlinePassed
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Edit Team
          </button>
        </div>
      </div>
    </div>
  );
} 