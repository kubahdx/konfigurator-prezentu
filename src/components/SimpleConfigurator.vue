<script setup>
import { ref, computed, watch } from 'vue';

const products = [
    { name: 'Herbata', color: '#EF4444', id: 'tea' },
    { name: 'Kawa', color: '#3B82F6', id: 'coffee' },
    { name: 'Orzechy', color: '#10B981', id: 'nuts' },
    { name: 'Drażetki', color: '#F59E0B', id: 'candy' },
];

const selectedSize = ref('s'); 
const selectedProduct = ref(products[0]);
const selectedLayoutIndex = ref(0);
const filledSlots = ref({}); // Map "slotIndex" -> productData

const sizes = {
    s: { name: 'S', width: 2, height: 2, label: '12x12cm' },
    m: { name: 'M', width: 2, height: 3, label: '12x18cm' },
    l: { name: 'L', width: 3, height: 3, label: '18x18cm' },
    xl: { name: 'XL', width: 3, height: 4, label: '18x24cm' },
};

// Define Layouts
// Layout = Array of Slots { x, y, w, h }
// Coordinates are 0-based grid positions
const layouts = {
    s: [
        { name: '4x Małe', slots: [
            { x:0, y:0, w:1, h:1 }, { x:1, y:0, w:1, h:1 },
            { x:0, y:1, w:1, h:1 }, { x:1, y:1, w:1, h:1 }
        ]},
        { name: '2x Małe + 1x Duże', slots: [
            { x:0, y:0, w:1, h:1 }, { x:1, y:0, w:1, h:1 },
            { x:0, y:1, w:2, h:1 }
        ]},
        { name: '2x Duże', slots: [
            { x:0, y:0, w:2, h:1 },
            { x:0, y:1, w:2, h:1 }
        ]}
    ],
    m: [
        { name: '6x Małe', slots: [
            { x:0, y:0, w:1, h:1 }, { x:1, y:0, w:1, h:1 },
            { x:0, y:1, w:1, h:1 }, { x:1, y:1, w:1, h:1 },
            { x:0, y:2, w:1, h:1 }, { x:1, y:2, w:1, h:1 }
        ]},
        { name: '4x Małe + 1x Duże', slots: [
            { x:0, y:0, w:1, h:1 }, { x:1, y:0, w:1, h:1 },
            { x:0, y:1, w:1, h:1 }, { x:1, y:1, w:1, h:1 },
            { x:0, y:2, w:2, h:1 }
        ]},
        { name: '2x Małe + 2x Duże', slots: [
            { x:0, y:0, w:1, h:1 }, { x:1, y:0, w:1, h:1 },
            { x:0, y:1, w:2, h:1 },
            { x:0, y:2, w:2, h:1 }
        ]},
        { name: '3x Duże', slots: [
            { x:0, y:0, w:2, h:1 },
            { x:0, y:1, w:2, h:1 },
            { x:0, y:2, w:2, h:1 }
        ]}
    ],
    l: [
        { name: '9x Małe', slots: [
            { x:0, y:0, w:1, h:1 }, { x:1, y:0, w:1, h:1 }, { x:2, y:0, w:1, h:1 },
            { x:0, y:1, w:1, h:1 }, { x:1, y:1, w:1, h:1 }, { x:2, y:1, w:1, h:1 },
            { x:0, y:2, w:1, h:1 }, { x:1, y:2, w:1, h:1 }, { x:2, y:2, w:1, h:1 }
        ]},
        { name: '5x Małe + 2x Duże', slots: [
            { x:0, y:0, w:1, h:1 }, { x:1, y:0, w:1, h:1 }, { x:2, y:0, w:1, h:1 },
            { x:0, y:1, w:2, h:1 }, { x:2, y:1, w:1, h:1 },
            { x:0, y:2, w:2, h:1 }, { x:2, y:2, w:1, h:1 }
        ]}
    ],
    xl: [
        { name: '12x Małe', slots: [
             // Row 0
             { x:0, y:0, w:1, h:1 }, { x:1, y:0, w:1, h:1 }, { x:2, y:0, w:1, h:1 },
             // Row 1
             { x:0, y:1, w:1, h:1 }, { x:1, y:1, w:1, h:1 }, { x:2, y:1, w:1, h:1 },
             // Row 2
             { x:0, y:2, w:1, h:1 }, { x:1, y:2, w:1, h:1 }, { x:2, y:2, w:1, h:1 },
             // Row 3
             { x:0, y:3, w:1, h:1 }, { x:1, y:3, w:1, h:1 }, { x:2, y:3, w:1, h:1 }
        ]},
        { name: 'Kolumna Dużych', slots: [
             { x:0, y:0, w:2, h:1 }, { x:2, y:0, w:1, h:1 },
             { x:0, y:1, w:2, h:1 }, { x:2, y:1, w:1, h:1 },
             { x:0, y:2, w:2, h:1 }, { x:2, y:2, w:1, h:1 },
             { x:0, y:3, w:2, h:1 }, { x:2, y:3, w:1, h:1 }
        ]}
    ]
};

