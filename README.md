# Python Brasil 2026

Material da palestra **[dlt](https://github.com/dlt-hub/dlt) (data load tool): ingestão de dados do jeito Pythônico**.

## `slides`

Deck de 23 slides em HTML, feito com
[HyperFrames](https://github.com/heygen-com/hyperframes).

```bash
cd slides
npm run dev    # http://localhost:3004
npm run lint   # erros de estrutura
npm run check  # layout, movimento e contraste WCAG AA
```

Para apresentar, rode o `dev` e navegue pelas setas. Depois de alterar o HTML
ou o CSS, reinicie o servidor e execute os outros dois comandos: o `lint`
encontra erros de estrutura, e o `check` confere layout, movimento e contraste.

| Caminho | O que é |
|---|---|
| `presenter/index.html` | o shell que se publica: monta os custom elements em volta da composition |
| `presenter/player.js`, `presenter/slideshow.js` | bundles do HyperFrames que trazem fullscreen e next/previous |
| `composition/index.html` | slots dos slides e a timeline do deck |
| `composition/compositions/NN.html` | um slide por arquivo, com markup e coreografia |
| `composition/deck.css` | identidade visual, especificada em [`DESIGN.md`](DESIGN.md) |
| `composition/deck.js` | helpers compartilhados e o registry `HW.scene` |
| `composition/vendor/` | gsap, runtime, fontes, logos, fotos e os assets da Python Brasil |
| `export/pybr2026.pdf` | o deck exportado em PDF |

O push na `main` publica o deck no GitHub Pages
([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)), em
[alanmmolina.com/pybr2026](https://alanmmolina.com/pybr2026).

## `estudos`

Aprofundamento de estudo sobre **dlt**, feito antes de escrever o material da
palestra para entender os conceitos e solidificá-los. Os diagramas das aulas foram criados com a skill
[`diagram-design`](https://github.com/cathrynlavery/diagram-design) de
**[Cathryn Lavery](https://github.com/cathrynlavery)**. O workspace segue a skill
[`teach`](https://github.com/mattpocock/skills/tree/main/skills/productivity/teach)
de **[Matt Pocock](https://github.com/mattpocock)**. Cada pasta tem uma função:

| Caminho | O que é |
|---|---|
| `MISSION.md` | por que estudar o tópico e quais decisões de ensino ele orienta |
| `RESOURCES.md` | fontes confiáveis usadas nas lessons |
| `lessons/` | uma lesson por arquivo: `0001-<nome>.html` |
| `learning-records/` | o que foi aprendido, no formato de ADR: `0001-<nome>.md` |
| `assets/` | o `style.css` compartilhado pelas lessons |

As lessons são HTML estático: abra qualquer `lessons/0001-*.html` no navegador.
O visual segue o [`DESIGN.md`](DESIGN.md) da raiz.

## `exemplos`

O exemplo da palestra: ingerir dados da **RAWG** com **dlt**, para **DuckDB** ou para um Data Lake `.parquet`. Ele mostra `resources` e `transformers`, troca de destino, normalização e carga incremental.

> [!WARNING]
> **Uso da RAWG.** A [RAWG Video Games Database](https://rawg.io/apidocs) é
> **não comercial** e exige atribuição com backlink nas páginas que usam seus
> dados. Vale para este exemplo e para os slides que exibem registros reais da
> API, que trazem o crédito `dados: rawg.io` no rodapé.

```bash
cd exemplos/rawg
uv sync

# 1. Crie uma chave gratuita em https://rawg.io/apidocs (20 mil requisições/mês)
# 2. Copie .dlt/secrets.example.toml para .dlt/secrets.toml e cole a chave nele
```

O `secrets.toml` está no `.gitignore`, então a chave real fica só na sua
máquina.

Carga completa: a primeira execução percorre os ~500 mil jogos da API, com uma
chamada de detalhe por jogo, bem acima do free tier. As seguintes param no
cursor incremental e custam poucas requisições.

Os comandos abaixo são executados pelo
[`taskipy`](https://github.com/taskipy/taskipy), definido no `pyproject.toml`:

| Comando | O que faz |
|---|---|
| `uv run task check` | Lint + formatação + tipos (**ruff**, **ty**) |
| `uv run task demo` | RAWG → **DuckDB** local |
| `uv run task lake` | RAWG → `.parquet` em `./datalake/` |
| `uv run task clean` | Remove artefatos gerados (duckdb, datalake, caches) |

## Licença

[MIT](LICENSE). As fontes, logos e assets de marca embutidos no deck têm licenças
próprias, registradas em [`THIRD-PARTY.md`](THIRD-PARTY.md).
