# Pseudo-Elements & Pseudo-Classes Research

## Current List
:hover (pseudo-class)
:focus (pseudo-class)
:focus-* (pseudo-class)
:before (pseudo-element - should be ::before)
:after (pseudo-element - should be ::after)
etc.

## Research Questions from Flatten Nested Classes

### Question 1: Pseudo-Element Support in Atomic Widgets
**From**: Pattern 4 in `6-FLATTEN-NESTED-CLASSES.md`  
**Example**: `.first > .second .third::first-class` → `.third-first-second::first-class`

**Research Needed**:
1. Can atomic widgets support pseudo-elements when class names are flattened?
2. Which pseudo-elements need to be supported?
   - `::before`
   - `::after`
   - `::first-letter`
   - `::first-line`
   - `::selection`
   - `::marker`
   - `::placeholder`
   - Other standard pseudo-elements?
3. How do pseudo-elements work with the atomic widget system?
4. Are there limitations or special handling requirements?
5. Should pseudo-elements be preserved as-is in the flattened class name?

### Question 2: Pseudo-Class Support
**Research Needed**:
1. How are pseudo-classes like `:hover`, `:active`, `:focus` handled in flattening?
2. Example: `.first .second:hover` → what should this become?
3. Are pseudo-classes treated differently from pseudo-elements?
4. Structural pseudo-classes (`:nth-child()`, `:first-child`, etc.) - how to handle?
5. State pseudo-classes (`:hover`, `:active`, `:visited`) - how to handle?
6. Form pseudo-classes (`:checked`, `:disabled`, `:required`) - how to handle?

### Question 3: Combined Pseudo-Selectors
**Research Needed**:
1. How to handle combinations like `.class::before:hover`?
2. How to handle multiple pseudo-elements/classes?
3. What's the order of preservation in flattened names?

## Status
⚠️ **RESEARCH REQUIRED** - Answers needed before implementing Pattern 4 of flatten nested classes feature
