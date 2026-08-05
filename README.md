# Heinz Family Finances

Desenvolva um aplicativo financeiro chamado Família Heinz.

O aplicativo será um PWA (Progressive Web App), totalmente responsivo, otimizado para dispositivos móveis, mas também funcionando perfeitamente no desktop.

A identidade visual deverá utilizar a logo da Família Heinz como ícone do aplicativo, splash screen e identidade da aplicação.

O aplicativo deverá possuir um visual moderno, minimalista, elegante e extremamente organizado.

Utilize como inspiração de layout aplicativos financeiros modernos.

O aplicativo deverá possuir apenas uma tela principal, utilizando apenas modais para cadastros, edições e relatórios.

Layout

Toda a aplicação deverá ficar em uma única tela.

A ordem deverá ser exatamente esta.

TOPO

Na parte superior existirão:

Bolha Saldo

Mostra

Entradas Totais

Saídas Totais

Considerando

Empresa

Pessoal

Se positivo:

verde.

Se negativo:

vermelho.

Atualização em tempo real.

Bolha Entradas

Mostra a soma de todas as entradas:

Empresa

Pessoal.

Bolha Saídas

Mostra a soma de todas as saídas.

Bolha Reserva

Totalmente independente do saldo.

Possui dois botões:

Botão +

Permite adicionar dinheiro à reserva.

Solicita apenas:

Valor

Salvar.

Botão -

Solicita:

Valor

Destino

Salvar

Ao retirar dinheiro da reserva:

Diminui a reserva.

Cria automaticamente uma despesa com o destino informado.

Não altera o saldo principal.

PAINEL EMPRESA

Possui três indicadores.

Total Dívida Mensal

Total Pago

Total a Pagar

Fórmula

Total a Pagar

=

Total Dívida Mensal

Total Pago

Atualização automática.

Ao lado possuir:

Relatório Mensal

Relatório Anual

Relatório Mensal

Seleciona o mês.

Gera PDF contendo:

Data

Descrição

Categoria

Valor

Status

Observações

Totais no final.

Relatório Anual

Seleciona o ano.

Agrupa apenas por categoria.

Exibe:

Janeiro

Categorias

Valores

Total do mês

Repete até dezembro.

Exportação apenas em PDF.

Também possuir:

Botão Renda

Botão Despesa

CADASTRO DE RENDA

Campos

Valor

Categoria

Salvar

Atualiza automaticamente:

Entradas

Saldo

Relatórios

CADASTRO DE DESPESA

Campos

Valor

Categoria

Número de parcelas

Despesa Fixa (checkbox)

Data de vencimento

Salvar

Se parcelado

O sistema deverá dividir automaticamente o valor total pelas parcelas.

Exemplo

1200

12 parcelas

Gera

12 parcelas

de

Se for fixa

Gerar automaticamente a mesma despesa para todos os meses do ano.

PAINEL PESSOAL

Possui exatamente todas as funcionalidades da Empresa.

Os dados são totalmente separados.

Porém os indicadores globais:

Saldo

Entradas

Saídas

somam Empresa + Pessoal.

FILTROS

Existirá um painel de filtros.

Botões

Empresa

Pessoal

Pago

A Pagar

Categoria

Botão ativo

Verde.

Botão inativo

Cinza.

Os filtros deverão funcionar em conjunto.

Exemplo

Empresa

Pago

Mostra apenas contas da empresa pagas.

Pessoal

A Pagar

Mostra apenas contas pessoais pendentes.

Categorias

Tela para:

Cadastrar

Editar

Excluir

Categorias.

Essas categorias serão utilizadas em:

Rendas

Despesas

Relatórios

Filtros

Tabela principal.

LISTA PRINCIPAL

Abaixo dos filtros haverá uma tabela.

Colunas

Categoria

Vencimento

Valor da Parcela

Total

As categorias deverão ser agrupadas.

Exemplo

Mercado

120

Mercado

250

Mercado

80

Resultado

