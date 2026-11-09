import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Ticket } from 'lucide-react';
import { clientes, chamados } from '../api/resources.js';
import { Alert, Badge, Empty, Loading, PageTitle, dataHora } from '../components/UI.jsx';

export default function ClienteDetalhe() {
  const { id } = useParams();
  const [cliente, setCliente] = useState(null);
  const [lista, setLista] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([clientes.buscar(id), chamados.listar({ clienteId: id })])
      .then(([pessoa, registros]) => { setCliente(pessoa); setLista(registros); })
      .catch((e) => setError(e.message));
  }, [id]);

  return <>
    <Link to="/clientes" className="back-link"><ArrowLeft size={16} /> Voltar para clientes</Link>
    <PageTitle eyebrow="CADASTROS / CLIENTES" title={cliente?.nome || `Cliente #${id}`} subtitle="Dados cadastrais e solicitações relacionadas."
      action={cliente && <Link className="button button-primary" to={`/clientes/${id}/editar`}><Pencil size={17}/> Editar cliente</Link>} />
    <Alert error={error} />
    {!cliente ? !error && <Loading /> : <>
      <section className="panel detail-overview"><h2>Informações do cliente</h2><div className="info-grid">
        <div><span>ID</span><strong>#{cliente.id}</strong></div><div><span>Nome</span><strong>{cliente.nome}</strong></div>
        <div><span>E-mail</span><strong>{cliente.email}</strong></div><div><span>Telefone</span><strong>{cliente.telefone || 'Não informado'}</strong></div>
      </div></section>
      <section className="panel table-panel"><div className="panel-header"><div><h2>Chamados desse cliente</h2><p>{lista.length} registros encontrados</p></div><Link className="button button-outline button-sm" to="/chamados/novo"><Ticket size={16}/> Novo chamado</Link></div>
        {lista.length === 0 ? <Empty text="Esse cliente ainda não possui chamados." /> : <div className="table-scroll"><table><thead><tr><th>Nº</th><th>Chamado</th><th>Status</th><th>Abertura</th></tr></thead><tbody>{lista.map((c) => <tr key={c.id}><td className="mono">#{c.id}</td><td><Link className="table-link" to={`/chamados/${c.id}`}>{c.titulo}</Link></td><td><Badge value={c.status}/></td><td>{dataHora(c.dataAbertura)}</td></tr>)}</tbody></table></div>}
      </section>
    </>}
  </>;
}
