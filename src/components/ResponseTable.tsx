import React from 'react';
import { Check, X, FileDown } from 'lucide-react';
import { Employee } from '../data/employees';
import { Response } from '../types';
import { exportToExcel } from '../utils/excelExport';
import { AttendanceSummary } from './AttendanceSummary';

interface ResponseTableProps {
  employees: Employee[];
  responses: Response[];
  onResponseChange: (employeeId: number, attending: boolean) => void;
  isAdmin?: boolean;
  currentEmployeeId?: number;
  selectedEvent?: { companyName: string; date: string };
}

export const ResponseTable: React.FC<ResponseTableProps> = ({
  employees,
  responses,
  onResponseChange,
  isAdmin = false,
  currentEmployeeId,
  selectedEvent,
}) => {
  const handleExport = () => {
    if (!selectedEvent) return;
    exportToExcel(employees, responses, selectedEvent);
  };

  // Filter employees based on admin status or current employee
  const displayEmployees = isAdmin
    ? employees
    : employees.filter((emp) => emp.id === currentEmployeeId);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {isAdmin && (
        <>
          <div className="p-4">
            <AttendanceSummary 
              responses={responses} 
              totalEmployees={employees.length} 
            />
          </div>
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileDown className="w-5 h-5" />
              <span>Excel'e Aktar</span>
            </button>
          </div>
        </>
      )}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Çalışan
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Katılım Durumu
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {displayEmployees.map((employee) => {
            const response = responses.find((r) => r.employeeId === employee.id);
            return (
              <tr key={employee.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {isAdmin ? (
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        response?.attending
                          ? 'bg-green-100 text-green-800'
                          : response?.attending === false
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {response?.attending === true
                          ? 'Katılacak'
                          : response?.attending === false
                          ? 'Katılmayacak'
                          : 'Yanıt Bekliyor'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => onResponseChange(employee.id, true)}
                        className={`p-2 rounded-full transition-colors ${
                          response?.attending === true
                            ? 'bg-green-100 text-green-600'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onResponseChange(employee.id, false)}
                        className={`p-2 rounded-full transition-colors ${
                          response?.attending === false
                            ? 'bg-red-100 text-red-600'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};