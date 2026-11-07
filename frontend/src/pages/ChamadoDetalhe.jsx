import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Send, Trash2, UserRound, CalendarDays, MessageCircle, Save } from 'lucide-react';
import { chamados, comentarios, tecnicos } from '../api/resources.js';
import { Alert, Badge, Empty, Field, Loading, OptionList, PageTitle, STATUS, confirmDelete, dataHora } from '../components/UI.jsx';

export default function ChamadoDetalhe() {
  const { id } = useParams();
  const [chamado, setChamado] = useState(null);
  const [lista, setLista] = useState([]);
  const [equipe, setEquipe] = useState([]);
  const [status, setStatus] = useState('');
  const [tecnicoId, setTecnicoId] = useState('');
  const [texto, setTexto] = useState('');
  const [autor, setAutor] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function sincronizar(c) {
    setChamado(c);
    setStatus(c.status);
    setTecnicoId(c.tecnicoId ? String(c.tecnicoId) : '');
  }
  async function carregar() {
    const [c, msgs, tecs] = await Promise.all([chamados.buscar(id), comentarios.listar(id), tecnicos.listar()]);
    sincronizar(c); setLista(msgs); setEquipe(tecs);
  }
  useEffect(() => {
    let active = true;
    Promise.all([chamados.buscar(id), comentarios.listar(id), tecnicos.listar()])
      .then(([c, msgs, tecs]) => {
        if (!active) return;
        sincronizar(c); setLista(msgs); setEquipe(tecs);
      })
      .catch((e) => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  async function action(task, message) {
    setSaving(true); setError(''); setSuccess('');
    try { const c = await task(); sincronizar(c); setSuccess(message); }
    catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }
  async function comentar(e) {
    e.preventDefault(); setSaving(true); setError(''); setSuccess('');
    try {
      await comentarios.criar(id, { autor: autor.trim(), texto: texto.trim() });
      setTexto('');
      setLista(await comentarios.listar(id));
      setSuccess('Comentário registrado com sucesso.');
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }
  async function excluirComentario(c) {
    if (!confirmDelete(`o comentário #${c.id}`)) return;
    setSaving(true); setError(''); setSuccess('');
    try {
      await comentarios.excluir(id, c.id);
      setLista(await comentarios.listar(id));
      setSuccess('Comentário removido.');
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  return <>
    <Link to="/chamados" className="back-link"><ArrowLeft size={16} /> Voltar para chamados</Link>
    <PageTitle eyebrow="ATENDIMENTO / DETALHE" title={chamado ? `Chamado #${chamado.id}` : `Chamado #${id}`} subtitle={chamado?.titulo || 'Acompanhe este atendimento.'}
      action={chamado && <Link to={`/chamados/${id}/editar`} className="button button-outline"><Pencil size={17}/> Editar chamado</Link>} />
    <Alert error={error} success={success} />
    {loading ? <Loading /> : chamado && <>
      <div className="ticket-layout">
        <div className="ticket-main">
          <section className="panel ticket-card">
            <div className="ticket-card-top"><div><p className="eyebrow">SOLICITAÇÃO #{chamado.id}</p><h2>{chamado.titulo}</h2></div><div className="ticket-badges"><Badge value={chamado.prioridade} type="prioridade"/><Badge value={chamado.status}/></div></div>
            <p className="description-title">Descrição</p><p className="ticket-description">{chamado.descricao}</p>
            <div className="ticket-meta"><span><CalendarDays size={16} /> Aberto em {dataHora(chamado.dataAbertura)}</span>{chamado.dataFechamento && <span><CalendarDays size={16} /> Fechado em {dataHora(chamado.dataFechamento)}</span>}</div>
          </section>
          <section className="panel comments-panel">
            <div className="panel-header"><div><h2><MessageCircle size={20}/> Comentários e interações</h2><p>{lista.length} mensagens registradas</p></div></div>
            {lista.length === 0 ? <Empty text="Ainda não existem comentários para esse chamado." /> : <div className="timeline">{lista.map((c) => <div className="comment" key={c.id}>
              <div className="avatar">{(c.autor || '?').slice(0, 1).toUpperCase()}</div><div className="comment-body"><div className="comment-head"><strong>{c.autor}</strong><span>{dataHora(c.data)}</span><button type="button" className="mini-btn danger" aria-label={`Excluir comentário ${c.id}`} title="Excluir comentário" onClick={() => excluirComentario(c)} disabled={saving}><Trash2 size={15}/></button></div><p>{c.texto}</p></div>
            </div>)}</div>}
            <form onSubmit={comentar} className="comment-form"><h3>Adicionar comentário</h3><div className="form-grid">
              <Field label="Autor" required><input required maxLength={120} value={autor} onChange={(e) => setAutor(e.target.value)} placeholder="Seu nome" /></Field>
              <div className="span-2"><Field label="Mensagem" required><textarea required rows={4} maxLength={5000} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escreva uma atualização sobre o atendimento..." /></Field></div>
            </div><button type="submit" className="button button-primary" disabled={saving}><Send size={16}/> {saving ? 'Enviando...' : 'Enviar comentário'}</button></form>
          </section>
        </div>
        <aside className="ticket-side">
          <section className="panel side-panel"><div className="form-heading"><h2>Gerenciar chamado</h2><p>Altere as informações de atendimento.</p></div>
            <div className="field"><span className="field-label">Status atual</span><select value={status} disabled={saving} onChange={(e) => setStatus(e.target.value)}>{STATUS.map(([v, label]) => <option key={v} value={v}>{label}</option>)}</select></div>
            <button type="button" className="button button-primary button-block" disabled={saving || status === chamado.status} onClick={() => action(() => chamados.alterarStatus(id, status), 'Status atualizado com sucesso.')}><Save size={16}/> Salvar status</button>
            <div className="side-separator"/>
            <div className="field"><span className="field-label">Técnico responsável</span><select disabled={saving} value={tecnicoId} onChange={(e) => setTecnicoId(e.target.value)}><OptionList options={equipe} emptyLabel="Não atribuído" /></select></div>
            <button type="button" className="button button-outline button-block" disabled={saving || !tecnicoId || String(chamado.tecnicoId || '') === tecnicoId} onClick={() => action(() => chamados.atribuirTecnico(id, tecnicoId), 'Técnico atribuído com sucesso.')}><UserRound size={16}/> Atribuir técnico</button>
            <p className="field-hint">Para remover a atribuição, use “Editar chamado”.</p>
          </section>
          <section className="panel side-panel"><h2>Informações</h2><div className="info-vertical">
            <div><span>Cliente</span><Link to={`/clientes/${chamado.clienteId}`}>{chamado.clienteNome}</Link></div>
            <div><span>Categoria</span><strong>{chamado.categoriaNome}</strong></div>
            <div><span>Técnico</span><strong>{chamado.tecnicoNome || 'Não atribuído'}</strong></div>
            <div><span>Prioridade</span><Badge value={chamado.prioridade} type="prioridade" /></div>
          </div></section>
        </aside>
      </div>
    </>}
  </>;
}
