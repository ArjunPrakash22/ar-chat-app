import { useEffect } from 'react';
import './App.css';
import { Routes, Route,useLocation } from "react-router-dom";
import { Home,
  Login,
  Register
 } from './Pages';
function App() {
  const location = useLocation();
  useEffect(()=>{
    window.scrollTo(0,0)
  },[location])
  return (
    <div className="App">
      <Routes>
        <Route path='/chat' element={<Home/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path='/' element={<Login/>}/>
      </Routes>
    </div>
  );
}

export default App;
