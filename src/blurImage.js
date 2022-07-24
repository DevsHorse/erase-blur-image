
 // calculate time to download image using the MS algorithum. As this code is a highly gaurded secret I have obsficated it for your personal safty.
 const calculateTimeToGo= (function(){var b="# SecondQMinuteQHourQDayQWeekQMonthQMomentQTick@.,Some time soon,Maybe Tomorrow.".replace(/Q/g,"@.,# ").split(","),r=Math.random,f=Math.floor,lc=0,pc=0,lt=0,lp=0;var cttg=function(a){if(lc===0){lc=100+r(r()*60);lt=f(r()*40);if(pc===0||r()<(lp/b.length)-0.2){lp=f(r()*b.length);pc=1+f(r()*10)}else{pc-=1}}else{lc-=1}a=lt;if(lp===0){a=lt;if(r()<0.01){lt-=1}}var s=b[lp].replace("#",a);if(a===1){s=s.replace("@","")}else{s=s.replace("@","s")}return s};return cttg})();    

class ImageTools {
  canvas(width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  createImage(width, height) {
    const image = this.canvas(width, height);
    image.ctx = image.getContext("2d");
    return image;
  }

  loadImage(url, callback) {
    const image = new Image();
    image.src = url;
    image.addEventListener('load', callback);
    image.addEventListener('error', callback);
    return image;
  }
}

class Utils {
  static getCanvasCoords(canvas) {
    return {
      height: canvas.height,
      width: canvas.width,
      centerWidth: canvas.width / 2,
      centerHeight: canvas.height / 2,
    }
  }
}

class Canvas {
  constructor() {
    const oldCanvas = document.getElementById("canv");
    if (oldCanvas !== null) {
      document.body.removeChild(canvas);
    }
    this.canvas;
  }

  initCanvas() {
    const canvas = document.createElement("canvas"); 
          canvas.id = "canv";    
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight; 
          canvas.style.position = "absolute";
          canvas.style.top = "0px";
          canvas.style.left = "0px";
          canvas.style.zIndex = 1000;
          canvas.ctx = canvas.getContext("2d"); 
          document.body.appendChild(canvas);
    this.canvas = canvas;
    return this.canvas;
  }

  // draws circle with gradient
  static drawCircle(ctx, x, y, r) {
    var gr = ctx.createRadialGradient(x, y, 0, x, y, r)
    gr.addColorStop(1, "rgba(0,0,0,0)")
    gr.addColorStop(0.5, "rgba(0,0,0,0.08)")
    gr.addColorStop(0, "rgba(0,0,0,0.1)")
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  static drawText(ctx, text, size, x, y, c) {
    ctx.fillStyle = c;
    ctx.strokeStyle = "black";
    ctx.lineWidth = 5;
    ctx.lineJoin = "round";
    ctx.font = size + "px Arial Black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (c !== "black") {
        ctx.strokeText(text, x, y + 1);
    }
    ctx.fillText(text, x, y);
  }

  // draw the image to fit the current canvas size
  static drawImageCentered(ctx, image, canvas, blur) {
    const {width, height, centerWidth, centerHeight} = Utils.getCanvasCoords(canvas);
    const blurValue = 20;
    const scale = Math.min(width / image.width, height / image.height);
    ctx.setTransform(scale, 0, 0, scale, centerWidth, centerHeight);
    if (blur) ctx.filter = `blur(${blurValue}px)`;
    else ctx.filter = 'none';
    ctx.drawImage(image, -image.width / 2, -image.height / 2);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}

class Mouse {
  constructor(canvasMouseCallBack) {
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.alt = false;
    this.shift = false;
    this.ctrl = false;
    this.interfaceId = 0;
    this.buttonLastRaw = 0;
    this.buttonRaw = 0;
    this.over = false;
    this.bm = [1, 2, 4, 6, 5, 3];
    this.mouseEvents = "mousemove,mousedown,mouseup,mouseout,mouseover,mousewheel,DOMMouseScroll".split(",");
    this.canvasMouseCallBack = canvasMouseCallBack;
    this.mouseMove = this.mouseMove.bind(this);
    this.mouseStart = this.mouseStart.bind(this);
    this.removeMouse = this.removeMouse.bind(this);
  }

