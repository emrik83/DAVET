import React from 'react';
import { CalendarCheck, MapPin, Clock, Bus, Car, Trash2 } from 'lucide-react';
import { Event } from '../types';

interface EventListProps {
  events: Event[];
  onSelectEvent: (eventId: number) => void;
  selectedEventId: number | null;
  isAdmin?: boolean;
  onDeleteEvent?: (eventId: number) => void;
}

export const EventList: React.FC<EventListProps> = ({
  events,
  onSelectEvent,
  selectedEventId,
  isAdmin = false,
  onDeleteEvent,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <CalendarCheck className="w-6 h-6 text-indigo-600" />
        <h2 className="text-xl font-semibold">Davetler</h2>
      </div>
      <div className="space-y-2">
        {events.map((event) => (
          <div
            key={event.id}
            className={`relative group ${
              selectedEventId === event.id
                ? 'bg-indigo-100 border-indigo-500'
                : 'bg-gray-50 hover:bg-gray-100'
            } rounded-lg transition-colors`}
          >
            <button
              onClick={() => onSelectEvent(event.id)}
              className="w-full text-left p-4"
            >
              <h3 className="font-medium">{event.companyName}</h3>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{event.startTime} - {event.endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  {event.transportation === 'service' ? (
                    <Bus className="w-4 h-4" />
                  ) : (
                    <Car className="w-4 h-4" />
                  )}
                  <span>
                    {event.transportation === 'service' ? 'Servis ile' : 'Bireysel ulaşım'}
                  </span>
                </div>
              </div>
            </button>
            {isAdmin && onDeleteEvent && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteEvent(event.id);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};