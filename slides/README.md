# `slides`

Deck da palestra **dlt (data load tool)** na **Python Brasil 2026**. São 23
slides em HTML, feitos com [HyperFrames](https://github.com/heygen-com/hyperframes)
e navegados pelas setas.

## Comandos

```bash
npm run dev    # apresenta em http://localhost:3004
npm run lint   # erros de estrutura
npm run check  # layout, motion e contraste WCAG AA
```

Para apresentar o deck, rode o `dev` e navegue pelas setas. Depois de alterar
o HTML ou o CSS, reinicie o servidor e execute os outros dois comandos: o
`lint` encontra erros de estrutura, e o `check` confere layout, movimento e
contraste.

No fim, navegue pelos 23 slides. Esse é o teste que importa: a apresentação
precisa avançar sem pular nenhum deles.

## Estrutura

| Caminho | O que é |
|---|---|
| `composition/index.html` | slots dos slides e a timeline do deck |
| `composition/compositions/NN.html` | um slide por arquivo, com markup e coreografia |
| `composition/deck.css` | identidade visual, especificada em [`../DESIGN.md`](../DESIGN.md) |
| `composition/deck.js` | helpers compartilhados e o registry `HW.scene` |
| `composition/vendor/` | gsap, runtime, fontes, logos e fotos |

O projeto não guarda notas de apresentação, áudio nem o editor do
**HyperFrames**. Aqui fica somente o HTML servido pelo `present`. As notas de
fala ficam com quem apresenta, como deve ser.
