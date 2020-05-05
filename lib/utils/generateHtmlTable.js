const formatDelta = require('./formatDelta')
const toReal = require('./toReal')
const formatNumber = require('./formatNumber')
const moment = require('moment-timezone')
moment.locale('pt-br')

const deltaClass = (delta) => {
  if (delta > 0) {
    return 'positive'
  } else if (delta < 0) {
    return 'negative'
  } else {
    return 'zero'
  }
}

// TODO: Extract the code that generate each part of the table to make it testable
const generatePerformaceHtmlTable = ({ assets, delta, benchmark }, options = { delta: true }) => {
  let total = 0
  assets.forEach(asset => { total += (asset.allocation / 100) })
  const lastUpdatedDate = moment(assets[0].quote.requestTimestamp).tz('America/Sao_Paulo').format('DD [de] MMMM [de] YYYY [às] HH:mm')

  const lastUpdated = `
    <main class="row title">
      <ul>
        <li style="width: 100%; text-align: center;" class="font-small">
          Atualizado em ${lastUpdatedDate}
        </li>
      </ul>
    </main>
`
  const disclaimer = `
    <main class="row title">
      <ul>
        <li style="width: 100%; text-align: center;" class="font-small">
          Link para o grupo no Telegram com o bot: <a class="positive" href="https://bit.ly/3b6uOHS" target="_blank">https://bit.ly/3b6uOHS</a>
        </li>
        <li style="width: 100%; text-align: center;" class="font-small-2">
          A composição do <b>Monetus FIA</b> é atualizado seguindo as
          informações página do <b>Comparador de Fundos</b> da própria
          Monetus.
        </li>
        <li style="width: 100%; text-align: center;" class="font-small-2">
          Bot não oficial para exibir a rentabilidade do Monetus FIA. Criador
          <a class="positive" href="https://t.me/italofialho" target="_blank">https://t.me/italofialho</a>
        </li>
      </ul>
    </main>
`

  const header = `
    <main class="row title">
      <ul>
        <li style="width: 100%; text-align: center;">
          Rentabilidade do Monetus FIA
        </li>
      </ul>
    </main>
  `
  const symbolHeader = `
    <main class="row title">
      <ul>
        <li>Ativo</li>
        <li>Nome</li>
        <li class="right">%</li>
        <li class="right">${(options.delta ? '<th>Δ</th>' : '')}</li>
      </ul>
    </main>
  `

  const footer = `
    <section class="row-fadeOut-wrapper">
      <article class="row fadeIn total">
        <ul>
          <li class="bold">TOTAL</li>
          <li></li>
          <li>${Math.ceil(total).toFixed(0)}%</li>
          ${(options.delta ? `<li class="${deltaClass(delta)} bold">${formatDelta(delta)}</li>` : '')}
        </ul>
      </article>
    </section>
    <section class="row-fadeOut-wrapper">
      <article class="row fadeIn total">
        <ul>
          <li class="bold">IBOV</li>
          <li></li>
          <li></li>
          ${(options.delta ? `<li class="deltaClass(benchmark.delta) bold">${formatDelta(benchmark.delta)}</li>` : '')}'
        </ul>
      </article>
    </section>
    <section class="row-fadeOut-wrapper">
      <article class="row fadeIn total">
        <ul>
          <li class="bold">ALFA</li>
          <li>FIA - IBOV</li>
          <li></li>
          ${(options.delta ? `<li class="${deltaClass(delta - benchmark.delta)} bold">${formatDelta(delta - benchmark.delta)}</li>` : '')}
        </ul>
      </article>
    </section>
  `

  let content = ''

  assets.forEach(asset => {
    content += `
      <section class="row-fadeOut-wrapper">
        <article class="row fadeIn ${deltaClass(asset.quote.delta)}">
          <ul>
            <li><a href="#" class="${deltaClass(asset.quote.delta)} bold">${asset.ticker}</a></li>
            <li class="nobreak">${asset.name}</li>
            <li class="right">${(asset.allocation / 100).toFixed(2)}%</li>
            ${(options.delta ? `<li class="${deltaClass(asset.quote.delta)} right bold">${formatDelta(asset.quote.delta)}</li>` : '')}
          </ul>
        </article>
      </section>
    `
  })

  return `
  <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />

        <style>
          @font-face {
            font-family: "Graphik";
            font-weight: normal;
            src: url("https://s3-sa-east-1.amazonaws.com/monetus-assets/fonts/Graphik-Regular-Web.woff");
          }

          @font-face {
            font-family: "Graphik";
            font-weight: bold;
            src: url("https://s3-sa-east-1.amazonaws.com/monetus-assets/fonts/Graphik-Medium-Web.woff");
          }

          body {
            width: 400px;
            background: rgba(0, 0, 0, 0.9);
            font-family: Graphik;
          }

          .bold {
            font-weight: bold !important;
          }

          .right {
            text-align: right;
          }

          li.zero,
          a.zero {
            color: #007aff;
          }

          li.positive,
          a.positive {
            color: #7ed321;
          }

          li.negative,
          a.negative {
            color: #e53935;
          }

          article.negative {
            border-left: 3px solid #e53935;
            border-right: 3px solid #e53935;
          }
          article.positive {
            border-left: 3px solid #7ed321;
            border-right: 3px solid #7ed321;
          }
          article.zero {
            border-left: 3px solid #007aff;
            border-right: 3px solid #007aff;
          }

          a {
            text-decoration: none;
            -webkit-transition: color 0.2s ease-out;
            transition: color 0.2s ease-out;
          }

          .wrapper {
            width: 100%;
            max-width: 1000px;
            margin: 20px auto 100px auto;
            padding: 0;
            background: rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.9);
            overflow: hidden;
            position: relative;
          }

          .row ul {
            margin: 0;
            padding: 0;
          }

          .row ul li {
            margin: 0;
            font-size: 16px;
            font-weight: normal;
            list-style: none;
            display: inline-block;
            width: 25%;
            box-sizing: border-box;
          }
          @media only screen and (max-width: 767px) and (min-width: 480px) {
            .row ul li {
              font-size: 13px;
            }
          }
          @media only screen and (max-width: 479px) {
            .row ul li {
              font-size: 13px;
            }
          }

          .title ul li {
            padding: 15px 13px;
          }

          .row ul li {
            padding: 5px 10px;
          }

          .row {
            font-size: 0;
            overflow: hidden;
            -webkit-transition: all 0.2s ease-out;
            transition: all 0.2s ease-out;
            border-top: 1px solid rgba(0, 0, 0, 0.1);
          }

          .title {
            font-size: 0;
            background-color: rgba(255, 255, 255, 0.1);
            border-left: 3px solid rgba(255, 255, 255, 0.1);
          }

          @media only screen and (max-width: 767px) {
            .title-hide {
              display: none;
            }
          }

          .fadeIn {
            font-size: 0;
            -webkit-transition: all 0.2s ease-out;
            transition: all 0.2s ease-out;
          }

          .row-fadeOut-wrapper {
            font-size: 0;
            overflow: hidden;
            position: relative;
            -webkit-transition: all 0.2s ease-out;
            transition: all 0.2s ease-out;
            -webkit-animation: fadeOut 0.4s ease-out 8s 1 alternate;
            animation: fadeOut 0.4s ease-out 8s 1 alternate;
            -webkit-animation-fill-mode: forwards;
            animation-fill-mode: forwards;
            opacity: 1;
          }

          .update-row {
            -webkit-animation: update 0.5s ease-out 12s 1 alternate;
            animation: update 0.5s ease-out 12s 1 alternate;
          }

          .update1 {
            position: absolute;
            top: 25px;
            display: inline-block;
            opacity: 1;
            -webkit-animation: update1 1s ease-out 12s 1 alternate;
            animation: update1 1s ease-out 12s 1 alternate;
            -webkit-animation-fill-mode: forwards;
            animation-fill-mode: forwards;
          }

          .update2 {
            position: absolute;
            top: 25px;
            display: inline-block;
            opacity: 0;
            -webkit-animation: update2 4s ease-out 13s 1 alternate;
            animation: update2 4s ease-out 13s 1 alternate;
            -webkit-animation-fill-mode: forwards;
            animation-fill-mode: forwards;
          }

          .small {
            color: rgba(102, 102, 102, 0.9);
            font-size: 10px;
            padding: 0 10px;
            margin: 0;
          }
          @media only screen and (max-width: 767px) {
            .small {
              display: none;
            }
          }

          article.total {
            border-top: 3px solid rgba(255, 255, 255, 0.1);
          }

          .nobreak {
            white-space: nowrap;
            overflow: hidden !important;
            text-overflow: ellipsis;
          }

          .font-small{
            font-size: 12px !important;
          }

          .font-small-2{
            font-size: 10px !important;
          }

          .center {
            text-align: center;
          }
      </style>

      </head>
      <body>
        <section class="wrapper">
          ${header}
          ${footer}
          ${symbolHeader}
          ${content}
          ${lastUpdated}
          ${disclaimer}
        </section>
      </body>
    </html>
  `
}

