export function createControls(camera, domElement) {
    const controls = new THREE.OrbitControls(camera, domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.5;
    
    // Limit vertical rotation to simulate a person looking around
    controls.minPolarAngle = Math.PI / 3; // ~60 degrees
    controls.maxPolarAngle = Math.PI / 2; // 90 degrees
    
    return controls;
}