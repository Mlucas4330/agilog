import {
  Accordion,
  Spinner,
  AccordionPanel,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Grid,
  GridItem,
  Heading,
  Stack,
  Text,
  Flex,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker, Circle } from "@react-google-maps/api";
import { FaFileAlt, FaFileExcel, FaHome } from "react-icons/fa";
import { FaCog } from "react-icons/fa";
import { FaTimesCircle } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import * as XLSX from "xlsx";

function App() {
  const [teste, setTeste] = useState([]);
  const [obrigacao, setObrigacao] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingObr, setIsLoadingObr] = useState(true);

  const menus = [
    {
      label: "Dashboard",
      icon: <FaHome />,
      action: () => console.log("Dashboard clicado"),
    },
    {
      label: "Usuário",
      icon: <FaUser />,
      action: () => console.log("Usuário clicado"),
    },
    {
      label: "Configurações",
      icon: <FaCog />,
      action: () => console.log("Configurações clicado"),
    },
    {
      label: "Gerar Excel",
      icon: <FaFileExcel />,
      action: () => geraExcel(),
    },
    {
      label: "Estatísticas",
      icon: <FaFileAlt />,
      action: () => console.log("Estatísticas clicado"),
    },
    {
      label: "Sair",
      icon: <FaTimesCircle />,
      action: () => console.log("Sair clicado"),
    },
  ];

  const municipios = [
    {
      label: "Rio de Janeiro",
    },
    {
      label: "São Paulo",
    },
    {
      label: "Porto Alegre",
    },
  ];

  const circleOptions = {
    strokeColor: "#FF0000",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#FF0000",
    fillOpacity: 0.35,
    radius: 8000,
  };

  const montaExcel = (dados, opcao) => {
    if (opcao === "obrigacao") {
      const tabelaObrigacao = document.getElementById("tbodyObrigacoes");
      tabelaObrigacao.innerHTML = "";

      dados.forEach((item) => {
        const row = document.createElement("tr");

        const origemCell = document.createElement("td");
        origemCell.textContent = item.origem || "";

        const requisitoCell = document.createElement("td");
        requisitoCell.textContent = item.requisito || "";

        const obrigacaoCell = document.createElement("td");
        obrigacaoCell.textContent = item.obrigacao || "";

        row.appendChild(origemCell);
        row.appendChild(requisitoCell);
        row.appendChild(obrigacaoCell);

        tabelaObrigacao.appendChild(row);
      });
    } else if (opcao === "noticia") {
      const tabelaNoticia = document.getElementById("tbodyNoticias");
      tabelaNoticia.innerHTML = "";

      dados.forEach((item) => {
        const row = document.createElement("tr");

        const localCell = document.createElement("td");
        localCell.textContent = item.local_interdicao || "";

        const resumoCell = document.createElement("td");
        resumoCell.textContent = item.resumo || "";

        const dataCell = document.createElement("td");
        dataCell.textContent = item.data_inclusao || "";

        const municipioCell = document.createElement("td");
        municipioCell.textContent = item.municipio || "";

        const fonteCell = document.createElement("td");
        fonteCell.textContent = "https://www.otempo.com.br/transito" || "";

        row.appendChild(localCell);
        row.appendChild(resumoCell);
        row.appendChild(dataCell);
        row.appendChild(municipioCell);
        row.appendChild(fonteCell);

        tabelaNoticia.appendChild(row);
      });
    }
  };

  const geraExcel = () => {
    const tabelaNoticias = document.getElementById("tbl_1");
    const tabelaObrigacoes = document.getElementById("tbl_2");

    const dataAtual = new Date().toLocaleDateString("pt-BR");
    const nomeEmpresa = "Nome da Empresa";

    const inserirCabecalho = (tabela) => {
      const cabecalho = tabela.createTHead();
      const linhaCabecalho = cabecalho.insertRow(0);

      const celulaNomeEmpresa = linhaCabecalho.insertCell(0);
      celulaNomeEmpresa.colSpan = tabela.rows[0].cells.length;
      celulaNomeEmpresa.style.textAlign = "left";
      celulaNomeEmpresa.innerHTML = `<strong>${nomeEmpresa}</strong>`;

      const celulaDataAtual = linhaCabecalho.insertCell(1);
      celulaDataAtual.colSpan = tabela.rows[0].cells.length;
      celulaDataAtual.style.textAlign = "right";
      celulaDataAtual.innerHTML = `<strong>Data: ${dataAtual}</strong>`;

      const linhaVazia1 = tabela.insertRow(1);
      const celulaVazia1 = linhaVazia1.insertCell(0);
      celulaVazia1.colSpan = tabela.rows[0].cells.length;

      const linhaVazia2 = tabela.insertRow(2);
      const celulaVazia2 = linhaVazia2.insertCell(0);
      celulaVazia2.colSpan = tabela.rows[0].cells.length;
    };

    inserirCabecalho(tabelaNoticias);
    inserirCabecalho(tabelaObrigacoes);

    const wb = XLSX.utils.book_new();

    const wsNoticias = XLSX.utils.table_to_sheet(tabelaNoticias);
    XLSX.utils.book_append_sheet(wb, wsNoticias, "Noticias");

    const wsObrigacoes = XLSX.utils.table_to_sheet(tabelaObrigacoes);
    XLSX.utils.book_append_sheet(wb, wsObrigacoes, "Obrigacoes");

    XLSX.writeFile(wb, "tabelas.xlsx");
  };

  const buscaNoticia = async () => {
    const response = await fetch(
      "https://www.legnet.com.br/legnet/api/agilog/recupera_restricoes.php"
    );

    const data = await response.json();
    console.log(data);

    setTeste((prevTeste) => [...prevTeste, ...data]);
    montaExcel(data, "noticia");
  };

  const buscaObrigacao = async () => {
    const arrayDados = [];
    const dadosObrigacoes = await fetch(
      "https://www.legnet.com.br/legnet/api/json/1/legislacoesRestricao.json" +
        "?_=" +
        new Date().getTime()
    );

    const { dados } = await dadosObrigacoes.json();

    for (const dado of dados) {
      const obrigacao = dado.obrigacao;
      const response = await fetch(
        "https://www.legnet.com.br:1330/assistant/asst_Yk2w9azlqy5F6pc9J8QMANSb",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: obrigacao.trim() }),
        }
      );
      const data = await response.json();

      const result = JSON.parse(data.message);

      result.origem = dado.origem;
      result.requisito = dado.requisito;

      arrayDados.push(result);
    }

    // for (let item of data) {
    //   item.center = await getCenterCircle(item.local_interdicao)
    // }

    setObrigacao(arrayDados);
    montaExcel(arrayDados, "obrigacao");
    setIsLoadingObr(false);
  };

  const loadNoticias = async () => {
    await buscaNoticia();

    setIsLoading(false);
  };

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

  const getCenterCircle = async (local_interdicao) => {
    if (
      !local_interdicao ||
      local_interdicao == "N/A" ||
      local_interdicao == "Não especificado" ||
      local_interdicao == "não mencionado"
    )
      return;

    const coordenates = await geocode(local_interdicao);

    return coordenates;
  };

  // const getPosition = async (municipio, local_interdicao) => {
  //   if (['N/A', 'Não especificado', 'Nenhuma informação de trânsito no local', ''].includes(local_interdicao)) return

  //   const address = municipio + ', ' + local_interdicao

  //   const coordenates = await geocode(address)

  //   return coordenates
  // }

  useEffect(() => {
    buscaObrigacao();
    loadNoticias();
  }, []);

  return (
    <>
      <div style={{ display: "none" }} id="table_excel">
        <table id="tbl_1">
          <thead>
            <tr>
              <th>Local Interdição</th>
              <th>Resumo</th>
              <th>Data Inclusão</th>
              <th>Municipio</th>
              <th>Fonte</th>
            </tr>
          </thead>
          <tbody id="tbodyNoticias"></tbody>
        </table>
      </div>
      <div style={{ display: "none" }} id="table_excel2">
        <table id="tbl_2">
          <thead>
            <tr>
              <th>Origem</th>
              <th>Requisito</th>
              <th>Obrigação</th>
            </tr>
          </thead>
          <tbody id="tbodyObrigacoes"></tbody>
        </table>
      </div>
      <Container
        maxW={"container.xxl"}
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"space-between"}
        minHeight={"100vh"}
      >
        <Heading as={"h1"} color={"#207155"} fontWeight={"300"} mt={5}>
          AGILOG
        </Heading>
        <Flex justifyContent={"center"} gap={5}>
          {menus.map((menu) => (
            <Button
              w={"200px"}
              size={"lg"}
              bgColor="#2F9B7C"
              colorScheme="green"
              leftIcon={menu.icon}
              onClick={menu.action}
            >
              {menu.label}
            </Button>
          ))}
        </Flex>
        <Grid mt={5} gap={5} templateColumns={"400px 1fr 400px"}>
          <GridItem>
            <Heading
              mb={5}
              as={"h4"}
              size={"lg"}
              color={"#207155"}
              fontWeight={"300"}
            >
              Restrições Legais e Normativas
            </Heading>
            {isLoadingObr ? (
              <Spinner />
            ) : (
              <Stack direction="column" maxH={"500px"} overflowY={"auto"}>
                {obrigacao.map((test) => (
                  <>
                    <Card as={"button"} colorScheme="green" bgColor={"#2F9B7C"}>
                      <CardBody>
                        <Text color={"white"}>
                          {test.origem} - {test.requisito} - {test.resumo}
                        </Text>
                      </CardBody>
                    </Card>
                  </>
                ))}
              </Stack>
            )}
          </GridItem>
          <GridItem>
            <LoadScript googleMapsApiKey="AIzaSyBX7WvQpK5cVjZduDZEoSxK4X-v6ARMyaM">
              <GoogleMap
                mapContainerStyle={{
                  height: "600px",
                }}
                center={{
                  lat: -15.77972,
                  lng: -47.92972,
                }}
                zoom={4}
              >
                {teste.map((test) => (
                  <Marker position={test.position} />
                ))}
                {obrigacao.map((obr) => (
                  <Circle center={obr.center} options={circleOptions} />
                ))}
              </GoogleMap>
            </LoadScript>
          </GridItem>
          <GridItem>
            <Heading
              mb={5}
              as={"h4"}
              size={"lg"}
              color={"#207155"}
              fontWeight={"300"}
            >
              Notícias de Restrições
            </Heading>
            <Accordion allowToggle>
              {isLoading ? (
                <Spinner />
              ) : (
                municipios.map((municipio, index) => (
                  <AccordionItem
                    maxH={"500px"}
                    mb={3}
                    overflowY={"auto"}
                    key={index}
                  >
                    <h2>
                      <AccordionButton
                        h={"60px"}
                        borderRadius={"8px"}
                        bgColor={"#2F9B7C"}
                        textColor={"white"}
                      >
                        <Box as="span" flex="1" textAlign="left">
                          {municipio.label}
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    {teste
                      .filter((test) => test.municipio === municipio.label)
                      .map((test, index) => (
                        <AccordionPanel
                          key={index}
                          pb={4}
                          title={test.resumo}
                          bgColor={"white"}
                        >
                          <Text>{test.local_interdicao}</Text>
                        </AccordionPanel>
                      ))}
                  </AccordionItem>
                ))
              )}
            </Accordion>
          </GridItem>
        </Grid>
      </Container>
      <Box
        mt={5}
        p={"50px 30px"}
        textAlign={"right"}
        color={"white"}
        bgColor={"white"}
        background={"url(https://legnet.com.br/img/shape-pe.png) top right"}
      >
        <strong>© LegNET</strong>
      </Box>
    </>
  );
}

export default App;
