/* Browser database (IndexedDB). Everything saves automatically. */
var DB=(function(){
var H=null,C={students:[],payments:[],charges:[],notes:[],log:[]},KV={},PHO={};
var ST=['kv','students','payments','charges','notes','log','photos'],REC=['students','payments','charges','notes','log'];
function err(){if(window.App&&App.toast)App.toast('Could not save. Storage may be full or blocked.')}
function w(s,k,v){if(!H)return;try{var tx=H.transaction(s,'readwrite');tx.onerror=err;tx.objectStore(s).put(v,k)}catch(e){err()}}
var D={
 init:function(cb){try{var r=indexedDB.open('ledger_v2',1);r.onupgradeneeded=function(){ST.forEach(function(s){r.result.createObjectStore(s)})};r.onsuccess=function(){H=r.result;D.load(cb)};r.onerror=function(){cb()};r.onblocked=function(){cb()}}catch(e){cb()}},
 load:function(cb){var n=ST.length;C={students:[],payments:[],charges:[],notes:[],log:[]};KV={};PHO={};
  function done(){if(--n===0)cb()}
  ST.forEach(function(s){var arr=[];try{var cur=H.transaction(s).objectStore(s).openCursor();
   cur.onsuccess=function(){var c=cur.result;if(c){if(s==='kv')KV[c.key]=c.value;else if(s==='photos')PHO[c.key]=c.value;else arr.push(c.value);c['continue']()}else{if(C[s])C[s]=arr;done()}};
   cur.onerror=done}catch(e){done()}})},
 ok:function(){return !!H},get:function(s){return C[s]},kv:function(k){return KV[k]},
 setkv:function(k,v){KV[k]=v;w('kv',k,v)},
 put:function(s,rec){var a=C[s],i;for(i=0;i<a.length;i++){if(a[i].id===rec.id){a[i]=rec;break}}if(i===a.length)a.push(rec);w(s,rec.id,rec)},
 photo:function(id){return PHO[id]},setPhoto:function(id,u){PHO[id]=u;w('photos',id,u)},
 exportAll:function(){return {v:2,kv:KV,students:C.students,payments:C.payments,charges:C.charges,notes:C.notes,log:C.log,photos:PHO}},
 importAll:function(o,cb){if(!H||!o||!o.kv||!o.kv.settings)return cb(false);
  var tx=H.transaction(ST,'readwrite'),k;ST.forEach(function(s){tx.objectStore(s).clear()});
  KV=o.kv;PHO=o.photos||{};REC.forEach(function(s){C[s]=o[s]||[];C[s].forEach(function(r){tx.objectStore(s).put(r,r.id)})});
  for(k in KV)tx.objectStore('kv').put(KV[k],k);for(k in PHO)tx.objectStore('photos').put(PHO[k],k);
  tx.oncomplete=function(){cb(true)};tx.onerror=function(){cb(false)}}
};
return D})();
  
