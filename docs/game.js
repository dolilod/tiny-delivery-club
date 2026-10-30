import { createDiorama } from './scene.js';
(() => {
  'use strict';
  const C = window.CONTENT, $ = id => document.getElementById(id);
  for(const [key,value] of Object.entries(C.theme))document.documentElement.style.setProperty('--'+key,value);
  const directions = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };
  const keys = { ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right' };
  let language = 'id', levelIndex = 0, phase = 'ready', player, collected = new Set(), input = new Map(), serial = 0, notice = '';
  const diorama = createDiorama($('board'), C);
  let mode = C.modes[0], hearts = C.rules.hearts, protection = 0, nap = 0, clouds = [];
  let monsters=[],checkpoint,safePoints=[],visitedFlags=new Set(),manualStep=false;
  const gems=new Set(),lanternPickups=new Set();
  let charges=0,lanternCooldown=0,pulse=0;
  let boss=null,manualBoss=false;
  let audioContext, masterGain, muted=false, audioFailed=false;
  const languageButton=document.createElement('button'), muteButton=document.createElement('button');
  languageButton.id='language';muteButton.id='mute';
  $('settings').append(languageButton,muteButton);
  languageButton.addEventListener('click',()=>{language=C.languages[(C.languages.indexOf(language)+1)%C.languages.length];refresh();});
  muteButton.addEventListener('click',()=>{muted=!muted;if(masterGain)masterGain.gain.value=muted?0:1;refresh();});
  function unlockAudio(event){
    if(!event.isTrusted||muted||audioFailed)return;
    try{
      if(!audioContext){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio){audioFailed=true;return;}audioContext=new Audio();masterGain=audioContext.createGain();masterGain.connect(audioContext.destination);}
      if(audioContext.state==='suspended')audioContext.resume().catch(()=>{audioFailed=true;});
    }catch{audioFailed=true;}
  }
  document.addEventListener('pointerdown',unlockAudio,{capture:true});
  document.addEventListener('keydown',unlockAudio,{capture:true});
  function sound(name){
    if(muted||audioFailed||!audioContext||audioContext.state!=='running')return;
    try{
      const effect=C.sounds[name];
      effect.notes.forEach((note,i)=>{
        const oscillator=audioContext.createOscillator(),gain=audioContext.createGain(),start=audioContext.currentTime+i*effect.duration;
        oscillator.frequency.value=note;gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(effect.volume,start+0.01);gain.gain.exponentialRampToValueAtTime(0.0001,start+effect.duration);
        oscillator.connect(gain);gain.connect(masterGain);oscillator.start(start);oscillator.stop(start+effect.duration);
        oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
      });
    }catch{audioFailed=true;}
  }
  const modeButton = document.createElement('button');
  modeButton.id = 'mode';
  $('settings').append(modeButton);
  modeButton.addEventListener('click',()=>{if(phase==='ready'){mode=C.modes[(C.modes.indexOf(mode)+1)%C.modes.length];refresh();}});
  const level = () => C.levels[levelIndex];
  const text = (key, values = {}) => Object.entries(values).reduce((s,[k,v]) => s.replace('{'+k+'}',v), C.strings[language][key]);
  function clearInput() { input.clear(); }
  function reset() {
    player = {x:level().spawn[0]+0.5,y:level().spawn[1]+0.5}; collected.clear(); clearInput(); notice = '';
    hearts=C.rules.hearts;protection=0;nap=0;
    clouds=level().clouds.map(c=>({x:c.route[0][0]+0.5,y:c.route[0][1]+0.5,target:1,step:1}));
    safePoints=[level().spawn,...level().checkpoints];
    checkpoint=[...level().spawn];visitedFlags.clear();
    monsters=level().monsters.map(m=>({type:m.type,x:m.route[0][0]+0.5,y:m.route[0][1]+0.5,target:1,step:1,state:'patrol',timer:0,stun:0}));
    gems.clear();lanternPickups.clear();charges=C.lantern.startCharges;lanternCooldown=0;pulse=0;
    boss=level().boss?{state:'warn',time:C.boss.modes[mode].warn,radius:0,bells:[]}:null;
    diorama.reset();
  }
  function begin() { reset(); phase = 'playing';if(boss){notice={key:'bossWarn'};sound('boss');}refresh(); }
  function pause() { clearInput(); if (phase === 'playing') phase = 'paused'; refresh(); }
  function togglePause() { clearInput(); if (phase === 'paused') phase = 'playing'; else if (phase === 'playing') phase = 'paused'; refresh(); }
  function refresh() {
    document.documentElement.lang = language;
    document.title=text('title');
    document.querySelector('header .eyebrow').textContent=text('brand');
    document.querySelector('footer span').textContent=text('footer');
    $('board').setAttribute('aria-label',text('board'));
    document.querySelector('.dpad').setAttribute('aria-label',text('movement'));
    languageButton.textContent=text('language');muteButton.textContent=text(muted?'unmute':'mute');
    muteButton.setAttribute('aria-pressed',String(muted));
    for (const id of ['title','subtitle','start','replay','controls','credits']) $(id).textContent = text(id);
    $('pause').textContent = text(phase === 'paused' ? 'resume' : 'pause');
    $('level').textContent = text('level')+' '+(levelIndex+1);
    $('route-name').textContent = level().name[language];
    $('counter').textContent = text('parcels')+' '+collected.size+'/'+level().parcels.length;
    $('treasure').textContent=text('treasure')+' '+gems.size+'/'+level().treasure.length;
    $('treasure-result').textContent=$('treasure').textContent;
    $('treasure-result').hidden=phase!=='win';
    $('stun').textContent=text('stun')+' · '+charges;
    $('stun').setAttribute('aria-label',text('lantern')+': '+text('stun')+' '+charges);
    $('stun').hidden=!['playing','paused'].includes(phase);
    $('stun').disabled=phase!=='playing'||charges===0;
    $('boss-status').hidden=!boss;
    if(boss){
      const remaining=C.boss.hits-boss.bells.length;
      $('boss-label').textContent=text('bossHealth')+' · '+remaining+'/'+C.boss.hits;
      $('boss-health').max=C.boss.hits;$('boss-health').value=remaining;
      $('boss-health').setAttribute('aria-label',text('bossHealth')+' '+remaining+'/'+C.boss.hits);
    }
    $('hearts').textContent = text(mode==='relaxed'?'relaxed':'hearts')+(mode==='adventure'?' '+hearts+'/'+C.rules.hearts:'')+(protection>0?' · '+text('protected'):'');
    modeButton.textContent = text(mode);
    modeButton.setAttribute('aria-label',text('mode')+': '+text(mode));
    modeButton.disabled = phase !== 'ready';
    $('retry').textContent=text('retry');$('retry').hidden=phase!=='lose';
    $('message').textContent = phase==='paused' ? text('paused') : notice ? text(notice.key,notice.values) : text(phase==='win'&&levelIndex===C.levels.length-1?'ending':phase==='playing'&&nap>0?'sleeping':phase==='playing'&&level().napSeconds?'napHint':phase,{n:level().napSeconds});
    $('next').textContent=text('next');
    $('next').hidden=phase!=='win'||levelIndex===C.levels.length-1;
    $('start').hidden = phase !== 'ready';
    $('pause').hidden = !['playing','paused'].includes(phase);
    $('replay').hidden = phase !== 'win';
    for (const button of document.querySelectorAll('[data-dir]')) {button.setAttribute('aria-label',text(button.dataset.dir));button.textContent=C.symbols[button.dataset.dir];}
  }
  function blocked(x,y) {
    const r = C.rules.radius;
    if (x-r < 0 || y-r < 0 || x+r > C.grid || y+r > C.grid) return true;
    return level().walls.some(([wx,wy]) => x+r > wx && x-r < wx+1 && y+r > wy && y-r < wy+1);
  }
  const near = (x,y,p) => Math.hypot(x-p[0]-0.5,y-p[1]-0.5) < C.rules.contact;
  function glow(){
    if(phase!=='playing'||charges===0||lanternCooldown>0)return;
    charges--;lanternCooldown=C.lantern.cooldown;pulse=0.6;
    for(const m of monsters)if(Math.hypot(player.x-m.x,player.y-m.y)<=C.lantern.radius){m.stun=C.lantern.seconds;m.state='stunned';}
    notice={key:'stunned'};sound('stun');refresh();
  }
  function safeAt(x,y){
    return safePoints.some(p=>Math.hypot(x-p[0]-0.5,y-p[1]-0.5)<C.monsters.safeRadius);
  }
  function visible(a,b){
    const distance=Math.hypot(a.x-b.x,a.y-b.y),steps=Math.ceil(distance/0.2);
    for(let i=1;i<steps;i++)if(blocked(a.x+(b.x-a.x)*i/steps,a.y+(b.y-a.y)*i/steps))return false;
    return true;
  }
  function moveMonster(m,x,y,step){
    const dx=x-m.x,dy=y-m.y,d=Math.hypot(dx,dy);
    if(d<=step){m.x=x;m.y=y;return true;}
    const nx=m.x+dx/d*step,ny=m.y+dy/d*step;
    if(!blocked(nx,ny)){m.x=nx;m.y=ny;}
    return false;
  }
  function returnHome(m){
    m.state='return';m.timer=C.monsters.restSeconds;m.homePath=null;m.homeIndex=0;
  }
  function homePath(m,goal){
    const width=C.grid,start=Math.floor(m.y)*width+Math.floor(m.x),end=goal[1]*width+goal[0];
    const parents=new Int32Array(width*width).fill(-1),queue=[start],offsets=Object.values(directions);
    parents[start]=start;
    for(let head=0;head<queue.length&&parents[end]===-1;head++){
      const id=queue[head],x=id%width,y=Math.floor(id/width);
      for(const [dx,dy] of offsets){
        const nx=x+dx,ny=y+dy,next=ny*width+nx;
        if(nx<0||ny<0||nx>=width||ny>=width||parents[next]!==-1||blocked(nx+0.5,ny+0.5))continue;
        parents[next]=id;queue.push(next);
      }
    }
    if(parents[end]===-1)return [];
    const path=[];
    for(let id=end;;id=parents[id]){path.push([id%width+0.5,Math.floor(id/width)+0.5]);if(id===start)break;}
    return path.reverse();
  }
  function updateMonsters(dt){
    const rules=C.monsters,settings=rules.modes[mode];
    for(const [i,m] of monsters.entries()){
      if(m.stun>0){m.stun=Math.max(0,m.stun-dt);if(m.stun===0)returnHome(m);else m.state='stunned';continue;}
      if(nap>0)continue;
      const def=level().monsters[i],distance=Math.hypot(player.x-m.x,player.y-m.y);
      const sees=settings.chase&&!safeAt(player.x,player.y)&&distance<rules.detection&&visible(m,player);
      const speed=rules[m.type].speed*settings.speed*dt;
      if(m.type==='ghost'){
        if(m.state==='patrol'&&sees){m.state='warn';m.timer=rules.warning;notice={key:'warning'};sound('boo');refresh();}
        if(m.state==='warn'){m.timer-=dt;if(!sees)returnHome(m);else if(m.timer<=0){m.state='chase';m.timer=rules.chaseSeconds;}continue;}
        if(m.state==='chase'){
          m.timer-=dt;
          if(m.timer<=0||distance>rules.release||safeAt(player.x,player.y)||!visible(m,player))returnHome(m);
          else{moveMonster(m,player.x,player.y,speed);continue;}
        }
        if(m.state==='return'){
          m.timer-=dt;
          if(!m.homePath)m.homePath=homePath(m,def.route[0]);
          const point=m.homePath[m.homeIndex];
          if(point&&moveMonster(m,point[0],point[1],speed))m.homeIndex++;
          if(m.homeIndex===m.homePath.length&&m.timer<=0){m.state='patrol';m.target=1;}
          continue;
        }
      }else if(m.state==='return')m.state='patrol';
      const target=def.route[m.target];
      if(moveMonster(m,target[0]+0.5,target[1]+0.5,speed)){
        if(def.loop)m.target=(m.target+1)%def.route.length;
        else{if(m.target===def.route.length-1)m.step=-1;else if(m.target===0)m.step=1;m.target+=m.step;}
      }
    }
  }
  function bump(){
    hearts=Math.max(0,hearts-C.monsters.modes[mode].heartLoss);
    player.x=checkpoint[0]+0.5;player.y=checkpoint[1]+0.5;
    protection=C.rules.protection;clearInput();notice={key:'bump'};sound('bump');
    if(hearts===0){phase='lose';notice='';}refresh();
  }
  function bossPhase(state){
    boss.state=state;boss.radius=0;boss.time=C.boss.modes[mode][state]||0;
    notice={key:state==='warn'?'bossWarn':state==='wave'?'bossWave':state==='dizzy'?'bossDizzy':'bossFriendly'};
    if(state==='warn')sound('boss');refresh();
  }
  function updateBoss(dt){
    if(!boss||phase!=='playing'||boss.state==='sleeping')return;
    const rules=C.boss.modes[mode];
    boss.time=Math.max(0,boss.time-dt);
    if(boss.time===0)bossPhase(boss.state==='warn'?'wave':boss.state==='wave'?'dizzy':'warn');
    if(boss.state==='wave'){
      boss.radius+=rules.waveSpeed*dt;
      const distance=Math.hypot(player.x-C.boss.center[0]-0.5,player.y-C.boss.center[1]-0.5);
      if(rules.waveDamage&&protection===0&&!safeAt(player.x,player.y)&&Math.abs(distance-boss.radius)<C.boss.ringWidth)bump();
    }
    if(boss.state==='dizzy'){
      for(const [i,p] of C.boss.bells.entries()){
        if(boss.bells.includes(i)||!near(player.x,player.y,p))continue;
        if(collected.size<=boss.bells.length){notice={key:'bossNeedParcel'};refresh();break;}
        boss.bells.push(i);sound('checkpoint');
        bossPhase(boss.bells.length===C.boss.hits?'sleeping':'warn');break;
      }
    }
  }
  function simulate(dt) {
    if (phase === 'playing') {
      const wasSleeping=nap>0;
      nap=Math.max(0,nap-dt);
      lanternCooldown=Math.max(0,lanternCooldown-dt);pulse=Math.max(0,pulse-dt);
      if(wasSleeping && nap===0){notice='';refresh();}
      const wasProtected=protection>0;
      protection=Math.max(0,protection-dt);
      if(wasProtected!==(protection>0))refresh();
      if(!manualStep)updateMonsters(dt);
      clouds.forEach((cloud,i)=>{
        const route=level().clouds[i].route;
        if(route.length<2||nap>0)return;
        const target=route[cloud.target],tx=target[0]+0.5,ty=target[1]+0.5,dx=tx-cloud.x,dy=ty-cloud.y,distance=Math.hypot(dx,dy);
        const step=C.rules.cloudSpeed*(mode==='relaxed'?C.rules.relaxedFactor:1)*dt;
        if(distance<=step){cloud.x=tx;cloud.y=ty;if(cloud.target===route.length-1)cloud.step=-1;else if(cloud.target===0)cloud.step=1;cloud.target+=cloud.step;}
        else{cloud.x+=dx/distance*step;cloud.y+=dy/distance*step;}
      });
      let direction, order = -1;
      for (const held of input.values()) if (held.order > order) { direction=held.dir; order=held.order; }
      if (direction) {
        const slow=level().puddles.some(p=>near(player.x,player.y,p))?C.hazards.puddleFactor:1;
        const [dx,dy] = directions[direction], distance = C.rules.speed*slow*dt;
        if (!blocked(player.x+dx*distance,player.y+dy*distance)) { player.x+=dx*distance; player.y+=dy*distance; }
      }
      level().parcels.forEach((p,i) => { if (!collected.has(i) && near(player.x,player.y,p)) { collected.add(i); nap=level().napSeconds||0; notice=''; sound('pickup');refresh(); } });
      level().treasure.forEach((p,i)=>{if(!gems.has(i)&&near(player.x,player.y,p)){gems.add(i);sound('treasure');refresh();}});
      level().lanterns.forEach((p,i)=>{if(!lanternPickups.has(i)&&near(player.x,player.y,p)){lanternPickups.add(i);charges=Math.min(C.lantern.maxCharges,charges+1);notice={key:'lanternFound'};sound('pickup');refresh();}});
      level().checkpoints.forEach((p,i)=>{
        if(near(player.x,player.y,p)&&!visitedFlags.has(i)){checkpoint=[...p];visitedFlags.add(i);notice={key:'checkpoint'};sound('checkpoint');refresh();}
      });
      if(!manualBoss)updateBoss(dt);
      if(nap===0 && protection===0 && !safeAt(player.x,player.y) &&
        (clouds.some(c=>Math.hypot(player.x-c.x,player.y-c.y)<C.rules.contact) ||
         monsters.some(m=>m.stun===0&&Math.hypot(player.x-m.x,player.y-m.y)<C.rules.contact)))bump();
      if (near(player.x,player.y,level().goal)) {
        if (collected.size === level().parcels.length && (!boss||boss.state==='sleeping')) { phase='win'; clearInput(); notice='';sound('win'); }
        else notice={key:boss&&collected.size===level().parcels.length?'bossLocked':'remaining',values:{n:level().parcels.length-collected.size}};
        refresh();
      }
    }
  }
  function update(time,delta){
    const seconds=Math.min(delta,200)/1000;
    for(let elapsed=0;elapsed<seconds;elapsed+=0.02)simulate(Math.min(0.02,seconds-elapsed));
    draw(Math.min(delta,50)/1000);
  }
  function draw(dt) {
    diorama.draw({level:level(),player,collected,gems,lanternPickups,pulse,clouds,monsters,checkpoint,boss,protection,nap,phase,dt});
  }
  $('start').addEventListener('click',()=>{if(phase==='ready')begin();});
  $('replay').addEventListener('click',()=>{
    if(phase!=='win')return;
    if(levelIndex===C.levels.length-1){levelIndex=0;reset();phase='ready';refresh();}
    else begin();
  });
  $('next').addEventListener('click',()=>{if(phase==='win'&&levelIndex<C.levels.length-1){levelIndex++;begin();}});
  $('pause').addEventListener('click',togglePause);
  $('retry').addEventListener('click',()=>{if(phase==='lose')begin();});
  $('stun').addEventListener('click',glow);
  window.addEventListener('keydown',event=>{if(event.code==='Space'||event.key.toLowerCase()==='e'){event.preventDefault();if(!event.repeat)glow();}});
  window.addEventListener('keydown',event => { if (event.key==='Escape') { if(!event.repeat)togglePause();return; } const dir=keys[event.key] || keys[event.key.toLowerCase()];if(dir){event.preventDefault();if(phase==='playing'&&!input.has(event.code))input.set(event.code,{dir,order:++serial});} });
  window.addEventListener('keyup',event => input.delete(event.code));
  document.querySelectorAll('[data-dir]').forEach(button => {
    button.addEventListener('pointerdown',event => { if(phase!=='playing')return;event.preventDefault();button.setPointerCapture(event.pointerId);input.set('p'+event.pointerId,{dir:button.dataset.dir,order:++serial}); });
    for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,event=>input.delete('p'+event.pointerId));
  });
  window.addEventListener('blur',pause);
  window.addEventListener('pagehide',pause);
  window.addEventListener('resize',pause);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
  reset();refresh();
  let previousTime;
  diorama.loop(time=>{const delta=previousTime===undefined?0:time-previousTime;previousTime=time;update(time,delta);});
  if(new URLSearchParams(location.search).get('test')==='1') window.__TDC=Object.freeze({
    getRenderer:()=>diorama.stats(),
    getState:()=>({phase,level:levelIndex,player:{...player},checkpoint:[...checkpoint],monsters:monsters.map(m=>({...m})),gems:[...gems],charges,lanternCooldown,pulse,collected:[...collected],input:input.size,speed:C.rules.speed,hearts,protection,nap,mode,language,muted,audioStarted:!!audioContext,audioFailed,clouds:clouds.map(c=>({...c}))}),
    teleport(x,y){if(!blocked(x+0.5,y+0.5)){player.x=x+0.5;player.y=y+0.5;}},
    getBoss:()=>boss?{...boss,bells:[...boss.bells]}:null,
    freezeBoss(value=true){manualBoss=value;},
    forceBossPhase(state){if(boss&&C.boss.phases.includes(state)&&state!=='sleeping')bossPhase(state);},
    stepBoss(seconds){if(boss)for(let t=0;t<seconds;t+=0.02)updateBoss(Math.min(0.02,seconds-t));},
    freezeAI(value=true){manualStep=value;},
    selectLevel(index){if(Number.isInteger(index)&&index>=0&&index<C.levels.length){levelIndex=index;begin();}},
    stepAI(seconds){for(let t=0;t<seconds;t+=0.02)updateMonsters(Math.min(0.02,seconds-t));}
  });
})();
