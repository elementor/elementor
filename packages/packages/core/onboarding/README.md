# @elementor/onboarding

New onboarding experience for Elementor 2026 with improved user journey and progress tracking.

## Features

- Multi-step onboarding wizard
- User progress persistence with resume capability
- Distinction between user-initiated exits and unexpected exits
- Reusable header and footer components
- Redux store for state management
- React Query hooks for API integration

## Installation

```bash
npm install @elementor/onboarding
```

## Usage

```typescript
import { init, App } from '@elementor/onboarding';

// Initialize the onboarding module
init();

// Use the App component
<App onComplete={() => console.log('Done!')} />
```

## Hooks

### useUserProgress

Fetch user progress from the server.

```typescript
import { useUserProgress } from '@elementor/onboarding';

const { data, isLoading, error } = useUserProgress();
```

### useUpdateUserProgress

Update user progress on the server.

```typescript
import { useUpdateUserProgress } from '@elementor/onboarding';

const { mutate } = useUpdateUserProgress();

mutate({ complete_step: 0, total_steps: 14 });
```

### useUserChoices

Fetch user choices from the server.

```typescript
import { useUserChoices } from '@elementor/onboarding';

const { data, isLoading, error } = useUserChoices();
```

### useUpdateUserChoices

Update user choices on the server.

```typescript
import { useUpdateUserChoices } from '@elementor/onboarding';

const { mutate } = useUpdateUserChoices();

mutate({ site_type: 'business' });
```

## Architecture

### Components

- `Header` - Reusable top bar with logo and navigation
- `Footer` - Reusable navigation bar with Back, Skip, and Continue buttons
- `App` - Main application wrapper

### State Management

Uses Redux Toolkit via `@elementor/store` with the following slice:

- `onboardingSlice` - Manages current step, completed steps, user choices, and exit state

### API

Uses `@wordpress/api-fetch` with `@elementor/query` for data fetching:

- `GET /elementor/v2/onboarding-v2/user-progress` - Get user progress
- `PATCH /elementor/v2/onboarding-v2/user-progress` - Update user progress
- `GET /elementor/v2/onboarding-v2/user-choices` - Get user choices
- `PATCH /elementor/v2/onboarding-v2/user-choices` - Update user choices

## License

GPL-3.0-or-later
