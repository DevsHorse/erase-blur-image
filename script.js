var imageLoadedCount = 0;
var error = false;
var maskImage;
var flowerImage;
var flowerImageBlur;
/** ImageTools.js begin **/
var imageTools = (function () {
    var tools = {
        canvas : function (width, height) {  // create a blank image (canvas)
            var c = document.createElement("canvas");
            c.width = width;
            c.height = height;
            return c;
        },
        createImage : function (width, height) {
            var image = this.canvas(width, height);
            image.ctx = image.getContext("2d");
            return image;
        },
        loadImage : function (url, callback) {
            var image = new Image();
            image.src = url;
            image.addEventListener('load', callback);
            image.addEventListener('error', callback);
            return image;
        }
    };
    return tools;
})();

var mouse;
var demo = function(){
    /** fullScreenCanvas.js begin **/
    var canvas = (function(){
        var canvas = document.getElementById("canv");
        if(canvas !== null){
            document.body.removeChild(canvas);
        }
        // creates a blank image with 2d context
        canvas = document.createElement("canvas"); 
        canvas.id = "canv";    
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight; 
        canvas.style.position = "absolute";
        canvas.style.top = "0px";
        canvas.style.left = "0px";
        canvas.style.zIndex = 1000;
        canvas.ctx = canvas.getContext("2d"); 
        document.body.appendChild(canvas);
        return canvas;
    })();
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
    mouse = (function(){
        var mouse = {
            x : 0, y : 0, w : 0, alt : false, shift : false, ctrl : false,
            interfaceId : 0, buttonLastRaw : 0,  buttonRaw : 0,
            over : false,  // mouse is over the element
            bm : [1, 2, 4, 6, 5, 3], // masks for setting and clearing button raw bits;
            getInterfaceId : function () { return this.interfaceId++; }, // For UI functions
            startMouse:undefined,
            mouseEvents : "mousemove,mousedown,mouseup,mouseout,mouseover,mousewheel,DOMMouseScroll".split(",")
        };
        function mouseMove(e) {
            var t = e.type, m = mouse;
            m.x = e.offsetX; m.y = e.offsetY;
            if (m.x === undefined) { m.x = e.clientX; m.y = e.clientY; }
            m.alt = e.altKey;m.shift = e.shiftKey;m.ctrl = e.ctrlKey;
            if (t === "mousedown") { m.buttonRaw |= m.bm[e.which-1];
            } else if (t === "mouseup") { m.buttonRaw &= m.bm[e.which + 2];
            } else if (t === "mouseout") { m.buttonRaw = 0; m.over = false;
            } else if (t === "mouseover") { m.over = true;
            } else if (t === "mousewheel") { m.w = e.wheelDelta;
            } else if (t === "DOMMouseScroll") { m.w = -e.detail;}
            if (canvasMouseCallBack) { canvasMouseCallBack(mouse); }
            e.preventDefault();
        }
        function startMouse(element){
            if(element === undefined){
                element = document;
            }
            mouse.element = element;
            mouse.mouseEvents.forEach(
                function(n){
                    element.addEventListener(n, mouseMove);
                }
            );
            element.addEventListener("contextmenu", function (e) {e.preventDefault();}, false);
        }
        mouse.removeMouse = function(){
            if(mouse.element !== undefined){
                mouse.mouseEvents.forEach(
                    function(n){
                        mouse.element.removeEventListener(n, mouseMove);
                    }
                );
                canvasMouseCallBack = undefined;
            }
        }
        mouse.mouseStart = startMouse;
        return mouse;
    })();
    if(typeof canvas !== "undefined"){
        mouse.mouseStart(canvas);
    }else{
        mouse.mouseStart();
    }
    /** MouseFull.js end **/
    
    // load the images and create the mask
    if(imageLoadedCount === 0){
        imageLoadedCount = 0;
        error = false;
        maskImage;
        //http://www.createjs.com/demos/_assets/art/flowers.jpg
        flowerImage = imageTools.loadImage("http://www.createjs.com/demos/_assets/art/flowers.jpg", function (event) {
            if (event.type === "load") {
                imageLoadedCount += 1;
            } else {
                error = true;
            }
        })
        //http://i.stack.imgur.com/3S5m8.jpg
        flowerImageBlur = imageTools.loadImage("http://www.createjs.com/demos/_assets/art/flowers.jpg", function () {
            if (event.type === "load") {
                maskImage = imageTools.createImage(this.width, this.height);
                imageLoadedCount += 1;
            } else {
                error = true;
            }
        })
    }
    // set up the canvas 
    var w = canvas.width;
    var h = canvas.height;
    var cw = w / 2;
    var ch = h / 2;

    // calculate time to download image using the MS algorithum. As this code is a highly gaurded secret I have obsficated it for your personal safty.
    var calculateTimeToGo= (function(){var b="# SecondQMinuteQHourQDayQWeekQMonthQMomentQTick@.,Some time soon,Maybe Tomorrow.".replace(/Q/g,"@.,# ").split(","),r=Math.random,f=Math.floor,lc=0,pc=0,lt=0,lp=0;var cttg=function(a){if(lc===0){lc=100+r(r()*60);lt=f(r()*40);if(pc===0||r()<(lp/b.length)-0.2){lp=f(r()*b.length);pc=1+f(r()*10)}else{pc-=1}}else{lc-=1}a=lt;if(lp===0){a=lt;if(r()<0.01){lt-=1}}var s=b[lp].replace("#",a);if(a===1){s=s.replace("@","")}else{s=s.replace("@","s")}return s};return cttg})();    

    // draws circle with gradient
    function drawCircle(ctx, x, y, r) {
        var gr = ctx.createRadialGradient(x, y, 0, x, y, r)
            gr.addColorStop(1, "rgba(0,0,0,0)")
            gr.addColorStop(0.5, "rgba(0,0,0,0.08)")
            gr.addColorStop(0, "rgba(0,0,0,0.1)")
            ctx.fillStyle = gr;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }
    // draw text
    function drawText(ctx, text, size, x, y, c) {
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
    function drawImageCentered(ctx, image, x, y, blur) {
        var scale = Math.min(w / image.width, h / image.height);
        ctx.setTransform(scale, 0, 0, scale, cw, ch);
        if (blur) ctx.filter = 'blur(5px)';
        else ctx.filter = 'none';
        ctx.drawImage(image, -image.width / 2, -image.height / 2);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    var drawScaleCircleRadius = 20;
    var limitErase = 200;
    var currentErase = 0;

    // how often to fade blur mask
    var blurMaskFadeRate =0;  // number of frames between  fading mask out
    var blurMaskFadeCounter = 0;
    // points for filling gaps between mouse moves.
    var lastMX,lastMY;
    // update function will try 60fps but setting will slow this down.    
    function update(time){
        ctx.setTransform(1, 0, 0, 1, 0, 0); // restore transform
        ctx.clearRect(0, 0, w, h); // clear rhe canvas
        // have the images loaded???
        if (imageLoadedCount === 2) {
            // draw the unblured image that will appear at the top
            ctx.globalCompositeOperation = "source-over";
            drawImageCentered(ctx, flowerImageBlur, cw, ch, true);
            // drawText(ctx, "Move mouse over image to unblur.", 20 + Math.sin(time / 100), cw, ch - 30, "White");
            // Mask out the parts when the mask image has pixels
            ctx.globalCompositeOperation = "destination-out";
            drawImageCentered(ctx, maskImage, cw, ch, true);
            // draw the blured image only where the destination has been masked
            ctx.globalCompositeOperation = "destination-atop";

            drawImageCentered(ctx, flowerImage, cw, ch);
            
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
              var scale = Math.min(w / flowerImage.width, h / flowerImage.height);
              var x = (mouse.x - (cw - (maskImage.width / 2) * scale)) / scale;
              var y = (mouse.y - (ch - (maskImage.height / 2) * scale)) / scale;
              // draw circle on mask
              drawCircle(maskImage.ctx, x, y, drawScaleCircleRadius);
              // if mouse is draging then draw some points between to fill the gaps
              if (lastMX !== undefined) {
                  drawCircle(maskImage.ctx, ((x + lastMX) / 2 + x) / 2, ((y + lastMY) / 2 + y) / 2, drawScaleCircleRadius);
                  drawCircle(maskImage.ctx, (x + lastMX) / 2, (y + lastMY) / 2, drawScaleCircleRadius);
                  drawCircle(maskImage.ctx, ((x + lastMX) / 2 + lastMX) / 2, ((y + lastMY) / 2 + lastMY) / 2, drawScaleCircleRadius);
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
            drawText(ctx, "Please wait.", 40 + Math.sin(time / 100), cw, ch - 30, "White");
            drawText(ctx, "loading images... ", 12, cw, ch, "black")
            drawText(ctx, "ETA " + calculateTimeToGo(time), 14, cw, ch + 20, "black")
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
    var waitForStopped = function () {
        if (!STOP) { // wait for stop to return to false
            demo();
            return;
        }
        setTimeout(waitForStopped, 200);
    }
    STOP = true;
    setTimeout(waitForStopped, 100);
}
window.addEventListener("resize", resizeEvent);
demo();