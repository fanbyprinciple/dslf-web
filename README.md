# DSLF Web - Relationship Safety Tracker

A web version of the DSLF (Don't Struggle, Let's Fight) app - a tracker for relationship conflict patterns. Built with React and Vite, deployed on GitHub Pages.

## Features

- 📊 **Dashboard**: Track your current streak since the last fight
- 📅 **Calendar View**: Visual calendar showing fight dates throughout the month
- 📈 **Statistics**: Analyze fight patterns, common reasons, and intervals
- 💾 **Local Storage**: All data persists in your browser

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dslf-web.git
cd dslf-web
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Building for Deployment

```bash
npm run build
```

This creates an optimized build in the `dist` folder.

## Deploying to GitHub Pages

### Initial Setup

1. Create a new repository on GitHub named `dslf-web` (or your preferred name)

2. Push this code to your repository:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/dslf-web.git
git push -u origin main
```

3. Go to your repository settings on GitHub:
   - Settings → Pages
   - Under "Source", select "Deploy from a branch"
   - Select `main` branch and `/root` folder
   - Click Save

### Automatic Deployment

Every push to the `main` branch will automatically deploy to GitHub Pages.

To manually deploy:
```bash
npm run deploy
```

This will:
1. Build the project
2. Push the build to the `gh-pages` branch
3. Deploy to `https://yourusername.github.io/dslf-web/`

## Usage

### Logging a Fight

1. Click "LOG FIGHT TODAY" on the dashboard
2. Select the reason for the fight
3. (Optional) Add notes about what happened
4. Mark if the fight was resolved
5. Click "SAVE & RESET STREAK" to log and reset your counter

### Viewing Patterns

- **Calendar**: See which days you logged fights and track monthly patterns
- **Statistics**: Review fight reasons, frequency, and improvement areas

## Data Storage

All data is stored locally in your browser's localStorage. Nothing is sent to any server.

To clear your data: Open Developer Tools → Application → Storage → Local Storage → Clear

## Project Structure

```
dslf-web/
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── CalendarScreen.tsx
│   │   ├── StatisticsScreen.tsx
│   │   ├── FightLogModal.tsx
│   │   └── StreakResetScreen.tsx
│   ├── App.tsx
│   ├── main.tsx
│   ├── utils.ts
│   ├── constants.ts
│   └── index.css
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Technologies Used

- **React 19**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **CSS**: Styling with responsive design
- **LocalStorage API**: Client-side data persistence
- **GitHub Pages**: Free hosting

## Browser Support

Works on all modern browsers that support:
- ES2020 JavaScript
- CSS Grid and Flexbox
- LocalStorage API

## License

MIT License - feel free to use this for your own projects!

## Contributing

Feel free to fork, modify, and improve! If you have suggestions, create a pull request.

## Support

For issues or questions, check the GitHub issues page or create a new issue.

---

**Remember**: Every day without a fight is a win! Keep working on improving your relationship. 💪
