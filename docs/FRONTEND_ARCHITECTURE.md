# 📱 Unilingo Frontend — Kiến Trúc & Giải Thích Code

> **Công nghệ**: React Native (Expo) + TypeScript  
> **State Management**: Zustand  
> **API Client**: Axios  
> **Navigation**: React Navigation (Stack + Bottom Tabs)  
> **Data Fetching**: TanStack React Query (cấu hình trong App.tsx nhưng chưa sử dụng rộng rãi, các screen gọi API trực tiếp)

---

## 📁 Cấu Trúc Thư Mục Tổng Quan

```
unilingo_frontend/
├── App.tsx                          # Entry point — cấu hình providers
├── index.ts                         # Đăng ký root component cho Expo
├── app.json                         # Cấu hình Expo (tên app, icon, SDK)
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── src/
│   ├── api/                         # 🌐 Tầng giao tiếp API (HTTP Client)
│   │   ├── client.ts                #   Axios instance + JWT interceptors
│   │   ├── auth.ts                  #   Auth APIs (login, register, logout)
│   │   ├── users.ts                 #   User & Dashboard APIs
│   │   ├── topics.ts                #   Topics & Questions APIs
│   │   ├── practice.ts              #   Practice session APIs
│   │   ├── vocabulary.ts            #   Vocabulary CRUD + Dictionary APIs
│   │   ├── flashcards.ts            #   Flashcard deck & study APIs
│   │   └── leaderboard.ts           #   Leaderboard APIs
│   ├── components/
│   │   └── common/
│   │       └── index.tsx            # 🧩 Shared UI components
│   ├── navigation/
│   │   └── RootNavigator.tsx        # 🧭 Navigation tree
│   ├── screens/
│   │   ├── auth/                    # 🔐 Màn hình xác thực
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── home/
│   │   │   └── HomeScreen.tsx       # 🏠 Dashboard chính
│   │   ├── practice/                # 🎤 Luồng luyện tập IELTS
│   │   │   ├── PracticeScreen.tsx
│   │   │   ├── VirtualRoomScreen.tsx
│   │   │   ├── RecordingScreen.tsx
│   │   │   ├── ResultsScreen.tsx
│   │   │   └── PracticeHistoryScreen.tsx
│   │   ├── vocabulary/
│   │   │   └── VocabularyScreen.tsx  # 📖 Quản lý từ vựng
│   │   ├── flashcards/              # 🃏 Flashcard SRS
│   │   │   ├── FlashcardDecksScreen.tsx
│   │   │   └── FlashcardStudyScreen.tsx
│   │   ├── leaderboard/
│   │   │   └── LeaderboardScreen.tsx # 🏆 Bảng xếp hạng
│   │   └── profile/                 # 👤 Hồ sơ & Cài đặt
│   │       ├── ProfileScreen.tsx
│   │       └── SettingsScreen.tsx
│   ├── store/                       # 💾 State management (Zustand)
│   │   ├── authStore.ts             #   JWT tokens + user state
│   │   └── themeStore.ts            #   Dark/Light mode
│   └── theme/                       # 🎨 Design tokens
│       ├── colors.ts                #   Bảng màu Light/Dark
│       ├── typography.ts            #   Font styles
│       ├── spacing.ts               #   Spacing & border radius
│       └── index.ts                 #   Barrel export
```

---

## 1. Entry Points

### `index.ts` — Khởi động ứng dụng
- Gọi `registerRootComponent(App)` để đăng ký component gốc với Expo.
- Đây là file mà Expo/Metro bundler tìm đến đầu tiên.

### `App.tsx` — Component gốc, setup tất cả providers

**Chức năng:**
1. **Load fonts**: Google Font "Plus Jakarta Sans" (5 weight variants) qua `expo-font`.
2. **Hydrate auth**: Đọc JWT tokens từ `expo-secure-store`, nếu hợp lệ thì tự động đăng nhập.
3. **Splash screen**: Giữ splash cho đến khi fonts + auth sẵn sàng.
4. **Provider tree** (từ ngoài vào trong):
   - `GestureHandlerRootView` — hỗ trợ gesture (swipe flashcard)
   - `SafeAreaProvider` — tránh notch/safe area
   - `QueryClientProvider` — TanStack React Query (chuẩn bị cho data caching)
   - `NavigationContainer` — React Navigation với theme tùy chỉnh
   - `RootNavigator` — cây điều hướng chính

