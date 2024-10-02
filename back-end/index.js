process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const { chromium } = require("playwright");
const fetch = require("node-fetch");
const express = require("express");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const https = require("https");

const app = express();

app.use(cors());

const PORT = process.env.PORT || 3001;

const enviaObrigacao = async (
  origem,
  requisito,
  obrigacao,
  ordem,
  resumo,
  local_interdicao,
  tipo_veiculo,
  horarios,
  cod_legislacao,
  cod_obrigacao,
  cod_cliente_leg,
  cod_cliente_usr,
  cod_pais,
  nome_empresa
) => {
  try {
    // Log dos parâmetros recebidos
    console.log("Parâmetros recebidos:", {
      origem,
      requisito,
      obrigacao,
      resumo,
      local_interdicao,
      tipo_veiculo,
      horarios,
      cod_legislacao,
      cod_obrigacao,
      cod_cliente_leg,
      cod_cliente_usr,
      cod_pais,
    });

    const arrayDados = [];
    arrayDados.push({
      origem: origem,
      requisito: requisito,
      obrigacao: obrigacao,
      ordem: ordem,
      resumo: resumo,
      local_interdicao: local_interdicao,
      tipo_veiculo: tipo_veiculo,
      horarios: horarios,
      cod_legislacao: cod_legislacao,
      cod_obrigacao: cod_obrigacao,
      cod_cliente_leg: cod_cliente_leg,
      cod_cliente_usr: cod_cliente_usr,
      cod_pais: cod_pais,
      nome_empresa: nome_empresa,
    });

    // Log dos dados a serem enviados
    console.log(
      "Dados que serão enviados para a API:",
      JSON.stringify({ dados: arrayDados })
    );

    const resposta = await fetch(
      "https://www.legnet.com.br/legnet/api/agilog/insertOuUpdateDasLeis.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dados: arrayDados }),
      }
    );

    console.log("Resposta do fetch:", await resposta.json());

    if (resposta.ok) {
      console.log("Obrigação enviada com sucesso");
      return { ok: true, message: "Obrigação enviada" };
    } else {
      const errorMessage = await resposta.text();
      console.error("Erro ao enviar obrigação", errorMessage);
      return { ok: false, message: "Erro ao enviar notícias" };
    }
  } catch (error) {
    console.error("Erro ao tentar enviar a obrigação", error);
    return { ok: false, message: "Erro na requisição" };
  }
};

app.get("/api/noticias", async function (req, res) {
  try {
    const browser = await chromium.launch({
      headless: false,
    });

    const context = await browser.newContext();
    const page = await context.newPage();
    const arrayTextos = [];

    page.goto("https://www.cetsp.com.br/noticias.aspx", { timeout: 60000 });

    const selectAno = "#ddlAnos";
    const selectMes = "#ddlMeses";
    const classBotao = ".btVerNoticia";
    const className = ".boxItemNoticia";

    const currentYear = new Date().getFullYear().toString();
    await page.selectOption(selectAno, currentYear);

    const currentMonth = (new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0");
    await page.selectOption(selectMes, currentMonth);

    await page.click(classBotao);

    await page.waitForSelector(className);

    const elements = await page.$$(className);
    for (const element of elements) {
      const text = await element.textContent();
      const response = await fetch(
        "https://www.legnet.com.br:1330/assistant/asst_Yk2w9azlqy5F6pc9J8QMANSb",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: text.trim() }),
        }
      );
      const data = await response.json();
      arrayTextos.push(JSON.parse(data.message));
    }
    console.log(arrayTextos);
    res.json({
      data: arrayTextos,
    });

    await browser.close();
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/noticias2", async function (req, res) {
  const browser = await chromium.launch({
    headless: false,
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  const arrayTextos = [];

  await page.goto("https://cor.rio/interdicoes/");

  const className = ".elementor-widget-container";
  const elements = await page.$$(className);

  let stopCollecting = false;

  for (const element of elements) {
    const children = await element.$$("p, h3");
    for (const child of children) {
      const tagName = await child.evaluate((node) =>
        node.tagName.toLowerCase()
      );

      if (tagName === "h3") {
        const h3Text = await child.textContent();
        if (h3Text.trim() === "Horários das reversíveis da cidade") {
          stopCollecting = true;
          break;
        }
      }

      if (tagName === "p" && !stopCollecting) {
        const text = await child.textContent();
        const response = await fetch(
          "https://www.legnet.com.br:1330/assistant/asst_Yk2w9azlqy5F6pc9J8QMANSb",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ content: text.trim() }),
          }
        );
        const data = await response.json();

        console.log(data.message);

        arrayTextos.push(JSON.parse(data.message));
      }
    }

    if (stopCollecting) break;
  }

  res.json({
    data: arrayTextos,
  });

  await browser.close();
});

