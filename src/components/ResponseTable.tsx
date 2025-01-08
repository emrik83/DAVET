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
    return responses.find(r => r.employeeId === employeeId);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-2 text-left">Ad Soyad</th>
            <th className="px-4 py-2 text-center">Durum</th>
            {(isAdmin || currentEmployeeId) && (
              <th className="px-4 py-2 text-right">İşlem</th>
            )}
          </tr>
        </thead>
        <tbody>
          {employees.map(employee => {
            const response = getResponse(employee.id);
            const isCurrentEmployee = employee.id === currentEmployeeId;
            const canRespond = isAdmin || isCurrentEmployee;

            return (
              <tr key={employee.id} className="border-t">
                <td className="px-4 py-2">{employee.name}</td>
                <td className="px-4 py-2 text-center">
                  {response ? (
                    <span className={`px-2 py-1 rounded text-sm ${
                      response.attending 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {response.attending ? 'Katılıyor' : 'Katılmıyor'}
                    </span>
                  ) : (
                    <span className="text-gray-500">Yanıt Bekleniyor</span>
                  )}
                </td>
                {canRespond && (
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onResponseChange(employee.id, true)}
                        className={`p-1 rounded ${
                          response?.attending
                            ? 'bg-green-100 text-green-600'
                            : 'text-green-600 hover:bg-green-100'
                        }`}
                        title="Katılıyorum"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onResponseChange(employee.id, false)}
                        className={`p-1 rounded ${
                          response?.attending === false
                            ? 'bg-red-100 text-red-600'
                            : 'text-red-600 hover:bg-red-100'
                        }`}
                        title="Katılmıyorum"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};