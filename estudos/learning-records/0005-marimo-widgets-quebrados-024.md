# dlt.helpers.marimo widgets quebrados no marimo 0.24

Explorando a integração dlt+marimo (set/2026), descobri que os 3 widgets de `dlt.helpers.marimo` não funcionam com o marimo 0.24 instalado no projeto:

- `render(schema_viewer, pipeline_name=...)` e `render(load_package_viewer, pipeline_path=...)` levantam `TypeError: "defs" cannot override setup cell definitions` (verificado empiricamente contra um pipeline local).
- **Causa raiz:** o marimo 0.24 endureceu `App.embed(defs=...)` (`marimo/_ast/app.py:767`) e agora proíbe `defs` de sobrescrever variáveis da setup cell. Os widgets (via `mowidgets 0.2.1`, a última no PyPI) declaram `pipeline_name`/`pipeline_path = None` na setup cell e injetam o valor real via `defs` — padrão que funcionava no marimo ~0.19.
- `pipeline_selector` funciona (não recebe `inputs`); `schema_viewer` e `load_package_viewer` quebram.
- O `hands_on.py` original "funcionava" só porque chamava `render(...)` **sem `await`** — o widget nunca chegava a renderizar de fato (a `MoWidget._display_` até avisa "Use `await` before the widget instance").

**Workaround aplicado:** o `hands_on.py` agora usa um "schema explorer" inline — `dlt.Schema.to_mermaid()`/`to_pretty_yaml()`/`to_pretty_json()` + `mo.mermaid`/`mo.ui.tabs`/`mo.ui.code_editor` — que replica o valor do `schema_viewer` sem o widget. `to_dbml()`/`to_dot()` exigem `pydbml`/`pydot` (opcionais, fora do projeto).

**Implications:** a demo marimo da palestra funciona (formulário → run → tabelas → gráfico → estado incremental → schema explorer). Se for citar os widgets `dlt.helpers.marimo`, notar que hoje exigem `marimo < 0.24` — candidato a reportar no GitHub `dlt-hub/dlt` ou `zilto/mowidgets`.
