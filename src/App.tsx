import { useState } from 'react'
import './App.css'
import Home from './pages/Home'
import Header from './pages/Header'
import React from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Header />
    <Home />
    </>
  )
}

export default App
