<script setup>
import { ref, computed, watch } from 'vue';

const productCategories = [
    {
        id: 'tea',
        name: 'Herbata',
        color: '#EF4444',
        items: [
            { id: 'tea_mongol', name: 'Mongolska' },
            { id: 'tea_spanish', name: 'Hiszpańska' },
            { id: 'tea_british', name: 'Brytyjska' },
        ]
    },
    {
        id: 'coffee',
        name: 'Kawa',
        color: '#3B82F6',
        items: [
            { id: 'coffee_arabica', name: 'Arabica' },
            { id: 'coffee_speciality', name: 'Speciality' },
        ]
    },
    {
        id: 'nuts',
        name: 'Orzechy',
        color: '#10B981',
        items: [
            { id: 'nuts_bitter', name: 'W gorzkiej czekoladzie' },
            { id: 'nuts_milk', name: 'W mlecznej czekoladzie' },
            { id: 'nuts_salted', name: 'Solone' },
        ]
    },
    {
        id: 'candy',
        name: 'Drażetki',
        color: '#F59E0B',
        items: [
            { id: 'candy_coco', name: 'Kokosowe' },
            { id: 'candy_milk', name: 'Mleczne' },
            { id: 'candy_fruit', name: 'Owocowe' },
        ]
    },
];

const selectedSize = ref(null); 
const selectedCategory = ref(null);
const selectedProduct = ref(null);
const selectedLayoutIndex = ref(null);
const filledSlots = ref({});
const activeSlot = ref(null);

const sizes = {
    s: { name: 'S', width: 2, height: 2, label: '12×12 cm' },
    m: { name: 'M', width: 2, height: 3, label: '12×18 cm' },
    l: { name: 'L', width: 3, height: 3, label: '18×18 cm' },
    xl: { name: 'XL', width: 3, height: 4, label: '18×24 cm' },
};

