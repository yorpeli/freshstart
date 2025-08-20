import React from 'react';
import { AlertTriangle, XCircle, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { getValidationSummary } from './templateValidation';
import type { ValidationResult, ValidationError } from './templateValidation';

interface ValidationPanelProps {
  validation: ValidationResult;
  className?: string;
  onErrorClick?: (error: ValidationError) => void;
}

const ValidationPanel: React.FC<ValidationPanelProps> = ({
  validation,
  className = '',
  onErrorClick
}) => {
  const getErrorIcon = (type: ValidationError['type']) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getErrorStyles = (type: ValidationError['type']) => {
    switch (type) {
      case 'error':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'warning':
        return 'border-amber-200 bg-amber-50 text-amber-800';
      case 'info':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const allIssues = [...validation.errors, ...validation.warnings];

  if (validation.isValid && validation.warnings.length === 0) {
    return (
      <div className={`border border-green-200 bg-green-50 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">
            Template Valid
          </span>
        </div>
        <p className="text-sm text-green-700 mt-1">
          Your template is ready to use with no issues detected.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Summary */}
      <div className={`border rounded-lg p-4 ${
        validation.errors.length > 0 
          ? 'border-red-200 bg-red-50' 
          : 'border-amber-200 bg-amber-50'
      }`}>
        <div className="flex items-center gap-2">
          {validation.errors.length > 0 ? (
            <XCircle className="h-4 w-4 text-red-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          )}
          <span className={`text-sm font-medium ${
            validation.errors.length > 0 ? 'text-red-800' : 'text-amber-800'
          }`}>
            Validation Summary
          </span>
        </div>
        <p className={`text-sm mt-1 ${
          validation.errors.length > 0 ? 'text-red-700' : 'text-amber-700'
        }`}>
          {getValidationSummary(validation)}
        </p>
      </div>

      {/* Issues List */}
      {allIssues.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Issues to Address:</h4>
          
          <div className="space-y-2">
            {allIssues.map((issue, index) => (
              <div
                key={index}
                className={`border rounded-lg p-3 cursor-pointer hover:opacity-80 transition-opacity ${getErrorStyles(issue.type)}`}
                onClick={() => onErrorClick?.(issue)}
              >
                <div className="flex items-start gap-2">
                  {getErrorIcon(issue.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {issue.field.charAt(0).toUpperCase() + issue.field.slice(1).replace('_', ' ')}
                      </span>
                      {issue.sectionIndex !== undefined && (
                        <span className="text-xs px-2 py-0.5 bg-white bg-opacity-50 rounded">
                          Section {issue.sectionIndex + 1}
                        </span>
                      )}
                    </div>
                    <p className="text-sm opacity-90 mt-1">
                      {issue.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Fix Suggestions */}
      {validation.errors.length > 0 && (
        <div className="border border-blue-200 bg-blue-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Quick Fixes</span>
          </div>
          <ul className="text-sm text-blue-700 space-y-1">
            {validation.errors.some(e => e.field === 'section') && (
              <li>• Add descriptive names to all agenda sections</li>
            )}
            {validation.errors.some(e => e.field === 'time_minutes') && (
              <li>• Set valid time allocations for all sections (1-180 minutes)</li>
            )}
            {validation.errors.some(e => e.field === 'agenda_sections') && (
              <li>• Add at least one agenda section to structure your meeting</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ValidationPanel;