export interface Event {
  _id?: string;
  id: number;
  companyName: string;
  date: string;
  location: string;
  startTime: string;
  endTime: string;
  transportation: string;
  visibleTo: number[];
  responses?: Response[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Response {
  eventId: number;
  employeeId: number;
  attending: boolean;
  timestamp?: string;
}

export interface Employee {
  id: number;
  name: string;
  department: string;
  role: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}