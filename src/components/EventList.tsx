import React from 'react';
import { Event } from '../types';
import { Edit, Trash2 } from 'lucide-react';

interface EventListProps {
  events: Event[];
  selectedEventId: number | null;
  onSelectEvent: (eventId: number | null) => void;
  isAdmin: boolean;
  onDeleteEvent: (eventId: number) => void;
  onEditEvent: (event: Event) => void;
}

export const EventList: React.FC<EventListProps> = ({
  events,
  selectedEventId,
  onSelectEvent,
  isAdmin,
  onDeleteEvent,
  onEditEvent
}) => {
  const handleDelete = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Bu daveti silmek istediğinizden emin misiniz?')) {
      onDeleteEvent(event.id);
    }
  };

  const handleEdit = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    onEditEvent(event);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Davetler</h2>
      </div>
      <div className="divide-y">
        {events.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Henüz davet bulunmuyor
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              onClick={() => onSelectEvent(event.id)}
              className={`p-4 cursor-pointer hover:bg-gray-50 ${
                selectedEventId === event.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{event.companyName}</h3>
                  <p className="text-sm text-gray-600">
                    {event.date} | {event.startTime} - {event.endTime}
                  </p>
                  <p className="text-sm text-gray-600">{event.location}</p>
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handleEdit(event, e)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="Düzenle"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(event, e)}
                      className="p-1 text-red-600 hover:text-red-800"
                      title="Sil"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};