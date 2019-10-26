/* jshint esversion: 6 */
((main) => {

  this.requestAnimationFrame = (() => {
    return window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function(callback) {
        window.setTimeout(callback, 1000 / 60);
      };
  })();

  main(this, document, THREE);

})((window, document, three, undefined) => {

  'use strict';

  const APP_DEFAULTS = {
    dimensions: {
      x: 0,
      y: 0
    },
    camera: {
      fov: 70,
      aspectRatio: 0,
      nearPlane: 0.1,
      farPlane: 10000,
      distanceX: 50,
      distanceY: 700,
      distanceZ: -50,
      speedX: 0.8,
      speedY: 0.4,
      speedZ: 0.1
    },
    particles: {
      ySegments: 100,
      xSegments: 300,
      size: 1,
      color: '#000',
      waveSpeed: 0.5,
      waveSizeX: 250,
      waveSizeY: 0,
      waveSizeZ: 250
    }
  };

  const PI = Math.PI,
    TAU = PI * 2,
    COS = Math.cos,
    SIN = Math.sin;

  class App {
    constructor() {
      let self = this;
      self.props = (JSON.parse(JSON.stringify(APP_DEFAULTS)));
      self.initCamera();
      self.initScene();
      self.initLights();
      self.stats = new Stats();
      // document.body.appendChild(this.stats.domElement);
      window.onresize = () => {
        self.setSize();
      };
    }

    setSize() {
      this.props.dimensions.x = document.documentElement.clientWidth;
      this.props.dimensions.y = document.documentElement.clientHeight;
      this.renderer.setSize(this.props.dimensions.x, this.props.dimensions.y);
      this.camera.aspect = this.props.camera.aspectRatio = this.props.dimensions.x / this.props.dimensions.y;
      this.camera.updateProjectionMatrix();
    }

    initCamera() {
      this.camera = new three.PerspectiveCamera(
        this.props.camera.fov,
        this.props.camera.aspectRatio,
        this.props.camera.nearPlane,
        this.props.camera.farPlane
      );
    }

    initScene() {
      this.scene = new three.Scene();
      this.scene.add(this.camera);
      this.renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
      });
      this.setSize();
      this.container = document.querySelector('#animation-container');
      this.container.appendChild(this.renderer.domElement);
    }

    initLights() {
      this.mainLight = new three.HemisphereLight(0x000000, 0xffffff, 0.95);
      this.mainLight.position.set(0, -500, 0);
      this.scene.add(this.mainLight);
      this.ambientLight = new three.AmbientLight(0xaaccff, 0.95);
      this.ambientLight.position.set(-200, -100, 0);
      this.scene.add(this.ambientLight);
    }

    render() {
      let self = this;
      self.stats.begin();
      self.update();
      self.renderer.render(self.scene, self.camera);
      window.requestAnimationFrame(self.render.bind(self));
      self.stats.end();
    }

    update() {}
  }

  class MandalaCloud extends App {
    constructor() {
      super();
      this.tick = 0;
      this.build();
      // this.initGUI();
      this.render();
    }

    build() {
      let self = this, 
        mat = new three.PointsMaterial({
          color: new three.Color(this.props.particles.color),
          transparent: true,
          depthTest: true,
          size: 1
        });

      this.geometry = new three.SphereGeometry(400, this.props.particles.ySegments, this.props.particles.xSegments, 0, TAU, 0, TAU);

      this.pointCloud = new three.Points(this.geometry, mat);
      this.pointCloud.sortParticles = true;

      this.scene.add(this.pointCloud);
      this.camera.position.set(0, -600, 600);
    }

    update() {
      this.tick++;
      this.delta = this.tick * 0.005;
      this.geometry.verticesNeedUpdate = true;
      for (let i = 0; i < this.geometry.vertices.length; i++) {
        let point = this.geometry.vertices[i],
          dX = SIN(this.delta + i) * (this.props.particles.waveSizeX * 0.004),
          dY = COS(this.delta + i) * SIN(this.delta + i) * (this.props.particles.waveSizeY * 0.004),
          dZ = COS(this.delta + i) * (this.props.particles.waveSizeZ * 0.004);
        point.add(new three.Vector3(dX, dY, dZ));
      }
      this.camera.lookAt(this.pointCloud.position);
      this.camera.position.x = this.props.camera.distanceX * COS(this.delta * this.props.camera.speedX);
      this.camera.position.y = this.props.camera.distanceY * COS(this.delta * this.props.camera.speedY);
      this.camera.position.z = this.props.camera.distanceZ * COS(this.delta * this.props.camera.speedZ);
    }

    reset() {
      this.tick = 0;
      this.scene.remove(this.pointCloud);
      this.build();
    }

    initGUI() {

      this.gui = new dat.GUI();
      let f1 = this.gui.addFolder('Camera');

    }
  }

  window.onload = () => {
    let mc = new MandalaCloud();
  };

});