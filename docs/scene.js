import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Gameplay owns coordinates; this module owns only their visual representation.
export function createDiorama(container, content) {
  const p = content.palette;
  const renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setClearColor(content.theme.page);
  container.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-6,6,6,-6,0.1,60);
  const center = content.grid / 2;
  camera.position.set(center+5.5, 12, center+8);
  camera.lookAt(center,0,center);
  const focus=new THREE.Vector3(center,0,center);
  const cameraOffset=new THREE.Vector3(...content.camera.offset);
  scene.add(new THREE.HemisphereLight(p.sky, p.wall, 2.6));
  const sun = new THREE.DirectionalLight(p.sunlight, 3);
  sun.position.set(-3,12,4);sun.target.position.set(center,0,center);
  sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
  Object.assign(sun.shadow.camera,{left:-8,right:8,top:8,bottom:-8,near:0.5,far:30});
  sun.shadow.normalBias=0.035;
  scene.add(sun,sun.target);
  const materials = new Map();
  const material = color => {
    if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:0.78}));
    return materials.get(color);
  };
  const rounded = new RoundedBoxGeometry(1,1,1,2,0.12);
  const sphere = new THREE.SphereGeometry(1,12,8);
  function mesh(parent, geometry, color, x,y,z, sx,sy,sz) {
    const m=new THREE.Mesh(geometry,material(color));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
  }
  const base=mesh(scene,rounded,p.wall,center,-0.35,center,content.grid+0.35,0.65,content.grid+0.35);
  base.castShadow=false;
  const tiles=new THREE.InstancedMesh(new RoundedBoxGeometry(1,1,1,1,0.12),material(p.ground),content.grid**2);
  const matrix=new THREE.Matrix4(),color=new THREE.Color();
  for(let y=0;y<content.grid;y++)for(let x=0;x<content.grid;x++){
    const i=y*content.grid+x;
    matrix.makeScale(0.97,0.23,0.97);matrix.setPosition(x+0.5,0,y+0.5);tiles.setMatrixAt(i,matrix);
    tiles.setColorAt(i,color.set((x+y)%2?p.ground:p.alternate));
  }
  tiles.receiveShadow=true;scene.add(tiles);
  const hedges=new THREE.InstancedMesh(rounded,material(p.wallTop),content.grid**2);
  hedges.castShadow=true;hedges.receiveShadow=true;hedges.frustumCulled=false;scene.add(hedges);
  const routeDots=new THREE.InstancedMesh(rounded,material(p.wallTop),content.grid**2);
  routeDots.frustumCulled=false;scene.add(routeDots);
  const assetTriangles={};
  function countAsset(name,object){
    if(!object)return;
    let total=0;object.traverse(node=>{if(node.geometry)total+=(node.geometry.index?.count||node.geometry.attributes.position.count)/3;});
    assetTriangles[name]=total;
  }
  const board=new THREE.Group();scene.add(board);
  const courier=new THREE.Group();scene.add(courier);
  const courierToy=new THREE.Group();courier.add(courierToy);
  function fallbackCourier(){
    mesh(courierToy,rounded,p.robot,0,0.45,0,0.55,0.65,0.42);
    mesh(courierToy,rounded,p.white,0,0.58,0.23,0.43,0.25,0.06);
    for(const x of [-0.1,0.1])mesh(courierToy,sphere,p.ink,x,0.59,0.27,0.045,0.045,0.03);
    for(const x of [-0.18,0.18])mesh(courierToy,rounded,p.ink,x,0.16,0,0.17,0.14,0.28);
    mesh(courierToy,sphere,p.parcel,0,0.88,0,0.08,0.08,0.08);
  }
  fallbackCourier();
  const ring=new THREE.Mesh(new THREE.TorusGeometry(0.43,0.035,6,24),material(p.robot));
  ring.rotation.x=-Math.PI/2;ring.position.y=0.18;courier.add(ring);
  const glowRing=new THREE.Mesh(ring.geometry,material(p.parcel));glowRing.rotation.x=-Math.PI/2;glowRing.position.y=0.2;courier.add(glowRing);
  const gemGeometry=new THREE.OctahedronGeometry(0.25);
  let parcels=[],clouds=[],monsterToys=[],flags=[],treasure=[],lanterns=[],bells=[],bossToy=null,wave=null,currentLevel;
  let dirty=true,frames=0,clock=0,lastX=NaN,lastZ=NaN,lastPhase,celebration=0;
  const feel=content.feel;
  const labelCanvas=document.createElement('canvas');labelCanvas.width=128;labelCanvas.height=64;
  const labelContext=labelCanvas.getContext('2d');
  labelContext.fillStyle=content.theme.paper;labelContext.fillRect(0,0,128,64);
  labelContext.fillStyle='#'+new THREE.Color(p.ink).getHexString();
  labelContext.font='bold 42px system-ui';labelContext.textAlign='center';labelContext.fillText(content.symbols.sleep,64,45);
  const sleepTexture=new THREE.CanvasTexture(labelCanvas);
  const sleepMaterial=new THREE.SpriteMaterial({map:sleepTexture,depthTest:false,depthWrite:false});
  function glyph(value){
    const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;
    const ctx=canvas.getContext('2d');ctx.fillStyle=content.theme.paper;ctx.fillRect(0,0,64,64);
    ctx.fillStyle=content.theme.ink;ctx.font='bold 48px system-ui';ctx.textAlign='center';ctx.fillText(value,32,50);
    return new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas),depthTest:false});
  }
  const warningMaterial=glyph(content.symbols.warning);
  function monsterToy(type){
    const group=new THREE.Group(),body=new THREE.Group();group.add(body);
    const tint=content.monsters[type].color;
    mesh(body,sphere,tint,0,0.4,0,0.43,type==='ghost'?0.52:0.33,0.36);
    if(type==='ghost')for(const x of [-0.25,0,0.25])mesh(body,sphere,tint,x,0.14,0,0.16,0.18,0.24);
    const wings=[];
    if(type==='pumpkin'){
      mesh(body,rounded,p.wall,0,0.82,0,0.12,0.22,0.12);
      for(const side of [-1,1]){
        const wing=mesh(body,sphere,p.roof,side*0.55,0.4,0,0.37,0.08,0.27);wings.push(wing);
      }
    }
    const pupils=[];
    for(const x of [-0.16,0.16]){
      mesh(body,sphere,p.white,x,0.49,0.31,0.14,0.16,0.07);
      pupils.push(mesh(body,sphere,p.ink,x,0.49,0.37,0.065,0.085,0.035));
    }
    mesh(body,sphere,p.roof,0,0.28,0.34,0.095,0.035,0.035);
    const badge=new THREE.Sprite(warningMaterial);badge.position.y=1.25;badge.scale.set(0.45,0.45,1);group.add(badge);
    group.userData={body,pupils,wings,badge,type};
    return group;
  }
  const starShape=new THREE.Shape();
  for(let i=0;i<10;i++){
    const a=i*Math.PI/5+Math.PI/2,r=i%2?0.075:0.16,x=Math.cos(a)*r,y=Math.sin(a)*r;
    if(i===0)starShape.moveTo(x,y);else starShape.lineTo(x,y);
  }
  starShape.closePath();
  const starGeometry=new THREE.ShapeGeometry(starShape);
  const starMaterial=new THREE.MeshBasicMaterial({color:p.parcel,side:THREE.DoubleSide});
  const particles=new THREE.InstancedMesh(new THREE.OctahedronGeometry(1),material(p.parcel),48);
  particles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);particles.frustumCulled=false;particles.visible=false;scene.add(particles);
  const sparks=Array.from({length:48},()=>({life:0,x:0,y:0,z:0,vx:0,vy:0,vz:0,total:1}));
  for(let i=0;i<sparks.length;i++)particles.setColorAt(i,color.set([p.parcel,p.house,p.robot][i%3]));
  let sparkCursor=0;
  function burst(x,z,count,duration){
    for(let i=0;i<count;i++){
      const s=sparks[sparkCursor++%sparks.length],angle=i*2.39996;
      Object.assign(s,{life:duration,total:duration,x,y:0.6,z,vx:Math.cos(angle)*0.95,vy:1.5+(i%3)*0.3,vz:Math.sin(angle)*0.95});
    }
  }
  function reset(){
    currentLevel=undefined;lastX=NaN;lastZ=NaN;lastPhase=undefined;celebration=0;dirty=true;
    courierToy.rotation.y=0;
    for(const s of sparks)s.life=0;particles.visible=false;
  }
  const models=new Map(),failedModels=[];
  const loader=new GLTFLoader();
  for(const [role,asset] of Object.entries(content.models)){
    loader.loadAsync('./assets/'+asset.file).then(gltf=>{
      const root=gltf.scene;
      const bounds=new THREE.Box3().setFromObject(root),size=bounds.getSize(new THREE.Vector3()),middle=bounds.getCenter(new THREE.Vector3());
      const scale=asset.size/Math.max(size.x,size.y,size.z);
      const normalized=new THREE.Group();normalized.add(root);
      root.scale.multiplyScalar(scale);root.position.add(new THREE.Vector3(-middle.x*scale,-bounds.min.y*scale,-middle.z*scale));
      normalized.rotation.y=asset.yaw;
      root.traverse(node=>{if(node.isMesh){node.castShadow=true;node.receiveShadow=true;}});
      models.set(role,normalized);
      if(role==='courier'){courierToy.clear();courierToy.add(normalized.clone(true));}
      currentLevel=undefined;
    }).catch(()=>{failedModels.push(role);});
  }
  function model(role,parent){
    if(!models.has(role))return false;
    parent.add(models.get(role).clone(true));return true;
  }
  function cloudKing(){
    const group=new THREE.Group();
    for(const [x,y,s] of [[-0.8,0.7,0.65],[0,0.9,1],[0.85,0.7,0.65]])
      mesh(group,sphere,content.boss.color,x,y,0,s,s*0.8,s*0.7);
    const eyes=[];
    for(const x of [-0.35,0.35]){
      mesh(group,sphere,p.white,x,1.05,0.64,0.23,0.26,0.1);
      eyes.push(mesh(group,sphere,p.ink,x,1.05,0.73,0.1,0.14,0.04));
    }
    mesh(group,sphere,p.roof,0,0.65,0.68,0.16,0.045,0.04);
    for(const x of [-0.4,0,0.4])mesh(group,rounded,p.parcel,x,1.85,0,0.28,x===0?0.6:0.4,0.3);
    const sleep=new THREE.Sprite(sleepMaterial);sleep.position.set(0,2.5,0);sleep.scale.set(1.4,0.7,1);group.add(sleep);
    group.userData={eyes,sleep};return group;
  }
  function rebuild(level) {
    // All geometries/materials are shared and retained for the lifetime of the page.
    board.clear();parcels=[];clouds=[];monsterToys=[];flags=[];treasure=[];lanterns=[];bells=[];bossToy=null;wave=null;currentLevel=level;
    hedges.count=level.walls.length;
    level.walls.forEach(([x,y],i)=>{matrix.makeScale(0.9,0.58,0.9);matrix.setPosition(x+0.5,0.37,y+0.5);hedges.setMatrixAt(i,matrix);});
    hedges.instanceMatrix.needsUpdate=true;routeDots.count=0;
    const house=new THREE.Group();house.position.set(level.goal[0]+0.5,0.12,level.goal[1]+0.5);board.add(house);
    if(!model('house',house)){
      mesh(house,rounded,p.house,0,0.4,0,0.8,0.8,0.75);
      const roof=mesh(house,rounded,p.roof,0,0.9,0,0.85,0.2,0.85);roof.rotation.z=Math.PI/12;
      mesh(house,rounded,p.white,0,0.27,0.39,0.25,0.5,0.04);
    }
    const porch=mesh(board,rounded,p.house,level.goal[0]+0.5,0.15,level.goal[1]+0.5,0.98,0.06,0.98);porch.castShadow=false;
    for(const [x,y] of content.props){
      const tree=new THREE.Group();tree.position.set(x+0.5,0.12,y+0.5);board.add(tree);
      if(!model('tree',tree)){
        mesh(tree,rounded,p.roof,0,0.28,0,0.12,0.5,0.12);
        mesh(tree,sphere,p.wallTop,0,0.7,0,0.32,0.4,0.32);
      }
    }
    for(const [x,y] of level.parcels){
      const group=new THREE.Group();group.position.set(x+0.5,0.18,y+0.5);board.add(group);
      if(!model('parcel',group)){
        mesh(group,rounded,p.parcel,0,0.25,0,0.43,0.45,0.43);
        mesh(group,rounded,p.white,0,0.25,0.23,0.08,0.45,0.025);
      }
      parcels.push(group);
      const star=new THREE.Mesh(starGeometry,starMaterial);star.position.y=0.78;star.quaternion.copy(camera.quaternion);group.add(star);
    }
    for(const cloud of level.clouds){
      const group=new THREE.Group();board.add(group);
      for(const [x,y,s] of [[-0.22,0,0.24],[0,0.12,0.32],[0.25,0,0.22]])mesh(group,sphere,p.white,x,y,0,s,s*0.8,s*0.8);
      clouds.push(group);
      const sleep=new THREE.Sprite(sleepMaterial);sleep.position.set(0.2,0.8,0);sleep.scale.set(1.0,0.5,1);sleep.renderOrder=10;group.add(sleep);group.userData.sleep=sleep;
      for(const [x,y] of cloud.route){matrix.makeScale(0.13,0.015,0.13);matrix.setPosition(x+0.5,0.135,y+0.5);routeDots.setMatrixAt(routeDots.count++,matrix);}
    }
    for(const m of level.monsters){const toy=monsterToy(m.type);monsterToys.push(toy);board.add(toy);}
    for(const [x,y] of level.checkpoints){
      const flag=new THREE.Group();flag.position.set(x+0.5,0.13,y+0.5);board.add(flag);flags.push(flag);
      mesh(flag,rounded,p.robot,0,0,0,1.1,0.04,1.1);
      mesh(flag,rounded,p.ink,-0.3,0.55,0,0.055,1.1,0.055);
      mesh(flag,rounded,p.parcel,-0.04,0.95,0,0.5,0.3,0.06);
      mesh(flag,rounded,p.white,-0.04,0.95,0.04,0.08,0.3,0.025);
    }
    for(const [x,y] of level.treasure){
      const gem=mesh(board,gemGeometry,p.robot,x+0.5,0.5,y+0.5,1,1,1);treasure.push(gem);
    }
    for(const [x,y] of level.lanterns){
      const lantern=new THREE.Group();lantern.position.set(x+0.5,0.15,y+0.5);board.add(lantern);lanterns.push(lantern);
      mesh(lantern,rounded,p.roof,0,0.3,0,0.32,0.5,0.32);
      mesh(lantern,sphere,p.parcel,0,0.34,0.17,0.12,0.18,0.08);
      mesh(lantern,rounded,p.parcel,0,0.65,0,0.15,0.14,0.08);
    }
    for(const [x,y] of level.puddles){
      const puddle=mesh(board,sphere,p.robot,x+0.5,0.14,y+0.5,0.49,0.025,0.43);puddle.castShadow=false;
    }
    if(level.boss){
      bossToy=cloudKing();bossToy.position.set(content.boss.center[0]+0.5,0.3,content.boss.center[1]+0.5);board.add(bossToy);
      wave=new THREE.Mesh(ring.geometry,material(p.parcel));wave.rotation.x=-Math.PI/2;wave.position.set(bossToy.position.x,0.2,bossToy.position.z);board.add(wave);
      for(const [x,y] of content.boss.bells){
        const bell=new THREE.Group();bell.position.set(x+0.5,0.15,y+0.5);board.add(bell);bells.push(bell);
        mesh(bell,rounded,p.robot,0,0,0,0.9,0.05,0.9);
        mesh(bell,rounded,p.ink,0,0.4,0,0.07,0.75,0.07);
        mesh(bell,sphere,p.parcel,0,0.8,0,0.3,0.34,0.3);
        mesh(bell,sphere,p.white,0,0.5,0.2,0.08,0.1,0.08);
        const halo=new THREE.Mesh(ring.geometry,material(p.parcel));halo.rotation.x=-Math.PI/2;halo.position.y=0.12;bell.add(halo);bell.userData.halo=halo;
        bell.userData.delivered=false;
      }
    }
    routeDots.instanceMatrix.needsUpdate=true;
    monsterToys.forEach(toy=>countAsset(toy.userData.type,toy));
    countAsset('flag',flags[0]);countAsset('gem',treasure[0]);countAsset('lantern',lanterns[0]);
    countAsset('boss',bossToy);countAsset('bell',bells[0]);countAsset('pulse',glowRing);
    assetTriangles.puddle=sphere.index.count/3;
  }
  function resize(){
    const w=container.clientWidth,h=container.clientHeight;
    renderer.setSize(w,h,false);
    const span=content.camera.span,aspect=w/h;
    camera.left=-span*aspect;camera.right=-camera.left;
    camera.top=span;camera.bottom=-span;camera.updateProjectionMatrix();
    dirty=true;
  }
  new ResizeObserver(resize).observe(container);resize();
  function draw(state){
    const rebuilt=currentLevel!==state.level;
    if(rebuilt){rebuild(state.level);dirty=true;}
    const live=state.phase==='playing'||state.phase==='ready';
    const frozen=state.phase==='paused';
    const dt=frozen?0:state.dt;
    if(state.phase==='win'&&lastPhase!=='win'){
      celebration=feel.celebrationSeconds;
      burst(state.level.goal[0]+0.5,state.level.goal[1]+0.5,36,feel.celebrationSeconds);
    }
    const changed=lastPhase!==state.phase;
    lastPhase=state.phase;
    if(!dirty&&!changed&&!live&&(frozen||(!particles.visible&&celebration<=0)))return;
    clock+=dt;celebration=Math.max(0,celebration-dt);
    const dx=state.player.x-lastX,dz=state.player.y-lastZ,distance=Math.hypot(dx,dz);
    const moving=live&&distance>0.00001&&distance<0.5;
    if(moving){
      const target=Math.atan2(dx,dz),angle=Math.atan2(Math.sin(target-courierToy.rotation.y),Math.cos(target-courierToy.rotation.y));
      courierToy.rotation.y+=angle*(1-Math.exp(-feel.turnRate*dt));
    }
    const bob=live?(moving?Math.abs(Math.sin(clock*Math.PI*feel.walkFrequency))*feel.hop:Math.sin(clock*3)*feel.idleBob):0;
    courier.position.set(state.player.x,frozen&&!rebuilt?courier.position.y:0.12+bob,state.player.y);
    if(!frozen){
      const edge=content.camera.edge;
      const nearBoss=state.boss&&Math.hypot(state.player.x-content.boss.center[0]-0.5,state.player.y-content.boss.center[1]-0.5)<content.camera.bossRange;
      const weight=nearBoss?content.camera.bossWeight:0;
      const x=THREE.MathUtils.clamp(state.player.x*(1-weight)+(content.boss.center[0]+0.5)*weight,edge,content.grid-edge);
      const z=THREE.MathUtils.clamp(state.player.y*(1-weight)+(content.boss.center[1]+0.5)*weight,edge,content.grid-edge);
      const blend=rebuilt?1:1-Math.exp(-content.camera.followRate*dt);
      focus.x+=(x-focus.x)*blend;focus.z+=(z-focus.z)*blend;
      camera.position.copy(focus).add(cameraOffset);camera.lookAt(focus);
    }
    lastX=state.player.x;lastZ=state.player.y;ring.visible=state.protection>0;
    courierToy.visible=state.protection<=0||Math.floor(clock*10)%2===0;
    monsterToys.forEach((obj,i)=>{
      const m=state.monsters[i],data=obj.userData,sleeping=m.stun>0||state.nap>0;
      obj.position.set(m.x,0.15+(m.type==='ghost'?0.35:0)+(live?Math.sin(clock*3+i)*0.06:0),m.y);
      if(!frozen){
        data.body.scale.set(1+Math.sin(clock*4+i)*0.055,1-Math.sin(clock*4+i)*0.07,1);
        obj.rotation.y=Math.atan2(state.player.x-m.x,state.player.y-m.y);
        data.pupils.forEach(eye=>eye.scale.y=(sleeping||Math.sin(clock*1.4+i)>0.994)?0.012:0.085);
        data.wings.forEach((wing,j)=>wing.rotation.z=Math.sin(clock*9)*(j?1:-1)*0.45);
      }
      data.badge.visible=m.state==='warn'||m.state==='chase'||sleeping;
      data.badge.material=sleeping?sleepMaterial:warningMaterial;
      if(sleeping)data.badge.scale.set(0.8,0.4,1);else data.badge.scale.set(0.45,0.45,1);
    });
    glowRing.visible=state.pulse>0;glowRing.scale.setScalar((1-state.pulse/0.6)*content.lantern.radius/0.43);
    treasure.forEach((gem,i)=>{
      const visible=!state.gems.has(i);
      if(!rebuilt&&gem.visible&&!visible)burst(gem.position.x,gem.position.z,8,feel.pickupSeconds);
      gem.visible=visible;if(!frozen)gem.rotation.y=clock*1.5;
    });
    lanterns.forEach((lantern,i)=>{lantern.visible=!state.lanternPickups.has(i);});
    if(state.boss&&bossToy){
      const sleeping=state.boss.state==='sleeping',dizzy=state.boss.state==='dizzy';
      if(state.phase==='win')bossToy.position.set(state.level.goal[0]-0.7,0.15,state.level.goal[1]-0.5);
      if(!frozen){
        bossToy.position.y=sleeping?0.15:0.35+Math.sin(clock*2)*0.12;
        bossToy.rotation.z=dizzy?Math.sin(clock*3)*0.12:0;
        bossToy.rotation.y=Math.atan2(state.player.x-bossToy.position.x,state.player.y-bossToy.position.z);
      }
      bossToy.userData.sleep.visible=sleeping||dizzy;
      bossToy.userData.eyes.forEach(eye=>eye.scale.y=sleeping?0.015:0.14);
      wave.visible=state.boss.state==='wave'||state.boss.state==='warn';
      wave.scale.setScalar(state.boss.state==='wave'?state.boss.radius/0.43:1+Math.sin(clock*3)*0.08);
      bells.forEach((bell,i)=>{
        const delivered=state.boss.bells.includes(i);
        if(delivered&&!bell.userData.delivered)burst(bell.position.x,bell.position.z,24,feel.celebrationSeconds);
        bell.userData.delivered=delivered;
        bell.userData.halo.visible=dizzy&&!delivered;
        bell.scale.setScalar(delivered?0.8:1);
      });
    }
    parcels.forEach((obj,i)=>{
      const visible=!state.collected.has(i);
      if(!rebuilt&&obj.visible&&!visible)burst(obj.position.x,obj.position.z,10,feel.pickupSeconds);
      obj.visible=visible;
      if(!frozen)obj.position.y=0.20+(live?Math.sin(clock*2.5+i)*0.035:0);
    });
    clouds.forEach((obj,i)=>{
      const sleeping=state.nap>0;
      obj.position.set(state.clouds[i].x,frozen&&!rebuilt?obj.position.y:0.82+(live?Math.sin(clock*2+i)*0.055:0),state.clouds[i].y);
      obj.userData.sleep.visible=sleeping;
      for(const child of obj.children)if(child.isMesh)child.material=material(sleeping?p.sleeping:p.white);
    });
    let active=0;
    for(let i=0;i<sparks.length;i++){
      const s=sparks[i];
      if(s.life>0){
        s.life=Math.max(0,s.life-dt);s.x+=s.vx*dt;s.y+=s.vy*dt;s.z+=s.vz*dt;s.vy-=2.5*dt;
        const scale=0.065*s.life/s.total;matrix.makeScale(scale,scale,scale);matrix.setPosition(s.x,s.y,s.z);active++;
      }else matrix.makeScale(0,0,0);
      particles.setMatrixAt(i,matrix);
    }
    particles.visible=active>0;particles.instanceMatrix.needsUpdate=true;
    if(celebration>0)courier.position.y+=Math.abs(Math.sin(clock*8))*0.16;
    renderer.render(scene,camera);frames++;dirty=false;
  }
  return {
    draw,reset,loop:fn=>renderer.setAnimationLoop(fn),
    stats:()=>({engine:THREE.REVISION,frames,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,assetTriangles:{...assetTriangles},bossVisible:!!bossToy,bossPose:bossToy?{x:bossToy.position.x,z:bossToy.position.z}:null,loadedModels:models.size,expectedModels:Object.keys(content.models).length,failedModels:[...failedModels],pixelRatio:renderer.getPixelRatio(),shadowMapSize:sun.shadow.mapSize.x,pose:{x:courier.position.x,y:courier.position.y,z:courier.position.z,yaw:courierToy.rotation.y},sleepingClouds:clouds.filter(c=>c.userData.sleep.visible).length,particles:sparks.filter(s=>s.life>0).length})
  };
}
