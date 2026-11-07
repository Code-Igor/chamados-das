import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Save, X } from 'lucide-react';
import { categorias, tecnicos } from '../api/resources.js';
import { Alert, Empty, Field, Loading, PageTitle, confirmDelete } from '../components/UI.jsx';

const config = {
  categorias: {
    title: 'Categorias', singular: 'categoria', service: categorias,
    subtitle: 'Organize os tipos de solicitação do sistema.',
    empty: { nome: '', descricao: '' },
  },
  tecnicos: {
    title: 'Técnicos', singular: 'técnico', service: tecnicos,
    subtitle: 'Gerencie os profissionais responsáveis pelos atendimentos.',
    empty: { nome: '', email: '', perfil: 'TECNICO' },
  },
};

export default function CadastroPage({ tipo }) {
  const cfg = config[tipo];
  const [lista, setLista] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [form, setForm] = useState({ ...cfg.empty });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function carregar() {
    try { setLista(await cfg.service.listar()); }
    catch (e) { setError(e.message); }
  }
  useEffect(() => {
    setLista(null); setForm({ ...cfg.empty }); setEditId(null);
    setFiltro(''); setError(''); setSuccess('');
    carregar();
  }, [tipo]);
  const filtrada = useMemo(() => (lista || []).filter((r) => Object.values(r).some((v) => String(v || '').toLowerCase().includes(filtro.toLowerCase()))), [lista, filtro]);

  function resetar() { setEditId(null); setForm({ ...cfg.empty }); }
  function editar(item) { setError(''); setSuccess(''); setEditId(item.id); setForm({ ...item }); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  async function salvar(e) {
    e.preventDefault(); setError(''); setSuccess(''); setSaving(true);
    const body = tipo === 'categorias'
      ? { nome: form.nome.trim(), descricao: form.descricao.trim() }
      : { nome: form.nome.trim(), email: form.email.trim(), perfil: form.perfil };
    try {
      if (editId) await cfg.service.atualizar(editId, body);
      else await cfg.service.criar(body);
      const acao = editId ? 'atualizado' : 'cadastrado';
      await carregar(); resetar();
      setSuccess(`Registro ${acao} com sucesso.`);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function excluir(item) {
    if (!confirmDelete(`${tipo === 'tecnicos' ? 'o técnico' : 'a categoria'} “${item.nome}”`)) return;
    setError(''); setSuccess(''); setSaving(true);
    try { await cfg.service.excluir(item.id); if (editId === item.id) resetar(); await carregar(); setSuccess('Registro excluído com sucesso.'); }
    catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  return <>
    <PageTitle eyebrow="CADASTROS" title={cfg.title} subtitle={cfg.subtitle}
      action={<button className="button button-outline" type="button" onClick={() => { resetar(); document.getElementById('cadastro-form')?.scrollIntoView({ behavior: 'smooth' }); }}><Plus size={17}/> Novo cadastro</button>} />
    <Alert error={error} success={success} />
    <div className="crud-layout">
      <section className="panel form-panel" id="cadastro-form">
        <div className="form-heading"><h2>{editId ? `Editar ${cfg.singular}` : `Cadastrar ${cfg.singular}`}</h2><p>Preencha os campos do formulário.</p></div>
        <form onSubmit={salvar}><div className="form-grid single">
          <Field label="Nome" required><input required maxLength={100} value={form.nome || ''} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder={tipo === 'categorias' ? 'Ex.: Hardware' : 'Nome completo'} /></Field>
          {tipo === 'categorias' ? <Field label="Descrição"><textarea rows={4} maxLength={500} value={form.descricao || ''} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Descreva a categoria..." /></Field> : <>
            <Field label="E-mail" required><input required type="email" maxLength={120} value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="tecnico@exemplo.com" /></Field>
            <Field label="Perfil" required><select required value={form.perfil || ''} onChange={(e) => setForm({ ...form, perfil: e.target.value })}><option value="TECNICO">Técnico</option><option value="ADMIN">Administrador</option></select></Field>
          </>}
        </div><div className="form-actions compact">{editId && <button className="button button-outline" type="button" onClick={resetar}><X size={17}/> Cancelar edição</button>}<button className="button button-primary" type="submit" disabled={saving}><Save size={16}/>{saving ? 'Salvando...' : editId ? 'Salvar alterações' : 'Cadastrar'}</button></div></form>
      </section>
      <section className="panel table-panel">
        <div className="panel-header"><div><h2>Lista de {cfg.title.toLowerCase()}</h2><p>{lista?.length ?? '...'} registros</p></div></div>
        <div className="search-row"><div className="search-box"><Search size={17}/><input aria-label="Pesquisar cadastros" value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="Pesquisar..." /></div></div>
        {lista === null ? !error && <Loading /> : filtrada.length === 0 ? <Empty text="Nenhum registro encontrado." /> : <div className="table-scroll"><table>
          <thead><tr><th>ID</th><th>Nome</th><th>{tipo === 'categorias' ? 'Descrição' : 'E-mail'}</th>{tipo === 'tecnicos' && <th>Perfil</th>}<th className="actions-col">Ações</th></tr></thead>
          <tbody>{filtrada.map((item) => <tr key={item.id}>
            <td className="mono">#{item.id}</td><td className="strong-cell">{item.nome}</td><td className="muted truncate-cell">{tipo === 'categorias' ? item.descricao || '—' : item.email}</td>{tipo === 'tecnicos' && <td><span className="soft-tag">{item.perfil}</span></td>}
            <td><div className="actions"><button className="mini-btn" type="button" title="Editar" aria-label={`Editar ${item.nome}`} onClick={() => editar(item)} disabled={saving}><Pencil size={17}/></button><button className="mini-btn danger" title="Excluir" aria-label={`Excluir ${item.nome}`} type="button" onClick={() => excluir(item)} disabled={saving}><Trash2 size={17}/></button></div></td>
          </tr>)}</tbody>
        </table></div>}
      </section>
    </div>
  </>;
}
