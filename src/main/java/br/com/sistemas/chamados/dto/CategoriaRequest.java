package br.com.sistemas.chamados.dto;

import jakarta.validation.constraints.Size;

public record CategoriaRequest(
    @Size(max=100,message="Nome deve ter no máximo 100 caracteres")
    String nome,

    @Size(max=500,message="Descrição deve ter no máximo 500 caracteres")
    String descricao

) {}


