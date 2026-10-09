# python-brasil-2026

Material da palestra **dlt (data load tool)**, na **Python Brasil 2026**. Três partes, cada uma no seu canto.

## slides

Deck de 23 slides em HTML, feito com [HyperFrames](https://github.com/heygen-com/hyperframes). `cd slides && npm run dev` abre em http://localhost:3004 e as setas navegam. [`slides/README.md`](slides/README.md) tem a estrutura e os comandos.

O push na `main` publica `slides/composition` no GitHub Pages ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)). O deck é HTML estático, sem build.

## estudos

Curso sobre **dlt** que embasou a palestra, gerado com a skill `teach`. Sete aulas em HTML, seis learning records e as fontes que sustentam cada aula. [`estudos/README.md`](estudos/README.md) explica a pasta.

## exemplos

O exemplo da palestra: ingerir a **RAWG** com **dlt**, para **DuckDB** ou para `.parquet`.

```bash
cd exemplos/rawg
uv sync
cp .dlt/secrets.toml.example .dlt/secrets.toml   # e coloque a sua chave da RAWG
uv run rawg.py            # DuckDB
uv run rawg.py filesystem # Parquet em lake_local/
```

A chave é gratuita em [rawg.io/apidocs](https://rawg.io/apidocs) e fica só na sua máquina (`secrets.toml` está no `.gitignore`). Sem chave ainda dá para ver tudo rodando: `uv run task smoke` usa uma API mockada e `uv run task hands-on` abre o notebook com dados de exemplo.

O hands-on em **marimo** fica em `exemplos/rawg/notebooks/hands_on.py`.

## Documentos

[`DESIGN.md`](DESIGN.md) fixa a identidade visual do deck e dos estudos, e vale a pena ler antes de mexer em CSS. [`proposta.md`](proposta.md) é o que foi prometido no CFP, e serve de roteiro. Quem for mexer no código com um agente começa por [`AGENTS.md`](AGENTS.md).
