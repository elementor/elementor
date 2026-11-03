# Motion code effects

A code effect is an interaction item whose `animation.effect` is `"code"`. It carries a Motion function (`code_effect.code`) and the editable fields the user sees in the Interactions tab (`code_effect.params`). Pro only.

**Trusted code.** The function runs for every visitor of the published page. Only users with the `unfiltered_html` capability can save it; for anyone else the effect is removed on save (`code_effect_stripped_on_save` warning).

## Contract

```js
({ element, params, motion, reducedMotion }) => cleanup | void
```

- `code` is a single function expression (arrow or `function`). No statements outside it, no `import`.
- `element`: the element the interaction is attached to. Query only inside it (`element.querySelectorAll(...)`, `element.children`).
- `params`: `{ [key]: value }` built from `code_effect.params`. Numbers are numbers, switches are booleans, colors and text are strings.
- `motion`: the Motion library (free MIT `motion` 14.9.0), the same object as `window.Motion`.
- `reducedMotion`: `true` when the visitor prefers reduced motion.
- The function runs **once per element on page load** and in the editor preview. The trigger is always `load`; the code wires its own gestures (`inView`, `hover`, `press`, `scroll`, `drag`).
- **Return a cleanup function** that stops everything you started: the stoppers returned by `inView`, `hover`, `press`, `scroll`, `drag`, and `controls.stop()` for loops. The editor calls it before every re-run.
- Durations are in **seconds**.

## Interaction item (build-composition / manage-elements)

`type`, `timing_config` and `trigger` are filled automatically for code effects.

```json
{
  "trigger": "load",
  "animation": {
    "effect": "code",
    "code_effect": {
      "code": "({ element, params, motion, reducedMotion }) => { ... }",
      "params": [
        { "key": "distance", "label": "Distance", "control": "slider", "value": 100, "default": 100, "min": 0, "max": 400, "step": 10 },
        { "key": "accent", "label": "Accent", "control": "color", "value": "#6d28d9", "default": "#6d28d9" },
        { "key": "ease", "label": "Ease", "control": "select", "value": "easeOut", "default": "easeOut", "options": [ "easeOut", "easeInOut", "linear" ] },
        { "key": "loop", "label": "Loop", "control": "switch", "value": true, "default": true }
      ]
    }
  }
}
```

Param rules:
- `key` matches `^[a-zA-Z_][a-zA-Z0-9_]{0,31}$`, unique, at most 10 params.
- `control`: `number` / `slider` (number), `text` / `select` (string), `color` (string), `switch` (boolean). `value` and `default` must match it.
- Numbers must sit within `min` / `max`; select values must be in `options`.
- Expose 2 to 5 fields that a designer would tune (distance, duration, stiffness or bounce, step delay, colours). Read every declared param in the code.

## Using the motion-dev MCP

If a `motion-dev` MCP is connected:
- Use `search_motion_docs` (framework `js`) and `get_motion_docs` only for the vanilla pages it indexes: `animate`, `scroll`, `spring`, `stagger`, `timeline`, `quick-start`.
- `validate_motion_syntax` is optional. Ignore its "add import from motion" suggestion; `motion` is injected.
- Never paste output from `create_animation_sequence` or `generate_motion_component`: it uses imports, global selectors and `setTimeout`.
- Never use Motion+ (`motion-plus`) APIs or examples: `splitText`, `typewriter`, `scrambleText`, `curtains`, Motion UI.

## API reference (bundle 14.9.0)

