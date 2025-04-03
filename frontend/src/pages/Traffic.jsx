import React, { useState, useEffect } from 'react';
import { Gauge, Server, ArrowRight, BarChart } from 'lucide-react';
import axios from 'axios';
const ServerMonitor = () => {
  // Server states
  const [server1Status, setServer1Status] = useState('checking');
  const [server2Status, setServer2Status] = useState('checking');
  
  // Request history
  const [requests, setRequests] = useState([]);
  const [requestCount, setRequestCount] = useState(1);
  
  // Visualization state
  const [server1Metrics, setServer1Metrics] = useState({ total: 0, success: 0 });
  const [server2Metrics, setServer2Metrics] = useState({ total: 0, success: 0 });
  
  // Simulate checking server status
  useEffect(() => {
    const checkServers = async () => {
      try {
        const res = await axios.get('http://localhost:3000/');
        setServer1Status(res.status === 200 ? 'running' : 'down');
      } catch (error) {
        setServer1Status('down'); // Handle failure
      }

      try {
        const res2 = await axios.get('http://localhost:3010/');
        setServer2Status(res2.status === 200 ? 'running' : 'down');
      } catch (error) {
        setServer2Status('down'); // Handle failure
      }
    };

    checkServers();
  }, []);
  
  const handleRequest = async (type) => {
    const newRequests = [];
    
    for (let i = 0; i < requestCount; i++) {
      const targetPort = type === 'read' ? 3000 : 3010;
      const targetServer = type === 'read' ? 1 : 2;
      const targetUrl = type === 'read' 
        ? 'http://localhost:3000/user/getUser' 
        : 'http://localhost:3010/account/openAccount';
      
      // Create a new request object
      const newRequest = {
        id: Date.now() + i,
        type,
        targetPort,
        targetUrl,
        timestamp: new Date().toLocaleTimeString(),
        status: 'pending',
        targetServer
      };
      
      newRequests.push(newRequest);
      
      try {
        const response = await fetch(targetUrl, {
          method: type === 'read' ? 'GET' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: type === 'write' ? JSON.stringify({ timestamp: Date.now() }) : undefined
        });
        
        const success = response.ok;
        
        // Update the request status
        newRequest.status = success ? 'success' : 'failed';
        
        // Update metrics
        if (targetServer === 1) {
          setServer1Metrics(prev => ({
            total: prev.total + 1,
            success: prev.success + (success ? 1 : 0)
          }));
        } else {
          setServer2Metrics(prev => ({
            total: prev.total + 1,
            success: prev.success + (success ? 1 : 0)
          }));
        }
      } catch (error) {
        newRequest.status = 'failed';
        
        if (targetServer === 1) {
          setServer1Metrics(prev => ({
            total: prev.total + 1,
            success: prev.success
          }));
        } else {
          setServer2Metrics(prev => ({
            total: prev.total + 1,
            success: prev.success
          }));
        }
      }
    }
    
    // Update request history (keep only the last 20)
    setRequests(prev => [...newRequests, ...prev].slice(0, 20));
  };
  
  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Server Load Balancer Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Server 1 */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Read Server (Port 3000)</h2>
            <div className={`px-2 py-1 rounded ${
              server1Status === 'running' ? 'bg-green-100 text-green-800' : 
              server1Status === 'down' ? 'bg-red-100 text-red-800' : 
              'bg-gray-100 text-gray-800'
            }`}>
              {server1Status}
            </div>
          </div>
          
          <div className="flex justify-center mb-4">
            <Server 
              size={64} 
              className={`${
                server1Status === 'running' ? 'text-green-500' : 
                server1Status === 'down' ? 'text-red-500' : 
                'text-gray-400'
              }`} 
            />
          </div>
          
          <div className="text-center text-sm mt-2">
            <div>Requests: {server1Metrics.total}</div>
            <div>Success Rate: {server1Metrics.total ? Math.round((server1Metrics.success / server1Metrics.total) * 100) : 0}%</div>
          </div>
        </div>
        
        {/* Load Balancer */}
        <div className="border rounded-lg p-4 flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold mb-4">Load Balancer</h2>
          <div className="flex items-center justify-center mb-4">
            <Gauge size={64} className="text-blue-500" />
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div>READ → Port 3000</div>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div>WRITE → Port 3010</div>
          </div>
        </div>
        
        {/* Server 2 */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Write Server (Port 3010)</h2>
            <div className={`px-2 py-1 rounded ${
              server2Status === 'running' ? 'bg-green-100 text-green-800' : 
              server2Status === 'down' ? 'bg-red-100 text-red-800' : 
              'bg-gray-100 text-gray-800'
            }`}>
              {server2Status}
            </div>
          </div>
          
          <div className="flex justify-center mb-4">
            <Server 
              size={64} 
              className={`${
                server2Status === 'running' ? 'text-green-500' : 
                server2Status === 'down' ? 'text-red-500' : 
                'text-gray-400'
              }`} 
            />
          </div>
          
          <div className="text-center text-sm mt-2">
            <div>Requests: {server2Metrics.total}</div>
            <div>Success Rate: {server2Metrics.total ? Math.round((server2Metrics.success / server2Metrics.total) * 100) : 0}%</div>
          </div>
        </div>
      </div>
      
      {/* Request Controls */}
      <div className="border rounded-lg p-4 mb-8">
        <h2 className="text-lg font-semibold mb-4">Generate Requests</h2>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center">
            <label htmlFor="requestCount" className="mr-2">Number of Requests:</label>
            <input 
              id="requestCount"
              type="number" 
              min="1" 
              max="100"
              value={requestCount}
              onChange={(e) => setRequestCount(Number(e.target.value))}
              className="border rounded px-2 py-1 w-20"
            />
          </div>
          
          <div className="flex gap-2 flex-grow justify-center md:justify-end">
            <button 
              onClick={() => handleRequest('read')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              disabled={server1Status === 'checking'}
            >
              Create READ Request
            </button>
            <button 
              onClick={() => handleRequest('write')}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
              disabled={server2Status === 'checking'}
            >
              Create WRITE Request
            </button>
          </div>
        </div>
      </div>
      
      {/* Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Request Distribution</h2>
          <div className="h-32 flex items-end">
            <div className="flex-1 flex flex-col items-center">
              <div 
                className="bg-blue-500 w-16" 
                style={{ height: `${(server1Metrics.total / (server1Metrics.total + server2Metrics.total || 1)) * 100}%` }}
              ></div>
              <div className="text-sm mt-2">Read Server</div>
              <div className="text-xs">{server1Metrics.total} requests</div>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div 
                className="bg-purple-500 w-16" 
                style={{ height: `${(server2Metrics.total / (server1Metrics.total + server2Metrics.total || 1)) * 100}%` }}
              ></div>
              <div className="text-sm mt-2">Write Server</div>
              <div className="text-xs">{server2Metrics.total} requests</div>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Success Rate</h2>
          <div className="h-32 flex items-end">
            <div className="flex-1 flex flex-col items-center">
              <div 
                className="bg-green-500 w-16" 
                style={{ height: `${server1Metrics.total ? (server1Metrics.success / server1Metrics.total) * 100 : 0}%` }}
              ></div>
              <div className="text-sm mt-2">Read Server</div>
              <div className="text-xs">
                {server1Metrics.total ? Math.round((server1Metrics.success / server1Metrics.total) * 100) : 0}% 
                ({server1Metrics.success}/{server1Metrics.total})
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div 
                className="bg-green-500 w-16" 
                style={{ height: `${server2Metrics.total ? (server2Metrics.success / server2Metrics.total) * 100 : 0}%` }}
              ></div>
              <div className="text-sm mt-2">Write Server</div>
              <div className="text-xs">
                {server2Metrics.total ? Math.round((server2Metrics.success / server2Metrics.total) * 100) : 0}% 
                ({server2Metrics.success}/{server2Metrics.total})
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Request History */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Recent Requests</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left">Time</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Target</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-2 text-center text-gray-500">No requests yet</td>
                </tr>
              ) : (
                requests.map(req => (
                  <tr key={req.id} className="border-b">
                    <td className="px-4 py-2">{req.timestamp}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded ${req.type === 'read' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                        {req.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center">
                        <span>Server {req.targetServer}</span>
                        <span className="mx-2 text-gray-400">|</span>
                        <span>Port {req.targetPort}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded ${req.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ServerMonitor;