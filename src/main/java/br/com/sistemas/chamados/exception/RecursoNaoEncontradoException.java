package br.com.sistemas.chamados.exception;

/**Lançada quando um recurso procurado não existe (vira HTPP 404) */
public class RecursoNaoEncontradoException extends RuntimeException{
    public RecursoNaoEncontradoException(String mensagem){
        super(mensagem);
    }
}
