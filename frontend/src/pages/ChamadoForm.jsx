import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { chamados, categorias, clientes, tecnicos } from '../api/resources.js';
import { Alert, Field, Loading, OptionList, PageTitle, PRIORIDADES } from '../components/UI.jsx';

const empty = { titulo: '', descricao: '', prioridade: 'MEDIA', clienteId: '', categoriaId: '', tecnicoId: '' };

export default function ChamadoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [refs, setRefs] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    Promise.all([clientes.listar(), categorias.listar(), tecnicos.listar(), id ? chamados.buscar(id) : Promise.resolve(null)])
      .then(([clis, cats, tecs, c]) => {
        if (!active) return;
        setRefs({ clientes: clis, categorias: cats, tecnicos: tecs });
        if (c) setForm({ titulo: c.titulo, descricao: c.descricao, prioridade: c.prioridade, clienteId: String(c.clienteId), categoriaId: String(c.categoriaId), tecnicoId: c.tecnicoId ? String(c.tecnicoId) : '' });
      })
      .catch((e) => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const update = (e) => setForm((v) => ({ ...v, [e.target.name]: e.target.value }));
  async function salvar(e) {
    e.preventDefault(); setError(''); setSaving(true);
    const data = {
      titulo: form.titulo.trim(), descricao: form.descricao.trim(), prioridade: form.prioridade,
      clienteId: Number(form.clienteId), categoriaId: Number(form.categoriaId),
      tecnicoId: form.tecnicoId ? Number(form.tecnicoId) : null,
    };
    try {
      const c = id ? await chamados.atualizar(id, data) : await chamados.criar(data);
      navigate(`/chamados/${c.id}`);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  return <>
    <Link to={id ? `/chamados/${id}` : '/chamados'} className="back-link"><ArrowLeft size={16}/> Voltar para chamados</Link>
    <PageTitle eyebrow="ATENDIMENTO / CHAMADOS" title={id ? `Editar chamado #${id}` : 'Abrir novo chamado'} subtitle="Registre a solicitação e vincule cliente, categoria e técnico." />
    <Alert error={error} />
    {loading ? <Loading /> : refs && <section className="panel form-panel"><form onSubmit={salvar}>
      <div className="form-heading"><h2>Informações do chamado</h2><p>O status inicial será Aberto. Campos com * são obrigatórios.</p></div>
      <div className="form-grid">
        <div className="span-2"><Field label="Título" required><input name="titulo" required maxLength={150} value={form.titulo} onChange={update} placeholder="Resumo da solicitação" /></Field></div>
        <div className="span-2"><Field label="Descrição" required><textarea rows={5} name="descricao" required maxLength={5000} value={form.descricao} onChange={update} placeholder="Descreva o problema com detalhes..." /></Field></div>
        <Field label="Cliente" required><select required name="clienteId" value={form.clienteId} onChange={update}><OptionList options={refs.clientes}/></select></Field>
        <Field label="Categoria" required><select required name="categoriaId" value={form.categoriaId} onChange={update}><OptionList options={refs.categorias}/></select></Field>
        <Field label="Prioridade" required><select name="prioridade" value={form.prioridade} onChange={update}>{PRIORIDADES.map(([v, n]) => <option value={v} key={v}>{n}</option>)}</select></Field>
        <Field label="Técnico responsável" hint="Opcional no cadastro"><select name="tecnicoId" value={form.tecnicoId} onChange={update}><OptionList options={refs.tecnicos} emptyLabel="Não atribuído" /></select></Field>
      </div>
      {(!refs.clientes.length || !refs.categorias.length) && <div className="alert alert-warning">Cadastre pelo menos um cliente e uma categoria antes de abrir um chamado.</div>}
      <div className="form-actions"><Link to="/chamados" className="button button-outline">Cancelar</Link><button className="button button-primary" disabled={saving || !refs.clientes.length || !refs.categorias.length}><Save size={17}/>{saving ? 'Salvando...' : id ? 'Salvar alterações' : 'Criar chamado'}</button></div>
    </form></section>}
  </>;
}
