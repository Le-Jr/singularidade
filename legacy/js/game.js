(()=>{
'use strict';
const W=400,H=225,TAU=Math.PI*2;
const $=id=>document.getElementById(id);
const rnd=Math.random;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const cv=$('game'),ctx=cv.getContext('2d');
cv.width=W;cv.height=H;ctx.imageSmoothingEnabled=false;
const stage=$('stage'),wrap=$('wrap');

function fit(){
  const r=wrap.getBoundingClientRect();
  const aw=r.width, ah=r.height-20;
  const w=Math.max(200,Math.min(aw,ah*16/9));
  stage.style.width=w+'px';stage.style.height=(w*9/16)+'px';
  stage.style.setProperty('--u',(w/400)+'px');
}
addEventListener('resize',fit);fit();

/* ---------- sprites ---------- */
function mk(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function sprite(rows,pal){
  const w=Math.max(...rows.map(r=>r.length)),h=rows.length;
  const c=mk(w,h),x=c.getContext('2d');
  rows.forEach((r,j)=>{for(let i=0;i<r.length;i++){const p=pal[r[i]];if(!p)continue;x.fillStyle=p;x.fillRect(i,j,1,1);}});
  const f=mk(w,h),fx=f.getContext('2d');fx.drawImage(c,0,0);fx.globalCompositeOperation='source-in';fx.fillStyle='#fff';fx.fillRect(0,0,w,h);
  return {img:c,flash:f,w,h};
}
const SP={};
SP.player=sprite([
"....oooo....",
"...oyyyyo...",
"...yyyyyy...",
"...ywyywy...",
"...yyyyyy...",
"....yddy....",
"..yyyyyyyy..",
".yyyYYYYyyy.",
".yy.YwwY.yy.",
".yy.yYYy.yy.",
".y..yyyy..y.",
"....yyyy....",
"....yy.yy...",
"...yy...yy..",
"...yy...yy..",
"..ddd...ddd."],{o:'#fff6d6',y:'#ffd25e',Y:'#ffe9a8',d:'#c98f2a',w:'#ffffff'});
SP.soldier=sprite([
"..gggg..",
".gGGGGg.",
"..ssss..",
"..skks..",
".gggggg.",
"gggggggk",
"g.ggggkk",
"..gggg..",
"..g..g..",
".kk..kk."],{g:'#4f6b2f',G:'#6d8b3c',s:'#e0b48a',k:'#22201c'});
SP.agent=sprite([
"..hhhh..",
".hhhhhh.",
".ssssss.",
".kkkkkk.",
"..ssss..",
".bbwwbb.",
"bbbwrbbb",
"b.bbbb.b",
"..bbbb..",
"..b..b.."],{h:'#1a1a1a',s:'#d8a27e',k:'#050505',b:'#202230',w:'#e9e9e9',r:'#b0182a'});
SP.mason=sprite([
"...pp...",
"..pppp..",
".pPPPPp.",
".pPkkPp.",
".pPPPPp.",
".pppppp.",
"pppyyppp",
"pppppppp",
"pPpppPpp",
".pppppp.",
"pp.pp.pp"],{p:'#3b2350',P:'#5a3678',k:'#ff4a6a',y:'#d8b04a'});
SP.tank=sprite([
".kkkkkkkkkkkkkk.",
"kttttttttttttttk",
"kTTTTTTTTTTTTTTk",
"kTTTmmmmmmmmTTTk",
"kTTmMMMMMMMMmTTk",
"kTTmMMMMMMMMmTTk",
"kTTmMMMMMMMMmTTk",
"kTTTmmmmmmmmTTTk",
"kTTTTTTTTTTTTTTk",
"kttttttttttttttk",
".kkkkkkkkkkkkkk."],{k:'#1a1d14',t:'#2e3324',T:'#56603c',m:'#3f4a2a',M:'#6c7a47'});
SP.jet=sprite([
"......w.........",
".....ww.........",
"kk..wwww........",
"kkwwwwwwwwwwww..",
".wWWWWWWWWWWWwcc",
"kkwwwwwwwwwwww..",
"kk..wwww........",
".....ww.........",
"......w........."],{w:'#7d889c',W:'#a9b3c4',k:'#4a5262',c:'#6be0ff'});
SP.alien=sprite([
".....aaaa.....",
"....aAAAAa....",
"...aAgAAgAa...",
"..vvvvvvvvvv..",
".vVVlVVlVVlVv.",
"vvvvvvvvvvvvvv",
"..vvvvvvvvvv..",
"....l.l.l.l..."],{a:'#5be38c',A:'#9dffbf',g:'#0b2a15',v:'#5d6a7c',V:'#9aa7b8',l:'#b4ff6b'});
const HERO=[
".....hhhhhh.....",
"....hhhhhhhh....",
"....hsssssshh...",
"....seesseesh...",
"....ssssssss....",
".....ssssss.....",
"..cCCCCCCCCCCc..",
".cCCCaaaaaaCCCc.",
"cCCCCCaaaaCCCCCc",
"cCC.CCCCCCCC.CCc",
"cCC.CCCCCCCC.CCc",
"cSS.CCaaaaCC.SSc",
"c...llllllll...c",
"c...lll..lll...c",
"....lll..lll....",
"...bbbb..bbbb..."];
const BOSSES=[
 {id:0,name:'Capitão Égide',sub:'O escudo da nação',scale:2,r:12,hp:3400,
  pal:{h:'#1f5c56',s:'#d6a27a',e:'#fff',c:'#7a4a22',C:'#2f8a7e',a:'#e0b85a',S:'#e0b85a',l:'#1d4a45',b:'#6b4320'}},
 {id:1,name:'Valquíria Volt',sub:'A tempestade que pensa',scale:2,r:12,hp:3800,
  pal:{h:'#ffe14d',s:'#e8c0a0',e:'#c7f6ff',c:'#3a1f6b',C:'#7b4dff',a:'#ffe14d',S:'#b39bff',l:'#4b2c99',b:'#2b1a52'}},
 {id:2,name:'Titã Carmesim',sub:'Força sem limite',scale:3,r:18,hp:5200,
  pal:{h:'#3a0e10',s:'#c4483a',e:'#ffde59',c:'#5a1214',C:'#a8231f',a:'#ff8a3c',S:'#c4483a',l:'#5c1513',b:'#2a0a0a'}},
 {id:3,name:'Sentinela Estelar',sub:'Guardiã da órbita',scale:2,r:12,hp:4400,
  pal:{h:'#c9d3e0',s:'#c9d3e0',e:'#6bf3ff',c:'#3b4659',C:'#9aa8bd',a:'#6bf3ff',S:'#dfe7f2',l:'#5d6a80',b:'#2e3646'}}
];
BOSSES.forEach(b=>b.spr=sprite(HERO,b.pal));

const bcache={};
function bulletSprite(col,r){
  const k=col+r;if(bcache[k])return bcache[k];
  const s=Math.ceil((r+3)*2)+1,m=s/2;const c=mk(s,s),x=c.getContext('2d');
  const g=x.createRadialGradient(m,m,0,m,m,m);
  g.addColorStop(0,'#ffffff');g.addColorStop(Math.min(.85,(r*.7)/m),col);g.addColorStop(1,'rgba(0,0,0,0)');
  x.fillStyle=g;x.beginPath();x.arc(m,m,m,0,TAU);x.fill();
  return bcache[k]=c;
}
const glow=(()=>{const s=64,c=mk(s,s),x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);
  g.addColorStop(0,'rgba(255,230,150,.55)');g.addColorStop(.4,'rgba(255,190,70,.18)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,s,s);return c;})();

const ground=(()=>{
  const c=mk(W,H),g=c.getContext('2d');
  g.fillStyle='#16121e';g.fillRect(0,0,W,H);
  const n=['#1b1624','#120f19','#1e1829','#191421'];
  for(let i=0;i<5200;i++){g.fillStyle=n[rnd()*4|0];g.fillRect(rnd()*W|0,rnd()*H|0,rnd()<.2?2:1,1);}
  g.fillStyle='rgba(155,123,255,0.05)';
  for(let x=0;x<W;x+=25)g.fillRect(x,0,1,H);
  for(let y=0;y<H;y+=25)g.fillRect(0,y,W,1);
  for(let i=0;i<13;i++){
    const cx=rnd()*W,cy=rnd()*H,r=5+rnd()*15;
    g.fillStyle='#0e0b14';g.beginPath();g.ellipse(cx,cy,r,r*.6,0,0,TAU);g.fill();
    g.strokeStyle='#2c2338';g.lineWidth=1;g.beginPath();g.ellipse(cx,cy+1,r+1,r*.6+1,0,Math.PI*1.05,Math.PI*1.95);g.stroke();
  }
  g.strokeStyle='#0d0a12';
  for(let i=0;i<14;i++){let x=rnd()*W,y=rnd()*H;g.beginPath();g.moveTo(x,y);for(let k=0;k<6;k++){x+=(rnd()-.5)*18;y+=(rnd()-.5)*18;g.lineTo(x,y);}g.stroke();}
  for(let i=0;i<40;i++){g.fillStyle=rnd()<.5?'#2a2233':'#0f0c16';g.fillRect(rnd()*W|0,rnd()*H|0,2+(rnd()*3|0),2);}
  g.font='bold 22px monospace';g.fillStyle='rgba(255,210,94,0.05)';g.textAlign='center';g.fillText('ZONA DE TESTE 7',W/2,H/2+8);
  g.fillStyle='rgba(255,90,60,0.06)';for(let i=0;i<10;i++){g.fillRect(i*8,H-6,4,6);g.fillRect(W-80+i*8,0,4,6);}
  return c;
})();
const vignette=(()=>{const c=mk(W,H),x=c.getContext('2d'),g=x.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,W*.62);
  g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.6)');x.fillStyle=g;x.fillRect(0,0,W,H);return c;})();

/* ---------- audio ---------- */
let AC=null,muted=false,noiseBuf=null,beamGain=null;const lastSnd={};
function initAudio(){
  if(AC)return;
  try{
    AC=new (window.AudioContext||window.webkitAudioContext)();
    const len=AC.sampleRate*.6;noiseBuf=AC.createBuffer(1,len,AC.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<len;i++)d[i]=rnd()*2-1;
    const o=AC.createOscillator(),o2=AC.createOscillator();beamGain=AC.createGain();beamGain.gain.value=0;
    o.type='sawtooth';o.frequency.value=82;o2.type='square';o2.frequency.value=164.5;
    const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=900;
    o.connect(f);o2.connect(f);f.connect(beamGain).connect(AC.destination);o.start();o2.start();
  }catch(e){AC=null;}
}
function tone(f1,f2,dur,type,vol){const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g).connect(AC.destination);o.start(t);o.stop(t+dur+.02);}
function noise(dur,vol,freq){const t=AC.currentTime,s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=noiseBuf;f.type='lowpass';f.frequency.value=freq;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f).connect(g).connect(AC.destination);s.start(t);s.stop(t+dur);}
function snd(k){
  if(!AC||muted)return;const now=AC.currentTime;const gap={shot:.08,boom:.06,hit:.14,erasekill:.05}[k]||0;
  if(lastSnd[k]&&now-lastSnd[k]<gap)return;lastSnd[k]=now;
  switch(k){
    case 'shot':tone(880,520,.05,'square',.01);break;
    case 'boom':noise(.25,.14,900);break;
    case 'big':noise(1,.32,500);tone(120,35,.9,'sawtooth',.08);break;
    case 'erase':tone(1800,50,.7,'sawtooth',.06);noise(.5,.18,3500);break;
    case 'tp':tone(260,1500,.16,'triangle',.08);break;
    case 'hit':tone(170,70,.12,'square',.05);break;
    case 'lvl':tone(520,1040,.12,'triangle',.07);setTimeout(()=>{if(AC&&!muted)tone(780,1560,.16,'triangle',.07)},90);break;
    case 'boss':tone(110,55,1.3,'sawtooth',.09);tone(116,58,1.3,'sawtooth',.07);break;
    case 'zap':noise(.18,.2,5000);tone(1200,200,.18,'square',.04);break;
  }
}
function toggleMute(){muted=!muted;if(beamGain)beamGain.gain.value=0;showBanner(muted?'Som desligado':'Som ligado','',.9);}

/* ---------- state ---------- */
let S,running=false,paused=false,touchMode=false,queueErase=false,queueTp=false,queueTime=false,beamHeld=false,overShown=false,overT=0;
let best=0;try{best=+localStorage.getItem('singularidade_best')||0;}catch(e){}
function newGame(){
  S={t:0,score:0,kills:0,erased:0,heroes:0,lvl:1,xp:0,dmgMult:1,
    P:{x:W/2,y:H/2+20,hp:1000,max:1000,inv:0,tpCd:0,erCd:0,hurt:0,dead:false,aim:0,beaming:false,mx:0,my:0},
    enemies:[],bullets:[],shots:[],parts:[],rings:[],hazards:[],texts:[],ghosts:[],
    spawnT:1.2,nextBoss:70,bossCount:0,boss:null,shake:0,invert:0,shotT:0,threat:'',over:false,
    up:{bolts:2,beamW:1,beamDmg:1,eraseR:1,eraseCd:5,tpCd:1.8,tpBlast:36,auraR:18,auraDmg:95,regen:3,clones:0,time:0,meteor:0,phase:0},
    lv:{},choices:[],choosing:false,pendingUp:0,upDelay:0,upReason:[],
    freeze:0,tsCd:0,tsMax:16,phaseCd:0,cloneT:0,meteorT:2,strikes:[]};
}
const UPG=[
 {id:'time',name:'Parar o Tempo',power:true,max:3,desc:l=>l?'O congelamento dura +1,5 s e recarrega 2 s mais rápido.':'Tecla Q: o mundo congela por 3 s. Só você se move e ataca.'},
 {id:'clone',name:'Clones Quânticos',power:true,max:4,desc:l=>l?'Mais um clone dourado orbitando e atirando.':'Um clone seu orbita ao redor e atira sozinho no inimigo mais próximo.'},
 {id:'meteor',name:'Chuva de Estrelas',power:true,max:4,desc:l=>l?'As estrelas caem com mais frequência.':'Estrelas caem do céu sobre seus inimigos, inclusive heróis.'},
 {id:'phase',name:'Escudo de Fase',power:true,max:3,desc:l=>l?'O escudo volta 2 s mais rápido.':'Você atravessa um projétil sem dano a cada 8 s.'},
 {id:'bolts',name:'Rajada Múltipla',max:4,desc:()=>'+1 rajada de energia em cada disparo.'},
 {id:'beam',name:'Raio Ampliado',max:4,desc:()=>'Raio Cósmico mais largo e com +40% de dano.'},
 {id:'erase',name:'Horizonte de Eventos',max:4,desc:()=>'Apagar alcança 20% mais longe e recarrega 0,7 s mais rápido.'},
 {id:'tp',name:'Passo Quântico',max:3,desc:()=>'Teleporte recarrega 25% mais rápido e explode maior.'},
 {id:'aura',name:'Aura Nuclear',max:4,desc:()=>'Aura maior e +50% de dano em quem encosta.'},
 {id:'body',name:'Corpo Eterno',max:5,desc:()=>'+250 de essência máxima e cura total.'},
 {id:'regen',name:'Regeneração Cósmica',max:4,desc:()=>'+4 de essência por segundo.'}
];
function applyUp(id){
  const u=S.up,P=S.P;
  switch(id){
    case 'time':u.time++;S.tsMax=16-2*(u.time-1);break;
    case 'clone':u.clones++;break;
    case 'meteor':u.meteor++;break;
    case 'phase':u.phase++;break;
    case 'bolts':u.bolts++;break;
    case 'beam':u.beamW+=.5;u.beamDmg*=1.4;break;
    case 'erase':u.eraseR*=1.2;u.eraseCd=Math.max(2,u.eraseCd-.7);break;
    case 'tp':u.tpCd*=.75;u.tpBlast+=12;break;
    case 'aura':u.auraR+=6;u.auraDmg*=1.5;break;
    case 'body':P.max+=250;P.hp=P.max;break;
    case 'regen':u.regen+=4;break;
  }
}
function queueUp(reason,delay){S.pendingUp++;S.upReason.push(reason);S.upDelay=Math.max(S.upDelay,delay);}
function openUpgrade(){
  S.pendingUp--;const reason=S.upReason.shift()||'Evolução';
  const pool=UPG.filter(u=>(S.lv[u.id]||0)<u.max);
  if(!pool.length)return;
  for(let i=pool.length-1;i>0;i--){const j=rnd()*(i+1)|0;[pool[i],pool[j]]=[pool[j],pool[i]];}
  S.choices=pool.slice(0,3);S.choosing=true;mouse.down=false;beamHeld=false;$('mBeam').classList.remove('on');
  if(beamGain)beamGain.gain.value=0;
  $('upKick').textContent=reason;
  const list=$('upList');list.innerHTML='';
  S.choices.forEach((u,i)=>{
    const l=S.lv[u.id]||0,isNew=u.power&&!l;
    const b=document.createElement('button');b.type='button';b.className='upc';b.id='upc'+i;
    b.innerHTML='<span class="tag'+(isNew?' new':'')+'">'+(isNew?'Novo poder':'Nível '+(l+1)+' de '+u.max)+'</span><h3>'+u.name+'</h3><p>'+u.desc(l)+'</p>'+(touchMode?'':'<span class="key">Tecla '+(i+1)+'</span>');
    b.addEventListener('click',()=>chooseUp(i));list.appendChild(b);
  });
  $('upOv').hidden=false;
  try{$('upc0').focus({preventScroll:true});}catch(e){}
}
function chooseUp(i){
  if(!S.choosing)return;const u=S.choices[i];if(!u)return;
  applyUp(u.id);S.lv[u.id]=(S.lv[u.id]||0)+1;S.choosing=false;$('upOv').hidden=true;
  showBanner(u.name,u.power&&S.lv[u.id]===1?'Novo poder desbloqueado':'Nível '+S.lv[u.id],1.8);snd('lvl');
  S.P.inv=Math.max(S.P.inv,1);
}
newGame();

/* ---------- input ---------- */
const keys={};const mouse={x:W/2+60,y:H/2,down:false};let joy=null;
addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();
  if([' ','arrowup','arrowdown','arrowleft','arrowright','shift'].includes(k)&&running)e.preventDefault();
  if(!keys[k]){
    if(S.choosing){if(k==='1'||k==='2'||k==='3'){chooseUp(+k-1);e.preventDefault();}keys[k]=true;return;}
    if((k===' '||k==='e')&&running)queueErase=true;
    if((k==='shift'||k==='l')&&running)queueTp=true;
    if(k==='q'&&running)queueTime=true;
    if((k==='p'||k==='escape')&&running&&!S.over)togglePause();
    if(k==='m'){initAudio();toggleMute();}
  }
  keys[k]=true;
});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;mouse.down=false;if(running&&!S.over&&!paused&&!S.choosing)togglePause();});
function toGame(e){const r=cv.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*W,y:(e.clientY-r.top)/r.height*H};}
cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('pointerdown',e=>{
  if(e.pointerType==='touch'){
    setTouch();const p=toGame(e);
    if(p.x<W*.6&&!joy){joy={id:e.pointerId,ox:p.x,oy:p.y,x:p.x,y:p.y};cv.setPointerCapture(e.pointerId);}
    return;
  }
  const p=toGame(e);mouse.x=p.x;mouse.y=p.y;
  if(e.button===2){if(running)queueTp=true;}else mouse.down=true;
});
cv.addEventListener('pointermove',e=>{
  const p=toGame(e);
  if(joy&&e.pointerId===joy.id){joy.x=p.x;joy.y=p.y;return;}
  if(e.pointerType!=='touch'){mouse.x=p.x;mouse.y=p.y;}
});
const endPtr=e=>{if(joy&&e.pointerId===joy.id)joy=null;if(e.pointerType!=='touch'&&e.button!==2)mouse.down=false;};
cv.addEventListener('pointerup',endPtr);cv.addEventListener('pointercancel',endPtr);
function hold(el,on,off){el.addEventListener('pointerdown',e=>{e.preventDefault();on();});['pointerup','pointercancel','pointerleave'].forEach(t=>el.addEventListener(t,()=>off&&off()));}
hold($('mBeam'),()=>{beamHeld=true;$('mBeam').classList.add('on');},()=>{beamHeld=false;$('mBeam').classList.remove('on');});
hold($('mErase'),()=>{if(running)queueErase=true;});
hold($('mTp'),()=>{if(running)queueTp=true;});
hold($('mTime'),()=>{if(running)queueTime=true;});
function setTouch(){
  if(touchMode)return;touchMode=true;$('mob').hidden=false;$('powers').style.display='none';
  $('ctlDesk').hidden=true;$('ctlMob').hidden=false;
}
if(matchMedia('(pointer:coarse)').matches&&!matchMedia('(pointer:fine)').matches)setTouch();

