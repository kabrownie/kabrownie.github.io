export class Room extends THREE.Group {
    constructor() {
        super();
        
        this.createWalls();
        this.createSections();
        this.addDecorations();
    }
    
    createWalls() {
        // Create room walls
        const wallGeometry = new THREE.PlaneGeometry(20, 10);
        const wallMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x333333, 
            roughness: 0.7,
            metalness: 0.3
        });
        
        // Back wall
        const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
        backWall.position.z = -10;
        backWall.position.y = 5;
        this.add(backWall);
        
        // Other walls would be created similarly...
    }
    
    createSections() {
        // Load your 3D section models here
        const loader = new THREE.GLTFLoader();
        
        // Section 1 - About
        loader.load('./models/section1.glb', (gltf) => {
            const section = gltf.scene;
            section.position.set(-5, 2, -4.9);
            section.userData.sectionType = 'about';
            this.add(section);
            sections.push(section);
        });
        
        // Add more sections similarly...
    }
    
    addDecorations() {
        // Add decorative elements to make the room more interesting
        const tableGeometry = new THREE.BoxGeometry(4, 0.5, 2);
        const tableMaterial = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
        const table = new THREE.Mesh(tableGeometry, tableMaterial);
        table.position.y = 0.25;
        this.add(table);
        
        // Add more decorations...
    }
}