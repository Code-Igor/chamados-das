import { request, queryString } from './client.js';

function criarCrud(base) {
  return {
    listar: () => request(base),
    buscar: (id) => request(`${base}/${id}`),
    criar: (data) => request(base, { method: 'POST', body: data }),
    atualizar: (id, data) => request(`${base}/${id}`, { method: 'PUT', body: data }),
    excluir: (id) => request(`${base}/${id}`, { method: 'DELETE' }),
  };
}

export const clientes = criarCrud('/clientes');
export const categorias = criarCrud('/categorias');
export const tecnicos = criarCrud('/tecnicos');

export const chamados = {
  ...criarCrud('/chamados'),
  listar: (filtros = {}) => request(`/chamados${queryString(filtros)}`),
  alterarStatus: (id, status) => request(`/chamados/${id}/status`, {
    method: 'PATCH', body: { status },
  }),
  atribuirTecnico: (id, tecnicoId) => request(`/chamados/${id}/tecnico`, {
    method: 'PATCH', body: { tecnicoId: Number(tecnicoId) },
  }),
};

export const comentarios = {
  listar: (chamadoId) => request(`/chamados/${chamadoId}/comentarios`),
  criar: (chamadoId, data) => request(`/chamados/${chamadoId}/comentarios`, {
    method: 'POST', body: data,
  }),
  excluir: (chamadoId, id) => request(`/chamados/${chamadoId}/comentarios/${id}`, {
    method: 'DELETE',
  }),
};