app.get("/api/noticias3", async function (req, res) {
  const browser = await chromium.launch({
    headless: false,
  });

  const context = await browser.newContext();
  const page = await context.newPage();
  const arrayTextos = [];

  await page.goto("https://www.otempo.com.br/transito", { timeout: 60000 });

  const inputCidade = "#cityInput";
  const classNameContainer = ".transito__container";
  const classNameWrapper = ".transito__wrapper";
  const classNameWrapperCity = ".transito__city";
  const classNameWrapperTimeStamp = ".transito__timestamp";
  const classNameWrapperDescription = ".transito__description";
  const botaoPesquisa = ".here__autocomplete--results";

  await page.click(inputCidade);

  await page.fill(inputCidade, "Taboão da Serra - SP");

  await page.waitForSelector(botaoPesquisa);
  await page.click(botaoPesquisa);
  await page.waitForTimeout(10000);

  const containers = await page.$$(classNameContainer);
  for (const container of containers) {
    const wrappers = await container.$$(classNameWrapper);
    for (const wrapper of wrappers) {
      const cityElement = await wrapper.$(classNameWrapperCity);
      const timeStampElement = await wrapper.$(classNameWrapperTimeStamp);
      const descriptionElement = await wrapper.$(classNameWrapperDescription);

      const textCity = await cityElement.textContent();
      const textTimeStamp = await timeStampElement.textContent();
      const textDescription = await descriptionElement.textContent();

      const textTrimCity = textCity.trim();
      const textTrimTime = textTimeStamp.trim();
      const textTrimDesc = textDescription.trim();
      arrayTextos.push({
        local_interdicao: textTrimCity,
        resumo: textTrimTime + " " + textTrimDesc,
      });
    }
  }

  res.json({
    data: arrayTextos,
  });

  await browser.close();
});

app.get("/api/noticias4", async function (req, res) {
  const browser = await chromium.launch({
    headless: false,
  });

  const context = await browser.newContext();
  const page = await context.newPage();
  const arrayTextos = [];

  await page.goto("https://www.otempo.com.br/transito", { timeout: 60000 });

  const inputCidade = "#cityInput";
  const classNameContainer = ".transito__container";
  const classNameWrapper = ".transito__wrapper";
  const botaoPesquisa = ".here__autocomplete--results";

  await page.click(inputCidade);

  await page.fill(inputCidade, "Porto Alegre - RS");

  await page.waitForSelector(botaoPesquisa);
  await page.click(botaoPesquisa);
  await page.waitForTimeout(10000);

  const containers = await page.$$(classNameContainer);
  for (const container of containers) {
    const wrappers = await container.$$(classNameWrapper);
    for (const wrapper of wrappers) {
      const text = await wrapper.textContent();
      const response = await fetch(
        "https://www.legnet.com.br:1330/assistant/asst_Yk2w9azlqy5F6pc9J8QMANSb",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: text.trim() }),
        }
      );
      const data = await response.json();
      arrayTextos.push(JSON.parse(data.message));
    }
  }

  res.json({
    data: arrayTextos,
  });

  await browser.close();
});

