import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { shallowRef } from 'vue';

export function useThree() {
    const scene = shallowRef(null);
    const camera = shallowRef(null);
    const renderer = shallowRef(null);
    const controls = shallowRef(null);
    let animationId;

    const init = (el) => {
        // Scene
        scene.value = new THREE.Scene();
        scene.value.background = new THREE.Color(0xf0f0f0);

        // Camera
        camera.value = new THREE.PerspectiveCamera(
            75,
            el.clientWidth / el.clientHeight,
            0.1,
            1000
        );
        camera.value.position.z = 5;

        // Renderer
        renderer.value = new THREE.WebGLRenderer({ antialias: true });
        renderer.value.setSize(el.clientWidth, el.clientHeight);
        renderer.value.shadowMap.enabled = true;
        el.appendChild(renderer.value.domElement);

        // Controls
        controls.value = new OrbitControls(camera.value, renderer.value.domElement);
        controls.value.enableDamping = true;

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.value.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7);
        directionalLight.castShadow = true;
        scene.value.add(directionalLight);

        // Animation Loop
        const animate = () => {
            animationId = requestAnimationFrame(animate);
            if (controls.value) controls.value.update();
            if (renderer.value && scene.value && camera.value) {
                renderer.value.render(scene.value, camera.value);
            }
        };
        animate();

        // Resize Handler
        window.addEventListener('resize', onWindowResize);
    };

    const onWindowResize = () => {
        if (!renderer.value || !camera.value || !renderer.value.domElement.parentElement) return;
        const el = renderer.value.domElement.parentElement;
        camera.value.aspect = el.clientWidth / el.clientHeight;
        camera.value.updateProjectionMatrix();
        renderer.value.setSize(el.clientWidth, el.clientHeight);
    };

    const traverse = (callback) => {
        scene.value?.traverse(callback);
    };

    const add = (object) => {
        scene.value?.add(object);
    };

    const remove = (object) => {
        scene.value?.remove(object);
    };

    const destroy = () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', onWindowResize);
        renderer.value?.dispose();
        controls.value?.dispose();
    };

    return {
        init,
        destroy,
        add,
        remove,
        traverse,
        scene,
        camera,
        renderer,
        controls
    };
}
