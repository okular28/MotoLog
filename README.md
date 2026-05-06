# 🚗 MotoLog & Find — Mobilny Asystent Pojazdu (PWA)

**MotoLog & Find** to nowoczesna, responsywna aplikacja internetowa klasy **Premium** stworzona w architekturze **PWA (Progressive Web App)**. Aplikacja ułatwia kierowcom pełne zarządzanie kosztami pojazdów, analizę finansową, śledzenie ważnych terminów oraz lokalizację zaparkowanego pojazdu za pomocą GPS.

---

## ✨ Główne Funkcjonalności

### 📊 1. Zaawansowane Statystyki i Wykresy (Chart.js)
* **Wizualizacja struktury kosztów:** Dynamiczny wykres kołowy (Doughnut Chart) pokazujący podział wydatków na kategorie (*Paliwo vs Serwis vs Inne*).
* **Koszt w czasie:** Wykres słupkowy (Bar Chart) sumujący miesięczną historię wydatków z ostatnich 6 miesięcy.
* **Kalkulator spalania:** Matematycznie dokładne obliczanie średniego zużycia paliwa (l/100km) z historii tankowań (liczone od pełnego do pełnego).
* **Eksport do CSV:** Możliwość pobrania pełnej historii wydatków aktywnego pojazdu jako arkusz kalkulacyjny (plik `.csv`) z nagłówkiem UTF-8 BOM, zapewniającym pełne wsparcie polskich znaków w programie Microsoft Excel.

### 🔔 2. Inteligentny System Powiadomień i Alerty Push (FCM)
* **Przypomnienie o wymianie oleju:** Automatyczne wykrywanie przekroczenia interwału co **15 000 km** po wprowadzeniu nowego przebiegu.
* **Ważność ubezpieczenia i badań (SKP):** Monitorowanie dat ważności polisy OC/AC oraz przeglądu technicznego. Alerty generują się na 7 dni przed terminem.
* **Blokada antyspamowa:** Aplikacja pilnuje, aby to samo powiadomienie systemowe Push pojawiło się na pulpicie użytkownika maksymalnie **raz na dobę** (zapis stanu w `localStorage`).
* **Wiadomości systemowe w czasie rzeczywistym:** Integracja z kolekcją Firestore `messages` umożliwiająca natychmiastowe odbieranie komunikatów od administratora (oznaczonych etykietą **SYSTEM**).

### 📍 3. Znajdź Mój Samochód (Lokalizator GPS)
* Zapisywanie dokładnych współrzędnych geograficznych zaparkowanego pojazdu.
* Przycisk „Usuń parking” z płynnym, animowanym autorskim oknem potwierdzenia.
* Możliwość nawigacji z powrotem do zapisanego miejsca parkingowego.

### 📸 4. Dodawanie Wydatków i Kompresja Zdjęć
* Możliwość przypisania lokalizacji GPS w momencie dodawania rachunku.
* **Kompresja obrazu w locie:** Zdjęcia paragonów są kompresowane za pomocą technologii HTML5 Canvas (JPEG 60%) i zapisywane jako lekkie ciągi tekstowe **Base64** bezpośrednio w bazie Firestore (brak kosztów związanych z Firebase Storage!).

### 🎨 5. Dostosowanie do Urządzenia i Hardware
* **Ciemny motyw (Dark Mode):** Stylowy ciemny layout dopasowujący się automatycznie i zapisujący swój stan w pamięci urządzenia.
* **Haptyka (Wibracje systemowe):** Wykorzystanie API wibracji telefonu (`navigator.vibrate`) dla lepszego doświadczenia użytkownika (feedback przy zapisie zmian, usuwaniu czy błędach).
* **Uprawnienia GPS:** Ekran konfiguracji i sprawdzania uprawnień sprzętowych w locie.

### 📴 6. Pełne Wsparcie Offline (PWA)
* Działa w tle jako instalowalna aplikacja na pulpit lub ekran telefonu (iOS/Android).
* Inteligentny, wysuwany pomarańczowy **baner informujący o braku sieci**, gwarantujący pełne bezpieczeństwo danych i pracę w trybie offline.

---

## 🛠️ Stack Technologiczny
* **Frontend:** Vue 3 (Composition API / `<script setup>`), Vue Router.
* **Styling:** Vanilla CSS (klasa Premium z elementami szklanymi/glassmorphism), Bootstrap 5.
* **Baza danych i Chmura:** Firebase Suite (Authentication, real-time Cloud Firestore, Firebase Cloud Messaging).
* **Wykresy:** Chart.js.
* **Ikony:** FontAwesome 6.

---

## 🚀 Jak uruchomić projekt lokalnie?

### 1. Klonowanie i instalacja zależności
```bash
# Zainstaluj wszystkie niezbędne pakiety node_modules
npm install
```

### 2. Uruchomienie serwera deweloperskiego
```bash
# Uruchomienie lokalnego serwera deweloperskiego z ekspozycją na sieć lokalną (np. dla telefonu)
npm run dev
```

Serwer domyślnie uruchomi się na porcie: **`http://localhost:5173/`** lub **`http://localhost:5174/`**.

*Aby otworzyć aplikację na telefonie, upewnij się, że telefon i komputer są w tej samej sieci Wi-Fi, a w przeglądarce telefonu wpisz adres IP komputera, np. `http://192.168.1.25:5174/`.*

---
*Projekt zrealizowany z pasją dla maksymalnej wygody kierowców.*
