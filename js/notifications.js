App.start('notifications',function(){var A=App;
 A.$('app').innerHTML='<h2>Alerts</h2><div class="card"><button class="pri" id="ma">Mark all as read</button><button id="rn">Check fees now</button><div class="mu">Reminders appear here when the ledger is open. Reading an alert clears it for both the bursar and admin. Set how often in Settings.</div></div><div id="nl"></div>';
 function draw(){var L=DB.get('notes').slice().sort(function(a,b){return b.ts-a.ts}).slice(0,100);
  A.$('nl').innerHTML=L.length?L.map(function(n){return '<div class="card nt'+(n.read?'':' un')+'"><b>'+(n.read?'':'<span class="bad">&#9679; </span>')+A.esc(n.title)+'</b><div>'+A.esc(n.body)+'</div><div class="mu">'+new Date(n.ts).toLocaleString()+(n.read?' · read by '+A.esc(n.by||''):'')+'</div>'+(n.kind==='info'?'':'<a href="reports.html">Open the unpaid list</a> ')+(n.read?'':'<button data-id="'+n.id+'" style="margin-left:8px">Mark read</button>')+'</div>'}).join(''):'<div class="card mu">No alerts yet.</div>'}
 function mark(n){n.read=true;n.by=Auth.role();DB.put('notes',n)}
 A.$('nl').onclick=function(e){var b=e.target.closest('button');if(!b)return;mark(DB.get('notes').filter(function(n){return n.id===b.getAttribute('data-id')})[0]);A.layout('notifications');draw()};
 A.$('ma').onclick=function(){DB.get('notes').forEach(function(n){if(!n.read)mark(n)});A.layout('notifications');draw()};
 A.$('rn').onclick=function(){A.remind(true);A.layout('notifications');draw();A.toast('Checked.')};draw()});
