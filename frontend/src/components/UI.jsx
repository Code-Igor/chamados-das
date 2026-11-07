import React from 'react';
import { AlertCircle, CheckCircle2, Inbox, LoaderCircle } from 'lucide-react';

export const STATUS = [
  ['ABERTO', 'Aberto'],
  ['EM_ANDAMENTO', 'Em andamento'],
  ['PENDENTE', 'Pendente'],
  ['FECHADO', 'Fechado'],
  ['CANCELADO', 'Cancelado'],
];
export const PRIORIDADES = [
  ['BAIXA', 'Baixa'],
  ['MEDIA', 'Média'],
  ['ALTA', 'Alta'],
  ['CRITICA', 'Crítica'],
];

const STATUS_MAP = Object.fromEntries(STATUS);
const PRIORIDADE_MAP = Object.fromEntries(PRIORIDADES);
export const nomeStatus = (v) => STATUS_MAP[v] || v || '—';
export const nomePrioridade = (v) => PRIORIDADE_MAP[v] || v || '—';
export const dataHora = (v) => v ? new Date(v).toLocaleString('pt-BR', {
  dateStyle: 'short', timeStyle: 'short',
}) : '—';

export function Badge({ value, type = 'status' }) {
  const text = type === 'prioridade' ? nomePrioridade(value) : nomeStatus(value);
  const cls = String(value || 'none').replace(/[^\w-]/g, '').toLowerCase();
  return <span className={`badge badge-${type} badge-${cls}`}>{text}</span>;
}

export function Alert({ error, success }) {
  if (!error && !success) return null;
  return <div className={`alert ${error ? 'alert-error' : 'alert-success'}`} role="alert">
    {error ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
    <span>{error || success}</span>
  </div>;
}

export function Loading() {
  return <div className="loading"><LoaderCircle size={22} className="spin" /> Carregando dados...</div>;
}

export function Empty({ text = 'Nenhum registro encontrado.' }) {
  return <div className="empty"><Inbox size={30} strokeWidth={1.5} /><p>{text}</p></div>;
}

export function PageTitle({ eyebrow, title, subtitle, action }) {
  return <div className="page-heading">
    <div>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {subtitle && <p className="subtitle">{subtitle}</p>}
    </div>
    {action && <div className="page-action">{action}</div>}
  </div>;
}

export function Field({ label, required, hint, children }) {
  return <label className="field">
    <span className="field-label">{label}{required && <span className="required"> *</span>}</span>
    {children}
    {hint && <span className="field-hint">{hint}</span>}
  </label>;
}

export function OptionList({ options, emptyLabel = 'Selecione...' }) {
  return <><option value="">{emptyLabel}</option>{options.map((item) =>
    <option key={item.id} value={item.id}>{item.nome}</option>
  )}</>;
}

export function confirmDelete(nome = 'este registro') {
  return window.confirm(`Deseja realmente excluir ${nome}? Esta ação não pode ser desfeita.`);
}
