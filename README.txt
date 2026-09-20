# Sistema de Pesquisa do TCC — Controle de Almoxarifado

## O que este projeto faz
- Formulário web para as 25 perguntas.
- Campo para nome da pessoa.
- Campo "Antes" ou "Depois".
- Guarda respostas em um banco Supabase.
- Painel administrativo com login.
- Pesquisa por nome.
- Filtro Antes/Depois.
- Quantidade de respostas.
- Percentuais por alternativa.
- Visualização das respostas individuais.

## Configuração
1. Crie uma conta/projeto no Supabase.
2. No SQL Editor, execute `schema.sql`.
3. No Supabase Authentication, crie o usuário administrador (e-mail + senha).
4. Copie a URL e a chave "anon/public" do projeto.
5. Abra `config.js` e substitua:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
6. Publique a pasta em qualquer hospedagem de site estático que vocês tenham autorização para usar.
7. O formulário público é `index.html`.
8. O painel é `admin.html`.

## Importante
A chave ANON/PUBLIC pode aparecer no navegador; isso é normal em aplicações Supabase com RLS. A senha do administrador NÃO deve ser colocada no código.
As políticas do `schema.sql` permitem inserir respostas anonimamente, mas impedem que visitantes anônimos leiam as respostas.

## Próxima etapa do TCC
Depois de validar o formulário "Antes", vocês podem usar as mesmas 25 perguntas ou criar um conjunto "Depois" com perguntas equivalentes. O painel já possui o campo `stage` para comparar as duas etapas.
