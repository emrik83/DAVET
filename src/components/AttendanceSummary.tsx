import React from 'react';
import { Users, UserCheck, UserX } from 'lucide-react';
import { Response } from '../types';

interface AttendanceSummaryProps {
  responses: Response[];
  totalEmployees: number;
}

export const AttendanceSummary: React.FC<AttendanceSummaryProps> = ({ responses, totalEmployees }) => {
  const attending = responses.filter(r => r.attending).length;
  const notAttending = responses.filter(r => r.attending === false).length;
  const pending = totalEmployees - attending - notAttending;

  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 text-green-700">
          <UserCheck className="w-5 h-5" />
          <span className="font-medium">Katılacak</span>
        </div>
        <p className="text-2xl font-bold text-green-800 mt-1">{attending}</p>
      </div>
      
      <div className="bg-red-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 text-red-700">
          <UserX className="w-5 h-5" />
          <span className="font-medium">Katılmayacak</span>
        </div>
        <p className="text-2xl font-bold text-red-800 mt-1">{notAttending}</p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 text-gray-700">
          <Users className="w-5 h-5" />
          <span className="font-medium">Yanıt Bekleyen</span>
        </div>
        <p className="text-2xl font-bold text-gray-800 mt-1">{pending}</p>
      </div>
    </div>
  );
};