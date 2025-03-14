import React, { useState } from 'react';
import { useEffect } from 'react';
import { DatabaseIcon, WalletCards, ArrowUpRight, ArrowDownLeft, History, PiggyBank, BanknoteIcon } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import Input from '../components/Input';

const Dashboard = () => {
  const [customerId, setCustomerId] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const id = localStorage.getItem('customerId'); 
    if (id) {
      setCustomerId(id); 
    }
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('token');
    setLoading(true);
    window.location.href = '/signin';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = `http://localhost:4000/${selectedAction}`;
      const data = { amount, recipientEmail };
      const response = await axios.post(endpoint, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.data) {
        toast.success(`${selectedAction.charAt(0).toUpperCase() + selectedAction.slice(1)} successful!`);
        setAmount('');
        setRecipientEmail('');
        setSelectedAction(null);
      }
    } catch (error) {
      toast.error('Transaction failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderForm = () => {
    if (!selectedAction) return null;

    return (
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {selectedAction === 'transfer' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Email</label>
            <Input
              type="email"
              name="recipientEmail"
              placeholder="Enter recipient's email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
          <Input
            type="number"
            name="amount"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <Button type="submit" isLoading={isLoading}>
          Confirm {selectedAction}
        </Button>
      </form>
    );
  };

  const actions = [
    { name: 'transactions', icon: History, label: 'Transaction History' },
    { name: 'withdraw', icon: ArrowUpRight, label: 'Withdraw' },
    { name: 'transfer', icon: ArrowDownLeft, label: 'Transfer' },
    { name: 'deposit', icon: PiggyBank, label: 'Deposit' },
    { name: 'loan', icon: BanknoteIcon, label: 'Apply for Loan' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <DatabaseIcon className="w-10 h-10 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">StreamQuery</h1>
          </div>
          <div className="flex items-center gap-3">
            <WalletCards className="w-6 h-6 text-blue-600" />
            <span className="text-lg font-semibold text-gray-700">Balance: $10,000</span>
            <button
                onClick={handleLogout}
                disabled={loading}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300 disabled:opacity-50"
                >
                {loading ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {actions.map((action) => (
            <div
              key={action.name}
              className={`bg-white rounded-xl shadow-md p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedAction === action.name ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedAction(action.name)}
            >
              <div className="flex items-center gap-4">
                <action.icon className="w-8 h-8 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">{action.label}</h2>
              </div>
              {selectedAction === action.name && renderForm()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;