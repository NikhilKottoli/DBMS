import React, { useState, useEffect } from 'react';
import { DatabaseIcon, User as UserIcon, CreditCard, History, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const User = () => {
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [customer_id, setCustomerId] = useState(localStorage.getItem('customerId'));
    const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/user/getUser/${customer_id}`);        
        
        console.log(response.data);
        if (response.data.status === "success") {
          if(response.data.data.accounts.length === 0){
            window.location.href = '/accounts';
          }
          setUserData(response.data.data);
        }
      } catch (error) {
        toast.error('Failed to fetch user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-blue-600 text-xl">Loading...</div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleAccountSelect = (accountId) => {
    localStorage.setItem('accountId', accountId);
    navigate('/dashboard');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <Navbar />
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          
        </div>

        {userData && (
          <div className="space-y-6">
            {/* User Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-blue-100 p-3 rounded-full">
                  <UserIcon className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{userData.user.name}</h2>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-gray-600">Email</p>
                  <p className="font-medium">{userData.user.email}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600">Joined On</p>
                  <p className="font-medium">{formatDate(userData.user.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Accounts Section */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold">Your Accounts</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                  {userData.accounts.map((account) => (
                      <div
                          key={account.account_id}
                          className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition"
                          onClick={() => handleAccountSelect(account.account_id)}
                      >
                          <div className="flex justify-between items-center mb-2">
                              <h3 className="font-semibold">{account.account_type.toUpperCase()} Account</h3>
                              <span className="text-sm text-gray-500">#{account.account_number}</span>
                          </div>
                          <div className="space-y-2">
                              <p className="text-2xl font-bold text-blue-600">
                                  {formatCurrency(account.balance)}
                              </p>
                              <p className="text-sm text-gray-600">
                                  Opened on {formatDate(account.created_at)}
                              </p>
                          </div>
                      </div>
                  ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <History className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold">Recent Transactions</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-200">
                      <th className="pb-3 px-4">Date</th>
                      <th className="pb-3 px-4">Type</th>
                      <th className="pb-3 px-4">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userData.transactions.map((transaction) => (
                      <tr key={transaction.transaction_id} className="border-b border-gray-100">
                        <td className="py-3 px-4">{formatDate(transaction.transaction_date)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {transaction.transaction_type === 'withdraw' && (
                              <ArrowDownLeft className="w-4 h-4 text-red-500" />
                            )}
                            {transaction.transaction_type === 'deposit' && (
                              <ArrowUpRight className="w-4 h-4 text-green-500" />
                            )}
                            {transaction.transaction_type === 'transfer' && (
                              <ArrowRightLeft className="w-4 h-4 text-blue-500" />
                            )}
                            {transaction.transaction_type.charAt(0).toUpperCase() + transaction.transaction_type.slice(1)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {formatCurrency(transaction.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default User;