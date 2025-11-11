import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Package, ShoppingCart, LogOut } from 'lucide-react';
export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="p-6 border-b"><h1 className="text-2xl font-bold text-primary-700">SMASH</h1><p className="text-sm text-gray-600 mt-1">{user?.organization_name}</p></div>
        <nav className="p-4 space-y-2">
          <NavLink to="/boxes" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}`}><Package size={20} /><span className="font-medium">Boxes</span></NavLink>
          <NavLink to="/sales" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}`}><ShoppingCart size={20} /><span className="font-medium">Sales</span></NavLink>
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center justify-between">
            <div><p className="font-medium text-sm">{user?.first_name} {user?.last_name}</p><p className="text-xs text-gray-500">{user?.role}</p></div>
            <button onClick={logout} className="p-2 hover:bg-gray-100 rounded-lg"><LogOut size={18} /></button>
          </div>
        </div>
      </div>
      <div className="ml-64 p-8"><Outlet /></div>
    </div>
  );
};
