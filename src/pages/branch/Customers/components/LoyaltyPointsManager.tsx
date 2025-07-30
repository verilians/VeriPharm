import React, { useState, useEffect } from 'react';
import { FiGift, FiMinus, FiPlus, FiClock, FiX } from 'react-icons/fi';
import { useAuthStore } from '../../../../stores/authStore';
import { supabaseAdmin } from '../../../../lib/supabase/supabaseClient';

interface LoyaltyTransaction {
  id: string;
  transaction_type: 'earned' | 'redeemed' | 'expired' | 'adjusted';
  points_amount: number;
  points_balance_before: number;
  points_balance_after: number;
  currency_amount?: number;
  description: string;
  created_at: string;
}

interface LoyaltyPointsManagerProps {
  customerId: string;
  currentPoints: number;
  onPointsUpdate: (newPoints: number) => void;
}

const LoyaltyPointsManager: React.FC<LoyaltyPointsManagerProps> = ({
  customerId,
  currentPoints,
  onPointsUpdate,
}) => {
  const { user } = useAuthStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [pointsAmount, setPointsAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabaseAdmin
        .from('loyalty_transactions')
        .select('*')
        .eq('customer_id', customerId)
        .eq('tenant_id', user?.tenant_id)
        .eq('branch_id', user?.branch_id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching loyalty transactions:', error);
      setError('Failed to load transaction history');
    }
  };

  const handleAddPoints = async () => {
    if (!pointsAmount || !description.trim()) {
      setError('Please fill in all fields');
      return;
    }

    const points = parseInt(pointsAmount);
    if (isNaN(points) || points <= 0) {
      setError('Please enter a valid number of points');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Insert transaction record
      const { error: transactionError } = await supabaseAdmin
        .from('loyalty_transactions')
        .insert({
          tenant_id: user?.tenant_id,
          branch_id: user?.branch_id,
          customer_id: customerId,
          transaction_type: 'adjusted',
          points_amount: points,
          points_balance_before: currentPoints,
          points_balance_after: currentPoints + points,
          description: description.trim(),
          created_by: user?.id,
        });

      if (transactionError) throw transactionError;

      // Update customer's loyalty points
      const { error: customerError } = await supabaseAdmin
        .from('customers')
        .update({ loyalty_points: currentPoints + points })
        .eq('id', customerId);

      if (customerError) throw customerError;

      // Update local state
      onPointsUpdate(currentPoints + points);
      setShowAddModal(false);
      setPointsAmount('');
      setDescription('');
    } catch (error) {
      console.error('Error adding points:', error);
      setError('Failed to add points. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeemPoints = async () => {
    if (!pointsAmount || !description.trim()) {
      setError('Please fill in all fields');
      return;
    }

    const points = parseInt(pointsAmount);
    if (isNaN(points) || points <= 0) {
      setError('Please enter a valid number of points');
      return;
    }

    if (points > currentPoints) {
      setError('Cannot redeem more points than available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Insert transaction record
      const { error: transactionError } = await supabaseAdmin
        .from('loyalty_transactions')
        .insert({
          tenant_id: user?.tenant_id,
          branch_id: user?.branch_id,
          customer_id: customerId,
          transaction_type: 'redeemed',
          points_amount: points,
          points_balance_before: currentPoints,
          points_balance_after: currentPoints - points,
          description: description.trim(),
          created_by: user?.id,
        });

      if (transactionError) throw transactionError;

      // Update customer's loyalty points
      const { error: customerError } = await supabaseAdmin
        .from('customers')
        .update({ loyalty_points: currentPoints - points })
        .eq('id', customerId);

      if (customerError) throw customerError;

      // Update local state
      onPointsUpdate(currentPoints - points);
      setShowRedeemModal(false);
      setPointsAmount('');
      setDescription('');
    } catch (error) {
      console.error('Error redeeming points:', error);
      setError('Failed to redeem points. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned':
        return <FiPlus className="h-4 w-4 text-green-600" />;
      case 'redeemed':
        return <FiMinus className="h-4 w-4 text-red-600" />;
      case 'expired':
        return <FiX className="h-4 w-4 text-orange-600" />;
      case 'adjusted':
        return <FiGift className="h-4 w-4 text-blue-600" />;
      default:
        return <FiGift className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earned':
        return 'text-green-600 bg-green-50';
      case 'redeemed':
        return 'text-red-600 bg-red-50';
      case 'expired':
        return 'text-orange-600 bg-orange-50';
      case 'adjusted':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Points Display */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-4 rounded-lg border border-emerald-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Loyalty Points</h3>
            <p className="text-3xl font-bold text-emerald-600">{currentPoints}</p>
            <p className="text-sm text-gray-600">Available points</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
            >
              <FiPlus className="mr-1 h-4 w-4" />
              Add
            </button>
            <button
              onClick={() => setShowRedeemModal(true)}
              disabled={currentPoints === 0}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiMinus className="mr-1 h-4 w-4" />
              Redeem
            </button>
            <button
              onClick={() => {
                fetchTransactions();
                setShowHistoryModal(true);
              }}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <FiClock className="mr-1 h-4 w-4" />
              History
            </button>
          </div>
        </div>
      </div>

      {/* Add Points Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add Loyalty Points</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points to Add
                  </label>
                  <input
                    type="number"
                    value={pointsAmount}
                    onChange={(e) => setPointsAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter number of points"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter reason for adding points..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddPoints}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Adding...' : 'Add Points'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Redeem Points Modal */}
      {showRedeemModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Redeem Loyalty Points</h3>
                <button
                  onClick={() => setShowRedeemModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points to Redeem (Max: {currentPoints})
                  </label>
                  <input
                    type="number"
                    value={pointsAmount}
                    onChange={(e) => setPointsAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter number of points"
                    min="1"
                    max={currentPoints}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter reason for redeeming points..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowRedeemModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRedeemPoints}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Redeeming...' : 'Redeem Points'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-3/4 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Loyalty Points History</h3>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No transaction history found
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {getTransactionIcon(transaction.transaction_type)}
                          <div>
                            <p className="font-medium text-gray-900">
                              {transaction.description}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(transaction.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getTransactionColor(
                              transaction.transaction_type
                            )}`}
                          >
                            {transaction.transaction_type.toUpperCase()}
                          </span>
                          <p className="text-sm font-medium text-gray-900">
                            {transaction.transaction_type === 'redeemed' ? '-' : '+'}
                            {transaction.points_amount} points
                          </p>
                          <p className="text-xs text-gray-500">
                            Balance: {transaction.points_balance_after}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyPointsManager; 