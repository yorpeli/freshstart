import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Clock, Calendar, XCircle } from 'lucide-react';
import type { StatusChangeModalProps } from '../index';

const StatusChangeModal: React.FC<StatusChangeModalProps> = ({ isOpen, onClose, meeting, onSave }) => {
  const [selectedStatus, setSelectedStatus] = useState(meeting.status);

  useEffect(() => {
    if (isOpen && meeting) {
      setSelectedStatus(meeting.status);
    }
  }, [isOpen, meeting]);

  const statusOptions = [
    {
      value: 'not_scheduled',
      label: 'Not Scheduled',
      icon: Calendar,
      description: 'Meeting needs to be scheduled but is not yet planned',
      color: 'text-gray-600 bg-gray-50'
    },
    {
      value: 'scheduled',
      label: 'Scheduled',
      icon: Clock,
      description: 'Meeting is planned and confirmed',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      value: 'completed',
      label: 'Completed',
      icon: CheckCircle,
      description: 'Meeting has finished',
      color: 'text-green-600 bg-green-50'
    },
    {
      value: 'cancelled',
      label: 'Cancelled',
      icon: XCircle,
      description: 'Meeting has been cancelled',
      color: 'text-red-600 bg-red-50'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(selectedStatus);
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Change Meeting Status</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Status Options */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select New Status
            </label>
            
            {statusOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedStatus === option.value;
              
              return (
                <label
                  key={option.value}
                  className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={isSelected}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="mt-1 mr-3 text-primary-600 focus:ring-primary-500"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Icon className={`h-5 w-5 ${option.color}`} />
                      <span className="font-medium text-gray-900">{option.label}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Update Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StatusChangeModal;