const generateCompositionHtmlTable = (composition, options = { delta: true }) => {
  const lastUpdatedDate = moment(composition[0].created_at).tz('America/Sao_Paulo').format('DD [de] MMMM [de] YYYY [às] HH:mm')
  const header = `
    <main class="row title">
        <ul>
          <li style="width: 100%; text-align: center;">
            Composição do Monetus FIA
          </li>
        </ul>
      </main>
  `
  const symbolHeader = `
    <main class="row title">
      <ul>
        <li>Ativo</li>
        <li>Nome</li>
        <li class="right">Porcentagem</li>
      </ul>
    </main>
  `

  let content = ''

  composition.forEach(c => {
    content += `
      <section class="row-fadeOut-wrapper">
        <article class="row fadeIn zero">
          <ul>
            <li><a href="#" class="zero bold">${c.ticker}</a></li>
            <li class="nobreak">${c.name}</li>
            <li class="right">${(c.allocation / 100).toFixed(2)}%</li>
          </ul>
        </article>
      </section>
    `
  })

  const lastUpdated = `
    <main class="row title">
      <ul>
        <li style="width: 100%; text-align: center;" class="font-small">
          Atualizado em ${lastUpdatedDate}
        </li>
      </ul>
    </main>
`

  const disclaimer = `
    <main class="row title">
      <ul>
        <li style="width: 100%; text-align: center;" class="font-small">
          Link para o grupo no Telegram com o bot: <a class="positive" href="https://bit.ly/3b6uOHS" target="_blank">https://bit.ly/3b6uOHS</a>
        </li>
        <li style="width: 100%; text-align: center;" class="font-small-2">
          A composição do <b>Monetus FIA</b> é atualizado seguindo as
          informações página do <b>Comparador de Fundos</b> da própria
          Monetus.
        </li>
        <li style="width: 100%; text-align: center;" class="font-small-2">
          Bot não oficial para exibir a rentabilidade do Monetus FIA. Criador
          <a class="positive" href="https://t.me/italofialho" target="_blank">https://t.me/italofialho</a>
        </li>
      </ul>
    </main>
`

  return `
  <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />

        <style>
          @font-face {
            font-family: "Graphik";
            font-weight: normal;
            src: url("https://s3-sa-east-1.amazonaws.com/monetus-assets/fonts/Graphik-Regular-Web.woff");
          }

          @font-face {
            font-family: "Graphik";
            font-weight: bold;
            src: url("https://s3-sa-east-1.amazonaws.com/monetus-assets/fonts/Graphik-Medium-Web.woff");
          }

          body {
            width: 400px;
            background: rgba(0, 0, 0, 0.9);
            font-family: Graphik;
          }

          .bold {
            font-weight: bold !important;
          }

          .right {
            text-align: right;
          }

          li.zero,
          a.zero {
            color: #007aff;
          }

          li.positive,
          a.positive {
            color: #7ed321;
          }

          li.negative,
          a.negative {
            color: #e53935;
          }

          article.negative {
            border-left: 3px solid #e53935;
            border-right: 3px solid #e53935;
          }
          article.positive {
            border-left: 3px solid #7ed321;
            border-right: 3px solid #7ed321;
          }
          article.zero {
            border-left: 3px solid #007aff;
            border-right: 3px solid #007aff;
          }

          a {
            text-decoration: none;
            -webkit-transition: color 0.2s ease-out;
            transition: color 0.2s ease-out;
          }

          .wrapper {
            width: 100%;
            max-width: 1000px;
            margin: 20px auto 100px auto;
            padding: 0;
            background: rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.9);
            overflow: hidden;
            position: relative;
          }

          .row ul {
            margin: 0;
            padding: 0;
          }

          .row ul li {
            margin: 0;
            font-size: 16px;
            font-weight: normal;
            list-style: none;
            display: inline-block;
            width: calc(100% / 3);
            box-sizing: border-box;
          }
          @media only screen and (max-width: 767px) and (min-width: 480px) {
            .row ul li {
              font-size: 13px;
            }
          }
          @media only screen and (max-width: 479px) {
            .row ul li {
              font-size: 13px;
            }
          }

          .title ul li {
            padding: 15px 13px;
          }

          .row ul li {
            padding: 5px 10px;
          }

          .row {
            font-size: 0;
            overflow: hidden;
            -webkit-transition: all 0.2s ease-out;
            transition: all 0.2s ease-out;
            border-top: 1px solid rgba(0, 0, 0, 0.1);
          }

          .title {
            font-size: 0;
            background-color: rgba(255, 255, 255, 0.1);
            border-left: 3px solid rgba(255, 255, 255, 0.1);
          }

          @media only screen and (max-width: 767px) {
            .title-hide {
              display: none;
            }
          }

          .fadeIn {
            font-size: 0;
            -webkit-transition: all 0.2s ease-out;
            transition: all 0.2s ease-out;
          }

          .row-fadeOut-wrapper {
            font-size: 0;
            overflow: hidden;
            position: relative;
            -webkit-transition: all 0.2s ease-out;
            transition: all 0.2s ease-out;
            -webkit-animation: fadeOut 0.4s ease-out 8s 1 alternate;
            animation: fadeOut 0.4s ease-out 8s 1 alternate;
            -webkit-animation-fill-mode: forwards;
            animation-fill-mode: forwards;
            opacity: 1;
          }

          .update-row {
            -webkit-animation: update 0.5s ease-out 12s 1 alternate;
            animation: update 0.5s ease-out 12s 1 alternate;
          }

          .update1 {
            position: absolute;
            top: 25px;
            display: inline-block;
            opacity: 1;
            -webkit-animation: update1 1s ease-out 12s 1 alternate;
            animation: update1 1s ease-out 12s 1 alternate;
            -webkit-animation-fill-mode: forwards;
            animation-fill-mode: forwards;
          }

          .update2 {
            position: absolute;
            top: 25px;
            display: inline-block;
            opacity: 0;
            -webkit-animation: update2 4s ease-out 13s 1 alternate;
            animation: update2 4s ease-out 13s 1 alternate;
            -webkit-animation-fill-mode: forwards;
            animation-fill-mode: forwards;
          }

          .small {
            color: rgba(102, 102, 102, 0.9);
            font-size: 10px;
            padding: 0 10px;
            margin: 0;
          }
          @media only screen and (max-width: 767px) {
            .small {
              display: none;
            }
          }

          article.total {
            border-top: 3px solid rgba(255, 255, 255, 0.1);
          }

          .nobreak {
            white-space: nowrap;
            overflow: hidden !important;
            text-overflow: ellipsis;
          }

          .font-small{
            font-size: 12px !important;
          }

          .font-small-2{
            font-size: 10px !important;
          }
      </style>

      </head>
      <body>
        <section class="wrapper">
          ${header}
          ${symbolHeader}
          ${content}
          ${lastUpdated}
          ${disclaimer}
        </section>
      </body>
    </html>
  `
}

