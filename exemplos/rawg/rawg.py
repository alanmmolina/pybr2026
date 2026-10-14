"""dlt source para a RAWG Video Games Database API, com um runner de demonstração.

Mostra autenticação e paginação declaradas no client, carregamento incremental
por cursor, merge por primary_key, um transformer ligado por pipe que enriquece
cada item em paralelo, e a normalização automática de dados aninhados. O mesmo
source carrega para DuckDB ou para um data lake Parquet.

Uso:
    python rawg.py                 # RAWG → DuckDB
    python rawg.py filesystem      # RAWG → Parquet em ./datalake/

Sem limite de amostra: a primeira execução percorre os ~500 mil jogos da API,
com uma chamada de detalhe por jogo, bem acima do free tier. As seguintes param
no cursor incremental e custam poucas requisições.

Pré-requisito: chave da RAWG em .dlt/secrets.toml
(https://rawg.io/apidocs → Get API Key; free tier: 20k requests/mês)

Referências:
  - https://rawg.io/apidocs
  - https://api.rawg.io/docs/?format=openapi (spec Swagger 2.0)
  - https://dlthub.com/docs/general-usage/source
  - https://dlthub.com/docs/general-usage/incremental/cursor
  - https://dlthub.com/docs/dlt-ecosystem/verified-sources/rest_api/advanced
"""

from collections.abc import Iterator
from typing import Any

import click
import dlt
from dlt.sources.helpers.rest_client import RESTClient
from dlt.sources.helpers.rest_client.auth import APIKeyAuth
from dlt.sources.helpers.rest_client.paginators import JSONLinkPaginator

PAGE_SIZE = 40  # maior página aceita pelos endpoints de lista


@dlt.source(name="rawg")
def rawg(api_key: str = dlt.secrets.value) -> list[dlt.sources.DltResource]:
    """Fonte RAWG: gêneros, jogos e os detalhes de cada jogo.

    Autenticação e paginação ficam no client, compartilhado por todos os
    resources. `APIKeyAuth` leva a api_key para o query param `?key=`;
    `JSONLinkPaginator` segue o campo `next` de cada página.
    """
    client = RESTClient(
        base_url="https://api.rawg.io/api",
        auth=APIKeyAuth(name="key", location="query", api_key=api_key),
        paginator=JSONLinkPaginator(next_url_path="next"),
    )
    games_resource = games(client=client)
    return [
        genres(client=client),
        games_resource,
        games_resource | game_details(client=client),  # o client vai por keyword
    ]


@dlt.resource(
    write_disposition="merge",
    primary_key="id",
)
def games(
    client: RESTClient,
    updated_at: dlt.sources.incremental[str] = dlt.sources.incremental(  # noqa: B008
        cursor_path="updated",
        initial_value="1970-01-01T00:00:00",
        row_order="desc",
    ),
) -> Iterator[dict[str, Any]]:
    """Jogos, do mais recentemente atualizado para o mais antigo.

    O cursor `updated_at` é o default do parâmetro: o dlt descarta o que já
    foi carregado e, com `row_order="desc"`, encerra o generator ao encontrar um
    item mais antigo que o cursor. Yielda um jogo por vez, não uma lista.

    merge + primary_key="id" faz upsert: jogos reencontrados em execuções
    futuras são atualizados em vez de duplicados.
    """
    for page in client.paginate(
        path="games",
        params={"ordering": "-updated", "page_size": PAGE_SIZE},
        data_selector="results",
    ):
        yield from page


@dlt.resource(write_disposition="replace")
def genres(client: RESTClient) -> Iterator[dict[str, Any]]:
    """Gêneros (id, name, slug, games_count, image_background).

    Tabela pequena e mutável: replace a cada execução.
    """
    for page in client.paginate(
        path="genres",
        params={"page_size": PAGE_SIZE},
        data_selector="results",
    ):
        yield from page


@dlt.transformer(
    write_disposition="merge",
    primary_key="id",
    parallelized=True,
)
def game_details(game_item: dict[str, Any], client: RESTClient) -> dict[str, Any]:
    """Detalhes de um jogo, de /games/{id}.

    A resposta é um objeto único, não uma lista, e traz description, website,
    alternative_names, metacritic_platforms e platforms, que viram colunas e
    tabelas filhas na normalização.

    `parallelized=True` manda cada item para o thread pool do dlt: como o
    transformer faz `return` em vez de `yield`, as chamadas HTTP de detalhe saem
    em paralelo. A ordem de carga não importa: o merge deduplica pelo id.
    """
    return client.get(path=f"games/{game_item['id']}").json()


@click.command()
@click.argument("destination", type=click.Choice(["duckdb", "filesystem"]), default="duckdb")
def main(destination: str) -> None:
    """Carrega a RAWG para DuckDB ou para um data lake Parquet."""
    pipeline = dlt.pipeline(
        pipeline_name="rawg",
        destination=destination,
        dataset_name="rawg_data",
        dev_mode=True,  # dataset com sufixo de timestamp a cada execução
    )
    source = rawg()

    if destination == "filesystem":
        click.echo(pipeline.run(data=source, loader_file_format="parquet"))
        click.echo("Parquet em ./datalake/ (troque bucket_url no .dlt/config.toml)")
        return

    click.echo(pipeline.run(data=source))
    dataset = pipeline.dataset()
    click.echo(f"tabelas: {dataset.tables}")
    click.echo(dataset.games.df().head())


if __name__ == "__main__":
    main()
