<script setup>
defineProps({
  width: Number,
  height: Number,
  depth: Number
})

const emit = defineEmits([
  'update:width', 'update:height', 'update:depth'
])

const colors = [
    { name: 'Herbata', value: '#EF4444' },
    { name: 'Kawa', value: '#3B82F6' },
    { name: 'Orzechy', value: '#10B981' },
    { name: 'Drażetki', value: '#F59E0B' },
];


const setSize = (w, h, d) => {
    emit('update:width', w);
    emit('update:height', h);
    emit('update:depth', d);
};


const onDragStart = (event, color, type) => {
    if (event.dataTransfer) {
        let dimensions = [1,1,1];
        if (type === 'brick') dimensions = [2,1,1];
        if (type === 'deep') dimensions = [1,1,2];
        if (type === 'long') dimensions = [3,1,1];
        if (type === 'long_deep') dimensions = [1,1,3];
        
        const data = {
            color,
            dimensions,
            type
        };
        event.dataTransfer.setData('application/json', JSON.stringify(data));
        event.dataTransfer.effectAllowed = 'copy';
    }
};
</script>

<template>
  <div class="controls-panel">
    <div class="panel-header">
      <h2>Konfigurator</h2>
      <p class="subtitle">Dostosuj swoje pudełko</p>
    </div>

    <div class="section">
      <h3>Wielkość</h3>
      <div id="step-size" class="preset-grid">
        <button 
          class="preset-card"
          :class="{ active: width === 2 && depth === 2 }"
          @click="setSize(2, 1, 2)"
        >
          <div class="card-icon">
            <div class="icon-box s"></div>
          </div>
          <span class="card-label">S</span>
          <span class="card-dims">12x12cm</span>
        </button>

        <button 
          class="preset-card"
          :class="{ active: width === 2 && depth === 3 }"
          @click="setSize(2, 1, 3)"
        >
          <div class="card-icon">
            <div class="icon-box m"></div>
          </div>
          <span class="card-label">M</span>
          <span class="card-dims">12x18cm</span>
        </button>

        <button 
          class="preset-card"
          :class="{ active: width === 3 && depth === 3 }"
          @click="setSize(3, 1, 3)"
        >
          <div class="card-icon">
            <div class="icon-box l"></div>
          </div>
          <span class="card-label">L</span>
          <span class="card-dims">18x18cm</span>
        </button>

        <button 
          class="preset-card"
          :class="{ active: width === 3 && depth === 4 }"
          @click="setSize(3, 1, 4)"
        >
          <div class="card-icon">
            <div class="icon-box xl"></div>
          </div>
          <span class="card-label">XL</span>
          <span class="card-dims">18x24cm</span>
        </button>
      </div>
    </div>

    <div class="section">
      <h3>Wybierz produkty do zestawu</h3>
      <p class="section-desc">Przeciągnij elementy do pudełka</p>
      
      <div id="step-products" class="palette-scroll">
          <div v-for="colorObj in colors" :key="colorObj.value" class="palette-group">
            <span class="group-label">{{ colorObj.name }}</span>
            <div class="palette-items">
                <!-- Cube -->
                <div 
                    class="palette-item cube"
                    :style="{ backgroundColor: colorObj.value }"
                    draggable="true"
                    @dragstart="onDragStart($event, colorObj.value, 'cube')"
                    title="Sześcian (1:1:1)"
                ></div>
                
                <!-- Brick -->
                <div 
                    class="palette-item brick"
                    :style="{ backgroundColor: colorObj.value }"
                    draggable="true"
                    @dragstart="onDragStart($event, colorObj.value, 'brick')"
                    title="Cegiełka (2:1:1)"
                ></div>
                
                <!-- Deep Box -->
                <div 
                    class="palette-item deep"
                    :style="{ backgroundColor: colorObj.value }"
                    draggable="true"
                    @dragstart="onDragStart($event, colorObj.value, 'deep')"
                    title="Deep Box (1:1:2)"
                ></div>
                
                <!-- Long -->
                <div 
                    class="palette-item long"
                    :style="{ backgroundColor: colorObj.value }"
                    draggable="true"
                    @dragstart="onDragStart($event, colorObj.value, 'long')"
                    title="Długi (3:1:1)"
                ></div>
                
                 <!-- Long Deep -->
                <div 
                    class="palette-item long_deep"
                    :style="{ backgroundColor: colorObj.value }"
                    draggable="true"
                    @dragstart="onDragStart($event, colorObj.value, 'long_deep')"
                    title="Długi Głęboki (1:1:3)"
                ></div>
            </div>
          </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.controls-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  background: #ffffff;
  padding: 32px;
  border-radius: 24px;
  width: 380px;
  max-height: 90vh;
  overflow-y: auto;
  user-select: none;
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1), 
    0 10px 10px -5px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(0,0,0,0.05); /* Subtle border ring */
  font-family: 'Inter', sans-serif;
  color: #1f2937;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Scrollbar styling */
