# Auditoria de segurança do ProSis — 02/10/2026

## Resultado e escopo

Foram encontradas falhas relevantes e aplicadas correções no código. Durante a execução surgiram commits no repositório e o reteste público passou a bloquear o token falso na página protegida; o assistente não executou publicação. Há alterações finais ainda locais. O sistema não está homologado como seguro para produção: permanecem pendências de sessão, permissões e configuração da hospedagem descritas abaixo.

Esta entrega é uma auditoria técnica assistida com revisão do código, testes automatizados de ataques em ambiente isolado e verificações públicas de baixo volume. Não representa um laudo de pentest independente, certificação ou garantia de ausência de falhas. A análise abrange Next.js, Fastify, dependências, fontes, histórico Git, artefatos e as rotas registradas; a autorização por objeto foi testada em cenários selecionados. A cobertura de autenticação de todas as rotas não equivale à homologação de cada fluxo de negócio.

O usuário autorizou o domínio `prosis.digital`. No deploy foram feitos GETs anônimos, uma sessão propositalmente inválida, verificação de arquivos públicos e leitura dos scripts do login. Não houve tentativa de senha de uma conta real, alteração de registros, envio de e-mail real, extração de dados de usuários ou teste de carga. Os testes que exercitam escrita, recuperação, brute force e concorrência usaram Prisma e SMTP simulados; o banco real não foi usado.

## Achados e correções

| ID / gravidade | Evidência e impacto | Tratamento local / validação |
| --- | --- | --- |
| SEC-01 / Crítica | Primeiro acesso aceitava CPF/CNPJ/código e uma nova senha para cadastro sem senha, sem comprovação de identidade. | Removido o cadastro direto de senha. Primeiro acesso solicita e-mail cadastrado; definição exige token recebido por e-mail. Payload antigo retorna 400, sem escrita. Interface atualizada. |
| SEC-02 / Alta | Regra de educador liberava `/educadores` por prefixo antes da verificação do próprio registro. | Removida a liberação ampla e adicionadas verificações por rota: próprio perfil GET/PUT, sem criar/excluir ou acessar outro educador. Ataques de IDOR testados com banco simulado. |
| SEC-03 / Média | Middleware apenas decodificava JWT. Na primeira rodada pública, `/home` retornou 200 com token `alg:none`; `/api/proxy/users` retornou 401. Isso abre a estrutura da página, não demonstra vazamento dos dados protegidos pela API. | Middleware verifica assinatura HS256 com Web Crypto e valida expiração, perfil e tipo da sessão. Mesmo ataque local retorna 307; sessão assinada válida funciona. No reteste público de 02/10, `/home` também retornou 307 e a API manteve 401. |
| SEC-04 / Média | Algoritmos JWT não estavam explicitamente restritos. | API e middleware aceitam apenas HS256. Testados none, RS256, HS384, assinatura errada, expirado, sessão incoerente e token de recuperação usado como sessão. |
| SEC-05 / Alta | `trustProxy:true` aceitava X-Forwarded-For arbitrário, comprometendo limites baseados em IP. | Confiança desabilitada por padrão; lista explícita `TRUSTED_PROXY_CIDRS`. Tentativas por conta complementam o limite de transporte. XFF rotativo não contorna o limite no teste direto. Ver ressalvas de NAT/proxy abaixo. |
| SEC-06 / Média | Primeiro acesso/recuperação podiam distinguir contas e o reset não garantia uso único em concorrência. | Respostas de login uniformizadas, bcrypt fictício para contas inexistentes/sem senha; tokens de reset exigem propósito e vínculo ao hash atual; atualização condicional atômica permite somente uma alteração concorrente. SMTP síncrono ainda pode criar diferença de tempo na recuperação. |
| SEC-07 / Média | Educador retornava hash de senha em respostas de criação/alteração. | Serialização remove senha das respostas. Teste insere hash sintético e confirma sua ausência no JSON. |
| SEC-08 / Média | C/E/S podiam alcançar chamados pela API apesar do escopo documentado A/P/T/DEV. | Guard de papel aplicado no plugin de chamados; controles existentes por proprietário/técnico preservados e testados. |
| SEC-09 / Média | Planos/plano curricular repassavam campos do corpo ao Prisma; alocação/capacitação aceitavam corpos sem esquema efetivo. | Listas explícitas de campos, IDs/datas/tamanhos e limites de lote. Campos de identidade, auditoria e privilégios enviados pelo cliente são descartados. |
| SEC-10 / Média | JSON/query duplicados geravam interpretações ambíguas; login Next lia corpo sem limite próprio e reserializava JSON. | Duplicatas e prototype pollution rejeitados; login lê até 16 KiB, exige JSON e encaminha o texto original para preservar a detecção. |
| SEC-11 / Média | Login/logout Next não verificavam explicitamente a origem. | Validação de Origin/Referer/Fetch Metadata, além de cookies HttpOnly/Secure em produção e SameSite=Lax. CSRF e logout externo bloqueados. |
| SEC-12 / Média | Algumas exceções internas eram devolvidas ao navegador e tokens de reset eram registrados em desenvolvimento. | Erros públicos genéricos, mensagens de negócio controladas, remoção de corpos/tokens dos logs globais e redação do log SMTP. Logs livres legados de serviços ainda merecem revisão adicional. |
| SEC-13 / Alta no advisory | Dependência Nodemailer com avisos conhecidos; DOMPurify transitivo com aviso de baixa gravidade. | Nodemailer atualizado para 10.0.13 e DOMPurify para 3.4.16; ambos os locks com `npm audit` zero após atualização. E-mail validado com transporte offline. Não foi demonstrada exploração dessas bibliotecas nesta aplicação. |
| SEC-14 / Média — deploy pendente | Cabeçalho CSP observado em `prosis.digital/login`: somente `upgrade-insecure-requests`, servidor `hcdn`. As restrições de script do código não chegam nessa resposta pública. | CSP local usa nonce e é encaminhado ao Next para seus scripts. No pacote local, navegador bloqueia script sem nonce e eval. Investigar regra do CDN/proxy que substitui o cabeçalho; não inserir nonce fixo no painel. |