**Flow khởi động:**
```
App mount → [Load fonts + Hydrate auth song song] → Hide splash → Render RootNavigator
```

---

## 2. Tầng API (`src/api/`)

### `client.ts` — Axios Instance + JWT Interceptors

**Nhiệm vụ:** Tạo 1 instance Axios dùng chung cho toàn bộ app, tự động xử lý:

| Interceptor | Mô tả |
|---|---|
| **Request** | Tự động gắn header `Authorization: Bearer <token>` từ `authStore` |
| **Response (401)** | Khi nhận 401 → tự động gọi `/auth/refresh` để lấy token mới → retry request gốc. Nếu refresh thất bại → logout user |

**Cấu hình:**
- `BASE_URL`: `http://10.0.0.249:8000/api/v1` (IP hotspot, cần thay đổi theo mạng)
- `timeout`: 15 giây

### `auth.ts` — Authentication API

| Function | Method | Endpoint | Mô tả |
|---|---|---|---|
| `register()` | POST | `/auth/register` | Đăng ký tài khoản mới (email, password, full_name) |
| `login()` | POST | `/auth/login` | Đăng nhập, trả về access_token + refresh_token |
| `socialLogin()` | POST | `/auth/social-login` | Đăng nhập qua Google/Apple (Firebase token) |
| `refreshToken()` | POST | `/auth/refresh` | Làm mới access token |
| `forgotPassword()` | POST | `/auth/forgot-password` | Quên mật khẩu |
| `logout()` | POST | `/auth/logout` | Đăng xuất (gọi API rồi clear local state) |

### `users.ts` — User & Dashboard API

| Function | Method | Endpoint | Mô tả |
|---|---|---|---|
| `getMe()` | GET | `/users/me` | Lấy thông tin profile hiện tại |
| `updateProfile()` | PATCH | `/users/me` | Cập nhật tên, username, target band, level |
| `getDashboard()` | GET | `/users/me/dashboard` | Lấy toàn bộ dashboard data (stats, skill breakdown, vocab stats) |
| `getStreaks()` | GET | `/users/me/streaks` | Lấy thông tin streak |
| `changePassword()` | POST | `/users/me/change-password` | Đổi mật khẩu |

**Lưu ý:** File này cũng export thêm `leaderboardAPI` (duplicate với `leaderboard.ts`). Các screen đang import từ file này.

### `topics.ts` — Topics & Questions API

| Function | Method | Endpoint | Mô tả |
|---|---|---|---|
| `list()` | GET | `/topics` | Danh sách topics, filter theo `ielts_part`, `category`, `difficulty` |
| `getDetail()` | GET | `/topics/:id` | Chi tiết 1 topic |
| `getQuestions()` | GET | `/topics/:id/questions` | Danh sách câu hỏi của topic |
| `getRecommended()` | GET | `/topics/recommended` | Topics được đề xuất |

### `practice.ts` — Practice Session API

| Function | Method | Endpoint | Mô tả |
|---|---|---|---|
| `start()` | POST | `/practice/start` | Bắt đầu phiên luyện tập mới → trả về câu hỏi |
| `uploadAudio()` | POST | `/practice/:id/upload-audio` | Upload file ghi âm (multipart/form-data) |
| `submit()` | POST | `/practice/:id/submit` | Submit bài → kích hoạt AI scoring pipeline |
| `getResult()` | GET | `/practice/:id/result` | Lấy kết quả chấm điểm (có thể polling nếu status=scoring) |
| `getHistory()` | GET | `/practice/history` | Lịch sử luyện tập, phân trang |
| `getStats()` | GET | `/practice/stats` | Thống kê tổng hợp |