const generateTickerDetailsHtmlTable = (composition) => {
  const lastUpdatedDate = moment(composition.created_at).tz('America/Sao_Paulo').format('DD [de] MMMM [de] YYYY [às] HH:mm')
  const header = `
    <main class="row title">
        <ul>
          <li style="width: 100%; text-align: center;">
            Detalhes do ativo ${composition.ticker} (${composition.name})
          </li>
        </ul>
      </main>
  `
  const symbolHeader = `
    <main class="row title">
      <ul>
        <li>Ativo</li>
        <li>Nome</li>
        <li class="right">Porcentagem</li>
      </ul>
    </main>
  `

  let content = `
    <section class="row-fadeOut-wrapper">
      <article class="row fadeIn zero">
        <ul>
          <li>${composition.ticker}</li>
          <li class="nobreak">${composition.name}</li>
          <li class="right">${(composition.allocation / 100).toFixed(2)}%</li>
        </ul>
        <ul>
          <li style="width: 100%;" class="font-small">${composition.description}</li>
        </ul>
      </article>
    </section>
  `

  const lastUpdated = `
    <main class="row title">
      <ul>
        <li style="width: 100%; text-align: center;" class="font-small">
          Atualizado em ${lastUpdatedDate}
        </li>
      </ul>
    </main>
`

  const disclaimer = `
    <main class="row title">
      <ul>
        <li style="width: 100%; text-align: center;" class="font-small">
          Link para o grupo no Telegram com o bot: <a class="positive" href="https://bit.ly/3b6uOHS" target="_blank">https://bit.ly/3b6uOHS</a>
        </li>
        <li style="width: 100%; text-align: center;" class="font-small-2">
          A composição do <b>Monetus FIA</b> é atualizado seguindo as
          informações página do <b>Comparador de Fundos</b> da própria
          Monetus.
        </li>
        <li style="width: 100%; text-align: center;" class="font-small-2">
          Bot não oficial para exibir a rentabilidade do Monetus FIA. Criador
          <a class="positive" href="https://t.me/italofialho" target="_blank">https://t.me/italofialho</a>
        </li>
      </ul>
    </main>
`

  return `
  <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />

        <style>
          @font-face {
            font-family: "Graphik";
            font-weight: normal;
            src: url("https://s3-sa-east-1.amazonaws.com/monetus-assets/fonts/Graphik-Regular-Web.woff");
          }

          @font-face {
            font-family: "Graphik";
            font-weight: bold;
            src: url("https://s3-sa-east-1.amazonaws.com/monetus-assets/fonts/Graphik-Medium-Web.woff");
          }

          body {
            width: 400px;
            background: rgba(0, 0, 0, 0.9);
            font-family: Graphik;
          }

          .bold {
            font-weight: bold !important;
          }

          .right {
            text-align: right;
          }

          li.zero,
          a.zero {
            color: #007aff;
          }

          li.positive,
          a.positive {
            color: #7ed321;
          }

          li.negative,
          a.negative {
            color: #e53935;
          }

          article.negative {
            border-left: 3px solid #e53935;
            border-right: 3px solid #e53935;
          }
          article.positive {
            border-left: 3px solid #7ed321;
            border-right: 3px solid #7ed321;
          }
          article.zero {
            border-left: 3px solid #007aff;
            border-right: 3px solid #007aff;
          }

          a {
            text-decoration: none;
            -webkit-transition: color 0.2s ease-out;
            transition: color 0.2s ease-out;
          }

          .wrapper {
            width: 100%;
            max-width: 1000px;
            margin: 20px auto 100px auto;
            padding: 0;
            background: rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.9);
            overflow: hidden;
            position: relative;
          }

          .row ul {
            margin: 0;
            padding: 0;
          }

          .row ul li {
            margin: 0;
            font-size: 16px;
            font-weight: normal;
            list-style: none;
            display: inline-block;
            width: calc(100% / 3);
            box-sizing: border-box;
          }
          @media only screen and (max-width: 767px) and (min-width: 480px) {
            .row ul li {
              font-size: 13px;
            }
          }
          @media only screen and (max-width: 479px) {
            .row ul li {
              font-size: 13px;
            }
          }

          .title ul li {
            padding: 15px 13px;
          }

          .row ul li {
            padding: 5px 10px;
          }

          .row {
            font-size: 0;
            overflow: hidden;
            -webkit-transition: all 0.2s ease-out;
            transition: all 0.2s ease-out;
            border-top: 1px solid rgba(0, 0, 0, 0.1);
          }

          .title {
            font-size: 0;
            background-color: rgba(255, 255, 255, 0.1);
            border-left: 3px solid rgba(255, 255, 255, 0.1);
          }

          @media only screen and (max-width: 767px) {
            .title-hide {
              display: none;
            }
          }

          .fadeIn {
            font-size: 0;
            -webkit-transition: all 0.2s ease-out;
            transition: all 0.2s ease-out;
          }

          .row-fadeOut-wrapper {
            font-size: 0;
            overflow: hidden;
            position: relative;
            -webkit-transition: all 0.2s ease-out;
            transition: all 0.2s ease-out;
            -webkit-animation: fadeOut 0.4s ease-out 8s 1 alternate;
            animation: fadeOut 0.4s ease-out 8s 1 alternate;
            -webkit-animation-fill-mode: forwards;
            animation-fill-mode: forwards;
            opacity: 1;
          }

          .update-row {
            -webkit-animation: update 0.5s ease-out 12s 1 alternate;
            animation: update 0.5s ease-out 12s 1 alternate;
          }

          .update1 {
            position: absolute;
            top: 25px;
            display: inline-block;
            opacity: 1;
            -webkit-animation: update1 1s ease-out 12s 1 alternate;
            animation: update1 1s ease-out 12s 1 alternate;
            -webkit-animation-fill-mode: forwards;
            animation-fill-mode: forwards;
          }

          .update2 {
            position: absolute;
            top: 25px;
            display: inline-block;
            opacity: 0;
            -webkit-animation: update2 4s ease-out 13s 1 alternate;
            animation: update2 4s ease-out 13s 1 alternate;
            -webkit-animation-fill-mode: forwards;
            animation-fill-mode: forwards;
          }

          .small {
            color: rgba(102, 102, 102, 0.9);
            font-size: 10px;
            padding: 0 10px;
            margin: 0;
          }
          @media only screen and (max-width: 767px) {
            .small {
              display: none;
            }
          }

          article.total {
            border-top: 3px solid rgba(255, 255, 255, 0.1);
          }

          .nobreak {
            white-space: nowrap;
            overflow: hidden !important;
            text-overflow: ellipsis;
          }

          .font-small{
            font-size: 12px !important;
          }

          .font-small-2{
            font-size: 10px !important;
          }
      </style>

      </head>
      <body>
        <section class="wrapper">
          ${header}
          ${symbolHeader}
          ${content}
          ${lastUpdated}
          ${disclaimer}
        </section>
      </body>
    </html>
  `
}

