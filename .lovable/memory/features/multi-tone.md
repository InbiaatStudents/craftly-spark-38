---
name: multi-select-emotional-tones
description: Emotional tone is multi-select; AI blends all selected tones across the page
type: feature
---
GenerationRequest.emotionalTones is a string[] (e.g. ["trust", "authority"]).
- UI: button-toggle row in src/pages/Index.tsx — minimum 1 required.
- Edge function: tonesDirective() instructs the AI to blend tones across the whole page, not allocate one tone per section.
- Back-compat: edge function still accepts legacy `emotionalTone` (singular) and wraps it.
