import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import LoginPage from './pages/Login'
import SignUpPage from './pages/Signup'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/theme-provider'
import { ToastContainer } from 'react-toastify'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {


  return (
    <>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <AuthProvider>
        <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        />
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/login' element={<LoginPage/>}/>
          <Route path='/signup' element={<SignUpPage/>}/>
          <Route path='/dashboard' element={<ProtectedRoute element={<Dashboard/>}/> }/>

        </Routes>
      </BrowserRouter>
      </AuthProvider>
      </ThemeProvider>
    </>
  )
}

export default App
