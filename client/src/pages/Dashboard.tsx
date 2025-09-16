import { Activity, Users, Shield, Terminal } from 'lucide-react';

export function Dashboard() {
  const stats = [
    { name: 'Active Tools', value: '12', icon: Terminal },
    { name: 'Network Checks', value: '1,234', icon: Activity },
    { name: 'Team Members', value: '8', icon: Users },
    { name: 'Security Score', value: '98%', icon: Shield },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Welcome to OpTools - Your all-in-one operations toolkit
      </p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        {stat.name}
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow text-left">
            <h3 className="font-medium text-gray-900 dark:text-white">Ping Test</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Check server availability</p>
          </button>
          <button className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow text-left">
            <h3 className="font-medium text-gray-900 dark:text-white">Base64 Encode</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Encode text to Base64</p>
          </button>
          <button className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow text-left">
            <h3 className="font-medium text-gray-900 dark:text-white">Generate Password</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Create secure password</p>
          </button>
        </div>
      </div>
    </div>
  );
}