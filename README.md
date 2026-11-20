# Landing page — Energia Solar

Landing page para geração de leads de uma empresa de energia solar (modelo "SolarMax Energia").
HTML, CSS e JavaScript puros, sem build e sem dependências.

## Rodar

Abra `index.html` no navegador, ou sirva a pasta com qualquer servidor estático:

```bash
npx serve .
```

## Personalizar para cada cliente

| O quê | Onde |
|---|---|
| Marca, WhatsApp, telefone, e-mail, endereço, CNPJ, redes sociais | `js/config.js` |
| Premissas do simulador (tarifa, irradiação, custo por kWp etc.) | `js/config.js` → `simulator` |
| Portfólio e depoimentos | `js/config.js` → `projects` / `testimonials` |
| Webhook para planilha/CRM | `js/config.js` → `webhookUrl` |
| Cores e fontes | `css/styles.css` → `:root` |
| SEO, Open Graph, schema.org | `<head>` do `index.html` |
| Números da faixa, textos das seções, parceiros financeiros | `index.html` |

## Estrutura

```
index.html
css/styles.css
js/config.js   ← configuração do cliente
js/main.js     ← simulador, gráfico, galeria, carrossel, formulário
```
