import { s } from "vite/dist/node/types.d-aGj9QkWt"
import "./style.css"
import * as THREE from 'three'   //importing THREE.js libraray

const scene = new THREE.Scene()                                   //setup of the new scene
const geometry = new THREE.BoxGeometry(1, 1, 1)             //adjusts the scale of the cubes
const material1 = new THREE.MeshPhongMaterial({color: 0x00FF00})  //green colour
const material2 = new THREE.MeshPhongMaterial({color: 0xFF0000})  //red colour

//Setting up the green cube and its position
const cube1 = new THREE.Mesh(geometry, material1)
scene.add(cube1)
cube1.position.set(1, 0, 0)

//Setting up the red cube and its position
const cube2 = new THREE.Mesh(geometry, material2)
scene.add(cube2)
cube2.position.set(-1, 0, 0)


// Creating a perspective camera with a 50-degree field of view
// Setting the aspect ratio to match the window dimensions
const camera = new THREE.PerspectiveCamera(
    75,
    500 / 500
)

//Setting up light 1
const light1 = new THREE.PointLight(0xffff00, 2)
scene.add(light1)
light1.position.set(1, 1, 1)

//Setting up in light 2
const light2 = new THREE.PointLight(0xFF00ff, 1)
scene.add(light2)
light2.add(-1 , -1, -1)

//Position camera in z axis
camera.position.z = 2
camera.position.set(-10, 2, 0.7) //Positioning of camera view
camera.lookAt(new THREE.Vector3(0, 0, 0))

const renderer = new THREE.WebGLRenderer({antialias: true})
renderer.setSize(500, 500)     //Size of output canvas

//Adding the canvas where renderer draws output
document.body.appendChild(renderer.domElement)


const animate = () => {
    renderer.render(scene, camera)
    camera.position.x += 0.0001
    camera.lookAt(new THREE.Vector3(0,0))
}

renderer.setAnimationLoop(animate)