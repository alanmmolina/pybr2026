# Integração na stack moderna: mapa de orquestradores e ecossistema nativo

Nova Lesson 7 (`0007-integracao-stack-moderna.html`) mapeia a superfície de integração do dlt, colhida das docs de deploy e do ecossistema (1.30.0). Três insights que refinam o entendimento anterior (o DRAFT slide 30 listava só "Airflow · Dagster · Prefect · Serverless"):

1. **A integração com Dagster é NATIVA e distinta das demais.** Existe um pacote `dagster-dlt` (mantido no ecossistema do Dagster) com `@dlt_assets` e `DagsterDltResource` que converte um `@dlt.source` em software-defined assets. Nos outros orquestradores, o dlt é "só uma função Python agendada". A Lesson 6 não mencionava isso.
2. **Sources têm duas categorias de distribuição:** core sources (REST API, SQL database 30+, filesystem, dataframe) vivem dentro da lib; verified sources (29) vivem em repo separado e chegam via `dlt init`. Diferença de distribuição, não de qualidade.
3. **O guia de deploy documenta 10 orquestradores/plataformas** (dltHub, GitHub Actions, Airflow, Cloud Functions, Cloud Run, Kestra, Dagster, Prefect, Modal, Orchestra) + Snowflake Native App + "qualquer lugar que rode Python". O princípio que viabiliza tudo: estado no destino → invocação stateless.

**Implications:** a palestra pode citar o `dagster-dlt` como prova concreta de "integração nativa" (não só "roda onde Python roda"). O bloco F do deck (slides 29-31) tem material para ganhar especificidade — o DRAFT slide 30 pode ser atualizado com a lista completa + destaque Dagster. A Lesson 7 fecha a sequência (nav da Lesson 6 agora aponta para ela).