**TypeScript Types quan trọng:**
- `ScoringResult` — Kết quả chấm chi tiết: band scores, feedback, grammar errors, vocab suggestions, sample answer
- `PracticeAttempt` — Phiên luyện tập đang diễn ra, chứa question data

### `vocabulary.ts` — Vocabulary Management API

| Function | Method | Endpoint | Mô tả |
|---|---|---|---|
| `list()` | GET | `/vocabulary` | Danh sách từ vựng, filter theo mastery_level, search, phân trang |
| `add()` | POST | `/vocabulary` | Thêm từ mới (word, definitions, examples, tags) |
| `update()` | PATCH | `/vocabulary/:id` | Cập nhật từ |
| `delete()` | DELETE | `/vocabulary/:id` | Xóa từ |
| `getReviewDue()` | GET | `/vocabulary/review-due` | Các từ cần ôn tập |
| `lookupDictionary()` | GET | `/vocabulary/dictionary/lookup` | Tra từ điển online |

### `flashcards.ts` — Flashcard & SRS API

| Function | Method | Endpoint | Mô tả |
|---|---|---|---|
| `listDecks()` | GET | `/flashcards/decks` | Danh sách bộ flashcard |
| `createDeck()` | POST | `/flashcards/decks` | Tạo bộ mới |
| `getDeckDetail()` | GET | `/flashcards/decks/:id` | Chi tiết bộ + danh sách cards |
| `updateDeck()` | PATCH | `/flashcards/decks/:id` | Cập nhật bộ |
| `deleteDeck()` | DELETE | `/flashcards/decks/:id` | Xóa bộ |
| `addCard()` | POST | `/flashcards/decks/:id/cards` | Thêm card vào bộ |
| `deleteCard()` | DELETE | `/flashcards/cards/:id` | Xóa card |
| `reviewCard()` | POST | `/flashcards/cards/:id/review` | Ghi nhận review (SM-2 algorithm) |
| `getStudySession()` | GET | `/flashcards/decks/:id/study` | Lấy cards cần học hôm nay |
| `autoGenerateDeck()` | POST | `/flashcards/decks/auto-generate` | Tự động tạo deck từ vocabulary |

### `leaderboard.ts` — Leaderboard API

| Function | Method | Endpoint | Mô tả |
|---|---|---|---|
| `get()` | GET | `/leaderboard` | Bảng xếp hạng theo period (weekly/monthly/all_time) |
| `getMyRank()` | GET | `/leaderboard/me` | Hạng của user hiện tại |

---

## 3. State Management (`src/store/`)

### `authStore.ts` — Zustand Store cho Authentication

**State:**
| Field | Type | Mô tả |
|---|---|---|
| `accessToken` | `string | null` | JWT access token |
| `refreshToken` | `string | null` | JWT refresh token |
| `user` | `UserProfile | null` | Thông tin user đã đăng nhập |
| `isAuthenticated` | `boolean` | Trạng thái xác thực |
| `isLoading` | `boolean` | Đang hydrate (khởi tạo lại từ storage) |

**Actions:**
| Action | Mô tả |
|---|---|
| `setTokens(access, refresh)` | Lưu tokens vào state + encrypt vào `SecureStore` |
| `setUser(user)` | Cập nhật user profile |
| `logout()` | Xóa tokens, user, đặt isAuthenticated=false, xóa SecureStore |
| `hydrate()` | Khởi tạo: đọc tokens từ SecureStore → gọi `getMe()` để verify → nếu expired thì logout |

**Cơ chế bảo mật:** Tokens được lưu bằng `expo-secure-store` (Keychain trên iOS, EncryptedSharedPreferences trên Android).

### `themeStore.ts` — Zustand Store cho Theme

**State:**
- `isDark: boolean` — Dark mode bật/tắt
- `colors: ColorScheme` — Object chứa toàn bộ màu hiện tại (Light hoặc Dark)
- `toggleTheme()` — Chuyển đổi giữa Light ↔ Dark

---

## 4. Design System (`src/theme/`)

### `colors.ts` — Bảng Màu "Teal Emerald 🌿"