const layouts = {
    s: [
        { name: '4× Małe', slots: [
            { x:0, y:0, w:1, h:1 }, { x:1, y:0, w:1, h:1 },
            { x:0, y:1, w:1, h:1 }, { x:1, y:1, w:1, h:1 }
        ]},
        { name: '2× Małe + 1× Duże', slots: [
            { x:0, y:0, w:1, h:1 }, { x:1, y:0, w:1, h:1 },
            { x:0, y:1, w:2, h:1 }
        ]},
        { name: '2× Duże', slots: [
            { x:0, y:0, w:2, h:1 },
            { x:0, y:1, w:2, h:1 }
        ]}
    ],
    m: [
        { name: '6× Małe', slots: [
            { x:0, y:0, w:1, h:1 }, { x:1, y:0, w:1, h:1 },
            { x:0, y:1, w:1, h:1 }, { x:1, y:1, w:1, h:1 },
            { x:0, y:2, w:1, h:1 }, { x:1, y:2, w:1, h:1 }
        ]},
        { name: '4× Małe + 1× Duże', slots: [
            { x:0, y:0, w:1, h:1 }, { x:1, y:0, w:1, h:1 },
            { x:0, y:1, w:1, h:1 }, { x:1, y:1, w:1, h:1 },
            { x:0, y:2, w:2, h:1 }
        ]},
        { name: '2× Małe + 2× Duże', slots: [
            { x:0, y:0, w:1, h:1 }, { x:1, y:0, w:1, h:1 },
            { x:0, y:1, w:2, h:1 },
            { x:0, y:2, w:2, h:1 }
        ]},
        { name: '3× Duże', slots: [
            { x:0, y:0, w:2, h:1 },
            { x:0, y:1, w:2, h:1 },
            { x:0, y:2, w:2, h:1 }
        ]}
    ],
    l: [
        { name: '9× Małe', slots: [
            { x:0, y:0, w:1, h:1 }, { x:1, y:0, w:1, h:1 }, { x:2, y:0, w:1, h:1 },
            { x:0, y:1, w:1, h:1 }, { x:1, y:1, w:1, h:1 }, { x:2, y:1, w:1, h:1 },
            { x:0, y:2, w:1, h:1 }, { x:1, y:2, w:1, h:1 }, { x:2, y:2, w:1, h:1 }
        ]},
        { name: '5× Małe + 2× Duże', slots: [
            { x:0, y:0, w:1, h:1 }, { x:1, y:0, w:1, h:1 }, { x:2, y:0, w:1, h:1 },
            { x:0, y:1, w:2, h:1 }, { x:2, y:1, w:1, h:1 },
            { x:0, y:2, w:2, h:1 }, { x:2, y:2, w:1, h:1 }
        ]}
    ],
    xl: [
        { name: '12× Małe', slots: [
             { x:0, y:0, w:1, h:1 }, { x:1, y:0, w:1, h:1 }, { x:2, y:0, w:1, h:1 },
             { x:0, y:1, w:1, h:1 }, { x:1, y:1, w:1, h:1 }, { x:2, y:1, w:1, h:1 },
             { x:0, y:2, w:1, h:1 }, { x:1, y:2, w:1, h:1 }, { x:2, y:2, w:1, h:1 },
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

const currentSize = computed(() => selectedSize.value ? sizes[selectedSize.value] : null);
const currentLayouts = computed(() => selectedSize.value ? (layouts[selectedSize.value] || []) : []);
const currentLayout = computed(() => selectedLayoutIndex.value !== null ? currentLayouts.value[selectedLayoutIndex.value] : null);

// Current step: 1 = size, 2 = layout, 3 = product (slot active)
const currentStep = computed(() => {
    if (activeSlot.value !== null) return 3;
    if (selectedLayoutIndex.value !== null) return 2; // layout chosen, waiting for slot
    if (selectedSize.value !== null) return 2; // show layout step
    return 1;
});

watch(selectedSize, (newSize) => {
    if (newSize) {
        selectedLayoutIndex.value = null;
        filledSlots.value = {};
        activeSlot.value = null;
        selectedCategory.value = null;
        selectedProduct.value = null;
    }
});

watch(selectedLayoutIndex, (newLayoutIndex) => {
    if (newLayoutIndex !== null) {
        filledSlots.value = {};
        activeSlot.value = null;
        selectedCategory.value = null;
        selectedProduct.value = null;
    }
});

const onSlotClick = (index) => {
    activeSlot.value = index;
    selectedCategory.value = null;
    
    if (filledSlots.value[index]) {
       const existing = filledSlots.value[index];
       selectedCategory.value = productCategories.find(c => c.id === existing.categoryId) || null;
    }
};

const closeProductPanel = () => {
    activeSlot.value = null;
    selectedCategory.value = null;
    selectedProduct.value = null;
};

const selectProduct = (item, category) => {
    if (activeSlot.value === null) return;
    
    const prod = { ...item, color: category.color, categoryName: category.name, categoryId: category.id };
    selectedProduct.value = prod;
    
    filledSlots.value = { 
        ...filledSlots.value, 
        [activeSlot.value]: prod 
    };
    
    const totalSlots = currentLayout.value.slots.length;
    const filledCount = Object.keys(filledSlots.value).length;
    
    if (filledCount === totalSlots) {
        activeSlot.value = null;
        selectedCategory.value = null;
    } else {
        // Find next empty slot automatically
        const slots = currentLayout.value.slots;
        let nextEmptyIndex = null;
        for(let i = 0; i < slots.length; i++) {
            if (!filledSlots.value[i]) {
                nextEmptyIndex = i;
                break;
            }
        }
        if (nextEmptyIndex !== null) {
            activeSlot.value = nextEmptyIndex;
            selectedCategory.value = null;
        } else {
            activeSlot.value = null;
            selectedCategory.value = null;
        }
    }
};

const getSlotStyle = (slot, index) => {
    const isFilled = filledSlots.value[index];
    return {
        gridColumn: `${slot.x + 1} / span ${slot.w}`,
        gridRow: `${slot.y + 1} / span ${slot.h}`,
        backgroundColor: isFilled ? isFilled.color : 'rgba(255,255,255,0.5)',
        borderColor: isFilled ? isFilled.color : 'rgba(0,0,0,0.1)'
    };
};

const summary = computed(() => {
    const counts = {};
    Object.values(filledSlots.value).forEach(p => {
        counts[p.name] = (counts[p.name] || 0) + 1;
    });
    return counts;
});
const showSummary = ref(false);

const filledCount = computed(() => Object.keys(filledSlots.value).length);
const totalSlots = computed(() => currentLayout.value ? currentLayout.value.slots.length : 0);
</script>

<template>
  <div class="simple-configurator">
    <!-- LEFT PANEL -->
    <div class="controls">
      
      <!-- Header -->
      <div class="panel-header">
        <h2>Konfigurator</h2>
        <p class="panel-subtitle">Stwórz pudełko w 3 krokach</p>
      </div>

      <!-- Step Progress Bar -->
      <div class="step-progress">
        <div class="step-item" :class="{ active: currentStep >= 1, done: selectedSize !== null }">
          <div class="step-circle">
            <span v-if="selectedSize !== null">✓</span>
            <span v-else>1</span>
          </div>
          <span class="step-label">Rozmiar</span>
        </div>
        <div class="step-line" :class="{ active: selectedSize !== null }"></div>
        <div class="step-item" :class="{ active: currentStep >= 2, done: selectedLayoutIndex !== null }">
          <div class="step-circle">
            <span v-if="selectedLayoutIndex !== null">✓</span>
            <span v-else>2</span>
          </div>
          <span class="step-label">Układ</span>
        </div>
        <div class="step-line" :class="{ active: selectedLayoutIndex !== null }"></div>
        <div class="step-item" :class="{ active: currentStep >= 3 }">
          <div class="step-circle">3</div>
          <span class="step-label">Produkty</span>
        </div>
      </div>

      <!-- STEP 1: Size Selection -->
      <Transition name="slide-fade">
        <div class="step-section" v-show="currentStep === 1 || selectedSize === null">
          <div class="section-header">
            <span class="section-num">1</span>
            <h3>Wybierz rozmiar</h3>
          </div>
          <div class="size-grid">
            <button
              v-for="(info, key) in sizes"
              :key="key"
              class="size-btn"
              :class="{ active: selectedSize === key }"
              @click="selectedSize = key"
            >
              <div class="size-icon-wrap">
                <div class="size-icon" :class="key"></div>
              </div>
              <span class="size-name">{{ info.name }}</span>
              <span class="size-dims">{{ info.label }}</span>
            </button>
          </div>
        </div>
      </Transition>

      <!-- STEP 2: Layout Selection -->
      <Transition name="slide-fade">
        <div class="step-section" v-if="selectedSize !== null && activeSlot === null">
          <div class="section-header">
            <span class="section-num">2</span>
            <h3>Wybierz układ</h3>
          </div>
          <div class="layout-list">
            <button
              v-for="(layout, idx) in currentLayouts"
              :key="idx"
              class="layout-btn"
              :class="{ active: selectedLayoutIndex === idx }"
              @click="selectedLayoutIndex = idx"
            >
              <div class="mini-layout-preview"
                   :style="{ 
                     width: '56px', 
                     height: `${(currentSize.height / currentSize.width) * 56}px` 
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
              <span class="layout-name">{{ layout.name }}</span>
            </button>
          </div>

          <!-- Prompt to click slot -->
          <Transition name="slide-fade">
            <div class="click-prompt" v-if="selectedLayoutIndex !== null">
              <div class="prompt-icon">👆</div>
              <p>Kliknij pole na pudełku<br>aby dodać produkt</p>
            </div>
          </Transition>
        </div>
      </Transition>

      <!-- STEP 3: Product Selection (shown when slot is active) -->
      <Transition name="slide-fade">
        <div class="step-section product-panel" v-if="activeSlot !== null">
          <div class="product-panel-header">
            <div class="section-header">
              <span class="section-num accent">3</span>
              <h3>Wybierz produkt</h3>
            </div>
            <button class="close-slot-btn" @click="closeProductPanel" title="Zamknij">✕</button>
          </div>

          <div class="slot-indicator">
            <span class="slot-dot" :style="{ background: filledSlots[activeSlot]?.color || '#3b82f6' }"></span>
            Pole {{ activeSlot + 1 }} z {{ totalSlots }}
          </div>

          <!-- Category selection -->
          <div v-if="!selectedCategory" class="category-cards">
            <button
              v-for="cat in productCategories"
              :key="cat.id"
              class="category-card"
              :style="{ '--cat-color': cat.color }"
              @click="selectedCategory = cat"
            >
              <div class="cat-color-bar" :style="{ background: cat.color }"></div>
              <div class="cat-card-body">
                <span class="cat-name">{{ cat.name }}</span>
                <span class="cat-count">{{ cat.items.length }} warianty</span>
              </div>
              <span class="cat-arrow">›</span>
            </button>
          </div>

          <!-- Variant selection -->
          <div v-else class="item-step">
            <button class="back-btn" @click="selectedCategory = null">
              ‹ {{ selectedCategory.name }}
            </button>
            <div class="item-list">
              <button
                v-for="item in selectedCategory.items"
                :key="item.id"
                class="item-btn"
                :class="{ active: filledSlots[activeSlot]?.id === item.id }"
                :style="{ '--cat-color': selectedCategory.color }"
                @click="selectProduct(item, selectedCategory)"
              >
                <div class="item-color-chip" :style="{ background: selectedCategory.color }"></div>
                <span class="item-name">{{ item.name }}</span>
                <span v-if="filledSlots[activeSlot]?.id === item.id" class="item-check">✓</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Spacer + Action Button -->
      <div class="panel-footer">
        <!-- Progress indicator -->
        <div class="fill-progress" v-if="currentLayout">
          <div class="fill-bar">
            <div class="fill-fill" :style="{ width: `${(filledCount / totalSlots) * 100}%` }"></div>
          </div>
          <span class="fill-label">{{ filledCount }}/{{ totalSlots }} pól wypełnionych</span>
        </div>

        <button
          class="action-btn summary-btn"
          :disabled="filledCount === 0"
          @click="showSummary = true"
        >
          Podsumuj zamówienie
        </button>
      </div>
    </div>

    <!-- RIGHT: Grid/Canvas Area -->
    <div class="grid-area">
      <div v-if="currentSize && currentLayout" class="box-preview">
        <div class="box-container" :style="{
            width: `${currentSize.width * 90}px`,
            height: `${currentSize.height * 90}px`,
            gridTemplateColumns: `repeat(${currentSize.width}, 1fr)`,
            gridTemplateRows: `repeat(${currentSize.height}, 1fr)`
        }">
          <div 
            v-for="(slot, idx) in currentLayout.slots" 
            :key="idx"
            class="layout-slot"
            :class="{ 
              'is-active': activeSlot === idx,
              'is-filled': !!filledSlots[idx]
            }"
            :style="getSlotStyle(slot, idx)"
            @click="onSlotClick(idx)"
          >
            <div v-if="!filledSlots[idx]" class="add-icon">+</div>
            <div v-else class="slot-filled-content">
              <span class="slot-initial">{{ filledSlots[idx].name[0].toUpperCase() }}</span>
              <span class="slot-product-name">{{ filledSlots[idx].name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="empty-grid-state">
        <div class="empty-state-content">
          <span class="empty-icon">📦</span>
          <h3>{{ !selectedSize ? 'Wybierz rozmiar' : 'Wybierz układ' }}</h3>
          <p>{{ !selectedSize ? 'Zacznij od panelu po lewej' : 'Teraz wybierz układ przegródek' }}</p>
        </div>
      </div>

      <!-- Bottom hint when layout chosen -->
      <p class="canvas-hint" v-if="currentLayout && activeSlot === null && filledCount < totalSlots">
        Kliknij pole {{ filledCount === 0 ? 'aby dodać produkt' : 'aby edytować lub dodać kolejny' }}
      </p>
      <p class="canvas-hint success" v-if="currentLayout && filledCount === totalSlots">
        ✓ Pudełko gotowe! Możesz złożyć zamówienie.
      </p>
    </div>

    <!-- Summary Modal -->
    <div v-if="showSummary" class="modal-overlay" @click.self="showSummary = false">
      <div class="modal-content">
        <h2>Twoje Zamówienie</h2>
        <div v-if="Object.keys(summary).length === 0" class="empty-msg">
          Pudełko jest puste 📦
        </div>
        <ul v-else>
          <li v-for="(count, label) in summary" :key="label">
            <span>{{ label }}</span>
            <strong>{{ count }} szt.</strong>
          </li>
        </ul>
        <div class="total-info" v-if="currentLayout">
          Zapełnienie: {{ filledCount }} / {{ totalSlots }}
        </div>
        <button class="close-btn" @click="showSummary = false">Zamknij</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ============================================
   BASE LAYOUT
   ============================================ */
.simple-configurator {
    display: flex;
    height: 100vh;
    background: #f3f4f6;
    color: #1f2937;
    font-family: 'Inter', sans-serif;
    overflow: hidden;
}

.simple-configurator button {
    color: #1f2937;
}

/* ============================================
   LEFT PANEL
   ============================================ */
.controls {
    width: 380px;
    flex-shrink: 0;
    background: white;
    padding: 32px 28px;
    display: flex;
    flex-direction: column;
    gap: 28px;
    box-shadow: 4px 0 30px rgba(0,0,0,0.06);
    z-index: 10;
    overflow-y: auto;
}

/* Scrollbar */
.controls::-webkit-scrollbar { width: 4px; }
.controls::-webkit-scrollbar-track { background: transparent; }
.controls::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }

/* ============================================
   HEADER
   ============================================ */
.panel-header h2 {
    margin: 0;
    font-size: 1.6rem;
    color: #111827;
    font-weight: 800;
    letter-spacing: -0.02em;
}

.panel-subtitle {
    margin: 4px 0 0;
    font-size: 0.875rem;
    color: #9ca3af;
    font-weight: 500;
}

/* ============================================
   STEP PROGRESS
   ============================================ */
.step-progress {
    display: flex;
    align-items: center;
    gap: 0;
    padding: 16px 20px;
    background: #f9fafb;
    border-radius: 16px;
    border: 1px solid #f3f4f6;
}

.step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    flex: 0 0 auto;
}

.step-circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #e5e7eb;
    color: #9ca3af;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.85rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2px solid #e5e7eb;
}

.step-item.active .step-circle {
    background: #FF5A1F;
    color: white;
    border-color: #FF5A1F;
    box-shadow: 0 0 0 4px rgba(255, 90, 31, 0.15);
}

.step-item.done .step-circle {
    background: #10B981;
    color: white;
    border-color: #10B981;
}

.step-label {
    font-size: 0.7rem;
    color: #9ca3af;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.step-item.active .step-label,
.step-item.done .step-label {
    color: #374151;
}

.step-line {
    flex: 1;
    height: 2px;
    background: #e5e7eb;
    margin: 0 8px;
    margin-bottom: 18px;
    border-radius: 2px;
    transition: background 0.3s;
}
.step-line.active {
    background: #10B981;
}

/* ============================================
   STEP SECTION WRAPPER
   ============================================ */
.step-section {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.section-header {
    display: flex;
    align-items: center;
    gap: 10px;
}

.section-num {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #FF5A1F;
    color: white;
    font-size: 0.75rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.section-num.accent {
    background: #3b82f6;
}

.section-header h3 {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 700;
    color: #374151;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

/* ============================================
   SIZE GRID
   ============================================ */
.size-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}

.size-btn {
    border: 2px solid #e5e7eb;
    background: white;
    padding: 16px 12px;
    border-radius: 16px;
    cursor: pointer;
    text-align: center;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.size-btn:hover { 
    background: #f9fafb; 
    border-color: #d1d5db;
    transform: translateY(-2px);
}

.size-btn.active {
    border-color: #FF5A1F;
    background: #fff5f1;
    box-shadow: 0 0 0 2px rgba(255, 90, 31, 0.2);
}

.size-icon-wrap {
    width: 52px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.size-icon {
    background: #e5e7eb;
    border-radius: 4px;
    transition: background 0.2s;
}

.size-icon.s { width: 28px; height: 28px; }
.size-icon.m { width: 28px; height: 36px; }
.size-icon.l { width: 36px; height: 36px; }
.size-icon.xl { width: 36px; height: 44px; }

.size-btn.active .size-icon {
    background: #FF5A1F;
    opacity: 0.5;
}

.size-name {
    font-weight: 800;
    font-size: 1.3rem;
    color: #374151;
    line-height: 1;
}

.size-btn.active .size-name {
    color: #FF5A1F;
}

.size-dims {
    font-size: 0.78rem;
    color: #9ca3af;
    font-weight: 500;
}

.size-btn.active .size-dims {
    color: #FF5A1F;
    opacity: 0.8;
}

/* ============================================
   LAYOUT SELECTOR
   ============================================ */
.layout-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}

.layout-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
    padding: 14px;
    border: 2px solid #e5e7eb;
    border-radius: 16px;
    background: white;
    cursor: pointer;
    text-align: center;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.layout-btn:hover { 
    background: #f9fafb;
    border-color: #d1d5db;
    transform: translateY(-2px);
}

.layout-btn.active {
    border-color: #FF5A1F;
    box-shadow: 0 0 0 2px rgba(255, 90, 31, 0.2);
    background: #fff5f1;
}

.mini-layout-preview {
    position: relative;
    background: white;
    border: 2px solid #d1d5db;
    border-radius: 4px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
    flex-shrink: 0;
}

.layout-btn.active .mini-layout-preview {
    border-color: #FF5A1F;
}

.mini-slot {
    position: absolute;
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    box-sizing: border-box;
    transition: background-color 0.2s;
}

.layout-btn.active .mini-slot {
    background: rgba(255, 90, 31, 0.12);
    border-color: rgba(255, 90, 31, 0.4);
}

.layout-name {
    font-weight: 600;
    font-size: 0.78rem;
    color: #6b7280;
    line-height: 1.3;
}

.layout-btn.active .layout-name {
    color: #FF5A1F;
}

/* Click Prompt */
.click-prompt {
    display: flex;
    align-items: center;
    gap: 12px;
    background: linear-gradient(135deg, #eff6ff, #dbeafe);
    border: 1.5px solid #bfdbfe;
    border-radius: 14px;
    padding: 14px 16px;
    animation: pulsePrompt 2s ease-in-out infinite;
}

@keyframes pulsePrompt {
    0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
    50% { box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15); }
}

.prompt-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
}

.click-prompt p {
    margin: 0;
    font-size: 0.85rem;
    color: #1e40af;
    font-weight: 600;
    line-height: 1.4;
}

/* ============================================
   PRODUCT PANEL (Step 3)
   ============================================ */
.product-panel {
    background: #f8faff;
    border: 1.5px solid #dbeafe;
    border-radius: 20px;
    padding: 18px;
    gap: 16px;
}

.product-panel-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
}

.close-slot-btn {
    background: #f3f4f6;
    border: none;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    cursor: pointer;
    font-size: 0.75rem;
    color: #9ca3af;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
    flex-shrink: 0;
}

.close-slot-btn:hover {
    background: #e5e7eb;
    color: #374151;
}

.slot-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.8rem;
    font-weight: 600;
    color: #6b7280;
    padding: 8px 12px;
    background: white;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
}

.slot-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
}

/* Category Cards */
.category-cards {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.category-card {
    display: flex;
    align-items: center;
    gap: 0;
    padding: 0;
    border: 1.5px solid #e5e7eb;
    border-radius: 12px;
    background: white;
    cursor: pointer;
    transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    text-align: left;
}

.category-card:hover {
    border-color: var(--cat-color);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--cat-color) 20%, transparent);
    transform: translateX(3px);
}

