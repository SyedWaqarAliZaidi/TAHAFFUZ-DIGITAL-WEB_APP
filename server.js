// Tahaffuz server. Run: node server.js   (FAST=1 node server.js for short demo timers)
const wp=require('web-push'),http=require('http'),fs=require('fs'),path=require('path');
const F=process.env.FAST==='1',E=(k,a,b)=>+process.env[k]||(F?a:b);
const T={prompt:E('PROMPT',15,120),guard:E('GUARD',20,90),call:E('CALL',20,180),lost:E('LOST',12,60),stop:E('STOP',15,180),dev:250,devS:12};
let ROUTE=[[24.9150,67.0900],[24.9120,67.0950],[24.9090,67.1000],[24.9060,67.1050],[24.9030,67.1100],[24.9000,67.1150]];
const WA={id:process.env.WA_PHONE_ID,tok:process.env.WA_TOKEN},BASE=()=>process.env.PUBLIC_URL||'http://localhost:3000';
console.log(WA.id&&WA.tok?'WhatsApp alerts: ON':'WhatsApp alerts: OFF (set WA_PHONE_ID and WA_TOKEN)');
const OVM=['https://overpass-api.de/api/interpreter','https://overpass.kumi.systems/api/interpreter','https://overpass.private.coffee/api/interpreter'];
// Permanent guardians (survive restarts). Set env GUARDIANS="Ali:923001234567,Sara:923007654321" or create guardians.json: [{"n":"Ali","p":"923001234567"}]
let SEED=[];try{SEED=process.env.GUARDIANS?process.env.GUARDIANS.split(',').map(x=>{const [n,p]=x.split(':');return{n:(n||'').trim(),p:(p||'').replace(/\D/g,'')}}):JSON.parse(fs.readFileSync(path.join(__dirname,'guardians.json')))}catch{}
SEED=SEED.filter(g=>g&&g.n&&g.p).slice(0,3).map(g=>({n:String(g.n).slice(0,40),p:String(g.p).replace(/\D/g,'').slice(0,15)}));
console.log(SEED.length?'Permanent guardians: '+SEED.map(g=>g.n).join(', '):'Permanent guardians: none (see README)');
let CONTACTS=[],S,lastKey='';const G={},SUBS=[];
const DBF=path.join(__dirname,'data','db.json');fs.mkdirSync(path.dirname(DBF),{recursive:true});
let DB;try{DB=JSON.parse(fs.readFileSync(DBF))}catch{DB={guardians:[],places:[]}}
const save=()=>fs.writeFileSync(DBF,JSON.stringify(DB)),uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
let V=process.env.VAPID_PUBLIC&&process.env.VAPID_PRIVATE?{publicKey:process.env.VAPID_PUBLIC,privateKey:process.env.VAPID_PRIVATE}:null;
if(!V)try{V=JSON.parse(fs.readFileSync(path.join(__dirname,'vapid.json')))}catch{V=wp.generateVAPIDKeys();try{fs.writeFileSync(path.join(__dirname,'vapid.json'),JSON.stringify(V))}catch{}}
wp.setVapidDetails('mailto:demo@example.com',V.publicKey,V.privateKey);
const reset=()=>S={active:false,route:ROUTE,pos:null,last:0,phase:'idle',reason:'',t0:0,ack:null,duress:false,devSince:0,ref:null,pauseUntil:0,meta:{},log:[],police:null};reset();
const now=()=>Date.now()/1000,log=m=>{S.log.unshift({t:new Date().toLocaleTimeString(),m});S.log=S.log.slice(0,40)},U=()=>S.meta.user||'your loved one';
const push=(role,title,body,o={})=>SUBS.filter(s=>s.roles.includes(role)).forEach(s=>wp.sendNotification(s.sub,JSON.stringify({title,body,...o})).catch(e=>{if([404,410].includes(e.statusCode))SUBS.splice(SUBS.indexOf(s),1)}));
const link=c=>BASE()+'/guardian.html?name='+encodeURIComponent(c.n);
function waTo(c,text){if(!WA.id||!WA.tok)return;const url='https://graph.facebook.com/v20.0/'+WA.id+'/messages',h={Authorization:'Bearer '+WA.tok,'Content-Type':'application/json'},send=b=>fetch(url,{method:'POST',headers:h,body:JSON.stringify({messaging_product:'whatsapp',to:c.p,...b})});
 send({type:'text',text:{body:text}}).then(async r=>{if(r.ok)return log('WhatsApp sent to '+c.n);console.log('WhatsApp error for',c.n,await r.text());log('WhatsApp to '+c.n+' failed: they must reply to the template first');send({type:'template',template:{name:'hello_world',language:{code:'en_US'}}}).catch(()=>{})}).catch(e=>console.log('WhatsApp network error',e.message))}
