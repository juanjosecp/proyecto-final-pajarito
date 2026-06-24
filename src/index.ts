import { Obj3D } from './Obj3D.js';
import { CvZbuf } from './CvZbuf.js';

let canvas: HTMLCanvasElement;
let graphics: CanvasRenderingContext2D;

canvas = <HTMLCanvasElement>document.getElementById('circlechart');
graphics = canvas.getContext('2d');

let cv: CvZbuf;
let obj: Obj3D;

let baseObj: Obj3D | null = null;
let movilObj: Obj3D | null = null;

function repaintAll() {
  if (!cv) cv = new CvZbuf(graphics, canvas);
  cv = new CvZbuf(graphics, canvas);
  
  if (baseObj) cv.addObj(baseObj);
  if (movilObj) cv.addObj(movilObj);
  
  if (baseObj) obj = baseObj;
  else if (movilObj) obj = movilObj;
  
  let totalVerts = 0;
  let totalTris = 0;
  
  if (baseObj) {
    totalVerts += baseObj.w.length - 1;
    totalTris += baseObj.getPolyList().length;
  }
  if (movilObj) {
    totalVerts += movilObj.w.length - 1;
    totalTris += movilObj.getPolyList().length;
  }
  
  const vEl = document.getElementById('stat-verts');
  if (vEl) vEl.innerText = totalVerts.toString();
  const tEl = document.getElementById('stat-tris');
  if (tEl) tEl.innerText = totalTris.toString();
  
  cv.paint();
}

function vp(dTheta:number, dPhi:number, fRho:number):void{
  if (cv && cv.getObjs().length > 0) {
    cv.getObjs().forEach(o => o.vp(cv, dTheta, dPhi, fRho));
  }
}



function leerArchivoBase(e:any) {
  var archivo = e.target.files[0];
  if (!archivo) return;
  const nameEl = document.getElementById('file-name-base');
  if (nameEl) nameEl.innerText = archivo.name;
  var lector = new FileReader();
  lector.onload = function(ev) {
    var contenido = ev.target.result as string;
    
    let tempObj = new Obj3D();
    if (tempObj.read(contenido)) {
      tempObj.baseColorR = 190; tempObj.baseColorG = 190; tempObj.baseColorB = 190;
      baseObj = tempObj;
      if (sharedRho > 0) baseObj.rho = sharedRho;
      baseObj.theta = sharedTheta;
      baseObj.phi = sharedPhi;
      baseObj.globalRotY = sharedGlobalRotY;
      repaintAll();
    }
  };
  lector.readAsText(archivo);
}

function leerArchivoMovil(e:any) {
  var archivo = e.target.files[0];
  if (!archivo) return;
  const nameEl = document.getElementById('file-name-movil');
  if (nameEl) nameEl.innerText = archivo.name;
  var lector = new FileReader();
  lector.onload = function(ev) {
    var contenido = ev.target.result as string;
    
    let tempObj = new Obj3D();
    if (tempObj.read(contenido)) {
      tempObj.baseColorR = 190; tempObj.baseColorG = 190; tempObj.baseColorB = 190;
      tempObj.pivotX = 0; tempObj.pivotY = 0; tempObj.pivotZ = 0;
      movilObj = tempObj;
      if (sharedRho > 0) movilObj.rho = sharedRho;
      movilObj.theta = sharedTheta;
      movilObj.phi = sharedPhi;
      movilObj.globalRotY = sharedGlobalRotY;
      repaintAll();
    }
  };
  lector.readAsText(archivo);
}

// Eventos
document.getElementById('file-input-base')?.addEventListener('change', leerArchivoBase, false);
document.getElementById('file-input-movil')?.addEventListener('change', leerArchivoMovil, false);

let Pix: number, Piy: number;
let Pfx: number, Pfy: number;
let flag: boolean = false;

// Manipulación 360 (Ratón)
function handleMouse(evento: any) {
  Pix = evento.offsetX;
  Piy = evento.offsetY;
  flag = true;
}