app.get("/api/noticias5", async function (req, res) {
  const browser = await chromium.launch({
    headless: false,
  });

  const context = await browser.newContext();
  const page = await context.newPage();
  const arrayTextos = [];

  await page.goto("https://www.otempo.com.br/transito", { timeout: 120000 });

  const inputCidade = "#cityInput";
  const classNameContainer = ".transito__container";
  const classNameWrapper = ".transito__wrapper";
  const classNameWrapperCity = ".transito__city";
  const classNameWrapperTimeStamp = ".transito__timestamp";
  const classNameWrapperDescription = ".transito__description";
  const botaoPesquisa = ".here__autocomplete--results";

  await page.click(inputCidade);

  await page.fill(inputCidade, "São Paulo - SP");

  await page.waitForSelector(botaoPesquisa);
  await page.click(botaoPesquisa);
  await page.waitForTimeout(60000);

  const containers = await page.$$(classNameContainer);
  for (const container of containers) {
    const wrappers = await container.$$(classNameWrapper);
    for (const wrapper of wrappers) {
      const cityElement = await wrapper.$(classNameWrapperCity);
      const timeStampElement = await wrapper.$(classNameWrapperTimeStamp);
      const descriptionElement = await wrapper.$(classNameWrapperDescription);

      const textCity = await cityElement.textContent();
      const textTimeStamp = await timeStampElement.textContent();
      const textDescription = await descriptionElement.textContent();

      const textTrimCity = textCity.trim();
      const textTrimTime = textTimeStamp.trim();
      const textTrimDesc = textDescription.trim();
      arrayTextos.push({
        local_interdicao: textTrimCity,
        resumo: textTrimTime + " " + textTrimDesc,
      });
    }
  }

  res.json({
    data: arrayTextos,
  });

  await browser.close();
});

async function obrigaParaAssistente(obrigacao) {
  try {
    const response = await fetch(
      "https://www.legnet.com.br:1330/assistant/asst_Yk2w9azlqy5F6pc9J8QMANSb",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: obrigacao.trim(),
        }),
      }
    );

    const data = await response.json();

    return data.message;
  } catch (error) {
    throw new Error(error);
  }
}

function tryJson(data) {
  return new Promise((resolve, reject) => {
    try {
      const result = JSON.parse(data);

      resolve(result);
    } catch (error) {
      reject(data);
    }
  });
}

app.get("/api/requisitoObrigacao", async function (req, res) {
  try {
    const arrayDados = [];
    const dadosObrigacoes = await fetch(
      "https://www.legnet.com.br/legnet/api/json/2791/legislacoesRestricao.json" +
        "?_=" +
        new Date().getTime()
    );
    const { dados } = await dadosObrigacoes.json();
    const promessas = [];

    for (let index = 0; index < dados.length; index++) {
      const dado = dados[index];
      const obrigacao = dado.obrigacao;

      const promessa = (async () => {
        const data = await obrigaParaAssistente(obrigacao.trim());
        return tryJson(data)
          .then(async (result) => {
            await enviaObrigacao(
              dado.origem,
              dado.requisito,
              dado.obrigacao,
              dado.ordem,
              result.resumo_legislacao,
              result.local_trecho_interdicao,
              result.tipo_veiculo,
              result.horarios,
              dado.cod_legislacao,
              dado.cod_obrigacao,
              dado.cod_cliente_leg,
              dado.cod_cliente_usr,
              dado.cod_pais,
              dado.empresa
            );
          })
          .catch((errorData) => {
            console.log(errorData);
          });
      })();

      promessas.push(promessa);
    }

    await Promise.all(promessas);

    // Retorna uma mensagem de sucesso quando tudo for concluído
    res.send({
      ok: true,
      message: "Todas as obrigações foram processadas com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao analisar JSON:", error);
  }
});

app.use(express.static(path.join(__dirname, "build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

const options = {
  key: fs.readFileSync("/etc/letsencrypt/live/www.legnet.com.br/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/www.legnet.com.br/cert.pem"),
};

https.createServer(options, app).listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