const waAll=fn=>CONTACTS.forEach(c=>waTo(c,fn(c)));
function d2seg(p,a,b){const k=Math.cos(p[0]*Math.PI/180),x=q=>[(q[1]-p[1])*k*111320,(q[0]-p[0])*110540],A=x(a),B=x(b),dx=B[0]-A[0],dy=B[1]-A[1],l=dx*dx+dy*dy||1,u=Math.max(0,Math.min(1,-(A[0]*dx+A[1]*dy)/l));return Math.hypot(A[0]+u*dx,A[1]+u*dy)}
const dist=p=>Math.min(...ROUTE.slice(1).map((b,i)=>d2seg(p,ROUTE[i],b)));
const WHY={'off route':'They left their planned route and did not reply','stopped too long':'They have been stopped for a long time and did not reply','lost contact (no heartbeat)':'Their phone stopped sending updates','manual SOS':'They pressed SOS','duress PIN':'They sent a silent alert','traveller replied No':'They said they are NOT safe'};
function trig(r,p='prompt'){if(S.phase!=='idle')return;S.phase=p;S.reason=r;S.t0=now();log('Trigger: '+r)}
const go=(p,m)=>{S.phase=p;S.t0=now();log(m)};
function phaseNotify(){const p=S.phase,u=U(),why=WHY[S.reason]||S.reason,stop=S.reason==='stopped too long';
 if(p==='prompt')push('t',stop?'Everything OK?':'Are you safe?',stop?'You have been stopped for a while.':'You have left your planned route.',{actions:[{action:'yes',title:'Yes, I am safe'},{action:'no',title:'No, I need help'}],url:'/',tag:'tz-prompt'});
 if(p==='guardians'){push('g','Please check on '+u,why,{url:'/guardian.html',tag:'tz-alert'});waAll(c=>'⚠️ Please check on '+u+'. '+why+'. Live map: '+link(c))}
 if(p==='call'){push('g','Still no response: call '+u+' now','No guardian has acknowledged yet.',{url:'/guardian.html',tag:'tz-alert'});waAll(c=>'🔴 Still no response. Please call '+u+' now. Live map: '+link(c))}
 if(p==='police')push('g','Police notified (simulated)','Location and message were sent.',{url:'/guardian.html',tag:'tz-alert'})}
setInterval(()=>{if(!S.active)return;const n=now(),end=ROUTE[ROUTE.length-1];
 if(S.pos&&n-S.last<5&&d2seg(S.pos,end,end)<80)return A.end('arrived');
 if(S.phase==='idle'){if(n-S.last>T.lost)trig('lost contact (no heartbeat)','guardians');
  else if(n>S.pauseUntil&&S.pos&&dist(S.pos)>T.dev){S.devSince=S.devSince||n;if(n-S.devSince>T.devS)trig('off route')}else S.devSince=0;
  if(S.phase==='idle'&&n>S.pauseUntil&&S.ref&&n-S.ref.t>T.stop)trig('stopped too long')}
 const e=n-S.t0;
 if(S.phase==='prompt'&&e>T.prompt)go('guardians','No reply: guardians alerted');
 else if(S.phase==='guardians'&&e>T.guard)go('call','No acknowledgement: second alert and call (call is simulated)');
 else if(S.phase==='call'&&e>T.call){go('police','Escalated to police console (simulated)');S.police={at:new Date().toLocaleTimeString(),reason:S.reason,pos:S.pos}}
 const key=S.phase+S.t0;if(S.phase!=='idle'&&S.phase!=='acked'&&key!==lastKey){lastKey=key;phaseNotify()}},1000);
