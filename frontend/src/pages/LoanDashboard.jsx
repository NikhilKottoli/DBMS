import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const ApplyLoan = () => {
  const [amount, setAmount] = useState('');
  const [myLoans, setMyLoans] = useState([]);
  const [allLoans, setAllLoans] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('apply');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isApproving, setIsApproving] = useState(null);

  const accountId = localStorage.getItem('accountId');
  const customerId = localStorage.getItem('customerId');
  
  // Check if user is admin (simplified, adjust according to your auth system)
  useEffect(() => {
    const userRole = localStorage.getItem('admin');
    if (userRole) {
      setIsAdmin(userRole === 'true');
    }
  }, []);

  // Fetch user loans
  const fetchMyLoans = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:3000/account/getMyLoans/${accountId}`);
      setMyLoans(response.data.data.loans);
    } catch (error) {
      console.error('Error fetching loans:', error);
      setMessage({ text: 'Failed to fetch your loans', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all loans (for admin only)
  const fetchAllLoans = async () => {
    if (!isAdmin) return;
    
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:3000/account/getLoans/${accountId}`);
      setAllLoans(response.data.data.loans);
    } catch (error) {
      console.error('Error fetching all loans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply for a new loan
  const handleApplyLoan = async (e) => {
    e.preventDefault();
    
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setMessage({ text: 'Please enter a valid amount', type: 'error' });
      return;
    }
    
    try {
      setIsLoading(true);
      await axios.post(`http://localhost:3000/account/loan/${accountId}`, { 
        amount: parseFloat(amount),
      });
      
      setMessage({ text: 'Loan application submitted successfully!', type: 'success' });
      setAmount('');
      await fetchMyLoans();
      setActiveTab('myLoans');
    } catch (error) {
      console.error('Error applying for loan:', error);
      setMessage({ text: 'Failed to submit loan application', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Approve a loan (admin only)
  const handleApproveLoan = async (loanId) => {
    if (!isAdmin) return;
    
    try {
      setIsApproving(loanId);
      await axios.post(`http://localhost:3000/account/approveLoan/${accountId}`, {
        loanId,
      });
      setMessage({ text: 'Loan approved successfully!', type: 'success' });
      await fetchAllLoans();
    } catch (error) {
      console.error('Error approving loan:', error);
      setMessage({ text: 'Failed to approve loan', type: 'error' });
    } finally {
      setIsApproving(null);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchMyLoans();
    
    if (isAdmin) {
      fetchAllLoans();
    }
  }, [isAdmin]);

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge class based on loan status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'defaulted':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8 transition-all duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8">
            <h1 className="text-3xl font-extrabold text-white tracking-tight animate-fade-in">
              Loan Management System
            </h1>
            <p className="mt-2 text-blue-100">
              Account ID: <span className="font-medium">{accountId}</span>
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('apply')}
                className={`${
                  activeTab === 'apply'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } transition duration-300 ease-in-out whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                Apply for Loan
              </button>
              <button
                onClick={() => {
                  setActiveTab('myLoans');
                  fetchMyLoans();
                }}
                className={`${
                  activeTab === 'myLoans'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } transition duration-300 ease-in-out whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                My Loans
              </button>
              {isAdmin && (
                <button
                  onClick={() => {
                    setActiveTab('allLoans');
                    fetchAllLoans();
                  }}
                  className={`${
                    activeTab === 'allLoans'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } transition duration-300 ease-in-out whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
                >
                  All Loans (Admin)
                </button>
              )}
            </nav>
          </div>

          {/* Message Alert */}
          {message.text && (
            <div 
              className={`${
                message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              } px-4 py-3 mx-6 mt-6 rounded-lg shadow-sm border ${
                message.type === 'success' ? 'border-green-200' : 'border-red-200'
              } flex items-center justify-between animate-fade-in`}
            >
              <p>{message.text}</p>
              <button
                onClick={() => setMessage({ text: '', type: '' })}
                className="focus:outline-none"
              >
                <span className="text-sm">×</span>
              </button>
            </div>
          )}

          {/* Apply Loan Form */}
          {activeTab === 'apply' && (
            <div className="px-6 py-6 animate-fade-in">
              <form onSubmit={handleApplyLoan} className="space-y-6">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    Loan Amount (Rs)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">Rs</span>
                    </div>
                    <input
                      type="number"
                      name="amount"
                      id="amount"
                      min="0"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md transition-all duration-300"
                      placeholder="0.00"
                      aria-describedby="price-currency"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm" id="price-currency">
                        INR
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ${
                      isLoading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Apply for Loan'
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900">Loan Information</h3>
                <div className="mt-5 bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start">
                      <svg className="flex-shrink-0 h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p className="ml-3 text-gray-700">Competitive interest rates starting at 5.99% APR</p>
                    </li>
                    <li className="flex items-start">
                      <svg className="flex-shrink-0 h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p className="ml-3 text-gray-700">Fast approval process, get funds within 24 hours</p>
                    </li>
                    <li className="flex items-start">
                      <svg className="flex-shrink-0 h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p className="ml-3 text-gray-700">Flexible repayment terms from 12 to 60 months</p>
                    </li>
                    <li className="flex items-start">
                      <svg className="flex-shrink-0 h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p className="ml-3 text-gray-700">No early repayment fees</p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* My Loans */}
          {activeTab === 'myLoans' && (
            <div className="px-6 py-6 animate-fade-in">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">My Loans</h2>
              
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : myLoans.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No loans found</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by applying for your first loan.</p>
                  <div className="mt-6">
                    <button
                      onClick={() => setActiveTab('apply')}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              ) : (
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Loan ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Start Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {myLoans?.map((loan) => (
                        <tr key={loan.loan_id} className="hover:bg-gray-50 transition-all duration-200">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{loan.loan_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${parseFloat(loan.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(loan.status)}`}>
                              {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(loan.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {loan.start_date ? formatDate(loan.start_date) : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* All Loans (Admin Only) */}
          {activeTab === 'allLoans' && isAdmin && (
            <div className="px-6 py-6 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">All Loans (Admin View)</h2>
                <button
                  onClick={fetchAllLoans}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
                >
                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : allLoans.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No loans found</h3>
                  <p className="mt-1 text-sm text-gray-500">There are no loan applications in the system.</p>
                </div>
              ) : (
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Loan ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Account ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allLoans.map((loan) => (
                        <tr key={loan.loan_id} className="hover:bg-gray-50 transition-all duration-200">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{loan.loan_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{loan.account_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${parseFloat(loan.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(loan.status)}`}>
                              {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(loan.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {loan.status === 'pending' && (
                              <button
                                onClick={() => handleApproveLoan(loan.loan_id)}
                                disabled={isApproving === loan.loan_id}
                                className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 ${
                                  isApproving === loan.loan_id ? 'opacity-75 cursor-not-allowed' : ''
                                }`}
                              >
                                {isApproving === loan.loan_id ? (
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  "Approve"
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Need help? Contact our support team at support@bank.com</p>
        </div>
      </div>
    </div>
    </>
  );
};

export default ApplyLoan;