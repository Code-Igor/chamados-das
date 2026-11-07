import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { clientes } from '../api/resources.js';
import { Alert, Field, Loading, PageTitle } from '../components/UI.jsx';

export default function ClienteForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ nome: '', email: '', telefone: '' });
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!id) return;
    clientes.buscar(id).then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [id]);
  const update = (e) => setData((v) => ({ ...v, [e.target.name]: e.target.value }));

  async function salvar(e) {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const body = { nome: data.nome.trim(), email: data.email.trim(), telefone: data.telefone.trim() };
      const salvo = id ? await clientes.atualizar(id, body) : await clientes.criar(body);
      navigate(`/clientes/${salvo.id}`);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  return <>
    <Link to="/clientes" className="back-link"><ArrowLeft size={16}/> Voltar para clientes</Link>
    <PageTitle eyebrow="CADASTROS / CLIENTES" title={id ? 'Editar cliente' : 'Novo cliente'} subtitle="Preencha os dados básicos do cliente." />
    <Alert error={error} />
    {loading ? <Loading /> : <section className="panel form-panel"><form onSubmit={salvar}>
      <div className="form-heading"><h2>Dados do cliente</h2><p>Os campos com * são obrigatórios.</p></div>
      <div className="form-grid">
        <Field label="Nome completo" required><input name="nome" required maxLength={100} value={data.nome || ''} onChange={update} placeholder="Nome do cliente" /></Field>
        <Field label="E-mail" required><input name="email" type="email" required maxLength={120} value={data.email || ''} onChange={update} placeholder="cliente@exemplo.com" /></Field>
        <Field label="Telefone"><input name="telefone" type="tel" maxLength={20} value={data.telefone || ''} onChange={update} placeholder="(47) 99999-9999" /></Field>
      </div>
      <div className="form-actions"><Link to="/clientes" className="button button-outline">Cancelar</Link><button type="submit" className="button button-primary" disabled={saving}><Save size={17} />{saving ? 'Salvando...' : 'Salvar cliente'}</button></div>
    </form></section>}
  </>;
}
