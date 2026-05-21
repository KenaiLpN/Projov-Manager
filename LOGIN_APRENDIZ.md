# Login de Aprendiz no Frontend

Este documento descreve o fluxo atual de login e navegacao do perfil
`APRENDIZ` no frontend do ProSis.

## Tipo de Acesso

A pagina de login possui seletores para os tipos de acesso:

- `USUARIO`
- `APRENDIZ`
- `EDUCADOR`
- `EMPRESA`

No estado atual, somente `USUARIO` e `APRENDIZ` estao ativos.

Ao enviar o login, o frontend chama:

```http
POST /api/auth/login
```

com o corpo:

```json
{
  "UsuCodigo": "6",
  "senha": "123456",
  "tipoAcesso": "APRENDIZ"
}
```

Para aprendizes, o campo de identificacao aceita o codigo do aprendiz ou CPF.

## Primeiro Acesso

Se a API informar que o aprendiz ainda nao possui senha cadastrada, a tela de
login abre o fluxo de primeiro acesso.

Nesse fluxo o aprendiz informa:

- nova senha;
- confirmacao da nova senha.

A senha precisa ter no minimo 6 caracteres e as duas entradas precisam ser
iguais antes do envio.

## Sessao

Depois do login valido:

- o JWT fica no cookie `token`;
- o usuario retornado pela API e armazenado em `localStorage` com a chave
  `projov_user`;
- o aprendiz e enviado para a propria ficha:

```text
/aprendizes/cadaprendizes?id=<Apr_Codigo>
```

## Restricao de Navegacao

O aprendiz deve acessar somente a propria pagina de cadastro.

O middleware em `src/middleware.ts` identifica tokens de aprendiz pelos claims:

- `role: "APRENDIZ"`;
- `tokenTipo: "APRENDIZ"`;
- `tipoAcesso: "APRENDIZ"`.

Se um token de aprendiz tentar abrir outra pagina protegida, o frontend
redireciona para:

```text
/aprendizes/cadaprendizes?id=<sub do token>
```

## Tela de Cadastro

Na propria ficha, o aprendiz pode atualizar suas informacoes.

Para esse perfil, a interface remove os acessos administrativos:

- menu principal do header;
- menu de notificacoes;
- aba de calendario;
- aba de alocacoes;
- aba de capacitacoes.

As rotas da API continuam sendo a barreira de seguranca principal. A restricao
do frontend existe para orientar a navegacao e evitar exposicao indevida de
telas.
