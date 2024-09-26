process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const fetch = require("node-fetch");

const municipios = [
  {
    label: "São Paulo",
  },
];

const geocode = async (address) => {
  const key = "AIzaSyBX7WvQpK5cVjZduDZEoSxK4X-v6ARMyaM";

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${key}`
  );

  const data = await response.json();

  if (data.status === "OK") {
    const location = data.results[0].geometry.location;

    return {
      lat: location.lat,
      lng: location.lng,
    };
  }
};

const getPosition = async (municipio, local_interdicao) => {
  if (
    [
      "N/A",
      "Não especificado",
      "Nenhuma informação de trânsito no local",
      "",
    ].includes(local_interdicao)
  )
    return;

  const address = municipio + ", " + local_interdicao;

  const coordenates = await geocode(address);

  return coordenates;
};

const buscaNoticia = async (municipio) => {
  let response;
  let arrayNoticias = [];

  // const options = {
  //   agent,
  //   timeout: 60000,
  // };

  if (municipio === "Rio de Janeiro") {
    response = await fetch("https://www.legnet.com.br:3001/api/noticias3");
  } else if (municipio === "São Paulo") {
    response = await fetch("https://www.legnet.com.br:3001/api/noticias5");
  } else if (municipio === "Porto Alegre") {
    response = await fetch("https://www.legnet.com.br:3001/api/noticias4");
  }

  const { data } = await response.json();

  const dataComMunicipio = data.map((item) => ({
    ...item,
    municipio: municipio,
  }));

  for (let item of dataComMunicipio) {
    item.position = await getPosition(item.municipio, item.local_interdicao);
  }

  arrayNoticias = [...dataComMunicipio];

  await enviaNoticia(arrayNoticias);
};

const enviaNoticia = async (dados) => {
  const response = await fetch(
    "https://www.legnet.com.br/legnet/api/agilog/agilog_restricoes.php",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
      timeout: 60000,
    }
  );

  if (!response.ok) {
    console.error("Erro ao enviar notícias:", response.statusText);
  } else {
    console.log("Notícias enviadas com sucesso!");
  }
};

const enviaObrigacao = async () => {
  const response = await fetch(
    "https://www.legnet.com.br:3001/api/requisitoObrigacao"
  );

  if (!response.ok) {
    console.error("Erro ao enviar obrigacoes:", response.statusText);
  } else {
    console.log("Obrigações enviadas com sucesso!");
  }
};

const main = async () => {
  for (let municipio of municipios) {
    await buscaNoticia(municipio.label);
  }
  await enviaObrigacao();
};

// Chama a função principal
main().catch((error) => {
  console.error("Erro ao executar o script:", error);
  process.exit(1);
});
