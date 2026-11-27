# Motion patterns for code effects

Pick a card, build the markup it targets, expose the listed fields as `code_effect.params`, then adapt the snippet. Contract, param format and API reference: [elementor://interactions/motion-code-guide].

Each card is adapted from a free motion.dev vanilla JS example (slug shown; never use Motion+ examples). Grades are motion.dev's own MotionScore filter. Cards marked **14.x API** use APIs that only exist in the bundled Motion 14.10.1 (`drag`, `arc`, `stagger` `grid` / `"edges"` / `"random"`, `press` `count` / `hold`); don't take older snippets for them from memory.

**Name** is `code_effect.name`, a short imperative label of what the effect does (for example `Spring scale on hover`). Set it on every code effect; the editor shows it instead of "Code".

**Trigger** is the interaction's `trigger`. Elementor wires it and runs the code when it fires; the snippet never calls `inView`, `scroll`, `hover`, `press`, `drag` or `resize`. See the trigger table in the guide for what the returned function does.

**Target** says what the code animates: `self` is the element, `children` are its direct children (build them as composition children).

## Gestures

### Hover scale — `js-hover` — S
Trigger: `hover`. APIs: `animate` (spring). Animates: `scale`. Target: self.
Fields: `scale` (slider 1–1.3, step 0.01, 1.05).

```js
({ element, params, motion }) => {
	const spring = { type: 'spring', stiffness: 300, damping: 20 };
	motion.animate( element, { scale: params.scale }, spring );

	return () => motion.animate( element, { scale: 1 }, spring );
}
```

### Press spring — `js-press` — S
Trigger: `click`. APIs: `animate` (spring). Animates: `scale`. Target: self.
Fields: `scale` (slider 0.8–1, step 0.01, 0.92), `stiffness` (slider 100–1000, 500).

```js
({ element, params, motion }) => {
	const spring = { type: 'spring', stiffness: params.stiffness, damping: 15 };
	motion.animate( element, { scale: params.scale }, spring );

	return () => motion.animate( element, { scale: 1 }, spring );
}
```

### Hover and press — `js-gestures` — S
Triggers: `hover` and `click`, as two interactions on the element. APIs: `animate` (spring). Animates: `scale`. Target: self.
Fields: `hoverScale`, `pressScale`, `stiffness`. Snippets: guide example 3.

### Double tap pop — `js-tap-double` — S — 14.x API
Trigger: `doubleClick`. APIs: `animate`. Animates: `scale`, `opacity`. Target: the element's first child (the icon).
Fields: `scale`. Snippet: guide example 8.

### Press and hold — `js-press-hold` — S — 14.x API
Trigger: `longPress`. APIs: `animate` (spring). Animates: `scale`. Target: self.
Fields: `scale`, `bounce`. Snippet: guide example 7.

## Events

### Parent fires, one child reacts — S
Triggers: any trigger on the parent with `fires_event: "name"` whose code calls `emit()`; the child has `trigger: "event"` with the same `event`. APIs: `animate`. Animates: `opacity`, `y`. Scope: the child must be inside the emitter, or both inside the same component. If all children behave the same, skip events and animate `element.children` from the parent.
Fields: `distance`, `duration`. Snippet: guide Events section.

## Entrances and transforms

Trigger: `load` for an entrance on page load, or `scrollIn` to play it when the element scrolls into view (return a function that hides it again to replay on every entry).

### Spring bounce — `js-bounce-easing` — S
APIs: `animate` (spring). Animates: `y`, `opacity`. Target: self.
Fields: `distance` (slider 0–300, 120), `bounce` (slider 0–0.8, step 0.05, 0.5).

```js
({ element, params, motion, reducedMotion }) => {
	motion.animate(
		element,
		{ y: [ reducedMotion ? 0 : -params.distance, 0 ], opacity: [ 0, 1 ] },
		{ type: 'spring', bounce: params.bounce, visualDuration: 0.6 }
	);
}
```

### Rotate — `js-rotate` — S
APIs: `animate`. Animates: `rotate`. Target: self.
Fields: `degrees` (slider -360–360, 45), `duration` (number 0.1–5, 1).

```js
({ element, params, motion }) => {
	motion.animate( element, { rotate: params.degrees }, { duration: params.duration, ease: 'easeInOut' } );
}
```

### Spring loop — `js-spring` — S
APIs: `animate` (spring, `repeat: Infinity`). Animates: `rotate`. Target: self.
Fields: `degrees` (slider 0–360, 90), `bounce` (slider 0–0.8, step 0.05, 0.4).

```js
({ element, params, motion, reducedMotion }) => {
	if ( reducedMotion ) {
		return;
	}

	motion.animate(
		element,
		{ rotate: params.degrees },
		{ type: 'spring', bounce: params.bounce, repeat: Infinity, repeatType: 'reverse', repeatDelay: 0.4 }
	);
}
```

### Eased entrance — `js-options` — S
APIs: `animate` (`ease`). Animates: `opacity`, `y`. Target: self.
Fields: `distance` (slider 0–200, 40), `duration` (number 0.1–3, 0.8), `ease` (select `easeOut`, `easeInOut`, `backOut`, `circOut`; `easeOut`).

```js
({ element, params, motion, reducedMotion }) => {
	motion.animate(
		element,
		{ opacity: [ 0, 1 ], y: [ reducedMotion ? 0 : params.distance, 0 ] },
		{ duration: params.duration, ease: params.ease }
	);
}
```

## Scroll

### Scroll reveal — `js-scroll-triggered` — S
Trigger: `scrollIn`. APIs: `animate`. Animates: `opacity`, `x`. Target: self.
Fields: `distance`, `duration`. Snippet: guide example 1.

### Scroll fade in and out — `js-scroll-fade` — S
Trigger: `scrollOn` (Start 100%, End 0%). APIs: `animate` (`times`). Animates: `opacity`. Target: self.
Fields: `fadeIn` (slider 0.05–0.45, step 0.05, 0.25), `fadeOut` (slider 0.05–0.45, step 0.05, 0.25).

```js
({ element, params, motion, reducedMotion }) => motion.animate(
	element,
	{ opacity: reducedMotion ? 1 : [ 0, 1, 1, 0 ] },
	{ ease: 'linear', times: [ 0, params.fadeIn, 1 - params.fadeOut, 1 ] }
)
```

### Parallax — `js-parallax` — S
Trigger: `scrollOn`. APIs: `animate` (`ease: "linear"`). Animates: `y`. Target: self or a child.
Fields: `distance`. Snippet: guide example 2.

### Exit on scroll out — S
Trigger: `scrollOut`. APIs: `animate`. Animates: `opacity`, `scale`. Target: self.
Fields: `scale` (slider 0.5–1, step 0.05, 0.9).

```js
({ element, params, motion, reducedMotion }) => {
	motion.animate( element, { opacity: 0, scale: reducedMotion ? 1 : params.scale }, { duration: 0.4 } );

	return () => motion.animate( element, { opacity: 1, scale: 1 }, { duration: 0.4 } );
}
```

## Groups (children)

### Children stagger — `js-stagger` — S
Trigger: `scrollIn`. APIs: `animate`, `stagger`. Animates: `opacity`, `y`. Target: children.
Fields: `distance` (slider 0–100, 24), `step` (slider 0.02–0.3, step 0.01, 0.08).

```js
({ element, params, motion, reducedMotion }) => {
	const { animate, stagger } = motion;
	const items = Array.from( element.children );

	animate( items, { opacity: 0, y: reducedMotion ? 0 : params.distance }, { duration: 0 } );
	animate( items, { opacity: 1, y: 0 }, { duration: 0.5, delay: stagger( params.step ) } );
}
```

### Grid ripple — `js-stagger-grid` — S — 14.x API
Trigger: `click`. APIs: `stagger` with `grid` and `from` (the pressed cell, from `event.target`). Animates: `opacity`, `scale`. Target: children laid out as a grid.
Fields: `columns`, `step`, `scale`. Snippet: guide example 4.

### Stagger from edges — `js-stagger-from-edges` — S — 14.x API
Trigger: `scrollIn`. APIs: `stagger` with `from: "edges"`. Animates: `opacity`, `y`. Target: children.
Fields: `distance` (slider 0–100, 24), `step` (slider 0.02–0.3, step 0.01, 0.08).

```js
({ element, params, motion, reducedMotion }) => {
	const { animate, stagger } = motion;
	const items = Array.from( element.children );

	animate( items, { opacity: 0, y: reducedMotion ? 0 : params.distance }, { duration: 0 } );
	animate( items, { opacity: 1, y: 0 }, { duration: 0.5, delay: stagger( params.step, { from: 'edges' } ) } );
}
```

### Random spring stagger — `js-stagger-random` — S — 14.x API
Trigger: `scrollIn`. APIs: `stagger` with `from: "random"`, spring. Animates: `opacity`, `scale`. Target: children.
Fields: `step` (slider 0.02–0.3, step 0.01, 0.06), `bounce` (slider 0–0.8, step 0.05, 0.4).

```js
({ element, params, motion, reducedMotion }) => {
	const { animate, stagger } = motion;
	const items = Array.from( element.children );

	animate( items, { opacity: 0, scale: reducedMotion ? 1 : 0.5 }, { duration: 0 } );
	animate(
		items,
		{ opacity: 1, scale: 1 },
		{ type: 'spring', bounce: params.bounce, delay: stagger( params.step, { from: 'random' } ) }
	);
}
```

## Loops

Trigger: `load`. Loops are stopped by Elementor; no cleanup needed.

### Loading spinner — `js-loading-circle-spinner` — S
APIs: `animate` (`repeat: Infinity`). Animates: `rotate`. Target: self.
Fields: `duration` (number 0.3–5, 1).

```js
({ element, params, motion, reducedMotion }) => {
	if ( reducedMotion ) {
		return;
	}

	motion.animate( element, { rotate: 360 }, { duration: params.duration, ease: 'linear', repeat: Infinity } );
}
```

### Jumping dots — `js-loading-jumping-dots` — S
APIs: `animate`, `stagger` (`repeat: Infinity`). Animates: `y`. Target: children (the dots).
Fields: `height` (slider 2–40, 12), `step` (slider 0.05–0.4, step 0.05, 0.15).

```js
({ element, params, motion, reducedMotion }) => {
	if ( reducedMotion ) {
		return;
	}

	const { animate, stagger } = motion;

	animate(
		Array.from( element.children ),
		{ y: [ 0, -params.height, 0 ] },
		{ duration: 0.6, repeat: Infinity, repeatDelay: 0.2, ease: 'easeInOut', delay: stagger( params.step ) }
	);
}
```

### Pulse dots — `js-loading-three-dots-pulse` — S
APIs: `animate`, `stagger` (`repeat: Infinity`). Animates: `scale`, `opacity`. Target: children (the dots).
Fields: `scale`, `duration`, `step`. Snippet: guide example 5.

### SVG segment spinner — `js-svg-loading-spinner` — S
APIs: `animate`, `stagger` (`repeat: Infinity`). Animates: `opacity`. Target: the shapes inside an `e-svg` child.
Fields: `duration` (number 0.4–3, 1.2).

```js
({ element, params, motion, reducedMotion }) => {
	const segments = Array.from( element.querySelectorAll( 'svg > *' ) );

	if ( reducedMotion || ! segments.length ) {
		return;
	}

	const { animate, stagger } = motion;

	animate(
		segments,
		{ opacity: [ 1, 0.2 ] },
		{ duration: params.duration, repeat: Infinity, ease: 'linear', delay: stagger( params.duration / segments.length ) }
	);
}
```

## Drag and paths

### Drag — `js-drag` — A — 14.x API
Trigger: `drag`. Elementor makes the element draggable with Motion's defaults (both axes, momentum, no constraints) and moves it. Target: self.
The code only styles the drag; don't animate `x` / `y`. Fields: `liftScale`, `dragOpacity`. Snippet: guide example 6.

Constraints, axis lock and snap-back (`js-drag-constraints`, `js-drag-lock-direction`) aren't configurable on the `drag` trigger yet; don't fake them in the code.

### Fly to target — `js-add-to-basket` — S — 14.x API
Trigger: `click`. APIs: `arc`, `animate`. Animates: `x`, `y`, `scale`, `opacity`. Target: the element's first child (the token that flies), pressed via the element.
Fields: `x` (number -800–800, 240), `y` (number -800–800, -160), `strength` (slider 0–1, step 0.05, 0.5), `duration` (number 0.2–2, 0.7).

```js
({ element, params, motion, reducedMotion }) => {
	const { animate, arc } = motion;
	const token = element.firstElementChild;

	if ( ! token ) {
		return;
	}

	if ( reducedMotion ) {
		animate( token, { opacity: [ 1, 0, 1 ] }, { duration: 0.4 } );
		return;
	}

	animate(
		token,
		{ x: [ 0, params.x ], y: [ 0, params.y ], scale: [ 1, 0.4 ], opacity: [ 1, 0 ] },
		{ duration: params.duration, path: arc( { strength: params.strength } ) }
	).then( () => animate( token, { x: 0, y: 0, scale: 1, opacity: 1 }, { duration: 0 } ) );
}
```

## Anti-pattern

### Colour cycle — `js-color-interpolation` — C
Animating `backgroundColor` on an infinite loop repaints every frame; that's why it grades low and why the MCP warns (`code_effect_non_compositor_property`). Don't ship this:

```js
({ element, params, motion }) => {
	motion.animate( element, { backgroundColor: [ params.from, params.to ] }, { duration: 2, repeat: Infinity, repeatType: 'reverse' } );
}
```

Do this instead: give the element a child overlay styled with the second colour (atomic styles), and loop its `opacity`. Fields: `duration` (number 0.5–10, 3).

```js
({ element, params, motion, reducedMotion }) => {
	const overlay = element.firstElementChild;

	if ( reducedMotion || ! overlay ) {
		return;
	}

	motion.animate( overlay, { opacity: [ 0, 1 ] }, { duration: params.duration, repeat: Infinity, repeatType: 'reverse' } );
}
```

## Use a component or widget instead

These free examples need specific markup or app state and don't fit a per-element code effect: Accordion, Tab select, Reorder items, Layout animation, Shared layout animation, View and page transitions, Characters remaining, Scroll pinning, Value transform & path drawing.

## Quality rules (short)

- Only `transform` and `opacity`. Springs for touch. `trigger: "scrollOn"` returning `animate(…, { ease: "linear" })` for scroll-linked. One `stagger` call per group.
- Set the trigger on the interaction, never in the code. Elementor stops loops and gestures; return a function only for the end phase. Respect `reducedMotion`.
- 2 to 5 fields with sensible `min` / `max`; read every one in the code.
