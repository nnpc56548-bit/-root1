App.start('home',function(){var A=App,t=A.term(),rows=A.balances(t),exp=0,due=0,owing=0,tid=t?t.id:'';
 rows.forEach(function(r){if(r.s.active!==false)exp+=r.cur;due+=r.due;if(r.due>0)owing++});
 var col=DB.get('payments').filter(function(p){return p.status==='ok'&&p.tid===tid}).reduce(function(a,p){return a+ +p.amt},0),al='';
 [['visit','Visiting day'],['end','End of term']].forEach(function(k){if(!t||!t[k[0]])return;var n=Math.round((new Date(t[k[0]]+'T00:00:00')-new Date(A.today()+'T00:00:00'))/864e5);
  if(n>=0&&n<=14)al+='<div class="al"><b>'+k[1]+'</b> '+(n?'is in '+n+' day'+(n>1?'s':''):'is today')+': '+owing+' student(s) still owe '+A.money(due)+'. <a href="reports.html">See who</a></div>'});
 var N=DB.get('notes').slice().sort(function(a,b){return b.ts-a.ts}).slice(0,3);
 A.$('app').innerHTML=al+'<h2>Term '+(t?t.no+', '+t.yr:'')+'</h2><div class="kp"><div><span class="mu">Income this term</span><b class="ok">'+A.money(col)+'</b></div><div><span class="mu">Expected</span><b>'+A.money(exp)+'</b></div><div><span class="mu">Total outstanding</span><b class="bad">'+A.money(due)+'</b></div><div><span class="mu">Students owing</span><b>'+owing+'</b></div></div>'+
 '<div class="card"><a class="btn acc" href="payments.html">Record payment</a><a class="btn pri" href="students.html?add=1">Add student +</a><a class="btn" href="receipts.html">Receipts</a><a class="btn" href="reports.html">Reports</a></div>'+
 '<div class="card"><h3>Latest alerts</h3>'+(N.length?N.map(function(n){return '<div class="it"><div><b>'+(n.read?'':'<span class="bad">&#9679; </span>')+A.esc(n.title)+'</b><div class="mu">'+A.esc(n.body)+'</div></div></div>'}).join(''):'<span class="mu">No alerts yet.</span>')+'<a href="notifications.html">All alerts</a></div>'});
  
