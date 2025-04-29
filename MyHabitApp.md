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
