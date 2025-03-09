import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
let controls;

// Initialize the scene
function init() {
    // Renderer setup
    renderer.setSize(document.getElementById('3d-container').offsetWidth, 
                    document.getElementById('3d-container').offsetHeight);
    renderer.setClearColor(0xf0f0f0);
    document.getElementById('3d-container').appendChild(renderer.domElement);

    // Camera position
    camera.position.set(2, 2, 2);
    camera.lookAt(0, 0.8, 0);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Materials
    const steelMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a4a4a,
        metalness: 0.7,
        roughness: 0.3
    });

    const jointMaterial = new THREE.MeshStandardMaterial({
        color: 0x808080,
        metalness: 0.8,
        roughness: 0.2
    });

    // Create structure
    createVerticalColumns(steelMaterial);
    createHorizontalBeams(steelMaterial);
    createJoints(jointMaterial);
    createBasePlates(steelMaterial);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.8;

    // Window resize handler
    window.addEventListener('resize', onWindowResize);
}

function createVerticalColumns(material) {
    const columnGeometry = new THREE.CylinderGeometry(0.03, 0.03, 1.6, 16);
    
    // Column positions (adjust based on your structure)
    const positions = [
        { x: -0.3, z: -0.2 },
        { x: 0.3, z: -0.2 },
        { x: -0.3, z: 0.2 },
        { x: 0.3, z: 0.2 }
    ];

    positions.forEach(pos => {
        const column = new THREE.Mesh(columnGeometry, material);
        column.position.set(pos.x, 0.8, pos.z);
        scene.add(column);
    });
}

function createHorizontalBeams(material) {
    const beamGeometry = new THREE.BoxGeometry(0.6, 0.03, 0.03);
    
    // Beam levels (adjust heights as needed)
    const levels = [0.4, 0.8, 1.2];
    
    levels.forEach(y => {
        // Horizontal beams
        const beam1 = new THREE.Mesh(beamGeometry, material);
        beam1.position.set(0, y, -0.2);
        scene.add(beam1);

        const beam2 = new THREE.Mesh(beamGeometry, material);
        beam2.position.set(0, y, 0.2);
        scene.add(beam2);

        // Cross beams
        const crossBeam = new THREE.Mesh(beamGeometry, material);
        crossBeam.rotation.y = Math.PI / 2;
        crossBeam.position.set(-0.3, y, 0);
        crossBeam.scale.set(0.4, 1, 1);
        scene.add(crossBeam);
    });
}

function createJoints(material) {
    const jointGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    
    // Joint positions (example points)
    const positions = [
        { x: -0.3, y: 0, z: -0.2 },
        { x: 0.3, y: 0, z: -0.2 },
        // Add all joint positions...
    ];

    positions.forEach(pos => {
        const joint = new THREE.Mesh(jointGeometry, material);
        joint.position.set(pos.x, pos.y, pos.z);
        scene.add(joint);
    });
}

function createBasePlates(material) {
    const baseGeometry = new THREE.BoxGeometry(0.1, 0.02, 0.1);
    
    // Base positions
    const positions = [
        { x: -0.3, z: -0.2 },
        { x: 0.3, z: -0.2 },
        // Add all base positions...
    ];

    positions.forEach(pos => {
        const base = new THREE.Mesh(baseGeometry, material);
        base.position.set(pos.x, -0.01, pos.z);
        scene.add(base);
    });
}

function onWindowResize() {
    const container = document.getElementById('3d-container');
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Start the application
init();
animate();
