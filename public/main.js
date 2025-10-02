// import our three.js reference
import * as THREE from 'https://unpkg.com/three/build/three.module.js'
import { Pane } from 'https://unpkg.com/tweakpane'

const PARAMS = {
  basketSize: 3,
  fallSpeed: 0.05,
  basketColor: "#0000ff",
  objectSize: 1,
  score: 0
}

const app = {
  init() {

    // Starting object. Will be populated with camera, lighting objects, etc.
    this.scene = new THREE.Scene()

    // Create a new camera
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000)
    this.camera.position.set(0, 30, 50)
    this.camera.lookAt(0, -10, 0)

    // Specify the type of renderer to use. In this case, it's a WebGL renderer.
    this.renderer = new THREE.WebGLRenderer()

    // Fill the entire window
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setClearColor(0xffffff)

    // Creates the canvas element and appends it to our page
    document.body.appendChild(this.renderer.domElement)

    this.createLights()
    this.basket = this.createBasket()

    const groundGeo = new THREE.PlaneGeometry(200, 200)
    const groundMat = new THREE.MeshPhongMaterial({ color: 0xcccccc, side: THREE.DoubleSide })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -75
    this.scene.add(ground)


    // Take whatever function you're calling this on and creates a 
    // permanent execution context. Ensures that when we call render(),
    // "this" is not assumed to be the global "this" but the function reference.
    // Called "hard binding"
    this.render = this.render.bind(this)
    this.render()

    // create a new tweakpane instance
    this.pane = new Pane()
    // setup our pane to control the know rotation on the y axis
    this.pane.addBinding(PARAMS, "basketSize", { min: 1, max: 10, step: 1 }).on("change", () => {
      this.updateBasket()
    })
    this.pane.addBinding(PARAMS, "fallSpeed")
    this.pane.addBinding(PARAMS, "basketColor").on("change", () => {
      this.updateBasket()
    })
    this.pane.addBinding(PARAMS, "objectSize")
    this.pane.addBinding(PARAMS, "score", {
      readonly: true
    })

    this.object = this.spawnObject()
    this.object.position.y = 20

    this.keys = {}
    window.addEventListener("keydown", this.onKeyDown.bind(this), false)
    window.addEventListener("keyup", this.onKeyUp.bind(this), false)
    this.moveLeft = false
    this.moveRight = false
    this.moveUp = false
    this.moveDown = false

    this.allowDragging()
  },

  onKeyDown(event) {
    if (event.key == "ArrowLeft") {
      this.moveLeft = true
    }
    else if (event.key == "ArrowRight") {
      this.moveRight = true
    }
    else if (event.key == "ArrowUp") {
      this.moveUp = true
    }
    else if (event.key == "ArrowDown") {
      this.moveDown = true
    }
  },

  onKeyUp(event) {
    if (event.key == "ArrowLeft") {
      this.moveLeft = false
    }
    else if (event.key == "ArrowRight") {
      this.moveRight = false
    }
    else if (event.key == "ArrowUp") {
      this.moveUp = false
    }
    else if (event.key == "ArrowDown") {
      this.moveDown = false
    }
  },

  createLights() {
    // Create one point light and add it to the scene
    const pointLight = new THREE.DirectionalLight(0xcccccc, 2)

    // Set the point light's position
    pointLight.position.set(30, 50, 30)
    pointLight.target.position.set(0, -15, 0)

    // Add the light to the scene
    this.scene.add(pointLight)
    this.scene.add(pointLight.target)
  },

  // Creates the torus knot geometry that we'll display in our scene 
  createBasket() {
    const basketgeo = new THREE.BoxGeometry(PARAMS.basketSize, 2, PARAMS.basketSize)

    // The material (texture) for the shape we want to draw
    const mat = new THREE.MeshPhongMaterial({ color: PARAMS.basketColor, shininess: 2000 })
    const basket = new THREE.Mesh(basketgeo, mat)

    basket.position.set(0, -15, 0)

    // Add the knot tho the scene
    this.scene.add(basket)
    return basket
  },

  updateBasket() {
    const pos = this.basket.position.x
    this.scene.remove(this.basket)
    this.basket.geometry.dispose()
    this.basket.material.dispose()
    this.basket = this.createBasket()
    this.basket.position.x = pos
  },

  spawnObject() {
    const sphere = new THREE.SphereGeometry(PARAMS.objectSize, 32, 16)

    const mat = new THREE.MeshPhongMaterial({ color: Math.random() * 0xff0000 })
    const mesh = new THREE.Mesh(sphere, mat)

    mesh.position.set(Math.random() * 60 - 35, 18 + Math.random() * 8, (Math.random() - 0.5) * 4)

    this.scene.add(mesh)

    return mesh

  },

  allowDragging() {
    this.isDragging = false

    window.addEventListener("mousedown", (event) => {
      this.isDragging = true
      this.startX = event.clientX
      this.startZ = event.clientY
      this.startBasketX = this.basket.position.x
      this.startBasketZ = this.basket.position.z
    })

    window.addEventListener("mousemove", (event) => {
      if (this.isDragging) {
        const changeX = event.clientX - this.startX
        const changeY = event.clientY - this.startZ
        this.basket.position.x = this.startBasketX + changeX * 5 * PARAMS.fallSpeed
        if (this.basket.position.x < -35) {
          this.basket.position.x = -35
        }
        if (this.basket.position.x > 25) {
          this.basket.position.x = 25
        }
        this.basket.position.z = this.startBasketZ + changeY * 5 * PARAMS.fallSpeed
        if (this.basket.position.z > 20) {
          this.basket.position.z = 20
        }
        if (this.basket.position.z < -10) {
          this.basket.position.z = -10
        }
      }
    })

    window.addEventListener("mouseup", (event) => {
      this.isDragging = false
    })
  },

  // Animation loop
  render() {
    if (this.object) {
      this.object.position.y -= PARAMS.fallSpeed

      this.basketBox = new THREE.Box3().setFromObject(this.basket)
      this.objectBox = new THREE.Box3().setFromObject(this.object)


      if (this.object.position.y < -15) {
        PARAMS.score = 0;
        this.scene.remove(this.object)
        this.object.geometry.dispose()
        this.object.material.dispose()
        this.object = this.spawnObject()
      }
      if (this.basketBox.intersectsBox(this.objectBox)) {
        PARAMS.score++;
        this.scene.remove(this.object)
        this.object.geometry.dispose()
        this.object.material.dispose()
        this.object = this.spawnObject()
      }
    }

    if (this.moveLeft) {
      this.basket.position.x -= 5 * PARAMS.fallSpeed
      if (this.basket.position.x < -35) {
        this.basket.position.x = -35
      }
    }
    if (this.moveRight) {
      this.basket.position.x += 5 * PARAMS.fallSpeed
      if (this.basket.position.x > 25) {
        this.basket.position.x = 25
      }
    }
    if (this.moveUp) {
      this.basket.position.z -= 5 * PARAMS.fallSpeed
      if (this.basket.position.z < -10) {
        this.basket.position.z = -10
      }
    }
    if (this.moveDown) {
      this.basket.position.z += 5 * PARAMS.fallSpeed
      if (this.basket.position.z > 20) {
        this.basket.position.z = 20
      }
    }

    // Render using the scene and camera specified earlier
    this.renderer.render(this.scene, this.camera)

    // Schedules a function to be called the next time the graphics engine
    // refreshes your browser window. Necessary for the animation to occur.
    window.requestAnimationFrame(this.render)

  }
}

window.onload = () => app.init()