.controls-panel::-webkit-scrollbar {
  width: 6px;
}
.controls-panel::-webkit-scrollbar-track {
  background: transparent;
}
.controls-panel::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 20px;
}

.panel-header h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: #111827;
    letter-spacing: -0.025em;
}

.subtitle {
    margin: 4px 0 0;
    color: #6b7280;
    font-size: 0.95rem;
}

.section h3 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 16px;
    color: #374151;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.section-desc {
    font-size: 0.875rem;
    color: #9ca3af;
    margin: -8px 0 16px;
}

/* Preset Grid */
.preset-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

.preset-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.preset-card:hover {
    border-color: #d1d5db;
    background: #f9fafb;
    transform: translateY(-1px);
}

.preset-card.active {
    border-color: #FF5A1F; /* Brand Orange */
    background: #FFF1EB; /* Very light orange tint */
    box-shadow: 0 0 0 1px #FF5A1F;
}

.icon-box {
    width: 40px;
    height: 30px;
    border: 2px solid #d1d5db;
    border-radius: 4px;
    margin-bottom: 12px;
    position: relative;
    transition: border-color 0.2s;
}

.preset-card.active .icon-box {
    border-color: #FF5A1F;
    background: rgba(255, 90, 31, 0.1);
}

.icon-box.s::after { content: ''; position: absolute; inset: 6px; border: 1px dashed #d1d5db; }
.icon-box.m::after { content: ''; position: absolute; inset: 4px 2px; border: 1px dashed #d1d5db; }
.icon-box.l::after { content: ''; position: absolute; inset: 2px; border: 1px dashed #d1d5db; }
.icon-box.xl::after { content: ''; position: absolute; inset: 1px; border: 1px solid #d1d5db; }

.card-label {
    font-weight: 600;
    font-size: 1rem;
    color: #374151;
}

.preset-card.active .card-label {
    color: #FF5A1F;
}

.card-dims {
    font-size: 0.75rem;
    color: #9ca3af;
    margin-top: 2px;
}

/* Color Selector */
.color-selector {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px;
    background: #f9fafb;
    border-radius: 12px;
    border: 1px solid #f3f4f6;
}

.color-preview {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid #e5e7eb;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    position: relative;
    overflow: hidden;
}

.color-preview input {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
}

.color-value {
    font-family: monospace;
    color: #6b7280;
    font-size: 0.9rem;
}

/* Palette Palette */
.palette-scroll {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.palette-group {
    background: #f9fafb;
    padding: 12px;
    border-radius: 12px;
    border: 1px solid #f3f4f6;
}

.group-label {
    display: block;
    font-size: 0.9rem;
    font-weight: 600;
    text-transform: uppercase;
    color: #374151;
    margin-bottom: 12px;
    letter-spacing: 0.05em;
}

.palette-items {
    display: flex;
    gap: 16px;
    justify-content: flex-start;
    align-items: center;
    perspective: 800px;
}

.palette-item {
    position: relative;
    transform-style: preserve-3d;
    transform: rotateX(25deg) rotateY(-25deg);
    cursor: grab;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 
        10px 10px 20px rgba(0,0,0,0.1),
        -1px -1px 0 rgba(255,255,255,0.5); /* Highlight */
}

/* 3D Shapes dimensions matching BoxConfigurator logic roughly visually */
.palette-item.cube { width: 36px; height: 36px; }
.palette-item.brick { width: 72px; height: 36px; }
.palette-item.deep { width: 36px; height: 72px; }
.palette-item.long { width: 108px; height: 36px; }
.palette-item.long_deep { width: 36px; height: 108px; }

/* 3D Sides */
.palette-item::before {
    content: '';
    position: absolute;
    top: 0; right: -36px; width: 36px; height: 100%;
    background: inherit;
    filter: brightness(0.85);
    transform-origin: left;
    transform: rotateY(90deg);
}
.palette-item::after {
    content: '';
    position: absolute;
    bottom: -36px; left: 0; width: 100%; height: 36px;
    background: inherit;
    filter: brightness(0.7);
    transform-origin: top;
    transform: rotateX(-90deg);
}

.palette-item:hover {
    transform: rotateX(15deg) rotateY(-15deg) scale(1.1) translateZ(10px);
    z-index: 10;
}

.palette-item:active {
    cursor: grabbing;
    transform: scale(0.95);
}
</style>
