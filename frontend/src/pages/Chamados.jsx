import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, Plus, Search, Eye, Pencil, Trash2, RotateCcw } from 'lucide-react';
import { chamados, categorias, tecnicos, clientes } from '../api/resources.js';
import { Alert, Badge, Empty, Loading, OptionList, PageTitle, PRIORIDADES, STATUS, confirmDelete, dataHora } from '../components/UI.jsx';

const limpar = { status: '', prioridade: '', categoriaId: '', tecnicoId: '', clienteId: '' };

export default function Chamados() {
  const [url] = useSearchParams();
  const initial = { ...limpar, clienteId: url.get('clienteId') || '' };
  const [form, setForm] = useState(initial);
  const [filtros, setFiltros] = useState(initial);
  const [texto, setTexto] = useState('');
  const [lista, setLista] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refs, setRefs] = useState({ categorias: [], tecnicos: [], clientes: [] });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all([categorias.listar(), tecnicos.listar(), clientes.listar()])
      .then(([cats, tecs, clis]) => { if (active) setRefs({ categorias: cats, tecnicos: tecs, clientes: clis }); })
      .catch((e) => { if (active) setError(e.message); });
    return () => { active = false; };
  }, []);

  async function carregar() {
    setLoading(true); setError('');
    try { setLista(await chamados.listar(filtros)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { carregar(); }, [filtros]);
  const visiveis = (lista || []).filter((c) => [c.id, c.titulo, c.clienteNome, c.tecnicoNome, c.categoriaNome]
    .some((v) => String(v || '').toLowerCase().includes(texto.toLowerCase())));

  function aplicar(e) { e.preventDefault(); setFiltros({ ...form }); }
  function resetar() { setForm({ ...limpar }); setFiltros({ ...limpar }); setTexto(''); }
  async function excluir(item) {
    if (!confirmDelete(`o chamado #${item.id}`)) return;
    setError(''); setSuccess(''); setDeleting(item.id);
    try { await chamados.excluir(item.id); await carregar(); setSuccess('Chamado excluído com sucesso.'); }
    catch (e) { setError(e.message); }
    finally { setDeleting(null); }
  }

  return <>
    <PageTitle eyebrow="ATENDIMENTO" title="Chamados" subtitle="Acompanhe, filtre e gerencie as solicitações de suporte."
      action={<Link className="button button-primary" to="/chamados/novo"><Plus size={17}/> Novo chamado</Link>} />
    <Alert error={error} success={success} />
    <section className="panel filter-panel"><div className="filter-title"><Filter size={18}/><h2>Filtros</h2></div>
      <form onSubmit={aplicar} className="filter-grid">
        <label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="">Todos os status</option>{STATUS.map(([v, label]) => <option value={v} key={v}>{label}</option>)}</select></label>
        <label>Prioridade<select value={form.prioridade} onChange={(e) => setForm({ ...form, prioridade: e.target.value })}><option value="">Todas</option>{PRIORIDADES.map(([v, label]) => <option value={v} key={v}>{label}</option>)}</select></label>
        <label>Cliente<select value={form.clienteId} onChange={(e) => setForm({ ...form, clienteId: e.target.value })}><OptionList options={refs.clientes} emptyLabel="Todos os clientes" /></select></label>
        <label>Categoria<select value={form.categoriaId} onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}><OptionList options={refs.categorias} emptyLabel="Todas as categorias" /></select></label>
        <label>Técnico<select value={form.tecnicoId} onChange={(e) => setForm({ ...form, tecnicoId: e.target.value })}><OptionList options={refs.tecnicos} emptyLabel="Todos os técnicos" /></select></label>
        <div className="filter-actions"><button className="button button-outline" type="button" onClick={resetar}><RotateCcw size={16}/> Limpar</button><button className="button button-primary" type="submit"><Search size={16}/> Aplicar</button></div>
      </form>
    </section>
    <section className="panel table-panel">
      <div className="list-toolbar"><h2>Lista de chamados <span className="count-label">{lista?.length ?? '...'}</span></h2><div className="search-box"><Search size={17}/><input aria-label="Pesquisar chamados exibidos" placeholder="Buscar na lista filtrada..." value={texto} onChange={(e) => setTexto(e.target.value)} /></div></div>
      {loading ? <Loading /> : lista === null ? null : visiveis.length === 0 ? <Empty text="Nenhum chamado encontrado com os filtros aplicados." /> : <div className="table-scroll"><table>
        <thead><tr><th>Nº</th><th>Chamado</th><th>Cliente</th><th>Prioridade</th><th>Status</th><th>Técnico</th><th>Aberto em</th><th className="actions-col">Ações</th></tr></thead>
        <tbody>{visiveis.map((c) => <tr key={c.id}>
          <td className="mono">#{c.id}</td><td className="title-column"><Link className="table-link" to={`/chamados/${c.id}`}>{c.titulo}</Link><small>{c.categoriaNome}</small></td>
          <td>{c.clienteNome}</td><td><Badge value={c.prioridade} type="prioridade" /></td><td><Badge value={c.status}/></td><td>{c.tecnicoNome || <span className="muted">Não atribuído</span>}</td><td className="muted">{dataHora(c.dataAbertura)}</td>
          <td><div className="actions"><Link className="mini-btn" to={`/chamados/${c.id}`} title="Detalhes"><Eye size={17}/></Link><Link className="mini-btn" to={`/chamados/${c.id}/editar`} title="Editar"><Pencil size={17}/></Link><button className="mini-btn danger" type="button" title="Excluir" disabled={deleting === c.id} onClick={() => excluir(c)}><Trash2 size={17}/></button></div></td>
        </tr>)}</tbody>
      </table></div>}
    </section>
  </>;
}
