import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider, Route, Link, Form } from 'react-router-dom'
import Charge from './components/ChargeR600a.jsx'
import Navbar from './components/Navbar.jsx'
import Cooling from './components/CoolingTest.jsx'
import Compressor from './components/Compressor.jsx'
import FormScan from './components/FormScan.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <FormScan />
  },
  {
    path: 'charge-r600a-report',
    element: <Charge />
  },
  {
    path: '/cooling-test-report',
    element: <Cooling />
  },
  {
    path: '/scan-compressor-report',
    element: <Compressor />
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
