<script setup>
defineEmits(['select-mode']);
</script>

<template>
  <div class="mode-selection">
    <div class="content">
      <h1>Wybierz tryb konfiguratora</h1>
      <p class="subtitle">Zaprojektuj swój idealny zestaw tak, jak lubisz.</p>
      
      <div class="modes-grid">
        <button @click="$emit('select-mode', '3d')" class="mode-card card-3d">
          <div class="card-content">
            <div class="icon">📦</div>
            <h2>Konfigurator 3D</h2>
            <p>Pełna swoboda w układaniu produktów w przestrzeni trójwymiarowej.</p>
          </div>
          <div class="hover-effect"></div>
        </button>

        <button @click="$emit('select-mode', 'simple')" class="mode-card card-simple">
          <div class="card-content">
            <div class="icon">🧩</div>
            <h2>Konfigurator Uproszczony</h2>
            <p>Szybki i wygodny widok siatki 2D dla precyzyjnego planowania.</p>
          </div>
          <div class="hover-effect"></div>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mode-selection {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  font-family: 'Inter', sans-serif;
  color: #1f2937;
  padding: 20px;
}

.content {
  text-align: center;
  max-width: 900px;
  width: 100%;
}

h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, #111827, #4b5563);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 1.1rem;
  color: #6b7280;
  margin-bottom: 3rem;
}

.modes-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 768px) {
  .modes-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.mode-card {
  background: white;
  border: none;
  border-radius: 24px;
  padding: 3rem 2rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  text-align: left;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.mode-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.card-content {
  position: relative;
  z-index: 2;
}

.icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
  display: inline-block;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
}

.mode-card h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #111827;
}

.mode-card p {
  color: #6b7280;
  line-height: 1.5;
  font-size: 1rem;
  margin: 0;
}

/* Specific Card Styles */
.card-3d:hover .icon {
  background: rgba(59, 130, 246, 0.1);
  border-color: #3b82f6;
  transform: scale(1.1) rotate(-5deg);
  transition: all 0.3s;
}

.card-simple:hover .icon {
  background: rgba(245, 158, 11, 0.1);
  border-color: #f59e0b;
  transform: scale(1.1) rotate(5deg);
  transition: all 0.3s;
}

.hover-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom right, rgba(255,255,255,0), rgba(255,255,255,0.5));
  opacity: 0;
  transition: opacity 0.3s;
}

.mode-card:hover .hover-effect {
  opacity: 1;
}
</style>
