<script setup>
import { ref, onMounted, onUnmounted, watchEffect, shallowRef, watch } from 'vue';
import { useThree } from '../composables/useThree';
import * as THREE from 'three';
import ConfiguratorControls from './ConfiguratorControls.vue';

const canvasContainer = ref(null);
const { init, destroy, add, remove, scene, camera, renderer, controls } = useThree();

// Container State
const width = ref(3);
const height = ref(1);
const depth = ref(3);
const containerColor = ref('#808080');

// Placed Objects State
const placedObjects = ref([]);

// 3D Objects
let containerGroup = null;
let objectsGroup = new THREE.Group();

const floorMesh = shallowRef(null);

const createContainer = () => {
    const group = new THREE.Group();
    const wallThickness = 0.1;
    const material = new THREE.MeshStandardMaterial({ 
        color: containerColor.value,
        side: THREE.DoubleSide
    });

    // Treat 'width' and 'depth' as INTERNAL dimensions
    const internalW = width.value;
    const internalD = depth.value;
    const outerW = internalW + 2 * wallThickness;
    const outerD = internalD + 2 * wallThickness;

    // Bottom (Floor) - Spans full outer area
    const bottomGeo = new THREE.BoxGeometry(outerW, wallThickness, outerD);
    const bottom = new THREE.Mesh(bottomGeo, material);
    bottom.position.y = -height.value / 2 + wallThickness / 2;
    bottom.receiveShadow = true;
    bottom.userData.isFloor = true;
    group.add(bottom);
    floorMesh.value = bottom;

    // Side Walls (Left & Right) - Span full outer depth
    const sideGeo = new THREE.BoxGeometry(wallThickness, height.value, outerD);
    
    // Left
    const left = new THREE.Mesh(sideGeo, material);
    left.position.x = -internalW / 2 - wallThickness / 2;
    left.position.y = 0; // Centered vertically relative to scene 0? 0 is center of box height?
                         // Current logic seems to center box at 0.
    left.receiveShadow = true;
    group.add(left);

    // Right
    const right = new THREE.Mesh(sideGeo, material);
    right.position.x = internalW / 2 + wallThickness / 2;
    right.receiveShadow = true;
    group.add(right);

    // Front & Back Walls - Span internal width (fit between sides)
    const fbGeo = new THREE.BoxGeometry(internalW, height.value, wallThickness);

    // Back
    const back = new THREE.Mesh(fbGeo, material);
    back.position.z = -internalD / 2 - wallThickness / 2;
    back.receiveShadow = true;
    group.add(back);

    // Front (Added as per open-box requirement)
    const front = new THREE.Mesh(fbGeo, material);
    front.position.z = internalD / 2 + wallThickness / 2;
    front.receiveShadow = true;
    group.add(front);

    return group;
};

const updateContainer = () => {
    if (!scene.value) return;

    if (containerGroup) {
        scene.value.remove(containerGroup);
        // clean up basic resources
        containerGroup.traverse(c => { if(c.isMesh) c.geometry.dispose(); });
    }

    containerGroup = createContainer();
    scene.value.add(containerGroup);
    
    // Ensure objects group is in scene
    if (!scene.value.children.includes(objectsGroup)) {
        scene.value.add(objectsGroup);
    }
};

// Helper: Text Labels
const getLabelForColor = (color) => {
    // Normalize color case if needed
    const c = color.toUpperCase();
    if (c === '#EF4444') return 'HERBATA';
    if (c === '#3B82F6') return 'KAWA';
    if (c === '#10B981') return 'ORZECHY';
    if (c === '#F59E0B') return 'DRAŻETKI';
    return null;
};

const createLabelTexture = (text, color, widthRatio = 1) => {
    const canvas = document.createElement('canvas');
    // Higher resolution for crisp text
    const size = 512;
    canvas.width = size * widthRatio;
    canvas.height = size;
    
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Text
    ctx.fillStyle = 'white';
    ctx.font = `bold ${100}px Arial`; // Adjust font size as needed
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Rotate text if needed (e.g. for Deep Box where width < depth)
    if (widthRatio < 1) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(text, 0, 0);
    } else {
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    }
    
    return new THREE.CanvasTexture(canvas);
};

