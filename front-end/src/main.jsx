import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom"
import App from './pages/App.jsx'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import LoginPage from './pages/LoginPage.jsx'
import StatisticsPage from './pages/StatisticsPage.jsx'

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: '#E4F2DC'
      }
    }
  }
})

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/estatisticas",
    element: <StatisticsPage />,
  },
])

createRoot(document.getElementById('root')).render(
  <ChakraProvider theme={theme}>
    <RouterProvider router={router} />
  </ChakraProvider>
)
