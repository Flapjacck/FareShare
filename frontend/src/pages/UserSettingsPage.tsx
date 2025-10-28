import { useMemo, useState, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { apiPatch, apiPost, API_BASE_URL } from "../utils/api";
import type { User } from "../types";

type Mode = "rider" | "driver";

interface UpdateProfileData {
  full_name?: string;
  email?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  vehicle_color?: string;
  vehicle_license_plate?: string;
}

interface PasswordChangeData {
  current_password: string;
  new_password: string;
}

export default function UserSettingsPage() {
  const { user, setUser } = useAuth();
  const [mode, setMode] = useState<Mode>("rider");
  
  // Modal states
  const [showPersonalModal, setShowPersonalModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // File input ref for avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Format the join date
  const joinDate = useMemo(() => {
    if (!user?.created_at) return "Unknown";
    const date = new Date(user.created_at);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [user?.created_at]);

  // Generate user initials for avatar
  const userInitials = useMemo(() => {
    if (!user?.full_name) return "?";
    return user.full_name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user?.full_name]);

  // Check if user has vehicle info (is a driver)
  const hasVehicle = useMemo(() => {
    return !!(user?.vehicle_make || user?.vehicle_model);
  }, [user?.vehicle_make, user?.vehicle_model]);

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a JPEG, PNG, GIF, or WebP image');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/users/me/avatar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('fareshare_token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to upload avatar');
      }

      const data = await response.json();
      
      // Update user with new avatar URL
      if (user) {
        setUser({ ...user, avatar_url: data.avatar_url });
      }
      
      setSuccessMessage('Profile picture updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle profile update
  const handleUpdateProfile = async (data: UpdateProfileData) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedUser = await apiPatch<User>('/api/users/me', data);
      setUser(updatedUser);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Close modals
      setShowPersonalModal(false);
      setShowVehicleModal(false);
      setShowEmailModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (data: PasswordChangeData) => {
    setIsLoading(true);
    setError(null);

    try {
      await apiPatch('/api/users/me/password', data);
      setSuccessMessage('Password changed successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      setShowPasswordModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle data export request
  const handleDataExport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiPost<{ message: string; request_id: string }>('/api/users/me/export');
      setSuccessMessage(response.message);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request data export');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiPost<{ message: string }>('/api/users/me/delete');
      setSuccessMessage(response.message);
      // Logout after a delay
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate action sections - MUST be before early return to maintain hook order
  const actionSections = useMemo(() => {
    const base = [
      { 
        label: "Personal details", 
        helper: "name, phone number, ...",
        onClick: () => setShowPersonalModal(true)
      },
      { 
        label: "Email address",
        onClick: () => setShowEmailModal(true)
      },
    ];

    if (mode === "driver") {
      return [
        ...base.slice(0, 1),
        { 
          label: "Vehicles", 
          helper: "car, license plate, insurance",
          onClick: () => setShowVehicleModal(true)
        },
        ...base.slice(1),
      ];
    }

    return base;
  }, [mode]);

  // Early return AFTER all hooks
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background-warm)' }}>
        <p className="text-lg" style={{ color: 'var(--color-primary)' }}>Loading user profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background-warm)' }}>
      {/* Hidden file input for avatar upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleAvatarUpload}
        className="hidden"
      />

      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
          <button onClick={() => setError(null)} className="float-right ml-4 font-bold">×</button>
          {error}
        </div>
      )}

      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        <section className="bg-white rounded-xl shadow-sm" style={{ border: '1px solid var(--color-secondary)' }}>
          <div className="px-4 pt-4 flex justify-center">
            <div className="inline-flex rounded-full overflow-hidden" style={{ border: '1px solid var(--color-secondary)', backgroundColor: 'var(--color-background-warm)' }}>
              {(["rider", "driver"] as const).map((value) => {
                const isActive = mode === value;
                const baseClasses =
                  "px-6 py-2 text-sm font-semibold transition focus:outline-none";
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMode(value)}
                    className={baseClasses}
                    style={
                      isActive
                        ? { backgroundColor: 'var(--color-primary)', color: 'white' }
                        : { color: '#4a5568' }
                    }
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'rgba(var(--color-primary-rgb), 0.1)';
                        e.currentTarget.style.color = 'var(--color-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#4a5568';
                      }
                    }}
                  >
                    {value === "rider" ? "Rider" : "Driver"}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-6 py-6">
            <h1 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-primary)' }}>
              Settings
            </h1>
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
              <div className="flex flex-col items-center gap-3">
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.full_name}
                    className="h-32 w-32 rounded-full object-cover"
                    style={{ border: '4px solid var(--color-secondary)' }}
                  />
                ) : (
                  <div 
                    className="h-32 w-32 rounded-full flex items-center justify-center text-4xl font-bold text-white"
                    style={{ backgroundColor: 'var(--color-primary)', border: '4px solid var(--color-secondary)' }}
                  >
                    {userInitials}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ color: 'var(--color-accent)' }}
                  onMouseEnter={(e) => !isLoading && (e.currentTarget.style.color = '#2a9db0')}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
                >
                  {isLoading ? 'Uploading...' : 'Upload new photo'}
                </button>
              </div>
              <div className="flex-1 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoPill label={user.full_name} />
                <InfoPill label={`Joined ${joinDate}`} />
                {user.rating_count > 0 && (
                  <InfoPill label={`⭐ ${user.rating_avg.toFixed(1)} (${user.rating_count} reviews)`} />
                )}
                {hasVehicle && (
                  <InfoPill label={`🚗 ${user.vehicle_make || ''} ${user.vehicle_model || ''}`} />
                )}
              </div>
            </div>
          </div>

          <div className="px-4 py-5 sm:px-6" style={{ borderTop: '1px solid var(--color-secondary)', backgroundColor: 'var(--color-background-warm)' }}>
            <div className="space-y-3">
              {actionSections.map(({ label, helper, onClick }) => (
                <button
                  key={label}
                  type="button"
                  onClick={onClick}
                  className="w-full bg-white rounded-lg px-4 py-3 text-left shadow-sm transition-all"
                  style={{ border: '1px solid var(--color-secondary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                    e.currentTarget.style.backgroundColor = 'rgba(var(--color-primary-rgb), 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-secondary)';
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--color-primary)' }}>{label}</p>
                      {helper && (
                        <p className="text-sm text-gray-500">{helper}</p>
                      )}
                    </div>
                    <span className="text-xl" style={{ color: 'var(--color-accent)' }}>›</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 bg-white rounded-xl shadow-sm" style={{ border: '1px solid var(--color-secondary)' }}>
          <div className="px-6 py-5 space-y-4">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-primary)' }}>Security</h2>
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="w-full bg-white rounded-lg px-4 py-3 text-left shadow-sm transition-all"
                style={{ border: '1px solid var(--color-secondary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.backgroundColor = 'rgba(var(--color-primary-rgb), 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-secondary)';
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--color-primary)' }}>
                      Change password
                    </p>
                    <p className="text-sm text-gray-500">
                      Update your current password to keep your account secure.
                    </p>
                  </div>
                  <span className="text-xl" style={{ color: 'var(--color-accent)' }}>›</span>
                </div>
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 bg-white rounded-xl shadow-sm" style={{ border: '1px solid var(--color-secondary)' }}>
          <div className="px-6 py-5 space-y-4">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-primary)' }}>Privacy</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleDataExport}
                disabled={isLoading}
                className="rounded-lg px-4 py-3 text-left shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ border: '1px solid var(--color-secondary)', backgroundColor: 'var(--color-background-warm)' }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                    e.currentTarget.style.backgroundColor = 'rgba(var(--color-primary-rgb), 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-secondary)';
                  e.currentTarget.style.backgroundColor = 'var(--color-background-warm)';
                }}
              >
                <p className="font-semibold" style={{ color: 'var(--color-primary)' }}>Request data export</p>
                <p className="text-sm text-gray-500">
                  Receive a copy of your account data via email.
                </p>
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isLoading}
                className="rounded-lg px-4 py-3 text-left shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ border: '1px solid var(--color-secondary)', backgroundColor: 'var(--color-background-warm)' }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.borderColor = '#dc2626';
                    e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-secondary)';
                  e.currentTarget.style.backgroundColor = 'var(--color-background-warm)';
                }}
              >
                <p className="font-semibold" style={{ color: '#dc2626' }}>Delete account</p>
                <p className="text-sm text-gray-500">
                  Start the process to permanently remove your FareShare account.
                </p>
              </button>
            </div>
          </div>
        </section>

        {/* Personal Details Modal */}
        {showPersonalModal && (
          <EditModal
            title="Edit Personal Details"
            onClose={() => setShowPersonalModal(false)}
            onSave={(data) => handleUpdateProfile({ full_name: data.full_name })}
            isLoading={isLoading}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-primary)' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  defaultValue={user?.full_name}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{ border: '1px solid var(--color-secondary)' }}
                  required
                />
              </div>
            </div>
          </EditModal>
        )}

        {/* Vehicle Details Modal */}
        {showVehicleModal && (
          <EditModal
            title="Edit Vehicle Details"
            onClose={() => setShowVehicleModal(false)}
            onSave={(data) => handleUpdateProfile({
              vehicle_make: data.vehicle_make,
              vehicle_model: data.vehicle_model,
              vehicle_year: data.vehicle_year ? parseInt(data.vehicle_year) : undefined,
              vehicle_color: data.vehicle_color,
              vehicle_license_plate: data.vehicle_license_plate,
            })}
            isLoading={isLoading}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-primary)' }}>
                    Make
                  </label>
                  <input
                    type="text"
                    name="vehicle_make"
                    defaultValue={user?.vehicle_make || ''}
                    placeholder="Toyota"
                    className="w-full px-3 py-2 rounded-lg"
                    style={{ border: '1px solid var(--color-secondary)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-primary)' }}>
                    Model
                  </label>
                  <input
                    type="text"
                    name="vehicle_model"
                    defaultValue={user?.vehicle_model || ''}
                    placeholder="Camry"
                    className="w-full px-3 py-2 rounded-lg"
                    style={{ border: '1px solid var(--color-secondary)' }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-primary)' }}>
                    Year
                  </label>
                  <input
                    type="number"
                    name="vehicle_year"
                    defaultValue={user?.vehicle_year || ''}
                    placeholder="2020"
                    min="1900"
                    max="2030"
                    className="w-full px-3 py-2 rounded-lg"
                    style={{ border: '1px solid var(--color-secondary)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-primary)' }}>
                    Color
                  </label>
                  <input
                    type="text"
                    name="vehicle_color"
                    defaultValue={user?.vehicle_color || ''}
                    placeholder="Blue"
                    className="w-full px-3 py-2 rounded-lg"
                    style={{ border: '1px solid var(--color-secondary)' }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-primary)' }}>
                  License Plate
                </label>
                <input
                  type="text"
                  name="vehicle_license_plate"
                  defaultValue={user?.vehicle_license_plate || ''}
                  placeholder="ABC-1234"
                  className="w-full px-3 py-2 rounded-lg"
                  style={{ border: '1px solid var(--color-secondary)' }}
                />
              </div>
            </div>
          </EditModal>
        )}

        {/* Email Modal */}
        {showEmailModal && (
          <EditModal
            title="Change Email Address"
            onClose={() => setShowEmailModal(false)}
            onSave={(data) => handleUpdateProfile({ email: data.email })}
            isLoading={isLoading}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-primary)' }}>
                  New Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={user?.email}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{ border: '1px solid var(--color-secondary)' }}
                  required
                />
              </div>
              <p className="text-sm text-gray-500">
                You'll need to verify your new email address.
              </p>
            </div>
          </EditModal>
        )}

        {/* Password Modal */}
        {showPasswordModal && (
          <EditModal
            title="Change Password"
            onClose={() => setShowPasswordModal(false)}
            onSave={(data) => handlePasswordChange({
              current_password: data.current_password,
              new_password: data.new_password,
            })}
            isLoading={isLoading}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-primary)' }}>
                  Current Password
                </label>
                <input
                  type="password"
                  name="current_password"
                  className="w-full px-3 py-2 rounded-lg"
                  style={{ border: '1px solid var(--color-secondary)' }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-primary)' }}>
                  New Password
                </label>
                <input
                  type="password"
                  name="new_password"
                  className="w-full px-3 py-2 rounded-lg"
                  style={{ border: '1px solid var(--color-secondary)' }}
                  minLength={8}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters long
                </p>
              </div>
            </div>
          </EditModal>
        )}
      </main>
    </div>
  );
}

function InfoPill({ label }: { label: string }) {
  return (
    <div 
      className="rounded-full px-4 py-2 text-sm font-medium shadow-sm"
      style={{ 
        border: '1px solid var(--color-secondary)', 
        backgroundColor: 'var(--color-background-warm)', 
        color: '#4a5568' 
      }}
    >
      {label}
    </div>
  );
}

interface EditModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSave: (data: any) => void;
  isLoading: boolean;
}

function EditModal({ title, children, onClose, onSave, isLoading }: EditModalProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    onSave(data);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on the backdrop, not when dragging/selecting text
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center" 
      style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
      onMouseDown={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--color-secondary)' }}>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--color-primary)' }}>
            {title}
          </h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4">
            {children}
          </div>
          <div className="px-6 py-4 border-t flex justify-end gap-3" style={{ borderColor: 'var(--color-secondary)' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              style={{ border: '1px solid var(--color-secondary)', color: 'var(--color-primary)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
