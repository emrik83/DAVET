import React, { useState, useEffect } from 'react';
import { Building2, Users, Plus } from 'lucide-react';
import { employees } from './data/employees';
import { EventList } from './components/EventList';
import { ResponseTable } from './components/ResponseTable';
import { EventForm } from './components/EventForm';
import { AdminAuth } from './components/auth/AdminAuth';
import { Header } from './components/Header';
import { Event, Response } from './types';
import { getEvents, createEvent, addResponse } from './utils/api';

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [currentEmployeeId, setCurrentEmployeeId] = useState(1);
  const [showEventForm, setShowEventForm] = useState(false);
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

  // Etkinlikleri yükle
  useEffect(() => {
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

    fetchEvents();
  }, []);

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