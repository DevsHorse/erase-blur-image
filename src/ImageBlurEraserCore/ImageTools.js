
export default class ImageTools {
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
