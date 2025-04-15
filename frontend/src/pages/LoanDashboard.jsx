import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LoanDashboard = () => {
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [borrowerDetails, setBorrowerDetails] = useState(null);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    // Fetch all loans on component mount
    const fetchLoans = async () => {
      try {
        const response = await axios.get('http://localhost:3000/loans');
        setLoans(response.data);
      } catch (error) {
        console.error('Error fetching loans:', error);
      }
    };

    fetchLoans();
  }, []);

  const handleLoanClick = async (loan) => {
    setSelectedLoan(loan);
    try {
      const response = await axios.get(`http://localhost:3000/user/getUser/${loan.userId}`);
      setBorrowerDetails(response.data.data.user);
    } catch (error) {
      console.error('Error fetching borrower details:', error);
    }
  };

  const handleApprove = () => {
    // Implement approve logic here
    console.log('Approved loan:', selectedLoan.id, 'Remarks:', remarks);
  };

  const handleDisapprove = () => {
    // Implement disapprove logic here
    console.log('Disapproved loan:', selectedLoan.id, 'Remarks:', remarks);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Loan Management Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Loans Table */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">All Loans</h2>
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Loan ID</th>
                <th className="py-3 px-6 text-left">Amount</th>
                <th className="py-3 px-6 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {loans.map((loan) => (
                <tr
                  key={loan.id}
                  onClick={() => handleLoanClick(loan)}
                  className="border-b border-gray-200 hover:bg-gray-100 cursor-pointer"
                >
                  <td className="py-3 px-6 text-left">{loan.id}</td>
                  <td className="py-3 px-6 text-left">{loan.amount}</td>
                  <td className="py-3 px-6 text-left">{loan.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Borrower Details */}
        {selectedLoan && borrowerDetails && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Borrower Details</h2>
            <div className="mb-4">
              <p><span className="font-semibold">Name:</span> {borrowerDetails.first_name} {borrowerDetails.last_name}</p>
              <p><span className="font-semibold">Email:</span> {borrowerDetails.email}</p>
              <p><span className="font-semibold">Role:</span> {borrowerDetails.role_type}</p>
              <p><span className="font-semibold">Created At:</span> {new Date(borrowerDetails.created_at).toLocaleDateString()}</p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="remarks">
                Remarks
              </label>
              <input
                id="remarks"
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                placeholder="Enter remarks here..."
              />
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleApprove}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                Approve
              </button>
              <button
                onClick={handleDisapprove}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Disapprove
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanDashboard;
