class App {
  static sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  // from stackoverflow lol
  static getPositionAlongALine(x1, y1, x2, y2, percentage) {
    return {
      x: x1 * (1.0 - percentage) + x2 * percentage,
      y: y1 * (1.0 - percentage) + y2 * percentage
    };
  }

  static generateRandomDecimal(min, max) {
    return Math.random() * (max - min) + min;
  };

  // Converts from degrees to radians.
  static toRadians(degrees) {
    return degrees * Math.PI / 180;
  };

  // Converts from radians to degrees.
  static toDegrees(radians) {
    return radians * 180 / Math.PI;
  }

  static bearing(startLat_, startLng_, destLat_, destLng_) {
    let startLat = this.toRadians(startLat_);
    let startLng = this.toRadians(startLng_);
    let destLat = this.toRadians(destLat_);
    let destLng = this.toRadians(destLng_);

    let y = Math.sin(destLng - startLng) * Math.cos(destLat);
    let x = Math.cos(startLat) * Math.sin(destLat) -
      Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
    let brng = Math.atan2(y, x);
    brng = this.toDegrees(brng);
    return (brng + 360) % 360;
  }
}

export default App;
