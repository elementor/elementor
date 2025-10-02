MixPanel experiment: onboarding-a-b

The critical piece is the $experiment_started event you send from your code

That event has two key properties:

"Experiment name" → e.g. "onboarding-a-b"

"Variant name" → e.g. "A" or "B"

mixpanel.track('$experiment_started', {
  'Experiment name': 'onboarding-a-b',
  'Variant name': variant   // "A" or "B"
});



