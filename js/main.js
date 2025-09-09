import { Room } from './room.js';
import { createControls } from './controls.js';

let scene, camera, renderer, controls;
let room, sections = [];
let raycaster, mouse;

export function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 5);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Initialize room
    room = new Room();
    scene.add(room);
    
    // Initialize controls
    controls = createControls(camera, renderer.domElement);
    
    // Initialize raycasting for interactions
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // Event listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onMouseClick);
    
    // Hide loading screen
    document.querySelector('.loading-screen').style.display = 'none';
    
    // Start animation loop
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onMouseClick(event) {
    // Check for intersections with interactive objects
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(sections, true);
    
    if (intersects.length > 0) {
        const object = intersects[0].object;
        // Handle section click
        if (object.userData.sectionType) {
            handleSectionClick(object.userData.sectionType);
        }
    }
}

function handleSectionClick(sectionType) {
    // Handle different section types
    switch(sectionType) {
        case 'about':
            // Show about panel
            break;
        case 'projects':
            // Show projects panel
            break;
        case 'contact':
            // Show contact panel
            break;
    }
}

// Initialize the application
init();