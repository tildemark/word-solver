
# Word Solver

A web and Android (React Native) app for solving word puzzles like Wordle. Enter a pattern (use . for unknowns), required letters, and excluded letters to find possible matches from a dictionary.

## Features
- Pattern-based word search (e.g., S..RE)
- Must contain and must exclude letter filters
- Copy results to clipboard
- Paginated results with Load More/Load All
- Dot counter for pattern input
- Android app (Expo/React Native) in `android-app/`

## Getting Started (Web)
1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Open http://localhost:3000

## Getting Started (Android)
1. `cd android-app`
2. Install dependencies: `npm install`
3. Start Expo: `npm run android`
4. Use Android Studio or Expo Go app to run

## Dictionary
- Default: `public/dictionary.txt` (one word per line)
- You can add other dictionaries (e.g., Bisaya, Tagalog) as needed

## License
MIT
