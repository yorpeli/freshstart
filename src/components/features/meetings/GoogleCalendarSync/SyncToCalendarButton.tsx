import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useGoogleCalendarSync } from '../../../../hooks/useGoogleCalendarSync';

interface SyncToCalendarButtonProps {
  meetingId: number;
  isAlreadySynced?: boolean;
  googleEventId?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'icon' | 'text';
}

export const SyncToCalendarButton: React.FC<SyncToCalendarButtonProps> = ({
  meetingId,
  isAlreadySynced = false,
  googleEventId,
  className = '',
  size = 'md',
  variant = 'button'
}) => {
  const { syncMeeting, getSyncStatus, clearSyncStatus, initializeMeetingSyncStatus } = useGoogleCalendarSync();
  const [isHovered, setIsHovered] = useState(false);
  
  // Initialize sync status from database when component mounts
  useEffect(() => {
    initializeMeetingSyncStatus(meetingId);
  }, [meetingId, initializeMeetingSyncStatus]);
  
  const syncStatus = getSyncStatus(meetingId);
  const isSyncing = syncStatus.status === 'syncing';
  const isSuccess = syncStatus.status === 'success';
  const isError = syncStatus.status === 'error';

  const handleSync = async () => {
    if (isSyncing) return;
    
    try {
      await syncMeeting(meetingId);
    } catch (error) {
      console.error('Failed to sync meeting:', error);
    }
  };

  const handleRetry = () => {
    clearSyncStatus(meetingId);
    handleSync();
  };

  const getButtonText = () => {
    // Check if meeting is already synced (either from prop or local state)
    const isSynced = isAlreadySynced || (isSuccess && !!syncStatus.googleEventId);
    
    if (isSynced) return 'Synced';
    if (isSyncing) return 'Syncing...';
    if (isSuccess) return 'Synced!';
    if (isError) return 'Retry';
    return 'Sync';
  };

  const getIcon = () => {
    // Check if meeting is already synced (either from prop or local state)
    const isSynced = isAlreadySynced || (isSuccess && !!syncStatus.googleEventId);
    
    if (isSynced) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (isSyncing) return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
    if (isSuccess) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (isError) return <AlertCircle className="h-4 w-4 text-red-600" />;
    return <Calendar className="h-4 w-4" />;
  };

  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center gap-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    // Check if meeting is already synced (either from prop or local state)
    const isSynced = isAlreadySynced || (isSuccess && !!syncStatus.googleEventId);
    
    if (isSynced) {
      return `${baseClasses} text-green-700 bg-green-50 hover:bg-green-100 focus:ring-green-500`;
    }
    
    if (isSyncing) {
      return `${baseClasses} text-blue-700 bg-blue-50 cursor-not-allowed focus:ring-blue-500`;
    }
    
    if (isSuccess) {
      return `${baseClasses} text-green-700 bg-green-50 hover:bg-green-100 focus:ring-green-500`;
    }
    
    if (isError) {
      return `${baseClasses} text-red-700 bg-red-50 hover:bg-red-100 focus:ring-red-500`;
    }
    
    return `${baseClasses} text-gray-700 bg-gray-50 hover:bg-gray-100 focus:ring-gray-500`;
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs rounded';
      case 'lg':
        return 'px-4 py-2 text-base rounded-lg';
      default:
        return 'px-3 py-1.5 text-sm rounded-md';
    }
  };

  // Icon-only variant
  if (variant === 'icon') {
    const isSynced = isAlreadySynced || (isSuccess && !!syncStatus.googleEventId);
    
    return (
      <button
        onClick={isError ? handleRetry : handleSync}
        disabled={isSyncing || isSynced}
        className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isSynced
            ? 'text-green-600 hover:bg-green-50 focus:ring-green-500'
            : isSyncing
            ? 'text-blue-600 bg-blue-50 cursor-not-allowed focus:ring-blue-500'
            : isSuccess
            ? 'text-green-600 hover:bg-green-50 focus:ring-green-500'
            : isError
            ? 'text-red-600 hover:bg-red-50 focus:ring-red-500'
            : 'text-gray-600 hover:bg-gray-50 focus:ring-gray-500'
        } ${className}`}
        title={getButtonText()}
      >
        {getIcon()}
      </button>
    );
  }

  // Text-only variant
  if (variant === 'text') {
    const isSynced = isAlreadySynced || (isSuccess && !!syncStatus.googleEventId);
    
    return (
      <button
        onClick={isError ? handleRetry : handleSync}
        disabled={isSyncing || isSynced}
        className={`${getButtonClasses()} ${getSizeClasses()} ${className}`}
      >
        {getIcon()}
        <span>{getButtonText()}</span>
      </button>
    );
  }

  // Default button variant
  const isSynced = isAlreadySynced || (isSuccess && !!syncStatus.googleEventId);
  
  return (
    <button
      onClick={isError ? handleRetry : handleSync}
      disabled={isSyncing || isSynced}
      className={`${getButtonClasses()} ${getSizeClasses()} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {getIcon()}
      <span>{getButtonText()}</span>
      
      {/* Tooltip for synced meetings */}
      {isSynced && isHovered && (
        <div className="absolute z-10 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg -top-8 left-1/2 transform -translate-x-1/2">
          Already synced to Google Calendar
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </button>
  );
};
