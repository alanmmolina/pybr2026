# marimo-studio: views por audiência e o cache de células que come o Pipeline

Construindo as views do `exemplos/rawg` com **marimo-studio 0.2.3** (out/2026,
5 dias depois do lançamento), dois achados que não estão nos docs e que
bloquearam o export estático.

## 1. `mo.ui.table` não é portável para o runtime Prepared

`marimo-studio view preflight --runtime zero-python` recusa projeções de
células cuja saída é um widget que expõe funções Python:

```
output_not_portable — UI object ... exposes nonportable Python functions
  (calculate_top_k_rows, download_as, get_column_summaries, get_data_url,
   get_row_ids, get_size_bytes, preview_column, search)
```

Só as células de saída rica e "plana" sobrevivem: `mo.md`, `mo.mermaid`,
dataframes (viram Flechette `Table`), listas/dicts, Altair.

**Padrão que funcionou:** a view projeta **valores** com `mo-value` e desenha
na própria página; o widget interativo continua no notebook.

```html
<span id="data-games" hidden mo-value="games"></span>
<div id="render-games"></div>
```

Assim o notebook fica rico (tabela com busca/paginação) e o relatório
estático fica portável e com a cara da palestra. As projeções de valor passam
a contar como `4 value projection sites` no `validate`.

## 2. O cache de células do marimo restaura definições via pickle — e `Pipeline` é lossy

Sintoma: `view preflight` falha com

```
state_execution_failed — the notebook initial run failed in cell 'PKri'
  with AttributeError
```

e por baixo, capturado com um `traceback` temporário na célula:

```
AttributeError: 'Pipeline' object has no attribute '_destination'.
  Did you mean: 'destination'?
pipeline.__dict__ keys: ['dataset_name', 'default_schema_name',
  'pipeline_name', 'working_dir']
```

**Causa raiz:** o marimo 0.25 tem cache de células
(`[tool.marimo.runtime] cache_cells`, default off no marimo, mas o
**marimo-export liga** para reaproveitar estados preparados). O restore é
`pickle.loads` — e `dlt.Pipeline.__getstate__` (dlt 1.30,
`pipeline.py:2172`) retorna **só** os campos do protocolo
`SupportsPipeline`:

```python
def __getstate__(self) -> Any:
    return {
        "pipeline_name": self.pipeline_name,
        "default_schema_name": self.default_schema_name,
        "dataset_name": self.dataset_name,
        "working_dir": self.working_dir,
    }
```

Um `Pipeline` restaurado não tem `_destination` e quebra em
`.dataset()` / `.state`. O erro só aparece no export — o `marimo export html`
roda sem cache e passa limpo, o que atrasou o diagnóstico.

