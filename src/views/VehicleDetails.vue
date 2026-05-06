<template>
  <div>
    <div v-if="!activeVehicle" class="text-center py-5">
      <h6 class="text-muted">Proszę wybrać pojazd w zakładce Pojazdy.</h6>
      <button class="btn btn-primary-custom mt-3" @click="router.push('/vehicles')">Przejdź do pojazdów</button>
    </div>
    
    <div v-else>
      <h5 class="fw-bold text-center mb-3">Zarządzanie pojazdem</h5>
      
      <!-- Przełącznik zakładek -->
      <div class="d-flex gap-2 mb-4 bg-light p-1 rounded-4">
        <button class="btn btn-sm flex-grow-1 py-2 rounded-3 fw-bold border-0" 
                :class="activeTab === 'info' ? 'btn-primary-custom text-white shadow-sm' : 'bg-transparent text-muted'" 
                @click="activeTab = 'info'">
          <i class="fa-solid fa-file-contract me-1"></i> Dane auta
        </button>
        <button class="btn btn-sm flex-grow-1 py-2 rounded-3 fw-bold border-0" 
                :class="activeTab === 'stats' ? 'btn-primary-custom text-white shadow-sm' : 'bg-transparent text-muted'" 
                @click="activeTab = 'stats'">
          <i class="fa-solid fa-chart-pie me-1"></i> Analiza & Wykresy
        </button>
      </div>

      <!-- ZAKŁADKA 1: DANE AUTA (Edycja) -->
      <div v-if="activeTab === 'info'">
        <form @submit.prevent="updateVehicleDetails">
          
          <!-- Podstawowe -->
          <h6 class="fw-bold text-muted small text-uppercase mb-2 ms-1">Dane podstawowe</h6>
          <div class="bg-white p-3 rounded-4 shadow-sm mb-4">
            <div class="mb-3">
              <label class="small text-muted mb-1">Numer rejestracyjny</label>
              <input type="text" class="form-control form-control-custom" v-model="activeVehicle.registration" placeholder="np. WX 12345">
            </div>
            <div>
              <label class="small text-muted mb-1">Numer VIN</label>
              <input type="text" class="form-control form-control-custom text-uppercase" v-model="activeVehicle.vin" placeholder="17 znaków VIN">
            </div>
          </div>

          <!-- Ważne daty i ubezpieczenie -->
          <h6 class="fw-bold text-muted small text-uppercase mb-2 ms-1">Ważne daty i polisy</h6>
          <div class="bg-white p-3 rounded-4 shadow-sm mb-4">
            <div class="mb-3">
              <label class="small text-muted mb-1">Przegląd techniczny do:</label>
              <input type="date" class="form-control form-control-custom" v-model="activeVehicle.inspectionDate">
            </div>
            <hr class="text-muted">
            <div class="mb-3">
              <label class="small text-muted mb-1">Ubezpieczyciel (np. PZU, Warta)</label>
              <input type="text" class="form-control form-control-custom" v-model="activeVehicle.insuranceCompany" placeholder="Nazwa ubezpieczalni">
            </div>
            <div>
              <label class="small text-muted mb-1">Ubezpieczenie (OC/AC) do:</label>
              <input type="date" class="form-control form-control-custom" v-model="activeVehicle.insuranceDate">
            </div>
          </div>

          <!-- Notatki -->
          <h6 class="fw-bold text-muted small text-uppercase mb-2 ms-1">Notatki techniczne</h6>
          <div class="bg-white p-3 rounded-4 shadow-sm mb-4">
            <textarea class="form-control form-control-custom" v-model="activeVehicle.notes" rows="4" placeholder="np. Rozmiar opon zimowych: 205/55 R16, rodzaj oleju: 5W-30..."></textarea>
          </div>

          <button type="submit" class="btn btn-primary-custom w-100 mb-2" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Zapisz zmiany
          </button>
        </form>
      </div>

      <!-- ZAKŁADKA 2: ANALIZA & WYKRESY -->
      <div v-if="activeTab === 'stats'">
        
        <!-- Karty podsumowujące -->
        <div class="row g-2 mb-4">
          <div class="col-6">
            <div class="bg-white p-3 rounded-4 shadow-sm h-100 text-center">
              <div class="small text-muted mb-1">Łączne wydatki</div>
              <h4 class="fw-bold mb-0 text-orange" style="color: var(--brand-orange);">{{ totalCosts }} zł</h4>
            </div>
          </div>
          <div class="col-6">
            <div class="bg-white p-3 rounded-4 shadow-sm h-100 text-center">
              <div class="small text-muted mb-1">Średnie spalanie</div>
              <h4 class="fw-bold mb-0 text-dark">{{ avgFuelConsumption }}</h4>
            </div>
          </div>
        </div>

        <!-- Struktura Wydatków (Doughnut Chart) -->
        <div class="bg-white p-3 rounded-4 shadow-sm mb-4 text-center">
          <h6 class="fw-bold small text-muted text-uppercase mb-3">Podział kategorii wydatków</h6>
          <div style="height: 220px; position: relative;">
            <canvas id="expensesPieChart"></canvas>
          </div>
        </div>

        <!-- Wydatki w czasie (Bar Chart) -->
        <div class="bg-white p-3 rounded-4 shadow-sm mb-4 text-center">
          <h6 class="fw-bold small text-muted text-uppercase mb-3">Miesięczna struktura kosztów</h6>
          <div style="height: 220px; position: relative;">
            <canvas id="monthlyBarChart"></canvas>
          </div>
        </div>

        <!-- Przycisk eksportu CSV -->
        <button class="btn btn-secondary-custom w-100 py-3 rounded-3 fw-bold mb-4" @click="downloadCSV">
          <i class="fa-solid fa-file-csv me-2 fs-5"></i> Pobierz raport kosztów (CSV)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { activeVehicle, activeVehicleExpenses } from '../store.js';
