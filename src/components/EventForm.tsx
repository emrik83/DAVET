import React from 'react';
import { Event } from '../types';
import { employees } from '../data/employees';

interface EventFormProps {
  newEvent: Omit<Event, 'id'>;
  onEventChange: (event: Omit<Event, 'id'>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const EventForm: React.FC<EventFormProps> = ({
  newEvent,
  onEventChange,
  onSubmit,
  onCancel
}) => {
  const handleEmployeeToggle = (employeeId: number) => {
    const newVisibleTo = newEvent.visibleTo.includes(employeeId)
      ? newEvent.visibleTo.filter(id => id !== employeeId)
      : [...newEvent.visibleTo, employeeId];
    onEventChange({ ...newEvent, visibleTo: newVisibleTo });
  };

  const handleSelectAll = () => {
    onEventChange({ ...newEvent, visibleTo: employees.map(emp => emp.id) });
  };

  const handleDeselectAll = () => {
    onEventChange({ ...newEvent, visibleTo: [] });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Firma Adı
        </label>
        <input
          type="text"
          value={newEvent.companyName}
          onChange={(e) => onEventChange({ ...newEvent, companyName: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Tarih
        </label>
        <input
          type="date"
          value={newEvent.date}
          onChange={(e) => onEventChange({ ...newEvent, date: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Konum
        </label>
        <input
          type="text"
          value={newEvent.location}
          onChange={(e) => onEventChange({ ...newEvent, location: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Başlangıç Saati
          </label>
          <input
            type="time"
            value={newEvent.startTime}
            onChange={(e) => onEventChange({ ...newEvent, startTime: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Bitiş Saati
          </label>
          <input
            type="time"
            value={newEvent.endTime}
            onChange={(e) => onEventChange({ ...newEvent, endTime: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Ulaşım
        </label>
        <select
          value={newEvent.transportation}
          onChange={(e) => onEventChange({ ...newEvent, transportation: e.target.value as 'service' | 'individual' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        >
          <option value="service">Servis ile</option>
          <option value="individual">Bireysel ulaşım</option>
        </select>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Görüntüleyebilecek Çalışanlar
          </label>
          <div className="space-x-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Tümünü Seç
            </button>
            <button
              type="button"
              onClick={handleDeselectAll}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Tümünü Kaldır
            </button>
          </div>
        </div>
        <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-1">
          {employees.map((employee) => (
            <label
              key={employee.id}
              className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer"
            >
              <input
                type="checkbox"
                checked={newEvent.visibleTo.includes(employee.id)}
                onChange={() => handleEmployeeToggle(employee.id)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm">{employee.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          type="submit"
          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          Kaydet
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
        >
          İptal
        </button>
      </div>
    </form>
  );
};