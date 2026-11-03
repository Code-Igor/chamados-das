package br.com.sistemas.chamados.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.sistemas.chamados.dto.CategoriaRequest;
import br.com.sistemas.chamados.dto.CategoriaResponse;
import br.com.sistemas.chamados.entity.Categoria;
import br.com.sistemas.chamados.exception.RecursoNaoEncontradoException;
import br.com.sistemas.chamados.repository.CategoriaRepository;

@Service
public class CategoriaService {

    private final CategoriaRepository repository;

    public CategoriaService(CategoriaRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public CategoriaResponse criar(CategoriaRequest dto) {
        if (dto.nome() == null || dto.nome().isBlank()) {
            throw new IllegalArgumentException("Nome da categoria é obrigatório");
        }

        Categoria categoria = new Categoria(
            dto.nome(),
            dto.descricao() == null ? "" : dto.descricao()
        );

        return CategoriaResponse.de(repository.save(categoria));
    }

    @Transactional(readOnly = true)
    public List<CategoriaResponse> listar() {
        return repository.findAll().stream()
            .map(CategoriaResponse::de)
            .toList();
    }

    @Transactional(readOnly = true)
    public CategoriaResponse buscar(Long id) {
        return CategoriaResponse.de(buscarEntity(id));
    }

    @Transactional
    public CategoriaResponse atualizar(Long id, CategoriaRequest dto) {
        Categoria categoria = buscarEntity(id);

        if (dto.nome() == null || dto.nome().isBlank()) {
            throw new IllegalArgumentException("Nome da categoria é obrigatório");
        }

        categoria.setNome(dto.nome());
        categoria.setDescricao(dto.descricao() == null ? "" : dto.descricao());

        return CategoriaResponse.de(categoria);
    }

    @Transactional
    public void excluir(Long id) {
        repository.delete(buscarEntity(id));
    }

    private Categoria buscarEntity(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException(
                "Categoria " + id + " não encontrada"
            ));
    }
}