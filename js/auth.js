 /* Admin and bursar logins. This is a lock for the device, not bank-grade security. */
var Auth=(function(){
function simple(s){var h=5381,h2=7,i;for(i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;for(i=s.length-1;i>=0;i--)h2=((h2<<7)^(h2>>>3)^s.charCodeAt(i))|0;return 's'+(h>>>0).toString(16)+(h2>>>0).toString(16)}
function hex(b){return Array.prototype.map.call(new Uint8Array(b),function(x){return ('0'+x.toString(16)).slice(-2)}).join('')}
function hash(pw,salt,algo,cb){var s=salt+':'+pw;
 if(algo!=='s'&&window.crypto&&crypto.subtle&&window.TextEncoder){try{crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)).then(function(b){cb(hex(b))},function(){cb(simple(s))});return}catch(e){}}
 cb(simple(s))}
var A={
 role:function(){try{return sessionStorage.getItem('sfl_role')}catch(e){return null}},
 begin:function(r){try{sessionStorage.setItem('sfl_role',r)}catch(e){}},
 logout:function(){try{sessionStorage.removeItem('sfl_role')}catch(e){}setTimeout(function(){location.href='index.html'},250)},
 require:function(){if(!A.role()){location.replace('index.html');return false}return true},
 setPw:function(role,pw,cb){var u=DB.kv('users')||{},salt=Math.random().toString(36).slice(2);hash(pw,salt,'',function(h){u[role]={salt:salt,hash:h};DB.setkv('users',u);cb()})},
 login:function(role,pw,cb){var u=(DB.kv('users')||{})[role];if(!u)return cb(false);var a=u.hash.charAt(0)==='s'&&u.hash.length<30?'s':'';
  hash(pw,u.salt,a,function(h){if(h===u.hash){A.begin(role);cb(true)}else setTimeout(function(){cb(false)},700)})}
};
return A})();
