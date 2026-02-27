# Coloring Stop - Tasarım

---

## 1. Genel Yapı

```
lib/
├── main.dart
├── app.dart
├── core/
│   ├── constants/
│   │   ├── colors.dart        # Oyun renk paleti (10+ renk)
│   │   └── game_config.dart   # Sabit değerler (hız, puan, vb)
│   └── theme/
├── models/
│   ├── bus.dart               # Otobüs modeli
│   ├── bus_stop.dart          # Park yeri modeli
│   └── game_state.dart        # Oyun durumu
├── providers/
│   ├── game_provider.dart     # Riverpod game state
│   └── audio_provider.dart   # Ses efekti state
├── screens/
│   ├── splash_screen.dart     # Açılış ekranı
│   ├── menu_screen.dart       # Ana menü
│   ├── game_screen.dart       # Oyun ekranı
│   ├── leaderboard_screen.dart # Skor tablosu
│   └── game_over_screen.dart  # Oyun bitiş
├── widgets/
│   ├── bus_widget.dart        # Otobüs animasyonu
│   ├── bus_stop_widget.dart   # Park yeri
│   ├── color_palette.dart      # Renk seçim butonları
│   ├── hud_widget.dart        # Skor, seviye göstergesi
│   └── animated_bus.dart      # Otobüs hareket animasyonu
└── services/
    ├── audio_service.dart     # Ses efekti
    ├── storage_service.dart   # High score (SharedPreferences)
    └── game_logic_service.dart # Oyun kuralları
```

---

## 2. UI Tasarım

**Ekran düzeni (dikey):**
```
┌─────────────────────────┐
│     SKOR: 150    SEV: 3  │  ← HUD (üst bar)
├─────────────────────────┤
│                         │
│  ←────── OTOBÜS ──────→ │  ← Gelen otobüs (sağdan geliyor)
│                         │
├─────────────────────────┤
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐ │  ← 4 Park Yeri (benzer renkler)
│ │ 🔴│ │ 🔵│ │ 🟢│ │ 🟡│ │
│ └───┘ └───┘ └───┘ └───┘ │
├─────────────────────────┤
│  [Kırmızı][Turuncu][...] │  ← Renk paleti (tüm renkler)
└─────────────────────────┘
```

**Renk Paleti (12 renk):**
- Kırmızı, Turuncu, Sarı, Yeşıl, Açık Yeşil, Mavi
- Mor, Pembe, Kahverengi, Siyah, Beyaz, Gri

**Her seviyede:**
- Park yerleri rastgele renklerle doluyor
- Benzer renkler aynı seviyede olabilir (kırmızı + mercan + turuncu)
- Seviye arttıkça daha fazla benzer renk

---

## 3. Oyun Mantığı

**Başlangıç:**
- 4 park yeri rastgele renklerle dolar
- İlk otobüs sağdan gelir

**Oyun döngüsü:**
1. Otobüs ekranın sağından sola doğru kayar
2. Otobüs durana kadar (veya yavaşça geçerken) oyuncu park yerine tıklar
3. Doğru eşleşme: Otobüs o park yerine "park eder", +10 puan
4. Yanlış eşleşme: Oyun biter
5. Yeni otobüs gelir, park yerine tıklanabilir
6. Park yerleri doldukça (tüm 4 dolu) oyun biter

**Skor sistemi:**
- Doğru eşleşme: +10 puan
- Combo: Ardışık 5 doğru = +5 bonus, 10 doğru = +15 bonus
- Seviye geçiş bonusu: +50 puan

**Zorluk ilerlemesi (her 10 doğru = 1 seviye):**
- Seviye 1: 4 park yeri, yavaş otobüs
- Seviye 5: Benzer renkler artar (kırmızı + mercan + turuncu)
- Seviye 10: Daha hızlı otobüs, daha fazla benzer renk

---

## 4. State Management (Riverpod)

```dart
// Ana state
@freezed
class GameState with _$GameState {
  const factory GameState({
    required int score,
    required int level,
    required int combo,
    required List<BusStop> stops,      // 4 park yeri
    required Bus? currentBus,           // Gelen otobüs
    required GameStatus status,         // idle, playing, gameOver
  }) = _GameState;
}

// GameProvider
final gameProvider = StateNotifierProvider<GameNotifier, GameState>

// Metodlar:
- startGame()
- tapBusStop(int stopIndex)
- spawnNewBus()
- gameOver()
- resetGame()
```

---

## 5. Animasyonlar

**Otobüs geliş animasyonu:**
- `AnimationController` + `SlideTransition`
- Sağdan sola, 2-4 saniye (seviyeye bağlı)
- `Curves.easeOut` veya `Curves.linear`
- Otobüs ekrandan geçerken tıklanabilir olmalı

**Doğru eşleşme animasyonu:**
- Otobüs park yerine `TweenAnimationBuilder` ile gider
- Yeşil flash efekti

**Yanlış eşleşme animasyonu:**
- Ekran kırmızı flash
- Otobüs sallanma efekti
- Sonra game over

---

## 6. Edge Cases

- Tıklamadan önce otobüs geçerse: Oyun biter (zamanında tıklanmadı)
- Aynı renk iki park yerinde varsa: İlk tıklanan kabul edilir
- App background'a alınca: Oyun durur, geri dönünce devam eder
- Ses kapalıysa: Sesi跳过, oyun devam eder

---

## 7. Testing

- Unit test: Skor hesaplama, seviye geçişi
- Widget test: BusStop tıklama, renk paleti
- Integration test: Tam oyun döngüsü
