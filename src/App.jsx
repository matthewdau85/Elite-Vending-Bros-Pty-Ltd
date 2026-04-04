import './App.css'
import { useState } from 'react'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"

function LoginGate({ onAuth }) {
  const [pw, setPw] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)
  const attempt = () => {
    const correct = import.meta.env.VITE_HUB_PASSWORD
    if (!correct || pw === correct) { sessionStorage.setItem('hub_auth','1'); onAuth() }
    else { setError(true); setShake(true); setPw(''); setTimeout(() => setShake(false), 500) }
  }
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0f0f1a',padding:'1rem'}}>
      <div style={{width:'100%',maxWidth:'360px',animation:shake?'shake 0.4s ease-in-out':''}}>
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <div style={{fontSize:'2.5rem',marginBottom:'0.5rem'}}>🏪</div>
          <h1 style={{color:'#fff',fontSize:'1.25rem',fontWeight:700,margin:0}}>Elite Vending Bros</h1>
          <p style={{color:'#6b7280',fontSize:'0.75rem',marginTop:'0.25rem'}}>Private · Operations</p>
        </div>
        <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'1rem',padding:'1.5rem'}}>
          <input type="password" value={pw} onChange={e=>{setPw(e.target.value);setError(false)}} onKeyDown={e=>e.key==='Enter'&&attempt()} placeholder="Password" autoFocus
            style={{width:'100%',background:'rgba(0,0,0,0.3)',border:`1px solid ${error?'#b91c1c':'rgba(255,255,255,0.1)'}`,borderRadius:'0.5rem',padding:'0.75rem 1rem',color:'#fff',fontSize:'0.875rem',outline:'none',boxSizing:'border-box',marginBottom:'0.75rem'}} />
          {error && <p style={{color:'#ef4444',fontSize:'0.75rem',margin:'0 0 0.75rem'}}>Incorrect password.</p>}
          <button onClick={attempt} style={{width:'100%',background:'#ea580c',color:'#fff',border:'none',borderRadius:'0.5rem',padding:'0.75rem',fontSize:'0.875rem',fontWeight:600,cursor:'pointer'}}>Enter</button>
        </div>
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}`}</style>
    </div>
  )
}

function App() {
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem('hub_auth'))
  if (!authed) return <LoginGate onAuth={() => setAuthed(true)} />
  return (
    <>
      <Pages />
      <Toaster />
    </>
  )
}

export default App
