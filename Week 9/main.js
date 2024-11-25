import * as dat from 'dat.gui'
import "./style.css"
import * as THREE from 'three'
import Stats from 'three/addons/libs/stats.module.js'
const gui = new dat.GUI()


//Establishing the controls
let controls = {
    cameraSpeed: 0,
    cameraX: 0,
    cameraY: 0,
    cameraZ: 0,
    // With dat.gui, easiest to use strings for colours:
    cubeColour: "#000000",
    manualLightColour: "#000000"
}


//Establishing multiple lights
for (let i = 0; i < 6; i++){
    //lights
    controls[`lightX${i}`] = 0;
    controls[`lightY${i}`] = 0;
    controls[`lightZ${i}`] = 0;
    controls[`manualLight${i}`] = "#000000"
    //Adding lights into a folder
    const light_folder = gui.addFolder(`light${i}`)
    light_folder.add(controls, `lightX${i}`, -5, 5, 0.01)
    light_folder.add(controls, `lightY${i}`, -5, 5, 0.01)
    light_folder.add(controls, `lightZ${i}`, -5, 5, 0.01)
    light_folder.addColor(controls, `manualLight${i}`)
}

for (let i = 0; i < 3; i++){
    controls[`cubeColour${i}`] = "#000000"
    const cube_folder = gui.addFolder(`cubeColour${i}`)
    cube_folder.addColor(controls, `cubeColour${i}`)
}

//Putting the limits of the established controls
const camera_folder = gui.addFolder("Cameras")
camera_folder.add(controls, "cameraX", -10, 10, 0.01)
camera_folder.add(controls, "cameraY", -10, 10, 0.01)
camera_folder.add(controls, "cameraZ", -10, 10, 0.01)


const scene = new THREE.Scene()
const geometry = new THREE.BoxGeometry(1, 1, 1) //Scale of cube
const material1 =
    new THREE.MeshPhongMaterial({ color: 0xFFFFFF }) //Colour of cube

let x =0;
let y=0;
let z =0;
const cube = []
//Adding Cube
for (let i = 0; i < 3; i++){
    cube[i] = new THREE.Mesh(geometry, material1)
    scene.add(cube[i])
    cube[i].position.set(x, y, x) //axis of cube
    x++
    y++
    z++
}


//Positioning the camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight
)
camera.position.set(0, 1, 3)
camera.lookAt(new THREE.Vector3(0, 0, 0))


//Size of renderer/’screen display’ of where the cube is
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)


document.body.appendChild(renderer.domElement)

//Adding stats
const stats = new Stats()
document.body.appendChild(stats.dom)


const clock = new THREE.Clock()
const lightSphere = new THREE.SphereGeometry(0.05)
function addLight(c, speed) {
    const light = new THREE.PointLight(c, 5)
    light.speed = speed     // Patch the speed into the light object
    const lightMaterial = new THREE.MeshBasicMaterial({ color: c })
    const lightMesh = new THREE.Mesh(lightSphere, lightMaterial)
    light._material = lightMaterial
    light.add(lightMesh)
    scene.add(light)
    light.position.set(0, 0, 2)
    return light
}


const lights = []

for (let i = 0; i <6; i++){
    //create an array of lights
    lights.push(addLight(0xFFFFFF))
}


//Making the cube rotate
let angle = 0
const animate = () => {
    //Controls for the various lights
    for (let i = 0; i < 6; i++){
        lights[i].position.set(controls[`lightX${i}`],
                            controls[`lightY${i}`],
                            controls[`lightZ${i}`])

        //Controls for colour of light
        lights[i].color.set(controls[`manualLight${i}`])
        lights[i]._material.color.set(controls[`manualLight${i}`])
    }

    //Controls for colour of the cube
    for (let i = 0; i < 3; i++){
        cube[i].material.color.set(controls.cubeColour)

        const delta = clock.getDelta()
        cube[i].rotation.y += 1 * delta;
    }

    //Controls for the camera
    camera.position.set(controls.cameraX, 
                        controls.cameraY, 
                        controls.cameraZ)
    camera.lookAt(0, 0, 0)


    renderer.render(scene, camera)
    //camera.lookAt(new THREE.Vector3(0, 0, 0))
    stats.update()

    angle += clock.getDelta
}


function onWindowResize() {
    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
}


//to call onWindowResize when resize happens
window.addEventListener("resize", onWindowResize)
renderer.setAnimationLoop(animate)