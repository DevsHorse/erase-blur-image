

export default class Mouse {
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
