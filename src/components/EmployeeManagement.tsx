import React, { useState, useEffect } from 'react';
import { Employee } from '../types';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../utils/api';
import { UserPlus, UserMinus, Edit, Save, X } from 'lucide-react';

interface EmployeeManagementProps {
  onClose: () => void;
}

export const EmployeeManagement: React.FC<EmployeeManagementProps> = ({ onClose }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    name: '',
    department: '',
    role: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await getEmployees();
      setEmployees(data);
      setError(null);
    } catch (err) {
      setError('Çalışanlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const savedEmployee = await createEmployee(newEmployee);
      setEmployees(prev => [...prev, savedEmployee]);
      setNewEmployee({ name: '', department: '', role: '' });
      setShowAddForm(false);
    } catch (err) {
      setError('Çalışan eklenirken bir hata oluştu');
    }
  };

  const handleUpdateEmployee = async (id: number, data: Partial<Employee>) => {
    try {
      const updatedEmployee = await updateEmployee(id, data);
      setEmployees(prev => prev.map(emp => emp.id === id ? updatedEmployee : emp));
      setEditingId(null);
    } catch (err) {
      setError('Çalışan güncellenirken bir hata oluştu');
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (!window.confirm('Bu çalışanı silmek istediğinizden emin misiniz?')) return;
    try {
      await deleteEmployee(id);
      setEmployees(prev => prev.filter(emp => emp.id !== id));
    } catch (err) {
      setError('Çalışan silinirken bir hata oluştu');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-4">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Çalışan Yönetimi</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Yeni Çalışan Ekle
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddEmployee} className="mb-6 p-4 border rounded-lg">
          <div className="grid grid-cols-1 gap-4">
            <input
              type="text"
              placeholder="Ad Soyad"
              value={newEmployee.name}
              onChange={e => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
              className="px-3 py-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Departman"
              value={newEmployee.department}
              onChange={e => setNewEmployee(prev => ({ ...prev, department: e.target.value }))}
              className="px-3 py-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Pozisyon"
              value={newEmployee.role}
              onChange={e => setNewEmployee(prev => ({ ...prev, role: e.target.value }))}
              className="px-3 py-2 border rounded"
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Kaydet
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                İptal
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left">Ad Soyad</th>
              <th className="px-4 py-2 text-left">Departman</th>
              <th className="px-4 py-2 text-left">Pozisyon</th>
              <th className="px-4 py-2 text-left">Durum</th>
              <th className="px-4 py-2 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(employee => (
              <tr key={employee.id} className="border-t">
                <td className="px-4 py-2">
                  {editingId === employee.id ? (
                    <input
                      type="text"
                      value={employee.name}
                      onChange={e => setEmployees(prev =>
                        prev.map(emp => emp.id === employee.id ? { ...emp, name: e.target.value } : emp)
                      )}
                      className="px-2 py-1 border rounded"
                    />
                  ) : (
                    employee.name
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingId === employee.id ? (
                    <input
                      type="text"
                      value={employee.department}
                      onChange={e => setEmployees(prev =>
                        prev.map(emp => emp.id === employee.id ? { ...emp, department: e.target.value } : emp)
                      )}
                      className="px-2 py-1 border rounded"
                    />
                  ) : (
                    employee.department
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingId === employee.id ? (
                    <input
                      type="text"
                      value={employee.role}
                      onChange={e => setEmployees(prev =>
                        prev.map(emp => emp.id === employee.id ? { ...emp, role: e.target.value } : emp)
                      )}
                      className="px-2 py-1 border rounded"
                    />
                  ) : (
                    employee.role
                  )}
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-sm ${employee.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {employee.active ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  {editingId === employee.id ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleUpdateEmployee(employee.id, employee)}
                        className="p-1 text-green-600 hover:text-green-800"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 text-gray-600 hover:text-gray-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingId(employee.id)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee.id)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <UserMinus className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 