Mercado

450

A tabela deverá ficar ordenada automaticamente pelo vencimento mais próximo.

Coluna Total

Se parcelado

Mostrar valor total.

Exemplo

Parcela

100

Total

1200

Se fixa

Mostrar

Fixa

Se não possuir nenhuma das opções

Mostrar

—

AÇÕES DA LINHA

Ao clicar sobre qualquer categoria deverá abrir um menu.

Opções

Editar

Detalhar

Pagamento Parcial

Pagamento Total

Editar

Permitir alterar qualquer informação.

Detalhar

Mostrar todos os lançamentos daquela categoria.

Cada linha contendo:

Data

Descrição

Valor

Status

Pagamento Parcial

Solicitar

Valor

Salvar.

Atualizar automaticamente:

Saldo

Saídas

Total Pago

Total a Pagar

Continuar aparecendo em

A Pagar

até quitar totalmente.

Pagamento Total

Solicitar confirmação.

Após confirmar:

Mover automaticamente para

Pago.

Atualizar todos os indicadores.

Máscara Monetária

Todos os campos financeiros deverão utilizar máscara automática.

Exemplo

Usuário digita

4550

Campo exibe

R$ 45,50

Usuário nunca digita vírgula.

O sistema faz isso automaticamente.

Aplicar em absolutamente todos os campos monetários.

Atualizações automáticas

Sempre que qualquer movimentação ocorrer, atualizar automaticamente:

Saldo

Entradas

Saídas

Reserva

Total Dívida Mensal

Total Pago

Total a Pagar

Lista

Relatórios

Sem necessidade de atualizar a página.

Banco de dados

Inicialmente utilizar armazenamento local (IndexedDB ou SQLite Web, conforme a stack escolhida).

Toda a estrutura deverá ser preparada para futura migração ao Supabase, sem necessidade de grandes alterações.

PWA

O aplicativo deverá ser totalmente instalável.

Possuir:

 Manifest.

 Service Worker.

 Splash Screen.

 Funcionamento offline para dados locais.

 Ícones do aplicativo.

 Responsivo.

Design

IMPORTANTE

O design é uma das prioridades.

Quero uma interface extremamente bonita, moderna e profissional.

Não utilizar aparência de sistema antigo.

Utilizar:

 Tema escuro.

 Verde como cor principal.

 Vermelho para indicadores negativos.

 Cards modernos.

 Bordas arredondadas.

 Sombras suaves.

 Excelente espaçamento.

 Tipografia moderna.

 Animações suaves.

 Transições elegantes.

 Ícones consistentes.

 Layout limpo.

O aplicativo deve transmitir sensação de software premium.

Você é responsável por projetar a melhor experiência possível para o usuário. Caso alguma funcionalidade descrita possa ser implementada de forma mais intuitiva, sem alterar sua lógica de negócio, faça melhorias de UX/UI mantendo exatamente as regras funcionais descritas. Priorize organização, desempenho, facilidade de uso e um design de alto nível.

IMAGENS: Utilize este desenho apenas como referência de disposição dos elementos e fluxo da tela. Não copie o aspecto visual. O layout final deve ser moderno e profissional, mantendo apenas a organização apresentada neste rascunho.
Utilize este aplicativo apenas como referência de identidade visual.
logo: Utilize esta logo como identidade visual do aplicativo. Gere o PWA utilizando esta logo como ícone, splash screen e referência de branding.
IMPORTANTE Não copie nenhuma das imagens literalmente. As imagens servem apenas como referência. Quero um aplicativo muito mais bonito, moderno e profissional. O design deve seguir padrões atuais de UX/UI. Utilize componentes modernos, espaçamentos consistentes, animações suaves, excelente tipografia e uma experiência premium. A organização deve seguir o desenho enviado, porém o resultado visual deve parecer um aplicativo desenvolvido em 2026 e não um sistema antigo.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4bdc0230-00cd-4fc4-93af-ddd2cb62b31c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