/* ---------- helpers ---------- */
const dist=(a,b,c,d)=>Math.hypot(a-c,b-d);
function segDist(px,py,x1,y1,x2,y2){const dx=x2-x1,dy=y2-y1,l=dx*dx+dy*dy;let t=l?((px-x1)*dx+(py-y1)*dy)/l:0;t=clamp(t,0,1);return Math.hypot(px-(x1+t*dx),py-(y1+t*dy));}
const dmScale=()=>1+S.t/170;
const bScale=()=>Math.min(1.6,1+S.t/380);
function shoot(x,y,a,spd,r,col,dmg){if(S.bullets.length>950)return;S.bullets.push({x,y,vx:Math.cos(a)*spd*bScale(),vy:Math.sin(a)*spd*bScale(),r,col,dmg:dmg*dmScale()});}
function ring(x,y,n,spd,r,col,dmg,off){for(let i=0;i<n;i++)shoot(x,y,off+i*TAU/n,spd,r,col,dmg);}
function fan(x,y,a,n,spread,spd,r,col,dmg){for(let i=0;i<n;i++)shoot(x,y,a+(i-(n-1)/2)*spread,spd,r,col,dmg);}
function part(x,y,vx,vy,life,col,s,add){if(S.parts.length>1400)return;S.parts.push({x,y,vx,vy,life,max:life,col,s:s||1,add:add!==false});}
function boom(x,y,n,cols){for(let i=0;i<n;i++){const a=rnd()*TAU,v=20+rnd()*90;part(x,y,Math.cos(a)*v,Math.sin(a)*v,.3+rnd()*.5,cols[rnd()*cols.length|0],rnd()<.3?2:1);}}
function floatText(x,y,txt,col){S.texts.push({x,y,txt,col,life:1.1});}
let bannerT=0;
function showBanner(t,s,dur){$('bTitle').textContent=t;$('bSub').textContent=s||'';$('banner').classList.add('on');bannerT=dur||2.4;}