const updatePlacedObjects = () => {
    // Clear old objects
    objectsGroup.clear(); // Three.js clear method

    placedObjects.value.forEach(obj => {
        const geometry = new THREE.BoxGeometry(obj.width, obj.height, obj.depth);
        
        let material;
        const labelText = getLabelForColor(obj.color);
        
        if (labelText) {
            // Create texture for top face
            const texture = createLabelTexture(labelText, obj.color, obj.width / obj.depth);
            // texture.anisotropy = renderer.value.capabilities.getMaxAnisotropy(); // Optional: improve quality at angles
            
            const matSolid = new THREE.MeshStandardMaterial({ color: obj.color });
            const matText = new THREE.MeshStandardMaterial({ map: texture });
            
            // Face materials: Right, Left, Top, Bottom, Front, Back
            material = [
                matSolid, // Right
                matSolid, // Left
                matText,  // Top (Face 2)
                matSolid, // Bottom
                matSolid, // Front
                matSolid  // Back
            ];
        } else {
            material = new THREE.MeshStandardMaterial({ color: obj.color });
        }

        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.set(obj.x, obj.y, obj.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Link mesh to the data object for raycasting/selection
        mesh.userData.internalObject = obj;
        
        objectsGroup.add(mesh);
    });
};

// Update Container when dims change
watchEffect(() => {
    if (scene.value) {
        updateContainer();
    }
});

// Update Objects when list changes
watchEffect(() => {
    if (scene.value) {
        updatePlacedObjects();
    }
});

// Reset objects when box dimensions change
watch([width, depth], () => {
    placedObjects.value = [];
});

// Helper: Boundary Clamping & Snapping
const getClampedPosition = (x, z, objW, objD, excludeObject = null) => {
    const wallThick = 0.1;
    const snapThreshold = 0.3; // Snap distance
    
    // 1. Object Snapping (Snap to other objects)
    let snappedX = x;
    let snappedZ = z;
    let minDiffX = snapThreshold;
    let minDiffZ = snapThreshold;

    const candidates = placedObjects.value.filter(o => o !== excludeObject);

    // Current object edges (un-snapped)
    const curMinX = x - objW / 2;
    const curMaxX = x + objW / 2;
    const curMinZ = z - objD / 2;
    const curMaxZ = z + objD / 2;

    candidates.forEach(other => {
        const otherMinX = other.x - other.width / 2;
        const otherMaxX = other.x + other.width / 2;
        const otherMinZ = other.z - other.depth / 2;
        const otherMaxZ = other.z + other.depth / 2;

        // X Snapping
        // Snap Right side to Other Left
        if (Math.abs(curMaxX - otherMinX) < minDiffX) {
            minDiffX = Math.abs(curMaxX - otherMinX);
            snappedX = otherMinX - objW / 2;
        }
        // Snap Left side to Other Right
        if (Math.abs(curMinX - otherMaxX) < minDiffX) {
            minDiffX = Math.abs(curMinX - otherMaxX);
            snappedX = otherMaxX + objW / 2;
        }
        // Align Left to Left
        if (Math.abs(curMinX - otherMinX) < minDiffX) {
            minDiffX = Math.abs(curMinX - otherMinX);
            snappedX = otherMinX + objW / 2;
        }
        // Align Right to Right
        if (Math.abs(curMaxX - otherMaxX) < minDiffX) {
            minDiffX = Math.abs(curMaxX - otherMaxX);
            snappedX = otherMaxX - objW / 2;
        }

        // Z Snapping
        // Snap Front to Other Back
        if (Math.abs(curMaxZ - otherMinZ) < minDiffZ) {
            minDiffZ = Math.abs(curMaxZ - otherMinZ);
            snappedZ = otherMinZ - objD / 2;
        }
        // Snap Back to Other Front
        if (Math.abs(curMinZ - otherMaxZ) < minDiffZ) {
            minDiffZ = Math.abs(curMinZ - otherMaxZ);
            snappedZ = otherMaxZ + objD / 2;
        }
        // Align Back to Back
        if (Math.abs(curMinZ - otherMinZ) < minDiffZ) {
            minDiffZ = Math.abs(curMinZ - otherMinZ);
            snappedZ = otherMinZ + objD / 2;
        }
        // Align Front to Front
        if (Math.abs(curMaxZ - otherMaxZ) < minDiffZ) {
            minDiffZ = Math.abs(curMaxZ - otherMaxZ);
            snappedZ = otherMaxZ - objD / 2;
        }
    });

    x = snappedX;
    z = snappedZ;

    x = snappedX;
    z = snappedZ;

    // 2. Wall Snapping & Clamping
    // Limits (Max valid positions)
    // Width/Depth are now INTERNAL dimensions, so we just subtract object half-size
    const xLimit = (width.value / 2) - (objW / 2);
    const zLimit = (depth.value / 2) - (objD / 2);

    // Wall Snapping (Lower priority than object alignment? Or concurrent? 
    // If we snapped to object, we might be overlapping wall.
    // Clamping will fix overlapping. Wall snapping is for "close to wall".
    // If we are already snapped to object, checking wall snap might override it.
    // Let's only snap to wall if NOT snapped to object? Or just apply sequential logic.
    // Wall snapping is usually "stronger" boundaries.
    
    // Only snap to wall if we haven't snapped to an object in that axis strongly?
    // Let's keep wall snap logic simple: If close to wall, snap to wall.
    // This might override object snap if close to both. That's acceptable.

    // If we are close to the right wall
    if (Math.abs(xLimit - x) < snapThreshold) {
        x = xLimit;
    }
    // If we are close to the left wall
    if (Math.abs(x - (-xLimit)) < snapThreshold) {
        x = -xLimit;
    }
    
    // If we are close to the back wall
    if (Math.abs(zLimit - z) < snapThreshold) {
        z = zLimit;
    }
    // If we are close to the front wall
    if (Math.abs(z - (-zLimit)) < snapThreshold) {
        z = -zLimit;
    }

    // Clamping (Ensure we never go beyond limits)
    let clampedX = Math.max(-xLimit, Math.min(xLimit, x));
    let clampedZ = Math.max(-zLimit, Math.min(zLimit, z));
    
    return { x: clampedX, z: clampedZ };
};


// Helper: Collision Detection
const checkCollision = (candidate, others) => {
    const epsilon = 0.01; // Tolerance to prevent floating point overlaps, but allow touching
    const cMinX = candidate.x - candidate.width / 2 + epsilon;
    const cMaxX = candidate.x + candidate.width / 2 - epsilon;
    const cMinZ = candidate.z - candidate.depth / 2 + epsilon;
    const cMaxZ = candidate.z + candidate.depth / 2 - epsilon;

    for (const other of others) {
        const oMinX = other.x - other.width / 2;
        const oMaxX = other.x + other.width / 2;
        const oMinZ = other.z - other.depth / 2;
        const oMaxZ = other.z + other.depth / 2;

        if (cMinX < oMaxX && cMaxX > oMinX &&
            cMinZ < oMaxZ && cMaxZ > oMinZ) {
            return true;
        }
    }
    return false;
};

// Drag and Drop Logic (New Objects)
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const onDragOver = (event) => {
    event.preventDefault(); // Necessary to allow dropping
};

const onDrop = (event) => {
    event.preventDefault();
    const rawData = event.dataTransfer.getData('application/json');
    if (!rawData) return;
    
    try {
        const { color, dimensions, type } = JSON.parse(rawData);
        const [ objW, objH, objD ] = dimensions;
        
        if (!floorMesh.value || !camera.value || !renderer.value) return;

        const rect = renderer.value.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera.value);
        const intersects = raycaster.intersectObject(floorMesh.value);

        if (intersects.length > 0) {
            const hitPoint = intersects[0].point;
            const { x, z } = getClampedPosition(hitPoint.x, hitPoint.z, objW, objD, null); // No excludeObject for new drops
            
            // Check Collision
            const candidate = { x, z, width: objW, depth: objD };
            if (checkCollision(candidate, placedObjects.value)) {
                console.warn('Cannot place object: Overlap detected');
                // Optional: visuals feedback?
                return;
            }
            
            const wallThick = 0.1;
            const floorTopY = (-height.value / 2) + wallThick;
            const objY = floorTopY + (objH / 2);

            placedObjects.value.push({
                x: x,
                y: objY,
                z: z,
                width: objW,
                height: objH,
                depth: objD,
                color: color,
                type: type
            });
            
            console.log('Placed object:', type, 'at', x, z);
        }

    } catch (e) {
        console.error('Failed to parse drop data', e);
    }
};