import { db } from '../firebase.js';
import { doc, updateDoc } from 'firebase/firestore';

const router = useRouter();
const isLoading = ref(false);
const activeTab = ref('info');

// 1. Obliczanie statystyk finansowych
const totalCosts = computed(() => {
  return activeVehicleExpenses.value.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0).toFixed(2);
});

// 2. Precyzyjne obliczanie średniego spalania l/100km z historii tankowań
const avgFuelConsumption = computed(() => {
  const fuels = activeVehicleExpenses.value
    .filter(e => e.category === 'paliwo')
    .sort((a, b) => a.mileage - b.mileage);
    
  if (fuels.length < 2) return 'brak danych';
  
  // Suma litrów ze wszystkich tankowań z pominięciem pierwszego (ponieważ liczymy od pełnego do pełnego)
  const totalLiters = fuels.slice(1).reduce((sum, e) => sum + parseFloat(e.liters || 0), 0);
  const kmDiff = fuels[fuels.length - 1].mileage - fuels[0].mileage;
  
  if (kmDiff <= 0 || totalLiters <= 0) return 'brak danych';
  
  return ((totalLiters / kmDiff) * 100).toFixed(2) + ' l/100km';
});

// 3. Eksport danych do pliku CSV (Excel Friendly UTF-8 + BOM)
const downloadCSV = () => {
  if (navigator.vibrate) navigator.vibrate(50);
  
  const headers = ['Data', 'Kategoria', 'Kwota (zł)', 'Przebieg (km)', 'Ilość Paliwa (L)', 'Opis'];
  const rows = activeVehicleExpenses.value.map(e => [
    e.date,
    e.category === 'paliwo' ? 'Paliwo' : (e.category === 'serwis' ? 'Serwis' : 'Inne'),
    e.amount,
    e.mileage,
    e.liters || '',
    e.description || ''
  ]);
  
  // Dodanie BOM (Byte Order Mark) dla Excela
  let csvContent = '\uFEFF'; 
  csvContent += [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Raport_MotoLog_${activeVehicle.value.registration || 'pojazdu'}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 4. Integracja wykresów (Chart.js)
let pieChartInstance = null;
let barChartInstance = null;

const initCharts = () => {
  nextTick(() => {
    const pieCtx = document.getElementById('expensesPieChart');
    const barCtx = document.getElementById('monthlyBarChart');
    
    if (pieChartInstance) pieChartInstance.destroy();
    if (barChartInstance) barChartInstance.destroy();
    
    if (!pieCtx || !barCtx) return;

    // Obliczanie podziału na kategorie
    let fuelSum = 0, serviceSum = 0, otherSum = 0;
    activeVehicleExpenses.value.forEach(e => {
      const amt = parseFloat(e.amount || 0);
      if (e.category === 'paliwo') fuelSum += amt;
      else if (e.category === 'serwis') serviceSum += amt;
      else otherSum += amt;
    });

    // Doughnut Chart
    pieChartInstance = new window.Chart(pieCtx, {
      type: 'doughnut',
      data: {
        labels: ['Paliwo', 'Serwis', 'Inne'],
        datasets: [{
          data: [fuelSum, serviceSum, otherSum],
          backgroundColor: ['#ff761a', '#dc3545', '#6c757d'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });

    // Obliczanie wydatków miesięcznych (ostatnie 6 miesięcy)
    const months = {};
    activeVehicleExpenses.value.forEach(e => {
      if (!e.date) return;
      const monthName = e.date.substring(0, 7); // YYYY-MM
      months[monthName] = (months[monthName] || 0) + parseFloat(e.amount || 0);
    });

    const sortedMonths = Object.keys(months).sort().slice(-6);
    const monthlyLabels = sortedMonths.map(m => {
      const [y, mm] = m.split('-');
      const polishMonths = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
      return `${polishMonths[parseInt(mm) - 1]} ${y}`;
    });
    const monthlyData = sortedMonths.map(m => months[m]);

    // Bar Chart
    barChartInstance = new window.Chart(barCtx, {
      type: 'bar',
      data: {
        labels: monthlyLabels,
        datasets: [{
          label: 'Suma kosztów (zł)',
          data: monthlyData,
          backgroundColor: 'rgba(255, 118, 26, 0.85)',
          borderColor: '#ff761a',
          borderWidth: 1,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  });
};

watch(activeTab, (newTab) => {
  if (newTab === 'stats') {
    initCharts();
  }
});

const updateVehicleDetails = async () => {
  if (!activeVehicle.value || !activeVehicle.value.id) return;

  if (activeVehicle.value.vin && activeVehicle.value.vin.trim().length !== 17) {
    alert('Numer VIN musi mieć dokładnie 17 znaków.');
    return;
  }

  isLoading.value = true;
  try {
    const vRef = doc(db, "vehicles", activeVehicle.value.id);
    await updateDoc(vRef, {
      registration: activeVehicle.value.registration || '',
      vin: (activeVehicle.value.vin || '').toUpperCase().trim(),
      inspectionDate: activeVehicle.value.inspectionDate || null,
      insuranceCompany: activeVehicle.value.insuranceCompany || '',
      insuranceDate: activeVehicle.value.insuranceDate || null,
      notes: activeVehicle.value.notes || ''
    });

    if (navigator.vibrate) navigator.vibrate(100);
    alert('Szczegóły pojazdu zostały zapisane pomyślnie!');
  } catch (error) {
    console.error("Błąd podczas zapisywania szczegółów pojazdu:", error);
    alert("Wystąpił błąd podczas zapisywania zmian.");
  } finally {
    isLoading.value = false;
  }
};
</script>