/* ---------- enemies ---------- */
const BASE={soldier:[30,10,1,4],tank:[170,40,3,7],jet:[55,20,2,6],agent:[70,25,2,4],missile:[12,6,1,3],mason:[100,35,3,5],alien:[140,50,4,7]};
const UNLOCK=[['soldier',0,8],['tank',20,3],['jet',40,3],['agent',60,3],['missile',80,3],['mason',105,2],['alien',135,2]];
function edgePoint(){const s=rnd()*4|0;return s===0?[rnd()*W,-12]:s===1?[W+12,rnd()*H]:s===2?[rnd()*W,H+12]:[-12,rnd()*H];}
function spawnEnemy(type,x,y){
  const hm=1+S.t/110,b=BASE[type];
  if(x===undefined)[x,y]=edgePoint();
  const e={type,x,y,hp:b[0]*hm,max:b[0]*hm,score:b[1],xp:b[2],r:b[3],t:0,cd:1+rnd()*1.2,cd2:3+rnd()*3,flash:0,sa:rnd()*TAU,dead:false,ang:0,burst:0,bt:0,oa:rnd()*TAU,od:rnd()<.5?1:-1};
  if(type==='jet'){const left=rnd()<.5;e.x=left?-14:W+14;e.y=18+rnd()*(H-36);e.vx=(left?1:-1)*(105+Math.min(80,S.t*.25));e.dir=left?1:-1;}
  if(type==='missile')e.ang=Math.atan2(S.P.y-e.y,S.P.x-e.x);
  if(type==='alien'){e.tx=40+rnd()*(W-80);e.ty=30+rnd()*(H-60);}
  S.enemies.push(e);return e;
}
function pickType(){
  const pool=UNLOCK.filter(u=>S.t>=u[1]);let tot=0;pool.forEach(u=>tot+=u[2]);let r=rnd()*tot;
  for(const u of pool){r-=u[2];if(r<=0)return u[0];}return 'soldier';
}
function threatName(t){
  if(t<20)return 'Exército';if(t<40)return 'Blindados';if(t<60)return 'Força Aérea';if(t<80)return 'Serviço Secreto';
  if(t<105)return 'Mísseis guiados';if(t<135)return 'Maçons';if(t<220)return 'Invasão alienígena';return 'Tudo ao mesmo tempo';
}
function keep(e,dx,dy,d,want,spd,dt){
  let k=0;if(d>want)k=1;else if(d<want-25)k=-.7;
  const px=-dy/d,py=dx/d,w=Math.sin(e.t*1.3+e.sa)*.45;
  e.x+=(dx/d*k+px*w)*spd*dt;e.y+=(dy/d*k+py*w)*spd*dt;
}
function hurt(e,amt,quiet){
  if(e.dead)return;e.hp-=amt;e.flash=.06;
  if(!quiet&&rnd()<.3)part(e.x,e.y,(rnd()-.5)*60,(rnd()-.5)*60,.2,'#ffe9a8',1);
  if(e.hp<=0)kill(e,'normal');
}
function kill(e,mode){
  if(e.dead)return;e.dead=true;S.kills++;
  S.score+=Math.round(e.score*(mode==='erase'?2:1)*(1+S.t/120));gainXp(e.xp);
  if(mode==='erase'){
    S.erased++;const sp=e.boss?e.def.spr:SP[e.type];
    const w=sp?sp.w:8,h=sp?sp.h:8;
    for(let i=0;i<22;i++)part(e.x+(rnd()-.5)*w,e.y+(rnd()-.5)*h,(rnd()-.5)*20,-15-rnd()*35,.6+rnd()*.6,rnd()<.6?'#ffffff':'#ffe9a8',1);
    snd('erasekill');
  }else{
    const cols=e.type==='alien'?['#9dffbf','#5be38c','#fff']:e.type==='mason'?['#ff4a6a','#d8b04a','#fff']:['#ffb23e','#ff5a3c','#fff3c0','#6b6b6b'];
    boom(e.x,e.y,e.boss?90:10+e.r*2,cols);snd(e.boss?'big':'boom');
    if(e.r>=6)S.shake=Math.max(S.shake,3);
  }
  if(e.boss)bossDown(e);
}
function gainXp(n){
  S.xp+=n;const need=Math.floor(20*Math.pow(S.lvl,1.35));
  if(S.xp>=need){S.xp-=need;S.lvl++;S.dmgMult*=1.13;floatText(S.P.x,S.P.y-16,'ASCENSÃO '+S.lvl,'#c9b6ff');snd('lvl');
    for(let i=0;i<24;i++){const a=i/24*TAU;part(S.P.x,S.P.y,Math.cos(a)*70,Math.sin(a)*70,.5,'#c9b6ff',1);}
    if(S.lvl%5===0)queueUp('Ascensão '+S.lvl,.4);}
}
function spawnBoss(){
  const def=BOSSES[S.bossCount%4],lvl=S.bossCount;
  const hp=def.hp*(1+lvl*.65)*(1+S.t/300);
  const e={type:'boss',boss:true,def,x:W/2,y:-30,hp,max:hp,r:def.r,score:400*(lvl+1),xp:40,t:0,cdA:1.6,cdB:3.2,sa:0,ro:0,flash:0,dead:false,charging:0,ca:0};
  S.enemies.push(e);S.boss=e;S.bossCount++;
  showBanner(def.name,def.sub+(lvl>=4?' · Nv '+(Math.floor(lvl/4)+1):''),2.8);snd('boss');
  $('bossBox').hidden=false;$('bossName').textContent=def.name;
}
function bossDown(e){
  S.boss=null;S.heroes++;const P=S.P;P.hp=Math.min(P.max,P.hp+P.max*.25);
  S.nextBoss=S.t+55;S.shake=10;$('bossBox').hidden=true;
  for(const b of S.bullets)part(b.x,b.y,0,-10,.4,'#ffe9a8',1);
  S.bullets.length=0;S.hazards.length=0;
  showBanner('Herói derrotado','+25% de essência',1.2);
  queueUp('Herói derrotado: '+e.def.name,1.1);
}

