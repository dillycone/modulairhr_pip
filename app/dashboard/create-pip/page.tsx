'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatePIP() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    employeeName: '',
    startDate: '',
    endDate: '',
    objectives: '',
    improvements: '',
    metrics: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // do supabase insert or whatever
    router.push('/dashboard'); // or safeNavigate
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Performance Improvement Plan</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="employeeName" className="block text-sm font-medium text-gray-700">
            Employee Name
          </label>
          <input
            type="text"
            id="employeeName"
            name="employeeName"
            value={formData.employeeName}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
        {/* ... date fields, objectives, etc. ... */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
          >
            Create PIP
          </button>
        </div>
      </form>
    </div>
  );
} 