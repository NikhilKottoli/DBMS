import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from "recharts";
import Navbar from "../components/Navbar";

const GraphPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [dateWiseData, setDateWiseData] = useState([]);
  
  // New state variables for time filtering
  const [selectedHour, setSelectedHour] = useState(new Date().getHours());
  const [minuteRange, setMinuteRange] = useState(60); // Default to show full hour (60 minutes)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/user/logs");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  
        const result = await response.json();
        console.log("Fetched logs:", result);
        setData(result);
        processData(result, selectedHour, minuteRange);
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setLoading(false);
      }
    };
  
    // Fetch immediately once
    fetchData();
  
    // Set interval to fetch every second
    const intervalId = setInterval(fetchData, 1000);
  
    // Clear interval on unmount
    return () => clearInterval(intervalId);
  }, [selectedHour, minuteRange]);  

  // Process data whenever the time filter changes
  useEffect(() => {
    if (data.length > 0) {
      processData(data, selectedHour, minuteRange);
    }
  }, [selectedHour, minuteRange, data]);

  const processData = (logs, hour, minutes) => {
    // Filter data based on selected hour and minute range
    const filteredLogs = filterLogsByMinutes(logs, hour, minutes);

    // Count read and write requests
    const readCount = filteredLogs.filter(log => log.type === 1).length;
    const writeCount = filteredLogs.filter(log => log.type === 2).length;

    setChartData([
      { name: "Read Requests", count: readCount },
      { name: "Write Requests", count: writeCount },
    ]);

    // Group requests by minute within the selected hour
    const groupedByMinute = {};
    
    // Initialize all minutes in the range with zero values
    for (let i = 0; i < minutes; i++) {
      const minuteKey = i.toString().padStart(2, '0');
      groupedByMinute[minuteKey] = { 
        minute: minuteKey, 
        reads: 0, 
        writes: 0, 
        total: 0 
      };
    }

    // Fill in actual data
    filteredLogs.forEach(log => {
      const logDate = new Date(log.log_date);
      const minute = logDate.getMinutes().toString().padStart(2, '0');
      
      // Only process logs that fall within our minute range
      if (parseInt(minute) < minutes) {
        if (log.type === 1) groupedByMinute[minute].reads += 1;
        if (log.type === 2) groupedByMinute[minute].writes += 1;
        groupedByMinute[minute].total += 1;
      }
    });

    // Convert object to array and sort by minute
    const minuteData = Object.values(groupedByMinute).sort((a, b) => 
      parseInt(a.minute) - parseInt(b.minute)
    );
    
    setDateWiseData(minuteData);
  };

  const filterLogsByMinutes = (logs, hour, minutes) => {
    const today = new Date();
    
    // Create date objects for the start and end of our time window
    const startTime = new Date(today);
    startTime.setHours(hour, 0, 0, 0); // Start of the hour
    
    const endTime = new Date(today);
    endTime.setHours(hour, minutes, 0, 0); // End depends on minute range
    
    return logs.filter(log => {
      const logDate = new Date(log.log_date);
      return logDate >= startTime && logDate <= endTime;
    });
  };

  const handleHourChange = (e) => {
    setSelectedHour(parseInt(e.target.value));
  };

  const handleMinuteRangeChange = (e) => {
    setMinuteRange(parseInt(e.target.value));
  };

  // Generate array of hour options for the dropdown
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div>
    <Navbar />
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold text-center mb-6 text-blue-700">Logs Data Visualization</h1>

      {/* Time Filter Controls */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">Time Filter</h2>
        
        {/* Hour selection dropdown */}
        <div className="mb-4">
          <label htmlFor="hour-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Hour:
          </label>
          <div className="inline-block relative w-full md:w-1/3">
            <select 
              id="hour-select"
              value={selectedHour}
              onChange={handleHourChange}
              className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            >
              {hours.map(hour => (
                <option key={hour} value={hour}>
                  {hour.toString().padStart(2, '0')}:00 - {hour.toString().padStart(2, '0')}:59
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Minute range slider */}
        <div>
          <label htmlFor="minute-slider" className="block text-sm font-medium text-gray-700 mb-1">
            Minutes Range: 0 to {minuteRange}
          </label>
          <div className="flex items-center gap-4">
            <input
              id="minute-slider"
              type="range"
              min="1"
              max="60"
              value={minuteRange}
              onChange={handleMinuteRangeChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-700 w-12">{minuteRange} min</span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Showing data from {selectedHour.toString().padStart(2, '0')}:00 to {selectedHour.toString().padStart(2, '0')}:{minuteRange.toString().padStart(2, '0')}
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

          {/* Line Chart: Read vs Write Requests By Minute */}
          <div className="mb-12 shadow-lg p-5 rounded-lg bg-white">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">📈 Read vs Write Requests By Minute</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dateWiseData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                <XAxis 
                  dataKey="minute" 
                  tick={{ fill: "#555" }}
                  label={{ value: "Minute", position: "insideBottom", offset: -5 }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="reads" 
                  stroke="#ff7300" 
                  strokeWidth={3} 
                  dot={{ r: 4 }} 
                  name="Read Requests" 
                />
                <Line 
                  type="monotone" 
                  dataKey="writes" 
                  stroke="#387908" 
                  strokeWidth={3} 
                  dot={{ r: 4 }} 
                  name="Write Requests" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Area Chart: Total Requests By Minute */}
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
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                <XAxis 
                  dataKey="minute" 
                  tick={{ fill: "#555" }}
                  label={{ value: "Minute", position: "insideBottom", offset: -5 }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#1D4ED8" 
                  fill="url(#colorTotal)" 
                  name="Total Requests" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
    </div>
  );
};

export default GraphPage;