| Category | Light Mode | Dark Mode |
|---|---|---|
| **Accent** (chính) | `#0D9488` (teal) | `#14B8A6` (teal sáng hơn) |
| **Background** | `#F0F4F8` → `#FFFFFF` | `#0B1120` → `#1E293B` |
| **Text** | `#0F172A` (đậm) → `#94A3B8` (muted) | `#F1F5F9` (sáng) → `#64748B` (muted) |
| **Semantic** | success `#10B981`, error `#EF4444`, warning `#F59E0B` | Tương tự nhưng sáng hơn |

**Gradients:** 7 gradient sets cho hero cards, medals (gold/silver/bronze), buttons.

### `typography.ts` — Typography System

- Font family: **Plus Jakarta Sans** (6 weights: Regular → ExtraBold)
- Hệ thống kiểu chữ: `h1-h4`, `body/bodyMedium/bodySm`, `caption/label`, `button`, `bandScore` (36px)

### `spacing.ts` — Layout Constants

- **Spacing:** xs(4) → xxxl(32)
- **Border Radius:** sm(8) → pill(999)
- **Icon Size:** sm(16) → xl(28)

---

## 5. Shared Components (`src/components/common/`)

| Component | Props | Mô tả |
|---|---|---|
| `PrimaryButton` | title, onPress, icon?, loading?, disabled? | Button gradient (teal), shadow, loading spinner |
| `OutlineButton` | title, onPress, icon?, loading?, disabled? | Button viền, nền trắng |
| `InputField` | label, value, onChangeText, icon?, error?, secureTextEntry? | Input với icon, focus state, eye toggle cho password |
| `Card` | children, style?, onPress? | Card container với shadow, border, bo góc. Nếu có onPress → TouchableOpacity |
| `Badge` | label, variant | Badge nhỏ: easy(xanh lá), medium(vàng), hard(đỏ), accent, success, warning |
| `Avatar` | name, size?, uri? | Avatar gradient tròn hiển thị initials |
| `SectionTitle` | title, seeAll?, onSeeAll? | Tiêu đề section với nút "See all" |
| `SearchBar` | value, onChangeText, placeholder? | Thanh tìm kiếm với icon và nút xóa |
| `ScoreBar` | label, value, maxValue?, gradient? | Thanh điểm ngang (hiển thị IELTS band sub-scores) |

---

## 6. Navigation (`src/navigation/RootNavigator.tsx`)

### Cây Điều Hướng

```
RootNavigator (Stack)
├── [isAuthenticated = false] → AuthStack
│   ├── Login → LoginScreen
│   └── Register → RegisterScreen
│
└── [isAuthenticated = true] → MainTabNavigator
    ├── HomeTab → HomeScreen
    ├── PracticeTab → PracticeStackNavigator
    │   ├── PracticeMain → PracticeScreen
    │   ├── VirtualRoom → VirtualRoomScreen
    │   ├── Recording → RecordingScreen
    │   ├── Results → ResultsScreen
    │   └── PracticeHistory → PracticeHistoryScreen
    ├── VocabTab → VocabStackNavigator
    │   ├── VocabMain → VocabularyScreen
    │   ├── FlashcardDecks → FlashcardDecksScreen
    │   └── FlashcardStudy → FlashcardStudyScreen
    ├── RankTab → LeaderboardScreen
    └── ProfileTab → ProfileStackNavigator
        ├── ProfileMain → ProfileScreen
        └── Settings → SettingsScreen
```

**Logic phân luồng:**
- `isLoading = true` → Hiển thị loading spinner (đang hydrate auth)
- `isAuthenticated = false` → Hiển thị Auth Stack (Login/Register)
- `isAuthenticated = true` → Hiển thị Main Tab Navigator (5 tabs)

---

## 7. Screens — Giải Thích Chi Tiết

### 🔐 Auth Screens

#### `LoginScreen.tsx`
- **UI:** Layout kiểu Logify — logo, heading "Sign in", input underline, nút login pill rounded.
- **Logic:** Gọi `authAPI.login()` → `setTokens()` → `usersAPI.getMe()` → `setUser()`.
- **Features:** Remember me checkbox (UI only), Google login placeholder, forgot password link.

