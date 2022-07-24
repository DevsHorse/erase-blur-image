import Utils from './Utils';
import ImageTools from './ImageTools';
import Mouse from './Mouse';
import Canvas from './Canvas';

const calculateTimeToGo = Utils.getCalculateTimeToGo();
const imageTools = new ImageTools();

export default class ImageBlurEraser {
  constructor(imageUrl) {
    this.imageUrl = imageUrl;
    this.imageLoadedCount = 0;
    this.error = false;
    this.maskImage;
    this.entryImage;
    this.entryImageBlur;
    this.mouse;
    this.canvas;
    this.ctx;
    this.stop = false;
    this.init = this.init.bind(this);
    this.resizeEvent = this.resizeEvent.bind(this);
    this.start = this.start.bind(this);
    this.animationUpdate = this.animationUpdate.bind(this);
  }

  resizeEvent() {
    const waitForStopped = () => {
      if (!this.stop) { // wait for stop to return to false
        this.start();
          return;
      }
      setTimeout(waitForStopped, 200);
    }
    this.stop = true;
    setTimeout(waitForStopped, 100);
  }

  init() {
    window.addEventListener("resize", this.resizeEvent);
    this.start();
  }

  start() {
    if (this.canvas) {
      this.canvas = null;
    }
     /** fullScreenCanvas.js begin **/
     this.canvas = new Canvas().initCanvas();
     this.ctx = this.canvas.ctx;
     /** fullScreenCanvas.js end **/
     
     /** MouseFull.js begin **/
     if(typeof this.mouse !== "undefined"){  // if the mouse exists 
         if( this.mouse.removeMouse !== undefined){
             this.mouse.removeMouse(); // remove previouse events
         }
     }else{
         this.mouse = undefined;
     }

     const canvasMouseCallBack = undefined;  // if needed
     this.mouse = new Mouse(canvasMouseCallBack);
     this.mouse.mouseStart(this.canvas || undefined);
     /** MouseFull.js end **/
     
     // load the images and create the mask
     if(this.imageLoadedCount === 0){
         this.imageLoadedCount = 0;
         this.error = false;
         this.maskImage;
         console.log(this);
         this.entryImage= imageTools.loadImage(this.imageUrl, event => {
             if (event.type === "load") {
                 this.imageLoadedCount += 1;
             } else {
                 this.error = true;
             }
         })
         this.entryImageBlur = imageTools.loadImage(this.imageUrl, event => {
             if (event.type === "load") {
                  const img = event.path[0];
                  this.maskImage = imageTools.createImage(img.width, img.height);
                  this.imageLoadedCount += 1;
             } else {
                  this.error = true;
             }
         })
     }

      const settings = Utils.createAnimationSettings(this.canvas);
      // update function will try 60fps but setting will slow this down. 
      const animation = Utils.injectAnimationSettings(settings, this.animationUpdate);
      animation();
  }

  animationUpdate(time, settings) {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0); // restore transform
    this.ctx.clearRect(0, 0, settings.width, settings.height); // clear rhe canvas
    // have the images loaded???
    if (this.imageLoadedCount === 2) {
        // draw the unblured image that will appear at the top
        this.ctx.globalCompositeOperation = "source-over";
        Canvas.drawImageCentered(this.ctx, this.entryImageBlur, this.canvas, true);
        // Mask out the parts when the mask image has pixels
        this.ctx.globalCompositeOperation = "destination-out";
        Canvas.drawImageCentered(this.ctx, this.maskImage, this.canvas, true);
        // draw the blured image only where the destination has been masked
        this.ctx.globalCompositeOperation = "destination-atop";
        Canvas.drawImageCentered(this.ctx, this.entryImage, this.canvas);
        
        settings.blurMaskFadeCounter += 1;
        if((settings.blurMaskFadeCounter % settings.blurMaskFadeRate) === 0){
            this.maskImage.ctx.imageSmoothingEnabled = true;
            this.maskImage.ctx.globalCompositeOperation = "destination-out";
            this.maskImage.ctx.fillStyle = "#000";
            this.maskImage.ctx.globalAlpha = 0.1;
            this.maskImage.ctx.fillRect(0,0, this.maskImage.width, this.maskImage.height);
            this.maskImage.ctx.globalAlpha = 1;
            this.maskImage.ctx.globalCompositeOperation = "source-over";
        }

        if (this.mouse.buttonRaw === 1 && settings.currentErase < settings.limitErase) {
          settings.currentErase++;
          // because image has been scaled need to get mouse coords on image
          const scale = Math.min(settings.width / this.entryImage.width, settings.height / this.entryImage.height);
          const x = (this.mouse.x - (settings.centerWidth - (this.maskImage.width / 2) * scale)) / scale;
          const y = (this.mouse.y - (settings.centerHeight - (this.maskImage.height / 2) * scale)) / scale;
          // draw circle on mask
          Canvas.drawCircle(this.maskImage.ctx, x, y, settings.drawScaleCircleRadius);
          // if mouse is draging then draw some points between to fill the gaps
          if (settings.lastMX !== undefined) {
            Canvas.drawCircle(this.maskImage.ctx, ((x + settings.lastMX) / 2 + x) / 2, ((y + settings.lastMY) / 2 + y) / 2, settings.drawScaleCircleRadius);
            Canvas.drawCircle(this.maskImage.ctx, (x + settings.lastMX) / 2, (y + settings.lastMY) / 2, settings.drawScaleCircleRadius);
            Canvas.drawCircle(this.maskImage.ctx, ((x + settings.lastMX) / 2 + settings.lastMX) / 2, ((y + settings.lastMY) / 2 + settings.lastMY) / 2, settings.drawScaleCircleRadius);
          }
          // save las mouse pos on image
          settings.lastMX = x;
          settings.lastMY = y;
        } else {
          // undefined last mouse pos
          settings.lastMX = undefined;
        }
    } else {
        // Laoding images so please wait.
        Canvas.drawText(this.ctx, "Please wait.", 40 + Math.sin(time / 100), settings.centerWidth, settings.centerHeight - 30, "White");
        Canvas.drawText(this.ctx, "loading images... ", 12, settings.centerWidth, settings.centerHeight, "black")
        Canvas.drawText(this.ctx, "ETA " + calculateTimeToGo(time), 14, settings.centerWidth, settings.centerHeight + 20, "black")
    }
    
    // if not restart the request animation frame
    if(!this.stop){
        requestAnimationFrame(Utils.injectAnimationSettings(settings, this.animationUpdate));
    }else{
        var can = document.getElementById("canv");
        if(can !== null){
            document.body.removeChild(can);
        }        
        this.stop = false;
    }
  }
}