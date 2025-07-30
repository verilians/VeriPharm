import React from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  details?: string[];
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  type,
  title,
  message,
  details,
  onClose,
  onConfirm,
  confirmText = "OK",
  cancelText = "Cancel",
  showCancel = false
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          titleColor: 'text-green-800',
          confirmBg: 'bg-green-600 hover:bg-green-700'
        };
      case 'error':
        return {
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          confirmBg: 'bg-red-600 hover:bg-red-700'
        };
      case 'warning':
        return {
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          confirmBg: 'bg-yellow-600 hover:bg-yellow-700'
        };
      case 'info':
      default:
        return {
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          confirmBg: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full relative">
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className={`w-12 h-12 ${styles.iconBg} rounded-full flex items-center justify-center flex-shrink-0 ${styles.iconColor}`}>
              {getIcon()}
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${styles.titleColor} mb-2`}>
                {title}
              </h3>
              <p className="text-gray-700 mb-4">
                {message}
              </p>
              {details && details.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">Details:</h4>
                  <ul className="space-y-1">
                    {details.map((detail, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        • {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end space-x-3">
          {showCancel && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition duration-150"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm || onClose}
            className={`px-4 py-2 text-white ${styles.confirmBg} rounded-lg font-medium transition duration-150`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