const clear=m=>{S.phase='idle';S.devSince=0;S.duress=false;S.pauseUntil=now()+300;if(S.ref)S.ref.t=now();log(m)};
const A={
 start(b){if(Array.isArray(b.route)&&b.route.length>1)ROUTE=b.route.filter((_,i)=>i%Math.ceil(b.route.length/300)===0);CONTACTS=(b.contacts||[]).slice(0,3);reset();lastKey='';S.route=ROUTE;S.meta=b.meta||{};S.active=true;S.pos=ROUTE[0];S.last=now();S.ref={p:ROUTE[0],t:now()};log('Journey started');
  push('t','Journey started','Your guardians have been told.',{url:'/',tag:'tz-info'});push('g',U()+' started a trip',(S.meta.from||'')+' to '+(S.meta.to||''),{url:'/guardian.html',tag:'tz-info'});
  waAll(c=>'🟢 '+U()+' has started a trip'+(S.meta.to?' to '+S.meta.to:'')+'. Track live: '+link(c))},
 hb(b){if(S.active&&b.lat){const p=[b.lat,b.lng];S.pos=p;S.last=now();if(!S.ref||d2seg(p,S.ref.p,S.ref.p)>30)S.ref={p,t:now()}}},
 sos(b){if(!S.active&&typeof b.lat==='number'){CONTACTS=(b.contacts||[]).slice(0,3);reset();lastKey='';ROUTE=[[b.lat,b.lng],[b.lat+.05,b.lng]];S.route=ROUTE;S.meta={user:b.user,phone:b.phone,from:'Emergency alert'};S.active=true;S.pos=[b.lat,b.lng];S.last=now();S.ref={p:S.pos,t:now()};log('Emergency alert started')}
  if(S.active){if(S.phase==='prompt')S.phase='idle';trig('manual SOS','guardians')}},
 ok(b){if(b.pin==='0000'){if(S.phase==='idle'||S.phase==='prompt'){S.phase='idle';S.duress=true;trig('duress PIN','guardians')}return}
  if(b.pin==='1234'&&S.phase!=='idle'&&S.phase!=='police')clear('Traveller confirmed safe: alert cancelled')},
 yes(){if(S.active&&S.phase!=='idle'&&S.phase!=='police')clear('Traveller tapped Yes, I am safe')},
 no(){if(S.active&&S.phase==='prompt'){S.reason='traveller replied No';go('guardians','Traveller tapped No: guardians alerted')}},
 detour(){clear('Traveller: different route or a stop (checks paused 5 min)')},
 ack(b){if(S.phase!=='idle'){S.ack=b.who||'A guardian';S.phase='acked';log('Guardian: '+S.ack);push('t',S.ack,'Your guardian is on it.',{url:'/',tag:'tz-info'})}},
 safe(){S.phase='idle';S.ack=null;S.police=null;S.devSince=0;S.duress=false;S.last=now();log('Guardian marked traveller safe')},
 sub(b){if(!b.sub)return;const r=b.role||'g',x=SUBS.find(s=>s.sub.endpoint===b.sub.endpoint);x?x.roles.includes(r)||x.roles.push(r):SUBS.push({sub:b.sub,roles:[r]})},
 g_add(b){if(!b.owner||!b.n||!b.p||DB.guardians.filter(g=>g.owner===b.owner).length+SEED.length>=3)return;DB.guardians.push({id:uid(),owner:b.owner,n:String(b.n).slice(0,40),p:String(b.p).replace(/\D/g,'').slice(0,15),at:Date.now()});save()},
 g_del(b){DB.guardians=DB.guardians.filter(g=>!(g.id===b.id&&g.owner===b.owner));save()},
 place_add(b){if(!b.owner||!['safe','unsafe'].includes(b.type)||typeof b.lat!=='number')return;DB.places.push({id:uid(),owner:b.owner,lat:b.lat,lng:b.lng,type:b.type,note:String(b.note||'').slice(0,80),at:Date.now()});save()},
 place_del(b){DB.places=DB.places.filter(p=>!(p.id===b.id&&p.owner===b.owner));save()},
 leave(b){delete G[b.name]},accept(b){if(b.name)G[b.name]=new Date().toLocaleTimeString()},
 end(w){if(!S.active)return;const ar=w==='arrived',u=U();log(ar?'Arrived safely':'Journey ended');push('g',u+(ar?' arrived safely':' ended the trip'),'No action needed.',{url:'/guardian.html',tag:'tz-info'});waAll(()=>'✅ '+u+(ar?' has arrived safely.':' has ended the trip.'));S.active=false;S.phase='idle'}};
