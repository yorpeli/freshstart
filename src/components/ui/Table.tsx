
import type { TableColumn } from '../../lib/types';

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

function Table<T>({ 
  data, 
  columns, 
  loading = false, 
  emptyMessage = 'No data available',
  className = '' 
}: TableProps<T>) {
  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 h-10 rounded-t-lg mb-2"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-200 h-16 rounded mb-2"></div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`text-center py-12 text-gray-500 ${className}`}>
        <p className="text-lg font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {column.render 
                    ? column.render(item[column.key], item)
                    : String(item[column.key] || '')
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
