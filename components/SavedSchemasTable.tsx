
import React from 'react';
import type { SavedSchema } from '../types';
import { DeleteIcon, EditIcon } from './icons';

interface SavedSchemasTableProps {
    schemas: SavedSchema[];
}

export const SavedSchemasTable: React.FC<SavedSchemasTableProps> = ({ schemas }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">Schemas Salvos</h3>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {schemas.length} schemas
                </span>
            </div>
            <div className="flex-1 overflow-y-auto">
                <div className="align-middle inline-block min-w-full">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Título
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tabelas
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Data
                                </th>
                                <th scope="col" className="relative px-4 py-3">
                                    <span className="sr-only">Ações</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {schemas.map((schema) => (
                                <tr key={schema.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{schema.title}</div>
                                        <div className="text-xs text-gray-500 truncate max-w-xs">{schema.desc}</div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            {schema.tables} tabela(s)
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {schema.date}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-indigo-600 hover:text-indigo-900 p-1">
                                            <EditIcon className="h-4 w-4" />
                                        </button>
                                        <button className="text-red-600 hover:text-red-900 p-1 ml-2">
                                            <DeleteIcon className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
   