import { useState, useRef, useEffect } from "react";
import { getPlants, getCanvasElements, saveCanvasElements } from '../services/api';
import api from '../services/api';

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const IcoGrass  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="100%" height="100%"><path d="M12 22V12M12 12C12 7 7 4 3 6M12 12C12 7 17 4 21 6M7 22V16M17 22V16" strokeLinecap="round"/></svg>;
const IcoPath   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="100%" height="100%"><path d="M5 20L8 4M16 4L19 20M8 4Q12 8 16 4M5 20Q12 16 19 20" strokeLinecap="round"/></svg>;
const IcoSoil   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="100%" height="100%"><path d="M2 20h20M6 20v-4a6 6 0 0 1 12 0v4" strokeLinecap="round"/><path d="M12 16v-5M9 14l3-3 3 3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoTree   = () => <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><polygon points="12,2 20,14 4,14" fill="#16a34a"/><polygon points="12,6 19,17 5,17" fill="#15803d"/><rect x="10" y="17" width="4" height="5" rx="1" fill="#92400e"/></svg>;
const IcoShrub  = () => <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><circle cx="8" cy="11" r="5" fill="#4ade80"/><circle cx="16" cy="11" r="5" fill="#22c55e"/><circle cx="12" cy="8" r="5" fill="#16a34a"/><rect x="9" y="18" width="6" height="4" rx="1" fill="#92400e"/></svg>;
const IcoSelect = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="100%" height="100%"><path d="M4 4l7 18 3-7 7-3L4 4z" strokeLinejoin="round"/></svg>;
const IcoPoly   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="100%" height="100%"><polygon points="12,3 21,9 18,20 6,20 3,9" strokeLinejoin="round"/></svg>;
const IcoZone   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="100%" height="100%"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>;
const IcoPoint  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="100%" height="100%"><circle cx="12" cy="10" r="5"/><line x1="12" y1="15" x2="12" y2="22"/></svg>;
const IcoTrash  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="100%" height="100%"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>;
const IcoUndo   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="100%" height="100%"><path d="M3 10h11a5 5 0 010 10H7M3 10l4-4M3 10l4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoSave   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="100%" height="100%"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const IcoPdf    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="100%" height="100%"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>;
const IcoChart  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="100%" height="100%"><rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/></svg>;
const IcoOk     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="100%" height="100%"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoWarn   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="100%" height="100%"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;

const ZONE_CFG = {
  grass: { label:"Трева", color:"#86efac", border:"#16a34a", tc:"#14532d", Icon:IcoGrass },
  path:  { label:"Алея",  color:"#d1d5db", border:"#6b7280", tc:"#1f2937", Icon:IcoPath  },
  soil:  { label:"Почва",  color:"#d4a574", border:"#92400e", tc:"#451a03", Icon:IcoSoil  },
};


const PT_CFG = {
  tree:  { label:"Дърво", color:"#14532d", bg:"#dcfce7", Icon:IcoTree,  r:20 },
  shrub: { label:"Храст", color:"#166534", bg:"#d1fae5", Icon:IcoShrub, r:14 },
};

const GRASS_KEYWORDS = ['трева', 'тревна', 'lawn', 'grass', 'чим'];
const isGrassPlant = name => GRASS_KEYWORDS.some(k => name.toLowerCase().includes(k));

const mapApiPlant = p => {
  let kind;
  if (isGrassPlant(p.name)) {
    kind = "zone"; // само трева/тревна смеска е зона
  } else if (p.max_height_cm && p.max_height_cm >= 400) {
    kind = "tree";
  } else {
    kind = "shrub"; // всички останали са обекти
  }
  // unit: 'кг' за тревна смеска (qsm < 1), 'кв.м.' за чим (продава се на рулон/кв.м.), 'бр.' за всички останали
  const qsm = p.quantity_per_sqm ? parseFloat(p.quantity_per_sqm) : null;
  let unit;
  if (kind === 'zone') {
    unit = qsm && qsm < 1 ? 'кг' : 'кв.м.';
  } else {
    unit = 'бр.';
  }
  return { id: p.id, name: p.name, price: parseFloat(p.price || 0), qsm, kind, unit };
};

const snapV    = (v, g) => Math.round(v / g) * g;
const normRect = (x,y,w,h) => ({ x:w<0?x+w:x, y:h<0?y+h:y, w:Math.abs(w), h:Math.abs(h) });
const p2m      = (px, sc) => px / sc;
const fmtE     = v => Number(v).toFixed(2);
const fmtWeight = v => v < 1 ? `${Math.round(v*1000)} г` : `${Number(v).toFixed(2)} кг`;

const fmtM     = v => Number(v).toFixed(1);
const shoelace = pts => { let a=0; for(let i=0;i<pts.length;i++){const j=(i+1)%pts.length;a+=pts[i].x*pts[j].y-pts[j].x*pts[i].y;} return Math.abs(a)/2; };
const cRect    = z => ({x:z.x+z.w/2, y:z.y+z.h/2});
const cPoly    = pts => ({x:pts.reduce((s,p)=>s+p.x,0)/pts.length, y:pts.reduce((s,p)=>s+p.y,0)/pts.length});
const inRect   = (px,py,z) => px>=z.x&&px<=z.x+z.w&&py>=z.y&&py<=z.y+z.h;
const inPoly   = (px,py,pts) => { let ins=false; for(let i=0,j=pts.length-1;i<pts.length;j=i++){const xi=pts[i].x,yi=pts[i].y,xj=pts[j].x,yj=pts[j].y;if(((yi>py)!==(yj>py))&&(px<(xj-xi)*(py-yi)/(yj-yi)+xi))ins=!ins;} return ins; };