const generateQuoteDetailsHtmlTable = (quote, asset) => {
  const lastUpdatedDate = moment(quote.requestTimestamp).tz('America/Sao_Paulo').format('DD [de] MMMM [de] YYYY [às] HH:mm')
  const header = `
    <main class="row title">
        <ul>
          <li style="width: 100%; text-align: center;">
            Cotação - ${asset.name} (${asset.ticker})
          </li>
        </ul>
      </main>
  `

  let content = `
    <section class="row-fadeOut-wrapper">
      <article class="row fadeIn zero">
        <ul>
          <li>Variação</li>
          <li class="right">${formatDelta(quote.delta)}</li>
        </ul>
        <ul>
          <li>Anterior</li>
          <li class="right">${toReal(quote.previousClose)}</li>
        </ul>
        <ul>
          <li>Abertura</li>
          <li class="right">${toReal(quote.open)}</li>
        </ul>
        <ul>
          <li>Alta</li>
          <li class="right">${toReal(quote.high)}</li>
        </ul>
        <ul>
          <li>Preço</li>
          <li class="right">${toReal(quote.price)}</li>
        </ul>
        <ul>
          <li>Baixa</li>
          <li class="right">${toReal(quote.low)}</li>
        </ul>
        <ul>
          <li>Volume</li>
          <li class="right">${formatNumber(quote.volume)}</li>
        </ul>
      </article>
    </section>
  `

  const lastUpdated = `
    <main class="row title">
      <ul>
        <li style="width: 100%; text-align: center;" class="font-small">
          Atualizado em ${lastUpdatedDate}
        </li>
      </ul>
    </main>
`

  const disclaimer = `
    <main class="row title">
      <ul>
        <li style="width: 100%; text-align: center;" class="font-small">
          Link para o grupo no Telegram com o bot: <a class="positive" href="https://bit.ly/3b6uOHS" target="_blank">https://bit.ly/3b6uOHS</a>
        </li>
        <li style="width: 100%; text-align: center;" class="font-small-2">
          A composição do <b>Monetus FIA</b> é atualizado seguindo as
          informações página do <b>Comparador de Fundos</b> da própria
          Monetus.
        </li>
        <li style="width: 100%; text-align: center;" class="font-small-2">
          Bot não oficial para exibir a rentabilidade do Monetus FIA. Criador
          <a class="positive" href="https://t.me/italofialho" target="_blank">https://t.me/italofialho</a>
        </li>
      </ul>
    </main>
`

  return `
  <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />

        <style>
          @font-face {
            font-family: "Graphik";
            font-weight: normal;
            src: url("https://s3-sa-east-1.amazonaws.com/monetus-assets/fonts/Graphik-Regular-Web.woff");
          }

          @font-face {
            font-family: "Graphik";
            font-weight: bold;
            src: url("https://s3-sa-east-1.amazonaws.com/monetus-assets/fonts/Graphik-Medium-Web.woff");
          }

          body {
            width: 400px;
            background: rgba(0, 0, 0, 0.9);
            font-family: Graphik;
          }

          .bold {
            font-weight: bold !important;
          }

          .right {
            text-align: right;
          }

          li.zero,
          a.zero {
            color: #007aff;
          }

          li.positive,
          a.positive {
            color: #7ed321;
          }

          li.negative,
          a.negative {
            color: #e53935;
          }

          article.negative {
            border-left: 3px solid #e53935;
            border-right: 3px solid #e53935;
          }
          article.positive {
            border-left: 3px solid #7ed321;
            border-right: 3px solid #7ed321;
          }
          article.zero {
            border-left: 3px solid #007aff;
            border-right: 3px solid #007aff;
          }

          a {
            text-decoration: none;
            -webkit-transition: color 0.2s ease-out;
            transition: color 0.2s ease-out;
          }

          .wrapper {
            width: 100%;
            max-width: 1000px;
            margin: 20px auto 100px auto;
            padding: 0;
            background: rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.9);
            overflow: hidden;
            position: relative;
          }

          .row ul {
            margin: 0;
            padding: 0;
          }

          .row ul li {
            margin: 0;
            font-size: 16px;
            font-weight: normal;
            list-style: none;
            display: inline-block;
            width: calc(100% / 2);
            box-sizing: border-box;
          }
          @media only screen and (max-width: 767px) and (min-width: 480px) {
            .row ul li {
              font-size: 13px;
            }
          }
          @media only screen and (max-width: 479px) {
            .row ul li {
              font-size: 13px;
            }
          }

          .title ul li {
            padding: 15px 13px;
          }

          .row ul li {
            padding: 5px 10px;
          }

          .row {
            font-size: 0;
            overflow: hidden;
            -webkit-transition: all 0.2s ease-out;
            transition: all 0.2s ease-out;
            border-top: 1px solid rgba(0, 0, 0, 0.1);
          }

          .title {
            font-size: 0;
            background-color: rgba(255, 255, 255, 0.1);
            border-left: 3px solid rgba(255, 255, 255, 0.1);
          }

          @media only screen and (max-width: 767px) {
            .title-hide {
              display: none;
            }
          }

          .fadeIn {
            font-size: 0;
            -webkit-transition: all 0.2s ease-out;
            transition: all 0.2s ease-out;
          }

          .row-fadeOut-wrapper {
            font-size: 0;
            overflow: hidden;
            position: relative;
            -webkit-transition: all 0.2s ease-out;
            transition: all 0.2s ease-out;
            -webkit-animation: fadeOut 0.4s ease-out 8s 1 alternate;
            animation: fadeOut 0.4s ease-out 8s 1 alternate;
            -webkit-animation-fill-mode: forwards;
            animation-fill-mode: forwards;
            opacity: 1;
          }

          .update-row {
            -webkit-animation: update 0.5s ease-out 12s 1 alternate;
            animation: update 0.5s ease-out 12s 1 alternate;
          }

          .update1 {
            position: absolute;
            top: 25px;
            display: inline-block;
            opacity: 1;
            -webkit-animation: update1 1s ease-out 12s 1 alternate;
            animation: update1 1s ease-out 12s 1 alternate;
            -webkit-animation-fill-mode: forwards;
            animation-fill-mode: forwards;
          }

          .update2 {
            position: absolute;
            top: 25px;
            display: inline-block;
            opacity: 0;
            -webkit-animation: update2 4s ease-out 13s 1 alternate;
            animation: update2 4s ease-out 13s 1 alternate;
            -webkit-animation-fill-mode: forwards;
            animation-fill-mode: forwards;
          }

          .small {
            color: rgba(102, 102, 102, 0.9);
            font-size: 10px;
            padding: 0 10px;
            margin: 0;
          }
          @media only screen and (max-width: 767px) {
            .small {
              display: none;
            }
          }

          article.total {
            border-top: 3px solid rgba(255, 255, 255, 0.1);
          }

          .nobreak {
            white-space: nowrap;
            overflow: hidden !important;
            text-overflow: ellipsis;
          }

          .font-small{
            font-size: 12px !important;
          }

          .font-small-2{
            font-size: 10px !important;
          }
      </style>

      </head>
      <body>
        <section class="wrapper">
          ${header}
          ${content}
          ${lastUpdated}
          ${disclaimer}
        </section>
      </body>
    </html>
  `
}

module.exports = { generatePerformaceHtmlTable, generateCompositionHtmlTable, generateTickerDetailsHtmlTable, generateQuoteDetailsHtmlTable }
