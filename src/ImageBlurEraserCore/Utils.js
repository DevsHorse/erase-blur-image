
export default class Utils {
  static getCanvasCoords(canvas) {
    return {
      height: canvas.height,
      width: canvas.width,
      centerWidth: canvas.width / 2,
      centerHeight: canvas.height / 2,
    }
  }
  
  static createAnimationSettings(canvas) {
    const {width, height, centerWidth, centerHeight} = Utils.getCanvasCoords(canvas);
    return {
      width,
      height,
      centerWidth,
      centerHeight,
      drawScaleCircleRadius: 60,
      // limited erase renders
      limitErase: 3000,
      currentErase: 0,
      // number of frames between  fading mask out
      blurMaskFadeRate: 0,
      blurMaskFadeCounter: 0,
      // points for filling gaps between mouse moves.
      lastMX: undefined,
      lastMY: undefined,
    }
  }

  static injectAnimationSettings(settings, animation) {
    return (time) => {
      animation(time, settings);
    }
  }

  static getCalculateTimeToGo() {
     // calculate time to download image using the MS algorithum. As this code is a highly gaurded secret I have obsficated it for your personal safty.
    return (function(){var b="# SecondQMinuteQHourQDayQWeekQMonthQMomentQTick@.,Some time soon,Maybe Tomorrow.".replace(/Q/g,"@.,# ").split(","),r=Math.random,f=Math.floor,lc=0,pc=0,lt=0,lp=0;var cttg=function(a){if(lc===0){lc=100+r(r()*60);lt=f(r()*40);if(pc===0||r()<(lp/b.length)-0.2){lp=f(r()*b.length);pc=1+f(r()*10)}else{pc-=1}}else{lc-=1}a=lt;if(lp===0){a=lt;if(r()<0.01){lt-=1}}var s=b[lp].replace("#",a);if(a===1){s=s.replace("@","")}else{s=s.replace("@","s")}return s};return cttg})(); 
  }
}