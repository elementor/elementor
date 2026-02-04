# @elementor/onboarding

Onboarding wizard for Elementor.

## Installation

```bash
npm install @elementor/onboarding
```

## Usage

```typescript
import { App, registerOnboardingSlice } from '@elementor/onboarding';

// Register the store slice
registerOnboardingSlice();

// Render the app
<App onComplete={() => console.log('Done!')} onClose={() => console.log('Closed')} />
```

## Steps

The onboarding wizard has 7 steps:

1. **account** - Let's get to work (connect/login)
2. **building_for** - Who are you building for?
3. **site_about** - What is your site about?
4. **experience** - Have you worked with Elementor before?
5. **theme_select** - Choose a theme that fits your needs
6. **theme_confirm** - Continue with Hello theme
7. **site_features** - What do you want to include in your site?

## Hooks

### useOnboarding

```typescript
import { useOnboarding } from '@elementor/onboarding';

function MyComponent() {
  const { stepId, stepIndex, isFirst, isLast, actions } = useOnboarding();
  
  return (
    <button onClick={actions.nextStep}>Next</button>
  );
}
```

### useUpdateProgress

```typescript
import { useUpdateProgress } from '@elementor/onboarding';

function MyComponent() {
  const updateProgress = useUpdateProgress();
  
  const handleComplete = () => {
    updateProgress.mutate({ complete_step: 'account' });
  };
  
  return (
    <button onClick={handleComplete}>Complete Step</button>
  );
}
```
