'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import {
  User,
  Shield,
  Sliders,
  Bell,
  Loader2,
  Save,
  LogOut,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ErrorState } from '@/components/feedback/error-state';
import { useSettingsStore } from '@/store/settings';
import { useAuthStore } from '@/store/auth';
import { useResumeStore } from '@/store/resumes';
import { cn } from '@/lib/utils';
import {
  THEME_OPTIONS,
  DASHBOARD_PAGES,
  SORT_OPTIONS,
} from '@/types/settings';
import type {
  UpdateProfileRequest,
  ChangePasswordRequest,
  UpdateSettingsRequest,
} from '@/types/settings';

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function SettingsPageClient() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const authUser = useAuthStore((s) => s.user);
  const logoutAll = useAuthStore((s) => s.clearAuth);

  const {
    profile,
    settings,
    sessions,
    isLoading,
    isSaving,
    error,
    fetchProfile,
    updateProfile,
    changePassword,
    updateSettings,
    fetchSessions,
    clearError,
  } = useSettingsStore();

  const { resumes, fetchResumes } = useResumeStore();

  const [profileForm, setProfileForm] = useState<UpdateProfileRequest>({
    fullName: '',
    avatarUrl: '',
  });

  const [passwordForm, setPasswordForm] = useState<ChangePasswordRequest>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [activeTab, setActiveTab] = useState('profile');

  const [settingsForm, setSettingsForm] = useState<UpdateSettingsRequest>({});

  const [localSaving, setLocalSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
    fetchResumes();
    fetchSessions();
  }, [fetchProfile, fetchResumes, fetchSessions]);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        fullName: profile.fullName,
        avatarUrl: profile.avatarUrl || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (settings) {
      setSettingsForm({
        theme: settings.theme,
        defaultDashboardPage: settings.defaultDashboardPage,
        defaultResumeId: settings.defaultResumeId,
        defaultSortField: settings.defaultSortField,
        defaultSortDirection: settings.defaultSortDirection,
        notifyPasswordReset: settings.notifyPasswordReset,
        notifyResumeParsed: settings.notifyResumeParsed,
        notifyAtsComplete: settings.notifyAtsComplete,
        notifyInterviewReady: settings.notifyInterviewReady,
      });
    }
  }, [settings]);

  const handleProfileSave = useCallback(async () => {
    setLocalSaving('profile');
    try {
      await updateProfile(profileForm);
    } finally {
      setLocalSaving(null);
    }
  }, [profileForm, updateProfile]);

  const handlePasswordChange = useCallback(async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return;
    }
    setLocalSaving('password');
    try {
      await changePassword(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } finally {
      setLocalSaving(null);
    }
  }, [passwordForm, changePassword]);

  const handleSettingsSave = useCallback(async () => {
    setLocalSaving('settings');
    try {
      await updateSettings(settingsForm);
      if (settingsForm.theme) {
        setTheme(settingsForm.theme);
      }
    } finally {
      setLocalSaving(null);
    }
  }, [settingsForm, updateSettings, setTheme]);

  const handleLogoutAll = useCallback(async () => {
    try {
      const { api } = await import('@/lib/api/client');
      await api.post('/api/auth/logout-all');
      logoutAll();
      router.push('/auth/login');
    } catch {
      // proceed with local logout even if API fails
      logoutAll();
      router.push('/auth/login');
    }
  }, [logoutAll, router]);

  const passwordMatch = passwordForm.newPassword === passwordForm.confirmPassword;
  const passwordTouched = passwordForm.confirmPassword.length > 0;

  if (isLoading) {
    return (
      <>
        <PageHeader title="Settings" description="Manage your account and preferences" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  if (error && !profile) {
    return (
      <>
        <PageHeader title="Settings" />
        <ErrorState
          title="Failed to load settings"
          message={error}
          onRetry={clearError}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account and preferences"
      />

      <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="account">
            <Shield className="w-4 h-4 mr-2" />
            Account
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Sliders className="w-4 h-4 mr-2" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <SectionCard
            icon={User}
            title="Profile Information"
            description="Update your personal details"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-email">Email</Label>
                <Input
                  id="profile-email"
                  value={profile?.email || ''}
                  disabled
                  className="bg-muted"
                  aria-describedby="email-readonly-hint"
                />
                <p id="email-readonly-hint" className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-name">Full Name</Label>
                <Input
                  id="profile-name"
                  value={profileForm.fullName}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                  placeholder="Your full name"
                  required
                  minLength={1}
                  maxLength={255}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-avatar">Avatar URL</Label>
                <Input
                  id="profile-avatar"
                  value={profileForm.avatarUrl}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, avatarUrl: e.target.value }))
                  }
                  placeholder="https://example.com/avatar.jpg"
                  type="url"
                />
              </div>

              <div className="space-y-2">
                <Label>Account Created</Label>
                <p className="text-sm text-muted-foreground">
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '—'}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  onClick={handleProfileSave}
                  disabled={
                    localSaving === 'profile' ||
                    !profileForm.fullName.trim()
                  }
                >
                  {localSaving === 'profile' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="account">
          <SectionCard
            icon={Shield}
            title="Change Password"
            description="Update your account password"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPassword.current ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    placeholder="Enter current password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => ({ ...prev, current: !prev.current }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword.current ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword.new ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => ({ ...prev, new: !prev.new }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword.new ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {passwordForm.newPassword.length > 0 && passwordForm.newPassword.length < 8 && (
                  <p className="text-xs text-destructive">
                    Password must be at least 8 characters
                  </p>
                )}
                {passwordForm.newPassword.length >= 8 && (
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Strong password
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showPassword.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => ({ ...prev, confirm: !prev.confirm }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword.confirm ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {passwordTouched && !passwordMatch && (
                  <p className="text-xs text-destructive">Passwords do not match</p>
                )}
                {passwordTouched && passwordMatch && (
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Passwords match
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  onClick={handlePasswordChange}
                  disabled={
                    localSaving === 'password' ||
                    !passwordForm.currentPassword ||
                    !passwordForm.newPassword ||
                    !passwordForm.confirmPassword ||
                    !passwordMatch ||
                    passwordForm.newPassword.length < 8
                  }
                >
                  {localSaving === 'password' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Update Password
                </Button>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={LogOut}
            title="Sessions"
            description="Manage your active sessions"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Active Sessions</p>
                  <p className="text-sm text-muted-foreground">
                    {sessions?.activeSessions !== undefined
                      ? `${sessions.activeSessions} active session${sessions.activeSessions !== 1 ? 's' : ''}`
                      : '—'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="destructive"
                  onClick={handleLogoutAll}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out All Devices
                </Button>
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="preferences">
          <SectionCard
            icon={Sliders}
            title="Appearance & Defaults"
            description="Customize your experience"
          >
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="settings-theme">Theme</Label>
                <Select
                  id="settings-theme"
                  options={THEME_OPTIONS}
                  value={settingsForm.theme || 'system'}
                  onChange={(e) =>
                    setSettingsForm((prev) => ({ ...prev, theme: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="settings-dashboard">Default Dashboard Page</Label>
                <Select
                  id="settings-dashboard"
                  options={DASHBOARD_PAGES}
                  value={settingsForm.defaultDashboardPage || 'dashboard'}
                  onChange={(e) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      defaultDashboardPage: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="settings-resume">Default Resume</Label>
                <Select
                  id="settings-resume"
                  options={[
                    { value: '', label: 'None' },
                    ...resumes.map((r) => ({ value: r.id, label: r.name })),
                  ]}
                  value={settingsForm.defaultResumeId || ''}
                  onChange={(e) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      defaultResumeId: e.target.value || null,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="settings-sort">Default Application Sort</Label>
                <Select
                  id="settings-sort"
                  options={SORT_OPTIONS.map((o) => ({
                    value: `${o.field}_${o.direction}`,
                    label: o.label,
                  }))}
                  value={`${settingsForm.defaultSortField || 'createdAt'}_${settingsForm.defaultSortDirection || 'desc'}`}
                  onChange={(e) => {
                    const [field, direction] = e.target.value.split('_');
                    setSettingsForm((prev) => ({
                      ...prev,
                      defaultSortField: field,
                      defaultSortDirection: direction,
                    }));
                  }}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  onClick={handleSettingsSave}
                  disabled={localSaving === 'settings'}
                >
                  {localSaving === 'settings' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Preferences
                </Button>
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="notifications">
          <SectionCard
            icon={Bell}
            title="Email Notifications"
            description="Choose which emails you receive"
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notif-password">Password Reset</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email when your password is reset
                  </p>
                </div>
                <Switch
                  id="notif-password"
                  checked={settingsForm.notifyPasswordReset ?? true}
                  onCheckedChange={(checked) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      notifyPasswordReset: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notif-resume">Resume Parsed</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email when your resume has been parsed
                  </p>
                </div>
                <Switch
                  id="notif-resume"
                  checked={settingsForm.notifyResumeParsed ?? true}
                  onCheckedChange={(checked) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      notifyResumeParsed: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notif-ats">ATS Analysis Complete</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email when ATS analysis is complete
                  </p>
                </div>
                <Switch
                  id="notif-ats"
                  checked={settingsForm.notifyAtsComplete ?? true}
                  onCheckedChange={(checked) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      notifyAtsComplete: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notif-interview">Interview Ready</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email when interview practice is ready
                  </p>
                </div>
                <Switch
                  id="notif-interview"
                  checked={settingsForm.notifyInterviewReady ?? true}
                  onCheckedChange={(checked) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      notifyInterviewReady: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  onClick={handleSettingsSave}
                  disabled={localSaving === 'settings'}
                >
                  {localSaving === 'settings' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Notification Preferences
                </Button>
              </div>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </>
  );
}
