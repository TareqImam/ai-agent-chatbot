import React from 'react';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <button 
        className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-colors duration-200"
        onClick={() => alert('Button clicked!')}
      >
        Click Me
      </button>
    </div>
  );
}

export default App;
