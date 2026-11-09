import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, Eye } from 'lucide-react';
import { clientes } from '../api/resources.js';
import { Alert, Empty, Loading, PageTitle, confirmDelete } from '../components/UI.jsx';

export default function Clientes() {
  const [lista, setLista] = useState(null);
  const [busca, setBusca] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [excluindo, setExcluindo] = useState(null);
  const carregar = () => clientes.listar().then(setLista).catch((e) => setError(e.message));
  useEffect(() => { carregar(); }, []);
  const filtrada = useMemo(() => (lista || []).filter((c) => [c.nome, c.email, c.telefone, c.id]
    .some((v) => String(v || '').toLowerCase().includes(busca.toLowerCase()))), [lista, busca]);

  async function excluir(c) {
    if (!confirmDelete(`o cliente “${c.nome}”`)) return;
    setError(''); setSuccess(''); setExcluindo(c.id);
    try { await clientes.excluir(c.id); await carregar(); setSuccess('Cliente excluído com sucesso.'); }
    catch (e) { setError(e.message); }
    finally { setExcluindo(null); }
  }

  return <>
    <PageTitle eyebrow="CADASTROS" title="Clientes" subtitle="Consulte e gerencie as pessoas que solicitam atendimentos."
      action={<Link className="button button-primary" to="/clientes/novo"><Plus size={17} /> Novo cliente</Link>} />
    <Alert error={error} success={success} />
    <section className="panel table-panel">
      <div className="list-toolbar"><h2>Clientes cadastrados <span className="count-label">{lista?.length ?? '...'}</span></h2><div className="search-box"><Search size={17} /><input aria-label="Pesquisar clientes" placeholder="Buscar por nome, e-mail, telefone..." value={busca} onChange={(e) => setBusca(e.target.value)} /></div></div>
      {lista === null ? !error && <Loading /> : filtrada.length === 0 ? <Empty text="Nenhum cliente corresponde à pesquisa." /> : <div className="table-scroll"><table>
        <thead><tr><th>ID</th><th>Nome</th><th>E-mail</th><th>Telefone</th><th className="actions-col">Ações</th></tr></thead>
        <tbody>{filtrada.map((c) => <tr key={c.id}>
          <td className="mono">#{c.id}</td><td><Link className="table-link" to={`/clientes/${c.id}`}>{c.nome}</Link></td>
          <td>{c.email}</td><td className="muted">{c.telefone || '—'}</td>
          <td><div className="actions"><Link className="mini-btn" title="Detalhes" aria-label={`Detalhes de ${c.nome}`} to={`/clientes/${c.id}`}><Eye size={17}/></Link><Link className="mini-btn" title="Editar" aria-label={`Editar ${c.nome}`} to={`/clientes/${c.id}/editar`}><Pencil size={17}/></Link><button type="button" className="mini-btn danger" title="Excluir" aria-label={`Excluir ${c.nome}`} disabled={excluindo === c.id} onClick={() => excluir(c)}><Trash2 size={17}/></button></div></td>
        </tr>)}</tbody>
      </table></div>}
    </section>
  </>;
}
