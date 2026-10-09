# Lessons aprofundadas com contexto do dltHub GA e docs atuais (1.30.0)

Todas as seis lessons foram reescritas com profundidade máxima (~250-300 linhas cada), ancoradas em nove fontes oficiais coletadas em ago/2026. A maior mudança de entendimento: a lesson 6 descrevia schema contracts com três modos (evolve, freeze, discard) — a documentação atual define **quatro modos** (`evolve`, `freeze`, `discard_row`, `discard_value`) aplicados em três dimensões (`tables`, `columns`, `data_type`), com hierarquia source → resource → run e integração Pydantic. Outra correção: `write_disposition="replace"` como forma de refresh é hoje desencorajada oficialmente em favor do argumento `refresh`.

**Implications:** o usuário pediu profundidade máxima e manteve a estrutura de 6 aulas mapeadas à palestra; future sessions devem manter esse formato, atualizar números da comunidade (crescem rápido) e podem derivar exemplos de código funcionais para os slides a partir das lessons.
