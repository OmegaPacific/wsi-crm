import { useState } from "react";

const STAGES = ["Lead","Email","Phone","Interested","Won","Not Interested"];
const STAGE_META = {
  Lead:{bg:"#dcfce7",text:"#15803d",bar:"#22c55e"},
  Email:{bg:"#ecfdf5",text:"#047857",bar:"#10b981"},
  Phone:{bg:"#d1fae5",text:"#065f46",bar:"#059669"},
  Interested:{bg:"#fefce8",text:"#854d0e",bar:"#eab308"},
  Won:{bg:"#f0fdf4",text:"#166534",bar:"#16a34a"},
  "Not Interested":{bg:"#fef2f2",text:"#dc2626",bar:"#f87171"},
};
const C={
  bg:"#f4f9f4",surface:"#ffffff",border:"#d1e7d1",text:"#0f1f0f",
  textSub:"#3d5a3d",muted:"#6b8f6b",accent:"#166534",accentDark:"#14532d",
  accentLight:"#dcfce7",accentText:"#15803d",success:"#16a34a",
  warning:"#d97706",danger:"#dc2626",sidebarBg:"#0f2d1a",
  sidebarBorder:"#1a3d24",sidebarMuted:"#4d7a5a",
};
const FONT="'Inter','Segoe UI',sans-serif";
const ACTIVITY_ICONS={Call:"📞",Email:"✉️",Meeting:"🤝",Task:"✓"};

const MOCK_DEALS = [
  {id:1,title:"Whitfield Corporate Outing",contact_name:"James Whitfield",contact_email:"james@whitfield.com",contact_phone:"530-555-0101",stage:"Won",value:48000,group_size:24,close_date:"2026-03-01",event_date:"2026-04-15",notes:"Annual event, repeat customer.",call_count:0,last_call_date:""},
  {id:2,title:"Drummond Team Day",contact_name:"Sara Drummond",contact_email:"sara@drummond.com",contact_phone:"530-555-0202",stage:"Interested",value:12000,group_size:12,close_date:"2026-04-01",event_date:"2026-05-10",notes:"Very interested, sent proposal draft. Following up next week.",call_count:0,last_call_date:""},
  {id:3,title:"Pines Insurance Golf Day",contact_name:"Tom Pines",contact_email:"tom@pines.com",contact_phone:"530-555-0303",stage:"Phone",value:8500,group_size:8,close_date:"2026-04-15",event_date:"",notes:"Left voicemail twice.",call_count:2,last_call_date:"2026-03-08"},
  {id:4,title:"Sierra Bank Outing",contact_name:"Linda Carr",contact_email:"linda@sierrabank.com",contact_phone:"530-555-0404",stage:"Lead",value:22000,group_size:18,close_date:"",event_date:"2026-06-01",notes:"",call_count:0,last_call_date:""},
];
const MOCK_ACTIVITIES = [
  {id:1,type:"Call",owner:"Mike C",note:"Confirmed April outing details",date:"2026-03-01",done:true},
  {id:2,type:"Email",owner:"Sarah T",note:"Send updated pricing sheet",date:"2026-03-15",done:false},
  {id:3,type:"Meeting",owner:"Mike C",note:"Course walkthrough scheduled",date:"2026-03-20",done:false},
  {id:4,type:"Task",owner:"Sarah T",note:"Follow up on Sierra Bank proposal",date:"2026-03-12",done:false},
];

