import { useState, useMemo, useEffect } from "react";
import { supabase } from "./supabase";

const STAGES = ["Prospect","Lead","Emailed","Called","Spoke With","Proposal Sent","Won"];
const STATUS_COLORS = {
  Customer:{bg:"#f0fdf4",text:"#166534",dot:"#16a34a"},
  Lead:{bg:"#f0fdf4",text:"#15803d",dot:"#22c55e"},
  Prospect:{bg:"#fefce8",text:"#854d0e",dot:"#eab308"},
  Churned:{bg:"#fef2f2",text:"#dc2626",dot:"#ef4444"},
};
const STAGE_META = {
  Prospect:       {bg:"#f0fdf4",text:"#166534",bar:"#4ade80"},
  Lead:           {bg:"#dcfce7",text:"#15803d",bar:"#22c55e"},
  Emailed:        {bg:"#ecfdf5",text:"#047857",bar:"#10b981"},
  Called:         {bg:"#d1fae5",text:"#065f46",bar:"#059669"},
  "Spoke With":   {bg:"#fefce8",text:"#854d0e",bar:"#eab308"},
  "Proposal Sent":{bg:"#fff7ed",text:"#c2410c",bar:"#fb923c"},
  Won:            {bg:"#f0fdf4",text:"#166534",bar:"#16a34a"},
};
const ACTIVITY_ICONS={Call:"📞",Email:"✉️",Meeting:"🤝",Task:"✓"};
const C={
  bg:"#f4f9f4",surface:"#ffffff",border:"#d1e7d1",text:"#0f1f0f",
  textSub:"#3d5a3d",muted:"#6b8f6b",accent:"#166534",accentDark:"#14532d",
  accentLight:"#dcfce7",accentText:"#15803d",success:"#16a34a",
  warning:"#d97706",danger:"#dc2626",sidebarBg:"#0f2d1a",
  sidebarBorder:"#1a3d24",sidebarMuted:"#4d7a5a",
};
const FONT="'Inter','Segoe UI',sans-serif";
const PASSWORD="wsi2026";

