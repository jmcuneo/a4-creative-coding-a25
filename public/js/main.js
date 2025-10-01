import * as THREE from 'https://unpkg.com/three/build/three.module.js'
import { Pane } from 'https://unpkg.com/tweakpane'
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000)
camera.position.set(0, 6, 26)
const bottom = new THREE.HemisphereLight(0xffffff, 0x111122, 0.7)
scene.add(bottom)
const top = new THREE.DirectionalLight(0xffffff, 1.3)
top.position.set(5, 8, 6)
scene.add(top)

const colors = {
    pink: new THREE.MeshPhongMaterial({ color: 0xff5a86 }),
    blue: new THREE.MeshPhongMaterial({ color: 0x42e0c9 }),
    yellow: new THREE.MeshPhongMaterial({ color: 0xf2b705 }),
    purple: new THREE.MeshPhongMaterial({ color: 0xb78cff }),
}

function circle(mesh, x, sound) {
    mesh.position.set(x, 6, 0)
    mesh.userData.baseScale = 1
    mesh.userData.anim = null
    mesh.userData.sound = sound
    scene.add(mesh)
    shapes.push(mesh)
}

const shapes = []
circle(new THREE.Mesh(new THREE.SphereGeometry(2.7, 48, 32), colors.pink), -12, {freq: 196})
circle(new THREE.Mesh(new THREE.SphereGeometry(2.7, 48, 32), colors.blue), -4, {freq: 261.63})
circle(new THREE.Mesh(new THREE.SphereGeometry(2.7, 48, 32), colors.yellow), 4, {freq: 329.63})
circle(new THREE.Mesh(new THREE.SphereGeometry(2.7, 48, 32), colors.purple), 12, {freq: 392})

let audioCtx, loudness, beenClicked = false
function audio() {
    if (beenClicked) return
    audioCtx = new (window.AudioContext)()
    loudness = audioCtx.createGain()
    loudness.gain.value = state.volume
    loudness.connect(audioCtx.destination)
    beenClicked = true
}

function playSound({ type, freq }) {
    audio()
    const current = audioCtx.currentTime
    const osc = audioCtx.createOscillator()
    osc.type = type
    osc.frequency.value = freq
    const gainNode = audioCtx.createGain()
    gainNode.gain.value = 0.0001
    const ramp = 0.01
    const down = 0.05
    const hold = 0.6
    const fade = Math.max(0.05, state.length - ramp - down)
    gainNode.gain.setValueAtTime(0.0001, current)
    gainNode.gain.exponentialRampToValueAtTime(state.volume, current + ramp)
    gainNode.gain.linearRampToValueAtTime(state.volume * hold, current + ramp + down)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, current + ramp + down + fade)
    osc.connect(gainNode).connect(loudness)
    osc.start(current)
    osc.stop(current + ramp + down + fade + 0.02)
}

const click = new THREE.Raycaster()
const position = new THREE.Vector2()
function clickingShape(event) {
    audio()
    audioCtx.resume()
    const rect = renderer.domElement.getBoundingClientRect()
    position.x = ((event.clientX - rect.left)/rect.width) * 2 - 1
    position.y = -((event.clientY - rect.top)/rect.height) * 2 + 1
    click.setFromCamera(position, camera)
    const intersect = click.intersectObjects(shapes, false)[0]
    if (!intersect) return
    const obj = intersect.object
    const pigmentChange = {h: 0, s: 0, l: 0}
    obj.material.color.getHSL(pigmentChange)
    const newHue = Math.random()
    obj.material.color.setHSL(newHue, state.pigment, pigmentChange.l)
    playSound(obj.userData.sound)
    const from = obj.userData.baseScale
    const to = from * (1 + state.expand)
    obj.userData.anim = {from, to, t: 0, dur: 0.18, phase: 'up'}
}
renderer.domElement.addEventListener('pointerdown', clickingShape)
const state = {
    volume: 0.2,
    length: 0.35,
    expand: 0.35,
    pigment: 0.8
}
const pane = new Pane({ title: 'Controls' })
pane.addBinding(state, 'volume', {min: 0, max: 1, step: 0.01}).on('change', e => loudness && (loudness.gain.value = e.value))
pane.addBinding(state, 'length', {min: 0.1, max: 1.2, step: 0.01})
pane.addBinding(state, 'expand', {min: 0.1, max: 1, step: 0.01})
pane.addBinding(state, 'pigment', {label: 'pigment', min: 0, max: 1, step: 0.01})

function animate() {
    requestAnimationFrame(animate)
    for (const oneShape of shapes) {
        const a = oneShape.userData.anim
        if (!a) continue
        a.t += (1/60)
        const progress = Math.min(1, a.t/a.dur)
        const scale = THREE.MathUtils.lerp(a.from, a.to, progress)
        oneShape.scale.setScalar(scale)
        if (progress >= 1) {
            if (a.phase === 'up') {
                oneShape.userData.anim = {from: scale, to: oneShape.userData.baseScale, t: 0, dur: 0.22, phase: 'down'}
            } else {
                oneShape.userData.anim = null
            }
        }
    }
    renderer.render(scene, camera)
}
animate()