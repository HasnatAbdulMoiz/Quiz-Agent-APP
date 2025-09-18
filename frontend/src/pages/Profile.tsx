import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/api';
import { UserUpdate } from '../types';
import {
  User,
  Mail,
  Calendar,
  Shield,
  Edit,
  Save,
  X,
  Key,
  Bell,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserUpdate>({
    defaultValues: {
      full_name: user?.full_name || '',
      email: user?.email || '',
      username: user?.username || '',
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: UserUpdate) => apiService.updateUser(user?.id || 0, data),
    onSuccess: () => {
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error) => {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
    },
  });

  const onSubmit = (data: UserUpdate) => {
    updateProfileMutation.mutate(data);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const getRoleBadge = (role: string) => {
    const roleStyles = {
      admin: 'bg-red-100 text-red-800',
      teacher: 'bg-blue-100 text-blue-800',
      student: 'bg-green-100 text-green-800',
    };
    
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${roleStyles[role as keyof typeof roleStyles]}`}>
        {role}
      </span>
    );
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Key },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-2 text-gray-600">Manage your account settings and preferences</p>
      </div>

      {/* Profile Header */}
      <div className="card">
        <div className="flex items-center space-x-6">
          <div className="flex-shrink-0">
            <div className="h-20 w-20 rounded-full bg-primary-600 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user?.full_name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{user?.full_name}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <div className="mt-2 flex items-center space-x-4">
              {getRoleBadge(user?.role || '')}
              <span className="text-sm text-gray-500">
                Member since {new Date(user?.created_at || '').toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-secondary inline-flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm inline-flex items-center ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>
          
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label htmlFor="full_name" className="form-label">
                    Full Name
                  </label>
                  <input
                    {...register('full_name', { required: 'Full name is required' })}
                    type="text"
                    className="input"
                  />
                  {errors.full_name && (
                    <p className="form-error">{errors.full_name.message}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    type="email"
                    className="input"
                  />
                  {errors.email && (
                    <p className="form-error">{errors.email.message}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="username" className="form-label">
                    Username
                  </label>
                  <input
                    {...register('username', { required: 'Username is required' })}
                    type="text"
                    className="input"
                  />
                  {errors.username && (
                    <p className="form-error">{errors.username.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-secondary inline-flex items-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="btn btn-primary inline-flex items-center"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Full Name</label>
                  <p className="text-gray-900">{user?.full_name}</p>
                </div>
                <div>
                  <label className="form-label">Email Address</label>
                  <p className="text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <label className="form-label">Username</label>
                  <p className="text-gray-900">{user?.username}</p>
                </div>
                <div>
                  <label className="form-label">Role</label>
                  <div className="mt-1">{getRoleBadge(user?.role || '')}</div>
                </div>
                <div>
                  <label className="form-label">Account Status</label>
                  <p className={`text-sm font-medium ${user?.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    {user?.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div>
                  <label className="form-label">Member Since</label>
                  <p className="text-gray-900">
                    {new Date(user?.created_at || '').toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'security' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>
          <div className="space-y-6">
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">Change Password</h4>
              <p className="text-sm text-gray-600 mb-4">
                Update your password to keep your account secure.
              </p>
              <button className="btn btn-secondary">
                Change Password
              </button>
            </div>
            
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600 mb-4">
                Add an extra layer of security to your account.
              </p>
              <button className="btn btn-secondary">
                Enable 2FA
              </button>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">Login Sessions</h4>
              <p className="text-sm text-gray-600 mb-4">
                Manage your active login sessions across devices.
              </p>
              <button className="btn btn-secondary">
                View Sessions
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-md font-medium text-gray-900">Email Notifications</h4>
                <p className="text-sm text-gray-600">Receive notifications via email</p>
              </div>
              <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-md font-medium text-gray-900">Quiz Reminders</h4>
                <p className="text-sm text-gray-600">Get reminded about upcoming quizzes</p>
              </div>
              <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-md font-medium text-gray-900">Results Notifications</h4>
                <p className="text-sm text-gray-600">Get notified when quiz results are available</p>
              </div>
              <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-md font-medium text-gray-900">System Updates</h4>
                <p className="text-sm text-gray-600">Receive updates about new features</p>
              </div>
              <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Application Settings</h3>
          <div className="space-y-6">
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">Theme</h4>
              <p className="text-sm text-gray-600 mb-4">Choose your preferred theme</p>
              <div className="flex space-x-4">
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Light
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Dark
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Auto
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">Language</h4>
              <p className="text-sm text-gray-600 mb-4">Select your preferred language</p>
              <select className="input w-48">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">Time Zone</h4>
              <p className="text-sm text-gray-600 mb-4">Set your local time zone</p>
              <select className="input w-48">
                <option value="UTC">UTC</option>
                <option value="EST">Eastern Time</option>
                <option value="PST">Pacific Time</option>
                <option value="GMT">Greenwich Mean Time</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <div className="card border-red-200">
        <h3 className="text-lg font-semibold text-red-900 mb-6">Danger Zone</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-md font-medium text-gray-900">Delete Account</h4>
              <p className="text-sm text-gray-600">
                Permanently delete your account and all associated data
              </p>
            </div>
            <button className="btn btn-danger">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