function Badge({label,status}){
  const s=STATUS_COLORS[status]||{bg:C.accentLight,text:C.accentText,dot:C.accent};
  return <span style={{display:"inline-flex",alignItems:"center",gap:5,background:s.bg,color:s.text,padding:"3px 10px 3px 8px",borderRadius:20,fontSize:12,fontWeight:600}}><span style={{width:6,height:6,borderRadius:"50%",background:s.dot,flexShrink:0}}/>{label}</span>;
}
function TagChip({label}){return <span style={{background:C.accentLight,color:C.accentText,padding:"2px 9px",borderRadius:6,fontSize:11,fontWeight:500}}>{label}</span>;}
function FieldLabel({children}){return <div style={{color:C.muted,fontSize:11,fontWeight:600,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>{children}</div>;}
const inputStyle={width:"100%",background:"#fff",border:`1.5px solid ${C.border}`,borderRadius:10,padding:"10px 13px",color:C.text,fontSize:14,fontFamily:FONT,outline:"none",boxSizing:"border-box"};

function Modal({title,onClose,children}){
  return <div style={{position:"fixed",inset:0,background:"rgba(10,30,15,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,backdropFilter:"blur(2px)"}}>
    <div style={{background:C.surface,borderRadius:20,padding:"32px 36px",width:480,boxShadow:"0 24px 64px rgba(10,30,15,0.2)",maxHeight:"92vh",overflowY:"auto",border:`1px solid ${C.border}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
        <div style={{fontSize:18,fontWeight:700,color:C.text}}>{title}</div>
        <button onClick={onClose} style={{width:32,height:32,borderRadius:8,background:C.bg,border:"none",color:C.muted,cursor:"pointer",fontSize:18}}>×</button>
      </div>
      {children}
    </div>
  </div>;
}
function Btn({onClick,variant="ghost",children,disabled}){
  const styles={
    primary:{background:`linear-gradient(135deg,${C.accent},${C.accentDark})`,color:"#fff",border:"none",boxShadow:`0 2px 8px rgba(22,101,52,0.35)`},
    ghost:{background:"transparent",color:C.textSub,border:`1.5px solid ${C.border}`},
  };
  return <button onClick={onClick} disabled={disabled} style={{flex:1,...styles[variant],borderRadius:10,padding:"11px 16px",fontWeight:600,cursor:disabled?"not-allowed":"pointer",fontFamily:FONT,fontSize:14,opacity:disabled?0.5:1}}>{children}</button>;
}
function Spinner(){
  return <div style={{display:"flex",minHeight:"100vh",alignItems:"center",justifyContent:"center",background:C.bg,fontFamily:FONT}}>
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
      <div style={{width:44,height:44,borderRadius:14,background:`linear-gradient(135deg,${C.accent},#15803d)`,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <svg width="22" height="22" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M12 6v6l4 2"/></svg>
      </div>
      <span style={{color:C.muted,fontSize:14,fontWeight:500}}>Loading Plumas Sales CRM…</span>
    </div>
  </div>;
}

function Login({onSuccess}){
  const [value,setValue]=useState("");
  const [error,setError]=useState(false);
  const submit=()=>{if(value===PASSWORD)onSuccess();else{setError(true);setValue("");}};
  return <div style={{display:"flex",minHeight:"100vh",alignItems:"center",justifyContent:"center",background:C.sidebarBg,fontFamily:FONT}}>
    <div style={{background:C.surface,borderRadius:20,padding:"48px 44px",width:380,boxShadow:"0 24px 64px rgba(0,0,0,0.35)",border:`1px solid ${C.border}`}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:36}}>
        <div style={{width:42,height:42,borderRadius:12,background:`linear-gradient(135deg,${C.accent},#15803d)`,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
        <div>
          <div style={{fontSize:20,fontWeight:800,color:C.text}}>Plumas Sales CRM</div>
          <div style={{fontSize:11,color:C.muted,letterSpacing:1,textTransform:"uppercase"}}>Team Access</div>
        </div>
      </div>
      <FieldLabel>Password</FieldLabel>
      <input type="password" value={value} onChange={e=>{setValue(e.target.value);setError(false);}} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="Enter password…" autoFocus style={{...inputStyle,marginBottom:8,border:`1.5px solid ${error?C.danger:C.border}`}}/>
      {error&&<div style={{color:C.danger,fontSize:12,marginBottom:8,fontWeight:500}}>Incorrect password. Try again.</div>}
      <div style={{marginBottom:16}}/>
      <button onClick={submit} style={{width:"100%",padding:13,background:`linear-gradient(135deg,${C.accent},${C.accentDark})`,color:"#fff",border:"none",borderRadius:10,fontWeight:700,cursor:"pointer",fontFamily:FONT,fontSize:15}}>Sign In →</button>
    </div>
  </div>;
}

function Sidebar({active,setActive,onLogout}){
  const items=[
    {key:"dashboard",label:"Dashboard",icon:<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>},
    {key:"contacts",label:"Contacts",icon:<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0-3-3.87"/></svg>},
    {key:"deals",label:"Pipeline",icon:<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>},
    {key:"activities",label:"Activities",icon:<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>},
  ];
  return <nav style={{width:232,minHeight:"100vh",background:C.sidebarBg,display:"flex",flexDirection:"column",flexShrink:0}}>
    <div style={{padding:"28px 24px 24px",borderBottom:`1px solid ${C.sidebarBorder}`}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:34,height:34,borderRadius:10,background:`linear-gradient(135deg,${C.accent},#15803d)`,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
        <div>
          <div style={{fontSize:15,fontWeight:800,color:"#f0fdf4",fontFamily:FONT}}>Plumas Sales</div>
          <div style={{fontSize:10,color:C.sidebarMuted,letterSpacing:1.5,textTransform:"uppercase",fontWeight:500}}>CRM Suite</div>
        </div>
      </div>
    </div>
    <div style={{padding:"16px 12px",flex:1}}>
      {items.map(item=>{
        const isActive=active===item.key;
        return <button key={item.key} onClick={()=>setActive(item.key)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 12px",marginBottom:2,background:isActive?`linear-gradient(135deg,rgba(22,101,52,0.35),rgba(21,128,61,0.2))`:"transparent",border:"none",borderRadius:10,color:isActive?"#bbf7d0":C.sidebarMuted,cursor:"pointer",fontSize:14,fontWeight:isActive?600:400,fontFamily:FONT,textAlign:"left",boxShadow:isActive?`inset 0 0 0 1px rgba(22,101,52,0.4)`:"none"}}>
          <span style={{opacity:isActive?1:0.6}}>{item.icon}</span>
          {item.label}
          {isActive&&<span style={{marginLeft:"auto",width:6,height:6,borderRadius:"50%",background:C.success}}/>}
        </button>;
      })}
    </div>
    <div style={{padding:"16px 20px",borderTop:`1px solid ${C.sidebarBorder}`}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:34,height:34,borderRadius:10,background:`linear-gradient(135deg,${C.accent},#15803d)`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:"#fff",fontSize:13}}>P</div>
        <div style={{flex:1}}>
          <div style={{color:"#f0fdf4",fontSize:13,fontWeight:600}}>Plumas Team</div>
          <div style={{color:C.sidebarMuted,fontSize:11}}>Administrator</div>
        </div>
        <button onClick={onLogout} title="Sign out" style={{background:"transparent",border:"none",color:C.sidebarMuted,cursor:"pointer",padding:4}}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </div>
  </nav>;
}

function Dashboard({contacts,deals,activities}){
  const openDeals=deals.filter(d=>d.stage!=="Won");
  const totalPipeline=openDeals.reduce((s,d)=>s+Number(d.value),0);
  const wonValue=deals.filter(d=>d.stage==="Won").reduce((s,d)=>s+Number(d.value),0);
  const customers=contacts.filter(c=>c.status==="Customer").length;
  const pending=activities.filter(a=>!a.done).length;
  const stats=[
    {label:"Open Pipeline",value:`$${(totalPipeline/1000).toFixed(0)}k`,sub:`${openDeals.length} active deals`,color:C.accent,icon:"◈"},
    {label:"Won",value:`$${(wonValue/1000).toFixed(0)}k`,sub:"this quarter",color:C.success,icon:"✓"},
    {label:"Contacts",value:contacts.length,sub:"total in CRM",color:"#15803d",icon:"⬡"},
    {label:"Open Tasks",value:pending,sub:"need attention",color:pending>3?C.danger:C.warning,icon:"◎"},
  ];
  return <div>
    <div style={{marginBottom:32}}>
      <h1 style={{fontSize:26,fontWeight:800,color:C.text,margin:0}}>Welcome back 👋</h1>
      <p style={{color:C.muted,margin:"6px 0 0",fontSize:14}}>Plumas Sales CRM Dashboard</p>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:28}}>
      {stats.map(s=><div key={s.label} style={{background:C.surface,borderRadius:16,padding:"22px 24px",border:`1px solid ${C.border}`,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:16,right:16,width:36,height:36,borderRadius:10,background:s.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:s.color}}>{s.icon}</div>
        <div style={{color:C.muted,fontSize:12,fontWeight:600,letterSpacing:0.5,textTransform:"uppercase"}}>{s.label}</div>
        <div style={{color:s.color,fontSize:30,fontWeight:800,margin:"10px 0 4px"}}>{s.value}</div>
        <div style={{color:C.muted,fontSize:12}}>{s.sub}</div>
      </div>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:20}}>
      <div style={{background:C.surface,borderRadius:16,padding:28,border:`1px solid ${C.border}`}}>
        <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:24}}>Pipeline Overview</div>
        {STAGES.map(stage=>{
          const val=deals.filter(d=>d.stage===stage).reduce((s,d)=>s+Number(d.value),0);
          const m=STAGE_META[stage];
          return <div key={stage} style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{width:8,height:8,borderRadius:2,background:m.bar,display:"inline-block"}}/>
                <span style={{color:C.textSub,fontSize:13,fontWeight:500}}>{stage}</span>
              </div>
              <span style={{color:C.text,fontSize:13,fontWeight:600}}>${val.toLocaleString()}</span>
            </div>
            <div style={{height:7,background:C.bg,borderRadius:99,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${Math.min(100,(val/70000)*100)}%`,background:m.bar,borderRadius:99}}/>
            </div>
          </div>;
        })}
      </div>
      <div style={{background:C.surface,borderRadius:16,padding:28,border:`1px solid ${C.border}`}}>
        <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:20}}>Upcoming Activities</div>
        {activities.filter(a=>!a.done).length===0&&<div style={{color:C.muted,fontSize:13,textAlign:"center",paddingTop:20}}>All clear!</div>}
        {activities.filter(a=>!a.done).slice(0,5).map(a=>{
          const contact=contacts.find(c=>c.id===a.contact_id);
          return <div key={a.id} style={{display:"flex",gap:12,paddingBottom:14,marginBottom:14,borderBottom:`1px solid ${C.border}`}}>
            <div style={{width:34,height:34,borderRadius:10,background:C.accentLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{ACTIVITY_ICONS[a.type]}</div>
            <div>
              <div style={{color:C.text,fontSize:13,fontWeight:500}}>{a.note}</div>
              <div style={{color:C.muted,fontSize:11,marginTop:3}}>{contact?.name} · {a.date}</div>
            </div>
          </div>;
        })}
      </div>
    </div>
  </div>;
}

function ContactForm({initial,onSave,onClose,title}){
  const [form,setForm]=useState(initial);
  const [errors,setErrors]=useState({});
  const F=key=>({value:form[key]??"",onChange:e=>{setForm(f=>({...f,[key]:e.target.value}));setErrors(e=>({...e,[key]:false}));}});
  const required=["name","company","email","phone","status"];
  const validate=()=>{
    const e={};
    required.forEach(k=>{if(!form[k]?.toString().trim())e[k]=true;});
    setErrors(e);
    return Object.keys(e).length===0;
  };
  return <Modal title={title} onClose={onClose}>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      {[["Name","name"],["Company","company"],["Email","email"],["Phone","phone"],["Value ($)","value"]].map(([label,key])=>(
        <div key={key} style={{gridColumn:key==="name"||key==="email"?"1 / -1":undefined}}>
          <FieldLabel>{label}{required.includes(key)&&<span style={{color:C.danger}}> *</span>}</FieldLabel>
          <input {...F(key)} style={{...inputStyle,border:`1.5px solid ${errors[key]?C.danger:C.border}`}}/>
          {errors[key]&&<div style={{color:C.danger,fontSize:11,marginTop:3}}>Required</div>}
        </div>
      ))}
      <div>
        <FieldLabel>Status <span style={{color:C.danger}}>*</span></FieldLabel>
        <select {...F("status")} style={{...inputStyle,border:`1.5px solid ${errors.status?C.danger:C.border}`}}>
          {["Lead","Prospect","Customer","Churned"].map(s=><option key={s}>{s}</option>)}
        </select>
      </div>
      <div><FieldLabel>Tags (comma separated)</FieldLabel><input {...F("tags")} placeholder="e.g. Enterprise, Tech" style={inputStyle}/></div>
    </div>
    <div style={{display:"flex",gap:10,marginTop:24}}>
      <Btn variant="primary" onClick={()=>validate()&&onSave(form)}>{title.startsWith("Edit")?"Save Changes":"Add Contact"}</Btn>
      <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
    </div>
  </Modal>;
}

function Contacts({contacts,onAdd,onEdit,onDelete}){
  const [search,setSearch]=useState("");
  const [filter,setFilter]=useState("All");
  const [selected,setSelected]=useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [editContact,setEditContact]=useState(null);
  const blank={name:"",company:"",email:"",phone:"",status:"Lead",value:"",tags:""};
  const filtered=useMemo(()=>contacts.filter(c=>(filter==="All"||c.status===filter)&&(c.name.toLowerCase().includes(search.toLowerCase())||c.company?.toLowerCase().includes(search.toLowerCase()))),[contacts,search,filter]);
  const avatarColor=name=>["#166534","#15803d","#065f46","#047857","#0d9488","#0e7490"][name.charCodeAt(0)%6];
  const openEdit=(c,e)=>{e?.stopPropagation();setEditContact({...c,tags:Array.isArray(c.tags)?c.tags.join(", "):(c.tags||""),value:String(c.value)});};
  return <div style={{display:"flex",gap:20,height:"calc(100vh - 80px)"}}>
    <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column",minWidth:0}}>
      <div style={{display:"flex",gap:10,marginBottom:18,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,minWidth:160}}>
          <svg style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:C.muted}} width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search contacts…" style={{...inputStyle,paddingLeft:36}}/>
        </div>
        <div style={{display:"flex",gap:4,background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:4}}>
          {["All","Lead","Prospect","Customer","Churned"].map(s=><button key={s} onClick={()=>setFilter(s)} style={{padding:"6px 12px",borderRadius:7,border:"none",cursor:"pointer",fontSize:12,fontWeight:500,fontFamily:FONT,background:filter===s?C.accent:"transparent",color:filter===s?"#fff":C.muted}}>{s}</button>)}
        </div>
        <button onClick={()=>setShowAdd(true)} style={{padding:"10px 18px",background:`linear-gradient(135deg,${C.accent},${C.accentDark})`,color:"#fff",border:"none",borderRadius:10,fontWeight:600,cursor:"pointer",fontFamily:FONT,fontSize:13}}>+ New Contact</button>
      </div>
      <div style={{flex:1,overflowY:"auto",background:C.surface,borderRadius:16,border:`1px solid ${C.border}`}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{background:C.bg}}>
              {["Contact","Status","Value","Last Contact",""].map(h=><th key={h} style={{padding:"13px 18px",textAlign:"left",color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",borderBottom:`1px solid ${C.border}`}}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c=><tr key={c.id} onClick={()=>setSelected(selected?.id===c.id?null:c)} style={{cursor:"pointer",borderBottom:`1px solid ${C.border}`,background:selected?.id===c.id?C.accentLight:"transparent"}}>
              <td style={{padding:"14px 18px"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:36,height:36,borderRadius:10,background:avatarColor(c.name),display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:14}}>{c.name.charAt(0)}</div>
                  <div>
                    <div style={{color:C.text,fontSize:14,fontWeight:600}}>{c.name}</div>
                    <div style={{color:C.muted,fontSize:12}}>{c.company}</div>
                  </div>
                </div>
              </td>
              <td style={{padding:"14px 18px"}}><Badge label={c.status} status={c.status}/></td>
              <td style={{padding:"14px 18px",color:C.text,fontSize:14,fontWeight:600}}>${Number(c.value).toLocaleString()}</td>
              <td style={{padding:"14px 18px",color:C.muted,fontSize:13}}>{c.last_contact}</td>
              <td style={{padding:"14px 18px"}}>
                <div style={{display:"flex",gap:6,justifyContent:"flex-end"}}>
                  <button onClick={e=>openEdit(c,e)} style={{width:30,height:30,borderRadius:8,background:C.bg,border:`1px solid ${C.border}`,color:C.textSub,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>✎</button>
                  <button onClick={e=>{e.stopPropagation();onDelete("contacts",c.id);if(selected?.id===c.id)setSelected(null);}} style={{width:30,height:30,borderRadius:8,background:"#fef2f2",border:"1px solid #fecaca",color:C.danger,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                </div>
              </td>
            </tr>)}
          </tbody>
        </table>
        {filtered.length===0&&<div style={{textAlign:"center",padding:48,color:C.muted}}>No contacts found.</div>}
      </div>
    </div>
    {selected&&<div style={{width:280,background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:28,overflowY:"auto",flexShrink:0}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
        <div style={{width:48,height:48,borderRadius:14,background:`linear-gradient(135deg,${C.accent},#15803d)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:20}}>{selected.name.charAt(0)}</div>
        <button onClick={()=>setSelected(null)} style={{width:30,height:30,borderRadius:8,background:C.bg,border:"none",color:C.muted,cursor:"pointer",fontSize:18}}>×</button>
      </div>
      <div style={{fontSize:17,fontWeight:700,color:C.text,marginBottom:2}}>{selected.name}</div>
      <div style={{color:C.muted,fontSize:13,marginBottom:14}}>{selected.company}</div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
        <Badge label={selected.status} status={selected.status}/>
        <button onClick={e=>openEdit(selected,e)} style={{padding:"5px 14px",background:C.accentLight,border:`1px solid #86efac`,color:C.accentText,borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer"}}>Edit</button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        {[["Email",selected.email],["Phone",selected.phone],["Value",`$${Number(selected.value).toLocaleString()}`],["Last Contact",selected.last_contact]].map(([k,v])=><div key={k}><FieldLabel>{k}</FieldLabel><div style={{color:C.text,fontSize:13,fontWeight:500}}>{v}</div></div>)}
        {selected.tags?.length>0&&<div><FieldLabel>Tags</FieldLabel><div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:4}}>{(Array.isArray(selected.tags)?selected.tags:[selected.tags]).map(t=><TagChip key={t} label={t}/>)}</div></div>}
      </div>
    </div>}
    {showAdd&&<ContactForm title="New Contact" initial={blank} onSave={f=>{onAdd("contacts",f);setShowAdd(false);}} onClose={()=>setShowAdd(false)}/>}
    {editContact&&<ContactForm title="Edit Contact" initial={editContact} onSave={f=>{onEdit("contacts",f);setEditContact(null);}} onClose={()=>setEditContact(null)}/>}
  </div>;
}

function DealForm({initial,onSave,onClose,title,contacts}){
  const [form,setForm]=useState(initial);
  const [errors,setErrors]=useState({});
  const F=key=>({value:form[key]??"",onChange:e=>{setForm(f=>({...f,[key]:e.target.value}));setErrors(e=>({...e,[key]:false}));}});
  const required=["title","value","group_size","close_date","contact_id","stage"];
  const validate=()=>{
    const e={};
    required.forEach(k=>{if(!form[k]?.toString().trim())e[k]=true;});
    setErrors(e);
    return Object.keys(e).length===0;
  };
  return <Modal title={title} onClose={onClose}>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <div style={{gridColumn:"1 / -1"}}>
        <FieldLabel>Deal Title <span style={{color:C.danger}}>*</span></FieldLabel>
        <input {...F("title")} style={{...inputStyle,border:`1.5px solid ${errors.title?C.danger:C.border}`}}/>
        {errors.title&&<div style={{color:C.danger,fontSize:11,marginTop:3}}>Required</div>}
      </div>
      <div>
        <FieldLabel>Value ($) <span style={{color:C.danger}}>*</span></FieldLabel>
        <input {...F("value")} type="number" style={{...inputStyle,border:`1.5px solid ${errors.value?C.danger:C.border}`}}/>
        {errors.value&&<div style={{color:C.danger,fontSize:11,marginTop:3}}>Required</div>}
      </div>
      <div>
        <FieldLabel>Group Size <span style={{color:C.danger}}>*</span></FieldLabel>
        <input {...F("group_size")} type="number" min="1" placeholder="# of people" style={{...inputStyle,border:`1.5px solid ${errors.group_size?C.danger:C.border}`}}/>
        {errors.group_size&&<div style={{color:C.danger,fontSize:11,marginTop:3}}>Required</div>}
      </div>
      <div>
        <FieldLabel>Close Date <span style={{color:C.danger}}>*</span></FieldLabel>
        <input {...F("close_date")} type="date" style={{...inputStyle,border:`1.5px solid ${errors.close_date?C.danger:C.border}`}}/>
        {errors.close_date&&<div style={{color:C.danger,fontSize:11,marginTop:3}}>Required</div>}
      </div>
      <div>
        <FieldLabel>Contact <span style={{color:C.danger}}>*</span></FieldLabel>
        <select {...F("contact_id")} style={{...inputStyle,border:`1.5px solid ${errors.contact_id?C.danger:C.border}`}}>
          <option value="">Select contact…</option>
          {contacts.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {errors.contact_id&&<div style={{color:C.danger,fontSize:11,marginTop:3}}>Required</div>}
      </div>
      <div>
        <FieldLabel>Stage <span style={{color:C.danger}}>*</span></FieldLabel>
        <select {...F("stage")} style={{...inputStyle,border:`1.5px solid ${errors.stage?C.danger:C.border}`}}>
          {STAGES.map(s=><option key={s}>{s}</option>)}
        </select>
      </div>
      <div style={{gridColumn:"1 / -1"}}>
        <FieldLabel>Notes</FieldLabel>
        <textarea value={form.notes||""} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} rows={3} placeholder="Add any notes about this deal…" style={{...inputStyle,resize:"vertical"}}/>
      </div>
    </div>
    <div style={{display:"flex",gap:10,marginTop:24}}>
      <Btn variant="primary" onClick={()=>validate()&&onSave(form)}>{title.startsWith("Edit")?"Save Changes":"Add Deal"}</Btn>
      <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
    </div>
  </Modal>;
}

function Pipeline({deals,contacts,onAdd,onEdit,onDelete}){
  const [showForm,setShowForm]=useState(false);
  const [editDeal,setEditDeal]=useState(null);
  const blankDeal={title:"",contact_id:"",stage:"Prospect",value:"",group_size:"",close_date:"",notes:"",call_count:0,last_call_date:""};

  const moveStage=(deal,dir)=>{
    const idx=STAGES.indexOf(deal.stage),next=STAGES[idx+dir];
    if(next)onEdit("deals",{...deal,stage:next});
  };

  return <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 80px)"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexShrink:0}}>
      <div>
        <h2 style={{fontSize:22,fontWeight:800,color:C.text,margin:0}}>Sales Pipeline</h2>
        <p style={{color:C.muted,margin:"4px 0 0",fontSize:13}}>${deals.filter(d=>d.stage!=="Won").reduce((s,d)=>s+Number(d.value),0).toLocaleString()} open value</p>
      </div>
      <button onClick={()=>setShowForm(true)} style={{padding:"10px 20px",background:`linear-gradient(135deg,${C.accent},${C.accentDark})`,color:"#fff",border:"none",borderRadius:10,fontWeight:600,cursor:"pointer",fontFamily:FONT}}>+ New Deal</button>
    </div>
    <div style={{display:"flex",gap:14,overflowX:"auto",flex:1,paddingBottom:16,alignItems:"flex-start"}}>
      {STAGES.map(stage=>{
        const stageDeals=deals.filter(d=>d.stage===stage);
        const m=STAGE_META[stage];
        const isCalled=stage==="Called";
        return <div key={stage} style={{minWidth:230,flex:"0 0 230px"}}>
          <div style={{padding:"10px 14px",background:m.bg,borderRadius:"12px 12px 0 0",border:`1px solid ${C.border}`,borderBottom:"none",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontWeight:700,fontSize:12,color:m.text,textTransform:"uppercase",letterSpacing:0.8}}>{stage}</span>
            <span style={{fontSize:11,color:m.text,background:m.text+"18",padding:"2px 7px",borderRadius:6,fontWeight:600}}>{stageDeals.length}</span>
          </div>
          <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:"0 0 12px 12px",minHeight:120,padding:"10px 8px",display:"flex",flexDirection:"column",gap:8}}>
            {stageDeals.length===0&&<div style={{textAlign:"center",padding:"20px 0",color:C.muted,fontSize:12}}>No deals</div>}
            {stageDeals.map(deal=>{
              const contact=contacts.find(c=>c.id===deal.contact_id);
              const si=STAGES.indexOf(deal.stage);
              return <div key={deal.id} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 14px 12px"}}>
                <div style={{display:"flex",justifyContent:"space-between",gap:6,marginBottom:4}}>
                  <div style={{color:C.text,fontSize:13,fontWeight:700,lineHeight:1.3}}>{deal.title}</div>
                  <div style={{display:"flex",gap:3,flexShrink:0}}>
                    <button onClick={()=>setEditDeal({...deal,contact_id:String(deal.contact_id),value:String(deal.value),group_size:String(deal.group_size||"")})} style={{width:20,height:20,borderRadius:5,background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:12}}>✎</button>
                    <button onClick={()=>onDelete("deals",deal.id)} style={{width:20,height:20,borderRadius:5,background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:14}}>×</button>
                  </div>
                </div>
                {contact&&<div style={{color:C.muted,fontSize:11,marginBottom:8}}>{contact.name} · {contact.company}</div>}
                <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>
                  <span style={{fontSize:15,fontWeight:800,color:C.text}}>${Number(deal.value).toLocaleString()}</span>
                  {deal.group_size&&<span style={{fontSize:11,background:C.accentLight,color:C.accentText,padding:"2px 7px",borderRadius:6,fontWeight:600,alignSelf:"center"}}>👥 {deal.group_size}</span>}
                </div>
                {deal.notes&&<div style={{fontSize:11,color:C.textSub,background:C.bg,borderRadius:7,padding:"6px 8px",marginBottom:8,lineHeight:1.4}}>{deal.notes}</div>}
                {isCalled&&<div style={{borderTop:`1px solid ${C.border}`,paddingTop:8,marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <span style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:0.5}}>Call Count</span>
                    <select value={deal.call_count||0} onChange={e=>onEdit("deals",{...deal,call_count:Number(e.target.value)})} style={{...inputStyle,width:"auto",padding:"3px 8px",fontSize:12,borderRadius:7}}>
                      {[0,1,2,3,4,5,6,7].map(n=><option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>Last Call Date</div>
                    <input type="date" value={deal.last_call_date||""} onChange={e=>onEdit("deals",{...deal,last_call_date:e.target.value})} style={{...inputStyle,padding:"5px 8px",fontSize:12,borderRadius:7}}/>
                  </div>
                </div>}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:4}}>
                  <span style={{color:C.muted,fontSize:10}}>{deal.close_date}</span>
                  <div style={{display:"flex",gap:4}}>
                    {si>0&&<button onClick={()=>moveStage(deal,-1)} style={{width:26,height:26,borderRadius:6,background:C.bg,border:`1px solid ${C.border}`,color:C.textSub,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}>←</button>}
                    {si<STAGES.length-1&&<button onClick={()=>moveStage(deal,1)} style={{width:26,height:26,borderRadius:6,background:`linear-gradient(135deg,${C.accent},${C.accentDark})`,border:"none",color:"#fff",cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}>→</button>}
                  </div>
                </div>
              </div>;
            })}
          </div>
        </div>;
      })}
    </div>
    {showForm&&<DealForm title="New Deal" initial={blankDeal} onSave={f=>{onAdd("deals",f);setShowForm(false);}} onClose={()=>setShowForm(false)} contacts={contacts}/>}
    {editDeal&&<DealForm title="Edit Deal" initial={editDeal} onSave={f=>{onEdit("deals",f);setEditDeal(null);}} onClose={()=>setEditDeal(null)} contacts={contacts}/>}
  </div>;
}

function ActivityForm({initial,onSave,onClose,title,contacts}){
  const [f,setF]=useState(initial);
  const [errors,setErrors]=useState({});
  const required=["type","contact_id","note","date"];
  const validate=()=>{
    const e={};
    required.forEach(k=>{if(!f[k]?.toString().trim())e[k]=true;});
    setErrors(e);
    return Object.keys(e).length===0;
  };
  return <Modal title={title} onClose={onClose}>
    <div style={{marginBottom:14}}>
      <FieldLabel>Type <span style={{color:C.danger}}>*</span></FieldLabel>
      <select value={f.type} onChange={e=>{setF(x=>({...x,type:e.target.value}));setErrors(e=>({...e,type:false}));}} style={{...inputStyle,border:`1.5px solid ${errors.type?C.danger:C.border}`}}>
        {["Call","Email","Meeting","Task"].map(t=><option key={t}>{t}</option>)}
      </select>
    </div>
    <div style={{marginBottom:14}}>
      <FieldLabel>Contact <span style={{color:C.danger}}>*</span></FieldLabel>
      <select value={f.contact_id} onChange={e=>{setF(x=>({...x,contact_id:e.target.value}));setErrors(e=>({...e,contact_id:false}));}} style={{...inputStyle,border:`1.5px solid ${errors.contact_id?C.danger:C.border}`}}>
        <option value="">Select contact…</option>
        {contacts.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      {errors.contact_id&&<div style={{color:C.danger,fontSize:11,marginTop:3}}>Required</div>}
    </div>
    <div style={{marginBottom:14}}>
      <FieldLabel>Note <span style={{color:C.danger}}>*</span></FieldLabel>
      <textarea value={f.note} onChange={e=>{setF(x=>({...x,note:e.target.value}));setErrors(e=>({...e,note:false}));}} rows={3} style={{...inputStyle,resize:"vertical",border:`1.5px solid ${errors.note?C.danger:C.border}`}}/>
      {errors.note&&<div style={{color:C.danger,fontSize:11,marginTop:3}}>Required</div>}
    </div>
    <div style={{marginBottom:24}}>
      <FieldLabel>Date <span style={{color:C.danger}}>*</span></FieldLabel>
      <input type="date" value={f.date} onChange={e=>{setF(x=>({...x,date:e.target.value}));setErrors(e=>({...e,date:false}));}} style={{...inputStyle,border:`1.5px solid ${errors.date?C.danger:C.border}`}}/>
      {errors.date&&<div style={{color:C.danger,fontSize:11,marginTop:3}}>Required</div>}
    </div>
    <div style={{display:"flex",gap:10}}>
      <Btn variant="primary" onClick={()=>validate()&&onSave(f)}>{title.startsWith("Edit")?"Save Changes":"Log Activity"}</Btn>
      <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
    </div>
  </Modal>;
}

function Activities({activities,contacts,onAdd,onEdit,onDelete}){
  const [showForm,setShowForm]=useState(false);
  const [editActivity,setEditActivity]=useState(null);
  const sorted=[...activities].sort((a,b)=>a.done-b.done||new Date(a.date)-new Date(b.date));
  const typeColors={Call:"#dcfce7",Email:"#d1fae5",Meeting:"#bbf7d0",Task:"#fef9c3"};
  const typeText={Call:"#166534",Email:"#15803d",Meeting:"#065f46",Task:"#854d0e"};
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
      <div>
        <h2 style={{fontSize:22,fontWeight:800,color:C.text,margin:0}}>Activities</h2>
        <p style={{color:C.muted,margin:"4px 0 0",fontSize:13}}>{activities.filter(a=>!a.done).length} pending · {activities.filter(a=>a.done).length} completed</p>
      </div>
      <button onClick={()=>setShowForm(true)} style={{padding:"10px 20px",background:`linear-gradient(135deg,${C.accent},${C.accentDark})`,color:"#fff",border:"none",borderRadius:10,fontWeight:600,cursor:"pointer",fontFamily:FONT}}>+ Log Activity</button>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {sorted.map(a=>{
        const contact=contacts.find(c=>c.id===a.contact_id);
        return <div key={a.id} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px 20px",display:"flex",alignItems:"center",gap:16,opacity:a.done?0.5:1}}>
          <div onClick={()=>onEdit("activities",{...a,done:!a.done})} style={{width:24,height:24,borderRadius:8,border:`2px solid ${a.done?C.success:C.border}`,background:a.done?C.success:"#fff",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            {a.done&&<svg width="12" height="12" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>}
          </div>
          <span style={{padding:"4px 10px",borderRadius:8,background:typeColors[a.type]||C.accentLight,color:typeText[a.type]||C.accentText,fontSize:12,fontWeight:700,flexShrink:0}}>{a.type}</span>
          <div style={{flex:1}}>
            <div style={{color:C.text,fontSize:14,fontWeight:500,textDecoration:a.done?"line-through":"none"}}>{a.note}</div>
            <div style={{color:C.muted,fontSize:12,marginTop:2}}>{contact?.name} · {a.date}</div>
          </div>
          <button onClick={()=>setEditActivity({...a,contact_id:String(a.contact_id)})} style={{width:28,height:28,borderRadius:7,background:C.bg,border:`1px solid ${C.border}`,color:C.textSub,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>✎</button>
          <button onClick={()=>onDelete("activities",a.id)} style={{width:28,height:28,borderRadius:7,background:"#fef2f2",border:"1px solid #fecaca",color:C.danger,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>;
      })}
    </div>
    {showForm&&<ActivityForm title="Log Activity" initial={{type:"Call",contact_id:"",note:"",date:""}} onSave={f=>{onAdd("activities",f);setShowForm(false);}} onClose={()=>setShowForm(false)} contacts={contacts}/>}
    {editActivity&&<ActivityForm title="Edit Activity" initial={editActivity} onSave={f=>{onEdit("activities",f);setEditActivity(null);}} onClose={()=>setEditActivity(null)} contacts={contacts}/>}
  </div>;
}

export default function CRM(){
  const [authed,setAuthed]=useState(()=>sessionStorage.getItem("wsi-authed")==="true");
  const [active,setActive]=useState("dashboard");
  const [contacts,setContacts]=useState([]);
  const [deals,setDeals]=useState([]);
  const [activities,setActivities]=useState([]);
  const [loading,setLoading]=useState(true);

  const handleLogin=()=>{sessionStorage.setItem("wsi-authed","true");setAuthed(true);};
  const handleLogout=()=>{sessionStorage.removeItem("wsi-authed");setAuthed(false);};

  useEffect(()=>{
    if(!authed)return;
    (async()=>{
      setLoading(true);
      const [c,d,a]=await Promise.all([
        supabase.from("contacts").select("*").order("id"),
        supabase.from("deals").select("*").order("id"),
        supabase.from("activities").select("*").order("id"),
      ]);
      setContacts(c.data||[]);
      setDeals(d.data||[]);
      setActivities(a.data||[]);
      setLoading(false);
    })();
  },[authed]);

  const handleAdd=async(table,form)=>{
    let data={...form};
    delete data.id;
    if(table==="contacts"){
      data.tags=typeof form.tags==="string"?form.tags.split(",").map(t=>t.trim()).filter(Boolean):form.tags;
      data.value=Number(form.value)||0;
      data.last_contact=new Date().toISOString().split("T")[0];
    }
    if(table==="deals"){
      data.value=Number(form.value)||0;
      data.group_size=Number(form.group_size)||null;
      data.contact_id=Number(form.contact_id)||null;
      data.call_count=Number(form.call_count)||0;
      data.notes=form.notes||"";
      data.last_call_date=form.last_call_date||null;
    }
    if(table==="activities"){
      data.contact_id=Number(form.contact_id)||null;
      data.done=false;
    }
    const{data:row}=await supabase.from(table).insert(data).select().single();
    if(row){
      if(table==="contacts")setContacts(p=>[...p,row]);
      if(table==="deals")setDeals(p=>[...p,row]);
      if(table==="activities")setActivities(p=>[...p,row]);
    }
  };

  const handleEdit=async(table,form)=>{
    const id=form.id;
    let data={...form};
    delete data.id;
    if(table==="contacts"){
      data.tags=typeof form.tags==="string"?form.tags.split(",").map(t=>t.trim()).filter(Boolean):form.tags;
      data.value=Number(form.value)||0;
    }
    if(table==="deals"){
      data.value=Number(form.value)||0;
      data.group_size=Number(form.group_size)||null;
      data.contact_id=Number(form.contact_id)||null;
      data.call_count=Number(form.call_count)||0;
      data.notes=form.notes||"";
      data.last_call_date=form.last_call_date||null;
    }
    if(table==="activities"){
      data.contact_id=Number(form.contact_id)||null;
    }
    const{data:row,error}=await supabase.from(table).update(data).eq("id",id).select().single();
    if(error)console.error("Update error:",error);
    if(row){
      if(table==="contacts")setContacts(p=>p.map(x=>x.id===row.id?row:x));
      if(table==="deals")setDeals(p=>p.map(x=>x.id===row.id?row:x));
      if(table==="activities")setActivities(p=>p.map(x=>x.id===row.id?row:x));
    }
  };

  const handleDelete=async(table,id)=>{
    await supabase.from(table).delete().eq("id",id);
    if(table==="contacts")setContacts(p=>p.filter(x=>x.id!==id));
    if(table==="deals")setDeals(p=>p.filter(x=>x.id!==id));
    if(table==="activities")setActivities(p=>p.filter(x=>x.id!==id));
  };

  if(!authed)return <Login onSuccess={handleLogin}/>;
  if(loading)return <Spinner/>;

  return <div style={{display:"flex",minHeight:"100vh",background:C.bg,fontFamily:FONT}}>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
    <Sidebar active={active} setActive={setActive} onLogout={handleLogout}/>
    <main style={{flex:1,padding:"36px 44px",overflowY:"auto",minWidth:0}}>
      {active==="dashboard"&&<Dashboard contacts={contacts} deals={deals} activities={activities}/>}
      {active==="contacts"&&<Contacts contacts={contacts} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete}/>}
      {active==="deals"&&<Pipeline deals={deals} contacts={contacts} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete}/>}
      {active==="activities"&&<Activities activities={activities} contacts={contacts} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete}/>}
    </main>
  </div>;
}
