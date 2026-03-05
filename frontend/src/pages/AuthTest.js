import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from '../redux/slices/authSlice';

const AuthTest = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const [testResults, setTestResults] = useState([]);
  const [apiResults, setApiResults] = useState([]);

  const addResult = (message, type = 'info') => {
    setTestResults(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  const addApiResult = (endpoint, status, data) => {
    setApiResults(prev => [...prev, { endpoint, status, data, timestamp: new Date().toLocaleTimeString() }]);
  };

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    addResult('Authentication state cleared', 'success');
  };

  const testPublicAPI = async (endpoint) => {
    try {
      const response = await fetch(`/api/${endpoint}`);
      const data = await response.json();
      addApiResult(endpoint, response.status, data);
      addResult(`Public API ${endpoint}: ${response.status}`, response.ok ? 'success' : 'error');
    } catch (error) {
      addApiResult(endpoint, 'ERROR', error.message);
      addResult(`Public API ${endpoint}: ERROR - ${error.message}`, 'error');
    }
  };

  const testAuthenticatedAPI = async (endpoint) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch(`/api/${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      });
      const data = await response.json();
      addApiResult(endpoint, response.status, data);
      addResult(`Auth API ${endpoint}: ${response.status}`, response.ok ? 'success' : 'error');
    } catch (error) {
      addApiResult(endpoint, 'ERROR', error.message);
      addResult(`Auth API ${endpoint}: ERROR - ${error.message}`, 'error');
    }
  };

  const handleLogin = async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'testpass123'
    };
    
    try {
      const result = await dispatch(login(loginData)).unwrap();
      addResult(`Login successful: ${result.user.email}`, 'success');
    } catch (error) {
      addResult(`Login failed: ${error}`, 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      addResult('Logout successful', 'success');
    } catch (error) {
      addResult(`Logout failed: ${error}`, 'error');
    }
  };

  const testAllAPIs = async () => {
    setApiResults([]);
    addResult('Testing all APIs...', 'info');
    
    // Test public APIs
    await testPublicAPI('products/featured/');
    await testPublicAPI('products/sale/');
    await testPublicAPI('categories/');
    await testPublicAPI('products/');
    
    // Test authenticated APIs
    await testAuthenticatedAPI('cart/');
    await testAuthenticatedAPI('orders/');
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Authentication & API Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Authentication Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Authentication</h2>
          
          <div className="mb-4">
            <p><strong>Status:</strong> {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
            <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
            {user && (
              <p><strong>User:</strong> {user.email}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Login (test@example.com)
            </button>
            
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
            
            <button
              onClick={clearAuth}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Clear Auth State
            </button>
            
            <button
              onClick={testAllAPIs}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Test All APIs
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className={`mb-2 p-2 rounded ${
                result.type === 'success' ? 'bg-green-100 text-green-800' :
                result.type === 'error' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                <span className="text-xs">{result.timestamp}</span> - {result.message}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* API Results */}
      {apiResults.length > 0 && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">API Results</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left">Endpoint</th>
                  <th className="text-left">Status</th>
                  <th className="text-left">Timestamp</th>
                  <th className="text-left">Data</th>
                </tr>
              </thead>
              <tbody>
                {apiResults.map((result, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{result.endpoint}</td>
                    <td className={`py-2 ${
                      result.status === 200 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.status}
                    </td>
                    <td className="py-2 text-sm">{result.timestamp}</td>
                    <td className="py-2 text-sm">
                      <pre className="text-xs overflow-hidden">
                        {JSON.stringify(result.data, null, 2).substring(0, 100)}...
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthTest; 