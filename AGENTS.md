# python-brasil-2026

Material for the **dlt (data load tool)** talk at Python Brasil 2026: an HTML deck, an HTML course, and a runnable Python example.

> **Language.** The talk is delivered entirely in Brazilian Portuguese. Slide copy, lesson text and example output face the audience and stay in PT-BR. This file is agent documentation and is written in English; the material is not. Do not translate audience-facing strings.

## Commands

```bash
cd slides && npm run dev     # deck at http://localhost:3004
cd slides && npm run check   # lint, layout, motion and AA contrast
cd exemplos/rawg && uv sync && uv run rawg.py   # RAWG → DuckDB
```

After touching the deck, run `npm run check` and walk the 23 slides with the arrow keys.

## Stack

HyperFrames (HTML, CSS, JS, GSAP) for the deck. Python 3.14 with uv, dlt, DuckDB and marimo for the example. Static HTML for the course.

## Layout

| Path | What it is |
|---|---|
| `slides/` | the HyperFrames deck |
| `estudos/` | course generated with the `teach` skill |
| `exemplos/` | the RAWG example and the hands-on |
| `DESIGN.md` | visual identity |
| `proposta.md` | proposal accepted at the CFP |
| `.github/workflows/deploy.yml` | publishes `slides/composition` to GitHub Pages |

## Care

The repository is git. Before any destructive edit, check `git status` and keep a copy. Local copies go to `.backup/`, which sits in `.gitignore` and never enters a commit.

`exemplos/rawg/.dlt/secrets.toml` holds a real API key: never print its contents and never force it into a commit. Whoever clones the repo copies `.dlt/secrets.toml.example` and puts their key there.

## Further reading

**Before any task, identify which document below is relevant and read it first.**

- [`DESIGN.md`](DESIGN.md): visual identity of the deck and the course
- [`slides/README.md`](slides/README.md): deck structure and commands
- [`estudos/README.md`](estudos/README.md): how the course was generated
- [`estudos/MISSION.md`](estudos/MISSION.md): why this topic was studied
- [`estudos/RESOURCES.md`](estudos/RESOURCES.md): sources behind the lessons
- [`proposta.md`](proposta.md): what was promised to the audience
