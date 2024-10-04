import {
  Accordion,
  Spinner,
  AccordionPanel,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  Box,
  Card,
  CardBody,
  Container,
  Grid,
  GridItem,
  Heading,
  Stack,
  Text,
  Tooltip,
  Flex,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Input,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useEmpresa } from "../GlobalContext/EmpresaProvider";
import { libraries } from "../constants";

function App() {
  const { setEmpresa } = useEmpresa();
  const [teste, setTeste] = useState([]);
  const [obrigacao, setObrigacao] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingObr, setIsLoadingObr] = useState(true);
  const [markers, setMarkers] = useState([]);
  const [directions, setDirections] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [todasNoticias, setTodasNoticias] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLeis, setSearchLeis] = useState("");
  const [searchTodasNoticias, setSearchTodasNoticias] = useState("");
  const [center, setCenter] = useState({
    lat: -15.77972,
    lng: -47.92972,
  });
  const [zoom, setZoom] = useState(4);

  const { isLoaded } = useJsApiLoader({
    libraries: libraries,
    googleMapsApiKey: "AIzaSyAKtn2C4Z2kZOijhAo5Nxrt2MfxGF5NYrI",
  });

  const getCodClienteFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("cod_cliente");
  };

  const buscaMunicipio = async () => {
    const cod_cliente = getCodClienteFromURL();
    const response = await fetch(
      "https://www.legnet.com.br/legnet/api/agilog/api_municipios.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cod_cliente }),
        timeout: 60000,
      }
    );

    const data = await response.json();
    setMunicipios(data);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleInputLeisChange = (e) => {
    setSearchLeis(e.target.value.toLowerCase());
  };

  const handleInputTodasNoticiasChange = (e) => {
    setSearchTodasNoticias(e.target.value.toLowerCase());
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
        obrigacaoCell.textContent = item.resumo || "";

        const localInterdicaoCell = document.createElement("td");
        localInterdicaoCell.textContent = item.local_interdicao || "";

        const tipoVeiculosCell = document.createElement("td");
        tipoVeiculosCell.textContent = item.tipo_veiculo || "";

        const horariosCell = document.createElement("td");
        horariosCell.textContent = item.horarios || "";

        row.appendChild(origemCell);
        row.appendChild(requisitoCell);
        row.appendChild(obrigacaoCell);
        row.appendChild(localInterdicaoCell);
        row.appendChild(tipoVeiculosCell);
        row.appendChild(horariosCell);

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
    } else if (opcao === "noticiaCompletas") {
      const tabelaNoticiaCompleto = document.getElementById(
        "tbodyNoticiasCompleto"
      );
      tabelaNoticiaCompleto.innerHTML = "";

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

        tabelaNoticiaCompleto.appendChild(row);
      });
    }
  };

  const buscaNoticia = async () => {
    const response = await fetch(
      "https://www.legnet.com.br/legnet/api/agilog/recupera_restricoes.php"
    );

    const data = await response.json();

    const newMarkers = data.map((item) => ({
      resumo: item.resumo,
      position: item.position,
      title: item.local_interdicao,
      cor: "red",
    }));
    setMarkers((prevMarker) => [...prevMarker, ...newMarkers]);

    setTeste((prevTeste) => [...prevTeste, ...data]);

    montaExcel(data, "noticia");
  };

  const buscaTodasNoticias = async () => {
    const response = await fetch(
      "https://www.legnet.com.br/legnet/api/agilog/recupera_restricoesTotais.php"
    );

    const data = await response.json();

    setTodasNoticias(data);

    montaExcel(data, "noticiaCompletas");
  };

  const placeMarkerRoute = (local, pontoA, pontoB, origem) => {
    const directionsService = new window.google.maps.DirectionsService();

    const request = {
      origin: `${pontoA}, ${origem}`,
      destination: `${pontoB}, ${origem}`,
      travelMode: window.google.maps.TravelMode.DRIVING,
      waypoints: [
        {
          location: `${local}, ${origem}`,
          stopover: true,
        },
      ],
    };

    directionsService.route(request, (result, status) => {
      if (status === "OK") {
        const legs = result.routes[0].legs;

        const start = {
          position: legs[0].start_location,
          title: pontoA,
        };

        const mid = {
          position: legs[0].end_location,
          title: local,
        };

        const end = {
          position: legs[legs.length - 1].end_location,
          title: pontoB,
        };

        setMarkers((prev) => [...prev, start, mid, end]);
        setDirections((prevDirections) => [...prevDirections, result]);
      } else {
        console.error("Erro: " + status);
      }
    });
  };

  const buscaObrigacao = async () => {
    const cod_cliente = getCodClienteFromURL();
    const response = await fetch(
      "https://www.legnet.com.br/legnet/api/agilog/jsonLocal.php"
    );

    const data = await response.json();

    for (let item of data) {
      const [local, pontos] = item.local_interdicao.split(", entre ");

      if (local && pontos) {
        const [pontoA, pontoB] = pontos.split(" e ");

        placeMarkerRoute(local, pontoA, pontoB, item.origem);
      } else {
        item.position = await getPosition(item.origem, item.local_interdicao);

        const newMarker = {
          resumo: item.resumo,
          position: item.position,
          title: item.local_interdicao,
          cor: "red",
        };

        setMarkers((prevMarker) => [...prevMarker, newMarker]);
      }
    }

    if (data.length > 0) {
      setEmpresa(data[0].empresa);
    }

    setObrigacao(data);
    montaExcel(data, "obrigacao");
    setIsLoadingObr(false);
  };

  const salvaCiente = async (id) => {
    const response = await fetch(
      "https://www.legnet.com.br/legnet/api/agilog/salva_ciente.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
        timeout: 60000,
      }
    );
    if (!response.ok) {
      console.error(
        "Erro ao enviar que o cliente está ciente:",
        response.statusText
      );
    } else {
      setTeste((prevTeste) =>
        prevTeste.map((test) =>
          test.id === id ? { ...test, ciente: "S" } : test
        )
      );
      console.log("Ciente enviado com sucesso!");
    }
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

  const getPosition = async (municipio, local_interdicao) => {
    if (
      [
        "N/A",
        "Não especificado",
        "Nenhuma informação de trânsito no local",
        "",
      ].includes(local_interdicao)
    ) {
      return;
    }

    const address = `${local_interdicao}, ${municipio}`;

    const coordinates = await geocode(address);

    return coordinates;
  };

  const handleMarker = (resumo, position) => {
    setMarkers((prevMarkers) =>
      prevMarkers.map((marker) =>
        marker.resumo1 === resumo
          ? { ...marker, cor: "blue" }
          : { ...marker, cor: "red" }
      )
    );
    setCenter(position);
    setZoom(10);
  };

  const salvaCienteLei = async (id) => {
    const response = await fetch(
      "https://www.legnet.com.br/legnet/api/agilog/salva_cienteLei.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
        timeout: 60000,
      }
    );
    if (!response.ok) {
      console.error(
        "Erro ao enviar que o cliente está ciente:",
        response.statusText
      );
    } else {
      setObrigacao((prevTeste) =>
        prevTeste.map((test) =>
          test.id === id ? { ...test, ciente: "S" } : test
        )
      );
      console.log("Ciente enviado com sucesso!");
    }
  };

  useEffect(() => {
    buscaObrigacao();
    loadNoticias();
    buscaMunicipio();
    buscaTodasNoticias();
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
              <th>Local Interdição</th>
              <th>Tipo de veiculos</th>
              <th>Horarios</th>
            </tr>
          </thead>
          <tbody id="tbodyObrigacoes"></tbody>
        </table>
      </div>
      <div style={{ display: "none" }} id="table_excel3">
        <table id="tbl_3">
          <thead>
            <tr>
              <th>Local Interdição</th>
              <th>Resumo</th>
              <th>Data Inclusão</th>
              <th>Municipio</th>
              <th>Fonte</th>
            </tr>
          </thead>
          <tbody id="tbodyNoticiasCompleto"></tbody>
        </table>
      </div>
      <Container maxW={"container.xxl"} minHeight={"100vh"}>
        <Heading as={"h1"} color={"#207155"} fontWeight={"300"} mt={5}>
          AGILOG
        </Heading>
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
            <Input
              mb={5}
              bg={"white"}
              border={"1px solid lightgray"}
              placeholder="Pesquisar..."
              onChange={handleInputLeisChange}
            />
            {isLoadingObr ? (
              <Spinner />
            ) : (
              <Stack direction="column" maxH={"500px"} overflowY={"auto"}>
                {obrigacao
                  .filter(
                    (test) =>
                      test.requisito.toLowerCase().includes(searchLeis) ||
                      test.local_interdicao.toLowerCase().includes(searchLeis)
                  )
                  .map((test, index) => (
                    <React.Fragment key={index}>
                      <Card
                        as={"button"}
                        colorScheme="green"
                        bgColor={"#2F9B7C"}
                        onClick={() => handleMarker(test.resumo, test.position)}
                        _hover={{
                          cursor: "pointer",
                        }}
                      >
                        <CardBody>
                          <input
                            id={`checkboxCienteLegislacao_${test.id}`}
                            type="checkbox"
                            checked={test.ciente === "S"}
                            onChange={() => salvaCienteLei(test.id)}
                          />
                          <Text color={"white"}>
                            {test.origem} - {test.requisito} - {test.ordem} -{" "}
                            {test.local_interdicao} - {test.tipo_veiculo} -{" "}
                            {test.horarios}
                          </Text>
                        </CardBody>
                      </Card>
                    </React.Fragment>
                  ))}
              </Stack>
            )}
          </GridItem>
          <GridItem>
            {isLoaded && (
              <GoogleMap
                mapContainerStyle={{
                  height: "600px",
                }}
                center={center}
                zoom={zoom}
              >
                {markers.map((marker, index) => (
                  <Marker
                    key={index}
                    position={marker.position}
                    title={marker.title}
                    icon={`http://maps.google.com/mapfiles/ms/icons/${marker.cor}-dot.png`}
                  />
                ))}
                {directions.map((direction, index) => (
                  <DirectionsRenderer key={index} directions={direction} />
                ))}
              </GoogleMap>
            )}
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
            <Input
              mb={5}
              bg={"white"}
              border={"1px solid lightgray"}
              placeholder="Pesquisar..."
              onChange={handleInputChange}
            />
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
                      .filter(
                        (test) =>
                          test.municipio === municipio.label &&
                          (test.resumo.toLowerCase().includes(searchTerm) ||
                            test.local_interdicao
                              .toLowerCase()
                              .includes(searchTerm))
                      )
                      .map((test, index) => (
                        <AccordionPanel
                          key={index}
                          pb={4}
                          bgColor={"white"}
                          display={"flex"}
                          gap={"5px"}
                          onClick={() =>
                            handleMarker(test.resumo, test.position)
                          }
                          _hover={{
                            cursor: "pointer",
                          }}
                        >
                          <input
                            id={`checkboxCiente_${test.id}`}
                            type="checkbox"
                            checked={test.ciente === "S"}
                            onChange={() => salvaCiente(test.id)}
                          />
                          <Tooltip label={test.resumo} fontSize={"md"} hasArrow>
                            <Text>
                              {test.data_inclusao} - {test.local_interdicao}
                            </Text>
                          </Tooltip>
                        </AccordionPanel>
                      ))}
                  </AccordionItem>
                ))
              )}
            </Accordion>
          </GridItem>
        </Grid>
        <Flex
          mt={5}
          justifyContent={"center"}
          flexDirection={"column"}
          alignItems={"center"}
        >
          <Heading as={"h4"} size={"lg"} color={"#207155"} fontWeight={"300"}>
            Histórico de Notícias de Trânsito
          </Heading>
          <Input
            mb={5}
            bg={"white"}
            border={"1px solid lightgray"}
            placeholder="Pesquisar..."
            onChange={handleInputTodasNoticiasChange}
            width={"60%"}
          />
          <Box width={"80%"}>
            <TableContainer
              overflowX="auto"
              overflowY="auto"
              maxHeight="300px"
              bg={"white"}
            >
              <Table variant="striped" colorScheme="gray">
                <Thead>
                  <Tr>
                    <Th>Local da Interdição</Th>
                    <Th>Resumo</Th>
                    <Th>Data da Inclusão</Th>
                    <Th>Município</Th>
                  </Tr>
                </Thead>
                <Tbody id="tbodyNoticiasTransito">
                  {todasNoticias
                    .filter(
                      (item) =>
                        item.resumo
                          .toLowerCase()
                          .includes(searchTodasNoticias) ||
                        item.local_interdicao
                          .toLowerCase()
                          .includes(searchTodasNoticias)
                    )
                    .map((item, index) => (
                      <Tr key={index}>
                        <Td>{item.local_interdicao || "-"}</Td>
                        <Td>{item.resumo || "-"}</Td>
                        <Td>{item.data_inclusao || "-"}</Td>
                        <Td>{item.municipio || "-"}</Td>
                      </Tr>
                    ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        </Flex>
      </Container>
    </>
  );
}

export default App;
