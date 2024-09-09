import { Accordion, Spinner, AccordionPanel, AccordionButton, AccordionIcon, AccordionItem, Box, Button, Card, CardBody, Container, Grid, GridItem, Heading, IconButton, Stack, Text } from "@chakra-ui/react"
import { useState, useEffect } from "react"
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'
import { FaHome } from "react-icons/fa"
import { FaMapMarked } from "react-icons/fa"
import { FaCog } from "react-icons/fa"
import { FaTimesCircle } from "react-icons/fa"
import { FaUser } from "react-icons/fa"

function App() {
  const [teste, setTeste] = useState([])
  const [noticia, setNoticia] = useState('')
  const [obrigacao, setObrigacao] = useState([])
  const [isLoading, setIsLoading] = useState(true);

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

  const buscaNoticia = async (municipio) => {
    let response;
    
    if (municipio === "Rio de Janeiro") {
      response = await fetch("http://localhost:3000/api/noticias3")
    } else if (municipio === "São Paulo") {
      response = await fetch("http://localhost:3000/api/noticias5")
    } else if (municipio === "Porto Alegre") {
      response = await fetch("http://localhost:3000/api/noticias4")
    }
  
    const { data } = await response.json()
  
    const dataComMunicipio = data.map(item => ({
        ...item,
        municipio: municipio
    }));

    for (let item of dataComMunicipio) {
      item.position = await getPosition(item.municipio, item.local_interdicao)
    }
    console.log(dataComMunicipio)
    setTeste(prevTeste => [...prevTeste, ...dataComMunicipio])
  }

  const buscaObrigacao = async () => {
    const response = await fetch('http://localhost:3000/api/requisitoObrigacao')

    const { data } = await response.json()
    console.log(data)

    setObrigacao(data)
  }

  useEffect(() => {
    const loadNoticias = async () => {
      for (let municipio of municipios) {
        await buscaNoticia(municipio.label)
      }
      setIsLoading(false)
    }
    buscaObrigacao()
    loadNoticias()
  }, [])

  const getPosition = async (municipio, local_interdicao) => {
    if(!local_interdicao || local_interdicao == 'N/A') return

    const address = municipio + ', ' + local_interdicao
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

  // useEffect(() => {
  //   testeFetch()
  // }, [])
  return (
    <>
      <Container maxW={'container.xxl'} display={"flex"} flexDirection={"column"} justifyContent={"space-between"} minHeight={"100vh"}>
        <Heading as={'h1'} color={'#207155'} fontWeight={'300'} mt={5}>AGILOG</Heading>
        <Grid mt={5} gap={5} templateRows={'1fr auto'} templateColumns={'200px 1fr 500px'}>
          <GridItem>
            <Stack direction="column">
              {
                menus.map(menu => {
                  return (
                    <Button size={'lg'} bgColor="#2F9B7C" colorScheme="green" leftIcon={menu.icon}>{menu.label}</Button>
                  )
                })
              }
            </Stack>
          </GridItem>
          <GridItem>
            {noticia && <Text p={5} bgColor={'white'} borderRadius={'md'} mb={5}>{noticia}</Text>}
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
              </GoogleMap>
            </LoadScript>
          </GridItem>
          <GridItem>
            <Accordion>
              {isLoading ? (
                <Spinner />
              ) : (
                municipios.map(municipio => (
                  <AccordionItem key={municipio.label} isDisabled={isLoading}>
                    <h2>
                      <AccordionButton h={'60px'} borderRadius={'8px'} bgColor={'#2F9B7C'} textColor={'white'}>
                        <Box as='span' flex='1' textAlign='left'>
                          {municipio.label}
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    {
                      teste.filter(test => test.municipio === municipio.label).map((test, index) => {
                        console.log(test.municipio)
                        return (
                          <AccordionPanel key={index} pb={4} title={test.resumo} bgColor={'white'}>
                            <Text>{test.local_interdicao}</Text>
                          </AccordionPanel>
                        )
                      })
                    }
                  </AccordionItem>
                ))
              )}

            </Accordion>
            {<Stack direction="column" maxH={'600px'} overflowY={'auto'}>

              {
                obrigacao.map(test => (
                  <>
                    <Card as={'button'} colorScheme="green" bgColor={'#2F9B7C'}>
                      <CardBody>
                        <Text color={'white'}>{test.resumo}</Text>
                      </CardBody>
                    </Card>
                  </>
                ))
              }
            </Stack>}
          </GridItem>
        </Grid>
        <Box
          mt={5}
          p={'50px 30px'}
          textAlign={'right'}
          color={'white'}
          bgColor={'white'}
          background={'url(https://legnet.com.br/img/shape-pe.png) top right'}>
          <strong>© LegNET</strong>
        </Box>
      </Container>
    </>
  )
}

export default App
