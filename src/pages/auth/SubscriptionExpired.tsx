const SubscriptionExpired: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-sm w-full text-center">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Subscription Expired</h1>
          <p className="text-sm text-gray-600 mb-4">
            Your subscription has expired. Please renew your subscription to continue using VeriPharm.
          </p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionExpired;
