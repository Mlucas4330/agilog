import { Accordion, Spinner, AccordionPanel, AccordionButton, AccordionIcon, AccordionItem, Box, Button, Card, CardBody, Container, Grid, GridItem, Heading, Stack, Text, Flex } from "@chakra-ui/react"
import { useState, useEffect } from "react"
import { GoogleMap, LoadScript, Marker, Circle } from '@react-google-maps/api'
import { FaHome } from "react-icons/fa"
import { FaCog } from "react-icons/fa"
import { FaTimesCircle } from "react-icons/fa"
import { FaUser } from "react-icons/fa"

function App() {
  const [teste, setTeste] = useState([])
  const [obrigacao, setObrigacao] = useState([])
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingObr, setIsLoadingObr] = useState(true);

  const menus = [
    {
      label: 'Dashboard',
      icon: <FaHome />
    },
    {
      label: 'Usuário',
      icon: <FaUser />
    },
    {
      label: 'Configurações',
      icon: <FaCog />
    },
    {
      label: 'Sair',
      icon: <FaTimesCircle />
    }
  ]

  const municipios = [
    {
      label: 'Rio de Janeiro'
    },
    {
      label: 'São Paulo'
    },
    {
      label: 'Porto Alegre'
    }
  ]

  const circleOptions = {
    strokeColor: "#FF0000",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#FF0000",
    fillOpacity: 0.35,
    radius: 8000,
  }

  const buscaNoticia = async (municipio) => {
    let response;
    let arrayNoticias = [];

    if (municipio === "Rio de Janeiro") {
      response = await fetch("https://www.legnet.com.br:3001/api/noticias3")
    } else if (municipio === "São Paulo") {
      response = await fetch("https://www.legnet.com.br:3001/api/noticias5")
    } else if (municipio === "Porto Alegre") {
      response = await fetch("https://www.legnet.com.br:3001/api/noticias4")
    }

    const { data } = await response.json()

    const dataComMunicipio = data.map(item => ({
      ...item,
      municipio: municipio
    }));

    for (let item of dataComMunicipio) {
      item.position = await getPosition(item.municipio, item.local_interdicao)
    }

    arrayNoticias = [...dataComMunicipio];

    console.log(arrayNoticias)
    await enviaNoticia(arrayNoticias);

    setTeste(prevTeste => [...prevTeste, ...dataComMunicipio])
  }

  const enviaNoticia = async (dados) => {
    const response = await fetch('https://www.legnet.com.br/legnet/api/agilog/agilog_restricoes.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
    });

    if (!response.ok) {
        console.error('Erro ao enviar notícias:', response.statusText);
    } else {
        console.log('Notícias enviadas com sucesso!');
    }
  }

  const buscaObrigacao = async () => {
    const response = await fetch('https://www.legnet.com.br:3001/api/requisitoObrigacao')

    const { data } = await response.json()

    // for (let item of data) {
    //   item.center = await getCenterCircle(item.local_interdicao)
    // }

    setObrigacao(data)

    setIsLoadingObr(false)
  }

  const loadNoticias = async () => {
    for (let municipio of municipios) {
      await buscaNoticia(municipio.label)
    }
    setIsLoading(false)
  }

  const geocode = async (address) => {
    const key = 'AIzaSyBX7WvQpK5cVjZduDZEoSxK4X-v6ARMyaM'

    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${key}`)

    const data = await response.json()

    if (data.status === 'OK') {
      const location = data.results[0].geometry.location

      return {
        lat: location.lat,
        lng: location.lng
      }
    }
  }

  const getCenterCircle = async (local_interdicao) => {
    if (!local_interdicao || local_interdicao == 'N/A' || local_interdicao == 'Não especificado' || local_interdicao == 'não mencionado') return

    const coordenates = await geocode(local_interdicao)

    return coordenates
  }

  const getPosition = async (municipio, local_interdicao) => {
    if (['N/A', 'Não especificado', 'Nenhuma informação de trânsito no local', ''].includes(local_interdicao)) return

    const address = municipio + ', ' + local_interdicao

    const coordenates = await geocode(address)

    return coordenates
  }

  useEffect(() => {
    buscaObrigacao()
    loadNoticias()
  }, [])


  return (
    <>
      <Container maxW={'container.xxl'} display={"flex"} flexDirection={"column"} justifyContent={"space-between"} minHeight={"100vh"}>
        <Heading as={'h1'} color={'#207155'} fontWeight={'300'} mt={5}>AGILOG</Heading>
        <Flex justifyContent={'center'} gap={5}>
          {
            menus.map(menu => (
              <Button w={'200px'} size={'lg'} bgColor="#2F9B7C" colorScheme="green" leftIcon={menu.icon}>{menu.label}</Button>
            ))
          }
        </Flex>
        <Grid mt={5} gap={5} templateColumns={'400px 1fr 400px'}>
          <GridItem>
            <Heading mb={5} as={'h4'} size={'lg'} color={'#207155'} fontWeight={'300'}>Restrições Legais e Normativas</Heading>
            {
              isLoadingObr ?
                <Spinner /> :
                <Stack direction="column" maxH={'500px'} overflowY={'auto'}>
                  {
                    obrigacao.map(test => (
                      <>
                        <Card as={'button'} colorScheme="green" bgColor={'#2F9B7C'}>
                          <CardBody>
                            <Text color={'white'}>{test.origem} - {test.requisito} - {test.resumo}</Text>
                          </CardBody>
                        </Card>
                      </>
                    ))
                  }
                </Stack>
            }
          </GridItem>
          <GridItem>
            <LoadScript googleMapsApiKey="AIzaSyBX7WvQpK5cVjZduDZEoSxK4X-v6ARMyaM">
              <GoogleMap
                mapContainerStyle={{
                  height: '600px'
                }}
                center={{
                  lat: -15.7797200,
                  lng: -47.9297200
                }}
                zoom={4}
              >
                {
                  teste.map(test => (
                    <Marker position={test.position} />
                  ))
                }
                {
                  obrigacao.map(obr => (
                    <Circle center={obr.center} options={circleOptions} />
                  ))
                }
              </GoogleMap>
            </LoadScript>
          </GridItem>
          <GridItem>
            <Heading mb={5} as={'h4'} size={'lg'} color={'#207155'} fontWeight={'300'}>Notícias de Restrições</Heading>
            <Accordion allowToggle>
              {
                isLoading ? (
                  <Spinner />
                ) : (
                  municipios.map((municipio, index) => (
                    <AccordionItem maxH={'500px'} mb={3} overflowY={'auto'} key={index}>
                      <h2>
                        <AccordionButton h={'60px'} borderRadius={'8px'} bgColor={'#2F9B7C'} textColor={'white'}>
                          <Box as='span' flex='1' textAlign='left'>
                            {municipio.label}
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>
                      {
                        teste.filter(test => test.municipio === municipio.label).map((test, index) => (
                          <AccordionPanel key={index} pb={4} title={test.resumo} bgColor={'white'}>
                            <Text>{test.local_interdicao}</Text>
                          </AccordionPanel>
                        ))
                      }
                    </AccordionItem>
                  ))
                )}
            </Accordion>
          </GridItem>
        </Grid>
      </Container>
      <Box
        mt={5}
        p={'50px 30px'}
        textAlign={'right'}
        color={'white'}
        bgColor={'white'}
        background={'url(https://legnet.com.br/img/shape-pe.png) top right'}>
        <strong>© LegNET</strong>
      </Box>
    </>
  )
}

export default App
