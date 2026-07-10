# Login de Aprendiz na API

Este documento descreve o fluxo atual de autenticacao e autorizacao do perfil
`APRENDIZ` na API do ProSis.

## Login

O endpoint de login recebe:

```http
POST /login
```

com o corpo:

```json
{
  "UsuCodigo": "6",
  "senha": "123456",
  "tipoAcesso": "APRENDIZ"
}
```

O campo `tipoAcesso` define a origem usada para validar as credenciais:

- `USUARIO` consulta `CA_Usuarios`;
- `APRENDIZ` consulta `CA_Aprendiz`.

No login de aprendiz, a identificacao pode ser feita por:

- `Apr_Codigo`;
- CPF do aprendiz, com ou sem mascara.

## Senha

O campo de senha do aprendiz e `Apr_senha`.

Quando uma senha e criada ou atualizada, ela deve ser salva como hash bcrypt.
No login, a senha digitada e validada com a comparacao bcrypt contra o hash
armazenado. O hash nao deve ser comparado por igualdade simples com a senha em
texto.

Se o aprendiz ainda nao tiver senha cadastrada, o login responde com o fluxo de
primeiro acesso para que o frontend solicite a criacao da senha.

## JWT de Aprendiz

O token emitido para aprendiz deve manter os claims que identificam esse tipo de
sessao:

```json
{
  "sub": "<Apr_Codigo>",
  "role": "APRENDIZ",
  "tokenTipo": "APRENDIZ",
  "tipoAcesso": "APRENDIZ"
}
```

O `sub` do token e usado para determinar qual registro da tabela
`CA_Aprendiz` pertence ao aprendiz autenticado.

## Autorizacao

A API aplica a restricao do aprendiz no hook global de autenticacao em
`src/server.ts` e reforca as regras nas rotas de `CA_Aprendiz`.

Um token de aprendiz pode:

- buscar o proprio registro com `GET /ca-aprendiz/:id`;
- atualizar o proprio registro com `PUT /ca-aprendiz/:id`;
- consultar listas auxiliares necessarias para preencher o formulario;
- encerrar a sessao com `POST /logout`.

Um token de aprendiz nao pode:

- listar usuarios com `/users`;
- listar aprendizes com `GET /ca-aprendiz`;
- consultar estatisticas de aprendizes;
- abrir a ficha de outro aprendiz;
- criar ou excluir aprendizes;
- acessar rotas administrativas fora da lista permitida.

Quando o aprendiz tenta acessar um recurso fora do escopo permitido, a API
responde com:

```http
403 Forbidden
```

## Listas Auxiliares Liberadas

As consultas `GET` abaixo ficam liberadas para que a propria ficha possa carregar
campos de selecao:

- `/unidade`
- `/instituicoes-parceiras`
- `/parceiros`
- `/escolas`
- `/turmas`
- `/situacao-participante`
- `/areas`
- `/planos`
- `/motivo-desligamento`
- `/grau-parentesco`
- `/municipios`

Qualquer nova dependencia da ficha do aprendiz deve ser avaliada antes de entrar
nessa lista.