function makeVizualization(evento: any) {
  if (flag && obj) {
    Pfx = evento.offsetX;
    Pfy = evento.offsetY;
    let difX = Pfx - Pix;
    let difY = Pfy - Piy;
    
    // Rota la laptop en su eje (Y)
    if (baseObj) baseObj.globalRotY += difX * 0.01;
    if (movilObj) movilObj.globalRotY += difX * 0.01;
    
    // Mueve la tapa hacia arriba/abajo
    if (movilObj) {
       let ang = movilObj.localRotX + difY * 0.02;
       if (ang < -0.5) ang = -0.5;
       if (ang > 1.1) ang = 1.1;
       movilObj.localRotX = ang;
       
       const apSlider = <HTMLInputElement>document.getElementById('input-apertura');
       if (apSlider) {
         let deg = Math.round((-ang * 180) / Math.PI);
         apSlider.value = deg.toString();
         const valApertura = document.getElementById('val-apertura');
         if (valApertura) valApertura.innerText = deg + '°';
       }
    }
    
    cv.paint();
    Pix = Pfx;
    Piy = Pfy;
  }
}

function noDraw() {
  flag = false;
}

canvas.addEventListener('mousedown', handleMouse);
canvas.addEventListener('mouseup', noDraw);
canvas.addEventListener('mousemove', makeVizualization);
canvas.addEventListener('mouseleave', noDraw);

// Touch events para Celulares
function handleTouchStart(evento: TouchEvent) {
  if (evento.touches.length > 0) {
    let rect = canvas.getBoundingClientRect();
    Pix = evento.touches[0].clientX - rect.left;
    Piy = evento.touches[0].clientY - rect.top;
    flag = true;
  }
}

function handleTouchMove(evento: TouchEvent) {
  if (flag && obj && evento.touches.length > 0) {
    evento.preventDefault(); // Evita que la pantalla haga scroll al mover la pieza
    let rect = canvas.getBoundingClientRect();
    Pfx = evento.touches[0].clientX - rect.left;
    Pfy = evento.touches[0].clientY - rect.top;
    let difX = Pfx - Pix;
    let difY = Pfy - Piy;
    
    if (baseObj) baseObj.globalRotY += difX * 0.01;
    if (movilObj) movilObj.globalRotY += difX * 0.01;
    
    if (movilObj) {
       let ang = movilObj.localRotX + difY * 0.02;
       if (ang < -0.5) ang = -0.5;
       if (ang > 1.1) ang = 1.1;
       movilObj.localRotX = ang;
    }
    
    cv.paint();
    Pix = Pfx;
    Piy = Pfy;
  }
}

canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
canvas.addEventListener('touchend', noDraw);
canvas.addEventListener('touchcancel', noDraw);


// Resize handling básico
function resizeCanvas() {
  const container = document.getElementById('canvas-container');
  if (container) {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    if (obj && cv) {
      cv.paint();
    }
  }
}

window.addEventListener('resize', resizeCanvas);
setTimeout(resizeCanvas, 100);

// D-Pad Rotation Handling
let manualRotationInterval: number;

function startManualRotation(dTheta: number, dPhi: number, fRho: number = 1) {
  if (!obj) return;
  
  const applyRotation = () => {
    if (dTheta !== 0) {
       if (baseObj) baseObj.globalRotY += dTheta;
       if (movilObj) movilObj.globalRotY += dTheta;
    }
    if (fRho !== 1) {
       vp(0, 0, fRho);
    }
    if (dPhi !== 0 && movilObj) {
        let ang = movilObj.localRotX - dPhi * 0.5;
        if (ang < -0.5) ang = -0.5;
        if (ang > 1.1) ang = 1.1;
        movilObj.localRotX = ang;
        
        const apSlider = <HTMLInputElement>document.getElementById('input-apertura');
        if (apSlider) {
          let deg = Math.round((-ang * 180) / Math.PI);
          apSlider.value = deg.toString();
          const valApertura = document.getElementById('val-apertura');
          if (valApertura) valApertura.innerText = deg + '°';
        }
        cv.paint();
    }
  };

  applyRotation();
  clearInterval(manualRotationInterval);
  manualRotationInterval = window.setInterval(applyRotation, 30);
}

function stopManualRotation() {
  clearInterval(manualRotationInterval);
}