| API | Signature | Returns |
|---|---|---|
| `animate` | `animate(target, keyframes, options)` — target is an element, element array or motion value | controls: `stop()`, `play()`, `pause()`, `cancel()`, `then()` |
| `inView` | `inView(element, (el, entry) => onLeave?, { root, margin, amount })` — `amount`: `"some"`, `"all"` or 0–1 | stop function |
| `hover` | `hover(element, (el, event) => onHoverEnd?)` | cancel function |
| `press` | `press(element, (el, event) => (event, { success }) => void)` | cancel function |
| `scroll` | `scroll(animation, { target, offset, axis, container })` or `scroll((progress, info) => void, options)` | stop function |
| `drag` | `drag(element, { axis, constraints, elastic, momentum, snapToOrigin, directionLock, onStart, onMove, onEnd })` — `constraints` is `{ top, left, right, bottom }` in px or an element | stop function |
| `stagger` | `stagger(step, { startDelay, from, ease, grid })` — `from`: index, `"first"`, `"center"`, `"last"`, `"edges"`, `"random"`; `grid`: `[columns, rows]` | delay function for `options.delay` |
| `spring` | `{ type: "spring", stiffness, damping, mass }` or `{ type: "spring", bounce, visualDuration }` in options | — |
| `arc` | `arc({ strength, peak, direction, rotate })` as `options.path` for curved `x`/`y` moves; `direction`: `"cw"` or `"ccw"` | path |
| `motionValue` | `motionValue(initial)` | motion value: `get()`, `set()`, `on("change", cb)` |
| `springValue` | `springValue(sourceOrInitial, springOptions)` | motion value |
| `mapValue` | `mapValue(value, inputRange, outputRange)` | motion value |
| `transform` | `transform(inputRange, outputRange)` | mapping function |
| `styleEffect` | `styleEffect(element, { x: motionValue, opacity: motionValue })` | stop function |
| `animateLayout` | `animateLayout(scope, () => updateDom(), options)` on children tagged `data-layout` or `data-layout-id` | layout animation builder |

Other exports available on `motion`: `animateView`, `attrEffect`, `svgEffect`, `propEffect`, `frame`, `cancelFrame`, `inertia`, `keyframes`, `mix`, `interpolate`, `clamp`, `wrap`, `cubicBezier`, `easeIn`, `easeOut`, `easeInOut`, `backIn`, `backOut`, `backInOut`, `circIn`, `circOut`, `circInOut`, `anticipate`, `steps`, `resize`, `delay`.

## Translating docs or example snippets

- `import { animate, inView } from "motion"` → `const { animate, inView } = motion`.
- `document.querySelector(".box")` → `element`; children → `element.querySelectorAll(...)` or `Array.from(element.children)`.
- Hard-coded numbers and colours → `params`.
- Initial state: prefer atomic styles in the same build call (no flash). Otherwise `animate(el, initial, { duration: 0 })` first.
- Markup the effect needs (dots, cells, layers) → composition children, not `innerHTML`.
- `setTimeout` chains → `delay`, `stagger` or chained `.then()`.
- React props (`whileHover`, `drag`, `layout`) → the vanilla APIs in the table above.

## Quality rules

- Animate only `transform` and `opacity`: `x`, `y`, `scale`, `scaleX`, `rotate`, `opacity`. Not `width`, `height`, `top`, `left`, `margin`, `padding`, `backgroundColor`, `color`, `boxShadow`.
- Use springs for anything the user touches (hover, press, drag).
- Link scroll effects with `scroll(animate(el, keyframes, { ease: "linear" }), { target: element, offset })`. Never poll scroll events.
- Animate groups with one `animate(children, …, { delay: stagger(…) })` call.
- Stop infinite loops (`repeat: Infinity`) in the cleanup.
- Respect `reducedMotion`: skip loops and parallax, use instant or opacity-only transitions.
- The MCP returns non-blocking `code_effect_*` warnings when these rules look broken. Fix and resend.

