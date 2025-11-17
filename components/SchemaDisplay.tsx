
import React from 'react';
import type { SchemaTable } from '../types';
import { StorageIcon } from './icons';

interface SchemaDisplayProps {
    schema: SchemaTable[] | null;
    isLoading: boolean;
}

const Placeholder: React.FC = () => (
    <div className="text-center p-8">
        <StorageIcon className="w-20 h-20 mx-auto text-indigo-400" />
        <h3 className="mt-4 text-xl font-semibold text-gray-800">Comece descrevendo seu app</h3>
        <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
            Por exemplo: "Quero criar um sistema de e-commerce com usuários, produtos, carrinho de compras e pedidos"
        </p>
    </div>
);

const Loader: React.FC = () => (
    <div className="text-center p-8">
        <StorageIcon className="w-20 h-20 mx-auto text-indigo-400 animate-pulse" />
        <h3 className="mt-4 text-xl font-semibold text-gray-800">Gerando seu schema...</h3>
        <p className="mt-2 text-sm text-gray-500">
            A IA está analisando sua descrição e montando as tabelas e colunas.
        </p>
    </div>
);

export const SchemaDisplay: React.FC<SchemaDisplayProps> = ({ schema, isLoading }) => {
    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center h-full">
                <Loader />
            </div>
        );
    }

    if (!schema) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center h-full">
                <Placeholder />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
            <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Diagrama de Banco de Dados</h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {schema.map((table, tableIndex) => (
                    <div key={tableIndex} className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                        <div className="p-3 bg-gray-100 border-b border-gray-200">
                            <h4 className="font-bold text-gray-800">{table.name}</h4>
                            <p className="text-xs text-gray-500">{table.description}</p>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {table.columns.map((column, colIndex) => (
                                <div key={colIndex} className="p-3 grid grid-cols-3 gap-2 items-start">
                                    <div className="col-span-1">
                                        <p className="text-sm font-medium text-gray-900">{column.name}</p>
                                        <p className="text-xs text-indigo-600 font-mono bg-indigo-100/60 inline-block px-1 rounded">{column.type}</p>
                                    </div>
                                    <div className="col-span-2 text-sm text-gray-600">
                                        {column.description}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
   