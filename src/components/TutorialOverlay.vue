<script setup>
import { ref, onMounted, nextTick, watch, computed } from 'vue';

const steps = [
    {
        target: null, // Centered modal
        title: 'Witaj w Kreatorze Prezentów! 👋',
        text: 'Zaprojektuj idealny prezent w kilku prostych krokach. Przejdziemy przez szybki samouczek, aby pokazać Ci, jak to działa.',
        position: 'center'
    },
    {
        target: '#step-size',
        title: 'Wybierz Rozmiar',
        text: 'Zacznij od wybrania rozmiaru pudełka, który najlepiej odpowiada Twoim potrzebom. Kliknij jeden z dostępnych wariantów.',
        position: 'left' 
    },
    {
        target: '#step-products',
        title: 'Dodaj Produkty',
        text: 'To jest paleta produktów. Przeciągnij i upuść (drag & drop) wybrane elementy bezpośrednio do pudełka na środku ekranu.',
        position: 'left'
    },
    {
        target: '#step-canvas',
        title: 'Interakcja z Pudełkiem',
        text: 'Tutaj widzisz swoje pudełko w 3D. Możesz obracać widok (lewy przycisk myszy), przesuwać elementy wewnątrz, a nawet wyciągać je z powrotem.',
        position: 'bottom-center' 
    },
    {
        target: '#step-summary',
        title: 'Podsumowanie',
        text: 'Gdy skończysz, kliknij tutaj, aby zobaczyć listę wybranych produktów i złożyć zamówienie.',
        position: 'top-center'
    }
];

const currentStepIndex = ref(0);
const isVisible = ref(true);
const spotlightStyle = ref({});
const tooltipStyle = ref({});

const currentStep = computed(() => steps[currentStepIndex.value]);

const finishTutorial = () => {
    isVisible.value = false;
    localStorage.setItem('tutorial_seen', 'true');
};

const nextStep = () => {
    if (currentStepIndex.value < steps.length - 1) {
        currentStepIndex.value++;
    } else {
        finishTutorial();
    }
};

const prevStep = () => {
    if (currentStepIndex.value > 0) {
        currentStepIndex.value--;
    }
};

const skipTutorial = () => {
    finishTutorial();
};

const updateHighlight = async () => {
    await nextTick();
    const step = currentStep.value;

    if (!step.target) {
        // Center modal
        spotlightStyle.value = {
            top: '50%',
            left: '50%',
            width: '0px',
            height: '0px',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
            borderRadius: '50%',
            transition: 'all 0.5s ease',
            position: 'fixed'
        };
        tooltipStyle.value = {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            position: 'fixed'
        };
        return;
    }

    const el = document.querySelector(step.target);
    if (el) {
        const rect = el.getBoundingClientRect();
        const padding = 10;
        
        spotlightStyle.value = {
            top: `${rect.top - padding}px`,
            left: `${rect.left - padding}px`,
            width: `${rect.width + padding * 2}px`,
            height: `${rect.height + padding * 2}px`,
            borderRadius: '16px',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75), 0 0 15px rgba(255, 255, 255, 0.3)',
            position: 'fixed',
            pointerEvents: 'none',
            transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
            zIndex: 9998
        };

        // Tooltip positioning
        const tooltipW = 320; 
        const tooltipH = 200; // Estimated max height
        const gap = 20;

        let top = 0;
        let left = 0;

        if (step.position === 'left') {
            top = rect.top;
            left = rect.left - tooltipW - gap;
        } else if (step.position === 'right') {
            top = rect.top;
            left = rect.right + gap;
        } else if (step.position === 'top') {
            top = rect.top - tooltipH - gap; 
            left = rect.left;
        } else if (step.position === 'top-center') {
            top = rect.top - 200; // rough estimate push up
            left = rect.left + (rect.width / 2) - (tooltipW / 2);
        } else if (step.position === 'bottom') {
            top = rect.bottom + gap;
            left = rect.left;
        } else if (step.position === 'bottom-center') {
             // Special case for canvas: put it near bottom of screen?
             // Or relative to rect.bottom (which is screen bottom for canvas)
             // If canvas is full screen, rect.bottom is window.innerHeight.
             // pushing it further down is off screen.
             // So for canvas, we essentially want 'center' or 'bottom-inside'.
             
             // Let's interpret 'bottom-center' as relative to target center logic
             top = rect.bottom - 250; // Inside at bottom
             left = rect.left + (rect.width / 2) - (tooltipW / 2);
        } else {
            // center
            top = rect.top + (rect.height / 2) - (tooltipH / 2);
            left = rect.left + (rect.width / 2) - (tooltipW / 2);
        }

        // Clamp to Viewport to prevent "floating away"
        const margin = 20;
        const maxLeft = window.innerWidth - tooltipW - margin;
        const maxTop = window.innerHeight - 100 - margin;

        left = Math.max(margin, Math.min(left, maxLeft));
        top = Math.max(margin, Math.min(top, maxTop));
        
        tooltipStyle.value = {
            top: `${top}px`,
            left: `${left}px`,
            position: 'fixed'
        };
    }
};

onMounted(() => {
    updateHighlight();
    window.addEventListener('resize', updateHighlight);
});

watch(currentStepIndex, updateHighlight);

</script>

<template>
<Transition name="fade">
    <div v-if="isVisible" class="tutorial-wrapper">
        <div class="spotlight" :style="spotlightStyle"></div>

        <div class="tutorial-card" :style="tooltipStyle">
            <div class="card-content">
                <div class="step-badge" v-if="currentStep.target">
                    Krok {{ currentStepIndex }} z {{ steps.length - 1 }}
                </div>
                <h3>{{ currentStep.title }}</h3>
                <p>{{ currentStep.text }}</p>
            </div>

            <div class="card-actions">
                <button class="btn-skip" @click="skipTutorial">Pomiń</button>
                <div class="nav-buttons">
                    <button v-if="currentStepIndex > 0" class="btn-prev" @click="prevStep">Wstecz</button>
                    <button class="btn-next" @click="nextStep">
                        {{ currentStepIndex === steps.length - 1 ? 'Gotowe!' : 'Dalej' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</Transition>
</template>

<style scoped>
.tutorial-wrapper {
    position: fixed;
    inset: 0;
    z-index: 10000;
    pointer-events: none;
}

.spotlight {
    position: fixed;
    pointer-events: none;
}

.tutorial-card {
    position: fixed;
    width: 320px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(12px);
    padding: 24px;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.5) inset;
    pointer-events: auto;
    transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
    z-index: 10001;
    color: #333;
}

h3 {
    margin: 0 0 8px 0;
    font-size: 1.2rem;
    font-weight: 700;
}

p {
    margin: 0 0 20px 0;
    font-size: 0.95rem;
    line-height: 1.5;
    color: #555;
}

.card-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.btn-next {
    background: #2563EB;
    color: white;
    border: none;
    padding: 8px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
}

.btn-prev {
    background: transparent;
    border: 1px solid #ddd;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    margin-right: 8px;
}

.btn-skip {
    background: transparent;
    border: none;
    color: #888;
    cursor: pointer;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
