import React from 'react'
import './index.css'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import ReactDOM from 'react-dom/client'
import { HashRouter as Router } from 'react-router-dom'
import BaseRouter from './core/BaseRouter'
import Layout from './core/Layout'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <Router>
      <Layout>
        <BaseRouter />
      </Layout>
    </Router>
  </React.StrictMode>,
)