function updEnemy(e,dt){
  const P=S.P;e.t+=dt;if(e.flash>0)e.flash-=dt;
  const dx=P.x-e.x,dy=P.y-e.y,d=Math.hypot(dx,dy)||1,a=Math.atan2(dy,dx);
  switch(e.type){
    case 'soldier':
      keep(e,dx,dy,d,85,30,dt);
      if((e.cd-=dt)<=0){e.cd=1.6+rnd()*.7;shoot(e.x,e.y,a,72,2,'#ff7a3c',20);}
      break;
    case 'tank':
      keep(e,dx,dy,d,130,14,dt);
      e.ang+=Math.atan2(Math.sin(a-e.ang),Math.cos(a-e.ang))*Math.min(1,dt*2);
      if((e.cd-=dt)<=0){e.cd=2.7+rnd();fan(e.x+Math.cos(e.ang)*9,e.y+Math.sin(e.ang)*9,e.ang,3,.26,62,3,'#ffb23e',34);S.shake=Math.max(S.shake,1.5);}
      if(S.t>150&&(e.cd2-=dt)<=0){e.cd2=8+rnd()*3;spawnEnemy('missile',e.x,e.y);}
      break;
    case 'jet':
      e.x+=e.vx*dt;
      if((e.cd-=dt)<=0&&e.x>0&&e.x<W){e.cd=.2;shoot(e.x,e.y,Math.PI/2,52,2,'#ff5a3c',18);shoot(e.x,e.y,-Math.PI/2,52,2,'#ff5a3c',18);}
      if(rnd()<.6)part(e.x-e.dir*8,e.y,-e.dir*30,(rnd()-.5)*8,.3,'#ffb23e',1);
      if((e.dir>0&&e.x>W+20)||(e.dir<0&&e.x<-20))e.dead=true;
      break;
    case 'agent':{
      e.oa+=dt*.9*e.od;const tx=P.x+Math.cos(e.oa)*70,ty=P.y+Math.sin(e.oa)*70;
      const ddx=tx-e.x,ddy=ty-e.y,dd=Math.hypot(ddx,ddy)||1;e.x+=ddx/dd*Math.min(dd,66*dt*2.2)*.5;e.y+=ddy/dd*Math.min(dd,66*dt*2.2)*.5;
      if((e.cd-=dt)<=0){e.cd=2.1+rnd();e.burst=3;e.bt=0;}
      if(e.burst>0&&(e.bt-=dt)<=0){e.bt=.11;e.burst--;shoot(e.x,e.y,a,118,2,'#ff3b5c',20);}
      break;}
    case 'missile':{
      const turn=Math.atan2(Math.sin(a-e.ang),Math.cos(a-e.ang));e.ang+=clamp(turn,-2.4*dt,2.4*dt);
      const sp=82+Math.min(50,S.t*.15);e.x+=Math.cos(e.ang)*sp*dt;e.y+=Math.sin(e.ang)*sp*dt;
      part(e.x-Math.cos(e.ang)*4,e.y-Math.sin(e.ang)*4,(rnd()-.5)*10,(rnd()-.5)*10,.35,rnd()<.5?'#ffb23e':'#8a8a8a',1,true);
      if(e.t>7){e.dead=true;boom(e.x,e.y,10,['#ffb23e','#ff5a3c']);}
      if(d<e.r+4&&P.inv<=0){e.dead=true;boom(e.x,e.y,16,['#ffb23e','#ff5a3c','#fff']);damagePlayer(55*dmScale());S.shake=5;}
      break;}
    case 'mason':
      keep(e,dx,dy,d,110,18,dt);
      if((e.cd-=dt)<=0){e.cd=2.8+rnd()*.6;const n=12+Math.min(10,S.t/30|0);ring(e.x,e.y,n,46,2,'#ff4a6a',22,e.sa);e.sa+=.25;}
      break;
    case 'alien':{
      if((e.cd2-=dt)<=0||dist(e.x,e.y,e.tx,e.ty)<6){e.cd2=3;e.tx=40+rnd()*(W-80);e.ty=30+rnd()*(H-60);}
      const ddx=e.tx-e.x,ddy=e.ty-e.y,dd=Math.hypot(ddx,ddy)||1;e.x+=ddx/dd*32*dt;e.y+=ddy/dd*32*dt;
      if((e.cd-=dt)<=0){e.cd=.11;shoot(e.x,e.y,e.sa,55,2,'#9dffbf',18);e.sa+=.36;}
      break;}
    case 'boss':updBoss(e,dt,dx,dy,d,a);break;
  }
  if(e.dead)return;
  if(d<e.r+S.up.auraR)hurt(e,S.up.auraDmg*S.dmgMult*dt,true);
  if(d<e.r+4&&P.inv<=0&&e.type!=='missile')damagePlayer((e.boss?90:30)*dmScale()*dt,true);
}
function updBoss(e,dt,dx,dy,d,a){
  if(e.y<48&&e.t<3){e.y+=40*dt;return;}
  const def=e.def,col=['#7ff0e0','#d9c6ff','#ff8a3c','#6bf3ff'][def.id],dmg=26;
  if(!(e.charging>0))keep(e,dx,dy,d,85,def.id===2?24:36,dt);
  e.x=clamp(e.x,16,W-16);e.y=clamp(e.y,16,H-16);
  if(def.id===0){
    if((e.cdA-=dt)<=0){e.cdA=.95;fan(e.x,e.y,a,7,.17,86,3,col,dmg);}
    if((e.cdB-=dt)<=0&&!(e.charging>0)){e.cdB=5.2;e.charging=.85;e.ca=a;}
    if(e.charging>0){
      e.charging-=dt;e.x+=Math.cos(e.ca)*235*dt;e.y+=Math.sin(e.ca)*235*dt;
      part(e.x,e.y,(rnd()-.5)*30,(rnd()-.5)*30,.3,'#7ff0e0',2);
      if(e.charging<=0){ring(e.x,e.y,18,62,3,col,dmg,rnd());S.shake=6;snd('boom');}
    }
  }else if(def.id===1){
    e.sa+=dt*2.2;
    if((e.cdA-=dt)<=0){e.cdA=.085;for(let k=0;k<3;k++)shoot(e.x,e.y,e.sa+k*TAU/3,58,2,col,dmg*.8);}
    if((e.cdB-=dt)<=0){e.cdB=3.3;S.hazards.push({type:'laser',x:e.x,y:e.y,a,warn:.75,life:.25,fired:false});}
    if(rnd()<.4)part(e.x+(rnd()-.5)*24,e.y+(rnd()-.5)*28,0,0,.12,'#ffe14d',1);
  }else if(def.id===2){
    if((e.cdA-=dt)<=0){e.cdA=2.3;ring(e.x,e.y,22,56,3,col,dmg,e.ro);ring(e.x,e.y,22,40,3,'#ffde59',dmg,e.ro+TAU/44);e.ro+=.13;}
    if((e.cdB-=dt)<=0){e.cdB=4.8;S.hazards.push({type:'shock',x:e.x,y:e.y+12,r:4,hit:false});S.shake=8;snd('big');}
  }else{
    e.sa+=.17*dt*60*.25;
    if((e.cdA-=dt)<=0){e.cdA=.09;for(let k=0;k<4;k++)shoot(e.x,e.y,e.sa+k*TAU/4,74,2,col,dmg*.8);}
    if((e.cdB-=dt)<=0){e.cdB=3.2;for(let k=0;k<3;k++)spawnEnemy('missile',e.x+(k-1)*10,e.y);}
  }
}

