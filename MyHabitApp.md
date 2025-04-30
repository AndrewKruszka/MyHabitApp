# Daily Tracking App

## Project Overview

The Daily Tracking App is a lightweight mobile application built in React Native (Expo) that allows users to track their daily habits, moods, activities, and insights. The app is designed to be fully offline-capable, with future cloud backup integration planned (Firebase). It includes AI-based daily insights generated using OpenAI's API.

This document consolidates project information including styling, database schema, folder structure, features, and UX flows.

---

# Table of Contents

- [Technology Stack](#technology-stack)
- [Styling Guide](#styling-guide)
- [Database Schema](#database-schema)
- [Folder and File Structure](#folder-and-file-structure)
- [MVP Features](#mvp-features)
- [UX Flows](#ux-flows)

---

# Technology Stack

| Layer               | Technology               |
| ------------------- | ------------------------ |
| Framework           | React Native (Expo)      |
| Local Database      | SQLite                   |
| State Management    | React Context API        |
| AI Integration      | OpenAI API (GPT-4-turbo) |
| Future Cloud Backup | Firebase Firestore       |
| Navigation          | React Navigation         |
| Charting (future)   | Victory Native           |

---

# Styling Guide

## Color Palette

- **Primary Color:** #2C7BE5 (Blue)
- **Secondary Accent Color:** #00BFA5 (Teal)
- **Background:** #F9FAFB (Light Gray)
- **Surface:** #FFFFFF (White)
- **Text Primary:** #212121
- **Text Secondary:** #757575

## Typography

- **Heading Font:** Poppins Semi-Bold
- **Body Font:** Inter Regular
- **Sizes:**
  - H1: 28px
  - H2: 22px
  - H3: 18px
  - Body Text: 16px
  - Caption: 14px

## Buttons

- Primary: Rounded Rectangle (8px radius), solid blue background
- Secondary: Transparent background, blue border

## Input Fields

- Rounded Rectangle (4px radius), light border, color changes on focus

## Cards and Containers

- Background: White, border-radius 12px, soft shadow

---

# Database Schema

## Tables

### DailyReports

| Field        | Type              |
| ------------ | ----------------- |
| id           | UUID              |
| date         | Date (YYYY-MM-DD) |
| mood\_rating | Integer (1-10)    |
| notes        | Text              |
| created\_at  | Timestamp         |
| updated\_at  | Timestamp         |

### Trackables

| Field       | Type                                                       |
| ----------- | ---------------------------------------------------------- |
| id          | UUID                                                       |
| name        | String                                                     |
| type        | Enum ('boolean', 'time', 'number', 'text', 'multi-select') |
| is\_daily   | Boolean                                                    |
| order       | Integer                                                    |
| archived    | Boolean                                                    |
| created\_at | Timestamp                                                  |

### SubPages

| Field                 | Type      |
| --------------------- | --------- |
| id                    | UUID      |
| parent\_trackable\_id | UUID (FK) |
| title                 | String    |
| fields\_json          | JSON      |
| created\_at           | Timestamp |

### DailyReportEntries

| Field              | Type               |
| ------------------ | ------------------ |
| id                 | UUID               |
| daily\_report\_id  | UUID (FK)          |
| trackable\_id      | UUID (FK)          |
| value              | JSON               |
| subpage\_entry\_id | UUID (optional FK) |
| created\_at        | Timestamp          |

### SubPageEntries

| Field              | Type      |
| ------------------ | --------- |
| id                 | UUID      |
| subpage\_id        | UUID (FK) |
| fields\_data\_json | JSON      |
| created\_at        | Timestamp |

### Insights

| Field                | Type                               |
| -------------------- | ---------------------------------- |
| id                   | UUID                               |
| daily\_report\_id    | UUID (FK)                          |
| insight\_text        | Text                               |
| ai\_version          | String                             |
| user\_feedback       | Enum ('agree', 'disagree', 'none') |
| user\_feedback\_text | Text                               |
| created\_at          | Timestamp                          |

---

# Folder and File Structure

```
/App.tsx                     -- App entry point: sets up NavigationContainer and Context Providers

/components/
  Button.tsx                  -- Reusable button component
  MoodSlider.tsx              -- Slider for selecting mood score
  TrackableCard.tsx           -- Card UI for each habit/trackable
  SubPageInputGroup.tsx       -- Form inputs for SubPages (mini-reports)
  InsightCard.tsx             -- Card UI for displaying AI Insights
  HeaderBar.tsx               -- Top bar/header component

/screens/
  Onboarding/index.tsx        -- Screens for user onboarding flow
  Onboarding/styles.ts        -- Styles specific to Onboarding screens
  Dashboard/index.tsx         -- Main daily dashboard screen
  Dashboard/styles.ts         -- Styles for Dashboard
  SearchTrackables/index.tsx  -- Screen for searching and adding non-daily trackables
  SearchTrackables/styles.ts  -- Styles for Search screen
  SubPageForm/index.tsx       -- Screen to fill SubPage mini-report
  SubPageForm/styles.ts       -- Styles for SubPage form
  ManageTrackables/index.tsx  -- Screen to manage, edit, and create Trackables
  ManageTrackables/styles.ts  -- Styles for ManageTrackables screen
  HistoryOverview/index.tsx   -- Screen showing history calendar view
  HistoryOverview/styles.ts   -- Styles for History Overview
  HistoryDetail/index.tsx     -- Detailed view for a single day's history
  HistoryDetail/styles.ts     -- Styles for History Detail screen
  Insights/index.tsx          -- Screen listing AI insights
  Insights/styles.ts          -- Styles for Insights screen
  Settings/index.tsx          -- Settings page for app preferences
  Settings/styles.ts          -- Styles for Settings page

/services/
  db/schema.ts                -- Defines all SQLite tables (CREATE TABLE statements)
  db/setup.ts                 -- Initializes SQLite database connection
  db/queries.ts               -- Read/write functions for database
  ai/openaiClient.ts          -- OpenAI API client setup
  ai/promptBuilder.ts         -- Builds structured prompts for OpenAI

/contexts/
  TrackablesContext.tsx       -- Context for managing Trackables globally
  MoodContext.tsx             -- Context for managing current mood state
  SettingsContext.tsx         -- Context for user settings and preferences

/navigation/
  index.tsx                   -- Main navigation entry
  AppNavigator.tsx            -- App screens navigation stack

/utils/
  formatDate.ts               -- Date formatting utilities
  parseMoodScore.ts           -- Mood score interpretation helpers
  constants.ts                -- App-wide constant values
  colors.ts                   -- Centralized color definitions
  theme.ts                    -- Shared theme settings (margins, font sizes, etc.)

/assets/
  /icons/                     -- App icons (SVG/PNG)
  /fonts/                     -- Custom font files
  /illustrations/             -- Static images or illustrations

/styles/
  global.ts                   -- Global style settings (font families, defaults)
  buttons.ts                  -- Standard button styling
  forms.ts                    -- Standard input field styling
```

(Each folder contains files based on the roles defined earlier.)

---

## Core Libraries

| Purpose | Library | Notes |
|:---|:---|:---|
| App Navigation | `@react-navigation/native`, `@react-navigation/native-stack` | Screen transitions and stack navigation |
| Core Native Modules | `react-native-screens`, `react-native-safe-area-context` | Required by React Navigation |
| Gesture Handling | `react-native-gesture-handler`, `react-native-reanimated` | Smooth swiping and transitions |
| Local Database | `expo-sqlite` | Offline-first SQLite data storage |
| Charting | `victory-native`, `react-native-svg` | Render mood and habit graphs |
| State Management | React Context API (built-in) or `zustand` (optional) | Global app state |
| Forms Handling | `react-hook-form` or `formik` (plus `yup` if needed) | Building forms like Trackable creation, SubPages |
| AI Integration | Native `fetch` | Structured prompts and API calls to OpenAI |

---

## Dev/Utility Dependencies

| Purpose | Library | Notes |
|:---|:---|:---|
| UUID Generation | `uuid` | Safe ID generation for offline database writes |
| Environment Variables | `expo-constants` | Manage API keys securely within Expo apps |

---

## Future / Planned (v2)

| Purpose | Library | Notes |
|:---|:---|:---|
| Cloud Backup | `firebase` (`firebase/auth`, `firebase/firestore`) | User account and data syncing |
| Notifications | `expo-notifications` | Local notifications for reminders |
| File Storage (Optional) | `expo-file-system` | Data backup and file export capabilities |

---

## Special Notes
- `react-native-svg` must be installed separately for `victory-native` to work.
- Always wrap your app inside a `NavigationContainer` for React Navigation to function.
- `expo-sqlite` does not require native linking inside Expo projects.
- No special OpenAI client library is required; `fetch` is sufficient.

---

**End of Document**




# MVP Features

| Feature                  | Description                                                             |
| ------------------------ | ----------------------------------------------------------------------- |
| Onboarding               | Set mood tracking style, select default habits                          |
| Daily Dashboard          | Mood input, daily checklist, add non-daily events                       |
| Sub-Page Mini Reports    | Custom mini-reports for activities like Golf, Workouts                  |
| Manage Trackables        | Create/edit/delete custom Trackables                                    |
| History Overview         | Calendar with mood color coding, toggle numerical/boolean/mood graphs   |
| History Detail           | See full report and AI Insight for a specific day                       |
| AI Insights              | Daily summaries based on tracked data, feedback system (agree/disagree) |
| Offline Capability       | All core functionality fully offline                                    |
| Future Cloud Backup (v2) | Firebase Authentication + Firestore backup planned                      |

---

# UX Flows

## Onboarding Flow

- Welcome screen
- Choose Mood Tracking Style (Single or Segmented)
- Pick default habits / create custom habits
- Ready to Start (confirmation)

## Daily Usage Flow

- Dashboard shows today's date, mood slider, daily trackables
- Add non-daily event if needed (search existing or create custom)
- Quick note input
- Submit daily report (save + trigger AI insight request)

## Manage Trackables Flow

- View all current trackables
- Toggle Daily vs Non-Daily
- Create new custom trackable
- Add optional sub-page mini-report fields

## Historical Insights Flow

- View mood calendar (color-coded)
- Select a date to view full daily report and AI insight
- Toggle between numerical trends, boolean completion, mood trends

## Insight Feedback Flow

- View daily insight
- Option to Agree or Disagree
- If Disagree, provide optional feedback for model learning

## Search Tracking Options Flow

- Search preconfigured or custom trackables
- Select and add to today’s report
- Option to create a new custom trackable if none found

---

# /docs Reference Index
This directory contains all design documentation, UX storyboards, architecture plans, and mockup assets. Cursor can use these for deeper context during development.

# guide/ — Development Documentation
## codebase/
Contains technical planning documents:

database-planning.pdf
Details the full SQLite schema, table structures, relationships, and offline behavior.

folder-file-structure.pdf
Defines the ideal folder structure for scalable code organization. Used to scaffold /components, /screens, /services, etc.

functional-specification.pdf
Full feature breakdown of the app: trackables, mood tracking styles, AI insight system, subpages, and offline-first logic.

libraries-dependencies.pdf
Lists core packages (e.g., react-hook-form, expo-sqlite, @react-navigation) and their installation commands.

pre-development-steps.pdf
Outlines 5 critical tasks before starting dev: wireframing, schema design, library testing, AI prompt structure.

tech-stack-UX-blueprint.pdf
High-level architectural blueprint + UX flows (onboarding, dashboard, insights, etc.).

## storyboard/
These PDFs describe visual and interactive flow for onboarding and wireframes:

onboarding-storyboard.pdf
Complete flow of onboarding screens: welcome, habit selection, mood style, confirmation.

wireframe-planning.pdf
Lays out must-wireframe screens like dashboard, history view, add events, etc.

---

# styles/
visual-styles.pdf
UI style guide with color palette (#2C7BE5, #00BFA5), fonts (Poppins, Inter), button/card styles, spacing, and interaction effects.

---

# ux/
Detailed screen-specific UX documentation:

UX-history.pdf
Layout of calendar-based history view + detailed mood/habit logs.

UX-insights.pdf
How daily AI-generated insights are displayed, with feedback options.

UX-Main-Components.pdf
Daily dashboard, event modals, subpage mini-reports, and interaction behaviors.

UX-onboarding-styles.pdf
UX structure for onboarding (style and layout logic).

UX-tracking-manager.pdf
Managing trackables: toggling daily/non-daily, editing, deleting, and creating with subforms.

---

# mockups/ — Visual Screen Assets
## history/
history_view.png — Calendar mood heatmap + chart toggle (numeric, boolean, mood).

insights.png — Scrollable daily AI insight cards with agree/disagree UI.

## main/
add_trackable.png — UI for searching and adding non-daily events.

dashboard.png — Mood slider, daily checklist, notes input, and submit button.

trackable_subpage.png — Example of a filled-out subpage mini-report.

## manage/
create_trackable.png — Modal for naming a new habit, selecting type, adding subform.

manage_daily.png — Main screen to view all habits and toggle daily/non-daily.

## onboarding/
confirmation.png — Final onboarding step with summary and Start Tracking button.

create_habits.png — Form to create custom trackables during onboarding.

landing_page.png — Welcome screen with brand, description, and Get Started CTA.

pick_habits.png — Habit grid selection (preset or custom).

set_mood.png — Select mood tracking frequency (Daily or Multiple Times a Day).

---

📄 Project Descriptions
MyHabitApp.md — Primary project documentation file with:

Tech stack

Styling guide

Schema overview

Folder structure

UX flows

MVP checklist

README.md — Optional alternate entrypoint or GitHub-facing project summary.


