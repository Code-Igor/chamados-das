import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Clientes from './pages/Clientes.jsx';
import ClienteForm from './pages/ClienteForm.jsx';
import ClienteDetalhe from './pages/ClienteDetalhe.jsx';
import CadastroPage from './pages/CadastroPage.jsx';
import Chamados from './pages/Chamados.jsx';
import ChamadoForm from './pages/ChamadoForm.jsx';
import ChamadoDetalhe from './pages/ChamadoDetalhe.jsx';

export default function App() {
  return <Layout><Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/clientes" element={<Clientes />} />
    <Route path="/clientes/novo" element={<ClienteForm />} />
    <Route path="/clientes/:id/editar" element={<ClienteForm />} />
    <Route path="/clientes/:id" element={<ClienteDetalhe />} />
    <Route path="/categorias" element={<CadastroPage tipo="categorias" />} />
    <Route path="/tecnicos" element={<CadastroPage tipo="tecnicos" />} />
    <Route path="/chamados" element={<Chamados />} />
    <Route path="/chamados/novo" element={<ChamadoForm />} />
    <Route path="/chamados/:id/editar" element={<ChamadoForm />} />
    <Route path="/chamados/:id" element={<ChamadoDetalhe />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Layout>;
}