/* ---------- player powers ---------- */
function damagePlayer(amt,continuous){
  const P=S.P;if(P.dead)return;
  if(!continuous&&S.up.phase>0&&S.phaseCd<=0){
    S.phaseCd=Math.max(3,8-(S.up.phase-1)*2);
    S.rings.push({x:P.x,y:P.y,t:0,dur:.3,max:22,inner:0,small:true});floatText(P.x,P.y-14,'FASE','#9be8ff');snd('tp');return;
  }
  P.hp-=amt;P.hurt=.08;
  if(!continuous){snd('hit');S.shake=Math.max(S.shake,3);}
  if(P.hp<=0){P.hp=0;die();}
}
function aimAngle(){
  const P=S.P;
  if(touchMode){
    let bestE=null,bd=1e9;for(const e of S.enemies){if(e.dead)continue;const d=dist(P.x,P.y,e.x,e.y);if(d<bd){bd=d;bestE=e;}}
    return bestE?Math.atan2(bestE.y-P.y,bestE.x-P.x):P.aim;
  }
  return Math.atan2(mouse.y-P.y,mouse.x-P.x);
}
function doErase(){
  const P=S.P;if(P.erCd>0||P.dead)return;P.erCd=S.up.eraseCd;S.invert=.09;S.shake=7;snd('erase');
  const rIn=65*S.up.eraseR,rOut=120*S.up.eraseR;
  S.rings.push({x:P.x,y:P.y,t:0,dur:.38,max:rOut,inner:rIn});
  let n=0;
  for(const e of S.enemies){
    if(e.dead)continue;const d=dist(P.x,P.y,e.x,e.y);
    if(e.boss){if(d<rOut+10)hurt(e,700*S.dmgMult);}
    else if(d<rIn){kill(e,'erase');n++;}
    else if(d<rOut)hurt(e,320*S.dmgMult);
  }
  S.bullets=S.bullets.filter(b=>{if(dist(P.x,P.y,b.x,b.y)<rOut){part(b.x,b.y,0,-12,.4,'#ffffff',1);return false;}return true;});
  if(n)floatText(P.x,P.y-20,n+' APAGADO'+(n>1?'S':''),'#ffffff');
}
function doTp(){
  const P=S.P;if(P.tpCd>0||P.dead)return;
  let a,len;
  if(touchMode){const m=Math.hypot(P.mx,P.my);a=m>.1?Math.atan2(P.my,P.mx):P.aim;len=110;}
  else{a=Math.atan2(mouse.y-P.y,mouse.x-P.x);len=Math.min(150,dist(P.x,P.y,mouse.x,mouse.y));}
  S.ghosts.push({x:P.x,y:P.y,life:.45});
  for(let i=0;i<14;i++)part(P.x,P.y,(rnd()-.5)*50,(rnd()-.5)*50,.4,'#ffe9a8',1);
  P.x=clamp(P.x+Math.cos(a)*len,8,W-8);P.y=clamp(P.y+Math.sin(a)*len,10,H-10);
  P.inv=.45;P.tpCd=S.up.tpCd;snd('tp');
  const bl=S.up.tpBlast;
  S.rings.push({x:P.x,y:P.y,t:0,dur:.25,max:bl,inner:0,small:true});
  for(const e of S.enemies)if(!e.dead&&dist(P.x,P.y,e.x,e.y)<bl+e.r)hurt(e,160*S.dmgMult);
  S.bullets=S.bullets.filter(b=>dist(P.x,P.y,b.x,b.y)>bl*.6);
}
function doTime(){
  if(S.up.time<=0||S.tsCd>0||S.P.dead)return;
  S.freeze=1.5+1.5*S.up.time;S.tsCd=S.tsMax;S.invert=.06;snd('boss');
  S.rings.push({x:S.P.x,y:S.P.y,t:0,dur:.5,max:260,inner:0,small:true});
  showBanner('Tempo parado','',1);
}
function clonePos(i){const n=S.up.clones,a=S.t*1.6+i*TAU/n;return [S.P.x+Math.cos(a)*24,S.P.y+Math.sin(a)*16];}
function nearestEnemy(x,y){let b=null,bd=1e9;for(const e of S.enemies){if(e.dead)continue;const d=dist(x,y,e.x,e.y);if(d<bd){bd=d;b=e;}}return b;}
function die(){
  const P=S.P;P.dead=true;S.over=true;overT=1.5;S.shake=12;snd('big');
  for(let i=0;i<120;i++){const a=rnd()*TAU,v=10+rnd()*120;part(P.x,P.y,Math.cos(a)*v,Math.sin(a)*v,.6+rnd()*1.2,rnd()<.5?'#ffd25e':'#ffffff',rnd()<.3?2:1);}
  if(beamGain)beamGain.gain.value=0;
}

