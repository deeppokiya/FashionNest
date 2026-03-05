import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { getProfile, updateProfile } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone_number: user?.phone_number || '',
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      zip_code: user?.zip_code || '',
      country: user?.country || '',
    }
  });

  useEffect(() => {
    // Always fetch fresh profile data when component mounts
    dispatch(getProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone_number || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zip_code: user.zip_code || '',
        country: user.country || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      console.log('📝 Submitting profile data:', data);
      await dispatch(updateProfile(data)).unwrap();
      // Fetch the latest profile data to ensure UI shows updated information
      await dispatch(getProfile());
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('❌ Profile update error:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="form-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 className="form-title">Profile</h2>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="btn btn-secondary"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                className="form-control"
                {...register('first_name', { required: 'First name is required' })}
                disabled={!isEditing}
              />
              {errors.first_name && <span style={{ color: 'red', fontSize: '14px' }}>{errors.first_name.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                className="form-control"
                {...register('last_name', { required: 'Last name is required' })}
                disabled={!isEditing}
              />
              {errors.last_name && <span style={{ color: 'red', fontSize: '14px' }}>{errors.last_name.message}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={user?.email || ''}
              disabled
              style={{ backgroundColor: '#f8f9fa' }}
            />
            <small style={{ color: '#666' }}>Email cannot be changed</small>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-control"
              {...register('phone_number', {
                pattern: {
                  value: /^\+?1?\d{9,15}$/,
                  message: 'Invalid phone number'
                }
              })}
              disabled={!isEditing}
            />
            {errors.phone_number && <span style={{ color: 'red', fontSize: '14px' }}>{errors.phone_number.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              className="form-control"
              rows="3"
              {...register('address')}
              disabled={!isEditing}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-control"
                {...register('city')}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                className="form-control"
                {...register('state')}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">ZIP Code</label>
              <input
                type="text"
                className="form-control"
                {...register('zip_code')}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Country</label>
              <input
                type="text"
                className="form-control"
                {...register('country')}
                disabled={!isEditing}
              />
            </div>
          </div>

          {isEditing && (
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Save Changes
            </button>
          )}
        </form>

        {/* Account Information */}
        <div style={{ marginTop: '3rem' }}>
          <h3>Account Information</h3>
          <div className="card">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <strong>Username:</strong>
                <p>{user?.username}</p>
              </div>
              <div>
                <strong>Member Since:</strong>
                <p>{user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 