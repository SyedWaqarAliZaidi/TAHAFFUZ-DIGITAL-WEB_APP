// Free map layer: official OpenStreetMap tiles via Leaflet. No account, key or card needed.
async function initMap(el,col){const m=L.map(el,{zoomControl:false}).setView([24.8607,67.0011],12);
 L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(m);
 const k=L.circleMarker([24.86,67.0],{radius:9,color:'#fff',weight:3,fillColor:col,fillOpacity:1}).addTo(m);let ln=null;const G={};
 return{view:(a,b,z)=>m.setView([a,b],z||14),pos:(a,b)=>k.setLatLng([a,b]),center:()=>{const c=m.getCenter();return[c.lat,c.lng]},
  line:c=>{ln&&ln.remove();ln=L.polyline(c,{color:'#00AEEF',weight:6}).addTo(m)},
  fit:c=>{const W=innerWidth>900;m.fitBounds(L.latLngBounds(c),{paddingTopLeft:[W?460:40,40],paddingBottomRight:[40,W?40:300]})},
  pins:(arr,tag)=>{G[tag]&&G[tag].remove();G[tag]=L.layerGroup(arr.map(x=>L.marker([x.lat,x.lng],{icon:L.divIcon({html:'<div class=pinm>'+x.e+'</div>',className:'',iconSize:[34,34],iconAnchor:[17,17],popupAnchor:[0,-14]})}).bindPopup(String(x.l).replace(/[<>&]/g,'')))).addTo(m)}}}

// Live feed: uses Server-Sent Events, falls back to polling if a tunnel or proxy blocks streaming.
function feed(role,fn){let got=false,poll=null;const start=()=>{if(poll)return;poll=setInterval(async()=>{try{fn(await (await fetch('/api/state?role='+role)).json())}catch{}},1500)};
 try{const es=new EventSource('/api/events?role='+role);es.onmessage=e=>{got=true;fn(JSON.parse(e.data))};es.onerror=()=>{if(!got)start()}}catch{start()}
 setTimeout(()=>{if(!got)start()},4000)}