/* ---------- update ---------- */
function update(dt){
  const P=S.P;
  if(bannerT>0&&(bannerT-=dt)<=0)$('banner').classList.remove('on');
  for(const t of S.texts){t.life-=dt;t.y-=14*dt;}S.texts=S.texts.filter(t=>t.life>0);
  for(const p of S.parts){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.96;p.vy*=.96;}S.parts=S.parts.filter(p=>p.life>0);
  for(const r of S.rings)r.t+=dt;S.rings=S.rings.filter(r=>r.t<r.dur);
  for(const g of S.ghosts)g.life-=dt;S.ghosts=S.ghosts.filter(g=>g.life>0);
  S.shake=Math.max(0,S.shake-dt*25);S.invert=Math.max(0,S.invert-dt);

  if(S.over){
    for(const b of S.bullets){b.x+=b.vx*dt;b.y+=b.vy*dt;}
    if(overT>0&&(overT-=dt)<=0)showOver();
    return;
  }
  if(S.pendingUp>0&&(S.upDelay-=dt)<=0){openUpgrade();return;}
  S.t+=dt;

  // threat tiers
  const th=threatName(S.t);if(th!==S.threat){if(S.threat)showBanner('Nova ameaça',th,2);S.threat=th;$('threatTxt').textContent=th;}

  // movement
  let mx=((keys.d||keys.arrowright)?1:0)-((keys.a||keys.arrowleft)?1:0);
  let my=((keys.s||keys.arrowdown)?1:0)-((keys.w||keys.arrowup)?1:0);
  if(joy){mx=(joy.x-joy.ox)/28;my=(joy.y-joy.oy)/28;}
  const m=Math.hypot(mx,my);if(m>1){mx/=m;my/=m;}
  P.mx=mx;P.my=my;
  P.beaming=mouse.down||keys.j||beamHeld;
  const spd=115*(P.beaming?.55:1);
  P.x=clamp(P.x+mx*spd*dt,8,W-8);P.y=clamp(P.y+my*spd*dt,10,H-10);
  P.aim=aimAngle();
  P.inv=Math.max(0,P.inv-dt);P.hurt=Math.max(0,P.hurt-dt);P.tpCd=Math.max(0,P.tpCd-dt);P.erCd=Math.max(0,P.erCd-dt);
  P.hp=Math.min(P.max,P.hp+S.up.regen*dt);
  S.tsCd=Math.max(0,S.tsCd-dt);S.phaseCd=Math.max(0,S.phaseCd-dt);
  if(queueErase){queueErase=false;doErase();}
  if(queueTp){queueTp=false;doTp();}
  if(queueTime){queueTime=false;doTime();}

  // clones
  if(S.up.clones>0&&(S.cloneT-=dt)<=0){
    S.cloneT=.24;
    for(let i=0;i<S.up.clones;i++){const [cx,cy]=clonePos(i),t=nearestEnemy(cx,cy);if(!t)break;
      const a=Math.atan2(t.y-cy,t.x-cx);S.shots.push({x:cx,y:cy,vx:Math.cos(a)*300,vy:Math.sin(a)*300,life:1.2,dmg:6*S.dmgMult});}
  }
  // falling stars
  if(S.up.meteor>0&&(S.meteorT-=dt)<=0){
    S.meteorT=Math.max(.8,3.4-S.up.meteor*.65);
    const alive=S.enemies.filter(e=>!e.dead);
    if(alive.length){const e=alive[rnd()*alive.length|0];S.strikes.push({x:e.x,y:e.y,t:.45});}
  }
  for(const s of S.strikes){
    s.t-=dt;
    if(s.t<=0&&!s.done){s.done=true;S.shake=Math.max(S.shake,4);snd('boom');
      boom(s.x,s.y,26,['#fff6d6','#ffd25e','#9be8ff']);
      for(const e of S.enemies)if(!e.dead&&dist(s.x,s.y,e.x,e.y)<22+e.r)hurt(e,260*S.dmgMult);
      S.bullets=S.bullets.filter(b=>dist(s.x,s.y,b.x,b.y)>22);}
  }
  S.strikes=S.strikes.filter(s=>!s.done);

  // attacks
  const ca=Math.cos(P.aim),sa=Math.sin(P.aim);
  if(!P.beaming){
    if((S.shotT-=dt)<=0){S.shotT=.085;
      const nb=S.up.bolts;
      for(let bi=0;bi<nb;bi++){const o=(bi-(nb-1)/2)*.12;const a=P.aim+o+(rnd()-.5)*.04;S.shots.push({x:P.x+ca*6,y:P.y+sa*6,vx:Math.cos(a)*330,vy:Math.sin(a)*330,life:1.3,dmg:7*S.dmgMult});}
      snd('shot');}
    if(beamGain)beamGain.gain.value=0;
  }else{
    const x2=P.x+ca*480,y2=P.y+sa*480;
    for(const e of S.enemies){if(!e.dead&&segDist(e.x,e.y,P.x,P.y,x2,y2)<e.r+4*S.up.beamW){hurt(e,170*S.up.beamDmg*S.dmgMult*dt,true);if(rnd()<.25)part(e.x,e.y,(rnd()-.5)*50,(rnd()-.5)*50,.25,'#fff3c0',1);}}
    S.bullets=S.bullets.filter(b=>{if(segDist(b.x,b.y,P.x,P.y,x2,y2)<5*S.up.beamW){if(rnd()<.5)part(b.x,b.y,(rnd()-.5)*30,(rnd()-.5)*30,.2,'#ffe9a8',1);return false;}return true;});
    if(rnd()<.7){const k=rnd()*300;part(P.x+ca*k,P.y+sa*k,(rnd()-.5)*20,(rnd()-.5)*20,.25,'#ffd25e',1);}
    if(beamGain&&!muted)beamGain.gain.value=.025;
  }

  // shots
  for(const s of S.shots){
    s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;
    if(s.x<-5||s.x>W+5||s.y<-5||s.y>H+5)s.life=0;
    if(s.life<=0)continue;
    for(const e of S.enemies){if(!e.dead&&Math.abs(e.x-s.x)<e.r+3&&Math.abs(e.y-s.y)<e.r+3){hurt(e,s.dmg);s.life=0;break;}}
  }
  S.shots=S.shots.filter(s=>s.life>0);

  // time stop: the world waits, only Omega acts
  if(S.freeze>0){
    S.freeze-=dt;
    for(const e of S.enemies)if(e.flash>0)e.flash-=dt;
    S.enemies=S.enemies.filter(e=>!e.dead);
    if(S.freeze<=0)snd('tp');
    return;
  }

  // spawns
  if(!S.boss&&S.t>=S.nextBoss)spawnBoss();
  if((S.spawnT-=dt)<=0){
    S.spawnT=Math.max(.13,1.1-S.t*.0055)*(S.boss?2.3:1);
    const type=pickType();
    if(type==='soldier'&&S.t>25){const [x,y]=edgePoint();for(let i=0;i<3;i++)spawnEnemy('soldier',x+(rnd()-.5)*20,y+(rnd()-.5)*20);}
    else spawnEnemy(type);
  }

  for(const e of S.enemies)if(!e.dead)updEnemy(e,dt);
  S.enemies=S.enemies.filter(e=>!e.dead);

  // hazards
  for(const h of S.hazards){
    if(h.type==='laser'){
      if(h.warn>0){h.warn-=dt;if(h.warn<=0){snd('zap');S.shake=Math.max(S.shake,4);
        if(P.inv<=0&&segDist(P.x,P.y,h.x,h.y,h.x+Math.cos(h.a)*500,h.y+Math.sin(h.a)*500)<7)damagePlayer(62*dmScale());}}
      else h.life-=dt;
    }else{
      h.r+=135*dt;
      if(!h.hit&&P.inv<=0&&Math.abs(dist(P.x,P.y,h.x,h.y)-h.r)<5){h.hit=true;damagePlayer(70*dmScale());}
      if(h.r>300)h.life=-1;
    }
  }
  S.hazards=S.hazards.filter(h=>h.type==='laser'?h.life>0:h.life!==-1);

  // bullets
  for(const b of S.bullets){
    b.x+=b.vx*dt;b.y+=b.vy*dt;
    if(b.x<-10||b.x>W+10||b.y<-10||b.y>H+10){b.dead=true;continue;}
    if(!P.dead&&P.inv<=0&&Math.abs(b.x-P.x)<b.r+3&&Math.abs(b.y-P.y)<b.r+3&&dist(b.x,b.y,P.x,P.y)<b.r+2.5){
      b.dead=true;damagePlayer(b.dmg);for(let i=0;i<5;i++)part(b.x,b.y,(rnd()-.5)*60,(rnd()-.5)*60,.25,b.col,1);
    }
  }
  S.bullets=S.bullets.filter(b=>!b.dead);
}

