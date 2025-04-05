import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from "recharts";

const GraphPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [dateWiseData, setDateWiseData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/user/logs");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  
        const result = await response.json();
        console.log("Fetched logs:", result);
        setData(result);
  
        // Count read and write requests
        const readCount = result.filter(log => log.type === 1).length;
        const writeCount = result.filter(log => log.type === 2).length;
  
        setChartData([
          { name: "Read Requests", count: readCount },
          { name: "Write Requests", count: writeCount },
        ]);
  
        // Group requests by date
        const groupedByDate = result.reduce((acc, log) => {
          const date = log.log_date.split("T")[0]; // Extract YYYY-MM-DD
          if (!acc[date]) acc[date] = { date, reads: 0, writes: 0, total: 0 };
  
          if (log.type === 1) acc[date].reads += 1;
          if (log.type === 2) acc[date].writes += 1;
          acc[date].total += 1;
  
          return acc;
        }, {});
  
        setDateWiseData(Object.values(groupedByDate));
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setLoading(false);
      }
    };
  
    const intervalId = setInterval(fetchData, 1000);
  
    return () => clearInterval(intervalId);
  }, []);  

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold text-center mb-6 text-blue-700">Logs Data Visualization</h1>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Bar Chart: Read vs Write Requests */}
          <div className="mb-12 shadow-lg p-5 rounded-lg bg-white">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">📊 Total Read vs Write Requests</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fill: "#555" }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="url(#colorRequests)" barSize={50} radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4A90E2" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4A90E2" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart: Read vs Write Requests Over Time */}
          <div className="mb-12 shadow-lg p-5 rounded-lg bg-white">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">📈 Read vs Write Requests Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dateWiseData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                <XAxis dataKey="date" tick={{ fill: "#555" }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="reads" stroke="#ff7300" strokeWidth={3} dot={{ r: 4 }} name="Read Requests" />
                <Line type="monotone" dataKey="writes" stroke="#387908" strokeWidth={3} dot={{ r: 4 }} name="Write Requests" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Area Chart: Total Requests Over Time */}
          <div className="mb-12 shadow-lg p-5 rounded-lg bg-white">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">📉 Total Requests Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dateWiseData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: "#555" }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="total" stroke="#1D4ED8" fill="url(#colorTotal)" name="Total Requests" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default GraphPage;
