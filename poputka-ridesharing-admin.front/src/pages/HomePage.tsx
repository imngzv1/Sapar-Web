import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

import DashboardTab from '../components/sections/DashboardTab';
import UsersTab from '../components/sections/UsersTab';
import VerificationsTab from '../components/sections/VerificationsTab';
import DriversTab from '../components/sections/DriversTab';
import RidesTab from '../components/sections/RidesTab';
import ModerationTab from '../components/sections/ModerationTab';
import FinancesTab from '../components/sections/FinancesTab';
import AnalyticsTab from '../components/sections/AnalyticsTab';
import ContentTab from '../components/sections/ContentTab';
import LogsTab from '../components/sections/LogsTab';

import { useStore } from '../store/useStore';

export default function HomePage() {
  const activeTab = useStore((state) => state.activeTab);
  const setActiveTab = useStore((state) => state.setActiveTab);
  const sidebarOpen = useStore((state) => state.sidebarOpen);
  const logAction = useStore((state) => state.logAction);

  return (
    <div id="homepage-root" className="flex h-screen w-screen bg-[#F3F4F6] overflow-hidden font-sans">
      {sidebarOpen && <Sidebar />}

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />

        <main id="admin-main-viewport" className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#F3F4F6]">
          <div className="max-w-7xl mx-auto h-full">
            {activeTab === 'dashboard' && <DashboardTab setActiveTab={setActiveTab} />}
            {activeTab === 'verifications' && <VerificationsTab onLogAction={logAction} />}
            {activeTab === 'users' && <UsersTab />}
            {activeTab === 'drivers' && <DriversTab onLogAction={logAction} />}
            {activeTab === 'rides' && <RidesTab onLogAction={logAction} />}
            {activeTab === 'moderation' && <ModerationTab onLogAction={logAction} />}
            {activeTab === 'finances' && <FinancesTab />}
            {activeTab === 'analytics' && <AnalyticsTab />}
            {activeTab === 'content' && <ContentTab onLogAction={logAction} />}
            {activeTab === 'logs' && <LogsTab />}
          </div>
        </main>
      </div>
    </div>
  );
}
