// components/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiService } from '@/lib/api';

export default function Header() {
  const [redisEnabled, setRedisEnabled] = useState(false);

  useEffect(() => {
    // Initialize state from service (which now reads from localStorage)
    setRedisEnabled(apiService.redisEnabled);
  }, []);

  const toggleRedis = () => {
    const newState = !redisEnabled;
    setRedisEnabled(newState);
    apiService.toggleRedis(newState);
    // Reload page to fetch new data with toggle state preserved
    window.location.reload();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">R</div>
        <Link href="/" className="text-xl font-bold tracking-tight text-gray-800 hover:text-blue-600 transition-colors">
          Rivo-Benchmark
        </Link>
      </div>
      
      <div className="flex items-center space-x-6">
        {/* Redis Toggle */}
        <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Redis Cache</span>
          <button 
            onClick={toggleRedis}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${redisEnabled ? 'bg-blue-600' : 'bg-gray-200'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${redisEnabled ? 'translate-x-6' : 'translate-x-1'}`}></span>
          </button>
          <span className={`text-xs font-medium ${redisEnabled ? 'text-blue-600' : 'text-gray-400'}`}>
            {redisEnabled ? 'ON' : 'OFF'}
          </span>
        </div>

        <div className="text-sm text-gray-500 font-medium flex items-center bg-gray-100 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <span>System Online</span>
        </div>
      </div>
    </header>
  );
}