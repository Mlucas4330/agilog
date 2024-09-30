import React, { createContext, useContext, useState } from 'react';

const EmpresaContext = createContext();

export const useEmpresa = () => useContext(EmpresaContext);

export const EmpresaProvider = ({ children }) => {
    const [empresa, setEmpresa] = useState('');

    return (
        <EmpresaContext.Provider value={{ empresa, setEmpresa }}>
            {children}
        </EmpresaContext.Provider>
    );
};