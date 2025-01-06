import { Employee } from '../data/employees';
import { Response } from '../types';

export const exportToExcel = (
  employees: Employee[],
  responses: Response[],
  event: { companyName: string; date: string }
) => {
  // Add BOM for UTF-8 encoding
  const BOM = '\uFEFF';
  
  // Create CSV content
  const headers = ['Ad Soyad', 'Katılım Durumu'];
  const rows = employees.map((employee) => {
    const response = responses.find((r) => r.employeeId === employee.id);
    const status = response?.attending === true 
      ? 'Katılacak' 
      : response?.attending === false 
      ? 'Katılmayacak' 
      : 'Yanıt Bekliyor';
    
    // Wrap values in quotes to handle commas in names
    return [`"${employee.name}"`, `"${status}"`];
  });

  const csvContent = [
    [`"${event.companyName} - ${event.date}"`],
    [],
    headers.map(h => `"${h}"`),
    ...rows
  ]
    .map(row => row.join(';')) // Use semicolon as separator for better Excel compatibility
    .join('\n');

  // Create and download file with BOM
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `ARKETIPO_DESIGN_davet_${event.date}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};