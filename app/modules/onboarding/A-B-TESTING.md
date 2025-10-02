MixPanel experiment: Onboarding A/B

The critical piece is the $experiment_started event you send from your code

That event has two key properties:

"Experiment name" → MUST match exactly what you named in Mixpanel: "Onboarding A/B"

"Variant name" → e.g. "A" or "B"

mixpanel.track('$experiment_started', {
  'Experiment name': 'Onboarding A/B',  // Must match Mixpanel experiment name exactly!
  'Variant name': variant   // "A" or "B"
});

Experiment URL: https://eu.mixpanel.com/project/3274571/view/3781503/app/experiments/fac7282d-8865-4570-9694-ebab18b1ad97