// Pointer Events (Move Existing)
let draggedObject = null;
let draggedStartPos = null;
let isDragging = false;

const onPointerDown = (event) => {
    // Only handle left click
    if (event.button !== 0) return;
    
    if (!camera.value || !renderer.value) return;

    const rect = renderer.value.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera.value);
    
    // Intersect placed objects
    const intersects = raycaster.intersectObjects(objectsGroup.children);
    
    if (intersects.length > 0) {
        const hitObj = intersects[0].object;
        if (hitObj.userData.internalObject) {
            draggedObject = hitObj.userData.internalObject;
            isDragging = true;
            draggedStartPos = { x: draggedObject.x, z: draggedObject.z }; // Save start pos
            
            // Disable camera controls
            if (controls.value) controls.value.enabled = false;
            
            // Optional: capture pointer
            event.target.setPointerCapture(event.pointerId);
            console.log('Started dragging:', draggedObject);
        }
    }
};

const onPointerMove = (event) => {
    if (!isDragging || !draggedObject || !floorMesh.value) return;
    
    const rect = renderer.value.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera.value);
    const intersects = raycaster.intersectObject(floorMesh.value);
    
    if (intersects.length > 0) {
        const hitPoint = intersects[0].point;
        const { x, z } = getClampedPosition(hitPoint.x, hitPoint.z, draggedObject.width, draggedObject.depth, draggedObject);
        
        // Update state logic
        draggedObject.x = x;
        draggedObject.z = z;
    }
};