const currentSize = computed(() => sizes[selectedSize.value]);
const currentLayouts = computed(() => layouts[selectedSize.value] || []);
const currentLayout = computed(() => currentLayouts.value[selectedLayoutIndex.value]);

// Reset state when size changes
watch(selectedSize, () => {
    selectedLayoutIndex.value = 0;
    filledSlots.value = {};
});

// Reset state when layout changes
watch(selectedLayoutIndex, () => {
    filledSlots.value = {};
});

const onSlotClick = (index) => {
    if (filledSlots.value[index] && filledSlots.value[index].id === selectedProduct.value.id) {
        // Clear
        const newSlots = { ...filledSlots.value };
        delete newSlots[index];
        filledSlots.value = newSlots;
    } else {
        // Fill
        filledSlots.value = { 
            ...filledSlots.value, 
            [index]: selectedProduct.value 
        };
    }
};

const getSlotStyle = (slot, index) => {
    const isFilled = filledSlots.value[index];
    
    // Grid positioning
    // We can use grid-column and grid-row
    // x is 0-indexed, grid lines are 1-indexed.
    // spin to x+1 / span w
    
    return {
        gridColumn: `${slot.x + 1} / span ${slot.w}`,
        gridRow: `${slot.y + 1} / span ${slot.h}`,
        backgroundColor: isFilled ? isFilled.color : 'rgba(255,255,255,0.5)',
        borderColor: isFilled ? isFilled.color : 'rgba(0,0,0,0.1)'
    };
};

// Summary
const summary = computed(() => {
    const counts = {};
    Object.values(filledSlots.value).forEach(p => {
        counts[p.name] = (counts[p.name] || 0) + 1;
    });
    return counts;
});
const showSummary = ref(false);
</script>

<template>
  <div class="simple-configurator">
    <!-- Controls -->
    <div class="controls">
      <h2>Konfigurator Uproszczony</h2>
      
      <!-- Size -->
      <div class="section">
        <h3>1. Wybierz rozmiar pudełka</h3>
        <div class="size-grid">
            <button v-for="(info, key) in sizes" :key="key"
                class="size-btn"
                :class="{ active: selectedSize === key }"
                @click="selectedSize = key">
                <span class="size-name">{{ info.name }}</span>
                <span class="size-dims">{{ info.label }}</span>
            </button>
        </div>
      </div>

      <!-- Layout Selector -->
      <div class="section">
        <h3>2. Wybierz układ</h3>
        <div class="layout-list">
             <button v-for="(layout, idx) in currentLayouts" :key="idx"
                class="layout-btn"
                :class="{ active: selectedLayoutIndex === idx }"
                @click="selectedLayoutIndex = idx">
                <!-- Mini Preview of Layout -->
                <div class="mini-layout-preview" 
                     :style="{ 
                        width: '30px', 
                        height: `${(currentSize.height/currentSize.width)*30}px` 
                     }">
                     <div v-for="(s, i) in layout.slots" :key="i"
                          class="mini-slot"
                          :style="{
                              left: `${(s.x / currentSize.width) * 100}%`,
                              top: `${(s.y / currentSize.height) * 100}%`,
                              width: `${(s.w / currentSize.width) * 100}%`,
                              height: `${(s.h / currentSize.height) * 100}%`
                          }"
                     ></div>
                </div>
                <span>{{ layout.name }}</span>
             </button>
        </div>
      </div>

      <!-- Product -->
      <div class="section">
        <h3>3. Wybierz produkt</h3>
        <div class="product-list">
            <button v-for="prod in products" :key="prod.id"
                class="product-btn"
                :class="{ active: selectedProduct.id === prod.id }"
                @click="selectedProduct = prod"
                :style="{ '--prod-color': prod.color }">
                <div class="color-dot" :style="{ background: prod.color }"></div>
                <span class="prod-name">{{ prod.name }}</span>
            </button>
        </div>
      </div>
      
       <!-- Actions -->
       <div class="actions">
            <button class="action-btn summary-btn" @click="showSummary = true">
                Podsumuj zamówienie
            </button>
       </div>
    </div>

    <!-- Grid Area -->
    <div class="grid-area">
        <div class="box-preview" :style="{
            width: `${currentSize.width * 80 + 20}px`,
            height: `${currentSize.height * 80 + 20}px`
        }">
            <div class="box-container" :style="{
                gridTemplateColumns: `repeat(${currentSize.width}, 1fr)`,
                gridTemplateRows: `repeat(${currentSize.height}, 1fr)`
            }">
                <div 
                    v-for="(slot, idx) in currentLayout.slots" 
                    :key="idx"
                    class="layout-slot"
                    :style="getSlotStyle(slot, idx)"
                    @click="onSlotClick(idx)"
                >
                    <div v-if="!filledSlots[idx]" class="add-icon">+</div>
                    <span v-else class="slot-label">{{ filledSlots[idx].name[0] }}</span>
                </div>
            </div>
        </div>
        <p class="instruction">
            Kliknij puste pole, aby dodać: <strong>{{ selectedProduct.name }}</strong>
        </p>
    </div>

    <!-- Summary -->
    <div v-if="showSummary" class="modal-overlay" @click.self="showSummary = false">
        <div class="modal-content">
            <h2>Twoje Zamówienie</h2>
            <div v-if="Object.keys(summary).length === 0" class="empty-msg">
                Pudełko jest puste 📦
            </div>
            <ul v-else>
                <li v-for="(count, label) in summary" :key="label">
                    {{ label }}: <strong>{{ count }}</strong> szt.
                </li>
            </ul>
             <div class="total-info">
                 Zapełnienie: {{ Object.keys(filledSlots).length }} / {{ currentLayout.slots.length }}
             </div>
            <button class="close-btn" @click="showSummary = false">Zamknij</button>
        </div>
    </div>
  </div>
