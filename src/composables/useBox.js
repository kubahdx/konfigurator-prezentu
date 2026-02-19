import * as THREE from 'three';
import { watch, toRefs } from 'vue';

export function useBox(sceneManager, props) {
    let mesh;
    const { width, height, depth, color } = toRefs(props);

    const createBox = () => {
        const geometry = new THREE.BoxGeometry(width.value, height.value, depth.value);
        const material = new THREE.MeshStandardMaterial({ color: color.value });
        mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        sceneManager.add(mesh);
    };

    const updateGeometry = () => {
        if (!mesh) return;
        mesh.geometry.dispose();
        mesh.geometry = new THREE.BoxGeometry(width.value, height.value, depth.value);
    };

    const updateMaterial = () => {
        if (!mesh) return;
        mesh.material.color.set(color.value);
    };

    // Watchers for reactivity
    watch([width, height, depth], updateGeometry);
    watch(color, updateMaterial);

    // Initial creation
    createBox();

    return {
        mesh
    };
}
