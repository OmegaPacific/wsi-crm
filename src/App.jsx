import { useState, useMemo, useEffect } from "react";
import { supabase } from "./supabase";

const STAGES = ["Lead","Email","Phone","Interested","Won","Not Interested"];
const STAGE_META = {
  Lead:{bg:"#dcfce7",text:"#15803d",bar:"#22c55e"},
  Email:{bg:"#ecfdf5",text:"#047857",bar:"#10b981"},
  Phone:{bg:"#d1fae5",text:"#065f46",bar:"#059669"},
  Interested:{bg:"#fefce8",text:"#854d0e",bar:"#eab308"},
  Won:{bg:"#f0fdf4",text:"#166534",bar:"#16a34a"},
  "Not Interested":{bg:"#fef2f2",text:"#dc2626",bar:"#f87171"},
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
    {key:"deals",label:"Golf Pipeline",icon:<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>},
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

function Dashboard({deals,activities}){
  const openDeals=deals.filter(d=>d.stage!=="Won"&&d.stage!=="Not Interested");
  const totalPipeline=openDeals.reduce((s,d)=>s+Number(d.value),0);
  const wonValue=deals.filter(d=>d.stage==="Won").reduce((s,d)=>s+Number(d.value),0);
  const notInterested=deals.filter(d=>d.stage==="Not Interested").length;
  const pending=activities.filter(a=>!a.done).length;
  const stats=[
    {label:"Open Pipeline",value:`$${(totalPipeline/1000).toFixed(0)}k`,sub:`${openDeals.length} active deals`,color:C.accent},
    {label:"Won",value:`$${(wonValue/1000).toFixed(0)}k`,sub:"this quarter",color:C.success},
    {label:"Open Tasks",value:pending,sub:"need attention",color:pending>3?C.danger:C.warning},
    {label:"Not Interested",value:notInterested,sub:"this quarter",color:C.danger},
  ];
  const upcoming=activities.filter(a=>!a.done).sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(0,5);
  return <div>
    <div style={{marginBottom:32}}>
      <h1 style={{fontSize:26,fontWeight:800,color:C.text,margin:0}}>Welcome back 👋</h1>
      <p style={{color:C.muted,margin:"6px 0 0",fontSize:14}}>Plumas Sales CRM Dashboard</p>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:28}}>
      {stats.map(s=><div key={s.label} style={{background:C.surface,borderRadius:16,padding:"22px 24px",border:`1px solid ${C.border}`}}>
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
              <span style={{color:C.textSub,fontSize:13}}>{stage}</span>
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
        {upcoming.length===0&&<div style={{color:C.muted,fontSize:13,textAlign:"center",paddingTop:20}}>All clear!</div>}
        {upcoming.map(a=>(
          <div key={a.id} style={{display:"flex",gap:12,paddingBottom:14,marginBottom:14,borderBottom:`1px solid ${C.border}`}}>
            <div style={{width:34,height:34,borderRadius:10,background:C.accentLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{ACTIVITY_ICONS[a.type]}</div>
            <div>
              <div style={{color:C.text,fontSize:13,fontWeight:500}}>{a.note}</div>
              <div style={{color:C.muted,fontSize:11,marginTop:3}}>
                <span style={{background:C.accentLight,color:C.accentText,padding:"1px 6px",borderRadius:4,fontSize:10,fontWeight:600,marginRight:5}}>{a.owner}</span>
                {a.date}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>;
}

function DealForm({initial,onSave,onClose,title}){
  const [form,setForm]=useState(initial);
  const [errors,setErrors]=useState({});
  const F=key=>({value:form[key]??"",onChange:e=>{setForm(f=>({...f,[key]:e.target.value}));setErrors(e=>({...e,[key]:false}));}});
  const required=["title","contact_name","value","group_size","stage"];
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
      <div style={{gridColumn:"1 / -1"}}>
        <FieldLabel>Contact Name <span style={{color:C.danger}}>*</span></FieldLabel>
        <input {...F("contact_name")} placeholder="Type contact name…" style={{...inputStyle,border:`1.5px solid ${errors.contact_name?C.danger:C.border}`}}/>
        {errors.contact_name&&<div style={{color:C.danger,fontSize:11,marginTop:3}}>Required</div>}
      </div>
      <div>
        <FieldLabel>Contact Email</FieldLabel>
        <input {...F("contact_email")} type="email" placeholder="email@example.com" style={inputStyle}/>
      </div>
      <div>
        <FieldLabel>Contact Phone</FieldLabel>
        <input {...F("contact_phone")} type="tel" placeholder="+1 555-000-0000" style={inputStyle}/>
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
        <FieldLabel>Target for Closing</FieldLabel>
        <input {...F("close_date")} type="date" style={inputStyle}/>
      </div>
      <div>
        <FieldLabel>Event Date</FieldLabel>
        <input {...F("event_date")} type="date" style={inputStyle}/>
      </div>
      <div style={{gridColumn:"1 / -1"}}>
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

function Pipeline({deals,onAdd,onEdit,onDelete}){
  const [showForm,setShowForm]=useState(false);
  const [editDeal,setEditDeal]=useState(null);
  const [selectedDeal,setSelectedDeal]=useState(null);
  const blankDeal={title:"",contact_name:"",contact_email:"",contact_phone:"",stage:"Lead",value:"",group_size:"",close_date:"",event_date:"",notes:"",call_count:0,last_call_date:""};
  const moveStage=(deal,dir)=>{
    const idx=STAGES.indexOf(deal.stage),next=STAGES[idx+dir];
    if(next)onEdit("deals",{...deal,stage:next});
  };
  const inStyle={width:"100%",background:"#fff",border:`1.5px solid ${C.border}`,borderRadius:7,padding:"4px 8px",color:C.text,fontSize:12,fontFamily:FONT,outline:"none",boxSizing:"border-box"};
  return <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 80px)"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexShrink:0}}>
      <div>
        <h2 style={{fontSize:22,fontWeight:800,color:C.text,margin:0}}>Golf Pipeline</h2>
        <p style={{color:C.muted,margin:"4px 0 0",fontSize:13}}>${deals.filter(d=>d.stage!=="Won"&&d.stage!=="Not Interested").reduce((s,d)=>s+Number(d.value),0).toLocaleString()} open value</p>
      </div>
      <button onClick={()=>setShowForm(true)} style={{padding:"10px 20px",background:`linear-gradient(135deg,${C.accent},${C.accentDark})`,color:"#fff",border:"none",borderRadius:10,fontWeight:600,cursor:"pointer",fontFamily:FONT}}>+ New Deal</button>
    </div>
    <div style={{display:"flex",gap:14,overflowX:"auto",flex:1,paddingBottom:16,alignItems:"flex-start"}}>
      {STAGES.map(stage=>{
        const stageDeals=deals.filter(d=>d.stage===stage);
        const m=STAGE_META[stage];
        const isPhone=stage==="Phone";
        const isInterested=stage==="Interested";
        return <div key={stage} style={{minWidth:220,flex:"0 0 220px"}}>
          <div style={{padding:"10px 14px",background:m.bg,borderRadius:"12px 12px 0 0",border:`1px solid ${C.border}`,borderBottom:"none",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontWeight:700,fontSize:11,color:m.text,textTransform:"uppercase",letterSpacing:0.8}}>{stage}</span>
            <span style={{fontSize:11,color:m.text,background:m.text+"22",padding:"2px 7px",borderRadius:6,fontWeight:600}}>{stageDeals.length}</span>
          </div>
          <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:"0 0 12px 12px",minHeight:80,padding:"10px 8px",display:"flex",flexDirection:"column",gap:8}}>
            {stageDeals.length===0&&<div style={{textAlign:"center",padding:"18px 0",color:C.muted,fontSize:12}}>No deals</div>}
            {stageDeals.map(deal=>{
              const si=STAGES.indexOf(deal.stage);
              return <div key={deal.id} onClick={()=>setSelectedDeal(deal)} style={{background:C.surface,border:`1px solid ${selectedDeal?.id===deal.id?C.accent:C.border}`,borderRadius:12,padding:"12px 12px 10px",cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",gap:6,marginBottom:4}}>
                  <div style={{color:C.text,fontSize:13,fontWeight:700,lineHeight:1.3}}>{deal.title}</div>
                  <div style={{display:"flex",gap:3,flexShrink:0}}>
                    <button onClick={e=>{e.stopPropagation();setEditDeal({...deal,value:String(deal.value),group_size:String(deal.group_size||"")});}} style={{width:20,height:20,borderRadius:5,background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:12}}>✎</button>
                    <button onClick={e=>{e.stopPropagation();onDelete("deals",deal.id);if(selectedDeal?.id===deal.id)setSelectedDeal(null);}} style={{width:20,height:20,borderRadius:5,background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:14}}>×</button>
                  </div>
                </div>
                {deal.contact_name&&<div style={{color:C.muted,fontSize:11,marginBottom:2}}>👤 {deal.contact_name}</div>}
                {deal.contact_email&&<div style={{color:C.muted,fontSize:11,marginBottom:2}}>✉️ {deal.contact_email}</div>}
                {deal.contact_phone&&<div style={{color:C.muted,fontSize:11,marginBottom:6}}>📞 {deal.contact_phone}</div>}
                <div style={{display:"flex",gap:8,marginBottom:6,flexWrap:"wrap",alignItems:"center"}}>
                  <span style={{fontSize:14,fontWeight:800,color:C.text}}>${Number(deal.value).toLocaleString()}</span>
                  {deal.group_size&&<span style={{fontSize:11,background:C.accentLight,color:C.accentText,padding:"2px 7px",borderRadius:6,fontWeight:600}}>👥 {deal.group_size}</span>}
                </div>
                {isInterested&&deal.notes&&<div style={{fontSize:11,color:C.textSub,background:"#fefce8",border:"1px solid #fde68a",borderRadius:7,padding:"6px 8px",marginBottom:6,lineHeight:1.4}}>{deal.notes}</div>}
                {deal.event_date&&<div style={{fontSize:11,color:C.accentText,background:C.accentLight,padding:"3px 8px",borderRadius:6,marginBottom:6,fontWeight:500}}>🗓 {deal.event_date}</div>}
                {isPhone&&<div style={{borderTop:`1px solid ${C.border}`,paddingTop:8,marginBottom:6}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <span style={{fontSize:10,fontWeight:600,color:C.muted,textTransform:"uppercase"}}>Call Count</span>
                    <select value={deal.call_count||0} onChange={e=>onEdit("deals",{...deal,call_count:Number(e.target.value)})} style={{...inStyle,width:"auto"}}>
                      {[0,1,2,3,4,5,6,7].map(n=><option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div style={{fontSize:10,color:C.muted,marginBottom:4,textTransform:"uppercase",fontWeight:600,letterSpacing:0.5}}>Last Call Date</div>
                  <input type="date" value={deal.last_call_date||""} onChange={e=>onEdit("deals",{...deal,last_call_date:e.target.value})} style={inStyle}/>
                </div>}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:4}}>
                  <span style={{color:C.muted,fontSize:10}}>{deal.close_date?"🎯 "+deal.close_date:""}</span>
                  <div style={{display:"flex",gap:4}}>
                    {si>0&&<button onClick={()=>moveStage(deal,-1)} style={{width:24,height:24,borderRadius:6,background:C.bg,border:`1px solid ${C.border}`,color:C.textSub,cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center"}}>←</button>}
                    {si<STAGES.length-1&&<button onClick={()=>moveStage(deal,1)} style={{width:24,height:24,borderRadius:6,background:`linear-gradient(135deg,${C.accent},${C.accentDark})`,border:"none",color:"#fff",cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center"}}>→</button>}
                  </div>
                </div>
              </div>;
            })}
          </div>
        </div>;
      })}
    </div>
    {showForm&&<DealForm title="New Deal" initial={blankDeal} onSave={f=>{onAdd("deals",f);setShowForm(false);}} onClose={()=>setShowForm(false)}/>}
    {editDeal&&<DealForm title="Edit Deal" initial={editDeal} onSave={f=>{onEdit("deals",f);setEditDeal(null);}} onClose={()=>setEditDeal(null)}/>}
    {selectedDeal&&<div style={{position:"fixed",top:0,right:0,width:340,height:"100vh",background:C.surface,borderLeft:`1px solid ${C.border}`,boxShadow:"-4px 0 24px rgba(0,0,0,0.08)",overflowY:"auto",zIndex:100,padding:28}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{fontSize:16,fontWeight:700,color:C.text}}>Deal Details</div>
        <button onClick={()=>setSelectedDeal(null)} style={{width:30,height:30,borderRadius:8,background:C.bg,border:"none",color:C.muted,cursor:"pointer",fontSize:18}}>×</button>
      </div>
      <div style={{fontSize:17,fontWeight:700,color:C.text,marginBottom:6,lineHeight:1.3}}>{selectedDeal.title}</div>
      <div style={{display:"inline-block",background:STAGE_META[selectedDeal.stage]?.bg,color:STAGE_META[selectedDeal.stage]?.text,padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:600,marginBottom:16}}>{selectedDeal.stage}</div>
      <div style={{display:"flex",gap:10,marginBottom:20}}>
        <div style={{flex:1,background:C.accentLight,borderRadius:10,padding:"12px 14px",textAlign:"center"}}>
          <div style={{color:C.muted,fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:0.5}}>Value</div>
          <div style={{color:C.accent,fontSize:20,fontWeight:800,marginTop:4}}>${Number(selectedDeal.value).toLocaleString()}</div>
        </div>
        <div style={{flex:1,background:C.accentLight,borderRadius:10,padding:"12px 14px",textAlign:"center"}}>
          <div style={{color:C.muted,fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:0.5}}>Group Size</div>
          <div style={{color:C.accent,fontSize:20,fontWeight:800,marginTop:4}}>👥 {selectedDeal.group_size||"—"}</div>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {selectedDeal.contact_name&&<div><FieldLabel>Contact</FieldLabel><div style={{color:C.text,fontSize:13,fontWeight:500}}>👤 {selectedDeal.contact_name}</div></div>}
        {selectedDeal.contact_email&&<div><FieldLabel>Email</FieldLabel><div style={{color:C.text,fontSize:13}}>✉️ {selectedDeal.contact_email}</div></div>}
        {selectedDeal.contact_phone&&<div><FieldLabel>Phone</FieldLabel><div style={{color:C.text,fontSize:13}}>📞 {selectedDeal.contact_phone}</div></div>}
        {selectedDeal.close_date&&<div><FieldLabel>Target for Closing</FieldLabel><div style={{color:C.text,fontSize:13}}>🎯 {selectedDeal.close_date}</div></div>}
        {selectedDeal.event_date&&<div><FieldLabel>Event Date</FieldLabel><div style={{color:C.text,fontSize:13}}>🗓 {selectedDeal.event_date}</div></div>}
        {selectedDeal.stage==="Phone"&&<div><FieldLabel>Call Count</FieldLabel><div style={{color:C.text,fontSize:13,fontWeight:600}}>{selectedDeal.call_count||0} calls{selectedDeal.last_call_date?` · Last: ${selectedDeal.last_call_date}`:""}</div></div>}
        {selectedDeal.notes&&<div><FieldLabel>Notes</FieldLabel><div style={{color:C.text,fontSize:13,lineHeight:1.6,background:C.bg,borderRadius:8,padding:"10px 12px"}}>{selectedDeal.notes}</div></div>}
      </div>
      <div style={{marginTop:24,display:"flex",gap:10}}>
        <button onClick={()=>{setEditDeal({...selectedDeal,value:String(selectedDeal.value),group_size:String(selectedDeal.group_size||"")});setSelectedDeal(null);}} style={{flex:1,background:`linear-gradient(135deg,${C.accent},${C.accentDark})`,color:"#fff",border:"none",borderRadius:10,padding:"10px",fontWeight:600,cursor:"pointer",fontFamily:FONT,fontSize:13}}>Edit Deal</button>
        <button onClick={()=>setSelectedDeal(null)} style={{flex:1,background:"transparent",color:C.textSub,border:`1.5px solid ${C.border}`,borderRadius:10,padding:"10px",fontWeight:600,cursor:"pointer",fontFamily:FONT,fontSize:13}}>Close</button>
      </div>
    </div>}
  </div>;
}

function ActivityForm({onSave,onClose}){
  const [form,setForm]=useState({type:"Call",owner:"",note:"",date:""});
  const [errors,setErrors]=useState({});
  const validate=()=>{
    const e={};
    if(!form.owner.trim())e.owner=true;
    if(!form.note.trim())e.note=true;
    if(!form.date)e.date=true;
    setErrors(e);
    return Object.keys(e).length===0;
  };
  return <Modal title="Log Activity" onClose={onClose}>
    <div style={{marginBottom:14}}>
      <FieldLabel>Type</FieldLabel>
      <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={inputStyle}>
        {["Call","Email","Meeting","Task"].map(t=><option key={t}>{t}</option>)}
      </select>
    </div>
    <div style={{marginBottom:14}}>
      <FieldLabel>Owner <span style={{color:C.danger}}>*</span></FieldLabel>
      <input value={form.owner} onChange={e=>{setForm(f=>({...f,owner:e.target.value}));setErrors(x=>({...x,owner:false}));}} placeholder="Who is handling this?" style={{...inputStyle,border:`1.5px solid ${errors.owner?C.danger:C.border}`}}/>
      {errors.owner&&<div style={{color:C.danger,fontSize:11,marginTop:3}}>Required</div>}
    </div>
    <div style={{marginBottom:14}}>
      <FieldLabel>Note <span style={{color:C.danger}}>*</span></FieldLabel>
      <textarea value={form.note} onChange={e=>{setForm(f=>({...f,note:e.target.value}));setErrors(x=>({...x,note:false}));}} rows={3} style={{...inputStyle,resize:"vertical",border:`1.5px solid ${errors.note?C.danger:C.border}`}}/>
      {errors.note&&<div style={{color:C.danger,fontSize:11,marginTop:3}}>Required</div>}
    </div>
    <div style={{marginBottom:24}}>
      <FieldLabel>Date <span style={{color:C.danger}}>*</span></FieldLabel>
      <input type="date" value={form.date} onChange={e=>{setForm(f=>({...f,date:e.target.value}));setErrors(x=>({...x,date:false}));}} style={{...inputStyle,border:`1.5px solid ${errors.date?C.danger:C.border}`}}/>
      {errors.date&&<div style={{color:C.danger,fontSize:11,marginTop:3}}>Required</div>}
    </div>
    <div style={{display:"flex",gap:10}}>
      <Btn variant="primary" onClick={()=>validate()&&onSave(form)}>Log Activity</Btn>
      <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
    </div>
  </Modal>;
}

function Activities({activities,onAdd,onEdit,onDelete}){
  const [tab,setTab]=useState("pending");
  const [showForm,setShowForm]=useState(false);
  const typeColors={Call:"#dcfce7",Email:"#d1fae5",Meeting:"#bbf7d0",Task:"#fef9c3"};
  const typeText={Call:"#166634",Email:"#15803d",Meeting:"#065f46",Task:"#854d0e"};
  const pending=[...activities.filter(a=>!a.done)].sort((a,b)=>new Date(a.date)-new Date(b.date));
  const completed=[...activities.filter(a=>a.done)].sort((a,b)=>new Date(a.date)-new Date(b.date));
  const displayed=tab==="pending"?pending:completed;
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
      <div>
        <h2 style={{fontSize:22,fontWeight:800,color:C.text,margin:0}}>Activities</h2>
        <p style={{color:C.muted,margin:"4px 0 0",fontSize:13}}>{pending.length} pending · {completed.length} completed</p>
      </div>
      <button onClick={()=>setShowForm(true)} style={{padding:"10px 20px",background:`linear-gradient(135deg,${C.accent},${C.accentDark})`,color:"#fff",border:"none",borderRadius:10,fontWeight:600,cursor:"pointer",fontFamily:FONT}}>+ Log Activity</button>
    </div>
    <div style={{display:"flex",gap:4,background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:4,marginBottom:20,width:"fit-content"}}>
      {[["pending",`Pending (${pending.length})`],["completed",`Completed (${completed.length})`]].map(([key,label])=>(
        <button key={key} onClick={()=>setTab(key)} style={{padding:"8px 20px",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:FONT,background:tab===key?C.accent:"transparent",color:tab===key?"#fff":C.muted}}>
          {label}
        </button>
      ))}
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {displayed.length===0&&<div style={{textAlign:"center",padding:48,color:C.muted,background:C.surface,borderRadius:16,border:`1px solid ${C.border}`}}>No {tab} activities.</div>}
      {displayed.map(a=>(
        <div key={a.id} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px 20px",display:"flex",alignItems:"center",gap:16,opacity:a.done?0.55:1}}>
          <div onClick={()=>onEdit("activities",{...a,done:!a.done})} style={{width:24,height:24,borderRadius:8,border:`2px solid ${a.done?C.success:C.border}`,background:a.done?C.success:"#fff",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            {a.done&&<svg width="12" height="12" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>}
          </div>
          <span style={{padding:"4px 10px",borderRadius:8,background:typeColors[a.type]||C.accentLight,color:typeText[a.type]||C.accentText,fontSize:12,fontWeight:700,flexShrink:0}}>{a.type}</span>
          <div style={{flex:1}}>
            <div style={{color:C.text,fontSize:14,fontWeight:500,textDecoration:a.done?"line-through":"none"}}>{a.note}</div>
            <div style={{color:C.muted,fontSize:12,marginTop:3,display:"flex",gap:8,alignItems:"center"}}>
              <span style={{background:C.accentLight,color:C.accentText,padding:"1px 8px",borderRadius:5,fontSize:11,fontWeight:600}}>{a.owner}</span>
              <span>{a.date}</span>
            </div>
          </div>
          <button onClick={()=>onDelete("activities",a.id)} style={{width:28,height:28,borderRadius:7,background:"#fef2f2",border:"1px solid #fecaca",color:C.danger,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
      ))}
    </div>
    {showForm&&<ActivityForm onSave={f=>{onAdd("activities",f);setShowForm(false);}} onClose={()=>setShowForm(false)}/>}
  </div>;
}

export default function CRM(){
  const [authed,setAuthed]=useState(()=>sessionStorage.getItem("wsi-authed")==="true");
  const [active,setActive]=useState("dashboard");
  const [deals,setDeals]=useState([]);
  const [activities,setActivities]=useState([]);
  const [loading,setLoading]=useState(true);

  const handleLogin=()=>{sessionStorage.setItem("wsi-authed","true");setAuthed(true);};
  const handleLogout=()=>{sessionStorage.removeItem("wsi-authed");setAuthed(false);};

  useEffect(()=>{
    if(!authed)return;
    (async()=>{
      setLoading(true);
      const [d,a]=await Promise.all([
        supabase.from("deals").select("*").order("id"),
        supabase.from("activities").select("*").order("id"),
      ]);
      setDeals(d.data||[]);
      setActivities(a.data||[]);
      setLoading(false);
    })();
  },[authed]);

  const handleAdd=async(table,form)=>{
    let data={...form};
    delete data.id;
    if(table==="deals"){
      data.value=Number(form.value)||0;
      data.group_size=Number(form.group_size)||null;
      data.call_count=Number(form.call_count)||0;
      data.notes=form.notes||"";
      data.last_call_date=form.last_call_date||null;
      data.contact_name=form.contact_name||"";
      data.contact_email=form.contact_email||"";
      data.contact_phone=form.contact_phone||"";
      data.event_date=form.event_date||null;
      data.close_date=form.close_date||null;
    }
    if(table==="activities"){
      data.done=false;
      data.owner=form.owner||"";
    }
    const{data:row}=await supabase.from(table).insert(data).select().single();
    if(row){
      if(table==="deals")setDeals(p=>[...p,row]);
      if(table==="activities")setActivities(p=>[...p,row]);
    }
  };

  const handleEdit=async(table,form)=>{
    const id=form.id;
    let data={...form};
    delete data.id;
    if(table==="deals"){
      data.value=Number(form.value)||0;
      data.group_size=Number(form.group_size)||null;
      data.call_count=Number(form.call_count)||0;
      data.notes=form.notes||"";
      data.last_call_date=form.last_call_date||null;
      data.contact_name=form.contact_name||"";
      data.contact_email=form.contact_email||"";
      data.contact_phone=form.contact_phone||"";
      data.event_date=form.event_date||null;
      data.close_date=form.close_date||null;
    }
    const{data:row,error}=await supabase.from(table).update(data).eq("id",id).select().single();
    if(error)console.error("Update error:",error);
    if(row){
      if(table==="deals")setDeals(p=>p.map(x=>x.id===row.id?row:x));
      if(table==="activities")setActivities(p=>p.map(x=>x.id===row.id?row:x));
    }
  };

  const handleDelete=async(table,id)=>{
    await supabase.from(table).delete().eq("id",id);
    if(table==="deals")setDeals(p=>p.filter(x=>x.id!==id));
    if(table==="activities")setActivities(p=>p.filter(x=>x.id!==id));
  }; 

  if(!authed)return <Login onSuccess={handleLogin}/>;
  if(loading)return <Spinner/>;

  return <div style={{display:"flex",minHeight:"100vh",background:C.bg,fontFamily:FONT}}>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
    <Sidebar active={active} setActive={setActive} onLogout={handleLogout}/>
    <main style={{flex:1,padding:"36px 44px",overflowY:"auto",minWidth:0}}>
      {active==="dashboard"&&<Dashboard deals={deals} activities={activities}/>}
      {active==="deals"&&<Pipeline deals={deals} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete}/>}
      {active==="activities"&&<Activities activities={activities} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete}/>}
    </main>
  </div>;
}