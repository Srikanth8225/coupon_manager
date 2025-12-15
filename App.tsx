import React, { useState } from 'react';
import { Tag, LogOut, Play, LayoutDashboard, Code, Github, Server } from 'lucide-react';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import SimulatorPage from './pages/SimulatorPage';

enum Page {
  LOGIN,
  ADMIN,
  SIMULATOR
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>(Page.LOGIN);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage(Page.ADMIN);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage(Page.LOGIN);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col text-gray-900">
      {/* Top Navigation Bar */}
      <nav className="bg-slate-900 text-white border-b-4 border-indigo-500">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
               <div className="bg-white/10 p-2 rounded">
                  <Server size={24} className="text-indigo-400" />
               </div>
               <div>
                  <div className="font-bold text-lg tracking-wider">Coupon Manager</div>
               </div>
            </div>
            
            <div className="flex items-center gap-1">
               <button 
                 onClick={() => setCurrentPage(Page.ADMIN)}
                 className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${currentPage === Page.ADMIN ? 'border-indigo-400 text-white' : 'border-transparent text-gray-300 hover:text-white hover:border-gray-500'}`}
               >
                 <LayoutDashboard size={16} />
                 Manage
               </button>
               <button 
                 onClick={() => setCurrentPage(Page.SIMULATOR)}
                 className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${currentPage === Page.SIMULATOR ? 'border-indigo-400 text-white' : 'border-transparent text-gray-300 hover:text-white hover:border-gray-500'}`}
               >
                 <Play size={16} />
                 Test API
               </button>
               <div className="h-6 w-px bg-gray-600 mx-3"></div>
               <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-2 text-sm font-medium px-2">
                  <LogOut size={16} />
                  Exit
               </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow max-w-6xl w-full mx-auto p-6">
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg min-h-[600px] p-6">
          {currentPage === Page.ADMIN && <AdminPage />}
          {currentPage === Page.SIMULATOR && <SimulatorPage />}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center">
           <p className="text-sm text-gray-600">&copy; {new Date().getFullYear()} Coupon Management System</p>
        </div>
      </footer>
    </div>
  );
}