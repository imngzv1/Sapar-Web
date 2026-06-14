import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
// import Footer from '../components/layout/Footer';

// Section/tab imports
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

// Zustand store
import { useStore } from '../store/useStore';

export default function HomePage() {
  const activeTab = useStore((state) => state.activeTab);
  const setActiveTab = useStore((state) => state.setActiveTab);
  const sidebarOpen = useStore((state) => state.sidebarOpen);

  // Store data
  const users = useStore((state) => state.users);
  const verificationRequests = useStore((state) => state.verificationRequests);
  const drivers = useStore((state) => state.drivers);
  const rides = useStore((state) => state.rides);
  const complaints = useStore((state) => state.complaints);
  const cities = useStore((state) => state.cities);
  const transactions = useStore((state) => state.transactions);
  const payouts = useStore((state) => state.payouts);
  const refunds = useStore((state) => state.refunds);
  const faq = useStore((state) => state.faq);
  const logs = useStore((state) => state.logs);

  // Store actions
  const logAction = useStore((state) => state.logAction);
  const blockUser = useStore((state) => state.blockUser);
  const unblockUser = useStore((state) => state.unblockUser);
  const approveRequest = useStore((state) => state.approveRequest);
  const rejectRequest = useStore((state) => state.rejectRequest);
  const suspendDriver = useStore((state) => state.suspendDriver);
  const activateDriver = useStore((state) => state.activateDriver);
  const cancelRide = useStore((state) => state.cancelRide);
  const resolveComplaint = useStore((state) => state.resolveComplaint);
  const dismissComplaint = useStore((state) => state.dismissComplaint);
  const approvePayout = useStore((state) => state.approvePayout);
  const addCity = useStore((state) => state.addCity);
  const removeCity = useStore((state) => state.removeCity);
  const toggleCityStatus = useStore((state) => state.toggleCityStatus);
  const addFAQ = useStore((state) => state.addFAQ);
  const removeFAQ = useStore((state) => state.removeFAQ);

  return (
    <div id="homepage-root" className="flex h-screen w-screen bg-[#F3F4F6] overflow-hidden font-sans">
      
      {/* Sidebar Navigation */}
      {sidebarOpen && <Sidebar />}

      {/* Main administrative layout work area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Navbar Header */}
        <Header />

        {/* Dynamic Inner Tab container workspace */}
        <main id="admin-main-viewport" className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#F3F4F6]">
          <div className="max-w-7xl mx-auto h-full">
            
            {activeTab === 'dashboard' && (
              <DashboardTab 
                users={users} 
                drivers={drivers} 
                verificationRequests={verificationRequests} 
                rides={rides}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'verifications' && <VerificationsTab />}

            {activeTab === 'users' && <UsersTab />}

            {activeTab === 'drivers' && <DriversTab />}

            {activeTab === 'rides' && (
              <RidesTab onLogAction={logAction} />
            )}

            {activeTab === 'moderation' && (
              <ModerationTab 
                users={users}
                onUnblockUser={unblockUser}
                onLogAction={logAction}
              />
            )}

            {activeTab === 'finances' && (
              <FinancesTab 
                transactions={transactions}
                payouts={payouts}
                refunds={refunds}
                onApprovePayout={approvePayout}
                onLogAction={logAction}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsTab 
                drivers={drivers}
                rides={rides}
              />
            )}

            {activeTab === 'content' && <ContentTab />}

            {activeTab === 'logs' && (
              <LogsTab 
                logs={logs}
              />
            )}

          </div>
        </main>

        {/* Footer info component */}

      </div>

    </div>
  );
}