const body=r=>new Promise(res=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>{try{res(JSON.parse(d||'{}'))}catch{res({})}})});
const TY={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
http.createServer(async(q,r)=>{const u=new URL(q.url,'http://x');
 if(u.pathname==='/api/state'){const s={...S,now:now(),T,G};delete s.ref;if(u.searchParams.get('role')==='t'&&S.duress)s.phase='idle';r.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});return r.end(JSON.stringify(s))}
 if(u.pathname==='/api/events'){r.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache'});
  const send=()=>{const s={...S,now:now(),T,G};delete s.ref;if(u.searchParams.get('role')==='t'&&S.duress)s.phase='idle';r.write('data: '+JSON.stringify(s)+'\n\n')};send();const i=setInterval(send,1000);q.on('close',()=>clearInterval(i));return}
 if(u.pathname==='/api/data'){const o=u.searchParams.get('owner');r.writeHead(200,{'Content-Type':'application/json'});return r.end(JSON.stringify({guardians:[...SEED.map((g,i)=>({id:'seed'+i,n:g.n,p:g.p,perm:1})),...DB.guardians.filter(g=>g.owner===o).map(({id,n,p})=>({id,n,p}))],places:DB.places.map(({owner,...p})=>({...p,mine:owner===o}))}))}
 if(u.pathname==='/api/ov'){const q=u.searchParams.get('q')||'';if(!q||q.length>3000){r.writeHead(400);return r.end('bad query')}let err='';
  for(const m of OVM){try{const x=await fetch(m,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','User-Agent':'Tahaffuz-hackathon/1.0'},body:'data='+encodeURIComponent(q),signal:AbortSignal.timeout(20000)});
   if(x.ok){const t=await x.text();r.writeHead(200,{'Content-Type':'application/json'});return r.end(t)}err+=new URL(m).host+' '+x.status+'; '}catch(e){err+=new URL(m).host+' '+e.message+'; '}}
  console.log('Overpass proxy failed:',err);r.writeHead(502,{'Content-Type':'text/plain'});return r.end(err)}
 if(u.pathname==='/api/config'){r.writeHead(200,{'Content-Type':'application/json'});return r.end(JSON.stringify({gkey:process.env.GOOGLE_MAPS_KEY||''}))}
 if(u.pathname==='/api/vapid'){r.writeHead(200,{'Content-Type':'application/json'});return r.end(JSON.stringify({key:V.publicKey}))}
 if(q.method==='POST'&&u.pathname.startsWith('/api/')){const f=A[u.pathname.slice(5)];if(!f){r.writeHead(404);return r.end()}f(await body(q));r.writeHead(200);return r.end('{}')}
 const p=path.join(__dirname,'public',u.pathname==='/'?'index.html':u.pathname);
 fs.readFile(p,(e,d)=>{if(e){r.writeHead(404);return r.end('Not found')}r.writeHead(200,{'Content-Type':TY[path.extname(p)]||'text/plain'});r.end(d)})
}).listen(+process.env.PORT||3000,'0.0.0.0',()=>console.log('Traveller: http://localhost:'+(process.env.PORT||3000)+'   Guardian: /guardian.html'));
