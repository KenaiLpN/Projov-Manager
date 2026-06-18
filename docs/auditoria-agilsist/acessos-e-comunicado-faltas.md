# Acessos internos, Educador e Comunicado Faltas

Levantamento realizado em 15/06/2026.

## Comunicado Faltas

O menu do Agilsist aponta para o identificador `LK_ConsultaFalta`, mas esse
identificador nao existe entre as funcoes cadastradas em `CA_funcoesSistema`.
O usuario interno de teste tambem nao possui entradas em
`CA_AutorizacaoUsuario`.

Com as evidencias atuais, nao foi possivel confirmar:

- a pagina de destino;
- os filtros e campos;
- a regra de negocio;
- quais usuarios deveriam ter acesso.

Por seguranca, a aba do ProSis nao recebeu uma regra inventada. A implementacao
depende de uma evidencia adicional, como acesso de um usuario autorizado,
captura da pagina antiga ou descricao funcional da ONG.

## Autorizacao dos usuarios internos

O Agilsist possui autorizacoes individuais por usuario e funcao:

- `CA_funcoesSistema`: cataloga funcoes e identificadores de formulario;
- `CA_AutorizacaoUsuario`: vincula usuario, funcao e tipo de autorizacao.

O ProSis atualmente diferencia os perfis externos e os tipos internos no token,
mas ainda nao aplica uma matriz completa por rota para os tipos internos.

Nao e seguro criar uma matriz apenas por suposicao sobre os codigos `A`, `C`,
`P`, `T`, `E` e `S`. A ONG deve validar quais secoes cada tipo pode acessar.
Depois disso, a mesma matriz deve proteger menu, middleware do frontend e
endpoints do backend.

## Educador

O ProSis ja suporta:

- login por codigo ou CPF;
- criacao de senha no primeiro acesso;
- token exclusivo `EDUCADOR`;
- acesso restrito ao proprio perfil.

O banco possui 236 educadores cadastrados, mas apenas um registro possui senha.
Nenhuma senha ou identificacao desse registro foi lida ou exposta. Para testar
o perfil com seguranca, deve ser escolhido um educador de teste autorizado pela
ONG e utilizado o fluxo normal de primeiro acesso.

