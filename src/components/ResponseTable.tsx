import React from 'react';
import { Event, Employee, Response } from '../types';
import { Check, X } from 'lucide-react';

interface ResponseTableProps {
  employees: Employee[];
  responses: Response[];
  onResponseChange: (employeeId: number, attending: boolean) => void;
  isAdmin: boolean;
  currentEmployeeId: number;
  selectedEvent: Event;
}

export const ResponseTable: React.FC<ResponseTableProps> = ({
  employees,
  responses,
  onResponseChange,
  isAdmin,
  currentEmployeeId,
  selectedEvent
}) => {
  const getResponse = (employeeId: number) => {
    return responses.find(r => r.eventId === selectedEvent.id && r.employeeId === employeeId);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-2 text-left font-medium text-gray-700">Çalışan</th>
            <th className="px-4 py-2 text-center font-medium text-gray-700">Katılım Durumu</th>
            {isAdmin && (
              <th className="px-4 py-2 text-right font-medium text-gray-700">İşlemler</th>
            )}
          </tr>
        </thead>
        <tbody>
          {employees.map(employee => {
            const response = getResponse(employee.id);
            const isCurrentUser = employee.id === currentEmployeeId;

            return (
              <tr key={employee.id} className="border-t">
                <td className="px-4 py-2">
                  {employee.name}
                  {isCurrentUser && (
                    <span className="ml-2 text-sm text-blue-600">(Siz)</span>
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  {response ? (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      response.attending
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {response.attending ? 'Katılıyor' : 'Katılmıyor'}
                    </span>
                  ) : (
                    <span className="text-gray-500">Yanıt Bekliyor</span>
                  )}
                </td>
                <td className="px-4 py-2 text-right">
                  {(isAdmin || isCurrentUser) && (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onResponseChange(employee.id, true)}
                        className={`p-1 rounded ${
                          response?.attending
                            ? 'bg-green-100 text-green-600'
                            : 'hover:bg-green-100 text-gray-400 hover:text-green-600'
                        }`}
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onResponseChange(employee.id, false)}
                        className={`p-1 rounded ${
                          response?.attending === false
                            ? 'bg-red-100 text-red-600'
                            : 'hover:bg-red-100 text-gray-400 hover:text-red-600'
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