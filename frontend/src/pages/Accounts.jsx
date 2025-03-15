import React, { useEffect, useState } from 'react';
import { DatabaseIcon, Wallet, PiggyBank, Building2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import Input from '../components/Input';
import Navbar from '../components/Navbar';

const Accounts = () => {
  
  const [isLoading, setIsLoading] = useState(false);
  const [customer_id, setCustomerId] = useState(localStorage.getItem('customerId'));
  const [formData, setFormData] = useState({
    customer_id,
    account_type: '',
    balance: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    setCustomerId(localStorage.getItem('customerId'));
    if (!customer_id) {
        window.location.href = '/signin';
    }
    }, [customer_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.account_type) {
      toast.error('Please select an account type');
      return;
    }
    if (parseFloat(formData.balance) < 1000) {
      toast.error('Minimum initial deposit is $1,000');
      return;
    }

    const updatedFormData = {
        ...formData,
        customer_id
    };
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/account/openAccount', updatedFormData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.data) {
        toast.success('Account created successfully!');
        localStorage.setItem('accountId', response.data.accountId);
        setFormData({
          account_type: '',
          balance: ''
        });
        window.location.href = '/dashboard';
      }
    } catch (error) {
      toast.error('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const account_types = [
    {
      type: 'savings',
      title: 'Savings Account',
      icon: PiggyBank,
      description: 'Earn interest on your savings with our competitive rates',
      benefits: [
        'Higher interest rates',
        'No minimum balance fees',
        'Free digital banking',
        'Quarterly interest payouts'
      ]
    },
    {
      type: 'current',
      title: 'Current Account',
      icon: Building2,
      description: 'Perfect for daily transactions and business operations',
      benefits: [
        'Unlimited transactions',
        'Free checkbook',
        'Business banking support',
        'Overdraft facility available'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <Navbar />
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {account_types.map((account) => (
            <div
              key={account.type}
              className={`bg-white rounded-xl shadow-md p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                formData.account_type === account.type ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setFormData(prev => ({ ...prev, account_type: account.type }))}
            >
              <div className="flex items-center gap-4 mb-4">
                <account.icon className="w-8 h-8 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">{account.title}</h2>
              </div>
              <p className="text-gray-600 mb-4">{account.description}</p>
              <ul className="space-y-2">
                {account.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-700">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Initial Deposit</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (Minimum $1,000)
              </label>
              <Input
                type="number"
                name="balance"
                placeholder="Enter initial deposit amount"
                value={formData.balance}
                onChange={handleChange}
              />
            </div>
            <Button type="submit" isLoading={isLoading}>
              Open Account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Accounts;