Está documentado de raspão no guia de delivery do studio ("The cache restores
each definition of that cell separately... Build those objects inside the
function that uses them") — mas nada lá menciona `dlt.Pipeline`.

**O que resolve:** nunca compartilhar uma instância de `Pipeline` entre
células. Uma fábrica num **módulo importado** (`rawg.hands_on_pipeline()`)
reconstrói de verdade a cada chamada — o dlt anexa ao working dir existente.

```python
# rawg.py
def hands_on_pipeline() -> dlt.Pipeline:
    return dlt.pipeline(pipeline_name="rawg_hands_on", destination="duckdb",
                        dataset_name="rawg_hands_on_data", dev_mode=False)
```

Tipos cache-seguros (podem ser definição entre células): `dlt.Schema`,
`dict` de state, pandas DataFrame, listas de dicts. Tipos inseguros:
`Pipeline` (lossy), e qualquer objeto com efeito colateral — o monkeypatch
`rawg.RESTClient = FakeClient` precisa ser aplicado **na célula que roda o
load**, não no setup, senão um cache hit pula o patch.

## 3. Outras coisas menores

- `mo.stop(form.value is None, ...)` impede as definições de existirem no
  **autorun inicial**, que é a baseline que o studio usa para validar
  `mo-value`. Sem isso o alvo "não existe". Rodar com `form.value or {…default}`
  resolve e melhora a UX (o notebook já abre com resultados).
- `mo.ui.dropdown(options={nome: valor}, value=…)`: `value` é o **nome** (chave
  do dict), e `.value` devolve o valor mapeado. `value=next(iter(opcoes.values()))`
  levanta `ValueError` no 0.25 — o correto é `next(iter(opcoes))`.
- No iframe do studio o CSS do runtime do marimo carrega **depois** do bundle
  da view e pinta `body` com `var(--background)`. E o `reveal.js` pinta
  `.reveal` via `html:not(.print-pdf) .reveal` (especificidade 0,2,1), que
  vence `.reveal.studio-deck` (0,2,0). Tem que declarar as duas.
- `marimo-studio` 0.2.3 **pinne `marimo==0.25.0`**. O projeto estava em
  0.24.0; subir junto.
- Os widgets `dlt.helpers.marimo` continuam quebrados no 0.25 (ver
  [[0005-marimo-widgets-quebrados-024]]). O schema explorer inline permanece.

## Implications

- `report` (relatório estático, `zero-python`) e `tour` (deck Reveal, `server`)
  estão construídos e verificados. O tour ficou em runtime `server` porque as
  tabelas interativas não são portáveis — é o certo para rodar ao vivo.
- Para qualquer notebook dlt + marimo-studio no futuro: fábrica de pipeline em
  módulo importado, valores portáveis para projeção, widgets só no notebook.

## 4. `mo.output.*` morre quando a célula tem expressão final

Achado do painel de execução (`run_panel.py` + view `lab`), out/2026.

Sintoma: a célula faz `mo.output.append(mo.Html(painel))` e no fim
`mo.md("Load OK")` + `return (load_info, opts)`. No notebook ao vivo, o
`#output-<cell>` só tinha o texto do `mo.md`. O painel sumiu.

Verificado por bissecção (células mínimas exportadas + DOM via playwright):

| padrão | `mo.output` persiste? |
|---|---|
| `mo.output.append(x)` sem expressão final | sim |
| `mo.output.append(x)` + `mo.md(...)` + `return (v,)` | **não** — só o `mo.md` |
| expressão final `mo.Html(x)` + `return (v,)` | sim |

**Regra:** se a célula devolve definições (`return (...)`), a **expressão final**
é a saída. `mo.output.*` não entra. Para streaming de verdade durante um run
longo, `mo.status.progress_bar` / `mo.status.spinner` são os primitivos certos.

## 5. `pipeline.drop()` não zera o cursor incremental

Para o painel precisávamos de "rode do zero". `pipeline.drop()` limpa o working
dir local mas o state **volta do destino** (o `_dlt_pipeline_state` do DuckDB) —
o segundo run continua incremental. O que resolve:

```python
pipeline.run(data=..., refresh="drop_sources")
```

Isso força o run completo; o run seguinte volta a ser incremental. Confirmando
com um script de 4 runs: cold (games: 5) → incremental (genres: 1) →
`refresh="drop_sources"` (games: 5) → incremental (genres: 1).

## 6. Collector do dlt é o hook certo para "ver por dentro"

`dlt.common.runtime.collector.Collector` — o mesmo que o `tqdm` padrão usa.
`dlt.pipeline(..., progress=MeuCollector())` recebe `_start(step)` /
`update(name, inc, total, label)` / `_stop()` durante os três passos.

Os nomes que o dlt manda **não** são limpos: `_start("Extract rawg")`,
`_start("Normalize rawg in 1791312833.67446")`. Casar por prefixo e guardar o
resto como label.

Os números vêm de verdade: extract conta por resource (`games: 5`,
`game_details: 5`), normalize por tabela (`games__platforms: 5` — a lista que
virou filha), load por job (`Jobs: 24/24`). `pipeline.last_trace.steps[i]`
complementa com tempo real e o nome dos arquivos.

**Cuidado:** `game_details` é `parallelized=True`, então `update()` pode ser
chamado de threads do pool — não chame `mo.output` de dentro do callback.

## 7. Chave de API obrigatória: o pickle do cache é o vazamento, e mock não é fallback

O form usa `mo.ui.text(kind="password")`. A chave é **obrigatória** — sem ela a
célula mostra onde conseguir e não há run. Embutir amostra da RAWG seria
redistribuir os dados deles; cada um busca os seus com a sua chave.

Três coisas verificadas com uma sentinela (`RAWGKEY-SENTINEL-…`) e varredura de
disco:

- **Widgets não vão para o cache de células.** O `CachedLifecycle` do marimo tem
  um carve-out explícito para UI: `defs are live UI?` → `teardown: no-op`. O
  `form` em si não é picklado para `__marimo__/cache/`.
- **O problema é o que você devolve.** `opts = form.value` é um dict comum e
  **é** definição da célula — devolvê-lo leva a chave para o pickle. Devolva
  `fonte` (string) e `chave_informada` (bool); use a chave só como local.
- **Nada de fallback silencioso.** Chave errada tem que falhar, não cair num
  mock. Verificado: com uma chave falsa o resultado é `PipelineStepFailed` em
  `step=extract`, nunca dados de exemplo.

O runtime `server` é o que torna isso aceitável: source e credenciais ficam no
servidor. `wasm` e `zero-python` entregam o que estiver preparado ao visitante —
nunca exporte uma view que tenha chave no jogo.

**Duas armadilhas de UX ao condicionar o run à chave:**

1. `mo.stop(not chave)` deixa `passos`/`jobs`/`contagens`/`games` indefinidos e
   as células de baixo viram `Ancestor stopped` — além de quebrar as projeções
   `mo-value` do report. Melhor: **definir tudo nos dois ramos** (vazio quando
   sem chave) e trocar só a expressão final da célula.
2. Uma exceção vira `An internal error occurred: <uuid>` na view projetada — o
   marimo esmaga o detalhe. Para o público ver o motivo, o erro precisa ser
   **renderizado como saída** (`try/except` no run + `mo.md` com o resumo), com
   `traceback.print_exc()` para o log do servidor.

## 8. `pipeline.last_trace` precisa ser lido do pipeline vivo

`trace_steps(pipeline)` na célula que **rodou** devolve `job_metrics` com
`items_count` e `file_size` de verdade. Chamado num `rawg.hands_on_pipeline()`
reconstruído em outra célula, o `last_trace` vem desserializado e esses campos
voltam zerados: a tabela de jobs saía inteira com `0` e `—`, com os nomes das
tabelas certos. A diferença é só de onde o objeto veio.

Consequência de design: quem consome o trace recebe `passos`/`jobs` como dados
puros da célula de run, nunca re-deriva do pipeline.

## 9. Destino DuckDB com caminho relativo quebra quando a pasta do exemplo se move

`dlt.pipeline(destination="duckdb")` grava `./rawg_hands_on.duckdb` relativo ao
cwd **na primeira criação**, e o `state.json` guarda `local_dir`/`working_dir`
absolutos. Depois de renomear `dlt (data load tool)/exemplos/rawg` →
`exemplos/rawg`, o dlt continuou apontando para o lugar antigo:

```
IO Error: Cannot open file ".../dlt (data load tool)/exemplos/rawg/rawg_hands_on.duckdb"
```

Fix sem tocar em nada fora do repo: fixar o caminho na fábrica —

```python
dlt.pipeline(destination=dlt.destinations.duckdb(str(duckdb_path)))
```

Além de sobreviver a mover a pasta, faz o arquivo cair onde `task clean` e o
painel de fatos esperam, inclusive com `uvx marimo run … --sandbox` de qualquer
diretório.

## 10. Marimo chrome numa view escura: variáveis de projeção, não descendentes

CSS mirando dentro de `marimo-cell` (`.markdown`, `p`, `td`) luta contra um
subtree opaco e perde. O caminho suportado são as variáveis de projeção no host:

```css
marimo-cell,
marimo-output {
  --marimo-cell-font: var(--font-sans);
  --marimo-cell-heading-font: var(--font-sans);
  --marimo-cell-monospace-font: var(--font-mono);
  --marimo-cell-background: transparent;
  --marimo-cell-foreground: var(--text-2);
  --marimo-cell-surface: var(--surface);
  --marimo-cell-border-color: var(--surface-2);
  --marimo-cell-accent: var(--accent);
  --marimo-cell-radius: 14px;
  --marimo-cell-padding: 1.15rem 1.35rem;
  --marimo-cell-skeleton-height: 11rem;
}
```

`--marimo-cell-accent` pinta links, opções selecionadas, fills de slider e focus
rings — é o que faz o form parecer do painel em vez de um bloco branco colado.
Com isso o `mo.ui.table` do lab também sai escuro.

Dois detalhes que a automação só pegou por pixel: o `marimo run` renderiza a
view **dentro de um iframe** (`marimo-studio-presentation`), então o Playwright
tem que ser frame-aware (`page.frames`, não `page.content`); e screenshot de
elemento muito alto costura sobre fundo branco — o histograma de um crop da
viewport é que diz a verdade. Ver [[snapshots-lie-pixels-dont]].
