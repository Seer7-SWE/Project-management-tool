import React from 'react'
import { createRoot } from 'react-dom/client'

import { RecoilRoot } from 'recoil'
import App from './App'
import './styles/index.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RecoilRoot>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </RecoilRoot>
  </React.StrictMode>
)
