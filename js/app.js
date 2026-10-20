/* Shared helpers: layout, search suggestions, balances, receipts, reminders */
var App=(function(){
var A={},CLS=['S1','S2','S3','S4','S5','S6'],KIND=['Day','Boarding'],METH=['Mobile money','Bank','Cash'];
A.CLS=CLS;A.KIND=KIND;A.METH=METH;
A.$=function(id){return document.getElementById(id)};
A.esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
A.money=function(n){return 'UGX '+Math.round(+n||0).toLocaleString('en-US')};
A.pad=function(n,l){n=String(n);while(n.length<l)n='0'+n;return n};
A.uid=function(){return Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-4)};
A.today=function(){var d=new Date();return d.getFullYear()+'-'+A.pad(d.getMonth()+1,2)+'-'+A.pad(d.getDate(),2)};
A.toast=function(m){var t=A.$('toast');if(!t)return;t.textContent=m;t.style.display='block';clearTimeout(A._t);A._t=setTimeout(function(){t.style.display='none'},2800)};
A.S=function(){return DB.kv('settings')||{}};A.saveS=function(s){DB.setkv('settings',s)};
A.isAdmin=function(){return Auth.role()==='admin'};
A.log=function(a,d){DB.put('log',{id:A.uid(),ts:Date.now(),by:Auth.role(),a:a,d:String(d||'').slice(0,300)})};
A.prefix=function(name){return String(name||'').split(/\s+/).map(function(w){return w.replace(/[^A-Za-z0-9]/g,'').charAt(0)}).join('').toUpperCase()};
A.rno=function(seq){return (A.prefix(A.S().school)||'RCT')+'-'+A.pad(seq,6)};
A.term=function(){var s=A.S();return (s.terms||[]).filter(function(t){return t.id===s.cur})[0]||null};
A.fee=function(cls,kind,disc){var f=(A.S().fees||{})[kind+'|'+cls]||0;return Math.max(0,f-(+disc||0))};
A.setCharge=function(sid,tid,amt){DB.put('charges',{id:sid+'|'+tid,sid:sid,tid:tid,amt:amt})};
A.newCode=function(){var p=(A.prefix(A.S().school)||'ST').slice(0,4),c,ex=DB.get('students');do{c=p+(1000+Math.floor(Math.random()*9000))}while(ex.some(function(x){return x.code===c}));return c};
A.student=function(id){return DB.get('students').filter(function(s){return s.id===id})[0]};
A.avatar=function(s){var u=DB.photo(s.id);return u?'<img class="av" alt="" src="'+u+'">':'<span class="av">'+A.esc((s.name||'?').charAt(0).toUpperCase())+'</span>'};
/* payments clear the oldest debt first: arrears, then this term's fee */
A.balances=function(t){var tid=t?t.id:'',pr={},cu={},pd={},pt={};
 DB.get('charges').forEach(function(c){if(c.tid===tid)cu[c.sid]=(cu[c.sid]||0)+c.amt;else pr[c.sid]=(pr[c.sid]||0)+c.amt});
 DB.get('payments').forEach(function(p){if(p.status!=='ok')return;pd[p.sid]=(pd[p.sid]||0)+ +p.amt;if(p.tid===tid)pt[p.sid]=(pt[p.sid]||0)+ +p.amt});
 return DB.get('students').map(function(s){var a=pr[s.id]||0,c=cu[s.id]||0,p=pd[s.id]||0,ar=Math.max(0,a-p),cd=Math.max(0,c-Math.max(0,p-a));return {s:s,prior:a,cur:c,paid:p,pt:pt[s.id]||0,arrears:ar,curdue:cd,due:ar+cd}})};
A.bar=function(label,val,max,note){var w=max>0?Math.min(100,Math.round(val/max*100)):0;return '<div class="br"><span>'+A.esc(label)+'</span><div class="tr"><i style="width:'+w+'%"></i></div><b>'+A.money(val)+(note||'')+'</b></div>'};
A.match=function(q,list){q=q.trim().toLowerCase();if(!q)return[];var tk=q.split(/\s+/),out=[];
 list.forEach(function(s){var n=s.name.toLowerCase(),c=(s.code||'').toLowerCase(),r=-1;
  if(n.indexOf(q)===0)r=0;else if((' '+n).indexOf(' '+q)>=0)r=1;else if(c.indexOf(q)===0)r=2;else if(n.indexOf(q)>=0)r=3;else if(tk.every(function(t){return n.indexOf(t)>=0}))r=4;
  if(r>=0)out.push({s:s,r:r})});
 out.sort(function(a,b){return a.r-b.r||a.s.name.localeCompare(b.s.name)});return out.slice(0,8).map(function(x){return x.s})};
A.suggest=function(inp,pick){var box=document.createElement('div');box.className='sg';box.style.display='none';inp.parentNode.appendChild(box);
 function show(){var L=A.match(inp.value,DB.get('students').filter(function(s){return s.active!==false}));
  box.innerHTML=L.map(function(s){return '<div class="sgi" data-id="'+s.id+'"><b>'+A.esc(s.name)+'</b><span>'+s.cls+' '+s.kind+' · '+A.esc(s.code)+'</span></div>'}).join('');box.style.display=L.length?'block':'none'}
 inp.addEventListener('input',show);inp.addEventListener('focus',show);
 inp.addEventListener('keydown',function(e){if(e.keyCode===13){var f=box.querySelector('.sgi');if(f){e.preventDefault();box.style.display='none';pick(f.getAttribute('data-id'))}}});
 box.addEventListener('mousedown',function(e){var d=e.target.closest('.sgi');if(!d)return;e.preventDefault();box.style.display='none';pick(d.getAttribute('data-id'))});
 document.addEventListener('click',function(e){if(e.target!==inp)box.style.display='none'})};
A.note=function(title,body,kind){DB.put('notes',{id:A.uid(),ts:Date.now(),title:title,body:body,kind:kind||'info',read:false})};
A.unread=function(){return DB.get('notes').filter(function(n){return !n.read}).length};
A.remind=function(force){var s=A.S(),t=A.term(),R=s.rem||{on:true,every:7,last:0,sent:{}},now=Date.now(),made=false;if(!t)return false;
 R.sent=R.sent||{};
 [['visit','Visiting day'],['end','End of term']].forEach(function(k){var d=t[k[0]];if(!d)return;var key=t.id+k[0],n=Math.round((new Date(d+'T00:00:00')-new Date(A.today()+'T00:00:00'))/864e5);
  if(R.on&&!R.sent[key]&&n>=0&&n<=7){R.sent[key]=1;A.note(k[1]+(n?' in '+n+' day'+(n>1?'s':''):' is today'),'Check who still owes fees on the Reports page.','date');made=true}});
 var due=!force&&R.on&&(!t.start||A.today()>=t.start)&&now-(R.last||0)>=(R.every||7)*864e5;
 if(force||due){var rows=A.balances(t).filter(function(r){return r.s.active!==false&&r.due>0}),np=rows.filter(function(r){return r.pt===0}).length,hp=rows.length-np,tot=rows.reduce(function(a,r){return a+r.due},0);
  if(rows.length||force){A.note('Fees reminder',np+' not paid, '+hp+' part paid. Total outstanding '+A.money(tot)+'.','rem');made=true}R.last=now}
 s.rem=R;A.saveS(s);return made};
A.theme=function(){var c=A.S().colors||{},r=document.documentElement.style;if(c.pri)r.setProperty('--pri',c.pri);if(c.acc)r.setProperty('--acc',c.acc)};
A.layout=function(page){var s=A.S(),un=A.unread(),N=[['home','Home'],['students','Students'],['payments','Payments'],['receipts','Receipts'],['reports','Reports'],['notifications','Alerts'],['settings','Settings']];
 A.$('hdr').innerHTML='<div class="top"><div class="row1"><div class="brand">'+A.esc(s.school)+'<small>Fees Ledger</small></div><a class="bell" href="notifications.html" aria-label="Notifications">&#128276;'+(un?'<i class="dot">'+(un>9?'9+':un)+'</i>':'')+'</a><span class="role">'+Auth.role()+'</span><button class="lo" id="lo">Log out</button></div><div class="sw"><input id="gs" placeholder="Search a student by name..." autocomplete="off"></div><nav>'+N.map(function(n){return '<a href="'+n[0]+'.html"'+(n[0]===page?' class="on"':'')+'>'+n[1]+'</a>'}).join('')+'</nav></div>';
 A.$('lo').onclick=Auth.logout;A.suggest(A.$('gs'),function(id){location.href='payments.html?sid='+id})};
A.start=function(page,cb){DB.init(function(){
 if(!DB.ok()){document.body.innerHTML='<div class="ctr"><div class="card">This browser cannot save data here. Open the ledger in Chrome (not in private mode).</div></div>';return}
 if(!A.S().school||!DB.kv('users')||!Auth.require())return location.replace('index.html');
 A.theme();A.remind(false);A.layout(page);cb()})};
A.showReceipt=function(p){var s=A.student(p.sid)||{},t=(A.S().terms||[]).filter(function(x){return x.id===p.tid})[0]||{},r=A.balances(A.term()).filter(function(x){return x.s.id===p.sid})[0];
 var row=function(a,b){return '<div class="it"><span class="mu">'+a+'</span><b>'+b+'</b></div>'},o=document.createElement('div');o.className='ov';
 o.innerHTML='<div class="rc"><h3>'+A.esc(A.S().school)+'</h3><div class="mu" style="text-align:center">Fee receipt</div><div class="big">'+A.esc(p.receipt)+'</div>'+row('Student',A.esc(s.name)+' ('+A.esc(s.cls)+' '+A.esc(s.kind)+')')+row('Pay code',A.esc(s.code))+row('Term','Term '+(t.no||'')+', '+(t.yr||''))+row('Date',A.esc(p.date))+row('Method',A.esc(p.method))+row('Reference',A.esc(p.ref||'-'))+row('Amount paid','<span class="ok">'+A.money(p.amt)+'</span>')+(r?row('Balance now',r.due>0?A.money(r.due):'Nil'):'')+(p.status==='void'?'<div class="al">Voided: '+A.esc(p.reason)+'</div>':'')+'<div class="noprint" style="margin-top:12px"><button class="pri" id="rp">Print</button><button id="rx">Close</button></div></div>';
 document.body.appendChild(o);A.$('rx').onclick=function(){document.body.removeChild(o)};A.$('rp').onclick=function(){window.print()}};
A.shrink=function(file,cb){var fr=new FileReader();fr.onload=function(){var im=new Image();im.onload=function(){var k=Math.min(1,260/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);cb(c.toDataURL('image/jpeg',0.75))};im.onerror=function(){cb(null)};im.src=fr.result};fr.onerror=function(){cb(null)};fr.readAsDataURL(file)};
return A})();
         
