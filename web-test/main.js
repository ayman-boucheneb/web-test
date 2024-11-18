import "./style.css"
import * as THREE from 'three'   //importing THREE.js libraray
import Stats from 'three/addons/libs/stats.module.js'


const scene = new THREE.Scene()                                   //setup of the new scene
const geometry = new THREE.BoxGeometry(1, 1, 1)             //adjusts the scale of the cubes
//change of colours
const material1 = new THREE.MeshPhongMaterial({color: 0xFFAA00})
const material2 = new THREE.MeshPhongMaterial({color: 0x00AAFF})


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
    window.innerWidth / window.innerHeight
)


// Lights!
//Setting up light 1
const lightSphere = new THREE.SphereGeometry(0.05)

function addLight(colour, speed){
    const light = new THREE.PointLight(colour, 5)
    light.speed = speed
    const lightMaterial = new THREE.MeshBasicMaterial({color:colour})
    const lightMesh = new THREE.Mesh(lightSphere, lightMaterial)
    light.add(lightMesh)
    scene.add(light)
    light.position.set(0, 0, 0)

    return light
}

const lights = [
    addLight(0xFFFF00, 1),
    addLight(0x0000FF, 2),
    addLight(0xFFFFFF, 3)
]

//Position camera in z axis
camera.position.z = 2
camera.position.set(0, 3, 3) //Positioning of camera view, zoomed out y position
camera.lookAt(new THREE.Vector3(0, 0, 0))


const renderer = new THREE.WebGLRenderer({antialias: true})
renderer.setSize(window.innerWidth, window.innerHeight)     //Size of output canvas


//Adding the canvas where renderer draws output
document.body.appendChild(renderer.domElement)


const stats = new Stats()
document.body.appendChild(stats.dom)

//making the clock
const clock = new THREE.Clock()

let angle=0

const animate = () => {
    renderer.render(scene, camera)
    const delta = clock.getDelta(); //delta clock set
    cube1.rotation.y +=1 * delta //making cube1(green) rotating
    cube2.rotation.y -=1 * delta //making cube2(red) rotate the other way
    camera.lookAt(new THREE.Vector3(0,0, 0))
    stats.update()

    angle +=delta

    lights.forEach(light => {
        light.position.set(2 * Math.sin(angle * light.speed),
                            0,
                            2 * Math.cos(angle * light.speed))
    })
}

//function for window resizing
function onWindowResize() {
    console.log("RESIZE")
    renderer.setSize(window.innerWidth, window.innerHeight)

    //Two lines below maintain the resolution, regardless of window size
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
}

//to call onWindowResize when resize happens
window.addEventListener("resize", onWindowResize)

renderer.setAnimationLoop(animate)