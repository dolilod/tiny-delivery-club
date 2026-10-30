window.CONTENT = {
  grid: 12,
  defaults: { courier: 'DEFAULT: friendly robot, awaiting son’s choice', names: 'DEFAULT: awaiting son’s choice', maps: 'DEFAULT: proposed routes, no child drawing supplied', ending: 'DEFAULT: short clubhouse party ending, awaiting son’s choice', houseRule: 'DEFAULT: level 4 parcel pickup gives both clouds a two-second nap, awaiting son’s choice' },
  palette: { ground: 0xeaf3df, alternate: 0xe0ecd3, wall: 0x48665d, wallTop: 0x66877a, robot: 0x258e9b, ink: 0x203d43, parcel: 0xf3b943, house: 0xe88765, roof: 0xad5550, white: 0xffffff, sky:0xffffff, sunlight:0xfff0d6, sleeping:0x869da8 },
  rules: { speed: 2.8, radius: 0.23, contact: 0.43, hearts: 3, protection: 1.5, cloudSpeed: 0.8, relaxedFactor: 0.5 },
  languages: ['id','en'],
  modes: ['relaxed','adventure'],
  theme: { page:'#f8f4e9', ink:'#203d43', muted:'#57746d', paper:'#ffffff', border:'#e0e5d9', accent:'#246c71', hover:'#184f54', focus:'#bb681d', shadow:'#dbe3d3', pad:'#e0e8dd', padEdge:'#c5d4c5' },
  symbols: { up:'▲',down:'▼',left:'◀',right:'▶', sleep:'zzz' },
  sounds: { pickup: { notes:[880],duration:0.12,volume:0.05 }, bump: { notes:[160],duration:0.15,volume:0.04 }, win: { notes:[523.25,659.25,783.99],duration:0.13,volume:0.04 } },
  strings: {
    id: { title: 'Klub Kurir Kecil', subtitle: 'Paket kecil. Petualangan besar.', start: 'Mulai', pause: 'Jeda', resume: 'Lanjutkan', replay: 'Main Lagi', next: 'Berikutnya', retry: 'Coba Lagi', ready: 'Ambil semua bintang, lalu pulang ke klub.', playing: 'Ayo antar paket!', paused: 'Istirahat sebentar.', win: 'Semua paket sampai!', remaining: 'Masih ada {n} paket.', parcels: 'Paket', level: 'Rute', controls: 'Panah / WASD • tahan tombol arah', up: 'Atas', down: 'Bawah', left: 'Kiri', right: 'Kanan', credits: 'Kredit' }
  },
  levels: [
    { name: { id: 'Pengiriman Pertama', en: 'First Delivery' }, spawn: [1,1], goal: [10,10], parcels: [[6,1],[1,6],[5,4],[10,2],[9,9]], walls: [[3,2],[3,3],[3,4],[7,4],[7,5],[7,6],[8,6],[9,6]], clouds: [] },
    { name: { id: 'Jalan Memutar', en: 'The Long Way Round' }, spawn: [1,1], goal: [10,10], parcels: [[6,1],[1,6],[5,4],[10,2],[9,9]], walls: [[3,1],[3,2],[3,3],[3,4],[3,5],[7,4],[7,5],[7,6],[8,6],[9,6]], clouds: [] },
    { name: { id: 'Penyeberangan Mengantuk', en: 'Sleepy Crossing' }, spawn: [1,1], goal: [10,10], parcels: [[6,1],[1,6],[5,4],[6,5],[10,2],[9,9]], walls: [[3,1],[3,2],[3,4],[3,5],[7,4],[7,5],[7,6],[8,6],[9,6]], clouds: [{route:[[2,3],[3,3],[4,3],[5,3]]}] },
    { name: { id: 'Pesta di Klub', en: 'Clubhouse Party' }, napSeconds: 2, spawn: [1,1], goal: [10,10], parcels: [[2,2],[6,1],[1,6],[5,4],[6,5],[10,2],[9,9]], walls: [[3,1],[3,2],[3,4],[3,5],[5,2],[5,3],[7,4],[7,5],[7,6],[8,6],[9,6]], clouds: [{route:[[2,3],[3,3],[4,3]]},{route:[[4,5],[5,5],[6,5]]}] }
  ]
};
Object.assign(window.CONTENT.strings.id, { relaxed: 'Santai', adventure: 'Petualangan', mode: 'Mode', hearts: 'Hati', lose: 'Ayo coba lagi. Kamu bisa!', bump: 'Ups! Kembali ke awal.', protected: 'Terlindung', cloud: 'Awan' });
Object.assign(window.CONTENT.strings.id, { ending: 'Paket tiba. Teman-teman siap berpesta! Terima kasih, kurir kecil.' });
Object.assign(window.CONTENT.strings.id, { sleeping: 'Awan tidur', napHint: 'Ambil bintang: kedua awan tidur 2 detik.', awake: 'Awan bergerak lagi.' });
Object.assign(window.CONTENT.strings.id, { brand:'TINY DELIVERY CLUB', footer:'DEPARTEMEN PENGIRIMAN', board:'Papan permainan: robot, bintang, klub, dan jalur awan', movement:'Tombol arah', language:'Bahasa: ID', mute:'Suara: Aktif', unmute:'Suara: Mati' });
window.CONTENT.strings.en = {
  title:'Tiny Delivery Club',subtitle:'Small parcels. Big adventures.',start:'Start',pause:'Pause',resume:'Resume',replay:'Replay',next:'Next',retry:'Retry',
  ready:'Collect every star, then return to the clubhouse.',playing:'Let’s deliver!',paused:'Take a little break.',win:'Every parcel delivered!',remaining:'{n} parcels still to collect.',
  parcels:'Parcels',level:'Route',controls:'Arrows / WASD • hold a direction',up:'Up',down:'Down',left:'Left',right:'Right',credits:'Credits',
  relaxed:'Relaxed',adventure:'Adventure',mode:'Mode',hearts:'Hearts',lose:'Try again. You can do it!',bump:'Bump! Back to the start.',protected:'Protected',cloud:'Cloud',
  ending:'The parcels are here. Let the clubhouse party begin! Thank you, little courier.',
  sleeping:'Clouds asleep',napHint:'Pick up a star: both clouds nap for {n} seconds.',awake:'Clouds are moving again.',
  brand:'TINY DELIVERY CLUB',footer:'DELIVERY DEPARTMENT',board:'Game board: robot, stars, clubhouse, and cloud paths',movement:'Direction buttons',language:'Language: EN',mute:'Sound: On',unmute:'Sound: Off'
};
window.CONTENT.strings.id.napHint='Ambil bintang: kedua awan tidur {n} detik.';
window.CONTENT.credits = {
  back: {id:'Kembali bermain',en:'Back to the game'},
  title: {id:'Kredit & catatan',en:'Credits & notices'},
  paragraphs: [
    {id:'Dibuat dengan three.js 0.187.0 — kontributor three.js — Lisensi MIT.',en:'Built with three.js 0.187.0 — three.js contributors — MIT License.'},
    {id:'Arahan proyek: Doli. Bantuan pemrograman: OpenAI Codex. Desain masih memakai DEFAULT; pilihan anak belum diberikan.',en:'Project direction: Doli. Coding assistance: OpenAI Codex. Designs are DEFAULTS; the son’s choices have not yet been supplied.'},
    {id:'Model 3D: Scenario, CC BY 4.0; rincian sumber dan perubahan di bawah. Awan dan efek dibuat dalam kode; suara disintesis lokal. Scenario tidak mendukung atau mensponsori permainan ini.',en:'3D models: Scenario, CC BY 4.0; exact sources and changes below. Clouds and effects are procedural; sound is synthesized locally. Scenario does not endorse or sponsor this game.'},
    {id:'Referensi rencana: awesome-gamedev-agent-skills oleh Abhishek Barali dan kontributor — Apache License 2.0. Tidak dipasang, disalin atau dibagikan dalam proyek ini.',en:'Planning reference: awesome-gamedev-agent-skills by Abhishek Barali and contributors — Apache License 2.0. No skill files were installed, copied or redistributed in this project.'},
    {id:'Tanpa akun pemain, pelacakan, iklan, percakapan atau layanan AI. Semua sumber permainan lokal. GitHub dapat mencatat alamat IP untuk keamanan hosting jika diterbitkan nanti.',en:'No player accounts, tracking, ads, chat or AI services. All game resources are local. GitHub may log IP addresses for hosting security if published later.'}
  ],
  links: [
    {href:'./licenses/THREE-LICENSE.txt',id:'Lisensi lengkap three.js',en:'Full three.js license'},
    {href:'./licenses/SCENARIO-CC-BY-4.0.txt',id:'Pemberitahuan lisensi Scenario',en:'Scenario dataset license notice'},
    {href:'https://creativecommons.org/licenses/by/4.0/',id:'CC BY 4.0 (tautan luar)',en:'CC BY 4.0 (external link)'},
    {href:'https://github.com/gamedev-skills/awesome-gamedev-agent-skills',id:'Referensi keterampilan (tautan luar)',en:'Skill reference (external link)'}
  ]
};
// DEFAULT models/placements; replace these when the child chooses a courier and props.
window.CONTENT.models = {
  courier: { file:'courier.glb', id:'scenario:asset_VTLjiPwXDDUaQYPENSAeCR5y', prompt:'a cute rounded cartoon toy robot, glossy teal and yellow plastic', source:'https://huggingface.co/datasets/scenario-labs/3d-collection/resolve/main/assets/scenario_asset_VTLjiPwXDDUaQYPENSAeCR5y/output.glb', size:1.05, yaw:0 },
  parcel: { file:'parcel.glb', id:'scenario:asset_REqrcdST88BnqrUqbz4WehU2', prompt:'A red cartoon-style treasure chest with a white handle and a blue gem on the front.', source:'https://huggingface.co/datasets/scenario-labs/3d-collection/resolve/main/assets/scenario_asset_REqrcdST88BnqrUqbz4WehU2/output.glb', size:0.60, yaw:0 },
  house: { file:'house.glb', id:'cb0713880a588398', prompt:'Recreate this cottage.', source:'https://huggingface.co/datasets/scenario-labs/3d-collection/resolve/main/assets/cb0713880a588398/1c385e4afcbd63db.glb', size:1.10, yaw:0 },
  tree: { file:'tree.glb', id:'scenario:asset_oVt4mfv8pdyuwzkmjEDNc3MS', prompt:'low poly tree', source:'https://huggingface.co/datasets/scenario-labs/3d-collection/resolve/main/assets/scenario_asset_oVt4mfv8pdyuwzkmjEDNc3MS/output.glb', size:0.95, yaw:0 }
};
window.CONTENT.props = [[0,7],[7,0]];
window.CONTENT.assetChanges = {
  id:'Perubahan: tekstur diperkecil hingga 512 piksel, mesh dilas/disederhanakan, simpul diratakan/digabung bila sesuai; skala dan titik asal dinormalisasi saat dimuat. Pohon low-poly dipertahankan. Jika model gagal dimuat, bentuk mainan prosedural menggantikannya.',
  en:'Changes: textures resized to at most 512 px, meshes welded/simplified, nodes flattened/joined where applicable; scale and origin normalized at load. Low-poly tree retained. A procedural toy replaces any model that fails to load.'
};
window.CONTENT.feel = { idleBob:0.035, hop:0.12, walkFrequency:5, turnRate:18, pickupSeconds:0.65, celebrationSeconds:1.8 };
// DEFAULT adventure routes: authored branches, broad crossings and optional far-corner nooks.
window.CONTENT.camera = { span:4.2, followRate:5, edge:2.5, offset:[4.5,12,7], bossWeight:0.55, bossRange:5.5 };
window.CONTENT.levels.push({
  name:{id:'DEFAULT: Kebun Lentera',en:'DEFAULT: Lantern Garden'},
  spawn:[1,1],goal:[10,10],parcels:[[2,2],[10,1],[1,10],[8,8],[10,9]],
  walls:[[3,2],[3,3],[3,4],[5,6],[6,6],[7,6],[8,6],[8,3],[9,3]],
  clouds:[{route:[[4,4],[5,4],[6,4]]}]
});
window.CONTENT.monsters = {
  slime:{color:0x69c9a1,speed:0.65},
  ghost:{color:0xb9a2e5,speed:0.85},
  pumpkin:{color:0xf0a05c,speed:1.5},
  modes:{relaxed:{speed:0.5,chase:false,heartLoss:0},adventure:{speed:1,chase:true,heartLoss:1}},
  detection:3.2, release:4.5, warning:0.8, chaseSeconds:3, restSeconds:2, safeRadius:0.8
};
for(const [i,level] of window.CONTENT.levels.entries()){
  level.checkpoints=[[2,7]];
  level.monsters=[{type:'slime',route:[[4,8],[5,8],[6,8]]}];
  if(i>=1)level.monsters.push({type:'ghost',route:[[9,7],[10,7],[10,8]]});
  if(i>=2)level.monsters.push({type:'pumpkin',loop:true,route:[[8,4],[9,4],[10,4],[10,5],[9,5],[8,5]]});
}
Object.assign(window.CONTENT.strings.id,{checkpoint:'Bendera aman! Kembali ke sini jika tersenggol.',bump:'Ups! Kembali ke bendera aman.',monsterHint:'Hindari monster. Bendera adalah tempat aman.',warning:'Boo! Hantu melihatmu. Menjauh atau berlindung!',lose:'Istirahat dulu. Coba lagi, kamu bisa!'});
Object.assign(window.CONTENT.strings.en,{checkpoint:'Safe flag! Bumps return you here.',bump:'Oops! Back to your safe flag.',monsterHint:'Dodge monsters. Flags are safe places.',warning:'Boo! The ghost sees you. Move away or hide!',lose:'Take a breath. Try again, you can do it!'});
window.CONTENT.originalWork={
  title:{id:'Aset petualangan orisinal',en:'Original adventure assets'},
  id:'Karya orisinal untuk proyek ini: slime mint, hantu lavender, labu bersayap, Raja Awan, lonceng, bendera aman, permata, lentera, genangan dan cincin kilau. Dibuat dari geometri three.js dalam scene.js; animasi dan suara disintesis lokal. Tanpa unduhan model baru atau layanan pembuat gambar/model.',
  en:'Original work for this project: mint slime, lavender ghost, winged pumpkin, Cloud King, bells, safe flags, gems, lanterns, puddles and glow rings. Authored with three.js geometry in scene.js; animation and sound generated locally. No new model downloads or image/model services.'
};
window.CONTENT.lantern={startCharges:1,maxCharges:3,radius:3.5,seconds:3,cooldown:0.5};
window.CONTENT.hazards={puddleFactor:0.5};
window.CONTENT.symbols.warning='!';
for(const level of window.CONTENT.levels){
  level.treasure=[[10,0],[0,10],[5,10]];
  level.lanterns=[[2,2],[10,8]];
  level.puddles=[[4,9],[5,9]];
}
Object.assign(window.CONTENT.sounds,{
  boo:{notes:[330,294],duration:0.11,volume:0.025},
  stun:{notes:[784,1047,1319],duration:0.08,volume:0.025},
  checkpoint:{notes:[659,988],duration:0.10,volume:0.025},
  treasure:{notes:[1175],duration:0.09,volume:0.025},
  boss:{notes:[262,330,392],duration:0.16,volume:0.025}
});
Object.assign(window.CONTENT.strings.id,{
  treasure:'Permata',lantern:'Lentera',stun:'Kilau',stunned:'Kilau! Monster beristirahat sebentar.',
  lanternFound:'Lentera ditemukan! Tekan Kilau / Spasi / E.',
  controls:'Panah / WASD • Spasi / E: kilau',
  ready:'Ambil paket bintang, cari permata, lalu pulang ke klub.'
});
Object.assign(window.CONTENT.strings.en,{
  treasure:'Gems',lantern:'Lantern',stun:'Glow',stunned:'Glow! Nearby monsters take a little rest.',
  lanternFound:'Lantern found! Press Glow / Space / E.',
  controls:'Arrows / WASD • Space / E: glow',
  ready:'Collect star parcels, find gems, then return to the club.'
});
window.CONTENT.boss={
  name:{id:'DEFAULT: Raja Awan Gumam',en:'DEFAULT: King Grumble Cloud'},
  center:[6,4],bells:[[3,5],[6,8],[9,5]],hits:3,color:0xc1b3e6,
  phases:['warn','wave','dizzy','sleeping'],
  modes:{
    relaxed:{warn:2,wave:5,dizzy:12,waveSpeed:1.35,waveDamage:false},
    adventure:{warn:1.6,wave:4,dizzy:7,waveSpeed:1.8,waveDamage:true}
  },ringWidth:0.28
};
window.CONTENT.levels.push({
  name:{id:'DEFAULT: Lagu untuk Raja Awan',en:'DEFAULT: A Lullaby for the Cloud King'},
  boss:true,spawn:[1,10],goal:[10,10],parcels:[[2,9],[6,10],[10,9]],
  walls:[[1,2],[2,2],[3,2],[8,2],[9,2],[10,2],[1,6],[10,6]],
  clouds:[],checkpoints:[[2,7]],monsters:[{type:'slime',route:[[4,3],[5,3],[6,3]]}],
  treasure:[[0,0],[11,0],[0,10]],lanterns:[[2,8],[10,8]],puddles:[[4,9],[8,9]]
});
Object.assign(window.CONTENT.strings.id,{
  bossHealth:'Raja Awan',bossWarn:'Raja Awan bersiap! Jauhi lingkaran.',
  bossWave:'Hindari lingkaran! Bendera tetap aman.',
  bossDizzy:'Raja mengantuk! Antar paket ke lonceng bercahaya.',
  bossNeedParcel:'Ambil paket pengantar tidur dulu.',
  bossFriendly:'Raja Awan jadi teman! Pulang ke klub.',
  bossLocked:'Antar tiga paket ke lonceng saat Raja beristirahat.',
  ending:'Paket tiba! Raja Awan tidur damai dan ikut pesta. Terima kasih, kurir kecil!'
});
Object.assign(window.CONTENT.strings.en,{
  bossHealth:'Cloud King',bossWarn:'The Cloud King is getting ready! Watch for the ring.',
  bossWave:'Dodge the ring! Flags stay safe.',
  bossDizzy:'The King is sleepy! Deliver a parcel to a glowing bell.',
  bossNeedParcel:'Collect a lullaby parcel first.',
  bossFriendly:'The Cloud King is your friend! Return to the club.',
  bossLocked:'Deliver three parcels to bells while the King rests.',
  ending:'Delivered! The Cloud King is your sleepy friend. Time for the clubhouse party!'
});
