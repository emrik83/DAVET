import React, { useState } from 'react';
import { Building2, Users, Plus } from 'lucide-react';
import { employees } from './data/employees';
import { EventList } from './components/EventList';
import { ResponseTable } from './components/ResponseTable';
import { EventForm } from './components/EventForm';
import { AdminAuth } from './components/auth/AdminAuth';
import { Header } from './components/Header';
import { Event, Response } from './types';

// Initial events data
const initialEvents: Event[] = [
  {
    id: 1,
    companyName: 'ARKETIPO DESIGN',
    date: '2024-03-20',
    location: 'İstanbul Ofis',
    startTime: '09:00',
    endTime: '17:00',
    transportation: 'service',
    visibleTo: employees.map(emp => emp.id) // Initially visible to all employees
  },
];

function App() {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [currentEmployeeId, setCurrentEmployeeId] = useState(1);
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id'>>({
    companyName: '',
    date: '',
    location: '',
    startTime: '',
    endTime: '',
    transportation: 'service',
    visibleTo: []
  });

  const handleResponseChange = (employeeId: number, attending: boolean) => {
    if (!selectedEventId) return;
    setResponses((prev) => {
      const existingResponse = prev.find(
        (r) => r.eventId === selectedEventId && r.employeeId === employeeId
      );
      if (existingResponse) {
        return prev.map((r) =>
          r.eventId === selectedEventId && r.employeeId === employeeId
            ? { ...r, attending }
            : r
        );
      }
      return [...prev, { eventId: selectedEventId, employeeId, attending }];
    });
  };

  const handleEmployeeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentEmployeeId(Number(event.target.value));
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.companyName || !newEvent.date) return;
    const newId = Math.max(0, ...events.map(e => e.id)) + 1;
    setEvents(prev => [...prev, { ...newEvent, id: newId }]);
    setNewEvent({
      companyName: '',
      date: '',
      location: '',
      startTime: '',
      endTime: '',
      transportation: 'service',
      visibleTo: []
    });
    setShowEventForm(false);
  };

  const handleDeleteEvent = (eventId: number) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    setResponses(prev => prev.filter(r => r.eventId !== eventId));
    if (selectedEventId === eventId) {
      setSelectedEventId(null);
    }
  };

  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      setShowAdminAuth(true);
    }
  };

  const handleAdminAuth = (isAuthenticated: boolean) => {
    setIsAdmin(isAuthenticated);
    setShowAdminAuth(false);
  };

  // Filter events based on visibility
  const visibleEvents = events.filter(event => 
    isAdmin || event.visibleTo.includes(currentEmployeeId)
  );

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Header
            isAdmin={isAdmin}
            currentEmployeeId={currentEmployeeId}
            onEmployeeChange={handleEmployeeChange}
            onAdminToggle={handleAdminToggle}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="space-y-4">
                {isAdmin && (
                  <div className="bg-white rounded-lg shadow-md p-4">
                    {showEventForm ? (
                      <EventForm
                        newEvent={newEvent}
                        onEventChange={setNewEvent}
                        onSubmit={handleAddEvent}
                        onCancel={() => setShowEventForm(false)}
                      />
                    ) : (
                      <button
                        onClick={() => setShowEventForm(true)}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Yeni Davet Ekle</span>
                      </button>
                    )}
                  </div>
                )}
                <EventList
                  events={visibleEvents}
                  onSelectEvent={setSelectedEventId}
                  selectedEventId={selectedEventId}
                  isAdmin={isAdmin}
                  onDeleteEvent={handleDeleteEvent}
                />
              </div>
            </div>
            <div className="md:col-span-2">
              {selectedEvent ? (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-2">
                      {selectedEvent.companyName}
                    </h2>
                    <p className="text-gray-600">Tarih: {selectedEvent.date}</p>
                  </div>
                  <ResponseTable
                    employees={employees.filter(emp => 
                      isAdmin || selectedEvent.visibleTo.includes(emp.id)
                    )}
                    responses={responses.filter(r => r.eventId === selectedEventId)}
                    onResponseChange={handleResponseChange}
                    isAdmin={isAdmin}
                    currentEmployeeId={currentEmployeeId}
                    selectedEvent={selectedEvent}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                  Lütfen soldaki listeden bir davet seçin
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showAdminAuth && <AdminAuth onLogin={handleAdminAuth} />}
    </div>
  );
}

export default App;