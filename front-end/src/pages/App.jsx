import { Accordion, AccordionButton, AccordionIcon, AccordionItem, Box, Button, Card, CardBody, Container, Grid, GridItem, Heading, IconButton, Stack, Text } from "@chakra-ui/react"
import { useState } from "react"
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'
import { FaHome } from "react-icons/fa"
import { FaMapMarked } from "react-icons/fa"
import { FaCog } from "react-icons/fa"
import { FaTimesCircle } from "react-icons/fa"
import { FaUser } from "react-icons/fa"

function App() {
  const [teste, setTeste] = useState([])
  const [noticia, setNoticia] = useState('')

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
      label: 'GPS',
      icon: <FaMapMarked />
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

  const buscaNoticia = async () => {
    const response = await fetch("http://localhost:3000/api/noticias3")

    const { data } = await response.json()

    data.forEach(async item => {
      item.position = await getPosition(item.municipio, item.local_interdicao)
    })

    setTeste(data)
  }

  const getPosition = async (municipio, local_interdicao) => {
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
      <Container maxW={'container.xxl'}>
        <Heading as={'h1'} color={'#207155'} fontWeight={'300'} mt={5}>AGILOG</Heading>
        <Grid mt={5} gap={5} templateRows={'1fr auto'} templateColumns={'200px 1fr 500px'}>
          <GridItem>
            <Stack direction="column">
              {
                menus.map(menu => {
                  <Button size={'lg'} bgColor="#2F9B7C" colorScheme="green" leftIcon={menu.icon}>{menu.label}</Button>
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
              {
                municipios.map(municipio => (
                  <AccordionItem>
                    <h2>
                      <AccordionButton>
                        <Box as='span' flex='1' textAlign='left'>
                          Section 1 title
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                      tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                      veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                      commodo consequat.
                    </AccordionPanel>
                  </AccordionItem>
                ))
              }

            </Accordion>
            <Stack direction="column" maxH={'600px'} overflowY={'auto'}>

              {
                teste.map(test => (
                  <>
                    <Card as={'button'} colorScheme="green" bgColor={'#2F9B7C'} onClick={() => setNoticia(test.resumo)}>
                      <CardBody>
                        <Text color={'white'}>{test.municipio} - {test.local_interdicao}</Text>
                      </CardBody>
                    </Card>
                  </>
                ))
              }
            </Stack>
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