// API calls handled via api.js

export default function GardenPlanCanvas({ planId, planMeta }) {
  const LS_KEY = `gp_canvas_${planId}`;

  const wrapRef = useRef(null);
  const svgRef  = useRef(null);
  const [size, setSize] = useState({w:900,h:560});
  const scale = Math.min(size.w/planMeta.width_m, size.h/planMeta.height_m)*0.93;
  const CW = planMeta.width_m  * scale;
  const CH = planMeta.height_m * scale;
  const G  = scale;

  const [plants,      setPlants]      = useState([]);
  const [plantsReady, setPlantsReady] = useState(false);

  const [zones,   setZones]   = useState([]);
  const [polys,   setPolys]   = useState([]);
  const [points,  setPoints]  = useState([]);
  const [history, setHistory] = useState([]);

  const [tool,     setTool]     = useState("zone");
  const [zoneType, setZoneType] = useState("grass");
  const [ptType,   setPtType]   = useState("tree");
  const [selPlant, setSelPlant] = useState(null);
  const [selected, setSelected] = useState(null);

  const [rectDraw, setRectDraw] = useState(null);
  const [polyDraw, setPolyDraw] = useState(null);
  const dragRef = useRef(null);

  const [saveState, setSaveState] = useState("idle");
  const [saveMsg,   setSaveMsg]   = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);

  // Resize observer
  useEffect(()=>{
    if(!wrapRef.current) return;
    const ro=new ResizeObserver(([e])=>setSize({w:e.contentRect.width,h:Math.max(e.contentRect.height,360)}));
    ro.observe(wrapRef.current);
    return ()=>ro.disconnect();
  },[]);

  // Клавишни shortcuts
  useEffect(()=>{
    const onKey = e => {
      const tag = document.activeElement?.tagName;
      if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT') return; // не прихващаме в полета
      switch(e.key){
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          deleteSelected();
          break;
        case 'z':
        case 'Z':
          if(e.ctrlKey||e.metaKey){ e.preventDefault(); undo(); }
          break;
        case 'Escape':
          setPolyDraw(null); setRectDraw(null); setSelected(null);
          break;
        case 's': case 'S': if(!e.ctrlKey) setTool('select'); break;
        case 'r': case 'R': setTool('zone'); break;
        case 'p': case 'P': setTool('point'); break;
        case 'g': case 'G': setTool('poly'); break;
        default: break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[selected, history, zones, polys, points]);

  // Fetch plants
  useEffect(()=>{
    getPlants()
      .then(res=>{ setPlants(res.data.map(mapApiPlant)); setPlantsReady(true); })
      .catch(()=>{ setPlantsReady(true); });
  },[]);

  // Reset canvas и зареди от API при смяна на planId
  useEffect(()=>{
    if(!planId) return;
    // Първо reset
    setZones([]); setPolys([]); setPoints([]); setHistory([]); setSelected(null);

    let cancelled = false; // cleanup flag срещу race condition
    getCanvasElements(planId)
      .then(res=>{
        if(cancelled) return;
        const d = res.data;
        if(d.zones)  setZones(d.zones);
        if(d.polys)  setPolys(d.polys);
        if(d.points) setPoints(d.points);
      })
      .catch(()=>{
        if(cancelled) return;
        // fallback: localStorage
        try{
          const d=JSON.parse(localStorage.getItem(LS_KEY)||"{}");
          if(d.zones)  setZones(d.zones);
          if(d.polys)  setPolys(d.polys);
          if(d.points) setPoints(d.points);
        }catch{}
      });
    return () => { cancelled = true; }; // cleanup при повторно изпълнение
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[planId]);

  // Default selected plant
  useEffect(()=>{
    if(!plantsReady) return;
    if(tool==="point"){
      // При обект — нулирай selPlant при смяна на tool, потребителят избира сам
      setSelPlant(null);
    } else {
      const list = plants.filter(p=>p.kind==="zone");
      if(!selPlant||!list.find(p=>p.id===selPlant.id)) setSelPlant(list[0]||null);
    }
    setPolyDraw(null); setRectDraw(null); dragRef.current=null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[tool, plantsReady]);

  // Save: API + localStorage
  const doSave = async () => {
    setSaveState("saving"); setSaveMsg("Запазване…");
    const payload = { zones, polys, points };
    localStorage.setItem(LS_KEY, JSON.stringify(payload));
    try {
      await saveCanvasElements(planId, payload);
      setSaveState("ok"); setSaveMsg("Запазено ✓");
    } catch {
      setSaveState("error"); setSaveMsg("Локално запазено");
    }
    setTimeout(()=>{ setSaveState("idle"); setSaveMsg(""); }, 3000);
  };

  // PDF generation — sends canvas cost data to backend
  const doGeneratePdf = async () => {
    if (costs.rows.length === 0) {
      alert('Добавете растения към плана преди генериране на оферта!');
      return;
    }
    setPdfLoading(true);
    try {
      // Build items_details from canvas costs
      const items_details = costs.rows.map(({ pl, qty, cost }) => ({
        plant_name: pl.name,
        price_per_unit: pl.price,
        recommended_quantity: qty,
        item_total: parseFloat(cost.toFixed(2)),
      }));
      const total = parseFloat(costs.total.toFixed(2));

      const res = await api.post(`/garden_plans/${planId}/pdf_canvas`,
        { items_details, total },
        { responseType: 'blob' }
      );
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `оферта_${planMeta.name}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Грешка при генериране на PDF!');
    } finally {
      setPdfLoading(false);
    }
  };

  // History
  const pushH = (z,pl,po) => setHistory(h=>[...h.slice(-39),{zones:z,polys:pl,points:po}]);
  const undo = () => {
    if(!history.length) return;
    const last=history[history.length-1];
    setZones(last.zones); setPolys(last.polys); setPoints(last.points);
    setHistory(h=>h.slice(0,-1)); setSelected(null);
  };

  // Costs
  const costs = (()=>{
    const map={};
    const add=(pid,qty)=>{ const pl=plants.find(p=>p.id===pid); if(!pl) return; if(!map[pid]) map[pid]={pl,qty:0}; map[pid].qty=parseFloat((map[pid].qty+qty).toFixed(4)); };
    const calcQty=(pl,sqm)=>pl.kind==="zone" ? parseFloat((sqm*(pl.qsm||1)).toFixed(2)) : Math.ceil(sqm*(pl.qsm||1));
    zones.forEach(z=>{ const pl=plants.find(p=>p.id===z.plantId); if(!pl) return; const sqm=p2m(z.w,scale)*p2m(z.h,scale); add(pl.id,calcQty(pl,sqm)); });
    polys.forEach(z=>{ const pl=plants.find(p=>p.id===z.plantId); if(!pl) return; const sqm=shoelace(z.pts)/(scale*scale); add(pl.id,calcQty(pl,sqm)); });
    points.forEach(pt=>add(pt.plantId,1));
    const rows=Object.values(map).map(({pl,qty})=>({pl,qty:pl.kind==="zone"?parseFloat(qty.toFixed(2)):qty,cost:parseFloat((qty*pl.price).toFixed(2))}));
    const total=rows.reduce((s,r)=>s+r.cost,0);
    return {rows, total: parseFloat(total.toFixed(2))};
  })();

  const getSVGxy = e => {
    const svg=svgRef.current; if(!svg) return {x:0,y:0};
    const pt=svg.createSVGPoint(); pt.x=e.clientX; pt.y=e.clientY;
    const {x,y}=pt.matrixTransform(svg.getScreenCTM().inverse());
    return {x,y};
  };

  const hitTest = ({x,y}) => {
    for(const pt of [...points].reverse()){const r=PT_CFG[pt.type]?.r||14;if(Math.hypot(x-pt.cx,y-pt.cy)<r+8)return{kind:"point",id:pt.id};}
    for(const z  of [...polys].reverse()) if(inPoly(x,y,z.pts))return{kind:"poly",id:z.id};
    for(const z  of [...zones].reverse()) if(inRect(x,y,z))    return{kind:"zone",id:z.id};
    return null;
  };

  const onDown = e => {
    if(e.button!==0) return; e.preventDefault();
    const {x,y}=getSVGxy(e); const sx=snapV(x,G),sy=snapV(y,G);
    if(tool==="select"){
      const hit=hitTest({x,y}); setSelected(hit);
      if(hit){
        if(hit.kind==="zone"){ const z=zones.find(z=>z.id===hit.id); dragRef.current={...hit,startMx:x,startMy:y,origX:z.x,origY:z.y}; }
        else if(hit.kind==="poly"){ const z=polys.find(z=>z.id===hit.id); dragRef.current={...hit,startMx:x,startMy:y,origPts:z.pts.map(p=>({...p}))}; }
        else { const pt=points.find(p=>p.id===hit.id); dragRef.current={...hit,startMx:x,startMy:y,origCx:pt.cx,origCy:pt.cy}; }
      } else { dragRef.current=null; }
      return;
    }
    if(tool==="zone"){ setRectDraw({ox:sx,oy:sy,w:0,h:0}); return; }
    if(tool==="point"){
      if(!selPlant) return;
      pushH(zones,polys,points);
      setPoints(p=>[...p,{id:Date.now(),type:ptType,plantId:selPlant.id,cx:x,cy:y}]); // свободно позициониране
      return;
    }
    if(tool==="poly"){
      if(polyDraw?.pts.length>=3){
        const fp=polyDraw.pts[0];
        if(Math.hypot(sx-fp.x,sy-fp.y)<G*0.75){
          if(!selPlant) return;
          pushH(zones,polys,points);
          setPolys(p=>[...p,{id:Date.now(),type:zoneType,plantId:(zoneType==="path"||zoneType==="soil")?null:selPlant?.id||null,pts:polyDraw.pts}]);
          setPolyDraw(null); return;
        }
      }
      setPolyDraw(pd=>pd?{...pd,pts:[...pd.pts,{x:sx,y:sy}]}:{pts:[{x:sx,y:sy}],cursor:{x:sx,y:sy}});
    }
  };

  const onMove = e => {
    const {x,y}=getSVGxy(e); const sx=snapV(x,G),sy=snapV(y,G);
    if(rectDraw){ setRectDraw(d=>({...d,w:sx-d.ox,h:sy-d.oy})); return; }
    if(polyDraw){ setPolyDraw(pd=>({...pd,cursor:{x:sx,y:sy}})); }
    const dr=dragRef.current;
    if(dr&&tool==="select"){
      const dx=x-dr.startMx,dy=y-dr.startMy;
      if(dr.kind==="zone")  setZones(zs=>zs.map(z=>z.id===dr.id?{...z,x:snapV(dr.origX+dx,G),y:snapV(dr.origY+dy,G)}:z));
      else if(dr.kind==="poly") setPolys(ps=>ps.map(p=>p.id===dr.id?{...p,pts:dr.origPts.map(pt=>({x:snapV(pt.x+dx,G),y:snapV(pt.y+dy,G)}))}:p));
      else setPoints(ps=>ps.map(p=>p.id===dr.id?{...p,cx:dr.origCx+dx,cy:dr.origCy+dy}:p)); // точките се движат свободно
    }
  };

  const onUp = e => {
    if(rectDraw){
      const n=normRect(rectDraw.ox,rectDraw.oy,rectDraw.w,rectDraw.h);
      if(n.w>G*0.4&&n.h>G*0.4&&(selPlant||zoneType==="path")){ pushH(zones,polys,points); setZones(zs=>[...zs,{id:Date.now(),type:zoneType,plantId:(zoneType==="path"||zoneType==="soil")?null:selPlant?.id||null,...n}]); }
      setRectDraw(null);
    }
    dragRef.current=null;
  };

  const onDblClick = e => {
    if(tool==="poly"&&polyDraw?.pts.length>=3){
      if(!selPlant) return;
      const pts=polyDraw.pts.slice(0,-1);
      pushH(zones,polys,points);
      setPolys(p=>[...p,{id:Date.now(),type:zoneType,plantId:(zoneType==="path"||zoneType==="soil")?null:selPlant?.id||null,pts}]);
      setPolyDraw(null);
    }
  };

  const deleteSelected = () => {
    if(!selected) return;
    pushH(zones,polys,points);
    if(selected.kind==="zone")  setZones(z=>z.filter(x=>x.id!==selected.id));
    if(selected.kind==="poly")  setPolys(p=>p.filter(x=>x.id!==selected.id));
    if(selected.kind==="point") setPoints(p=>p.filter(x=>x.id!==selected.id));
    setSelected(null);
  };

  // Обект: само дървета ИЛИ само храсти според ptType; Зона трева: zone plants; Алея: без растение
  const plantList = tool==="point"
    ? plants.filter(p => p.kind === ptType)
    : zoneType === "grass"
      ? plants.filter(p => p.kind === "zone")
      : []; // алея/почва — без растение
  const budgetOk = planMeta.budget ? costs.total<=planMeta.budget : true;
  const IC=22;

  const toolBtn = id => ({
    padding:"7px 4px",borderRadius:9,cursor:"pointer",fontSize:11,
    display:"flex",flexDirection:"column",alignItems:"center",gap:2,
    border:`2px solid ${tool===id?"#16a34a":"#e5e7eb"}`,
    background:tool===id?"#dcfce7":"white",color:tool===id?"#14532d":"#6b7280",fontWeight:tool===id?700:500,
  });

  return (
    <div style={{display:"flex",height:"100%",fontFamily:"'Segoe UI',system-ui,sans-serif",background:"#f0fdf4",overflow:"hidden"}}>

      {/* LEFT */}
      <div style={{width:228,background:"white",borderRight:"1.5px solid #d1fae5",display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden"}}>
        <div style={{background:"linear-gradient(135deg,#14532d,#16a34a)",padding:"10px 14px",color:"white",flexShrink:0}}>
          <div style={{fontWeight:800,fontSize:13,display:"flex",alignItems:"center",gap:6}}><span style={{width:14,height:14,display:"inline-block"}}><IcoGrass/></span>{planMeta.name}</div>
          <div style={{fontSize:10,opacity:.8,marginTop:1}}>{planMeta.width_m}м × {planMeta.height_m}м{planMeta.budget?` · Бюджет: ${planMeta.budget} EUR`:""}</div>
        </div>

        {/* Tools */}
        <div style={{padding:"10px 10px 6px",borderBottom:"1px solid #f0fdf4",flexShrink:0}}>
          <div style={{fontSize:10,fontWeight:700,color:"#9ca3af",letterSpacing:.8,marginBottom:6}}>ИНСТРУМЕНТИ</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
            {[{id:"zone",label:"Зона",Icon:IcoZone,key:"R"},{id:"poly",label:"Полигон",Icon:IcoPoly,key:"G"},
              {id:"point",label:"Обект",Icon:IcoPoint,key:"P"},{id:"select",label:"Избор",Icon:IcoSelect,key:"S"}]
            .map(t=>(
              <button key={t.id} onClick={()=>setTool(t.id)} style={toolBtn(t.id)} title={`${t.label} (${t.key})`}>
                <span style={{width:18,height:18,display:"block",color:tool===t.id?"#16a34a":"#9ca3af"}}><t.Icon/></span>
                <span>{t.label}</span>
                <span style={{fontSize:9,opacity:.6,fontWeight:400}}>[{t.key}]</span>
              </button>
            ))}
          </div>
          {tool==="poly"&&polyDraw&&(
            <div style={{marginTop:6,padding:"5px 8px",background:"#fef3c7",borderRadius:7,fontSize:11,color:"#92400e",lineHeight:1.5}}>
              {polyDraw.pts.length} точки · {polyDraw.pts.length<3?"добави още":"двоен клик / ⬤ за край"}
            </div>
          )}
        </div>

        {/* Zone type */}
        {(tool==="zone"||tool==="poly")&&(
          <div style={{padding:"8px 10px",borderBottom:"1px solid #f0fdf4",flexShrink:0}}>
            <div style={{fontSize:10,fontWeight:700,color:"#9ca3af",letterSpacing:.8,marginBottom:5}}>ТИП ЗОНА</div>
            {Object.entries(ZONE_CFG).map(([k,s])=>(
              <div key={k} onClick={()=>{ setZoneType(k); if(k==="path"||k==="soil") setSelPlant(null); }}
                style={{display:"flex",alignItems:"center",gap:7,padding:"5px 7px",borderRadius:7,marginBottom:2,cursor:"pointer",
                  background:zoneType===k?"#dcfce7":"transparent",border:`1.5px solid ${zoneType===k?"#16a34a":"transparent"}`,transition:"all .12s"}}>
                <div style={{width:13,height:13,background:s.color,border:`2px solid ${s.border}`,borderRadius:3,flexShrink:0}}/>
                <div style={{width:14,height:14,color:s.tc,flexShrink:0}}><s.Icon/></div>
                <span style={{fontSize:11,color:"#374151"}}>{s.label}</span>
              </div>
            ))}

          </div>
        )}

        {/* Point type */}
        {tool==="point"&&(
          <div style={{padding:"8px 10px",borderBottom:"1px solid #f0fdf4",flexShrink:0}}>
            <div style={{fontSize:10,fontWeight:700,color:"#9ca3af",letterSpacing:.8,marginBottom:5}}>ТИП ОБЕКТ</div>
            {Object.entries(PT_CFG).map(([k,s])=>(
              <div key={k} onClick={()=>{ setPtType(k); setSelPlant(null); }}
                style={{display:"flex",alignItems:"center",gap:7,padding:"6px 7px",borderRadius:7,marginBottom:2,cursor:"pointer",
                  background:ptType===k?"#dcfce7":"transparent",border:`1.5px solid ${ptType===k?"#16a34a":"transparent"}`,transition:"all .12s"}}>
                <span style={{width:22,height:22,color:s.color,flexShrink:0}}><s.Icon/></span>
                <span style={{fontSize:12,color:"#374151"}}>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Plant picker */}
        {tool!=="select"&&(
          <div style={{flex:1,overflowY:"auto",padding:"8px 10px"}}>
            <div style={{fontSize:10,fontWeight:700,color:"#9ca3af",letterSpacing:.8,marginBottom:5}}>
              РАСТЕНИЕ {!plantsReady&&<span style={{color:"#d97706"}}>· зарежда…</span>}
            </div>
            {plantList.length===0&&plantsReady&&<div style={{fontSize:11,color:"#9ca3af",textAlign:"center",paddingTop:8}}>Няма налични растения</div>}
            {plantList.map(pl=>(
              <div key={pl.id} onClick={()=>setSelPlant(pl)}
                style={{padding:"7px 9px",borderRadius:8,marginBottom:3,cursor:"pointer",
                  border:`1.5px solid ${selPlant?.id===pl.id?"#16a34a":"#e5e7eb"}`,
                  background:selPlant?.id===pl.id?"#f0fdf4":"white",transition:"all .12s"}}>
                <div style={{fontSize:12,fontWeight:600,color:"#14532d"}}>{pl.name}</div>
                <div style={{fontSize:10,color:"#9ca3af",marginTop:1}}>
                  {pl.price} EUR/{pl.unit}{pl.unit==="кг"?` · ${Math.round(pl.qsm*1000)} г/кв.м.`:""}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Select actions */}
        {tool==="select"&&(
          <div style={{padding:"10px",flex:1}}>
            <div style={{fontSize:10,fontWeight:700,color:"#9ca3af",letterSpacing:.8,marginBottom:8}}>ДЕЙСТВИЯ</div>
            <button onClick={deleteSelected} disabled={!selected}
              style={{width:"100%",padding:"9px",border:"none",borderRadius:9,fontWeight:700,fontSize:12,
                cursor:selected?"pointer":"default",marginBottom:6,
                background:selected?"#fee2e2":"#f9fafb",color:selected?"#dc2626":"#d1d5db",
                display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              <span style={{width:14,height:14}}><IcoTrash/></span>Изтрий избрания
            </button>
            <button onClick={undo} disabled={!history.length}
              style={{width:"100%",padding:"9px",border:"none",borderRadius:9,fontWeight:600,fontSize:12,
                cursor:history.length?"pointer":"default",
                background:history.length?"#f3f4f6":"#f9fafb",color:history.length?"#374151":"#d1d5db",
                display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              <span style={{width:14,height:14}}><IcoUndo/></span>Undo
            </button>
            {!selected&&<div style={{color:"#9ca3af",fontSize:11,textAlign:"center",marginTop:12,lineHeight:1.6}}>Кликни елемент за избор и преместване</div>}
          </div>
        )}
      </div>

      {/* CANVAS */}
      <div ref={wrapRef} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",overflow:"auto",padding:"14px 12px",position:"relative"}}>
        {/* Toolbar */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,alignSelf:"stretch",justifyContent:"space-between"}}>
          <div style={{fontSize:11,color:"#6b7280",background:"white",padding:"5px 12px",borderRadius:20,border:"1px solid #e5e7eb",flexShrink:0}}>
            {tool==="zone"  &&"Влачи за зона · Del=изтрий · Ctrl+Z=undo · Esc=откажи"}
            {tool==="poly"  &&"Кликни точките · двоен клик / Esc за край"}
            {tool==="point" &&"Кликни за обект · Del=изтрий избран"}
            {tool==="select"&&"↖ Кликни=избор · влачи=премести · Del=изтрий · Ctrl+Z=undo"}
          </div>
          <div style={{display:"flex",gap:6,flexShrink:0,alignItems:"center"}}>
            {saveMsg&&(
              <div style={{display:"flex",alignItems:"center",gap:4,fontSize:11,fontWeight:600,
                color:saveState==="ok"?"#15803d":saveState==="error"?"#b45309":"#6b7280"}}>
                <span style={{width:13,height:13}}>{saveState==="ok"?<IcoOk/>:<IcoWarn/>}</span>
                {saveMsg}
              </div>
            )}
            <button onClick={undo} disabled={!history.length}
              style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",
                background:history.length?"white":"#f9fafb",color:history.length?"#374151":"#d1d5db",
                border:"1px solid #e5e7eb",borderRadius:20,cursor:history.length?"pointer":"default",fontSize:12,fontWeight:600}}>
              <span style={{width:12,height:12}}><IcoUndo/></span>Undo
            </button>
            <button onClick={doSave} disabled={saveState==="saving"}
              style={{display:"flex",alignItems:"center",gap:5,padding:"6px 14px",border:"none",
                borderRadius:20,cursor:saveState==="saving"?"default":"pointer",fontSize:12,fontWeight:700,
                background:saveState==="ok"?"#15803d":saveState==="error"?"#b45309":saveState==="saving"?"#9ca3af":"#16a34a",
                color:"white",transition:"background .3s"}}>
              <span style={{width:12,height:12}}><IcoSave/></span>
              {saveState==="saving"?"Запазване…":"Запази"}
            </button>
            <button onClick={doGeneratePdf} disabled={pdfLoading}
              style={{display:"flex",alignItems:"center",gap:5,padding:"6px 14px",border:"none",
                borderRadius:20,cursor:pdfLoading?"default":"pointer",fontSize:12,fontWeight:700,
                background:pdfLoading?"#9ca3af":"#d97706",color:"white"}}>
              <span style={{width:12,height:12}}><IcoPdf/></span>
              {pdfLoading?"Генериране…":"PDF Оферта"}
            </button>
          </div>
        </div>

        {/* Canvas + rulers */}
        <div style={{position:"relative",flexShrink:0}}>
          <svg width={CW+30} height={18} style={{display:"block",marginLeft:30}}>
            {Array.from({length:planMeta.width_m+1},(_,i)=>(
              <g key={i}><line x1={i*scale} y1={10} x2={i*scale} y2={18} stroke="#9ca3af" strokeWidth={1}/><text x={i*scale} y={8} fontSize={8} fill="#9ca3af" textAnchor="middle">{i}м</text></g>
            ))}
          </svg>
          <div style={{display:"flex"}}>
            <svg width={30} height={CH}>
              {Array.from({length:planMeta.height_m+1},(_,i)=>(
                <g key={i}><line x1={20} y1={i*scale} x2={30} y2={i*scale} stroke="#9ca3af" strokeWidth={1}/><text x={18} y={i*scale+4} fontSize={8} fill="#9ca3af" textAnchor="end">{i}</text></g>
              ))}
            </svg>
            <svg ref={svgRef} width={CW} height={CH}
              style={{display:"block",border:"2px solid #16a34a",borderRadius:8,background:"#fefffe",
                cursor:tool==="zone"?"crosshair":tool==="point"?"cell":tool==="poly"?"crosshair":"default",
                boxShadow:"0 6px 30px rgba(0,0,0,0.09)",userSelect:"none",touchAction:"none"}}
              onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp}
              onMouseLeave={onUp} onDoubleClick={onDblClick}>
              <defs>
                <pattern id="g1" width={scale} height={scale} patternUnits="userSpaceOnUse">
                  <path d={`M${scale} 0L0 0 0 ${scale}`} fill="none" stroke="#d1fae5" strokeWidth={.5}/>
                </pattern>
                <pattern id="g5" width={scale*5} height={scale*5} patternUnits="userSpaceOnUse">
                  <path d={`M${scale*5} 0L0 0 0 ${scale*5}`} fill="none" stroke="#bbf7d0" strokeWidth={1}/>
                </pattern>
              </defs>
              <rect width={CW} height={CH} fill="url(#g1)"/>
              <rect width={CW} height={CH} fill="url(#g5)"/>
              <rect width={CW} height={CH} fill="none" stroke="#16a34a" strokeWidth={2}/>

              {/* Ruler labels */}
              {Array.from({length:planMeta.width_m+1},(_,i)=>(
                <text key={i} x={i*scale} y={CH-3} fontSize={8} fill="#d1fae5" textAnchor="middle">{i}</text>
              ))}

              {/* Zones */}
              {zones.map(z=>{
                const zc=ZONE_CFG[z.type]||ZONE_CFG.grass, sel=selected?.kind==="zone"&&selected.id===z.id;
                const c=cRect(z), pl=plants.find(p=>p.id===z.plantId), sqm=p2m(z.w,scale)*p2m(z.h,scale);
                return (
                  <g key={z.id}>
                    <rect x={z.x} y={z.y} width={z.w} height={z.h} fill={zc.color} fillOpacity={.55}
                      stroke={sel?"#2563eb":zc.border} strokeWidth={sel?2.5:1.5} strokeDasharray={sel?"6 3":"none"} rx={3}/>
                    {z.w>38&&z.h>30&&<>
                      <foreignObject x={c.x-IC/2} y={c.y-IC-4} width={IC} height={IC} style={{pointerEvents:"none"}}>
                        <div xmlns="http://www.w3.org/1999/xhtml" style={{width:IC,height:IC,color:zc.tc}}><zc.Icon/></div>
                      </foreignObject>
                      <text x={c.x} y={c.y+13} textAnchor="middle" fontSize={9} fill="#1f2937" fontWeight="600" style={{pointerEvents:"none"}}>{pl?.name||zc.label}</text>
                      <text x={c.x} y={c.y+24} textAnchor="middle" fontSize={8} fill="#6b7280" style={{pointerEvents:"none"}}>{fmtM(sqm)} кв.м.</text>
                    </>}
                  </g>
                );
              })}

              {/* Polygons */}
              {polys.map(z=>{
                const zc=ZONE_CFG[z.type]||ZONE_CFG.grass, sel=selected?.kind==="poly"&&selected.id===z.id;
                const c=cPoly(z.pts), pl=plants.find(p=>p.id===z.plantId), sqm=shoelace(z.pts)/(scale*scale);
                return (
                  <g key={z.id}>
                    <polygon points={z.pts.map(p=>`${p.x},${p.y}`).join(" ")} fill={zc.color} fillOpacity={.55}
                      stroke={sel?"#2563eb":zc.border} strokeWidth={sel?2.5:1.5} strokeDasharray={sel?"6 3":"none"}/>
                    <foreignObject x={c.x-IC/2} y={c.y-IC-2} width={IC} height={IC} style={{pointerEvents:"none"}}>
                      <div xmlns="http://www.w3.org/1999/xhtml" style={{width:IC,height:IC,color:zc.tc}}><zc.Icon/></div>
                    </foreignObject>
                    <text x={c.x} y={c.y+15} textAnchor="middle" fontSize={9} fill="#1f2937" fontWeight="600" style={{pointerEvents:"none"}}>{pl?.name||zc.label}</text>
                    <text x={c.x} y={c.y+26} textAnchor="middle" fontSize={8} fill="#6b7280" style={{pointerEvents:"none"}}>{fmtM(sqm)} кв.м.</text>
                  </g>
                );
              })}

              {/* Points */}
              {points.map(pt=>{
                const pc=PT_CFG[pt.type]||PT_CFG.tree, sel=selected?.kind==="point"&&selected.id===pt.id;
                const pl=plants.find(p=>p.id===pt.plantId), r=pc.r;
                return (
                  <g key={pt.id}>
                    <circle cx={pt.cx} cy={pt.cy} r={r+5} fill={pc.color} fillOpacity={.1}/>
                    <circle cx={pt.cx} cy={pt.cy} r={r} fill={pc.bg}
                      stroke={sel?"#2563eb":pc.color} strokeWidth={sel?2.5:1.5} strokeDasharray={sel?"5 3":"none"}/>
                    <foreignObject x={pt.cx-r*.65} y={pt.cy-r*.65} width={r*1.3} height={r*1.3} style={{pointerEvents:"none"}}>
                      <div xmlns="http://www.w3.org/1999/xhtml" style={{width:"100%",height:"100%",color:pc.color}}><pc.Icon/></div>
                    </foreignObject>
                    <text x={pt.cx} y={pt.cy+r+12} textAnchor="middle" fontSize={9} fill="#374151" fontWeight="600" style={{pointerEvents:"none"}}>{pl?.name}</text>
                  </g>
                );
              })}

              {/* Rect draw preview */}
              {rectDraw&&(()=>{
                const n=normRect(rectDraw.ox,rectDraw.oy,rectDraw.w,rectDraw.h);
                const zc=ZONE_CFG[zoneType]||ZONE_CFG.grass;
                const wM=fmtM(p2m(n.w,scale)), hM=fmtM(p2m(n.h,scale));
                const sqm=parseFloat(wM)*parseFloat(hM);
                return <>
                  <rect x={rectDraw.ox} y={rectDraw.oy} width={rectDraw.w} height={rectDraw.h}
                    fill={zc.color} fillOpacity={.3} stroke={zc.border} strokeWidth={1.5} strokeDasharray="6 3" rx={3}/>
                  {n.w>40&&n.h>22&&<>
                    <text x={n.x+n.w/2} y={n.y+n.h/2-4} textAnchor="middle" fontSize={10} fontWeight="700" fill="#1f2937" style={{pointerEvents:"none"}}>{wM}м × {hM}м</text>
                    <text x={n.x+n.w/2} y={n.y+n.h/2+10} textAnchor="middle" fontSize={9} fill="#6b7280" style={{pointerEvents:"none"}}>{fmtM(sqm)} кв.м.</text>
                  </>}
                </>;
              })()}

              {/* Polygon draw preview */}
              {polyDraw&&(()=>{
                const zc=ZONE_CFG[zoneType]||ZONE_CFG.grass, {pts,cursor}=polyDraw, all=cursor?[...pts,cursor]:pts;
                return <>
                  {pts.length>=3&&<polygon points={all.map(p=>`${p.x},${p.y}`).join(" ")} fill={zc.color} fillOpacity={.22} stroke="none"/>}
                  {pts.length>1&&<polyline points={pts.map(p=>`${p.x},${p.y}`).join(" ")} fill="none" stroke={zc.border} strokeWidth={1.5} strokeDasharray="5 3"/>}
                  {cursor&&pts.length>0&&<line x1={pts[pts.length-1].x} y1={pts[pts.length-1].y} x2={cursor.x} y2={cursor.y} stroke={zc.border} strokeWidth={1} strokeDasharray="4 3" opacity={.6}/>}
                  {pts.map((p,i)=>(
                    <circle key={i} cx={p.x} cy={p.y} r={i===0&&pts.length>=3?8:4}
                      fill={i===0&&pts.length>=3?"#16a34a":"white"} stroke={zc.border} strokeWidth={1.5}/>
                  ))}
                </>;
              })()}
            </svg>
          </div>
        </div>
      </div>

      {/* RIGHT — COSTS */}
      <div style={{width:215,background:"white",borderLeft:"1.5px solid #d1fae5",display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden"}}>
        <div style={{padding:"12px 14px 10px",borderBottom:"1px solid #f0fdf4",flexShrink:0}}>
          <div style={{fontWeight:800,color:"#14532d",fontSize:14,display:"flex",alignItems:"center",gap:6}}><span style={{width:15,height:15,display:"inline-block"}}><IcoChart/></span>Разходи</div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"10px 14px"}}>
          {costs.rows.length===0
            ? <div style={{color:"#9ca3af",fontSize:12,textAlign:"center",paddingTop:24,lineHeight:1.8}}>Добави зони и растения за да видиш разходите</div>
            : costs.rows.map((row,i)=>{
                const {pl,qty,cost}=row;
                const Ico=pl.kind==="tree"?IcoTree:pl.kind==="shrub"?IcoShrub:IcoGrass;
                return (
                  <div key={pl.id} style={{marginBottom:11,paddingBottom:11,borderBottom:i<costs.rows.length-1?"1px solid #f0fdf4":"none"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{width:15,height:15,color:"#16a34a",flexShrink:0}}><Ico/></span>
                      <div style={{fontSize:12,fontWeight:700,color:"#14532d"}}>{pl.name}</div>
                    </div>
                    <div style={{fontSize:10,color:"#9ca3af",marginTop:3}}>{pl.unit==="кг"?fmtWeight(qty):`${pl.kind==="zone"?fmtE(qty):qty} ${pl.unit}`} × {fmtE(pl.price)} EUR/{pl.unit}</div>
                    <div style={{fontSize:14,fontWeight:800,color:"#15803d",marginTop:3}}>{fmtE(cost)} EUR</div>
                  </div>
                );
              })}
        </div>
        <div style={{padding:"11px 14px",borderTop:"2px solid #16a34a",background:"#f0fdf4",flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
            <span style={{fontWeight:700,color:"#14532d",fontSize:13}}>Общо</span>
            <span style={{fontWeight:900,color:"#15803d",fontSize:18}}>{fmtE(costs.total)} EUR</span>
          </div>
          {planMeta.budget>0&&<>
            <div style={{fontSize:10,color:"#6b7280",marginBottom:4}}>Бюджет: {planMeta.budget} EUR</div>
            <div style={{background:"#e5e7eb",borderRadius:6,height:7,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${Math.min(100,(costs.total/planMeta.budget)*100)}%`,
                background:budgetOk?"#16a34a":"#dc2626",borderRadius:6,transition:"width .4s,background .3s"}}/>
            </div>
            <div style={{marginTop:5,fontSize:11,fontWeight:600,color:budgetOk?"#16a34a":"#dc2626"}}>
              {budgetOk?`✅ Остават ${fmtE(planMeta.budget-costs.total)} EUR`:`⚠️ Надвишава с ${fmtE(costs.total-planMeta.budget)} EUR`}
            </div>
          </>}
        </div>
      </div>
    </div>
  );
}