import React from 'react';
import { motion } from 'motion/react';
import { Plus, Edit2, Trash2, LogOut, ShieldCheck } from 'lucide-react';
import { CurrentUser } from '../types';

interface Props {
  locations: any[];
  onSelect: (loc: any) => void;
  onAddClick: () => void;
  onEditClick: (loc: any) => void;
  onDeleteClick: (loc: any) => void;
  currentUser: CurrentUser | null;
  onLogout: () => void;
  onGoToAdmin: () => void;
}

const roleBadgeStyle: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  foodvendor: 'bg-blue-100 text-blue-700',
  user: 'bg-green-100 text-green-700',
};

const roleLabel: Record<string, string> = {
  admin: 'Admin',
  foodvendor: 'Vendor',
  user: 'User',
};

export default function LocationSelection({ locations, onSelect, onAddClick, onEditClick, onDeleteClick, currentUser, onLogout, onGoToAdmin }: Props) {
  const isAdmin = currentUser?.role === 'admin';

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="w-full h-full flex flex-col bg-white"
    >
      <div className="pt-12 pb-6 px-6 bg-orange-500 text-white shadow-md z-10 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Where are you?</h1>
          <p className="opacity-80 mt-2">Select a street food haven</p>
        </div>
        <div className="flex items-center gap-2">
          {currentUser && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleBadgeStyle[currentUser.role]}`}>
              {roleLabel[currentUser.role]}
            </span>
          )}
          {isAdmin && (
            <>
              <button
                onClick={onGoToAdmin}
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                title="Admin Panel"
              >
                <ShieldCheck className="w-5 h-5" />
              </button>
              <button
                onClick={onAddClick}
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <Plus className="w-6 h-6" />
              </button>
            </>
          )}
          <button
            onClick={onLogout}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {locations.map(loc => (
          <button
            key={loc.id}
            onClick={() => onSelect(loc)}
            className="w-full text-left bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group"
          >
            <div>
              <h2 className="text-xl font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">{loc.name}</h2>
              <p className="text-gray-500 text-sm mt-1">{loc.city}</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full mb-2">
                {loc.vendors_count || 0} vendors
              </span>
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); onEditClick(loc); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onDeleteClick(loc); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
