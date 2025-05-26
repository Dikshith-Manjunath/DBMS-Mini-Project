'use client';
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';

interface TableData {
  [key: string]: any;
}

const TABLES = [
  { value: 'sales', label: 'Sales' },
  { value: 'categories', label: 'Categories' },
  { value: 'products', label: 'Products' },
  { value: 'customers', label: 'Customers' },
  { value: 'transactions', label: 'Transactions' },
  { value: 'transaction_details', label: 'Transaction Details' },
];

export default function Database() {
  const [selectedTable, setSelectedTable] = useState('sales');
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const limit = 10;

  const fetchTableData = async (table: string, page: number) => {
    setTableLoading(true);
    setTableError('');
    try {
      const response = await fetch(`/api/tables?table=${table}&page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch table data');
      const data = await response.json();
      setTableData(data.data);
      setTotalRows(data.total);
    } catch (err) {
      setTableError('Failed to load table data');
      setTableData([]);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchTableData(selectedTable, currentPage);
  }, [selectedTable, currentPage]);

  const totalPages = Math.ceil(totalRows / limit);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <div className="p-4 sm:p-6 lg:p-8">
        <Header />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Database Tables</h1>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Table
            </label>
            <select
              className="p-2 rounded border dark:bg-gray-800 dark:text-white"
              value={selectedTable}
              onChange={e => {
                setSelectedTable(e.target.value);
                setCurrentPage(1); // Reset to first page on table change
              }}
            >
              {TABLES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              {tableLoading ? (
                <div className="p-8 text-center">Loading...</div>
              ) : tableError ? (
                <div className="p-8 text-center text-red-500">{tableError}</div>
              ) : tableData.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No data available</div>
              ) : (
                <>
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        {Object.keys(tableData[0]).map(col => (
                          <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {tableData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          {Object.keys(row).map(col => {
                            const value = row[col];
                            let displayValue = String(value);
                            
                            // Format values appropriately based on column name and data type
                            if (value === null) {
                              displayValue = '-';
                            } else if (col.toLowerCase().includes('price') || 
                                       col.toLowerCase().includes('amount') || 
                                       col.toLowerCase().includes('cost')) {
                              // Format currency values
                              displayValue = typeof value === 'number' ? 
                                `$${value.toFixed(2)}` : displayValue;
                            } else if (col.toLowerCase().includes('date')) {
                              // Format dates nicely
                              try {
                                const date = new Date(value);
                                if (!isNaN(date.getTime())) {
                                  displayValue = date.toLocaleDateString();
                                }
                              } catch (e) {
                                // If date parsing fails, just use the original string
                              }
                            }
                              return (
                              <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{displayValue}</td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      Showing rows {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalRows)} of {totalRows}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border rounded-md text-sm font-medium
                          disabled:opacity-50 disabled:cursor-not-allowed
                          bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200
                          hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        Previous
                      </button>
                      <button
                        onClick={handleNextPage}
                        disabled={currentPage >= totalPages}
                        className="px-4 py-2 border rounded-md text-sm font-medium
                          disabled:opacity-50 disabled:cursor-not-allowed
                          bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200
                          hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