function setupDPad() {
  const btnUp = document.getElementById('btn-rot-up');
  const btnDown = document.getElementById('btn-rot-down');
  const btnLeft = document.getElementById('btn-rot-left');
  const btnRight = document.getElementById('btn-rot-right');
  const btnZoomIn = document.getElementById('btn-zoom-in');
  const btnZoomOut = document.getElementById('btn-zoom-out');

  const addHoldEvents = (btn: HTMLElement, dTheta: number, dPhi: number, fRho: number = 1) => {
    if (!btn) return;
    btn.addEventListener('mousedown', () => startManualRotation(dTheta, dPhi, fRho));
    btn.addEventListener('mouseup', stopManualRotation);
    btn.addEventListener('mouseleave', stopManualRotation);
    
    // Touch support for mobile
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); startManualRotation(dTheta, dPhi, fRho); });
    btn.addEventListener('touchend', (e) => { e.preventDefault(); stopManualRotation(); });
    btn.addEventListener('touchcancel', (e) => { e.preventDefault(); stopManualRotation(); });
  };

  const rotSpeed = 0.05; // Base rotation speed for D-pad
  addHoldEvents(btnUp, 0, rotSpeed);
  addHoldEvents(btnDown, 0, -rotSpeed);
  addHoldEvents(btnLeft, -rotSpeed, 0);
  addHoldEvents(btnRight, rotSpeed, 0);
  
  // Zoom functionality for buttons (continuous)
  addHoldEvents(btnZoomIn, 0, 0, 0.95);
  addHoldEvents(btnZoomOut, 0, 0, 1.05);
}
setupDPad();

// Mouse wheel zoom
canvas.addEventListener('wheel', (e) => {
  e.preventDefault(); // Stop page from scrolling
  if (!obj) return;
  if (e.deltaY < 0) {
    vp(0, 0, 0.9); // Zoom in
  } else {
    vp(0, 0, 1.1); // Zoom out
  }
});

// Cargar pinza por defecto al iniciar
let sharedTheta = -Math.PI / 2;
let sharedPhi = 0.1;
let sharedGlobalRotY = 0; // verla de frente
let sharedRho = 0;