/* ---------- draw ---------- */
function drawSprite(sp,x,y,flash,scale,flip){
  const s=scale||1,img=flash?sp.flash:sp.img,w=sp.w*s,h=sp.h*s;
  if(flip){ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(-1,1);ctx.drawImage(img,-w/2|0,-h/2|0,w,h);ctx.restore();}
  else ctx.drawImage(img,Math.round(x-w/2),Math.round(y-h/2),w,h);
}
function drawEnemy(e){
  const fl=e.flash>0;
  if(e.type==='missile'){
    ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.ang);
    ctx.fillStyle='#9aa0a8';ctx.fillRect(-4,-1,7,2);ctx.fillStyle='#ff3b3b';ctx.fillRect(3,-1,2,2);ctx.fillStyle='#5a5f66';ctx.fillRect(-4,-2,2,4);
    ctx.restore();return;
  }
  if(e.boss){
    const def=e.def,sc=def.scale,bob=Math.sin(e.t*3)*1.5;
    ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.35;
    const gc=['#2f8a7e','#7b4dff','#a8231f','#6bf3ff'][def.id];
    ctx.fillStyle=gc;ctx.beginPath();ctx.arc(e.x,e.y,def.r+6+Math.sin(e.t*5)*2,0,TAU);ctx.fill();
    ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
    drawSprite(def.spr,e.x,e.y+bob,fl,sc);
    if(def.id===0){
      const a=Math.atan2(S.P.y-e.y,S.P.x-e.x),sx=e.x+Math.cos(a)*12,sy=e.y+bob+Math.sin(a)*12+4;
      ctx.fillStyle=fl?'#fff':'#6b4320';ctx.beginPath();ctx.arc(sx,sy,8,0,TAU);ctx.fill();
      ctx.fillStyle=fl?'#fff':'#e0b85a';ctx.beginPath();ctx.arc(sx,sy,6,0,TAU);ctx.fill();
      ctx.fillStyle=fl?'#fff':'#2f8a7e';ctx.beginPath();ctx.arc(sx,sy,3.5,0,TAU);ctx.fill();
      ctx.fillStyle='#fff6d6';ctx.fillRect(Math.round(sx)-1,Math.round(sy)-1,2,2);
    }
    if(def.id===3){ctx.fillStyle='rgba(107,243,255,'+(.6+Math.sin(e.t*8)*.3)+')';ctx.fillRect(Math.round(e.x-6),Math.round(e.y+bob-10),12,2);}
    return;
  }
  const sp=SP[e.type];
  if(e.type==='jet')drawSprite(sp,e.x,e.y,fl,1,e.dir<0);
  else drawSprite(sp,e.x,e.y+(e.type==='alien'?Math.sin(e.t*4):0),fl);
  if(e.type==='tank'){
    ctx.strokeStyle=fl?'#fff':'#262b1c';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x+Math.cos(e.ang)*11,e.y+Math.sin(e.ang)*11);ctx.stroke();
    ctx.strokeStyle=fl?'#fff':'#7d8c55';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x+Math.cos(e.ang)*11,e.y+Math.sin(e.ang)*11);ctx.stroke();
  }
  if(e.type==='alien'&&rnd()<.5){ctx.fillStyle='rgba(180,255,107,.25)';ctx.fillRect(Math.round(e.x-4),Math.round(e.y+4),8,6);}
  if(e.hp<e.max&&e.max>=60){const w=12;ctx.fillStyle='#000';ctx.fillRect(Math.round(e.x-w/2),Math.round(e.y-e.r-5),w,2);ctx.fillStyle='#ff5a3c';ctx.fillRect(Math.round(e.x-w/2),Math.round(e.y-e.r-5),Math.max(0,w*e.hp/e.max)|0,2);}
}
function drawPlayer(t){
  const P=S.P;if(P.dead)return;
  const bob=Math.sin(t*2.4)*1.5;
  ctx.globalCompositeOperation='lighter';
  const gs=58+Math.sin(t*4)*4;ctx.globalAlpha=.9;ctx.drawImage(glow,P.x-gs/2,P.y-gs/2+bob,gs,gs);ctx.globalAlpha=1;
  // aura ring
  ctx.strokeStyle='rgba(255,210,94,'+(.18+Math.sin(t*6)*.08)+')';ctx.lineWidth=1;ctx.beginPath();ctx.arc(P.x,P.y+bob,S.up.auraR+Math.sin(t*3)*1,0,TAU);ctx.stroke();
  if(S.up.phase>0&&S.phaseCd<=0){ctx.strokeStyle='rgba(155,232,255,'+(.35+Math.sin(t*9)*.15)+')';ctx.beginPath();ctx.arc(P.x,P.y+bob,10,0,TAU);ctx.stroke();}
  // orbiting motes
  for(let i=0;i<4;i++){const a=t*2+i*TAU/4;ctx.fillStyle=i%2?'#fff6d6':'#ffd25e';ctx.fillRect(Math.round(P.x+Math.cos(a)*14),Math.round(P.y+bob+Math.sin(a)*7),1,1);}
  ctx.globalCompositeOperation='source-over';
  if(P.inv>0&&((t*20)|0)%2)ctx.globalAlpha=.45;
  drawSprite(SP.player,P.x,P.y+bob,P.hurt>0);
  ctx.globalAlpha=1;
}
function draw(t){
  const sh=S.shake;
  ctx.setTransform(1,0,0,1,Math.round((rnd()-.5)*sh),Math.round((rnd()-.5)*sh));
  ctx.drawImage(ground,0,0);
  // hazards
  for(const h of S.hazards){
    if(h.type==='laser'){
      const x2=h.x+Math.cos(h.a)*500,y2=h.y+Math.sin(h.a)*500;
      if(h.warn>0){ctx.strokeStyle='rgba(255,225,77,'+(((t*20)|0)%2?.55:.2)+')';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(h.x,h.y);ctx.lineTo(x2,y2);ctx.stroke();}
      else{ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(200,170,255,.5)';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(h.x,h.y);ctx.lineTo(x2,y2);ctx.stroke();
        ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(h.x,h.y);
        for(let k=1;k<=12;k++){const f=k/12;ctx.lineTo(h.x+(x2-h.x)*f+(rnd()-.5)*6,h.y+(y2-h.y)*f+(rnd()-.5)*6);}ctx.stroke();ctx.globalCompositeOperation='source-over';}
    }else{
      ctx.strokeStyle='rgba(255,138,60,.8)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(h.x,h.y,h.r,0,TAU);ctx.stroke();
      ctx.strokeStyle='rgba(255,222,89,.4)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(h.x,h.y,h.r-4,0,TAU);ctx.stroke();
    }
  }
  for(const e of S.enemies)drawEnemy(e);
  // ghosts
  for(const g of S.ghosts){ctx.globalAlpha=g.life/.45*.6;drawSprite(SP.player,g.x,g.y,true);}ctx.globalAlpha=1;
  ctx.globalCompositeOperation='lighter';
  // player shots
  const ss=bulletSprite('#ffd25e',1);
  for(const s of S.shots)ctx.drawImage(ss,s.x-ss.width/2,s.y-ss.width/2);
  // enemy bullets
  for(const b of S.bullets){const bs=bulletSprite(b.col,b.r);ctx.drawImage(bs,b.x-bs.width/2,b.y-bs.width/2);}
  // beam
  const P=S.P;
  if(running&&!S.over&&P.beaming){
    const ca=Math.cos(P.aim),sa=Math.sin(P.aim),x1=P.x+ca*6,y1=P.y+sa*6,x2=P.x+ca*480,y2=P.y+sa*480,wob=Math.sin(t*40)*1.5;
    const bw=S.up.beamW;
    ctx.strokeStyle='rgba(255,170,50,.28)';ctx.lineWidth=(11+wob)*bw;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    ctx.strokeStyle='rgba(255,220,120,.6)';ctx.lineWidth=5*bw;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    ctx.strokeStyle='#fffbe8';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    ctx.fillStyle='rgba(255,240,200,.8)';ctx.beginPath();ctx.arc(x1,y1,4+wob,0,TAU);ctx.fill();
  }
  for(const p of S.parts)if(p.add){ctx.globalAlpha=Math.min(1,p.life/p.max*1.5);ctx.fillStyle=p.col;ctx.fillRect(Math.round(p.x),Math.round(p.y),p.s,p.s);}
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  for(const p of S.parts)if(!p.add){ctx.globalAlpha=p.life/p.max;ctx.fillStyle=p.col;ctx.fillRect(Math.round(p.x),Math.round(p.y),p.s,p.s);}
  ctx.globalAlpha=1;
  // falling stars
  for(const s of S.strikes){
    const k=1-s.t/.45;
    ctx.strokeStyle='rgba(155,232,255,'+(.3+k*.5)+')';ctx.lineWidth=1;ctx.beginPath();ctx.arc(s.x,s.y,22*(1-k*.5),0,TAU);ctx.stroke();
    ctx.globalCompositeOperation='lighter';
    const sy=s.y-140*(1-k),sx=s.x-60*(1-k);
    ctx.strokeStyle='rgba(255,246,214,.7)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(sx-24,sy-56);ctx.lineTo(sx,sy);ctx.stroke();
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(sx,sy,3,0,TAU);ctx.fill();
    ctx.globalCompositeOperation='source-over';
  }
  // frozen world loses its color, Omega keeps his
  if(S.freeze>0){
    ctx.globalCompositeOperation='saturation';ctx.fillStyle='rgba(128,128,128,.85)';ctx.fillRect(-10,-10,W+20,H+20);
    ctx.globalCompositeOperation='source-over';ctx.fillStyle='rgba(90,140,255,.10)';ctx.fillRect(-10,-10,W+20,H+20);
  }
  // clones
  if(running&&!S.P.dead){
    for(let i=0;i<S.up.clones;i++){const [cx,cy]=clonePos(i);
      ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.5;ctx.drawImage(glow,cx-14,cy-14,28,28);
      ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.75;drawSprite(SP.player,cx,cy,false);}
    ctx.globalAlpha=1;
  }
  drawPlayer(t);
  // rings
  for(const r of S.rings){
    const k=r.t/r.dur,rad=r.max*Math.pow(k,.6);
    ctx.globalCompositeOperation='lighter';
    if(!r.small){ctx.fillStyle='rgba(255,255,255,'+(.25*(1-k))+')';ctx.beginPath();ctx.arc(r.x,r.y,Math.min(rad,r.inner),0,TAU);ctx.fill();}
    ctx.strokeStyle='rgba(255,230,160,'+(1-k)+')';ctx.lineWidth=r.small?2:3;ctx.beginPath();ctx.arc(r.x,r.y,rad,0,TAU);ctx.stroke();
    ctx.globalCompositeOperation='source-over';
  }
  // texts
  ctx.font='8px Silkscreen, monospace';ctx.textAlign='center';
  for(const tx of S.texts){ctx.globalAlpha=Math.min(1,tx.life*2);ctx.fillStyle='#000';ctx.fillText(tx.txt,Math.round(tx.x)+1,Math.round(tx.y)+1);ctx.fillStyle=tx.col;ctx.fillText(tx.txt,Math.round(tx.x),Math.round(tx.y));}
  ctx.globalAlpha=1;
  // joystick
  if(joy){ctx.strokeStyle='rgba(255,210,94,.35)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(joy.ox,joy.oy,28,0,TAU);ctx.stroke();
    const jx=joy.ox+clamp(joy.x-joy.ox,-28,28),jy=joy.oy+clamp(joy.y-joy.oy,-28,28);ctx.fillStyle='rgba(255,210,94,.4)';ctx.beginPath();ctx.arc(jx,jy,9,0,TAU);ctx.fill();}
  // crosshair
  if(!touchMode&&running&&!S.over){ctx.fillStyle='rgba(255,246,214,.85)';const mx=Math.round(mouse.x),my=Math.round(mouse.y);
    ctx.fillRect(mx-4,my,3,1);ctx.fillRect(mx+2,my,3,1);ctx.fillRect(mx,my-4,1,3);ctx.fillRect(mx,my+2,1,3);}
  ctx.setTransform(1,0,0,1,0,0);
  ctx.drawImage(vignette,0,0);
  if(P.hurt>0&&!P.dead){ctx.fillStyle='rgba(255,40,40,.12)';ctx.fillRect(0,0,W,H);}
  if(S.invert>0){ctx.globalCompositeOperation='difference';ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='source-over';}
}

