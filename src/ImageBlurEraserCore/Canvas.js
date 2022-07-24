import Utils from "./Utils";

const CANVAS_ID = 'rootBlurImageCanvas';

export default class Canvas {
  constructor(selector) {
    this.container = document.querySelector(selector);
    const oldCanvas = document.getElementById(CANVAS_ID);
    if (oldCanvas !== null) {
      this.container.removeChild(oldCanvas);
    }
    this.canvas;
  }

  initCanvas() {
    const canvas = document.createElement("canvas"); 
          canvas.id = CANVAS_ID;    
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight; 
          canvas.style.position = "absolute";
          canvas.style.top = "0px";
          canvas.style.left = "0px";
          canvas.style.zIndex = 1000;
          canvas.ctx = canvas.getContext("2d"); 
          this.container.appendChild(canvas);
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
    const scale = Math.min(width / image.width, height / image.height);
    const blurScale = width / 70;
    ctx.setTransform(scale, 0, 0, scale, centerWidth, centerHeight);
    console.log(blurScale);
    if (blur) {
      ctx.filter = `blur(${blurScale}px)`;
    }
    else ctx.filter = 'none';
    ctx.drawImage(image, -image.width / 2, -image.height / 2);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  removeCanvasFromDocument() {
    const canvas = document.getElementById(CANVAS_ID);
        if(canvas !== null){
          this.container.removeChild(canvas);
        }    
  }
}

