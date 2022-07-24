

export default class Mouse {
  constructor() {
    this.interfaceId = 0;
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.alt = false;
    this.shift = false;
    this.ctrl = false;
    this.over = false;
    this.buttonLastRaw = 0;
    this.buttonRaw = 0;
    this.bm = [1, 2, 4, 6, 5, 3];
    this.mouseEvents = "mousemove,mousedown,mouseup,mouseout,mouseover,mousewheel,DOMMouseScroll".split(",");
    this.element;
    this.mouseEvent = this.mouseEvent.bind(this);
    this.initListeners = this.initListeners.bind(this);
    this.removeListeners = this.removeListeners.bind(this);
  }

  getInterfaceId() {
    return this.interfaceId++;
  }

  mouseEvent(e) {
    let type = e.type; 
    this.x = e.offsetX; this.y = e.offsetY;
    if (this.x === undefined) { 
      this.x = e.clientX; this.y = e.clientY; 
    }
    this.alt = e.altKey;
    this.shift = e.shiftKey;
    this.ctrl = e.ctrlKey;

    switch (type) {
      case 'mousedown': 
        this.buttonRaw |= this.bm[e.which-1];
        break;
      case 'mouseup': 
        this.buttonRaw &= this.bm[e.which + 2];
        break;
      case 'mouseout':
        this.buttonRaw = 0; this.over = false;
        break;
      case 'mouseover':
        this.over = true;
        break;
      case 'mousewheel':
        this.w = e.wheelDelta;
        break;
      case 'DOMMouseScroll':
        this.w = -e.detail;
    }
    e.preventDefault();
  }

  /**
   * @param {canvas || undefined} element 
   */
  initListeners(element) {
    if(element === undefined){
      element = document;
    }
    this.element = element;
    this.mouseEvents.forEach((n) => this.element.addEventListener(n, this.mouseEvent));
    this.element.addEventListener("contextmenu", function (e) {e.preventDefault();}, false);
  }

  removeListeners() {
    if(this.element !== undefined){
      this.mouseEvents.forEach((n) => this.element.removeEventListener(n, this.mouseEvent));
    }
  }
}
