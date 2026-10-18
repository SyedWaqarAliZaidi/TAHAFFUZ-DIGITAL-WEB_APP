self.addEventListener('push',e=>{const d=e.data?e.data.json():{};
 e.waitUntil(self.registration.showNotification(d.title||'Tahaffuz',{body:d.body||'',tag:d.tag||'tz',renotify:true,requireInteraction:!!d.actions,actions:d.actions||[],data:{url:d.url||'/'}}))});
self.addEventListener('notificationclick',e=>{e.notification.close();if(e.action==='yes'||e.action==='no'){e.waitUntil(fetch('/api/'+e.action,{method:'POST',body:'{}'}));return}
 e.waitUntil(clients.openWindow(e.notification.data.url))});
