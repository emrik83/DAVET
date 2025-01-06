import React, { useState, useEffect } from 'react';
import { EventList } from './components/EventList';
import { ResponseTable } from './components/ResponseTable';
import { EmployeeManagement } from './components/EmployeeManagement';
import { Event, Employee, Response } from './types';
import { API_URL } from './config';
import { Login } from './components/Login';

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showEmployeeManagement, setShowEmployeeManagement] = useState(false);

  useEffect(() => {
    fetchEvents();
    fetchEmployees();
    fetchResponses();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/events`);
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_URL}/employees`);
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchResponses = async () => {
    try {
      const response = await fetch(`${API_URL}/responses`);
      const data = await response.json();
      setResponses(data);
    } catch (error) {
      console.error('Error fetching responses:', error);
    }
  };

  const handleLogin = (employee: Employee, admin: boolean) => {
    setCurrentEmployee(employee);
    setIsAdmin(admin);
  };

  const handleResponseChange = async (employeeId: number, attending: boolean) => {
    if (!selectedEvent) return;

    try {
      const response = await fetch(`${API_URL}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          employeeId,
          attending,
        }),
      });

      if (response.ok) {
        fetchResponses();
      }
    } catch (error) {
      console.error('Error updating response:', error);
    }
  };

  if (!currentEmployee) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Etkinlik Yönetimi</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Hoş geldiniz, {currentEmployee.name}
            </span>
            {isAdmin && (
              <button
                onClick={() => setShowEmployeeManagement(!showEmployeeManagement)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Çalışan Yönetimi
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {showEmployeeManagement && isAdmin ? (
            <EmployeeManagement
              employees={employees}
              onEmployeeUpdate={fetchEmployees}
              onClose={() => setShowEmployeeManagement(false)}
            />
          ) : (
            <>
              <EventList
                events={events}
                selectedEvent={selectedEvent}
                onEventSelect={setSelectedEvent}
                isAdmin={isAdmin}
                onEventUpdate={fetchEvents}
              />
              {selectedEvent && (
                <ResponseTable
                  employees={employees}
                  responses={responses.filter(r => r.eventId === selectedEvent.id)}
                  onResponseChange={handleResponseChange}
                  isAdmin={isAdmin}
                  currentEmployeeId={currentEmployee.id}
                  selectedEvent={selectedEvent}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;