window.addEventListener('load', () => {
  cv = new CvZbuf(graphics, canvas);
  
  fetch('./laptop_base.txt')
    .then(response => response.text())
    .then(data => {
      let tempObj = new Obj3D();
      if (tempObj.read(data)) {
          tempObj.baseColorR = 190; tempObj.baseColorG = 190; tempObj.baseColorB = 190;
          tempObj.targetY = 1.5; // Centramos la figura verticalmente
          tempObj.theta = sharedTheta;
          tempObj.phi = sharedPhi;
          tempObj.globalRotY = sharedGlobalRotY;
          tempObj.rho = 1.5 * tempObj.rhoMin; // Aún más cerca para pantallas de celular
          sharedRho = tempObj.rho;
          baseObj = tempObj;
          if (movilObj) movilObj.rho = sharedRho; // Sync si tapa cargó primero
          
          const nameEl = document.getElementById('file-name-base');
          if (nameEl) nameEl.innerText = 'laptop_base.txt';
          repaintAll();
      }
    })
    .catch(err => console.error("Error loading base:", err));

  fetch('./laptop_tapa.txt')
    .then(response => response.text())
    .then(data => {
      let tempObj = new Obj3D();
      if (tempObj.read(data)) {
          tempObj.baseColorR = 190; tempObj.baseColorG = 190; tempObj.baseColorB = 190;
          tempObj.pivotX = 0; tempObj.pivotY = 0.35; tempObj.pivotZ = -1.75;
          tempObj.targetY = 1.5; 
          
          tempObj.theta = sharedTheta;
          tempObj.phi = sharedPhi;
          tempObj.globalRotY = sharedGlobalRotY;
          if (sharedRho > 0) {
              tempObj.rho = sharedRho; 
          }
          movilObj = tempObj;
          
          const nameEl = document.getElementById('file-name-movil');
          if (nameEl) nameEl.innerText = 'laptop_tapa.txt';
          repaintAll();
      }
    })
    .catch(err => console.error("Error loading tapa:", err));
    
    // Color Palette Listeners
    document.getElementById('color-pink')?.addEventListener('click', () => {
      if (baseObj) { baseObj.baseColorR = 255; baseObj.baseColorG = 182; baseObj.baseColorB = 193; }
      if (movilObj) { movilObj.baseColorR = 255; movilObj.baseColorG = 182; movilObj.baseColorB = 193; }
      repaintAll();
    });
    document.getElementById('color-blue')?.addEventListener('click', () => {
      if (baseObj) { baseObj.baseColorR = 173; baseObj.baseColorG = 216; baseObj.baseColorB = 230; }
      if (movilObj) { movilObj.baseColorR = 173; movilObj.baseColorG = 216; movilObj.baseColorB = 230; }
      repaintAll();
    });
    document.getElementById('color-green')?.addEventListener('click', () => {
      if (baseObj) { baseObj.baseColorR = 152; baseObj.baseColorG = 251; baseObj.baseColorB = 152; }
      if (movilObj) { movilObj.baseColorR = 152; movilObj.baseColorG = 251; movilObj.baseColorB = 152; }
      repaintAll();
    });
    
    // Lighting Sliders Listeners
    const lightDirX = document.getElementById('light-dir-x') as HTMLInputElement;
    const valLightDirX = document.getElementById('val-light-dir-x');
    lightDirX?.addEventListener('input', (e) => {
      let val = parseFloat((e.target as HTMLInputElement).value);
      if (valLightDirX) valLightDirX.innerText = val.toFixed(1);
      if (baseObj) baseObj.sunX = val;
      repaintAll();
    });
    
    const lightBright = document.getElementById('light-bright') as HTMLInputElement;
    const valLightBright = document.getElementById('val-light-bright');
    lightBright?.addEventListener('input', (e) => {
      let val = parseFloat((e.target as HTMLInputElement).value);
      if (valLightBright) valLightBright.innerText = val.toFixed(1);
      if (baseObj) baseObj.lightBright = val * 50; // amplify effect
      repaintAll();
    });
    
    const lightShadow = document.getElementById('light-shadow') as HTMLInputElement;
    const valLightShadow = document.getElementById('val-light-shadow');
    lightShadow?.addEventListener('input', (e) => {
      let val = parseFloat((e.target as HTMLInputElement).value);
      if (valLightShadow) valLightShadow.innerText = val.toFixed(1);
      if (baseObj) baseObj.lightShadow = val;
      repaintAll();
    });

    // D-Pad Rotation Listeners (Continuous rotation while held)
    let rotInterval: any = null;

    function startRotation(type: string) {
      if (rotInterval) clearInterval(rotInterval);
      rotInterval = setInterval(() => {
        if (type === 'left') {
          if (baseObj) baseObj.globalRotY -= 0.04;
          if (movilObj) movilObj.globalRotY -= 0.04;
        } else if (type === 'right') {
          if (baseObj) baseObj.globalRotY += 0.04;
          if (movilObj) movilObj.globalRotY += 0.04;
        } else if (type === 'up') {
          if (movilObj) {
             let ang = movilObj.localRotX - 0.04;
             if (ang < -0.5) ang = -0.5;
             if (ang > 1.1) ang = 1.1;
             movilObj.localRotX = ang;
          }
        } else if (type === 'down') {
          if (movilObj) {
             let ang = movilObj.localRotX + 0.04;
             if (ang < -0.5) ang = -0.5;
             if (ang > 1.1) ang = 1.1;
             movilObj.localRotX = ang;
          }
        }
        repaintAll();
      }, 30); // 30ms interval for smooth animation
    }

    function stopRotation() {
      if (rotInterval) {
        clearInterval(rotInterval);
        rotInterval = null;
      }
    }

    const dpadIds = ['btn-rot-left', 'btn-rot-right', 'btn-rot-up', 'btn-rot-down'];
    const dpadTypes = ['left', 'right', 'up', 'down'];

    dpadIds.forEach((id, index) => {
      const btn = document.getElementById(id);
      if (btn) {
        ['mousedown', 'touchstart'].forEach(evt => {
          btn.addEventListener(evt, (e) => { 
            e.preventDefault(); // Prevent text selection/zooming on mobile
            startRotation(dpadTypes[index]); 
          });
        });
        ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach(evt => {
          btn.addEventListener(evt, stopRotation);
        });
      }
    });
});