/* ---------- HUD ---------- */
const fmtT=s=>{s=Math.floor(s);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');};
function hud(){
  const P=S.P;
  $('hpBar').style.width=(P.hp/P.max*100)+'%';$('hpTxt').textContent=Math.ceil(P.hp);
  $('lvlTxt').textContent='Nv '+S.lvl;$('xpBar').style.width=Math.min(100,S.xp/Math.floor(20*Math.pow(S.lvl,1.35))*100)+'%';
  $('time').textContent=fmtT(S.t);$('scoreTxt').textContent=S.score.toLocaleString('pt-BR');$('killTxt').textContent=S.kills;
  if(S.boss)$('bossBar').style.width=Math.max(0,S.boss.hp/S.boss.max*100)+'%';
  $('cdErase').style.transform='scaleX('+(P.erCd/S.up.eraseCd)+')';$('pwErase').classList.toggle('wait',P.erCd>0);
  $('cdTp').style.transform='scaleX('+(P.tpCd/S.up.tpCd)+')';$('pwTp').classList.toggle('wait',P.tpCd>0);
  const hasT=S.up.time>0;
  $('pwTime').hidden=!hasT;$('mTime').hidden=!hasT;
  if(hasT){$('cdTime').style.transform='scaleX('+(S.tsCd/S.tsMax)+')';$('pwTime').classList.toggle('wait',S.tsCd>0);}
  if(touchMode){$('mErase').style.opacity=P.erCd>0?.45:1;$('mTp').style.opacity=P.tpCd>0?.45:1;$('mTime').style.opacity=S.tsCd>0?.45:1;}
}

/* ---------- flow ---------- */
function setBest(){const t=best?'Recorde: '+best.toLocaleString('pt-BR')+' pontos':'';$('bestTxt').textContent=t;$('bestTxt2').textContent=t;}
setBest();
function start(){
  initAudio();if(AC&&AC.state==='suspended')AC.resume();
  newGame();running=true;paused=false;overShown=false;
  ['menu','overOv','pauseOv','upOv'].forEach(id=>$(id).hidden=true);$('bossBox').hidden=true;
  $('threatTxt').textContent=threatName(0);S.threat=threatName(0);
  showBanner('Ômega desperta','Sobreviva o máximo que puder',2.2);
}
function togglePause(){paused=!paused;$('pauseOv').hidden=!paused;if(beamGain)beamGain.gain.value=0;}
function showOver(){
  if(overShown)return;overShown=true;running=true;
  const isBest=S.score>best;if(isBest){best=S.score;try{localStorage.setItem('singularidade_best',best);}catch(e){}}
  $('oTime').textContent=fmtT(S.t);$('oKills').textContent=S.kills;$('oErased').textContent=S.erased;$('oHeroes').textContent=S.heroes;
  $('oLvl').textContent=S.lvl;$('oScore').textContent=S.score.toLocaleString('pt-BR');setBest();
  if(isBest)$('bestTxt2').textContent='Novo recorde!';
  $('overOv').hidden=false;$('bossBox').hidden=true;
}
$('startBtn').addEventListener('click',start);
$('againBtn').addEventListener('click',start);
$('resumeBtn').addEventListener('click',togglePause);

let last=performance.now();
function frame(now){
  const dt=Math.min(.033,(now-last)/1000);last=now;
  if(running&&!paused&&!S.choosing){update(dt);hud();}
  draw(now/1000);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();
