<div align="center">

# ⚔️ HabitWar

### *Transform Your Habits Into Victories*

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)
[![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=white)](https://greensock.com/gsap/)

<br/>

**A premium, gamified habit tracking web application with stunning 3D animations, interactive charts, and a warrior-themed experience to help you conquer your daily goals.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Usage](#-usage) • [Screenshots](#-screenshots)

<br/>

![HabitWar Banner](https://img.shields.io/badge/🎮_GAMIFIED-Habit_Tracking-c5ff00?style=for-the-badge&labelColor=0f0f1a)
![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 📊 **Daily Dashboard**
- Real-time habit tracking with completion status
- Interactive habit wheel chart
- Daily progress percentage & streak counter
- Motivational quotes to keep you inspired

### 📈 **Advanced Analytics**
- Weekly, Monthly & Yearly performance views
- Interactive heatmap calendar
- Custom date range analysis
- Trend charts with smooth animations

### 🎯 **Habit Management**
- Create, edit & delete habits
- Categorize habits (Health, Productivity, Social, Finance, Spiritual)
- Set monthly goals for each habit
- Track progress with visual indicators

</td>
<td width="50%">

### 🔥 **Streaks & Goals**
- Global streak tracking
- Individual habit streaks
- Achievement badges system
- Monthly goal progress bars

### 💜 **Gratitude Journal**
- Daily gratitude entries with mood tracking
- Beautiful timeline view
- Mood analytics chart
- Word cloud visualization

### 🎨 **Premium UI/UX**
- 🌙 Dark/Light mode toggle
- Particle.js animated background
- Smooth GSAP animations
- Fully responsive design
- Glass-morphism effects

</td>
</tr>
</table>

---

## 🛠 Tech Stack

<div align="center">

| Technology | Purpose | Version |
|:----------:|:-------:|:-------:|
| ![HTML5](https://img.shields.io/badge/-HTML5-E34F26?style=flat-square&logo=html5&logoColor=white) | Structure & Semantic Markup | 5 |
| ![CSS3](https://img.shields.io/badge/-CSS3-1572B6?style=flat-square&logo=css3&logoColor=white) | Styling & Animations | 3 |
| ![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) | Core Logic & Interactivity | ES6+ |
| ![Chart.js](https://img.shields.io/badge/-Chart.js-FF6384?style=flat-square&logo=chartdotjs&logoColor=white) | Data Visualization | 4.4.1 |
| ![GSAP](https://img.shields.io/badge/-GSAP-88CE02?style=flat-square&logo=greensock&logoColor=white) | Advanced Animations | 3.12.2 |
| ![Particles.js](https://img.shields.io/badge/-Particles.js-000000?style=flat-square&logo=javascript&logoColor=white) | Background Effects | 2.0.0 |
| ![Lucide](https://img.shields.io/badge/-Lucide_Icons-F56565?style=flat-square&logo=feather&logoColor=white) | Icon System | Latest |
| ![LocalStorage](https://img.shields.io/badge/-LocalStorage-4A90D9?style=flat-square&logo=databricks&logoColor=white) | Data Persistence | Web API |

</div>

---

## 📁 Project Structure

```
HabitWar/
├── 📄 index.html          # Main application shell
├── 🎨 styles.css          # Core design system & components
├── 🎨 home-styles.css     # Dashboard-specific styles
├── ⚡ app.js              # Core application logic
├── 📂 pages/
│   ├── daily.html         # Daily dashboard view
│   ├── analytics.html     # Analytics & charts
│   ├── habits.html        # Habit management
│   ├── streaks.html       # Streaks & achievements
│   └── gratitude.html     # Gratitude journal
└── 📖 README.md           # Documentation
```

---

## 🚀 Installation

### Prerequisites
- Any modern web browser (Chrome, Firefox, Safari, Edge)
- No server required - runs completely client-side!

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/habitwar.git
   ```

2. **Navigate to the project**
   ```bash
   cd habitwar
   ```

3. **Open in browser**
   ```bash
   # Simply open index.html in your browser
   # Or use a local server for best experience:
   
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using VS Code Live Server extension
   # Right-click index.html → "Open with Live Server"
   ```

4. **Start conquering your habits! ⚔️**

---

## 🎮 Usage

### Getting Started

1. **Daily Dashboard** - Your home base for tracking today's habits
2. **Add Habits** - Click the "+" button to create new habits
3. **Track Progress** - Click on habits to mark them complete
4. **View Analytics** - Explore your performance over time
5. **Earn Streaks** - Keep your momentum going!

### Keyboard Shortcuts

| Key | Action |
|:---:|:------:|
| `Click Habit` | Toggle completion |
| `Theme Button` | Switch Dark/Light mode |

### Data Storage

All your data is stored locally in your browser using **LocalStorage**:
- `habitsData` - Your habit definitions
- `habitData` - Completion records
- `gratitudeData` - Gratitude entries
- `habitWarTheme` - Theme preference

---

## 📸 Screenshots

<div align="center">

### 🌞 Light Mode
```
┌─────────────────────────────────────────────────────┐
│  ⚔️ HabitWar        [🌙] [🔔]                       │
├─────────────────────────────────────────────────────┤
│                                                      │
│   Good Morning, Warrior!                            │
│   Ready to conquer your habits today?               │
│                                                      │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│   │ ✅ 3    │ │ ⏳ 2    │ │ 🔥 5    │ │ 📊 60%  │  │
│   │Completed│ │ Pending │ │ Streak  │ │  Score  │  │
│   └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 🌙 Dark Mode
```
┌─────────────────────────────────────────────────────┐
│  ⚔️ HabitWar        [☀️] [🔔]          🌙 DARK     │
├─────────────────────────────────────────────────────┤
│  ████████████████████████████████████████████████  │
│  █                                              █  │
│  █   Your habits, your battlefield.            █  │
│  █   Conquer them all.                         █  │
│  █                                              █  │
│  ████████████████████████████████████████████████  │
└─────────────────────────────────────────────────────┘
```

</div>

---

## 🎨 Design System

### Color Palette

| Color | Hex | Usage |
|:-----:|:---:|:-----:|
| 🟢 Accent Lime | `#c5ff00` | Primary accent, success states |
| 🟣 Dark Navy | `#0f0f1a` | Sidebar, dark backgrounds |
| ⚪ Light BG | `#f8f9fc` | Light mode background |
| 🔵 Text Primary | `#0f172a` | Main text color |
| 🟡 Warning | `#f59e0b` | Streaks, warnings |
| 🔴 Danger | `#ef4444` | Delete, errors |

### Typography

- **Font Family:** Inter (Google Fonts)
- **Weights:** 300, 400, 500, 600, 700, 800

### Animations

| Animation | Library | Effect |
|:---------:|:-------:|:------:|
| Page Transitions | CSS | Fade in/out |
| Habit Toggle | CSS | Scale & color |
| Charts | Chart.js | Data updates |
| Particles | Particles.js | Floating background |
| UI Elements | GSAP | Smooth interactions |

---

## 🔧 Configuration

### Customizing Habits

Edit the default habits in `app.js`:

```javascript
function getDefaultHabits() {
    return [
        { id: 1, name: "Morning Exercise", icon: "dumbbell", category: "health", goal: 20 },
        { id: 2, name: "Read 30 Minutes", icon: "book-open", category: "productivity", goal: 25 },
        // Add your custom habits here...
    ];
}
```

### Available Icons
`dumbbell` | `book-open` | `droplet` | `moon` | `brain` | `utensils` | `bike` | `pencil` | `code` | `music`

### Categories
`health` | `productivity` | `social` | `finance` | `spiritual`

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. 🍴 Fork the repository
2. 🌱 Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. 💻 Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. 📤 Push to the branch (`git push origin feature/AmazingFeature`)
5. 🔃 Open a Pull Request

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Chart.js](https://www.chartjs.org/) - Beautiful charts
- [GSAP](https://greensock.com/gsap/) - Smooth animations
- [Particles.js](https://vincentgarreau.com/particles.js/) - Stunning particle effects
- [Lucide Icons](https://lucide.dev/) - Beautiful icons
- [Google Fonts](https://fonts.google.com/) - Inter font family

---

<div align="center">

### Made with ❤️ and ⚔️

**Start your habit war today!**

[![GitHub Stars](https://img.shields.io/github/stars/yourusername/habitwar?style=social)](https://github.com/yourusername/habitwar)

</div>
