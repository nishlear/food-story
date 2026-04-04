import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, LayoutDashboard, Users, Store, MessageSquare, Plus } from 'lucide-react';
import { CurrentUser } from '../types';
import AdminDashboard from './AdminDashboard';
import AdminUsersTab from './AdminUsersTab';
import AdminVendorsTab from './AdminVendorsTab';
import AdminCommentsTab from './AdminCommentsTab';
import { useLanguage } from '../i18n/context';

interface Props {
  currentUser: CurrentUser | null;
  onBack: () => void;
  authHeaders: () => Record<string, string>;
}

type Tab = 'dashboard' | 'users' | 'vendors' | 'comments';

export default function AdminScreen({ currentUser, onBack, authHeaders }: Props) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const navItems: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'users', label: t.users, icon: Users },
    { id: 'vendors', label: t.vendors, icon: Store },
    { id: 'comments', label: t.comments, icon: MessageSquare },
  ];

  const initial = currentUser?.username?.[0]?.toUpperCase() ?? 'A';

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="w-full h-full flex bg-gray-100"
    >
      {/* Sidebar */}
      <div className="w-64 shrink-0 h-full bg-gray-50 border-r border-gray-100 flex flex-col py-8 px-4">
        {/* Brand */}
        <div className="px-4 mb-10">
          <h1 className="text-xl font-extrabold text-gray-900">Food Story</h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-0.5">{t.adminPanel}</p>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium transition-colors w-full text-left ${
                  isActive
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                {label}
              </button>
            );
          })}

          {/* Add New Vendor CTA */}
          <div className="pt-6 px-0">
            <button
              onClick={() => setActiveTab('vendors')}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-3 rounded-full transition-colors shadow-sm shadow-orange-200"
            >
              <Plus className="w-4 h-4" />
              {t.addNewVendor}
            </button>
          </div>
        </nav>

        {/* Bottom: back + user */}
        <div className="border-t border-gray-100 pt-5 flex flex-col gap-1">
          <button
            onClick={onBack}
            className="flex items-center gap-3 px-4 py-3 rounded-full text-sm text-gray-500 hover:bg-gray-100 transition-colors w-full text-left"
          >
            <ArrowLeft className="w-[18px] h-[18px]" />
            {t.backToMap}
          </button>
          <div className="px-4 py-2 text-xs text-gray-400 truncate">
            {t.signedInAs} <span className="font-semibold text-gray-600">{currentUser?.username}</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Top header */}
        <div className="h-16 shrink-0 bg-white/80 backdrop-blur border-b border-gray-100 flex items-center justify-between px-8 z-10">
          <div className="relative">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              className="bg-gray-100 rounded-full pl-10 pr-5 py-2 text-sm text-gray-500 placeholder-gray-400 outline-none w-72"
              readOnly
            />
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </div>
          <div className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold select-none">
            {initial}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && <AdminDashboard authHeaders={authHeaders} />}
          {activeTab === 'users' && <AdminUsersTab authHeaders={authHeaders} currentUser={currentUser} />}
          {activeTab === 'vendors' && <AdminVendorsTab authHeaders={authHeaders} />}
          {activeTab === 'comments' && <AdminCommentsTab authHeaders={authHeaders} />}
        </div>
      </div>
    </motion.div>
  );
}