const onPointerUp = (event) => {
    if (isDragging) {
        // Check Collision on Release
        if (draggedObject && draggedStartPos) {
             const others = placedObjects.value.filter(o => o !== draggedObject);
             const candidate = { 
                 x: draggedObject.x, 
                 z: draggedObject.z, 
                 width: draggedObject.width, 
                 depth: draggedObject.depth 
             };
             
             if (checkCollision(candidate, others)) {
                 // Revert
                 draggedObject.x = draggedStartPos.x;
                 draggedObject.z = draggedStartPos.z;
                 console.warn('Move reverted: Overlap detected');
             }
        }

        isDragging = false;
        draggedObject = null;
        draggedStartPos = null;
        if (controls.value) controls.value.enabled = true;
        event.target.releasePointerCapture(event.pointerId);
        console.log('Stopped dragging');
    }
};

// Helper: Summary
const showSummary = ref(false);
const summaryData = ref({});

const getColorForLabel = (label) => {
    if (label === 'HERBATA') return '#EF4444';
    if (label === 'KAWA') return '#3B82F6';
    if (label === 'ORZECHY') return '#10B981';
    if (label === 'DRAŻETKI') return '#F59E0B';
    return '#ccc';
};

const openSummary = () => {
    const counts = {};
    placedObjects.value.forEach(obj => {
        const label = getLabelForColor(obj.color) || 'Inne';
        counts[label] = (counts[label] || 0) + 1;
    });
    summaryData.value = counts;
    showSummary.value = true;
};

onMounted(() => {
  if (canvasContainer.value) {
    init(canvasContainer.value);
    // Adjust camera for "Tray" view (High angle)
    if (camera.value) {
        camera.value.position.set(0, 4, 3);
        camera.value.lookAt(0, 0, 0);
    }
  }
});

onUnmounted(() => {
  destroy();
});
</script>

<template>
  <div 
    class="configurator-container" 
    @dragover="onDragOver" 
    @drop="onDrop"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
  >
    <div id="step-canvas" ref="canvasContainer" class="canvas-container"></div>
    <ConfiguratorControls 
      v-model:width="width"
      v-model:height="height"
      v-model:depth="depth"
    />
    
    <!-- Summary Button -->
    <button id="step-summary" class="summary-btn" @click="openSummary">
        Podsumuj zamówienie
    </button>
    
    <!-- Summary Modal -->
    <div v-if="showSummary" class="modal-overlay" @click.self="showSummary = false">
        <div class="modal-content">
            <h2>Twoje Zamówienie</h2>
            <div v-if="Object.keys(summaryData).length === 0" class="empty-msg">
                Pudełko jest puste 📦
            </div>
            <ul v-else>
                <li v-for="(count, label) in summaryData" :key="label">
                    <span :style="{ color: getColorForLabel(label) }">●</span> 
                    {{ label }}: <strong>{{ count }}</strong> szt.
                </li>
            </ul>
            <button class="close-btn" @click="showSummary = false">Zamknij</button>
        </div>
    </div>
  </div>
</template>

<style scoped>
/* ... existing styles ... */
.configurator-container {
  width: 100%;
  height: 100vh;
  position: relative;
  background: #f3f4f6;
  overflow: hidden;
  touch-action: none; /* Prevent scroll on touch devices during drag */
}

.canvas-container {
  width: 100%;
  height: 100%;
  display: block;
}

.summary-btn {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  padding: 15px 40px;
  font-size: 1.2rem;
  font-weight: bold;
  background: #2563EB;
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  z-index: 100;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
  transition: transform 0.2s, background 0.2s;
}

.summary-btn:hover {
  background: #1D4ED8;
  transform: translateX(-50%) scale(1.05);
}

.modal-overlay {
  position: absolute;
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 100%;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 200;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: #fff;
  padding: 40px;
  border-radius: 20px;
  min-width: 350px;
  text-align: center;
  color: #333;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  animation: slideUp 0.3s ease;
}

.modal-content h2 {
  margin-top: 0;
  color: #111;
  font-size: 1.8rem;
  margin-bottom: 20px;
}

.modal-content ul {
  list-style: none;
  padding: 0;
  margin: 20px 0;
  text-align: left;
  display: inline-block;
}

.modal-content li {
  font-size: 1.4rem;
  margin: 12px 0;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.empty-msg {
    font-size: 1.2rem;
    color: #666;
    margin: 30px 0;
}

.close-btn {
  background: #4B5563;
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 20px;
}

.close-btn:hover {
  background: #374151;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
