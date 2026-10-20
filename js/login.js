(function(){
var $=function(i){return document.getElementById(i)},el=$('app');
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function msg(t){var m=$('msg');m.textContent=t;m.style.display='block'}
function loginView(){var s=DB.kv('settings');
 el.innerHTML='<div class="ctr"><h1>'+esc(s.school)+'</h1><p class="mu">Fees Ledger</p><div class="card"><div id="msg" class="al" style="display:none"></div><label>Log in as</label><select id="rl"><option value="bursar">Bursar</option><option value="admin">Admin</option></select><label>Password</label><input id="pw" type="password" autocomplete="current-password"><button class="pri" id="go" style="width:100%">Log in</button></div></div>';
 function go(){var b=$('go');b.disabled=true;Auth.login($('rl').value,$('pw').value,function(ok){if(ok)location.href='home.html';else{b.disabled=false;msg('Wrong password. Try again.')}})}
 $('go').onclick=go;$('pw').onkeydown=function(e){if(e.keyCode===13)go()}}
function setupView(){
 el.innerHTML='<div class="ctr"><h1>Fees Ledger</h1><p class="mu">First-time setup</p><div class="card"><div id="msg" class="al" style="display:none"></div><label>School name</label><input id="sn" placeholder="e.g. Your School Secondary School"><label>Admin password (6+ characters)</label><input id="ap" type="password"><label>Bursar password (6+ characters)</label><input id="bp" type="password"><button class="pri" id="go" style="width:100%">Create ledger</button></div><div class="card"><h3>Already have a backup?</h3><div class="mu">No saved records were found in this browser. Choose a backup file to restore them.</div><input id="bf" type="file" accept=".json,application/json"><button id="rs">Restore backup</button></div></div>';
 $('go').onclick=function(){var n=$('sn').value.trim(),a=$('ap').value,b=$('bp').value;
  if(!n)return msg('Enter the school name.');if(a.length<6||b.length<6)return msg('Passwords need at least 6 characters.');
  var f={};App_fees(f);var y=new Date().getFullYear();
  DB.setkv('settings',{school:n,colors:{pri:'#1b4b9b',acc:'#f28a1b'},fees:f,terms:[{id:'t1',yr:y,no:1,start:'',visit:'',end:''}],cur:'t1',rem:{on:true,every:7,last:0,sent:{}}});
  DB.setkv('counter',0);Auth.setPw('admin',a,function(){Auth.setPw('bursar',b,function(){Auth.begin('admin');location.href='home.html'})})};
 $('rs').onclick=function(){var f=$('bf').files[0];if(!f)return msg('Choose a backup file first.');var r=new FileReader();
  r.onload=function(){try{DB.importAll(JSON.parse(r.result),function(ok){if(ok)location.reload();else msg('That backup file is not valid.')})}catch(e){msg('That backup file is not valid.')}};r.readAsText(f)}}
function App_fees(f){var T={Day:[350000,350000,450000,450000,500000,500000],Boarding:[650000,650000,650000,650000,700000,700000]};
 Object.keys(T).forEach(function(k){T[k].forEach(function(a,i){f[k+'|S'+(i+1)]=a})})}
DB.init(function(){
 if(!DB.ok()){el.innerHTML='<div class="ctr"><div class="card">This browser cannot save data here. Open the ledger in Chrome (not in private mode).</div></div>';return}
 if(DB.kv('settings')&&DB.kv('users')){if(Auth.role())return location.replace('home.html');loginView()}else setupView()});
})();
                                                                        
