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
  const [timeFilter, setTimeFilter] = useState("all"); // Default to show all data

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/user/logs");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const result = await response.json();
        console.log("Fetched logs:", result);
        setData(result);
        processData(result, timeFilter);
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Process data whenever the time filter changes
  useEffect(() => {
    if (data.length > 0) {
      processData(data, timeFilter);
    }
  }, [timeFilter, data]);

  const processData = (logs, filter) => {
    // Filter data based on selected time period
    const filteredLogs = filterLogsByTime(logs, filter);

    // Count read and write requests
    const readCount = filteredLogs.filter(log => log.type === 1).length;
    const writeCount = filteredLogs.filter(log => log.type === 2).length;

    setChartData([
      { name: "Read Requests", count: readCount },
      { name: "Write Requests", count: writeCount },
    ]);

    // Group requests by date
    const groupedByDate = filteredLogs.reduce((acc, log) => {
      const date = log.log_date.split("T")[0]; // Extract YYYY-MM-DD
      if (!acc[date]) acc[date] = { date, reads: 0, writes: 0, total: 0 };

      if (log.type === 1) acc[date].reads += 1;
      if (log.type === 2) acc[date].writes += 1;
      acc[date].total += 1; // Sum both read and write requests

      return acc;
    }, {});

    // Convert object to array and sort by date
    const dateData = Object.values(groupedByDate).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    setDateWiseData(dateData);
  };

  const filterLogsByTime = (logs, filter) => {
    if (filter === "all") return logs;

    const now = new Date();
    let startDate;

    switch (filter) {
      case "day":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 1);
        break;
      case "week":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "year":
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return logs;
    }

    return logs.filter(log => new Date(log.log_date) >= startDate);
  };

  const handleTimeFilterChange = (e) => {
    setTimeFilter(e.target.value);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold text-center mb-6 text-blue-700">Logs Data Visualization</h1>

      {/* Time Period Filter */}
      <div className="mb-6 flex justify-end">
        <div className="inline-block relative">
          <select 
            value={timeFilter}
            onChange={handleTimeFilterChange}
            className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="all">All Time</option>
            <option value="day">Last 24 Hours</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>
      </div>

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