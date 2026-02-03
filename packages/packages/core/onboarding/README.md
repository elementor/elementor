# @elementor/onboarding

New onboarding experience for Elementor 2026 with improved user journey and progress tracking.

## Features

- Multi-step onboarding wizard
- User progress persistence with resume capability
- Distinction between user-initiated exits and unexpected exits
- Reusable header and footer components
- Redux store for state management
- REST API integration for data persistence

## Installation

```bash
npm install @elementor/onboarding
```

## Usage

```typescript
import { init } from '@elementor/onboarding';

// Initialize the onboarding module
init();
```

## Architecture

### Components

- `Header` - Reusable top bar with logo and navigation
- `Footer` - Reusable navigation bar with Back, Skip, and Continue buttons
- `App` - Main application wrapper

### State Management

Uses Redux Toolkit for state management with the following slice:

- `onboardingSlice` - Manages current step, completed steps, user choices, and exit state

### API Client

REST API client for communicating with the WordPress backend:

- `GET /elementor/v2/onboarding-v2/user-progress` - Get user progress
- `PATCH /elementor/v2/onboarding-v2/user-progress` - Update user progress
- `GET /elementor/v2/onboarding-v2/user-choices` - Get user choices
- `PATCH /elementor/v2/onboarding-v2/user-choices` - Update user choices

## License

GPL-3.0-or-later
