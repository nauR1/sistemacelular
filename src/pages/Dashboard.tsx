import React from 'react';
import { 
  Users, 
  Laptop, 
  Wrench, 
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

export function Dashboard() {
  const stats = [
    { name: 'Clientes Ativos', value: '521', icon: Users, change: '+4.75%', changeType: 'increase' },
    { name: 'Aparelhos em Reparo', value: '42', icon: Laptop, change: '-1.39%', changeType: 'decrease' },
    { name: 'OS Abertas', value: '38', icon: Wrench, change: '+2.45%', changeType: 'increase' },
    { name: 'Itens com Estoque Baixo', value: '12', icon: Package, change: '+5.23%', changeType: 'increase' },
  ];

  const recentOrders = [
    { id: 1, customer: 'João Silva', device: 'iPhone 12', status: 'Em análise', date: '2024-03-10' },
    { id: 2, customer: 'Maria Santos', device: 'Notebook Dell', status: 'Aguardando peça', date: '2024-03-09' },
    { id: 3, customer: 'Pedro Oliveira', device: 'Impressora HP', status: 'Em reparo', date: '2024-03-08' },
    { id: 4, customer: 'Ana Costa', device: 'Samsung S21', status: 'Pronto', date: '2024-03-07' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.name}
              className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
            >
              <dt>
                <div className="absolute bg-indigo-500 rounded-md p-3">
                  <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 text-sm font-medium text-gray-500 truncate">{item.name}</p>
              </dt>
              <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
                <p
                  className={`ml-2 flex items-baseline text-sm font-semibold ${
                    item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {item.change}
                </p>
              </dd>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Ordens Recentes</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentOrders.map((order) => (
              <div key={order.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-indigo-600 truncate">{order.customer}</p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {order.status}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      <Laptop className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      {order.device}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                    <p>{order.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Alertas</h3>
          </div>
          <div className="p-4 divide-y divide-gray-200">
            <div className="flex items-start space-x-3 py-3">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">5 itens com estoque abaixo do mínimo</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 py-3">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">12 aparelhos prontos para entrega</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 py-3">
              <Clock className="h-5 w-5 text-blue-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">8 ordens atrasadas</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 py-3">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Receita aumentou 15% esta semana</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}