
package br.com.sistemas.chamados.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import br.com.sistemas.chamados.dto.ComentarioRequest;
import br.com.sistemas.chamados.dto.ComentarioResponse;
import br.com.sistemas.chamados.entity.Chamado;
import br.com.sistemas.chamados.entity.Comentario;
import br.com.sistemas.chamados.exception.RecursoNaoEncontradoException;
import br.com.sistemas.chamados.repository.ChamadoRepository;
import br.com.sistemas.chamados.repository.ComentarioRepository;

@Service
public class ComentarioService {
    private final ComentarioRepository repository;
    private final ChamadoRepository chamadoRepository;

    public ComentarioService(
        ComentarioRepository repository,
        ChamadoRepository chamadoRepository
    ) {
        this.repository = repository;
        this.chamadoRepository = chamadoRepository;
    }
//
    @Transactional
    public ComentarioResponse criar(Long chamadoId, ComentarioRequest dto) {
        Chamado chamado = chamadoRepository.findById(chamadoId)
            .orElseThrow(() -> new RecursoNaoEncontradoException(
                "Chamado " + chamadoId + " não encontrado"
            ));

        Comentario comentario = new Comentario();
        comentario.setTexto(dto.texto());
        comentario.setAutor(dto.autor());
        comentario.setChamado(chamado);

        return ComentarioResponse.de(repository.save(comentario));
    }
    @Transactional(readOnly = true)
    public List<ComentarioResponse> listarPorChamado(Long chamadoId) {
        if (!chamadoRepository.existsById(chamadoId)) {
            throw new RecursoNaoEncontradoException(
                "Chamado " + chamadoId + " não encontrado"
            );
        }
        return repository.findByChamadoIdOrderByDataAsc(chamadoId)
            .stream()
            .map(ComentarioResponse::de)
            .toList();
    }

    @Transactional
    public void excluir(Long comentarioId) {
        Comentario comentario = repository.findById(comentarioId)
            .orElseThrow(() -> new RecursoNaoEncontradoException(
                "Comentário " + comentarioId + " não encontrado"
            ));

        repository.delete(comentario);
    }
}