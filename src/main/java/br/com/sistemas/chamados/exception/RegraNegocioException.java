package br.com.sistemas.chamados.exception;


/**Lançada quando um recurso procurado não existe (vira HTPP 409) */
public class RegraNegocioException extends RuntimeException {
    public RegraNegocioException(String mensagem) {
        super(mensagem);
    }    
}
