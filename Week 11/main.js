import "./style.css"
import * as THREE from 'three'
import * as CANNON from 'cannon-es'

import { Howl } from 'howler'

import Stats from 'three/addons/libs/stats.module.js'
import * as dat from 'dat.gui'

const NUM_BOXES = 10

function addWorld() {
    return new CANNON.World({
        gravity: new CANNON.Vec3(0, -9.82, 0) // m/s²
    })
}

function addBoxBody(world, x, y, z) {
    const size = 0.5
    const halfExtents = new CANNON.Vec3(size, size, size)
    const boxShape = new CANNON.Box(halfExtents)
    const material = new CANNON.Material("box")
    const boxBody = new CANNON.Body({
        mass: 1,
        shape: boxShape,
        material: material
    })
    boxBody.position.set(x, y, z)
    world.addBody(boxBody)
    return boxBody
}

function addGroundBody(world) {
    const material = new CANNON.Material("ground")
    const groundBody = new CANNON.Body({
        type: CANNON.Body.STATIC,
        // can also be achieved by setting the mass to 0
        shape: new CANNON.Plane(),
        material: material
    })
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
    // make it face up
    world.addBody(groundBody)
    return groundBody
}

function setUpCollisions(world, boxMaterials, groundMaterial) {
    for (let i = 0; i < boxMaterials.length; i++) {
        const m1 = boxMaterials[i];
        // Collision material from each box to the ground:
        world.addContactMaterial(new CANNON.ContactMaterial(
            m1,
            groundMaterial,
            {
                friction: 50,
                restitution: 0.1
            }
        ))

        // Collision material between each pair of boxes:
        for (let j = 0; j < i; j++) {
            const m2 = boxMaterials[j];
            world.addContactMaterial(new CANNON.ContactMaterial(
                m1,
                m2,
                {
                    friction: 50,
                    restitution: 0.2
                }
            ))
        }
    }
}

function addControls(gui) {

    const sound = new Howl({    
        src: ['/BigBen.mp3']
    })
    
    let controls = {
        cameraX: 3,
        cameraY: 10,
        cameraZ: 4,
        //running: false,
        playhalf: () => {
            const id = sound.play()
            sound.rate(0.5, id)
        },
        playnormal: () => {
            const id = sound.play()
            sound.rate(1, id)
        },
        playdouble: () => {
            const id = sound.play()
            sound.rate(2, id)
        }
    }
    
    gui.add(controls, "cameraX", -10, 10, 0.01)
    gui.add(controls, "cameraY", -10, 10, 0.01)
    gui.add(controls, "cameraZ", -10, 10, 0.01)
    gui.add(controls, "playhalf")
    gui.add(controls, "playnormal")
    gui.add(controls, "playdouble")
    //gui.add(controls, "running")

    return controls
}

function setUpCollisionSounds(boxBodies, controls) {
    const sound = new Howl({ 
        src: ['explosion.wav'],
         sprite: {
            hit1: [0, 5000],
            hit2: [0, 2000]
         }
    });

    for (const b of boxBodies) {
        b.addEventListener("collide", (event) => {
            const vel = Math.abs(event.contact.getImpactVelocityAlongNormal())
            console.log(vel)
            if (vel > controls.velocity){
                const level = Math.min(vel - controls.velocity, 1.0)
                if (event.body.material.name == "ground"){
                    const id = sound.play("hit1");
                    sound.volume(level, id)
                } else{
                    const id = sound.play("hit2")
                    sound.volume(level, id)
                }
            }
        });
    }
}


function addCube(scene) {
    const c = new THREE.Color().setHSL(Math.random(), 1, 0.5)
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material1 = new THREE.MeshPhongMaterial({ color: c })

    const cube = new THREE.Mesh(geometry, material1)
    cube.castShadow = true
    cube.receiveShadow = true
    scene.add(cube)
    return cube
}

function addPlane(scene) {
    const geometry = new THREE.PlaneGeometry(20, 20)
    const material1 = new THREE.MeshPhongMaterial()

    const plane = new THREE.Mesh(geometry, material1)
    plane.receiveShadow = true
    scene.add(plane)
    plane.rotateX(-Math.PI / 2)
    return plane
}

function addCamera() {
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight
    )

    camera.lookAt(new THREE.Vector3(0, 0, 0))
    return camera
}

function addRenderer() {
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.shadowMap.enabled = true
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)
    return renderer
}

function addLight(scene, obj) {
    const light = new THREE.DirectionalLight()
    light.castShadow = true
    light.position.set(1, 0.5, -0.7)
    light.target = obj
    scene.add(light)
}

function addAnimator(world, boxes, cubes,
                     scene, renderer, camera, controls, stats) {
    const animate = () => {
        world.fixedStep()

        for (let i = 0; i < boxes.length; i++) {
            cubes[i].position.copy(boxes[i].position)
            cubes[i].quaternion.copy(boxes[i].quaternion)
        }

        camera.position.set(controls.cameraX, controls.cameraY, controls.cameraZ)
        camera.lookAt(0, 0, 0)
    
        renderer.render(scene, camera)
        stats.update()
    }
    
    renderer.setAnimationLoop(animate)    
}

function addStats() {
    const stats = new Stats()
    document.body.appendChild(stats.dom)
    return stats    
}

const clock = new THREE.Clock()

function addResizing(renderer, camera) {
    window.addEventListener("resize", () => {
        renderer.setSize(window.innerWidth, window.innerHeight)

        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
    })
}


/*  Put everything together. We attempt to avoid top-level
    pollution of names by having an assembly function. */

function assemble() {
    const world = addWorld()

    const boxes = []
    const cubes = []

    const ground = addGroundBody(world)
    const gui = new dat.GUI()
    const controls = addControls(gui)
    const scene = new THREE.Scene()

    for (let i = 0; i < NUM_BOXES; i++) {
        const x = Math.random() * 4 - 2
        const y = (i + 2) * 2
        const z = Math.random() * 4 - 2
        boxes.push(addBoxBody(world, x, y, z))
        cubes.push(addCube(scene))
    }

    setUpCollisions(world, boxes.map(b => b.material), ground.material)
    setUpCollisionSounds(boxes, controls)
    const plane = addPlane(scene)
    addLight(scene, plane)
    const renderer = addRenderer()
    const camera = addCamera()
    const stats = addStats()
    addAnimator(world, boxes, cubes,
                scene, renderer, camera, controls, stats)
    addResizing(renderer, camera)
}

assemble()