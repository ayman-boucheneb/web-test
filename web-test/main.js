import './style.css'
import * as THREE from 'three'

const scene = new THREE.Scene()
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({color: 0x00FF00})

const cube = new THREE.Mesh(geometry, material)
scene.add(cube)

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight
)

camera.position.z = 2

const renderer = new THREE.WebGL3DRenderTarget({antialias: true})
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

renderer.render(scene, camera)