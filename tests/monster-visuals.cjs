const assert=require('node:assert/strict');
const {writeFile}=require('node:fs/promises');
module.exports=async function({browser,page,C,origin,check,errors,fits}){
 const url=origin+'/tiny-delivery/?test=1';
 const ready=pg=>pg.waitForFunction(()=>window.__TDC?.getRenderer().loadedModels===4);
 const visit=(pg,p)=>pg.evaluate(([x,y])=>{window.__TDC.teleport(x,y);return new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));},p);
 await check('M.10','Real emulated touch moves, releases/cancels D-pad and activates the lantern',async()=>{
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  const touch=await context.newPage();
  try{
   touch.on('pageerror',e=>errors.push(e.message));touch.on('console',m=>{if(m.type()==='error')errors.push(m.text());});touch.on('response',r=>{if(r.status()>=400)errors.push('HTTP '+r.status()+' '+r.url());});
   await touch.route('**/*',r=>{if(!r.request().url().startsWith(origin+'/')){errors.push('External '+r.request().url());return r.abort();}return r.continue();});
   await touch.goto(url);await ready(touch);await touch.tap('#start');
   await touch.evaluate(()=>{window.__TDC.selectLevel(2);window.__TDC.freezeAI();});await visit(touch,[4,7]);await touch.tap('#stun');
   const stunned=await touch.evaluate(()=>window.__TDC.getState());assert.equal(stunned.charges,0);assert.equal(stunned.monsters[0].stun,C.lantern.seconds);
   const cdp=await context.newCDPSession(touch),box=await touch.locator('[data-dir=right]').boundingBox();
   const point={x:box.x+box.width/2,y:box.y+box.height/2};
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});
   await touch.waitForFunction(()=>window.__TDC.getState().player.x>4.7);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   await touch.waitForFunction(()=>window.__TDC.getState().input===0);const stopped=await touch.evaluate(()=>window.__TDC.getState().player);
   await touch.waitForTimeout(160);assert.deepEqual(await touch.evaluate(()=>window.__TDC.getState().player),stopped);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
   await touch.waitForFunction(()=>window.__TDC.getState().input===0);
   const y=await touch.evaluate(()=>window.__TDC.getState().player.y);await touch.keyboard.down('ArrowUp');await touch.waitForFunction(start=>window.__TDC.getState().player.y<start-0.15,y);await touch.keyboard.up('ArrowUp');
  }finally{await context.close();}
 });
 await check('M.11','Monster/boss screenshots, full HUD, desktop coverage and friendly party at both sizes',async()=>{
  let assetTriangles;
  for(const viewport of [{width:390,height:844},{width:1280,height:800}]){
   await page.setViewportSize(viewport);await page.goto(url);await ready(page);await page.click('#start');
   await page.evaluate(()=>{window.__TDC.selectLevel(2);window.__TDC.freezeAI();});await visit(page,[7,7]);await page.waitForTimeout(1200);await fits();
   for(const r of await page.locator('.hud,footer').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right};})))assert(r.top>=0&&r.bottom<=viewport.height&&r.left>=0&&r.right<=viewport.width,JSON.stringify(r));
   if(viewport.width===1280){const r=await page.locator('canvas').boundingBox();assert(r.width*r.height>=viewport.width*viewport.height*0.6);}
   const monsters=await page.evaluate(()=>window.__TDC.getState().monsters);assert.equal(monsters.length,3);
   await page.screenshot({path:`test-artifacts/monsters-${viewport.width}x${viewport.height}.png`});
   await page.evaluate(()=>{window.__TDC.selectLevel(window.CONTENT.levels.length-1);window.__TDC.freezeBoss();window.__TDC.forceBossPhase('dizzy');});
   await visit(page,[6,7]);await page.waitForTimeout(1200);await fits();assert(await page.locator('#boss-status').isVisible());
   assert.equal(await page.evaluate(()=>window.__TDC.getRenderer().bossVisible),true);
   await page.screenshot({path:`test-artifacts/boss-${viewport.width}x${viewport.height}.png`});
   assetTriangles=await page.evaluate(()=>window.__TDC.getRenderer().assetTriangles);
  }
  for(const p of C.levels.at(-1).parcels)await visit(page,p);
  for(const p of C.boss.bells){await page.evaluate(()=>window.__TDC.forceBossPhase('dizzy'));await visit(page,p);await page.evaluate(()=>window.__TDC.stepBoss(0.02));}
  await visit(page,C.levels.at(-1).goal);assert.equal(await page.evaluate(()=>window.__TDC.getState().phase),'win');
  await page.waitForTimeout(1000);const friend=await page.evaluate(()=>window.__TDC.getRenderer().bossPose);
  assert(Math.hypot(friend.x-C.levels.at(-1).goal[0],friend.z-C.levels.at(-1).goal[1])<2,'King did not join clubhouse party');
  await page.screenshot({path:'test-artifacts/monster-friendly-ending.png'});
  await writeFile('test-artifacts/monster-geometry.json',JSON.stringify(assetTriangles,null,2));
  await page.click('#credits');assert.equal(await page.locator('#original-work p').innerText(),C.originalWork.id);await page.click('#language');assert.equal(await page.locator('#original-work p').innerText(),C.originalWork.en);
 });
};