.cat-color-bar {
    width: 5px;
    align-self: stretch;
    flex-shrink: 0;
}

.cat-card-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 12px 10px;
    gap: 2px;
}

.cat-name {
    font-weight: 700;
    font-size: 0.9rem;
    color: #111827;
}

.cat-count {
    font-size: 0.72rem;
    color: #9ca3af;
}

.cat-arrow {
    font-size: 1.3rem;
    color: #d1d5db;
    padding-right: 12px;
    transition: color 0.15s, transform 0.15s;
}

.category-card:hover .cat-arrow {
    color: var(--cat-color);
    transform: translateX(2px);
}

/* Back Button */
.back-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    padding: 4px 0;
    color: #374151;
    border-radius: 6px;
    transition: color 0.15s;
}

.back-btn:hover { color: #111827; }

.item-step {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

/* Item List */
.item-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.item-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border: 1.5px solid #e5e7eb;
    border-radius: 10px;
    background: white;
    cursor: pointer;
    transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
    width: 100%;
    text-align: left;
}

.item-btn:hover {
    border-color: var(--cat-color);
    background: color-mix(in srgb, var(--cat-color) 5%, white);
    transform: translateX(4px);
}

.item-btn.active {
    border-color: var(--cat-color);
    background: color-mix(in srgb, var(--cat-color) 8%, white);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--cat-color) 30%, transparent);
}

