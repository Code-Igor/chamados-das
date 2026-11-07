import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Clock3, CircleCheck, Users, ArrowUpRight, Plus, ChevronRight } from 'lucide-react';
import { clientes, chamados, tecnicos } from '../api/resources.js';
import { Alert, Badge, Empty, Loading, PageTitle, STATUS, dataHora } from '../components/UI.jsx';

const palette = ['#5869ed', '#f3a647', '#21b387', '#e36d85', '#98a2b3'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    Promise.all([chamados.listar(), clientes.listar(), tecnicos.listar()])
      .then(([lista, pessoas, equipe]) => { if (active) setData({ lista, pessoas, equipe }); })
      .catch((e) => { if (active) setError(e.message); });
    return () => { active = false; };
  }, []);

  const lista = data?.lista || [];
  const total = lista.length;
  const counts = Object.fromEntries(STATUS.map(([key]) => [key, lista.filter((c) => c.status === key).length]));
  const recentes = [...lista].sort((a, b) => new Date(b.dataAbertura) - new Date(a.dataAbertura)).slice(0, 6);
  const metricas = [
    { titulo: 'Total de chamados', valor: total, icon: Ticket, tone: 'purple', detalhe: 'Todos os registros' },
    { titulo: 'Em andamento', valor: counts.EM_ANDAMENTO, icon: Clock3, tone: 'orange', detalhe: 'Atendimentos ativos' },
    { titulo: 'Finalizados', valor: counts.FECHADO, icon: CircleCheck, tone: 'green', detalhe: 'Chamados fechados' },
    { titulo: 'Clientes cadastrados', valor: data?.pessoas.length || 0, icon: Users, tone: 'blue', detalhe: `${data?.equipe.length || 0} técnicos cadastrados` },
  ];

  return <>
    <PageTitle eyebrow="VISÃO GERAL" title="Dashboard" subtitle="Acompanhe a situação dos chamados e os principais indicadores da operação."
      action={<Link className="button button-primary" to="/chamados/novo"><Plus size={17} /> Abrir chamado</Link>} />
    <Alert error={error} />
    {!data && !error && <Loading />}
    {data && <>
      <div className="metric-grid">
        {metricas.map(({ titulo, valor, icon: Icon, tone, detalhe }) => <div key={titulo} className="metric-card">
          <div className="metric-top"><span>{titulo}</span><span className={`metric-icon ${tone}`}><Icon size={20} /></span></div>
          <div className="metric-number">{valor}</div><div className="metric-foot">{detalhe}</div>
        </div>)}
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header"><div><h2>Chamados por status</h2><p>Distribuição dos atendimentos</p></div><span className="panel-chip">{total} total</span></div>
          {total === 0 ? <Empty text="Abra seu primeiro chamado para visualizar os indicadores." /> : <div className="status-bars">
            {STATUS.map(([key, name], i) => <div className="status-bar" key={key}>
              <div className="bar-label"><span><i style={{ background: palette[i] }} />{name}</span><strong>{counts[key]}</strong></div>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${100 * counts[key] / total}%`, background: palette[i] }} /></div>
            </div>)}
          </div>}
        </section>
        <section className="panel quick-panel">
          <div className="panel-header"><div><h2>Acesso rápido</h2><p>Atalhos para tarefas frequentes</p></div></div>
          {[
            { title: 'Cadastrar cliente', desc: 'Adicionar um novo solicitante', href: '/clientes/novo' },
            { title: 'Novo chamado', desc: 'Registrar uma solicitação', href: '/chamados/novo' },
            { title: 'Gerenciar técnicos', desc: 'Consultar a equipe de suporte', href: '/tecnicos' },
          ].map(({ title, desc, href }) => <Link to={href} key={href} className="quick-link"><span><strong>{title}</strong><small>{desc}</small></span><ChevronRight size={18} /></Link>)}
        </section>
      </div>
      <section className="panel table-panel">
        <div className="panel-header"><div><h2>Chamados recentes</h2><p>Últimas solicitações registradas</p></div><Link to="/chamados" className="text-link">Ver todos <ArrowUpRight size={16} /></Link></div>
        {recentes.length === 0 ? <Empty text="Ainda não há chamados cadastrados." /> : <div className="table-scroll"><table>
          <thead><tr><th>Nº</th><th>Título</th><th>Cliente</th><th>Prioridade</th><th>Status</th><th>Abertura</th></tr></thead>
          <tbody>{recentes.map((c) => <tr key={c.id}>
            <td className="mono">#{c.id}</td><td><Link className="table-link" to={`/chamados/${c.id}`}>{c.titulo}</Link></td>
            <td>{c.clienteNome}</td><td><Badge value={c.prioridade} type="prioridade" /></td>
            <td><Badge value={c.status} /></td><td className="muted">{dataHora(c.dataAbertura)}</td>
          </tr>)}</tbody>
        </table></div>}
      </section>
    </>}
  </>;
}