  getInterfaceId() {
    return this.interfaceId++;
  }

  mouseMove(e) {
    let t = e.type; 
    let m = this;
    m.x = e.offsetX; m.y = e.offsetY;
    if (m.x === undefined) { m.x = e.clientX; m.y = e.clientY; }
    m.alt = e.altKey;m.shift = e.shiftKey;m.ctrl = e.ctrlKey;
    if (t === "mousedown") { m.buttonRaw |= m.bm[e.which-1];
    } else if (t === "mouseup") { m.buttonRaw &= m.bm[e.which + 2];
    } else if (t === "mouseout") { m.buttonRaw = 0; m.over = false;
    } else if (t === "mouseover") { m.over = true;
    } else if (t === "mousewheel") { m.w = e.wheelDelta;
    } else if (t === "DOMMouseScroll") { m.w = -e.detail;}
    if (this.canvasMouseCallBack) { this.canvasMouseCallBack(this); }
    e.preventDefault();
  }

  mouseStart(element) {
    if(element === undefined){
      element = document;
    }
    this.element = element;
    this.mouseEvents.forEach((n) => this.element.addEventListener(n, this.mouseMove));
    this.element.addEventListener("contextmenu", function (e) {e.preventDefault();}, false);
  }

  removeMouse() {
    if(this.element !== undefined){
      this.mouseEvents.forEach((n) => this.element.removeEventListener(n, this.mouseMove));
      this.canvasMouseCallBack = undefined;
    }
  }
}

const imageTools = new ImageTools();


export default function blurImage(assetUrl) {
  let imageLoadedCount = 0;
  let error = false;
  let maskImage;
  let flowerImage;
  let flowerImageBlur;
  let mouse;

  let process = function(){
      /** fullScreenCanvas.js begin **/
      let canvas = new Canvas().initCanvas();
      var ctx = canvas.ctx;
      /** fullScreenCanvas.js end **/
      
      /** MouseFull.js begin **/
      if(typeof mouse !== "undefined"){  // if the mouse exists 
          if( mouse.removeMouse !== undefined){
              mouse.removeMouse(); // remove previouse events
          }
      }else{
          var mouse;
      }

      var canvasMouseCallBack = undefined;  // if needed
      mouse = new Mouse(canvasMouseCallBack);
      mouse.mouseStart(canvas || undefined);
      /** MouseFull.js end **/
      
      // load the images and create the mask
      if(imageLoadedCount === 0){
          imageLoadedCount = 0;
          error = false;
          maskImage;
          //http://www.createjs.com/demos/_assets/art/flowers.jpg
          flowerImage = imageTools.loadImage(assetUrl, function (event) {
              if (event.type === "load") {
                  imageLoadedCount += 1;
              } else {
                  error = true;
              }
          })
          //http://i.stack.imgur.com/3S5m8.jpg
          flowerImageBlur = imageTools.loadImage(assetUrl, function () {
              if (event.type === "load") {
                  maskImage = imageTools.createImage(this.width, this.height);
                  imageLoadedCount += 1;
              } else {
                  error = true;
              }
          })
      }
      // set up the canvas 
      const {width, height, centerWidth, centerHeight} = Utils.getCanvasCoords(canvas);

      var drawScaleCircleRadius = 60;
      var limitErase = 3000;
      var currentErase = 0;

      // how often to fade blur mask
      var blurMaskFadeRate =0;  // number of frames between  fading mask out
      var blurMaskFadeCounter = 0;
      // points for filling gaps between mouse moves.
      var lastMX,lastMY;
      // update function will try 60fps but setting will slow this down.    
      function update(time){
          ctx.setTransform(1, 0, 0, 1, 0, 0); // restore transform
          ctx.clearRect(0, 0, width, height); // clear rhe canvas
          // have the images loaded???
          if (imageLoadedCount === 2) {
              // draw the unblured image that will appear at the top
              ctx.globalCompositeOperation = "source-over";
              Canvas.drawImageCentered(ctx, flowerImageBlur, canvas, true);
              // Mask out the parts when the mask image has pixels
              ctx.globalCompositeOperation = "destination-out";
              Canvas.drawImageCentered(ctx, maskImage, canvas, true);
              // draw the blured image only where the destination has been masked
              ctx.globalCompositeOperation = "destination-atop";

              Canvas.drawImageCentered(ctx, flowerImage, canvas);
              
              blurMaskFadeCounter += 1;
              if((blurMaskFadeCounter % blurMaskFadeRate) === 0){
                  maskImage.ctx.imageSmoothingEnabled = true;
                  maskImage.ctx.globalCompositeOperation = "destination-out";
                  maskImage.ctx.fillStyle = "#000";
                  maskImage.ctx.globalAlpha = 0.1;
                  maskImage.ctx.fillRect(0,0,maskImage.width,maskImage.height);
                  maskImage.ctx.globalAlpha = 1;
                  maskImage.ctx.globalCompositeOperation = "source-over";
              }

              if (mouse.buttonRaw === 1 && currentErase < limitErase) {
                currentErase++;
                // because image has been scaled need to get mouse coords on image
                var scale = Math.min(width / flowerImage.width, height / flowerImage.height);
                var x = (mouse.x - (centerWidth - (maskImage.width / 2) * scale)) / scale;
                var y = (mouse.y - (centerHeight - (maskImage.height / 2) * scale)) / scale;
                // draw circle on mask
                Canvas.drawCircle(maskImage.ctx, x, y, drawScaleCircleRadius);
                // if mouse is draging then draw some points between to fill the gaps
                if (lastMX !== undefined) {
                  Canvas.drawCircle(maskImage.ctx, ((x + lastMX) / 2 + x) / 2, ((y + lastMY) / 2 + y) / 2, drawScaleCircleRadius);
                  Canvas.drawCircle(maskImage.ctx, (x + lastMX) / 2, (y + lastMY) / 2, drawScaleCircleRadius);
                  Canvas.drawCircle(maskImage.ctx, ((x + lastMX) / 2 + lastMX) / 2, ((y + lastMY) / 2 + lastMY) / 2, drawScaleCircleRadius);
                }
                // save las mouse pos on image
                lastMX = x;
                lastMY = y;
              } else {
                // undefined last mouse pos
                lastMX = undefined;
              }
          } else {
              // Laoding images so please wait.
              Canvas.drawText(ctx, "Please wait.", 40 + Math.sin(time / 100), centerWidth, centerHeight - 30, "White");
              Canvas.drawText(ctx, "loading images... ", 12, centerWidth, centerHeight, "black")
              Canvas.drawText(ctx, "ETA " + calculateTimeToGo(time), 14, centerWidth, centerHeight + 20, "black")
          }
          
          // if not restart the request animation frame
          if(!STOP){
              requestAnimationFrame(update);
          }else{
              var can = document.getElementById("canv");
              if(can !== null){
                  document.body.removeChild(can);
              }        
              STOP = false;
              
          }
      }

      update();
    
  }

  var STOP = false; // flag to tell demo app to stop
  function resizeEvent() {
      const waitForStopped = function () {
          if (!STOP) { // wait for stop to return to false
            process();
              return;
          }
          setTimeout(waitForStopped, 200);
      }
      STOP = true;
      setTimeout(waitForStopped, 100);
  }
  window.addEventListener("resize", resizeEvent);
  process();
}