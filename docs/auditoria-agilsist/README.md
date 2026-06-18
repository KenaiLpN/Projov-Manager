# Auditoria funcional Agilsist x ProSis

Esta pasta registra a auditoria funcional do sistema legado Agilsist e sua
comparacao com o ProSis.

O conjunto atual de rotas do ProSis e o escopo oficial aprovado para o novo
sistema. Funcoes existentes somente no Agilsist nao devem ser classificadas
automaticamente como faltantes.

## Regra de seguranca

O Agilsist e um sistema de producao em uso. Toda a auditoria deve ser executada
em modo estritamente somente leitura.

Permitido:

- autenticar com contas de teste fornecidas;
- navegar por menus e paginas consultivas;
- ler campos, tabelas, filtros, botoes e mensagens;
- registrar evidencias e comparar comportamentos com o codigo do ProSis.

Proibido:

- salvar, cadastrar, editar ou excluir registros;
- confirmar operacoes;
- importar ou enviar arquivos;
- disparar comunicados, avaliacoes ou outros envios;
- executar backup;
- testar botoes cuja acao possa persistir dados;
- armazenar senhas ou outros segredos nesta documentacao.

## Escopo verificado em 15/06/2026

- Login e menu do perfil `Usuario Interno`.
- Login e menu do perfil `Aprendiz`.
- Login e menu do perfil `Parceiro`.
- Inventario das rotas e menus existentes no codigo-fonte atual do ProSis.
- Comparacao inicial em nivel de menu e existencia de pagina.

O perfil `Educador/Funcionario` do Agilsist ainda nao foi verificado porque nao
ha uma conta de teste disponivel.

## Documentos

- [Inventario inicial do Agilsist](./agilsist-inventario-inicial.md)
- [Matriz comparativa inicial](./matriz-comparativa-inicial.md)
- [Acessos internos, Educador e Comunicado Faltas](./acessos-e-comunicado-faltas.md)

## Classificacao usada

- `Equivalente aparente`: existe nos dois sistemas, mas ainda requer comparacao
  detalhada da pagina e das regras.
- `Parcial`: existe no ProSis, mas ha diferencas conhecidas ou funcionalidade
  incompleta.
- `Placeholder`: existe rota/menu no ProSis, mas a funcionalidade ainda nao foi
  implementada.
- `Sem equivalente evidente`: nao foi encontrada rota ou implementacao
  correspondente no codigo atual do ProSis. Essa classificacao nao significa
  que a funcao pertence ao escopo aprovado.
- `Nao verificado`: depende de acesso, navegacao detalhada ou teste que nao pode
  ser feito com seguranca nesta etapa.

## Proximas etapas

1. Comparar cada pagina consultiva do Agilsist com a pagina equivalente do
   ProSis, registrando campos, filtros, tabelas, acoes e regras aparentes.
2. Priorizar as funcoes classificadas como `Placeholder` ou
   `Sem equivalente evidente`.
3. Verificar o perfil `Educador/Funcionario` quando houver uma conta de teste.
4. Atualizar a matriz conforme cada pagina for auditada em profundidade.
