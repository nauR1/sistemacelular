import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Laptop, User, PenTool as Tool, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Device = {
  id: string;
  created_at: string;
  customer_id: string;
  type: string;
  brand: string;
  model: string;
  serial_number: string | null;
  status: string;
  reported_issues: string | null;
  technical_notes: string | null;
  customer: {
    name: string;
    phone: string | null;
  } | null;
};

const deviceTypes = [
  'Notebook',
  'Desktop',
  'Smartphone',
  'Tablet',
  'Impressora',
  'Monitor',
  'Outros'
];

const statusOptions = [
  { value: 'pending_analysis', label: 'Aguardando Análise' },
  { value: 'in_repair', label: 'Em Reparo' },
  { value: 'waiting_parts', label: 'Aguardando Peças' },
  { value: 'ready', label: 'Pronto' },
  { value: 'delivered', label: 'Entregue' }
];

export function Devices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [formData, setFormData] = useState({
    customer_id: '',
    type: deviceTypes[0],
    brand: '',
    model: '',
    serial_number: '',
    status: 'pending_analysis',
    reported_issues: '',
    technical_notes: ''
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDevices();
    fetchCustomers();
  }, []);

  async function fetchDevices() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('devices')
        .select(`
          *,
          customer:customers (
            name,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDevices(data || []);
    } catch (err) {
      console.error('Error fetching devices:', err);
      setError('Erro ao carregar aparelhos');
    } finally {
      setLoading(false);
    }
  }

  async function fetchCustomers() {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Erro ao carregar clientes');
    }
  }

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (selectedDevice) {
        const { error } = await supabase
          .from('devices')
          .update(formData)
          .eq('id', selectedDevice.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('devices')
          .insert([formData]);

        if (error) throw error;
      }

      await fetchDevices();
      setShowModal(false);
      setSelectedDevice(null);
      setFormData({
        customer_id: '',
        type: deviceTypes[0],
        brand: '',
        model: '',
        serial_number: '',
        status: 'pending_analysis',
        reported_issues: '',
        technical_notes: ''
      });
    } catch (err) {
      console.error('Error saving device:', err);
      setError('Erro ao salvar aparelho');
    }
  };

  const handleEdit = (device: Device) => {
    setSelectedDevice(device);
    setFormData({
      customer_id: device.customer_id,
      type: device.type,
      brand: device.brand,
      model: device.model,
      serial_number: device.serial_number || '',
      status: device.status,
      reported_issues: device.reported_issues || '',
      technical_notes: device.technical_notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este aparelho?')) return;

    try {
      const { error } = await supabase
        .from('devices')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchDevices();
    } catch (err) {
      console.error('Error deleting device:', err);
      setError('Erro ao excluir aparelho');
    }
  };

  const filteredDevices = devices.filter(device =>
    device.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.serial_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_analysis':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_repair':
        return 'bg-blue-100 text-blue-800';
      case 'waiting_parts':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    return statusOptions.find(option => option.value === status)?.label || status;
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Aparelhos</h1>
        <button
          onClick={() => {
            setSelectedDevice(null);
            setFormData({
              customer_id: '',
              type: deviceTypes[0],
              brand: '',
              model: '',
              serial_number: '',
              status: 'pending_analysis',
              reported_issues: '',
              technical_notes: ''
            });
            setShowModal(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Novo Aparelho
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <div className="flex items-center">
            <div className="flex-1">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Buscar aparelhos..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="px-4 py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-sm text-gray-500">Carregando aparelhos...</p>
            </div>
          ) : filteredDevices.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <Laptop className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum aparelho encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Tente uma busca diferente.' : 'Comece adicionando um novo aparelho.'}
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aparelho
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detalhes
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDevices.map((device) => (
                  <tr key={device.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <User className="h-10 w-10 text-gray-300" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {device.customer?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {device.customer?.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{device.brand} {device.model}</div>
                      <div className="text-sm text-gray-500">{device.type}</div>
                      {device.serial_number && (
                        <div className="text-xs text-gray-500">S/N: {device.serial_number}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(device.status)}`}>
                        {getStatusLabel(device.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {device.reported_issues && (
                          <p className="mb-1">
                            <span className="font-medium">Problema relatado:</span> {device.reported_issues}
                          </p>
                        )}
                        {device.technical_notes && (
                          <p>
                            <span className="font-medium">Notas técnicas:</span> {device.technical_notes}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(device)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(device.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                  <Laptop className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {selectedDevice ? 'Editar Aparelho' : 'Novo Aparelho'}
                  </h3>
                </div>
              </div>

              <form onSubmit={handleCreateOrUpdate} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="customer" className="block text-sm font-medium text-gray-700">
                    Cliente *
                  </label>
                  <select
                    id="customer"
                    required
                    value={formData.customer_id}
                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">Selecione um cliente</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                      Tipo *
                    </label>
                    <select
                      id="type"
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      {deviceTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Status *
                    </label>
                    <select
                      id="status"
                      required
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                      Marca *
                    </label>
                    <input
                      type="text"
                      id="brand"
                      required
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                      Modelo *
                    </label>
                    <input
                      type="text"
                      id="model"
                      required
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="serial" className="block text-sm font-medium text-gray-700">
                    Número de Série
                  </label>
                  <input
                    type="text"
                    id="serial"
                    value={formData.serial_number}
                    onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="issues" className="block text-sm font-medium text-gray-700">
                    Problema Relatado
                  </label>
                  <textarea
                    id="issues"
                    rows={3}
                    value={formData.reported_issues}
                    onChange={(e) => setFormData({ ...formData, reported_issues: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Notas Técnicas
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    value={formData.technical_notes}
                    onChange={(e) => setFormData({ ...formData, technical_notes: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {selectedDevice ? 'Salvar' : 'Criar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedDevice(null);
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}