function FieldLabel({c,children}){return <div style={{color:c.muted,fontSize:11,fontWeight:600,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>{children}</div>;}

function Modal({title,onClose,children,C}){
  return <div style={{position:"fixed",inset:0,background:"rgba(10,30,15,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,backdropFilter:"blur(2px)"}}>
    <div style={{background:C.surface,borderRadius:20,padding:"32px 36px",width:460,boxShadow:"0 24px 64px rgba(10,30,15,0.2)",maxHeight:"92vh",overflowY:"auto",border:`1px solid ${C.border}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
        <div style={{fontSize:18,fontWeight:700,color:C.text}}>{title}</div>
        <button onClick={onClose} style={{width:32,height:32,borderRadius:8,background:C.bg,border:"none",color:C.muted,cursor:"pointer",fontSize:18}}>×</button>
      </div>
      {children}
    </div>
  </div>;
}

function Sidebar({active,setActive}){
  const items=[
    {key:"dashboard",label:"Dashboard"},
    {key:"deals",label:"Golf Pipeline"},
    {key:"activities",label:"Activities"},
  ];
  return <nav style={{width:232,minHeight:"100vh",background:C.sidebarBg,display:"flex",flexDirection:"column",flexShrink:0}}>
    <div style={{padding:"28px 24px 24px",borderBottom:`1px solid ${C.sidebarBorder}`}}>
      <div style={{fontSize:15,fontWeight:800,color:"#f0fdf4",fontFamily:FONT}}>Plumas Sales</div>
      <div style={{fontSize:10,color:C.sidebarMuted,letterSpacing:1.5,textTransform:"uppercase",fontWeight:500,marginTop:2}}>CRM Suite</div>
    </div>
    <div style={{padding:"16px 12px",flex:1}}>
      {items.map(item=>{
        const isActive=active===item.key;
        return <button key={item.key} onClick={()=>setActive(item.key)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 12px",marginBottom:2,background:isActive?"rgba(22,101,52,0.3)":"transparent",border:"none",borderRadius:10,color:isActive?"#bbf7d0":C.sidebarMuted,cursor:"pointer",fontSize:14,fontWeight:isActive?600:400,fontFamily:FONT,textAlign:"left"}}>
          {item.label}
          {isActive&&<span style={{marginLeft:"auto",width:6,height:6,borderRadius:"50%",background:C.success}}/>}
        </button>;
      })}
    </div>
    <div style={{padding:"16px 20px",borderTop:`1px solid ${C.sidebarBorder}`}}>
      <div style={{color:"#f0fdf4",fontSize:13,fontWeight:600}}>Plumas Team</div>
      <div style={{color:C.sidebarMuted,fontSize:11}}>Administrator</div>
    </div>
  </nav>;
}

function Dashboard(){
  const stats=[
    {label:"Open Pipeline",value:"$42k",sub:"3 active deals",color:C.accent},
    {label:"Won",value:"$48k",sub:"this quarter",color:C.success},
    {label:"Open Tasks",value:3,sub:"need attention",color:C.warning},
    {label:"Not Interested",value:0,sub:"this quarter",color:C.danger},
  ];
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
          const val=MOCK_DEALS.filter(d=>d.stage===stage).reduce((s,d)=>s+d.value,0);
          const m=STAGE_META[stage];
          return <div key={stage} style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{color:C.textSub,fontSize:13}}>{stage}</span>
              <span style={{color:C.text,fontSize:13,fontWeight:600}}>${val.toLocaleString()}</span>
            </div>
            <div style={{height:7,background:C.bg,borderRadius:99,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${Math.min(100,(val/50000)*100)}%`,background:m.bar,borderRadius:99}}/>
            </div>
          </div>;
        })}
      </div>
      <div style={{background:C.surface,borderRadius:16,padding:28,border:`1px solid ${C.border}`}}>
        <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:20}}>Upcoming Activities</div>
        {MOCK_ACTIVITIES.filter(a=>!a.done).sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(0,4).map(a=>(
          <div key={a.id} style={{display:"flex",gap:12,paddingBottom:14,marginBottom:14,borderBottom:`1px solid ${C.border}`}}>
            <div style={{width:34,height:34,borderRadius:10,background:C.accentLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{ACTIVITY_ICONS[a.type]}</div>
            <div>
              <div style={{color:C.text,fontSize:13,fontWeight:500}}>{a.note}</div>
              <div style={{color:C.muted,fontSize:11,marginTop:3}}><span style={{background:C.accentLight,color:C.accentText,padding:"1px 6px",borderRadius:4,fontSize:10,fontWeight:600,marginRight:5}}>{a.owner}</span>{a.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>;
}

function Pipeline(){
  const [deals,setDeals]=useState(MOCK_DEALS);
  const moveStage=(deal,dir)=>{
    const idx=STAGES.indexOf(deal.stage),next=STAGES[idx+dir];
    if(next)setDeals(p=>p.map(d=>d.id===deal.id?{...d,stage:next}:d));
  };
  const inputSt={width:"100%",background:"#fff",border:`1.5px solid ${C.border}`,borderRadius:7,padding:"4px 8px",color:C.text,fontSize:12,fontFamily:FONT,outline:"none",boxSizing:"border-box"};
  return <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 80px)"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexShrink:0}}>
      <div>
        <h2 style={{fontSize:22,fontWeight:800,color:C.text,margin:0}}>Golf Pipeline</h2>
        <p style={{color:C.muted,margin:"4px 0 0",fontSize:13}}>${deals.filter(d=>d.stage!=="Won"&&d.stage!=="Not Interested").reduce((s,d)=>s+d.value,0).toLocaleString()} open value</p>
      </div>
      <button style={{padding:"10px 20px",background:`linear-gradient(135deg,${C.accent},${C.accentDark})`,color:"#fff",border:"none",borderRadius:10,fontWeight:600,cursor:"pointer",fontFamily:FONT}}>+ New Deal</button>
    </div>
    <div style={{display:"flex",gap:14,overflowX:"auto",flex:1,paddingBottom:16,alignItems:"flex-start"}}>
      {STAGES.map(stage=>{
        const stageDeals=deals.filter(d=>d.stage===stage);
        const m=STAGE_META[stage];
        const isPhone=stage==="Phone";
        const isInterested=stage==="Interested";
        return <div key={stage} style={{minWidth:215,flex:"0 0 215px"}}>
          <div style={{padding:"10px 14px",background:m.bg,borderRadius:"12px 12px 0 0",border:`1px solid ${C.border}`,borderBottom:"none",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontWeight:700,fontSize:11,color:m.text,textTransform:"uppercase",letterSpacing:0.8}}>{stage}</span>
            <span style={{fontSize:11,color:m.text,background:m.text+"22",padding:"2px 7px",borderRadius:6,fontWeight:600}}>{stageDeals.length}</span>
          </div>
          <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:"0 0 12px 12px",minHeight:80,padding:"10px 8px",display:"flex",flexDirection:"column",gap:8}}>
            {stageDeals.length===0&&<div style={{textAlign:"center",padding:"18px 0",color:C.muted,fontSize:12}}>No deals</div>}
            {stageDeals.map(deal=>{
              const si=STAGES.indexOf(deal.stage);
              return <div key={deal.id} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 12px 10px"}}>
                <div style={{color:C.text,fontSize:13,fontWeight:700,marginBottom:4,lineHeight:1.3}}>{deal.title}</div>
                {deal.contact_name&&<div style={{color:C.muted,fontSize:11,marginBottom:2}}>👤 {deal.contact_name}</div>}
                {deal.contact_email&&<div style={{color:C.muted,fontSize:11,marginBottom:2}}>✉️ {deal.contact_email}</div>}
                {deal.contact_phone&&<div style={{color:C.muted,fontSize:11,marginBottom:6}}>📞 {deal.contact_phone}</div>}
                <div style={{display:"flex",gap:8,marginBottom:6,flexWrap:"wrap",alignItems:"center"}}>
                  <span style={{fontSize:14,fontWeight:800,color:C.text}}>${deal.value.toLocaleString()}</span>
                  {deal.group_size&&<span style={{fontSize:11,background:C.accentLight,color:C.accentText,padding:"2px 7px",borderRadius:6,fontWeight:600}}>👥 {deal.group_size}</span>}
                </div>
                {isInterested&&deal.notes&&<div style={{fontSize:11,color:C.textSub,background:"#fefce8",border:"1px solid #fde68a",borderRadius:7,padding:"6px 8px",marginBottom:6,lineHeight:1.4}}>{deal.notes}</div>}
                {deal.event_date&&<div style={{fontSize:11,color:C.accentText,background:C.accentLight,padding:"3px 8px",borderRadius:6,marginBottom:6,fontWeight:500}}>🗓 {deal.event_date}</div>}
                {isPhone&&<div style={{borderTop:`1px solid ${C.border}`,paddingTop:8,marginBottom:6}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <span style={{fontSize:10,fontWeight:600,color:C.muted,textTransform:"uppercase"}}>Call Count</span>
                    <select value={deal.call_count||0} onChange={e=>setDeals(p=>p.map(d=>d.id===deal.id?{...d,call_count:Number(e.target.value)}:d))} style={{...inputSt,width:"auto"}}>
                      {[0,1,2,3,4,5,6,7].map(n=><option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div style={{fontSize:10,color:C.muted,marginBottom:4,textTransform:"uppercase",fontWeight:600,letterSpacing:0.5}}>Last Call Date</div>
                  <input type="date" value={deal.last_call_date||""} onChange={e=>setDeals(p=>p.map(d=>d.id===deal.id?{...d,last_call_date:e.target.value}:d))} style={inputSt}/>
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
  </div>;
}

function Activities(){
  const [acts,setActs]=useState(MOCK_ACTIVITIES);
  const [tab,setTab]=useState("pending");
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({type:"Call",owner:"",note:"",date:""});
  const [errors,setErrors]=useState({});
  const inputSt={width:"100%",background:"#fff",border:`1.5px solid ${C.border}`,borderRadius:10,padding:"10px 13px",color:C.text,fontSize:14,fontFamily:FONT,outline:"none",boxSizing:"border-box"};
  const typeColors={Call:"#dcfce7",Email:"#d1fae5",Meeting:"#bbf7d0",Task:"#fef9c3"};
  const typeText={Call:"#166534",Email:"#15803d",Meeting:"#065f46",Task:"#854d0e"};
  const pending=[...acts.filter(a=>!a.done)].sort((a,b)=>new Date(a.date)-new Date(b.date));
  const completed=[...acts.filter(a=>a.done)].sort((a,b)=>new Date(a.date)-new Date(b.date));
  const displayed=tab==="pending"?pending:completed;
  const validate=()=>{
    const e={};
    if(!form.owner.trim())e.owner=true;
    if(!form.note.trim())e.note=true;
    if(!form.date)e.date=true;
    setErrors(e);
    return Object.keys(e).length===0;
  };
  const saveActivity=()=>{
    if(!validate())return;
    setActs(p=>[...p,{...form,id:Date.now(),done:false}]);
    setForm({type:"Call",owner:"",note:"",date:""});
    setShowForm(false);
  };

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
        <div key={a.id} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px 20px",display:"flex",alignItems:"center",gap:16,opacity:a.done?0.55:1,transition:"opacity 0.2s"}}>
          <div onClick={()=>setActs(p=>p.map(x=>x.id===a.id?{...x,done:!x.done}:x))} style={{width:24,height:24,borderRadius:8,border:`2px solid ${a.done?C.success:C.border}`,background:a.done?C.success:"#fff",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
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
          <button onClick={()=>setActs(p=>p.filter(x=>x.id!==a.id))} style={{width:28,height:28,borderRadius:7,background:"#fef2f2",border:"1px solid #fecaca",color:C.danger,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
      ))}
    </div>

    {showForm&&<div style={{position:"fixed",inset:0,background:"rgba(10,30,15,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,backdropFilter:"blur(2px)"}}>
      <div style={{background:C.surface,borderRadius:20,padding:"32px 36px",width:460,boxShadow:"0 24px 64px rgba(10,30,15,0.2)",border:`1px solid ${C.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
          <div style={{fontSize:18,fontWeight:700,color:C.text}}>Log Activity</div>
          <button onClick={()=>setShowForm(false)} style={{width:32,height:32,borderRadius:8,background:C.bg,border:"none",color:C.muted,cursor:"pointer",fontSize:18}}>×</button>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{color:C.muted,fontSize:11,fontWeight:600,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Type</div>
          <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={inputSt}>
            {["Call","Email","Meeting","Task"].map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{color:C.muted,fontSize:11,fontWeight:600,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Owner <span style={{color:C.danger}}>*</span></div>
          <input value={form.owner} onChange={e=>{setForm(f=>({...f,owner:e.target.value}));setErrors(x=>({...x,owner:false}));}} placeholder="Who is handling this?" style={{...inputSt,border:`1.5px solid ${errors.owner?C.danger:C.border}`}}/>
          {errors.owner&&<div style={{color:C.danger,fontSize:11,marginTop:3}}>Required</div>}
        </div>
        <div style={{marginBottom:14}}>
          <div style={{color:C.muted,fontSize:11,fontWeight:600,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Note <span style={{color:C.danger}}>*</span></div>
          <textarea value={form.note} onChange={e=>{setForm(f=>({...f,note:e.target.value}));setErrors(x=>({...x,note:false}));}} rows={3} style={{...inputSt,resize:"vertical",border:`1.5px solid ${errors.note?C.danger:C.border}`}}/>
          {errors.note&&<div style={{color:C.danger,fontSize:11,marginTop:3}}>Required</div>}
        </div>
        <div style={{marginBottom:24}}>
          <div style={{color:C.muted,fontSize:11,fontWeight:600,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Date <span style={{color:C.danger}}>*</span></div>
          <input type="date" value={form.date} onChange={e=>{setForm(f=>({...f,date:e.target.value}));setErrors(x=>({...x,date:false}));}} style={{...inputSt,border:`1.5px solid ${errors.date?C.danger:C.border}`}}/>
          {errors.date&&<div style={{color:C.danger,fontSize:11,marginTop:3}}>Required</div>}
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={saveActivity} style={{flex:1,background:`linear-gradient(135deg,${C.accent},${C.accentDark})`,color:"#fff",border:"none",borderRadius:10,padding:"11px 16px",fontWeight:600,cursor:"pointer",fontFamily:FONT,fontSize:14}}>Log Activity</button>
          <button onClick={()=>setShowForm(false)} style={{flex:1,background:"transparent",color:C.textSub,border:`1.5px solid ${C.border}`,borderRadius:10,padding:"11px 16px",fontWeight:600,cursor:"pointer",fontFamily:FONT,fontSize:14}}>Cancel</button>
        </div>
      </div>
    </div>}
  </div>;
}

export default function CRMPreview(){
  const [active,setActive]=useState("dashboard");
  return <div style={{display:"flex",minHeight:"100vh",background:C.bg,fontFamily:FONT}}>
    <Sidebar active={active} setActive={setActive}/>
    <main style={{flex:1,padding:"36px 44px",overflowY:"auto",minWidth:0}}>
      {active==="dashboard"&&<Dashboard/>}
      {active==="deals"&&<Pipeline/>}
      {active==="activities"&&<Activities/>}
    </main>
  </div>;
}
