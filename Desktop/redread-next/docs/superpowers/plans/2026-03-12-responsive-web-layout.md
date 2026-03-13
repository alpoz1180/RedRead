# Responsive Web Layout Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development to implement this plan.

**Goal:** 768px+ ekranda sol sidebar (Discord/Notion stili), mobilede mevcut bottom nav korunsun.

**Architecture:** `useIsMobile` hook ile breakpoint tespiti. Desktop'ta `Sidebar.tsx` bileşeni, mobilde `BottomNav.tsx`. `RedreadRoot` layout'u koşullu render. Tüm stiller inline CSS-in-JS.

**Tech Stack:** React 19, Next.js 16, TypeScript, inline CSS-in-JS, `motion/react`

---

## Task 1: useIsMobile Hook

**Files:**
- Modify: `src/components/redread/RedreadRoot.tsx`

- [ ] `RedreadRoot.tsx` içinde `const [isMobile, setIsMobile] = useState(true)` ekle
- [ ] `useEffect` ile `window.innerWidth < 768` kontrolü yap, resize listener ekle, cleanup yap
- [ ] Hook'u export etme — sadece RedreadRoot içinde kullan, diğer componentler prop alacak

---

## Task 2: Sidebar Bileşeni Oluştur

**Files:**
- Create: `src/components/redread/Sidebar.tsx`

Tasarım:
- Genişlik: 240px, sabit sol konum (`position: fixed`, `top: 0`, `left: 0`, `height: 100vh`)
- Arka plan: `var(--card)`, sağ border: `1px solid var(--muted)`
- Üstte logo + uygulama adı "redread" (`Lora` serif, `var(--primary)` turuncu)
- Nav items: Feed, Kütüphane, Yaz, Profil (BottomNav ile aynı 4 tab)
- Her item: ikon + etiket yan yana, aktif item `var(--primary)` renk + `var(--surface)` arka plan
- Altta: tema toggle butonu
- Font: `Nunito`, 14px

```tsx
interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  theme: string;
  onThemeToggle: () => void;
  user: { email?: string; user_metadata?: { username?: string } } | null;
}
```

---

## Task 3: RedreadRoot Layout Güncelle

**Files:**
- Modify: `src/components/redread/RedreadRoot.tsx`

- [ ] `isMobile` false iken:
  - Ana wrapper: `display: flex`, `minHeight: 100vh`
  - `<Sidebar>` sol tarafta render et
  - İçerik alanı: `marginLeft: 240px`, `flex: 1`, `maxWidth: 900px`, `margin: 0 auto`, `paddingLeft: 240px`
- [ ] `isMobile` true iken: mevcut layout değişmeden kalsın
- [ ] `Sidebar` import et

---

## Task 4: TopBar + BottomNav Responsive

**Files:**
- Modify: `src/components/redread/TopBar.tsx`
- Modify: `src/components/redread/BottomNav.tsx`

- [ ] `BottomNav`'a `isMobile: boolean` prop ekle — `isMobile` false ise `return null`
- [ ] `TopBar`'a `isMobile: boolean` prop ekle — desktop'ta `paddingLeft: 0`, mobilde mevcut stil

---

## Task 5: StoryFeed + WriteEditor + Profile Responsive

**Files:**
- Modify: `src/components/redread/StoryFeed.tsx`
- Modify: `src/components/redread/WriteEditor.tsx`
- Modify: `src/components/redread/Profile.tsx`

- [ ] Her bileşene `isMobile?: boolean` prop ekle
- [ ] Desktop'ta `paddingTop` ve `paddingBottom` değerlerini sidebar'a göre ayarla (bottom nav padding'i kaldır desktop'ta)
- [ ] StoryFeed: desktop'ta hikaye kartları 2 sütun grid (`display: grid, gridTemplateColumns: repeat(2, 1fr)`)