Também foram limitadas paginações anteriormente ilimitadas e lotes de presença. Para que a contagem de turmas não consuma centenas de chamadas com o novo limite geral, o calendário agora recebe apenas totais agregados por turma em uma consulta, preservando a contagem de aprendizes distintos. A API independente escuta em loopback por padrão (`API_HOST` explícito para outras topologias); a produção integrada não abre porta adicional.

## Variáveis de ambiente e “Inspecionar elemento”

**Não foram encontrados os valores dos seis segredos locais examinados nas fontes versionáveis, nos blobs Git examinados, nos assets públicos/JavaScript locais, no HTML + 14 scripts públicos do login do deploy no último reteste, nem no artefato de produção analisado.** A comparação inclui formas literal, URL, JSON e base64 e decodifica source maps inline. Os relatórios mostram nomes e caminhos, nunca valores. Achados por padrão foram revisados como exemplos ou credenciais fictícias de testes.

- Nomes examinados: `JWT_SECRET`, `COOKIE_SECRET`, `LOGIN_PROXY_SECRET`, `DATABASE_URL`, `DB_PASSWORD`, `SMTP_PASS`.
- Histórico: 1.532 blobs alcançáveis no Git local no último reteste. Isso não cobre objetos perdidos, repositórios externos, capturas ou backups fora dele.
- No deploy, `/.env`, `/.env.local`, `/apps/api/.env` e `/.git/config` retornaram 403. O teste não leu o ambiente privado do hPanel.
- Não há referência `NEXT_PUBLIC_*` nas fontes de aplicação examinadas. Segredos de servidor não devem receber esse prefixo nem ser retornados em props, JSON, HTML ou logs públicos. [Documentação Next.js](https://nextjs.org/docs/app/guides/environment-variables).
- Desenvolvimento entrega código e source maps para depuração. Isso é esperado e não autoriza expor o servidor dev publicamente; a comparação dos valores examinados não encontrou segredos ali.
- `productionBrowserSourceMaps:false` está explícito; o pós-build remove arquivos `.env` de raiz do standalone. O artefato final examinado (590 arquivos, excluindo dependências/cache) não continha `.env` nem `.map`.
- O JWT de sessão permanece em cookie HttpOnly, não em localStorage/sessionStorage. O cache `projov_user` contém dados de exibição e não é fonte de autorização da API. O usuário pode ver seu próprio cookie no DevTools; HttpOnly impede acesso por JavaScript, não pelo dono do navegador.

A ausência desses valores não prova ausência de todo segredo possível. As credenciais do deploy podem ser diferentes das locais; chaves antigas/desconhecidas ou codificações não cobertas exigem revisão adicional. A auditoria anterior registra exposição em capturas: a rotação continua necessária se ainda não foi feita. Esta rodada não alterou credenciais reais.

## Referências das imagens: o que foi adotado

| Item | Estado e decisão |
| --- | --- |
| HS256 fixo / tokens novos no login | Implementado; `jti` aleatório torna cada emissão distinta. |
| Access token de 15 minutos | **Não implementado.** Sessão atual continua com oito horas; reduzir sem renovação mudaria o uso da aplicação. |
| Refresh token de sete dias, hash no banco e revogação | **Não implementado.** Exige armazenamento persistente, rotação e testes de migração. |
| Logout invalida sessão no servidor | **Pendente.** Hoje remove o cookie; uma cópia do token pode ser reutilizada até expirar. |
| Tokens fora de localStorage | Atendido pela arquitetura atual de cookie HttpOnly. Não foi criada uma segunda cópia em memória do frontend. |
| Fingerprint de navegador | Não tratado como identidade confiável: cabeçalhos são forjáveis. Há limites por conta e por transporte; configuração de proxy deve comprovar IP real. |
| UUID para todos os IDs | Não migrado. IDs imprevisíveis não substituem checagem por proprietário; trocar IDs legados sem migração quebraria relações. [OWASP IDOR](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html). |
| Ownership / mass assignment | Cenários corrigidos/testados acima. Não foi inventada uma matriz de permissões para funções internas sem regra de negócio aprovada. |
| Bloquear palavras SQL/JavaScript em qualquer texto | Não aplicado como blacklist global. React escapa textos, Prisma parametriza valores e schemas limitam tipos/tamanhos. Blacklists de palavras não substituem esses controles e rejeitariam conteúdo legítimo. |
| SQL injection | Não encontrado caminho evidente de SQL raw inseguro na aplicação examinada. Identificadores dinâmicos de `nextId` têm allowlist fechada e teste de injeção; novos totais usam SQL literal sem entrada do cliente. Não foi feito fuzzing contra uma cópia real de todos os dados. |
| XSS / CSP / DOMPurify | Único `dangerouslySetInnerHTML` examinado é bootstrap constante de preferências; não há HTML de usuário nesse ponto. CSP local validada no navegador; CSP efetiva do deploy continua pendente. DOMPurify não foi inserido desnecessariamente em todo texto React. |

## Pendências que impedem encerrar a segurança de produção

1. **Sessões revogáveis:** implementar estado persistente/versão de sessão, logout e invalidação por troca de senha/desativação. Definir renovação segura e duração curta. [OWASP REST Security](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html).
2. **Matriz de autorização:** usuários internos ainda têm acesso amplo em diversos módulos; educadores têm permissões pedagógicas amplas. Definir recurso × ação × perfil e, quando aplicável, vínculo a turma/unidade. As restrições dos menus não bastam.
3. **CDN/Hostinger:** preservar a CSP dinâmica da aplicação e verificar resposta efetiva após publicar. Confirmar IPs dos proxies confiáveis, isolamento da porta da API independente, TLS e cabeçalhos.
4. **Rate limiting em produção:** armazenamento atual é por processo. Reinício zera os contadores e várias instâncias não compartilham estado. O login embedded não dispõe de socket do usuário e usa 300/min agregado + 5/15min por identificador; recuperação usa 3/h por conta e IP. Atrás de proxy sem IP confiável, usuários podem compartilhar o mesmo limite. Homologar a topologia e adotar store compartilhado antes de escalar.
5. **Homologação autenticada externa:** executar matriz com duas contas de teste por perfil/unidade em staging com dados sintéticos e esquema real. Verificar revogação, e-mail, recuperação, geração de cronogramas e permissões de CRUD. As operações de banco nesta auditoria foram simuladas.
6. **Operação:** confirmar rotação de segredos previamente expostos em capturas, revisar retenção/redação dos logs legados, backup/restauração e privilégios da conta MySQL. Essas configurações privadas não foram acessadas.

## Evidências e reprodução

- `npm run test:security`: autenticação, autorização, duplicatas, limites, scanner, transporte de e-mail, middleware e varredura das rotas. Sempre com dados sintéticos.
- `npm run test:regression`, `npm run test:navigation`, `npm run test:settings`, `npm run test:startup`: regressões existentes.
- `npm run security:scan`: fontes, Git, assets e comparação redigida com segredos locais. `-- --origin https://prosis.digital/login` acrescenta somente HTML/scripts públicos, sem login.
- `node scripts/security-public-probe.mjs https://prosis.digital`: conjunto limitado de GETs no domínio explicitamente autorizado; não altera registros nem tenta senhas.
- `npm run build` e `npm run test:deploy`: pacote standalone em ambiente separado, segredos fictícios e banco indisponível.

Evidências redigidas: [deploy público inicial](security-public-deploy.json), [reteste público](security-public-deploy-retest.json), [local](security-public-local.json), [scanner](security-exposure-scan.json), [artefato](security-production-artifact.json), [rotas](security-route-coverage.json), [dependências](security-dependencies.json), [navegador de produção local](security-browser-production.json).

### Resultado final das verificações locais

| Verificação | Resultado |
| --- | --- |
| Segurança | 38 testes aprovados; 336 combinações de método/rota de negócio negaram acesso anônimo antes de qualquer operação no banco simulado. |
| Regressões existentes | 6 testes de respostas, 14 de navegação, 12 de configurações e 10 de inicialização aprovados. |
| Build | `npm run build:all` aprovado em cópia física isolada após instalação pelos locks: Prisma gerado, API compilada e 84 páginas processadas pelo Next. Standalone preparado com API e dependências. |
| Pacote isolado | 9 cenários de integração aprovados (10 testes contados pelo Node, incluindo o teste pai), com cópia do standalone fora do repositório e banco inacessível. Cobrem autenticação, CSRF, limites, validação de corpos, cookies, assinatura JWT em runtime, CSP e healthcheck sem API separada. |
| Navegador | Chrome aprovou primeiro acesso por e-mail, mínimo de senha, sessão assinada e recusa de sessão adulterada; a política CSP obtida do pacote bloqueou inline sem nonce e eval em fixture do navegador. Nenhum erro de JavaScript registrado. API de negócio simulada. |
| Exposição do pacote final | Zero correspondências com os seis segredos examinados, zero erros de leitura e nenhum arquivo `.env`/`.map` no escopo do scanner. |
| Dependências | Auditoria dos dois locks sem vulnerabilidades conhecidas retornadas pelo `npm audit` na execução registrada. |

O primeiro pacote criado com junctions no Windows falhou na cópia independente por faltar `next`; a repetição com dependências físicas passou. O teste de integração também identificou uma resposta CSRF 403 que virava 500 por incompatibilidade do schema; o schema foi corrigido, o pacote recompilado e toda a integração passou novamente. As fontes das alterações finais foram comparadas com a cópia usada no build.

Ambiente de validação: Windows, Node 24.21.0. A hospedagem usa Node 22.x/Linux; a execução no runtime exato da hospedagem e o login com banco real permanecem fora desta homologação local. Os testes não consultaram nem alteraram o banco real e não enviaram e-mail real.

O assistente não executou commit, push, deploy ou migração do banco. Commits surgidos durante a execução foram preservados, assim como as mudanças anteriores de sidebar/configurações.