Pattern cards with grades, fields and snippets: [elementor://interactions/motion-patterns].

## Examples

### 1. Scroll reveal (inView)

Params: `distance` (slider 0–400, 100), `duration` (number 0.1–5, 0.9), `amount` (slider 0–1, step 0.05, 0.3).

```js
({ element, params, motion, reducedMotion }) => {
	const { animate, inView } = motion;
	const hidden = { opacity: 0, x: reducedMotion ? 0 : -params.distance };

	animate( element, hidden, { duration: 0 } );

	return inView( element, () => {
		animate( element, { opacity: 1, x: 0 }, { duration: params.duration, ease: [ 0.22, 1, 0.36, 1 ] } );

		return () => animate( element, hidden, { duration: params.duration / 2 } );
	}, { amount: params.amount } );
}
```

### 2. Scroll-linked parallax (scroll)

Params: `distance` (slider 0–300, 80).

```js
({ element, params, motion, reducedMotion }) => {
	if ( reducedMotion ) {
		return;
	}

	const { animate, scroll } = motion;

	return scroll(
		animate( element, { y: [ -params.distance, params.distance ] }, { ease: 'linear' } ),
		{ target: element, offset: [ 'start end', 'end start' ] }
	);
}
```

### 3. Hover and press spring (hover, press)

Params: `hoverScale` (slider 1–1.3, step 0.01, 1.05), `pressScale` (slider 0.8–1, step 0.01, 0.95), `stiffness` (slider 100–800, 400).

```js
({ element, params, motion }) => {
	const { animate, hover, press } = motion;
	const spring = { type: 'spring', stiffness: params.stiffness, damping: 20 };

	const stopHover = hover( element, () => {
		animate( element, { scale: params.hoverScale }, spring );

		return () => animate( element, { scale: 1 }, spring );
	} );

	const stopPress = press( element, () => {
		animate( element, { scale: params.pressScale }, spring );

		return () => animate( element, { scale: params.hoverScale }, spring );
	} );

	return () => {
		stopHover();
		stopPress();
	};
}
```

### 4. Grid ripple on children (stagger with grid and from)

The element's children are the grid cells. Params: `columns` (number 1–12, 4), `step` (slider 0.01–0.2, step 0.01, 0.05), `scale` (slider 1–1.5, step 0.05, 1.2).

```js
({ element, params, motion, reducedMotion }) => {
	const { animate, press, stagger } = motion;
	const cells = Array.from( element.children );
	const grid = [ params.columns, Math.ceil( cells.length / params.columns ) ];

	const ripple = ( from ) => animate(
		cells,
		{ scale: reducedMotion ? 1 : [ 1, params.scale, 1 ], opacity: [ 1, 0.6, 1 ] },
		{ duration: 0.6, delay: stagger( params.step, { grid, from } ) }
	);

	ripple( 'center' );

	return press( cells, ( cell ) => {
		ripple( cells.indexOf( cell ) );
	} );
}
```

### 5. Pulse loop on children (stagger, repeat)

The element's children are the dots. Params: `scale` (slider 1–2, step 0.1, 1.4), `duration` (number 0.4–3, 1.2), `step` (slider 0.05–0.5, step 0.05, 0.15).

```js
({ element, params, motion, reducedMotion }) => {
	if ( reducedMotion ) {
		return;
	}

	const { animate, stagger } = motion;
	const controls = animate(
		Array.from( element.children ),
		{ scale: [ 1, params.scale, 1 ], opacity: [ 0.5, 1, 0.5 ] },
		{ duration: params.duration, repeat: Infinity, ease: 'easeInOut', delay: stagger( params.step ) }
	);

	return () => controls.stop();
}
```

### 6. Drag within the parent (drag)

Params: `elastic` (slider 0–1, step 0.05, 0.2), `snapBack` (switch, false).

```js
({ element, params, motion }) => motion.drag( element, {
	constraints: element.parentElement,
	elastic: params.elastic,
	snapToOrigin: params.snapBack,
} )
```

## Free motion.dev references per pattern

Adapt the pattern; don't copy source verbatim. Never use Motion+ examples.

- Scroll reveal: `js-scroll-triggered`. Scroll-linked: `js-parallax`, `js-scroll-fade`.
- Gestures: `js-hover`, `js-press`, `js-gestures`, `js-bounce-easing`.
- Children stagger: `js-stagger`, `js-stagger-grid`, `js-stagger-from-edges`, `js-stagger-random`.
- Loops: `js-loading-jumping-dots`, `js-loading-three-dots-pulse`, `js-loading-circle-spinner`, `js-svg-loading-spinner`.
- Drag: `js-drag`, `js-drag-constraints`, `js-drag-lock-direction`.
