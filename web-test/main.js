import "./style.css"
import * as THREE from 'three'
import * as CANNON from 'cannon-es'


import Stats from 'three/addons/libs/stats.module.js'
import * as dat from 'dat.gui'


// Establish gravity for the physics world
function addWorld() {
    return new CANNON.World({
        gravity: new CANNON.Vec3(0, -9.82, 0) // m/s²
    })
}


// Add a dynamic box body to the physics world
function addBoxBody(world) {
    const size = 0.5;
    const halfExtents = new CANNON.Vec3(size, size, size);
    const boxShape = new CANNON.Box(halfExtents);
    const material = new CANNON.Material("box");

    // Create box1
    const boxBody1 = new CANNON.Body({
        mass: 1,
        shape: boxShape,
        material: material
    });
    boxBody1.position.set(0, 10, 0);  // Position for box1
    world.addBody(boxBody1);

    // Create box2
    const boxBody2 = new CANNON.Body({
        mass: 1,
        shape: boxShape,
        material: material
    });
    boxBody2.position.set(1, 10, 0);  // Position for box2 (adjust as needed)
    world.addBody(boxBody2);

    return boxBody1, boxBody2;  // Return both box bodies in an array
}



// Add an invisible ground plane to the physics world
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


// Set up collision rules between materials
function setUpCollisions(world, boxMaterial1, boxMaterial2 ,groundMaterial) {
    const contactMaterial1 = new CANNON.ContactMaterial(
        boxMaterial1,
        groundMaterial,
        {
            friction: 0.9,
            restitution: 0.9
        }
    )
    world.addContactMaterial(contactMaterial1)

    const contactMaterial2 = new CANNON.ContactMaterial(
        boxMaterial2,
        groundMaterial,
        {
            friction: 0,
            restitution: 0.9
        }
    )
    world.addContactMaterial(contactMaterial2)
}


// Create GUI controls for the camera's position
function addControls(gui) {
    let controls = {
        cameraX: 1,
        cameraY: 1,
        cameraZ: 2
    }
   
    gui.add(controls, "cameraX", -5, 5, 0.01)
    gui.add(controls, "cameraY", -5, 5, 0.01)
    gui.add(controls, "cameraZ", -5, 5, 0.01)


    return controls
}


// Add a visible cube to the scene
function addCube(scene) {
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material1 = new THREE.MeshPhongMaterial()


    const cube1 = new THREE.Mesh(geometry, material1)
    scene.add(cube1)
    cube1.castShadow = true   //SHADOWWW
    cube1.position.set(0, 0, 0)

    const cube2 = new THREE.Mesh(geometry, material1)
    scene.add(cube2)
    cube2.castShadow = true   //SHADOWWW
    cube2.position.set(0, 0, 0)
    return cube1, cube2
}


// Add a plane to the scene to act as a ground surface
function addPlane(scene) {
    const geometry = new THREE.PlaneGeometry(10, 10)
    const material1 = new THREE.MeshPhongMaterial()


    const plane = new THREE.Mesh(geometry, material1)
    plane.receiveShadow = true
    scene.add(plane)
    plane.rotateX(-Math.PI / 2)

    const light = new THREE.DirectionalLight()
    light.position.set(1, 0.5, 0.7)
    light.castShadow = true   //SHADOW!!!
    light.target = plane; // Set the light target to the group containing both cubes
    scene.add(light)
    return plane
}


// Add a perspective camera for viewing the scene
function addCamera() {
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight
    )


    camera.lookAt(new THREE.Vector3(0, 0, 0))
    return camera
}


// Set up a WebGL renderer for rendering the scene
function addRenderer(scene, cube1, cube2) {
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = true   ///SHADOW!!
    document.body.appendChild(renderer.domElement)
    return renderer
}


// Add a directional light to illuminate the cube
function addLight(scene, cube1, cube2) {
    const light1 = new THREE.DirectionalLight()
    light1.position.set(1, 0.5, 0.7)
    light1.castShadow = true   //SHADOW!!!
    light1.target = cube1; // Set the light target to the group containing both cubes
    scene.add(light1)

    const light2 = new THREE.DirectionalLight()
    light2.position.set(1, 0.5, 0.7)
    light2.castShadow = true   //SHADOW!!!
    light2.target = cube2; // Set the light target to the group containing both cubes
    scene.add(light2)
}




// Create the animation loop for rendering and physics updates
function addAnimator(world, box1, box2, cube1, cube2, scene, renderer, camera, controls, stats) {
    const animate = () => {
        world.fixedStep()
        
        cube1.position.copy(box1.position)
        cube1.quaternion.copy(box1.quaternion)

        cube2.position.copy(box2.position)
        cube2.quaternion.copy(box2.quaternion)

        camera.position.set(controls.cameraX, controls.cameraY, controls.cameraZ)
        camera.lookAt(0, 0, 0)
   
        renderer.render(scene, camera)
        stats.update()
    }
   
    renderer.setAnimationLoop(animate)    
}


// Add performance statistics to the display
function addStats() {
    const stats = new Stats()
    document.body.appendChild(stats.dom)
    return stats    
}


// Handle resizing the renderer and updating the camera aspect ratio
function addResizing(renderer, camera) {
    window.addEventListener("resize", () => {
        renderer.setSize(window.innerWidth, window.innerHeight)


        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
    })
}


/*  Put everything together. We attempt to avoid top-level
    pollution of names by having an assembly function. */


// Assemble the physics world and render scene
function assemble() {
    // Physics:
    const world = addWorld()
    const box1 = addBoxBody(world)
    const box2 = addBoxBody(world)
    const ground = addGroundBody(world)
    setUpCollisions(world, box1.material, box2.material, ground.material)
    // Visuals:
    const gui = new dat.GUI()
    const scene = new THREE.Scene()
    const cube1 = addCube(scene)
    const cube2 = addCube(scene)
    const plane = addPlane(scene)
    //const plane2 = addPlane(scene)
    //addLight(scene, plane, plane2)
    addLight(scene, cube1, cube2)
    const renderer = addRenderer(scene, cube1, cube2)
    const camera = addCamera()
    const stats = addStats()
    const controls = addControls(gui)
    // Animation loop involves both:
    addAnimator(world, box1, box2, cube1, cube2, scene, renderer,
        camera, controls, stats)
    addResizing(renderer, camera)
}


assemble()