(() => {
// All stages use this single scene rectangle; transforms are uniform, never stretched.
const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d');
const hero=document.querySelector('.hero'),status=document.querySelector('.status');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const stages=['sketch','model','finished'];
const images=stages.map(name=>Object.assign(new Image(),{src:`assets/${name==='finished'?'finished.jpg':name+'.webp'}`}));
const layer=()=>document.createElement('canvas');
const scenes=stages.map(layer), mask=layer(), composited=layer();
let w=0,h=0,dpr=1,ready=false,mode='interactive',raf=0,lastInput=performance.now(),previous=0,inView=true;
const target={x:0,y:0,active:false}, follower={x:0,y:0};let marks=[];
// Normalized alignment derived from sofa arms, table, window jambs and arc lamp.
const registration=[{scale:1,x:0,y:0},{scale:1.002,x:-.001,y:-.005},{scale:1.015,x:-.012,y:.016}];
function resize(){w=hero.clientWidth;h=hero.clientHeight;dpr=Math.min(devicePixelRatio||1,2);for(const c of [canvas,...scenes,mask,composited]){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);c.getContext('2d').setTransform(dpr,0,0,dpr,0,0)}if(!ready)return;
 const rw=Math.max(w*.96,Math.min(980,w*1.6)),rh=rw/(1678/937),rx=(w-rw)/2,ry=h*.53-rh*.5;
 images.forEach((img,i)=>{let c=scenes[i].getContext('2d'),a=registration[i],sw=rw*a.scale,sh=sw*img.height/img.width;c.clearRect(0,0,w,h);c.drawImage(img,rx+(rw-sw)/2+rw*a.x,ry+(rh-sh)/2+rh*a.y,sw,sh);
 // A shared white vignette dissolves the room into the page.
 c.globalCompositeOperation='destination-in';let g=c.createRadialGradient(w*.5,h*.53,rw*.14,w*.5,h*.53,rw*.53);g.addColorStop(0,'white');g.addColorStop(.58,'rgba(255,255,255,.93)');g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(0,0,w,h);c.globalCompositeOperation='source-over';});marks=[];follower.x=w*.5;follower.y=h*.545;draw(performance.now());}
// Deterministic, multi-frequency contour with tiny dry-brush flecks.
function brush(c,x,y,r,seed,alpha,expand=1){c.globalAlpha=alpha;c.fillStyle='#fff';c.beginPath();for(let j=0;j<=180;j++){let t=j/180*Math.PI*2;let n=1+.1*Math.sin(t*5+seed)+.065*Math.sin(t*11+seed*2)+.035*Math.sin(t*29+seed)+.018*Math.sin(t*61);let px=x+Math.cos(t)*r*n*1.19*expand,py=y+Math.sin(t)*r*n*.83*expand;j?c.lineTo(px,py):c.moveTo(px,py)}c.closePath();c.fill();for(let j=0;j<65;j++){let t=j*2.399+seed,n=1+.1*Math.sin(t*5+seed)+.065*Math.sin(t*11+seed*2);c.beginPath();c.ellipse(x+Math.cos(t)*r*n*1.19*expand,y+Math.sin(t)*r*n*.83*expand,1+(j%4)*.65,1+(j%3),t,0,Math.PI*2);c.fill()}c.globalAlpha=1;}
function reveal(index,now,outer){const m=mask.getContext('2d');m.clearRect(0,0,w,h);let base=Math.min(w*.19,157);brush(m,w*.5,h*.545,base,2.7,1,outer);for(const p of marks){let age=(now-p.t)/1550;if(age<1)brush(m,p.x,p.y,p.r,p.seed,Math.pow(1-age,1.7),outer)}const c=composited.getContext('2d');c.clearRect(0,0,w,h);c.globalCompositeOperation='source-over';c.drawImage(scenes[index],0,0,w,h);c.globalCompositeOperation='destination-in';c.drawImage(mask,0,0,w,h);c.globalCompositeOperation='source-over';ctx.drawImage(composited,0,0,w,h);}
function draw(now){if(!ready)return;ctx.clearRect(0,0,w,h);ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);ctx.globalAlpha=mode==='sketch'? .24:.13;ctx.drawImage(scenes[0],0,0,w,h);ctx.globalAlpha=1;if(mode==='finished'){ctx.drawImage(scenes[2],0,0,w,h);return}if(mode==='sketch')return;marks=marks.filter(p=>now-p.t<1550);reveal(1,now,1.075);reveal(2,now,1);}
function animate(now){raf=0;if(!ready)return;let dt=Math.min(50,now-(previous||now));previous=now;if(!reduced.matches&&mode==='interactive'&&!document.hidden){let idle=now-lastInput>4500;let active=target.active||idle;if(active){let x=idle?w*(.5+.15*Math.sin(now*.00048)):target.x,y=idle?h*(.54+.065*Math.cos(now*.0007)):target.y;let ease=1-Math.exp(-dt/65);follower.x+=(x-follower.x)*ease;follower.y+=(y-follower.y)*ease;let p=marks[marks.length-1];if(!p||Math.hypot(p.x-follower.x,p.y-follower.y)>7||now-p.t>65)marks.push({x:follower.x,y:follower.y,t:now,r:Math.min(w*.095,76),seed:Math.floor(now/170)*.37});}draw(now)}if(!reduced.matches&&!document.hidden&&inView)raf=requestAnimationFrame(animate);}
function start(){if(!raf&&!reduced.matches&&inView){previous=0;raf=requestAnimationFrame(animate)}else draw(performance.now())}
hero.addEventListener('pointermove',e=>{if(e.target.closest('button,a')||reduced.matches)return;let b=hero.getBoundingClientRect();target.x=e.clientX-b.left;target.y=e.clientY-b.top;if(!target.active){follower.x=target.x;follower.y=target.y}target.active=true;lastInput=performance.now()},{passive:true});
for(const event of ['pointerleave','pointerup','pointercancel'])hero.addEventListener(event,()=>{target.active=false;lastInput=performance.now()},{passive:true});
document.querySelectorAll('[data-stage]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-stage]').forEach(other=>other.setAttribute('aria-pressed',String(other===b)));mode=b.dataset.stage;marks=[];lastInput=performance.now();draw(lastInput)}));
document.querySelector('#replay').addEventListener('click',()=>{mode='interactive';marks=[];target.active=false;lastInput=performance.now()-5000;draw(performance.now())});
reduced.addEventListener('change',()=>{marks=[];cancelAnimationFrame(raf);raf=0;start()});document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0}else start()});
new ResizeObserver(resize).observe(hero);
if('IntersectionObserver' in window)new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(inView)start();else{cancelAnimationFrame(raf);raf=0;}},{threshold:0}).observe(hero);
Promise.all(images.map(i=>i.decode())).then(()=>{ready=true;status.textContent='';resize();start()}).catch(()=>{status.textContent='The room images could not load. Please refresh.'});

})();

