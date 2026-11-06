# Motion patterns for code effects

Pick a card, build the markup it targets, expose the listed fields as `code_effect.params`, then adapt the snippet. Contract, param format and API reference: [elementor://interactions/motion-code-guide].

Each card is adapted from a free motion.dev vanilla JS example (slug shown; never use Motion+ examples). Grades are motion.dev's own MotionScore filter. Cards marked **14.9 API** use APIs that only exist in the bundled Motion 14.9.0 (`drag`, `arc`, `stagger` `grid` / `"edges"` / `"random"`); don't take older snippets for them from memory.

**Target** says what the code animates: `self` is the element, `children` are its direct children (build them as composition children).

## Gestures

### Hover scale — `js-hover` — S
APIs: `hover`, `animate` (spring). Animates: `scale`. Target: self.
Fields: `scale` (slider 1–1.3, step 0.01, 1.05).

```js
({ element, params, motion }) => motion.hover( element, () => {
	const spring = { type: 'spring', stiffness: 300, damping: 20 };
	motion.animate( element, { scale: params.scale }, spring );

	return () => motion.animate( element, { scale: 1 }, spring );
} )
```

### Press spring — `js-press` — S
APIs: `press`, `animate` (spring). Animates: `scale`. Target: self.
Fields: `scale` (slider 0.8–1, step 0.01, 0.92), `stiffness` (slider 100–1000, 500).

```js
({ element, params, motion }) => motion.press( element, () => {
	const spring = { type: 'spring', stiffness: params.stiffness, damping: 15 };
	motion.animate( element, { scale: params.scale }, spring );

	return () => motion.animate( element, { scale: 1 }, spring );
} )
```

### Hover and press — `js-gestures` — S
APIs: `hover`, `press` (spring). Animates: `scale`. Target: self.
Fields: `hoverScale`, `pressScale`, `stiffness`. Snippet: guide example 3.

## Entrances and transforms

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

	const controls = motion.animate(
		element,
		{ rotate: params.degrees },
		{ type: 'spring', bounce: params.bounce, repeat: Infinity, repeatType: 'reverse', repeatDelay: 0.4 }
	);

	return () => controls.stop();
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
APIs: `inView`, `animate`. Animates: `opacity`, `x`. Target: self.
Fields: `distance`, `duration`, `amount`. Snippet: guide example 1.

### Scroll fade in and out — `js-scroll-fade` — S
APIs: `scroll`, `animate` (`times`). Animates: `opacity`. Target: self.
Fields: `fadeIn` (slider 0.05–0.45, step 0.05, 0.25), `fadeOut` (slider 0.05–0.45, step 0.05, 0.25).

```js
({ element, params, motion, reducedMotion }) => {
	if ( reducedMotion ) {
		return;
	}

	return motion.scroll(
		motion.animate(
			element,
			{ opacity: [ 0, 1, 1, 0 ] },
			{ ease: 'linear', times: [ 0, params.fadeIn, 1 - params.fadeOut, 1 ] }
		),
		{ target: element, offset: [ 'start end', 'end start' ] }
	);
}
```

### Parallax — `js-parallax` — S
APIs: `scroll`, `animate` (`ease: "linear"`). Animates: `y`. Target: self or a child.
Fields: `distance`. Snippet: guide example 2.

## Groups (children)

### Children stagger — `js-stagger` — S
APIs: `inView`, `animate`, `stagger`. Animates: `opacity`, `y`. Target: children.
Fields: `distance` (slider 0–100, 24), `step` (slider 0.02–0.3, step 0.01, 0.08).

```js
({ element, params, motion, reducedMotion }) => {
	const { animate, inView, stagger } = motion;
	const items = Array.from( element.children );

	animate( items, { opacity: 0, y: reducedMotion ? 0 : params.distance }, { duration: 0 } );

	return inView( element, () => {
		animate( items, { opacity: 1, y: 0 }, { duration: 0.5, delay: stagger( params.step ) } );
	} );
}
```

### Grid ripple — `js-stagger-grid` — S — 14.9 API
APIs: `stagger` with `grid` and `from`, `press`. Animates: `opacity`, `scale`. Target: children laid out as a grid.
Fields: `columns`, `step`, `scale`. Snippet: guide example 4.

### Stagger from edges — `js-stagger-from-edges` — S — 14.9 API
APIs: `inView`, `stagger` with `from: "edges"`. Animates: `opacity`, `y`. Target: children.
Fields: `distance` (slider 0–100, 24), `step` (slider 0.02–0.3, step 0.01, 0.08).

```js
({ element, params, motion, reducedMotion }) => {
	const { animate, inView, stagger } = motion;
	const items = Array.from( element.children );

	animate( items, { opacity: 0, y: reducedMotion ? 0 : params.distance }, { duration: 0 } );

	return inView( element, () => {
		animate( items, { opacity: 1, y: 0 }, { duration: 0.5, delay: stagger( params.step, { from: 'edges' } ) } );
	} );
}
```

### Random spring stagger — `js-stagger-random` — S — 14.9 API
APIs: `inView`, `stagger` with `from: "random"`, spring. Animates: `opacity`, `scale`. Target: children.
Fields: `step` (slider 0.02–0.3, step 0.01, 0.06), `bounce` (slider 0–0.8, step 0.05, 0.4).

```js
({ element, params, motion, reducedMotion }) => {
	const { animate, inView, stagger } = motion;
	const items = Array.from( element.children );

	animate( items, { opacity: 0, scale: reducedMotion ? 1 : 0.5 }, { duration: 0 } );

	return inView( element, () => {
		animate(
			items,
			{ opacity: 1, scale: 1 },
			{ type: 'spring', bounce: params.bounce, delay: stagger( params.step, { from: 'random' } ) }
		);
	} );
}
```

## Loops

### Loading spinner — `js-loading-circle-spinner` — S
APIs: `animate` (`repeat: Infinity`). Animates: `rotate`. Target: self.
Fields: `duration` (number 0.3–5, 1).

```js
({ element, params, motion, reducedMotion }) => {
	if ( reducedMotion ) {
		return;
	}

	const controls = motion.animate( element, { rotate: 360 }, { duration: params.duration, ease: 'linear', repeat: Infinity } );

	return () => controls.stop();
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
	const controls = animate(
		Array.from( element.children ),
		{ y: [ 0, -params.height, 0 ] },
		{ duration: 0.6, repeat: Infinity, repeatDelay: 0.2, ease: 'easeInOut', delay: stagger( params.step ) }
	);

	return () => controls.stop();
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
	const controls = animate(
		segments,
		{ opacity: [ 1, 0.2 ] },
		{ duration: params.duration, repeat: Infinity, ease: 'linear', delay: stagger( params.duration / segments.length ) }
	);

	return () => controls.stop();
}
```

## Drag and paths

### Drag — `js-drag` — A — 14.9 API
APIs: `drag`. Animates: transform. Target: self. Fields: none needed.

```js
({ element, motion }) => motion.drag( element )
```

### Drag within parent — `js-drag-constraints` — A — 14.9 API
APIs: `drag` with constraints. Animates: transform. Target: self inside its parent.
Fields: `elastic`, `snapBack`. Snippet: guide example 6.

### Drag with axis lock — `js-drag-lock-direction` — A — 14.9 API
APIs: `drag` with `directionLock`, `animate`. Animates: transform, `opacity`. Target: self.
Fields: `elastic` (slider 0–1, step 0.05, 0.2), `dragOpacity` (slider 0.3–1, step 0.05, 0.7).

```js
({ element, params, motion }) => motion.drag( element, {
	directionLock: true,
	constraints: element.parentElement,
	elastic: params.elastic,
	onStart: () => motion.animate( element, { opacity: params.dragOpacity }, { duration: 0.15 } ),
	onEnd: () => motion.animate( element, { opacity: 1 }, { duration: 0.15 } ),
} )
```

### Fly to target — `js-add-to-basket` — S — 14.9 API
APIs: `arc`, `press`, `animate`. Animates: `x`, `y`, `scale`, `opacity`. Target: the element's first child (the token that flies), pressed via the element.
Fields: `x` (number -800–800, 240), `y` (number -800–800, -160), `strength` (slider 0–1, step 0.05, 0.5), `duration` (number 0.2–2, 0.7).

```js
({ element, params, motion, reducedMotion }) => {
	const { animate, arc, press } = motion;
	const token = element.firstElementChild;
	const path = arc( { strength: params.strength } );

	if ( ! token ) {
		return;
	}

	return press( element, () => {
		if ( reducedMotion ) {
			animate( token, { opacity: [ 1, 0, 1 ] }, { duration: 0.4 } );
			return;
		}

		animate(
			token,
			{ x: [ 0, params.x ], y: [ 0, params.y ], scale: [ 1, 0.4 ], opacity: [ 1, 0 ] },
			{ duration: params.duration, path }
		).then( () => animate( token, { x: 0, y: 0, scale: 1, opacity: 1 }, { duration: 0 } ) );
	} );
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

	const controls = motion.animate( overlay, { opacity: [ 0, 1 ] }, { duration: params.duration, repeat: Infinity, repeatType: 'reverse' } );

	return () => controls.stop();
}
```

## Use a component or widget instead

These free examples need specific markup or app state and don't fit a per-element code effect: Accordion, Tab select, Reorder items, Layout animation, Shared layout animation, View and page transitions, Characters remaining, Scroll pinning, Value transform & path drawing.

## Quality rules (short)

- Only `transform` and `opacity`. Springs for touch. `scroll(animate(...))` for scroll-linked. One `stagger` call per group.
- Return a cleanup; stop loops. Respect `reducedMotion`.
- 2 to 5 fields with sensible `min` / `max`; read every one in the code.
