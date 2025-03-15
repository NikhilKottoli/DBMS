import React, { useState } from 'react';
import { useEffect } from 'react';
import { DatabaseIcon, WalletCards, ArrowUpRight, ArrowDownLeft, History, PiggyBank, BanknoteIcon } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import Input from '../components/Input';
import { use } from 'react';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const [customerId, setCustomerId] = useState(localStorage.getItem('customerId'));
  const [selectedAction, setSelectedAction] = useState(null);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recipientAccount, setrecipientAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [accountId, setAccountId] = useState(localStorage.getItem('accountId'));

  const handleLogout = async () => {
    localStorage.removeItem('customerId');
    setLoading(true);
    window.location.href = '/signin';
  };

  useEffect(() => {
    if (!customerId) {
      window.location.href = '/signin';
    }
    if(!accountId){
      window.location.href = '/profile';
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = `http://localhost:3000/account/${selectedAction}/${accountId}`;
      const data = { amount, recipientAccount };
      const response = await axios.post(endpoint, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('customerId')}` }
      });
      console.log(localStorage.getItem('customerId'));
      
      if (response.data) {
        toast.success(`${selectedAction.charAt(0).toUpperCase() + selectedAction.slice(1)} successful!`);
        setAmount('');
        setrecipientAccount('');
        setSelectedAction(null);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.error);
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Account</label>
            <Input
              type="accountNumber"
              name="recipientAccount"
              placeholder="Enter recipient's Account Number"
              value={recipientAccount}
              onChange={(e) => setrecipientAccount(e.target.value)}
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
    { name: 'withdraw', icon: ArrowUpRight, label: 'Withdraw' },
    { name: 'transfer', icon: ArrowDownLeft, label: 'Transfer' },
    { name: 'deposit', icon: PiggyBank, label: 'Deposit' },
    { name: 'loan', icon: BanknoteIcon, label: 'Apply for Loan' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <Navbar />
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            
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