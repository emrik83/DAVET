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
            {!isAdmin && <th className="px-4 py-2 text-right">İşlem</th>}
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
                  {isCurrentUser && !isAdmin && " (Siz)"}
                </td>
                <td className="px-4 py-2 text-center">
                  {response ? (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
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
                {!isAdmin && isCurrentUser && (
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onResponseChange(employee.id, true)}
                        className={`px-3 py-1 rounded-md flex items-center ${
                          response?.attending 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
                        }`}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Katılıyorum
                      </button>
                      <button
                        onClick={() => onResponseChange(employee.id, false)}
                        className={`px-3 py-1 rounded-md flex items-center ${
                          response?.attending === false
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                        }`}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Katılmıyorum
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
        {isAdmin && (
          <tfoot>
            <tr className="bg-gray-50">
              <td colSpan={2} className="px-4 py-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">Toplam: </span>
                    {employees.length} kişi
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <span className="font-medium text-green-600">Katılacak: </span>
                      {responses.filter(r => r.attending).length} kişi
                    </div>
                    <div>
                      <span className="font-medium text-red-600">Katılmayacak: </span>
                      {responses.filter(r => !r.attending).length} kişi
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Yanıt Bekleyen: </span>
                      {employees.length - responses.length} kişi
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};