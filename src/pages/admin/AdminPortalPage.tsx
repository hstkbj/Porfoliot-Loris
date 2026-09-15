import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AdminLayout, AdminTab } from '../../components/admin/AdminLayout';
import { AdminLoginPage } from './AdminLoginPage';
import { AdminDashboardTab } from './AdminDashboardTab';
import { AdminProjectsTab } from './AdminProjectsTab';
import { AdminServicesTab } from './AdminServicesTab';
import { AdminRequestsTab } from './AdminRequestsTab';
import { AdminMessagesTab } from './AdminMessagesTab';
import { AdminProfileTab } from './AdminProfileTab';
import { AdminResumeTab } from './AdminResumeTab';
import { AdminSkillsTab } from './AdminSkillsTab';
import { AdminSocialsTab } from './AdminSocialsTab';
import { AdminSettingsTab } from './AdminSettingsTab';

interface AdminPortalPageProps {
  onExitAdmin: () => void;
}

export function AdminPortalPage({ onExitAdmin }: AdminPortalPageProps) {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090a0c] text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <span className="text-xs font-mono">Vérification de session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AdminLoginPage onBackToSite={onExitAdmin} />;
  }

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onExitAdmin={onExitAdmin}
    >
      {activeTab === 'dashboard' && <AdminDashboardTab onNavigateTab={setActiveTab} />}
      {activeTab === 'projects' && <AdminProjectsTab />}
      {activeTab === 'services' && <AdminServicesTab />}
      {activeTab === 'requests' && <AdminRequestsTab />}
      {activeTab === 'messages' && <AdminMessagesTab />}
      {activeTab === 'profile' && <AdminProfileTab />}
      {activeTab === 'resume' && <AdminResumeTab />}
      {activeTab === 'skills' && <AdminSkillsTab />}
      {activeTab === 'socials' && <AdminSocialsTab />}
      {activeTab === 'settings' && <AdminSettingsTab />}
    </AdminLayout>
  );
}