</template>

<style scoped>
.simple-configurator {
    display: flex;
    height: 100vh;
    background: #f3f4f6;
    font-family: 'Inter', sans-serif;
    overflow: hidden;
}

.controls {
    width: 380px;
    background: white;
    padding: 30px;
    display: flex;
    flex-direction: column;
    gap: 25px;
    box-shadow: 4px 0 20px rgba(0,0,0,0.05);
    z-index: 10;
    overflow-y: auto;
}

.controls h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #111827;
}

.section h3 {
    font-size: 0.9rem;
    text-transform: uppercase;
    color: #6b7280;
    margin-bottom: 12px;
    font-weight: 600;
}

/* Size Grid */
.size-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.size-btn {
    border: 1px solid #e5e7eb;
    background: white;
    padding: 12px;
    border-radius: 12px;
    cursor: pointer;
    text-align: center;
    transition: all 0.2s;
}

.size-btn:hover { background: #f9fafb; }
.size-btn.active {
    border-color: #3b82f6;
    background: #eff6ff;
    color: #1d4ed8;
    box-shadow: 0 0 0 1px #3b82f6;
}

.size-name {
    display: block;
    font-weight: 700;
    font-size: 1.1rem;
}

.size-dims {
    font-size: 0.8rem;
    color: #9ca3af;
}

/* Layout List */
.layout-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.layout-btn {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 10px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s;
}

.layout-btn:hover { background: #f9fafb; }
.layout-btn.active {
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
    background: #eff6ff;
}

.mini-layout-preview {
    position: relative;
    background: #e5e7eb;
    border: 1px solid #d1d5db;
}

.mini-slot {
    position: absolute;
    background: white;
    border: 1px solid #9ca3af;
    box-sizing: border-box;
}

/* Product List */
.product-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.product-btn {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 10px 16px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
}

.product-btn.active {
    border-color: var(--prod-color);
    background: #fafafa;
    box-shadow: 0 0 0 2px var(--prod-color);
}

.color-dot {
    width: 20px;
    height: 20px;
    border-radius: 50%;
}

.prod-name {
    font-weight: 600;
    color: #374151;
}

/* Actions */
.actions { margin-top: auto; }
.action-btn {
    width: 100%;
    padding: 16px;
    border-radius: 50px;
    border: none;
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.2s;
}
.summary-btn {
    background: #111827;
    color: white;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
.summary-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0,0,0,0.15);
}

/* Grid Area */
.grid-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.box-preview {
    background: #e5e7eb;
    padding: 10px;
    border-radius: 12px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.15);
}

.box-container {
    background: #d4d4d8;
    width: 100%;
    height: 100%;
    display: grid;
    gap: 4px; /* Gap between slots */
    padding: 4px;
    border-radius: 4px;
    box-shadow: inset 0 2px 10px rgba(0,0,0,0.1);
}

.layout-slot {
    background: rgba(255,255,255,0.5);
    border-radius: 8px;
    border: 2px dashed rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    user-select: none;
}

.layout-slot:hover {
    background: rgba(255,255,255,0.7);
    border-color: rgba(0,0,0,0.2);
}

.add-icon {
    font-size: 2rem;
    color: rgba(0,0,0,0.2);
    font-weight: bold;
}

.slot-label {
    font-size: 1.5rem;
    color: white;
    font-weight: 900;
    text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.instruction {
    margin-top: 30px;
    color: #6b7280;
    font-size: 1.1rem;
}

/* Modal */
.modal-overlay {
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    padding: 40px;
    border-radius: 24px;
    min-width: 300px;
    text-align: center;
}

.modal-content ul {
    list-style: none;
    padding: 0;
    text-align: left;
    margin: 20px 0;
}

.modal-content li {
    padding: 8px 0;
    border-bottom: 1px solid #f3f4f6;
    display: flex;
    justify-content: space-between;
}

.total-info {
    margin-top: 20px;
    font-weight: bold;
    color: #374151;
}

.close-btn {
    padding: 10px 20px;
    background: #f3f4f6;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
}
</style>