#### `RegisterScreen.tsx`
- **UI:** Tương tự LoginScreen, thêm field Full Name + Confirm Password.
- **Validation:** Kiểm tra trống, password match, password ≥ 8 chars.
- **Logic:** `authAPI.register()` → `setTokens()` → `usersAPI.getMe()` → `setUser()`.

### 🏠 Home Screen

#### `HomeScreen.tsx` — Dashboard
- **Data loading:** Song song gọi 3 API: `getDashboard()`, `getHistory(5)`, `getReviewDue()` bằng `Promise.allSettled`.
- **Pull-to-refresh:** Có RefreshControl.
- **Sections:**
  1. **Header:** Avatar (initials), greeting dựa theo giờ, notification bell (badge = số từ cần review).
  2. **Daily Goal Card:** Progress ring (SVG circle), daily tests, streak, XP, avg band.
  3. **Quick Practice:** 3 card cho Part 1/2/3, nhấn → navigate tới PracticeScreen.
  4. **Review Banner:** Hiện nếu có từ cần ôn, nhấn → VocabTab.
  5. **Recent Activity:** Horizontal scroll các card lịch sử practice.

### 🎤 Practice Flow (5 screens)

#### `PracticeScreen.tsx` — Chọn Part & Topic
- Hiển thị 3 Part (Part 1 Interview, Part 2 Long Turn, Part 3 Discussion).
- Khi chọn Part → gọi `topicsAPI.list({ ielts_part })` → hiện grid topics.
- Mỗi topic card hiển thị: emoji icon, title, question_count, difficulty badge.
- Nhấn topic → navigate sang `VirtualRoom`.
- **Fallback:** Có MOCK_TOPICS nếu API lỗi.

#### `VirtualRoomScreen.tsx` — Phòng thi ảo
- Gọi `practiceAPI.start()` để tạo attempt mới → nhận câu hỏi.
- Hiển thị: AI Examiner avatar (🤖), câu hỏi, cue card (Part 2).
- **Part 2 đặc biệt:** Timer 60 giây chuẩn bị (countdown), hiện cue card với bullet points.
- 2 nút: "Notes" (placeholder) + "Start Recording" → navigate sang Recording.

#### `RecordingScreen.tsx` — Ghi âm thật
- **Audio:** Sử dụng `expo-av` (`Audio.Recording`) để ghi âm thật.
  - Định dạng: `.m4a` (AAC codec, 44100Hz, 128kbps).
  - Metering callback mỗi 100ms → cập nhật waveform visualization.
- **UI:** Dot nhấp nháy (Reanimated pulse), timer lớn, 30 thanh waveform thật theo dB.
- **Controls:** Pause/Resume, Stop. Progress bar chạy đến max (120s Part 2, 180s Part 1/3).
- **Khi stop:**
  1. `recording.stopAndUnloadAsync()`
  2. Upload audio qua `practiceAPI.uploadAudio()` (FormData multipart)
  3. Submit bài qua `practiceAPI.submit()`
  4. Navigate sang Results với `attemptId`.

#### `ResultsScreen.tsx` — Kết quả & AI Feedback
- Gọi `practiceAPI.getResult(attemptId)`.
- **Polling:** Nếu `status === 'scoring'` → poll mỗi 3 giây (tối đa 30 lần = 90s).
- **Hiển thị:**
  1. **Band circle:** Gradient tròn hiện overall band (VD: 6.5).
  2. **Score breakdown:** 4 ScoreBar cho Fluency, Lexical, Grammar, Pronunciation.
  3. **4 Tabs:**
     - 📜 **Script:** Transcript từ AI (Whisper STT).
     - 💡 **Feedback:** AI assessment, strengths, weaknesses, suggestions, vocabulary upgrades.
     - 📝 **Sample:** Sample better answer (Band 7.5+) + giải thích.
     - 🔤 **Grammar:** Lỗi ngữ pháp: `original → corrected` + rule.
- **Fallback:** MOCK_RESULT rất chi tiết để demo offline.

