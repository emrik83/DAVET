import React from 'react';
import { Building2, Users } from 'lucide-react';
import { employees } from '../data/employees';

interface HeaderProps {
  isAdmin: boolean;
  currentEmployeeId: number;
  onEmployeeChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onAdminToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isAdmin,
  currentEmployeeId,
  onEmployeeChange,
  onAdminToggle,
}) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center space-x-2">
        <Building2 className="w-8 h-8 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">
          ARKETIPO DESIGN Davet Sistemi
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        {!isAdmin && (
          <select
            className="rounded-lg border-gray-300 shadow-sm"
            value={currentEmployeeId}
            onChange={onEmployeeChange}
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
        )}
        <button
          onClick={onAdminToggle}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
        >
          <Users className="w-5 h-5" />
          <span>{isAdmin ? 'Çalışan Görünümü' : 'Yönetici Görünümü'}</span>
        </button>
      </div>
    </div>
  );
};