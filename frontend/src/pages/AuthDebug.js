import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout, validateToken } from '../redux/slices/authSlice';
import { getOrders } from '../redux/slices/orderSlice';

const AuthDebug = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const { orders, isError: ordersError, message: ordersMessage } = useSelector((state) => state.orders);
  const [testResults, setTestResults] = useState([]);

  const addResult = (message, type = 'info') => {
    setTestResults(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testLogin = async () => {
    try {
      const result = await dispatch(login({
        email: 'test@example.com',
        password: 'testpass123'
      })).unwrap();
      addResult(`Login successful: ${result.user.email}`, 'success');
    } catch (error) {
      addResult(`Login failed: ${error}`, 'error');
    }
  };

  const testLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      addResult('Logout successful', 'success');
    } catch (error) {
      addResult(`Logout failed: ${error}`, 'error');
    }
  };

  const testTokenValidation = async () => {
    try {
      await dispatch(validateToken()).unwrap();
      addResult('Token validation successful', 'success');
    } catch (error) {
      addResult(`Token validation failed: ${error}`, 'error');
    }
  };

  const testOrdersAPI = async () => {
    try {
      await dispatch(getOrders()).unwrap();
      addResult('Orders API call successful', 'success');
    } catch (error) {
      addResult(`Orders API call failed: ${error}`, 'error');
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    addResult('LocalStorage cleared', 'info');
  };

  const showLocalStorage = useCallback(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    addResult(`Token: ${token ? 'Present' : 'Missing'}`, 'info');
    addResult(`User: ${user ? 'Present' : 'Missing'}`, 'info');
  }, []);

  useEffect(() => {
    showLocalStorage();
  }, [showLocalStorage]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Authentication Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          
          <div className="mb-4 space-y-2">
            <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
            <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
            {user && (
              <div>
                <p><strong>User:</strong> {user.email}</p>
                <p><strong>Username:</strong> {user.username}</p>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <button
              onClick={testLogin}
              disabled={isLoading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 w-full"
            >
              Test Login
            </button>
            
            <button
              onClick={testLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full"
            >
              Test Logout
            </button>
            
            <button
              onClick={testTokenValidation}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
            >
              Validate Token
            </button>
            
            <button
              onClick={testOrdersAPI}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 w-full"
            >
              Test Orders API
            </button>
            
            <button
              onClick={clearLocalStorage}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 w-full"
            >
              Clear LocalStorage
            </button>
            
            <button
              onClick={showLocalStorage}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 w-full"
            >
              Show LocalStorage
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

      {/* Orders Status */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Orders Status</h2>
        <div className="space-y-2">
          <p><strong>Orders Count:</strong> {orders.length}</p>
          <p><strong>Orders Error:</strong> {ordersError ? 'Yes' : 'No'}</p>
          {ordersMessage && <p><strong>Error Message:</strong> {ordersMessage}</p>}
        </div>
      </div>
    </div>
  );
};

export default AuthDebug; 