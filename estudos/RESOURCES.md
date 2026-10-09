# dlt (data load tool) Resources

## Knowledge

### API do exemplo das lessons

- [RAWG Video Games Database API](https://rawg.io/apidocs)
  API do exemplo das lessons: 500k+ jogos, paginação `page/page_size/next`, `ordering=-updated`, dados profundamente aninhados. Free tier: 20k requests/mês, não-comercial, exige atribuição. Use for: exemplos de código das lessons 2-6, demo ao vivo.
- [Swagger UI da RAWG](https://api.rawg.io/docs/)
  Documentação interativa dos endpoints (requer JS). Use for: conferir parâmetros e formatos de resposta.
- [Spec OpenAPI da RAWG (machine-readable)](https://api.rawg.io/docs/?format=openapi)
  Swagger 2.0 com os schemas exatos (`Game`, `GameSingle`, `Genre`, `GenreSingle`, `Platform`, `GamePlatformMetacritic`...). Use for: verificar nomes e tipos de campos antes de qualquer exemplo — não assuma campos da memória.
- [dltHub context: RAWG.io](https://dlthub.com/context/source/rawg-io)
  Contexto oficial dltHub da fonte: endpoints, `data_selector` por endpoint (`results` nas listas; `/games/{id}` é objeto único), auth via query param `key`, exemplo RESTAPIConfig. Use for: conferir alinhamento entre o exemplo das lessons e o padrão dltHub.

### Official docs (primary, high-trust)

- [dlt Introduction](https://dlthub.com/docs/intro)
  The entry point: what dlt is, quickstarts for REST APIs, SQL databases, filesystems and Python structures. Use for: first contact, official framing.
- [How dlt works](https://dlthub.com/docs/reference/explainers/how-dlt-works)
  The canonical extract → normalize → load explainer with the `items__nested` example. Use for: architecture (Lesson 2), load packages and load jobs.
- [Resource](https://dlthub.com/docs/general-usage/resource) / [Source](https://dlthub.com/docs/general-usage/source)
  Decorator hints, `apply_hints`, dispatch to many tables, transformers. Use for: Lesson 3.
- [Pipeline](https://dlthub.com/docs/general-usage/pipeline) / [Destination](https://dlthub.com/docs/general-usage/destination)
  Lifecycle, refresh modes, `dlt.attach`, dataset API, staging, capabilities. Use for: Lesson 4.
- [Schema](https://dlthub.com/docs/general-usage/schema)
  Naming conventions, normalizers (`relational` vs `relational_no_coercion`), variant columns, `_dlt_*` column anatomy, compound hints, type detectors. Use for: Lesson 5.
- [Incremental loading](https://dlthub.com/docs/general-usage/incremental-loading) + [Cursor-based](https://dlthub.com/docs/general-usage/incremental/cursor)
  Write disposition flowchart (stateful/stateless → SCD2/merge/append), cursor state, lag/attribution window, refresh. Use for: Lesson 5.
- [Schema contract](https://dlthub.com/docs/general-usage/schema-contracts) / [Schema evolution](https://dlthub.com/docs/general-usage/schema-evolution)
  The four modes (evolve, freeze, discard_row, discard_value), contract hierarchy source→resource→run, Pydantic mapping, `DataValidationError` context. Use for: Lesson 6.
- [Glossary](https://dlthub.com/docs/general-usage/glossary)
  Official terminology. Use for: cross-checking any term before it goes on a slide.
- [dltHub docs](https://dlthub.com/docs/hub/getting-started/introduction)
  The managed platform (separate from the library). Use for: Lesson 1 platform section, agentic workflows.
- [Pipeline dashboard local](https://dlthub.com/docs/hub/ingestion/dashboard)
  `dlthub local pipeline show {nome}` — webapp marimo com Schema Explorer, SQL, Pipeline State (cursor incremental), traces e histórico. Checklist oficial de validação em 5 passos. Use for: demo ao vivo / hands-on.
- [dlt + marimo](https://dlthub.com/docs/general-usage/dataset-access/marimo)
  Widgets `dlt.helpers.marimo` (`pipeline_selector`, `load_package_viewer`, `schema_viewer`), Datasources panel, data apps. Use for: notebook hands-on.
- [AI Harness: rest-api-pipeline toolkit](https://dlthub.com/docs/hub/ingestion/rest-api-source)
  Workflow de skills (`/find-source`, `/debug-pipeline`, `/validate-data`) + MCP server para Claude Code/Cursor/Codex; `data-exploration` gera dashboards marimo+Altair. Use for: narrativa agent-native, fecho da palestra.

### Integração na stack moderna (orquestradores + ecossistema)

- [Deploy a pipeline — Overview](https://dlthub.com/docs/walkthroughs/deploy-a-pipeline)
  Hub dos guias de deploy: "dlt runs anywhere Python runs". Use for: Lesson 7 framing.
- [Orchestrators (deploy guides)](https://dlthub.com/docs/walkthroughs/deploy-a-pipeline/orchestrate-with-dlthub)
  Lista completa: dltHub, GitHub Actions, Airflow, Cloud Functions, Cloud Run, Kestra, Dagster, Prefect, Modal, Orchestra. Use for: Lesson 7 tabela de orquestradores.
- [Deploy with Dagster](https://dlthub.com/docs/walkthroughs/deploy-a-pipeline/deploy-with-dagster) + [Dagster: dlt embedded ELT](https://docs.dagster.io/integrations/embedded-elt/dlt)
  Integração NATIVA via `dagster-dlt` (`@dlt_assets`, `DagsterDltResource`) — distinta dos demais orquestradores. Use for: Lesson 7 (destaque Dagster).
- [Deploy with Prefect](https://dlthub.com/docs/walkthroughs/deploy-a-pipeline/deploy-with-prefect) / [Kestra](https://dlthub.com/docs/walkthroughs/deploy-a-pipeline/deploy-with-kestra) / [Modal](https://dlthub.com/docs/walkthroughs/deploy-a-pipeline/deploy-with-modal) / [Orchestra](https://dlthub.com/docs/walkthroughs/deploy-a-pipeline/deploy-with-orchestra)
  Mecanismo de integração de cada orquestrador (task/flow, YAML, serverless, control plane). Use for: Lesson 7.
- [Destinations index](https://dlthub.com/docs/dlt-ecosystem/destinations)
  Catálogo completo de destinos (filesystem, SQL, warehouses, Iceberg/Delta/Lance/LanceDB, Hugging Face, Qdrant/Weaviate, Reverse ETL, community). Use for: Lesson 7 mapa de destinos.
- [Verified sources](https://dlthub.com/docs/dlt-ecosystem/verified-sources)
  Core sources (REST API, SQL database 30+, filesystem, dataframe) vs 29 verified sources; diferença de distribuição (`dlt init`). Use for: Lesson 7 mapa de sources.
- [Transformations overview](https://dlthub.com/docs/dlt-ecosystem/transformations)
  ETL (add_map/transformer) vs ELT (dbt/Ibis), e que os dois combinam. Use for: Lesson 7 decisão EL vs ELT.
- [Running in production](https://dlthub.com/docs/running-in-production/running)
  Observabilidade e resiliência: Slack, Sentry, traces OTEL, retry helpers (`tenacity`/`retry_load`), graceful shutdown (SIGTERM), parcial loads. Use for: Lesson 7 auxiliares.

### Company history & market context

- [Introducing dltHub: Claude/Codex/Cursor-native data engineering](https://dlthub.com/blog/introducing-dlthub) (May 2026)
  The GA post. Origin of the two trends (agents writing pipelines, laptops running them), the context-layer thesis, product structure (building blocks → modules → toolkits → context layer), pricing. Use for: Lesson 1, agent-native narrative.
- [Introducing dlt 1.0.0](https://dlthub.com/blog/dlt-v1) (Sep 2024)
  The four product principles (library not platform; multiply don't add; no black boxes; we do the work). Use for: Lesson 1 principles section.
- [Celebrating our 3,000th OSS dlt customer](https://dlthub.com/blog/our-3000th-oss-customer) (Apr 2025)
  Founding story (2021, Fortune 500), the "no Jupyter/Pandas equivalent for data loading" diagnosis, 95% custom-scripts stat. Use for: Lesson 1 problem section.
- [VentureBeat: AI coding transforms data engineering](https://venturebeat.com/data-infrastructure/ai-coding-transforms-data-engineering-how-dlthubs-open-source-python-library) (Nov 2025)
  Independent press on the $8M Bessemer seed, adoption numbers, interviews with founders. Use for: Lesson 1 funding + adoption, independent-source credibility.
- [GitHub: dlt-hub/dlt](https://github.com/dlt-hub/dlt)
  Source code, stars, issues, releases. Use for: license verification, community signals.

## Wisdom (Communities)

- [dltHub Community Slack](https://dlthub.com/community)
  Official community; the maintainers answer. Use for: architecture questions, production troubleshooting, seeing how others structure sources.
- [dlt GitHub Issues](https://github.com/dlt-hub/dlt/issues)
  High-signal bug reports and feature discussions. Use for: understanding edge cases and roadmap reasoning.

## Gaps

- No good Brazilian/Portuguese-language community resource found — the talk audience will mostly learn from the docs. Worth noting for Q&A preparation.
- Merge strategies (upsert/delete-insert/SCD2/insert-only) are documented across several pages; there is no single deep-dive page. Covered in Lesson 5 from the merge-loading docs.
