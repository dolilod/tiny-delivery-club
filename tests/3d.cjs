const assert=require('node:assert/strict');
const {readFile,readdir,writeFile}=require('node:fs/promises');
const {createHash}=require('node:crypto');

module.exports=async function run3D({browser,page,C,origin,check,errors,fits}){
  const url=origin+'/tiny-delivery/?test=1';
  const ready=pg=>pg.waitForFunction(()=>window.__TDC?.getRenderer().loadedModels===window.__TDC?.getRenderer().expectedModels);
  const visit=(pg,p)=>pg.evaluate(([x,y])=>{window.__TDC.teleport(x,y);return new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));},p);
  async function complete(pg){
    const index=await pg.evaluate(()=>window.__TDC.getState().level);
    for(const p of C.levels[index].parcels)await visit(pg,p);
    await visit(pg,C.levels[index].goal);
  }
  async function routeFour(pg){
    for(let i=0;i<3;i++){await complete(pg);await pg.click('#next');}
  }
  function observe(pg){
    pg.on('pageerror',e=>errors.push(e.message));
    pg.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    pg.on('response',r=>{if(r.status()>=400)errors.push('HTTP '+r.status()+' '+r.url());});
    return pg.route('**/*',route=>{
      const target=route.request().url();
      if(!target.startsWith(origin+'/')){errors.push('External request '+target);return route.abort();}
      return route.continue();
    });
  }
  await check('3D.1','WebGL, all GLBs, nonblank board and full layout at phone/desktop sizes',async()=>{
    for(const viewport of [{width:390,height:844},{width:1280,height:800}]){
      await page.setViewportSize(viewport);await page.goto(url);await ready(page);
      await page.click('#start');await fits();
      const info=await page.evaluate(()=>({webgl:!!document.querySelector('#board canvas').getContext('webgl2'),...window.__TDC.getRenderer()}));
      assert(info.webgl);assert.equal(info.loadedModels,Object.keys(C.models).length);assert.deepEqual(info.failedModels,[]);
      assert(info.pixelRatio<=2);assert(info.shadowMapSize<=1024);
      if(viewport.width===1280){
        const box=await page.locator('canvas').boundingBox();
        assert(box.width*box.height>=viewport.width*viewport.height*0.6,'desktop view too small');
      }
      const png=await page.locator('#board canvas').screenshot({path:`test-artifacts/3d-board-${viewport.width}.png`});
      const pixels=await page.evaluate(async base64=>{
        const image=new Image();image.src='data:image/png;base64,'+base64;await image.decode();
        const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
        const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
        const data=ctx.getImageData(0,0,canvas.width,canvas.height).data,bins=new Map();
        for(let i=0;i<data.length;i+=16){const key=(data[i]>>4)*256+(data[i+1]>>4)*16+(data[i+2]>>4);bins.set(key,(bins.get(key)||0)+1);}
        return {colors:bins.size,dominant:Math.max(...bins.values())/(data.length/16)};
      },png.toString('base64'));
      assert(pixels.colors>=64,JSON.stringify(pixels));assert(pixels.dominant<0.85,JSON.stringify(pixels));
      await page.screenshot({path:`test-artifacts/3d-${viewport.width}x${viewport.height}.png`});
    }
    await page.click('#credits');
    for(const asset of Object.values(C.models)){
      const credits=await page.locator('#models').innerText();assert(credits.includes(asset.id));assert(credits.includes(asset.prompt));
      assert.equal(await page.locator('#models a').evaluateAll((links,url)=>links.filter(a=>a.getAttribute('href')===url).length,asset.source),1);
    }
    assert.equal(await page.locator('#models a[href="https://creativecommons.org/licenses/by/4.0/"]').count(),Object.keys(C.models).length);
    assert((await page.locator('#models').innerText()).includes(C.assetChanges.id));
  });
  await check('3D.2','Facing, pickup/nap feedback, pause freeze and finite celebration',async()=>{
    await page.setViewportSize({width:390,height:844});await page.goto(url);await ready(page);await page.click('#start');
    await page.keyboard.down('d');await page.waitForTimeout(300);await page.keyboard.up('d');
    const moving=await page.evaluate(()=>({state:window.__TDC.getState(),view:window.__TDC.getRenderer()}));
    assert.equal(moving.view.pose.x,moving.state.player.x);assert.equal(moving.view.pose.z,moving.state.player.y);
    assert(moving.view.pose.yaw>1&&moving.view.pose.yaw<2,'courier did not face right');
    await routeFour(page);await visit(page,C.levels[3].parcels[0]);
    const pickup=await page.evaluate(()=>window.__TDC.getRenderer());assert.equal(pickup.sleepingClouds,2);assert(pickup.particles>0);
    await page.click('#pause');
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
    const paused=await page.evaluate(()=>({view:window.__TDC.getRenderer(),state:window.__TDC.getState()}));
    await page.screenshot({path:'test-artifacts/3d-cloud-nap.png'});await page.waitForTimeout(300);
    const frozen=await page.evaluate(()=>({view:window.__TDC.getRenderer(),state:window.__TDC.getState()}));
    assert.deepEqual(frozen.view.pose,paused.view.pose);assert.equal(frozen.view.frames,paused.view.frames);assert.equal(frozen.state.nap,paused.state.nap);
    await page.click('#pause');await complete(page);
    assert.equal(await page.evaluate(()=>window.__TDC.getState().phase),'win');
    assert((await page.evaluate(()=>window.__TDC.getRenderer())).particles>0);
    await page.screenshot({path:'test-artifacts/3d-party.png'});
    await page.waitForFunction(()=>window.__TDC.getRenderer().particles===0);
    // Allow the final settled frame, then ensure the static result no longer renders.
    await page.waitForTimeout(150);const frames=await page.evaluate(()=>window.__TDC.getRenderer().frames);
    await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>window.__TDC.getRenderer().frames),frames);
  });
  await check('3D.3','Every corrupt GLB falls back to a playable procedural toy',async()=>{
    const fallback=await browser.newPage({viewport:{width:390,height:844}});
    try{
      await observe(fallback);
      await fallback.route('**/*.glb',r=>r.fulfill({status:200,contentType:'model/gltf-binary',body:'invalid GLB fixture'}));
      await fallback.goto(url);await fallback.waitForFunction(()=>window.__TDC?.getRenderer().failedModels.length===window.__TDC?.getRenderer().expectedModels);
      await fallback.click('#start');await fallback.keyboard.down('d');await fallback.waitForTimeout(300);await fallback.keyboard.up('d');
      assert((await fallback.evaluate(()=>window.__TDC.getState())).player.x>C.levels[0].spawn[0]+0.5);
      await complete(fallback);assert.equal(await fallback.evaluate(()=>window.__TDC.getState().phase),'win');
      await fallback.screenshot({path:'test-artifacts/3d-fallback.png'});
    }finally{await fallback.close();}
  });
  await check('3D.4','Asset budget, embedded textures, exact credits and all vendored hashes',async()=>{
    const manifest=await readFile('ASSET_MANIFEST.md','utf8');let total=0;
    for(const file of await readdir('docs/vendor/three',{recursive:true,withFileTypes:true})){
      if(!file.isFile())continue;
      const hash=createHash('sha256').update(await readFile(file.parentPath+'/'+file.name)).digest('hex');assert(manifest.includes(hash),file.name);
    }
    for(const asset of Object.values(C.models)){
      assert(manifest.includes(asset.source));assert(manifest.includes(asset.id));assert(manifest.includes(asset.prompt));
      const bytes=await readFile('docs/assets/'+asset.file);total+=bytes.length;
      assert(manifest.includes(createHash('sha256').update(bytes).digest('hex')),asset.file);
      assert.equal(bytes.readUInt32LE(0),0x46546c67);const length=bytes.readUInt32LE(12),gltf=JSON.parse(bytes.subarray(20,20+length).toString());
      for(const buffer of gltf.buffers)assert.equal(buffer.uri,undefined,'GLB must embed buffers');
      const binaryStart=20+length+8;
      for(const image of gltf.images||[]){
        assert.equal(image.uri,undefined,'GLB must embed textures');const view=gltf.bufferViews[image.bufferView];
        const encoded=bytes.subarray(binaryStart+(view.byteOffset||0),binaryStart+(view.byteOffset||0)+view.byteLength);
        const dimensions=await page.evaluate(async({base64,type})=>{
          const raw=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));const bitmap=await createImageBitmap(new Blob([raw],{type}));
          const dimensions=[bitmap.width,bitmap.height];bitmap.close();return dimensions;
        },{base64:encoded.toString('base64'),type:image.mimeType});
        assert(dimensions.every(n=>n<=1024),`${asset.file}: ${dimensions}`);
      }
    }
    // Count all shipped assets, not only the known model list.
    let shipped=0;
    for(const file of await readdir('docs/assets',{recursive:true,withFileTypes:true}))if(file.isFile())shipped+=(await readFile(file.parentPath+'/'+file.name)).length;
    assert.equal(shipped,total);
    let docsBytes=0;
    for(const file of await readdir('docs',{recursive:true,withFileTypes:true}))if(file.isFile())docsBytes+=(await readFile(file.parentPath+'/'+file.name)).length;
    assert(docsBytes<4_000_000,'docs download exceeds 4 MB');
    await writeFile('test-artifacts/monster-budget.json',JSON.stringify({docsBytes,modelBytes:total},null,2));
  });
  await check('3D.5','Record warmed monster and boss scenes at 390×844 with 4× CPU throttle',async()=>{
    const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});
    const perfPage=await context.newPage();
    try{
      await observe(perfPage);await perfPage.goto(url);await ready(perfPage);await perfPage.click('#start');
      const cdp=await context.newCDPSession(perfPage);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
      for(const [name,index,position] of [['monsters',3,[7,7]],['boss',C.levels.length-1,[6,7]]]){
        await perfPage.evaluate(({index,position})=>{window.__TDC.selectLevel(index);window.__TDC.teleport(...position);},{index,position});
        await perfPage.waitForTimeout(1500);
        const measurement=await perfPage.evaluate(()=>new Promise(resolve=>{
          const start=performance.now(),first=window.__TDC.getRenderer().frames;let sum=0,count=0,min=Infinity,max=0;
          function sample(){
            const info=window.__TDC.getRenderer();sum+=info.drawCalls;count++;min=Math.min(min,info.drawCalls);max=Math.max(max,info.drawCalls);
            const elapsed=performance.now()-start;
            if(elapsed<8000){requestAnimationFrame(sample);return;}
            const gl=document.querySelector('canvas').getContext('webgl2'),extension=gl.getExtension('WEBGL_debug_renderer_info');
            resolve({viewport:'390x844',cpuThrottle:4,devicePixelRatio:devicePixelRatio,pixelRatio:info.pixelRatio,level:window.__TDC.getState().level+1,elapsedMs:elapsed,renderedFrames:info.frames-first,averageFPS:(info.frames-first)*1000/elapsed,averageDrawCalls:sum/count,minDrawCalls:min,maxDrawCalls:max,triangles:info.triangles,webglRenderer:extension?gl.getParameter(extension.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)});
          }requestAnimationFrame(sample);
        }));
        assert.equal(await perfPage.evaluate(()=>window.__TDC.getState().phase),'playing');
        await writeFile(`test-artifacts/${name}-performance.json`,JSON.stringify(measurement,null,2));console.log(name.toUpperCase()+' PERFORMANCE',JSON.stringify(measurement));
        await perfPage.screenshot({path:`test-artifacts/${name}-performance.png`});
      }
    }finally{await context.close();}
  });
};