#### `PracticeHistoryScreen.tsx` — Lịch sử luyện tập
- Filter chips: All / Part 1 / Part 2 / Part 3.
- FlatList với phân trang (infinite scroll, 20 items/page).
- Mỗi card hiện: Part badge, status badge, topic title, date, duration, band score.
- Nhấn card completed → navigate sang Results.

### 📖 Vocabulary & Flashcards

#### `VocabularyScreen.tsx`
- **Header:** Tiêu đề + nút Dictionary.
- **Flashcard banner:** Gradient banner link sang FlashcardDecks.
- **Search + Filter:** Search bar + filter tabs (All/New/Learning/Mastered) với counts.
- **Word list:** FlatList, mỗi item có: mastery color bar, word, phonetic, definition, mastery chip.
- **Dictionary Modal:** Tra từ online → hiện meanings + definitions + examples → nút "Add to My List".

#### `FlashcardDecksScreen.tsx`
- Grid 2 cột hiển thị các deck (emoji + title + card count).
- **Auto-Generate banner:** Tạo deck tự động từ vocabulary (new + learning).
- **CRUD:** Create deck (modal), delete deck (long press), navigate sang study.

#### `FlashcardStudyScreen.tsx`
- **Card flip animation:** 3D flip bằng Reanimated (`rotateY` 0→180°, `perspective: 1200`).
- **Swipe gestures:** Pan gesture → swipe phải = Easy, swipe trái = Again.
- **SM-2 SRS:** 3 nút rating: Again(1), Hard(3), Easy(5) → gọi `reviewCard()`.
- **Progress:** Bar + counter (3/8).
- **Haptic feedback:** `expo-haptics` cho mỗi tương tác.
- **Completion screen:** Thống kê Easy/Hard/Again.

### 🏆 Leaderboard

#### `LeaderboardScreen.tsx`
- **Period tabs:** Weekly / Monthly / All Time.
- **My rank banner:** Gradient hero card hiện rank + XP + avg band.
- **Rankings list:** FlatList, medal emojis cho top 3, avatar circles, XP stars.
- Highlight row nếu `user_id === current user`.

### 👤 Profile & Settings

#### `ProfileScreen.tsx`
- Avatar gradient lớn, tên, username, email.
- Stats grid (2×2): Total XP, Current Streak, Longest Streak, Target Band.
- Menu items: Settings, My Level, Account type, Member Since.

#### `SettingsScreen.tsx`
- **Edit Profile:** Full Name, Username, Target Band (chip selector 4.0→9.0), Level (5 cấp độ).
- **Change Password:** Expandable section, 3 fields.
- **Dark Mode toggle:** Custom toggle component.
- **Logout:** Confirmation dialog → clear auth state.
- Mỗi action gọi API tương ứng (`updateProfile`, `changePassword`, `authAPI.logout`).

---

## 8. Luồng Dữ Liệu Chính

### Flow: User Login
```
LoginScreen → authAPI.login({email, password})
  → Backend trả {access_token, refresh_token}
  → authStore.setTokens() → Lưu SecureStore
  → usersAPI.getMe() → authStore.setUser()
  → RootNavigator detect isAuthenticated=true → Render MainTabNavigator
```

### Flow: Practice Session
```
PracticeScreen → Chọn Part + Topic
  → VirtualRoomScreen → practiceAPI.start({topic_id, ielts_part})
    → Backend tạo TestAttempt, trả về question
  → RecordingScreen → Audio.Recording.createAsync()
    → User nói → metering → waveform
    → Stop → practiceAPI.uploadAudio() → practiceAPI.submit()
      → Backend enqueue Celery task (AI scoring)
  → ResultsScreen → practiceAPI.getResult()
    → Polling nếu status=scoring
    → Hiển thị band scores + AI feedback
```

### Flow: Token Refresh (tự động)
```
Bất kỳ API call nào bị 401
  → Response interceptor bắt
  → Gọi /auth/refresh với refresh_token
  → Thành công → cập nhật tokens → retry request gốc
  → Thất bại → logout user → redirect về Login
```
