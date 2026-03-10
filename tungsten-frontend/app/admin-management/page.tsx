'use client';

import React, { useState, useEffect } from 'react';
import { Shield, UserPlus, Trash2, CheckCircle, XCircle, Upload, Link as LinkIcon } from "lucide-react";

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    full_name: '',
    permissions_level: 1
  });
  const [presignedUrl, setPresignedUrl] = useState<any>(null);

  const fetchAdmins = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_REST_API}/admins/`);
      if (response.ok) {
        const data = await response.json();
        setAdmins(data);
      }
    } catch (error) {
       console.error("Failed to fetch admins", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_REST_API}/admins/register-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        alert("Admin registered successfully");
        setFormData({ email: '', username: '', password: '', full_name: '', permissions_level: 1 });
        setShowModal(false);
        fetchAdmins();
      } else {
        const err = await response.json();
        alert(err.detail || "Registration failed");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleTestR2 = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_REST_API}/storage/presigned-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          filename: "test.txt", 
          content_type: "text/plain" 
        })
      });
      if (response.ok) {
        const data = await response.json();
        setPresignedUrl(data);
        alert("R2 Presigned URL generated! Check the UI.");
      } else {
        const err = await response.json();
        alert(`Failed: ${err.detail}`);
      }
    } catch (err) {
      alert("Failed to test R2");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto text-black">
        <div className="flex justify-between items-center mb-10 text-black">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 flex items-center">
              <Shield className="mr-3 text-indigo-600 h-10 w-10" /> Admin Panel
            </h1>
            <p className="text-gray-600 mt-2 text-lg">System administration and Cloudflare R2 control center.</p>
          </div>
          
          <div className="space-x-4">
             <button 
                onClick={handleTestR2}
                className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all font-bold"
              >
                <Upload className="mr-2 h-5 w-5" /> Test R2 Utility
              </button>

              <button 
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-bold rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
              >
                <UserPlus className="mr-2 h-5 w-5" /> Add New Admin
              </button>
          </div>
        </div>

        {presignedUrl && (
          <div className="mb-8 p-6 bg-indigo-50 border border-indigo-200 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-500">
            <h3 className="text-indigo-900 font-bold mb-2 flex items-center"><LinkIcon className="mr-2 h-5 w-5" /> R2 Utility Verified</h3>
            <p className="text-indigo-700 text-sm break-all font-mono">
              <strong className="block mb-1">Generated Key:</strong> {presignedUrl.file_key}<br/>
              <strong className="block mt-2 mb-1">Temporary Upload URL:</strong> 
              <span className="text-xs bg-white p-2 rounded block mt-1 border border-indigo-100">{presignedUrl.upload_url}</span>
              <strong className="block mt-4 mb-1">Final Public URL:</strong> 
              <a href={presignedUrl.public_url} target="_blank" className="underline font-bold text-indigo-800">{presignedUrl.public_url}</a>
            </p>
          </div>
        )}

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 text-black">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User Identity</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Auth Level</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Join Date</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Operations</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100 text-black">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 animate-pulse font-medium">Synchronizing with node...</td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium italic">No administrative records detected in database.</td>
                </tr>
              ) : admins.map((admin: any) => (
                <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded inline-block">{admin.user_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${admin.permissions_level >= 3 ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-blue-100 text-blue-800 border border-blue-200'}`}>
                      Level {admin.permissions_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {admin.is_active ? (
                      <span className="flex items-center text-sm text-green-600 font-bold"><CheckCircle className="mr-1.5 h-4 w-4" /> Operational</span>
                    ) : (
                      <span className="flex items-center text-sm text-red-600 font-bold"><XCircle className="mr-1.5 h-4 w-4" /> Locked</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                    {new Date(admin.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold">
                    <button className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-lg transition-colors mr-2">Config</button>
                    <button className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-8 text-center">
            <a href="/" className="text-gray-500 hover:text-indigo-600 font-bold transition-colors">
              ← Return to Dashboard
            </a>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-black animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-4">Initialize Admin Account</h2>
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Username</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Security Code (Pass)</label>
                  <input 
                    type="password" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Operator Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Permissions Override (1-3)</label>
                <input 
                  type="number" 
                  min="1" max="3"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                  value={formData.permissions_level}
                  onChange={(e) => setFormData({...formData, permissions_level: parseInt(e.target.value)})}
                />
              </div>
              <div className="pt-4 flex space-x-3 text-black">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all">Cancel</button>
                <button type="submit" disabled={isRegistering} className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50">
                  {isRegistering ? "Provisioning..." : "Assign Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
