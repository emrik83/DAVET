export interface Event {
  id: number;
  companyName: string;
  date: string;
  location: string;
  startTime: string;
  endTime: string;
  transportation: 'service' | 'individual';
  visibleTo: number[]; // Array of employee IDs who can see this event
}

export interface Response {
  eventId: number;
  employeeId: number;
  attending: boolean;
}