.item-color-chip {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
}

.item-name {
    flex: 1;
    font-weight: 600;
    color: #1f2937;
    font-size: 0.9rem;
}

.item-check {
    color: var(--cat-color);
    font-weight: 800;
    font-size: 1rem;
}

/* ============================================
   PANEL FOOTER
   ============================================ */
.panel-footer {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.fill-progress {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.fill-bar {
    height: 4px;
    background: #f3f4f6;
    border-radius: 4px;
    overflow: hidden;
}

.fill-fill {
    height: 100%;
    background: linear-gradient(90deg, #FF5A1F, #f97316);
    border-radius: 4px;
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fill-label {
    font-size: 0.75rem;
    color: #9ca3af;
    font-weight: 600;
    text-align: right;
}

.action-btn {
    width: 100%;
    padding: 18px;
    border-radius: 16px;
    border: none;
    font-weight: 800;
    font-size: 1rem;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.action-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
    transform: none !important;
}

.summary-btn {
    background: #111827;
    color: white;
    box-shadow: 0 8px 20px -5px rgba(0,0,0,0.2);
}

.summary-btn:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 30px -8px rgba(0,0,0,0.3);
    background: #000;
}

/* ============================================
   TRANSITIONS
   ============================================ */
.slide-fade-enter-active {
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-fade-leave-active {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-fade-enter-from {
    opacity: 0;
    transform: translateY(10px);
}
.slide-fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

/* ============================================
   RIGHT AREA / GRID
   ============================================ */
.grid-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
    background-size: 20px 20px;
    gap: 20px;
}

.box-preview {
    background: white;
    padding: 14px;
    border-radius: 24px;
    box-shadow: 0 25px 60px -12px rgba(0,0,0,0.15);
    border: 1px solid rgba(255,255,255,0.8);
}

.box-container {
    background: #e4e4e7;
    width: 100%;
    height: 100%;
    display: grid;
    gap: 6px;
    padding: 6px;
    border-radius: 12px;
    box-shadow: inset 0 2px 10px rgba(0,0,0,0.05);
    overflow: hidden;
}

.layout-slot {
    background: rgba(255,255,255,0.7);
    border-radius: 10px;
    border: 2px dashed rgba(0,0,0,0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    user-select: none;
    overflow: hidden;
}

.layout-slot:hover {
    background: white;
    border-color: rgba(0,0,0,0.25);
    transform: scale(1.02);
}

.layout-slot.is-active {
    box-shadow: 0 0 0 4px #3b82f6, 0 10px 20px rgba(59, 130, 246, 0.25);
    background: white;
    border-color: #3b82f6;
    border-style: solid;
    z-index: 5;
    transform: scale(1.05);
}

.layout-slot.is-filled {
    border-style: solid;
}

.add-icon {
    font-size: 2rem;
    color: rgba(0,0,0,0.08);
    font-weight: 800;
    transition: color 0.2s;
}

.layout-slot:hover .add-icon {
    color: rgba(0,0,0,0.25);
}

.slot-filled-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    padding: 4px;
    width: 100%;
    height: 100%;
}

.slot-initial {
    font-size: 1.6rem;
    color: white;
    font-weight: 900;
    text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    line-height: 1;
}

.slot-product-name {
    font-size: 0.6rem;
    color: rgba(255,255,255,0.85);
    font-weight: 700;
    text-align: center;
    line-height: 1.2;
    max-width: 90%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* Canvas Hint */
.canvas-hint {
    color: #9ca3af;
    font-size: 0.95rem;
    font-weight: 500;
    text-align: center;
    background: white;
    padding: 10px 20px;
    border-radius: 50px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    border: 1px solid #f3f4f6;
}

.canvas-hint.success {
    color: #059669;
    background: #f0fdf4;
    border-color: #bbf7d0;
}

/* Empty Grid State */
.empty-grid-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0.45;
    text-align: center;
}

.empty-icon {
    font-size: 5rem;
    margin-bottom: 20px;
    display: block;
    filter: grayscale(1);
}

.empty-state-content h3 {
    color: #374151;
    margin-bottom: 8px;
    font-size: 1.4rem;
    font-weight: 700;
}

.empty-state-content p {
    color: #6b7280;
    font-size: 1rem;
}

/* ============================================
   MODAL
   ============================================ */
.modal-overlay {
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.3);
    backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.2s;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.modal-content {
    background: white;
    padding: 48px;
    border-radius: 32px;
    min-width: 360px;
    text-align: center;
    box-shadow: 0 25px 80px -20px rgba(0,0,0,0.2);
    animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

.modal-content h2 {
    margin: 0 0 24px;
    font-size: 1.75rem;
    font-weight: 800;
    color: #111827;
}

.modal-content ul {
    list-style: none;
    padding: 0;
    text-align: left;
    margin: 0 0 24px;
}

.modal-content li {
    padding: 12px 0;
    border-bottom: 1px solid #f3f4f6;
    display: flex;
    justify-content: space-between;
    font-size: 1rem;
    color: #374151;
}

.total-info {
    font-weight: 700;
    color: #374151;
    font-size: 1rem;
    padding: 16px;
    background: #f9fafb;
    border-radius: 12px;
    margin-bottom: 20px;
}

.close-btn {
    padding: 14px 32px;
    background: #f3f4f6;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-weight: 700;
    color: #4b5563;
    transition: all 0.2s;
    font-size: 0.95rem;
}

.close-btn:hover {
    background: #e5e7eb;
    color: #111827;
}

.empty-msg {
    padding: 30px;
    color: #9ca3af;
    font-size: 1.1rem;
}
</style>
