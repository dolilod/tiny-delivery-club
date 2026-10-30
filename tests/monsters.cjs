const assert=require('node:assert/strict');
module.exports=async function({page,browser,C,origin,check,errors}){
 const state=()=>page.evaluate(()=>window.__TDC.getState());
 const visit=p=>page.evaluate(([x,y])=>{window.__TDC.teleport(x,y);return new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));},p);
 const setup=async mode=>{await page.goto(origin+'/tiny-delivery/?test=1');await page.waitForFunction(()=>window.__TDC?.getRenderer().loadedModels===4);if(mode==='adventure')await page.click('#mode');await page.click('#start');await page.evaluate(()=>{window.__TDC.selectLevel(2);window.__TDC.freezeAI();});};
 await check('M.1','Three original monsters patrol, ghost telegraphs/chases and gives up',async()=>{
  await setup('adventure');const before=await state();assert.deepEqual(before.monsters.map(m=>m.type),['slime','ghost','pumpkin']);
  await page.evaluate(()=>window.__TDC.stepAI(0.5));const moving=await state();assert(moving.monsters[0].x>before.monsters[0].x);assert(moving.monsters[2].x>before.monsters[2].x);
  await visit([8,7]);await page.evaluate(()=>window.__TDC.stepAI(0.1));assert.equal((await state()).monsters[1].state,'warn');
  await page.evaluate(seconds=>window.__TDC.stepAI(seconds),C.monsters.warning+0.1);assert.equal((await state()).monsters[1].state,'chase');
  const first=(await state()).monsters[1];await page.evaluate(()=>window.__TDC.stepAI(0.3));const chasing=await state();assert(Math.hypot(chasing.monsters[1].x-chasing.player.x,chasing.monsters[1].y-chasing.player.y)<Math.hypot(first.x-chasing.player.x,first.y-chasing.player.y));
  await visit([1,1]);await page.evaluate(()=>window.__TDC.stepAI(0.1));assert.equal((await state()).monsters[1].state,'return');
 });
 await check('M.2','Monster contact returns to checkpoint once with Adventure protection',async()=>{
  await setup('adventure');await visit(C.levels[2].checkpoints[0]);assert.deepEqual((await state()).checkpoint,Array.from(C.levels[2].checkpoints[0]));
  const hit=async()=>{const m=(await state()).monsters[0];await visit([m.x-0.5,m.y-0.5]);};
  await hit();let s=await state();assert.equal(s.hearts,C.rules.hearts-1);assert(s.protection>0);assert.equal(s.player.x,s.checkpoint[0]+0.5);assert.equal(s.player.y,s.checkpoint[1]+0.5);
  await hit();assert.equal((await state()).hearts,C.rules.hearts-1);await visit(C.levels[2].spawn);
  for(let i=1;i<C.rules.hearts;i++){await page.waitForFunction(()=>window.__TDC.getState().protection===0);await hit();await visit(C.levels[2].spawn);}
  assert.equal((await state()).phase,'lose');assert(await page.locator('#retry').isVisible());assert.equal(await page.locator('#message').innerText(),C.strings.id.lose);
 });
 await check('M.3','Santai contact costs no heart and ghosts never chase',async()=>{
  await setup('relaxed');const m=(await state()).monsters[0];await visit([m.x-0.5,m.y-0.5]);assert.equal((await state()).hearts,C.rules.hearts);assert.equal((await state()).phase,'playing');
  await visit([8,7]);await page.evaluate(()=>window.__TDC.stepAI(2));assert.equal((await state()).monsters[1].state,'patrol');
 });
 await check('M.4','Lantern pickups, Space/E/button stun, expiry and pause preserve the rules',async()=>{
  await setup('adventure');await visit([4,7]);await page.keyboard.press('Space');
  let s=await state();assert.equal(s.charges,0);assert.equal(s.monsters[0].stun,C.lantern.seconds);
  const position={x:s.monsters[0].x,y:s.monsters[0].y};
  await page.evaluate(()=>window.__TDC.stepAI(2));s=await state();assert.equal(s.monsters[0].x,position.x);assert.equal(s.monsters[0].y,position.y);assert(s.monsters[0].stun>0);
  await page.click('#pause');const paused=await state();await page.waitForTimeout(200);assert.equal((await state()).monsters[0].stun,paused.monsters[0].stun);await page.click('#pause');
  await page.evaluate(()=>{window.__TDC.stepAI(1.2);window.__TDC.stepAI(0.3);});assert((await state()).monsters[0].x>position.x);
  await visit(C.levels[2].lanterns[0]);assert.equal((await state()).charges,1);await page.waitForFunction(()=>window.__TDC.getState().lanternCooldown===0);await page.keyboard.press('e');assert.equal((await state()).charges,0);
  await visit(C.levels[2].lanterns[1]);await page.waitForFunction(()=>window.__TDC.getState().lanternCooldown===0);await page.click('#stun');assert.equal((await state()).charges,0);
 });
 await check('M.5','Optional treasure counts once, survives bumps and appears on results; puddles slow',async()=>{
  await setup('relaxed');await visit(C.levels[2].treasure[0]);await visit(C.levels[2].treasure[0]);assert.equal((await state()).gems.length,1);
  const m=(await state()).monsters[0];await visit([m.x-0.5,m.y-0.5]);assert.equal((await state()).gems.length,1);
  await visit([4,9]);const x=(await state()).player.x;await page.keyboard.down('d');await page.waitForTimeout(200);await page.keyboard.up('d');const slow=(await state()).player.x-x;
  assert(slow>0&&slow<C.rules.speed*0.2*0.85);
  for(const p of C.levels[2].parcels)await visit(p);await visit(C.levels[2].goal);assert.equal((await state()).phase,'win');assert.equal(await page.locator('#treasure-result').innerText(),C.strings.id.treasure+' 1/'+C.levels[2].treasure.length);
 });
 await check('M.6','Monster cues synthesize after gestures and mute suppresses all new notes',async()=>{
  const audio=await browser.newPage({viewport:{width:390,height:844}});
  try{
   audio.on('pageerror',e=>errors.push(e.message));audio.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await audio.route('**/*',r=>{if(!r.request().url().startsWith(origin+'/')){errors.push(r.request().url());return r.abort();}return r.continue();});
   await audio.addInitScript(()=>{const Native=window.AudioContext;window.notes=[];window.AudioContext=class extends Native{createOscillator(){const o=super.createOscillator(),start=o.start.bind(o);o.start=(...args)=>{window.notes.push(o.frequency.value);return start(...args);};return o;}};});
   await audio.goto(origin+'/tiny-delivery/?test=1');await audio.waitForFunction(()=>window.__TDC?.getRenderer().loadedModels===4);
   assert.equal(await audio.evaluate(()=>window.__TDC.getState().audioStarted),false);
   await audio.click('#mode');await audio.click('#start');await audio.evaluate(()=>{window.__TDC.selectLevel(2);window.__TDC.freezeAI();window.__TDC.teleport(8,7);window.__TDC.stepAI(0.1);});await audio.keyboard.press('Space');
   for(const p of [C.levels[2].checkpoints[0],C.levels[2].treasure[0],[4,8]])await audio.evaluate(([x,y])=>{window.__TDC.teleport(x,y);return new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));},p);
   const notes=await audio.evaluate(()=>window.notes);for(const name of ['boo','stun','checkpoint','treasure','bump'])for(const n of C.sounds[name].notes)assert(notes.includes(n),'missing '+name);
   await audio.evaluate(()=>window.__TDC.selectLevel(window.CONTENT.levels.length-1));
   const bossNotes=await audio.evaluate(()=>window.notes);for(const n of C.sounds.boss.notes)assert(bossNotes.includes(n),'missing boss stinger');
   await audio.click('#mute');const count=await audio.evaluate(()=>window.notes.length);await audio.evaluate(()=>{window.__TDC.selectLevel(2);window.__TDC.teleport(8,7);window.__TDC.stepAI(0.1);});await audio.keyboard.press('Space');assert.equal(await audio.evaluate(()=>window.notes.length),count);
  }finally{await audio.close();}
 });
 await check('M.7','Boss phases teach the pattern; three distinct lullaby deliveries befriend the King',async()=>{
  await setup('relaxed');await page.evaluate(()=>{window.__TDC.selectLevel(window.CONTENT.levels.length-1);window.__TDC.freezeBoss();});
  assert.equal(C.levels.length,6);assert(C.levels.at(-1).boss);
  await visit(C.levels.at(-1).goal);assert.equal((await state()).phase,'playing');
  await page.evaluate(seconds=>window.__TDC.stepBoss(seconds),C.boss.modes.relaxed.warn+0.05);
  assert.equal(await page.evaluate(()=>window.__TDC.getBoss().state),'wave');
  await page.evaluate(seconds=>window.__TDC.stepBoss(seconds),C.boss.modes.relaxed.wave+0.05);
  assert.equal(await page.evaluate(()=>window.__TDC.getBoss().state),'dizzy');
  await visit(C.boss.bells[0]);await page.evaluate(()=>window.__TDC.stepBoss(0.02));assert.equal(await page.evaluate(()=>window.__TDC.getBoss().bells.length),0);
  for(const p of C.levels.at(-1).parcels)await visit(p);
  for(const [i,p] of C.boss.bells.entries()){
   await page.evaluate(()=>window.__TDC.forceBossPhase('dizzy'));await visit(p);await page.evaluate(()=>window.__TDC.stepBoss(0.02));
   assert.equal(await page.evaluate(()=>window.__TDC.getBoss().bells.length),i+1);
   assert.equal(Number(await page.locator('#boss-health').getAttribute('value')),C.boss.hits-i-1);
   if(i===0){await page.evaluate(()=>{window.__TDC.forceBossPhase('dizzy');window.__TDC.stepBoss(0.02);});assert.equal(await page.evaluate(()=>window.__TDC.getBoss().bells.length),1);}
  }
  assert.equal(await page.evaluate(()=>window.__TDC.getBoss().state),'sleeping');
  await visit(C.levels.at(-1).goal);assert.equal((await state()).phase,'win');
  assert.equal(await page.locator('#message').innerText(),C.strings.id.ending);
 });
 await check('M.8','Adventure shockwave costs one heart at checkpoint; boss timers freeze on pause',async()=>{
  await setup('adventure');await page.evaluate(()=>{window.__TDC.selectLevel(window.CONTENT.levels.length-1);window.__TDC.freezeBoss();});
  await visit(C.levels.at(-1).checkpoints[0]);await visit([6,6]);
  await page.evaluate(()=>{window.__TDC.forceBossPhase('wave');window.__TDC.stepBoss(1.2);});
  let s=await state();assert.equal(s.hearts,C.rules.hearts-1);assert.equal(s.player.x,s.checkpoint[0]+0.5);assert(s.protection>0);
  await page.click('#pause');const boss=await page.evaluate(()=>window.__TDC.getBoss());await page.waitForTimeout(200);
  assert.deepEqual(await page.evaluate(()=>window.__TDC.getBoss()),boss);
  await page.click('#pause');await page.evaluate(()=>window.__TDC.stepBoss(0.1));assert.equal((await state()).hearts,C.rules.hearts-1);
  await page.waitForFunction(()=>window.__TDC.getState().protection===0);
  await page.evaluate(()=>{window.__TDC.forceBossPhase('wave');window.__TDC.stepBoss(3.8);});
  assert.equal((await state()).hearts,C.rules.hearts-1,'safe checkpoint failed against ring');
 });
 await check('M.9','Ghost returns around a hedge corner and resumes patrol after losing the courier',async()=>{
  await setup('adventure');
  await page.evaluate(()=>{
   const t=window.__TDC;t.teleport(10,7);t.stepAI(0.9);t.stepAI(1.1);
   t.teleport(10,5);t.stepAI(1.4);t.teleport(1,1);t.stepAI(0.1);
  });
  assert.equal((await state()).monsters[1].state,'return');
  await page.evaluate(()=>window.__TDC.stepAI(8));
  const ghost=(await state()).monsters[1];assert.equal(ghost.state,'patrol');assert(ghost.y>7.2);
 });
};
