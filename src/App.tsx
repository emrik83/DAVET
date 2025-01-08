import React, { useState, useEffect } from 'react';
import { Building2, Users, Plus, Settings } from 'lucide-react';
import { EventList } from './components/EventList';
import { ResponseTable } from './components/ResponseTable';
import { EventForm } from './components/EventForm';
import { AdminAuth } from './components/auth/AdminAuth';
import { Header } from './components/Header';
import { Event, Response } from './types';
import { getEvents, createEvent, addResponse } from './utils/api';
import { EmployeeManagement } from './components/EmployeeManagement';
import { EventEditForm } from './components/EventEditForm';

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [currentEmployeeId, setCurrentEmployeeId] = useState(1);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showEmployeeManagement, setShowEmployeeManagement] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id'>>({
    companyName: '',
    date: '',
    location: '',
    startTime: '',
    endTime: '',
    transportation: 'service',
    visibleTo: []
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getEvents();
      console.log('Gelen etkinlikler:', data);
      setEvents(data);
      setError(null);
    } catch (err) {
      console.error('Etkinlik yükleme hatası:', err);
      setError('Etkinlikler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = async (employeeId: number, attending: boolean) => {
    if (!selectedEventId) return;
    try {
      const response = await addResponse(selectedEventId.toString(), {
        employeeId,
        response: attending ? 'attending' : 'not-attending'
      });
      
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
    } catch (err) {
      console.error('Yanıt gönderme hatası:', err);
      alert('Yanıtınız kaydedilirken bir hata oluştu');
    }
  };

  const handleEmployeeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentEmployeeId(Number(event.target.value));
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.companyName || !newEvent.date) return;
    
    try {
      const createdEvent = await createEvent(newEvent);
      setEvents(prev => [...prev, createdEvent]);
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
    } catch (err) {
      console.error('Etkinlik oluşturma hatası:', err);
      alert('Etkinlik oluşturulurken bir hata oluştu');
    }
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

  const handleEventUpdate = (updatedEvent: Event) => {
    setEvents(prev => prev.map(event => 
      event._id === updatedEvent._id ? updatedEvent : event
    ));
    setEditingEvent(null);
  };

  // Filter events based on visibility
  const visibleEvents = events.filter(event => 
    isAdmin || event.visibleTo.includes(currentEmployeeId)
  );

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

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

          {isAdmin && (
            <div className="mb-6 flex gap-4">
              <button
                onClick={() => setShowEventForm(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Yeni Davet Ekle
              </button>
              <button
                onClick={() => setShowEmployeeManagement(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Users className="w-5 h-5 mr-2" />
                Çalışan Yönetimi
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="space-y-4">
                <EventList
                  events={visibleEvents}
                  onSelectEvent={setSelectedEventId}
                  selectedEventId={selectedEventId}
                  isAdmin={isAdmin}
                  onDeleteEvent={handleDeleteEvent}
                  onEditEvent={setEditingEvent}
                />
              </div>
            </div>
            <div className="md:col-span-2">
              {selectedEvent ? (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-semibold mb-2">
                          {selectedEvent.companyName}
                        </h2>
                        <p className="text-gray-600">Tarih: {selectedEvent.date}</p>
                        <p className="text-gray-600">Saat: {selectedEvent.startTime} - {selectedEvent.endTime}</p>
                        <p className="text-gray-600">Konum: {selectedEvent.location}</p>
                        <p className="text-gray-600">Ulaşım: {selectedEvent.transportation === 'service' ? 'Servis ile' : 'Bireysel'}</p>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => setEditingEvent(selectedEvent)}
                          className="flex items-center px-3 py-1 text-blue-600 hover:text-blue-800"
                        >
                          <Settings className="w-5 h-5 mr-1" />
                          Düzenle
                        </button>
                      )}
                    </div>
                  </div>
                  <ResponseTable
                    employees={visibleEvents.filter(emp => 
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
      
      {showEventForm && (
        <EventForm
          newEvent={newEvent}
          onEventChange={setNewEvent}
          onSubmit={handleAddEvent}
          onCancel={() => setShowEventForm(false)}
        />
      )}

      {showEmployeeManagement && isAdmin && (
        <EmployeeManagement
          onClose={() => setShowEmployeeManagement(false)}
        />
      )}

      {editingEvent && (
        <EventEditForm
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onUpdate={handleEventUpdate}
        />
      )}
    </div>
  );
}

export default App;