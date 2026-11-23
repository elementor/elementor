# Motion code effects

A code effect is an interaction item whose `animation.effect` is `"code"`. It carries a Motion function (`code_effect.code`) and the editable fields the user sees in the Interactions tab (`code_effect.params`). Pro only.

**Trusted code.** The function runs for every visitor of the published page. Only users with the `unfiltered_html` capability can save it; for anyone else the effect is removed on save (`code_effect_stripped_on_save` warning).

## Contract

```js
({ element, params, motion, reducedMotion, event, emit }) => onEnd | animation | void
```

- `emit( detail? )`: fires this interaction's `fires_event` for other interactions to catch; see [Events](#events). It does nothing when the interaction has no `fires_event`, and in the editor.

- `code` is a single function expression (arrow or `function`). No statements outside it, no `import`.
- `element`: the element the interaction is attached to. Query only inside it (`element.querySelectorAll(...)`, `element.children`).
- `params`: `{ [key]: value }` built from `code_effect.params`. Numbers are numbers, switches are booleans, colors and text are strings.
- `motion`: the Motion library (free MIT `motion` 14.10.1), the same object as `window.Motion`.
- `reducedMotion`: `true` when the visitor prefers reduced motion.
- `event`: what fired the trigger. A `PointerEvent` for `hover`, `click`, `doubleClick`, `longPress` and `drag`, an `IntersectionObserverEntry` for `scrollIn` and `scrollOut`, `{ width, height }` for `resize`, `{ name, detail, source }` for `event` (`source` is the element that emitted it), `undefined` for `load` and `scrollOn`.
- **The trigger is the interaction's `trigger`, never the code.** Elementor wires it with Motion's own `inView`, `scroll`, `hover`, `press`, `drag` and `resize`, then calls the function each time it fires. Don't call those APIs in the code (`code_effect_trigger_in_code` warning).
- **No cleanup needed.** Each run happens inside `motion.scopeMotion( element )`: every `animate()`, loop and Motion gesture it starts is stopped by Elementor, and selector strings passed to `animate()` resolve inside `element`. Plain DOM listeners you add yourself are not tracked; see `load` below.
- Durations are in **seconds**.

## Triggers

| `trigger` | Runs the code | The returned function runs |
|---|---|---|
| `load` | once, on page load | when the effect is torn down (editor re-run); use it only to remove DOM listeners |
| `scrollIn` | each time the element enters the viewport | when it leaves. Return nothing to run only the first time |
| `scrollOut` | each time the element leaves the viewport (less than 85% visible) | when it enters again, to restore the element |
| `scrollOn` | once, on page load. **Return the `animate()` controls**; Elementor links their progress to scroll using the interaction's Start, End and Relative to settings | — (`code_effect_scroll_on_without_animation` warning if nothing is returned) |
| `hover` | on pointer enter (mouse only, never on touch) | on pointer leave |
| `click` | on press (pointer or Enter key) | on release, as `( event, { success } )`; `success` is `false` when released outside |
| `doubleClick` | on the second quick press | when the effect is torn down |
| `longPress` | once the press is held for 0.5 s | on release |
| `drag` | on drag start. Elementor makes the element draggable with Motion's defaults (both axes, momentum, no constraints) and moves it; don't animate `x` / `y` yourself | on drag end |
| `resize` | each time the element's size changes, including once when observed. The previous run is stopped first | when the effect is torn down |
| `event` | each time an element in scope fires the interaction's `event`. The previous run is stopped first | when the effect is torn down |

Before a trigger re-runs the code, the previous run is stopped where it is (no jump back). In the editor, playing the interaction runs the code once as if the trigger fired, with `event` undefined (`resize` gets the current size), and never runs the end phase; real gestures only work on the published page. Read `event` defensively (`event?.target`).

`doubleClick`, `longPress`, `drag`, `resize` and `event` are only valid with `effect: "code"`.

## Events

One effect fires an event, other elements react to it.

- **Firing:** set `fires_event: "<name>"` on the code-effect interaction (kebab-case, `^[a-z][a-z0-9-]{0,39}$`) and call `emit( detail? )` in its code. You choose the name once; the user sees it but cannot edit it.
- **Listening:** `trigger: "event"` plus `event: "<name>"`. The name must be the `fires_event` of an interaction that exists in the same composition or component. Never invent a name nothing fires: the listener is removed on save (`code_effect_event_not_fired` warning). Its code runs with `event = { name, detail, source }`.

Fire and listen in the same build call so both sides are validated together.

```json
{ "trigger": "event", "event": "card-open", "animation": { "effect": "code", "code_effect": { "name": "Reveal card body", "code": "..." } } }
```

Who can hear an event (there is no page-wide or global event):
- Emitter on the page, outside any component: only the emitter itself and the elements inside it.
- Emitter inside a component: every element of that same component instance, siblings included. Nothing outside the instance hears it, and the instance never hears events from outside.

Choosing the shape:
- All children behave the same: one interaction on the parent animates `element.children`. No event interactions on the children.
- One child behaves differently when something happens on the parent: the parent interaction has `fires_event: "card-open"` and its code calls `emit()`, and only that child gets a `trigger: "event"` interaction with `event: "card-open"`.
- Siblings: put the native trigger on their common parent and let it `emit`; the siblings listen. Inside a component, a sibling can emit directly.

Rules: events do not chain in the editor (they only play on the published page); an event that is already being delivered is not delivered again (no A-to-B-to-A loops). Listeners are registered before any effect runs, so `load` effects can emit to them.

```js
({ element, motion, emit }) => {
	motion.animate( element, { scale: [ 1, 1.05, 1 ] }, { duration: 0.4 } );
	emit( { index: Array.from( element.parentElement.children ).indexOf( element ) } );
}
```

## Interaction item (build-composition / manage-elements)

`type` and `timing_config` are filled automatically for code effects; `trigger` defaults to `"load"`.

```json
{
  "trigger": "hover",
  "animation": {
    "effect": "code",
    "code_effect": {
      "name": "Spring lift on hover",
      "code": "({ element, params, motion }) => { ... }",
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

For `scrollOn`, also set `animation.config.start`, `end` (percent sizes) and `relativeTo` (`viewport` or `page`) when the defaults (85%, 15%, viewport) don't fit.

An element can carry up to 10 interactions, so combine triggers by adding one code effect per trigger (for example `hover` and `click` on the same button).

Name rules:
- `code_effect.name` is the label the Interactions tab shows instead of "Code", in the interaction row and in the Effect dropdown. Always set it (`code_effect_missing_name` warning).
- One line, at most 60 characters, imperative, describing what the effect does to the element: `Add class "is-active"`, `Set attribute aria-expanded`, `Spring scale on hover`, `Fade children in on scroll`.
- Name the outcome, not the technique: not `Code effect`, `Motion function` or `Custom animation`.
- Every example below needs its own `name`.

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

## API reference (bundle 14.10.1)

Use these inside the code. Trigger APIs (`inView`, `scroll`, `hover`, `press`, `drag`, `resize`) are wired by Elementor from `trigger`.

| API | Signature | Returns |
|---|---|---|
| `animate` | `animate(target, keyframes, options)` — target is an element, element array, selector inside `element`, or motion value | controls: `stop()`, `play()`, `pause()`, `cancel()`, `then()`, `speed` (read/write while running) |
| `animate` (sequence) | `animate([ [ target, keyframes, { duration, at } ], … ])` — `at`: seconds, `"+0.2"`, `"-0.2"` or `"<"` | controls; return it from a `scrollOn` effect to scrub the whole timeline |
| `stagger` | `stagger(step, { startDelay, from, ease, grid })` — `from`: index, `"first"`, `"center"`, `"last"`, `"edges"`, `"random"`; `grid`: `[columns, rows]` | delay function for `options.delay` |
| `spring` | `{ type: "spring", stiffness, damping, mass }` or `{ type: "spring", bounce, visualDuration }` in options | — |
| `arc` | `arc({ strength, peak, direction, rotate })` as `options.path` for curved `x`/`y` moves; `direction`: `"cw"` or `"ccw"` | path |
| `motionValue` | `motionValue(initial)` | motion value: `get()`, `set()`, `on("change", cb)` |
| `springValue` | `springValue(sourceOrInitial, springOptions)` | motion value |
| `mapValue` | `mapValue(value, inputRange, outputRange)` | motion value |
| `transform` | `transform(inputRange, outputRange)` | mapping function |
| `styleEffect` | `styleEffect(element, { x: motionValue, opacity: motionValue })` | stop function |
| `animateLayout` | `animateLayout(scope, () => updateDom(), options)` on children tagged `data-layout` or `data-layout-id` | layout animation builder |

Other exports available on `motion`: `animateView`, `attrEffect`, `svgEffect`, `propEffect`, `frame`, `cancelFrame`, `inertia`, `keyframes`, `mix`, `interpolate`, `clamp`, `wrap`, `cubicBezier`, `easeIn`, `easeOut`, `easeInOut`, `backIn`, `backOut`, `backInOut`, `circIn`, `circOut`, `circInOut`, `anticipate`, `steps`, `delay`.

## Translating docs or example snippets

- `import { animate, stagger } from "motion"` → `const { animate, stagger } = motion`.
- `document.querySelector(".box")` → `element`; children → `element.querySelectorAll(...)` or `Array.from(element.children)`.
- `inView(el, () => …)`, `hover(el, () => …)`, `press(el, () => …)`, `drag(el, { onStart, onEnd })`, `resize(el, …)` → set `trigger` to `scrollIn`, `hover`, `click`, `drag` or `resize`, and keep only the callback body as the code. A callback's returned function stays the returned function.
- `scroll(animate(el, keyframes), { target, offset })` → `trigger: "scrollOn"` and `return animate(element, keyframes, { ease: "linear" })`; map `offset` to Start / End.
- Hard-coded numbers and colours → `params`.
- Initial state: prefer atomic styles in the same build call (no flash). Otherwise `animate(el, initial, { duration: 0 })` first.
- Markup the effect needs (dots, cells, layers) → composition children, not `innerHTML`.
- `setTimeout` chains → `delay`, `stagger` or chained `.then()`.
- React props (`whileHover`, `whileTap`, `whileInView`, `drag`) → the matching trigger.

## Quality rules

- Animate only `transform` and `opacity`: `x`, `y`, `scale`, `scaleX`, `rotate`, `opacity`. Not `width`, `height`, `top`, `left`, `margin`, `padding`, `backgroundColor`, `color`, `boxShadow`.
- Use springs for anything the user touches (`hover`, `click`, `longPress`, `drag`).
- Scroll-linked effects use `trigger: "scrollOn"` and return `animate(…, { ease: "linear" })`. Never poll scroll events.
- Animate groups with one `animate(children, …, { delay: stagger(…) })` call.
- Respect `reducedMotion`: skip loops and parallax, use instant or opacity-only transitions.
- The MCP returns non-blocking `code_effect_*` warnings when these rules look broken. Fix and resend.

## Pitfalls

- Text widgets (`e-heading`, `e-paragraph`) render inline, and transforms don't apply to inline boxes. Give the animated element, or the word and letter children it moves, `display: inline-block` in atomic styles.
- Motion writes the element's inline `transform`, replacing any CSS `transform` from its styles (e.g. `translate(-50%, -50%)` centring). Position moved elements with `inset`, `margin` or flex, or put the CSS transform on a wrapper.
- Springs take two keyframes at most (`[ from, to ]` or only the target). Multi-step keyframes need duration-based easing.
- `animate()` and `styleEffect()` on the same element share one renderer, so pointer-driven `x`/`y` from `styleEffect` compose with an `animate()` on `scale`. Never drive the same property from both.
- A `transform`, `filter` or `backdrop-filter` on any ancestor becomes the containing block of `position: fixed` descendants. Don't animate ancestors of fixed overlays or cursors.

Pattern cards with grades, fields and snippets: [elementor://interactions/motion-patterns].

## Examples

### 1. Scroll reveal — `trigger: "scrollIn"`

Params: `distance` (slider 0–400, 100), `duration` (number 0.1–5, 0.9).

```js
({ element, params, motion, reducedMotion }) => {
	const hidden = { opacity: 0, x: reducedMotion ? 0 : -params.distance };

	motion.animate( element, hidden, { duration: 0 } );
	motion.animate( element, { opacity: 1, x: 0 }, { duration: params.duration, ease: [ 0.22, 1, 0.36, 1 ] } );

	return () => motion.animate( element, hidden, { duration: params.duration / 2 } );
}
```

### 2. Scroll-linked parallax — `trigger: "scrollOn"`

Params: `distance` (slider 0–300, 80).

```js
({ element, params, motion, reducedMotion }) => motion.animate(
	element,
	{ y: reducedMotion ? 0 : [ -params.distance, params.distance ] },
	{ ease: 'linear' }
)
```

### 3. Hover and press springs — two interactions, `trigger: "hover"` and `trigger: "click"`

Hover params: `hoverScale` (slider 1–1.3, step 0.01, 1.05), `stiffness` (slider 100–800, 400).

```js
({ element, params, motion }) => {
	const spring = { type: 'spring', stiffness: params.stiffness, damping: 20 };

	motion.animate( element, { scale: params.hoverScale }, spring );

	return () => motion.animate( element, { scale: 1 }, spring );
}
```

Click params: `pressScale` (slider 0.8–1, step 0.01, 0.95), `stiffness` (slider 100–800, 400).

```js
({ element, params, motion }) => {
	const spring = { type: 'spring', stiffness: params.stiffness, damping: 20 };

	motion.animate( element, { scale: params.pressScale }, spring );

	return () => motion.animate( element, { scale: 1 }, spring );
}
```

### 4. Grid ripple from the pressed cell — `trigger: "click"`

The element's children are the grid cells. Params: `columns` (number 1–12, 4), `step` (slider 0.01–0.2, step 0.01, 0.05), `scale` (slider 1–1.5, step 0.05, 1.2).

```js
({ element, params, motion, reducedMotion, event }) => {
	const { animate, stagger } = motion;
	const cells = Array.from( element.children );
	const grid = [ params.columns, Math.ceil( cells.length / params.columns ) ];
	const pressed = cells.findIndex( ( cell ) => cell.contains( event?.target ) );

	animate(
		cells,
		{ scale: reducedMotion ? 1 : [ 1, params.scale, 1 ], opacity: [ 1, 0.6, 1 ] },
		{ duration: 0.6, delay: stagger( params.step, { grid, from: Math.max( pressed, 0 ) } ) }
	);
}
```

### 5. Pulse loop on children — `trigger: "load"`

The element's children are the dots. Params: `scale` (slider 1–2, step 0.1, 1.4), `duration` (number 0.4–3, 1.2), `step` (slider 0.05–0.5, step 0.05, 0.15).

```js
({ element, params, motion, reducedMotion }) => {
	if ( reducedMotion ) {
		return;
	}

	motion.animate(
		Array.from( element.children ),
		{ scale: [ 1, params.scale, 1 ], opacity: [ 0.5, 1, 0.5 ] },
		{ duration: params.duration, repeat: Infinity, ease: 'easeInOut', delay: motion.stagger( params.step ) }
	);
}
```

### 6. Lift while dragging — `trigger: "drag"`

Elementor moves the element; the code only styles the drag. Params: `liftScale` (slider 1–1.3, step 0.01, 1.08), `dragOpacity` (slider 0.3–1, step 0.05, 0.8).

```js
({ element, params, motion }) => {
	const spring = { type: 'spring', stiffness: 500, damping: 30 };

	motion.animate( element, { scale: params.liftScale, opacity: params.dragOpacity }, spring );

	return () => motion.animate( element, { scale: 1, opacity: 1 }, spring );
}
```

### 7. Hold to confirm — `trigger: "longPress"`

Runs once the press is held for 0.5 s. Params: `scale` (slider 1–1.4, step 0.05, 1.15), `bounce` (slider 0–0.8, step 0.05, 0.5).

```js
({ element, params, motion }) => {
	motion.animate( element, { scale: params.scale }, { type: 'spring', bounce: params.bounce } );

	return () => motion.animate( element, { scale: 1 }, { type: 'spring', bounce: params.bounce } );
}
```

### 8. Double-click pop on a child icon — `trigger: "doubleClick"`

The element's first child is the icon. Params: `scale` (slider 1–3, step 0.1, 1.8).

```js
({ element, params, motion, reducedMotion }) => {
	const icon = element.firstElementChild;

	if ( ! icon ) {
		return;
	}

	motion.animate(
		icon,
		{ scale: reducedMotion ? 1 : [ 1, params.scale, 1 ], opacity: [ 0.6, 1 ] },
		{ duration: 0.5, ease: 'backOut' }
	);
}
```

### 9. Marquee loop — `trigger: "load"`

The element's first child is a `max-content` track holding the items twice, so `-50%` loops seamlessly. Params: `direction` (select `left`/`right`, `left`), `duration` (number 4–80, 22).

```js
({ element, params, motion, reducedMotion }) => {
	const track = element.firstElementChild;

	if ( reducedMotion || ! track ) {
		return;
	}

	const range = 'left' === params.direction ? [ '0%', '-50%' ] : [ '-50%', '0%' ];

	motion.animate( track, { x: range }, { duration: params.duration, ease: 'linear', repeat: Infinity } );
}
```

### 10. Scroll-scrubbed word reveal — `trigger: "scrollOn"`

The element's children are the words, each `display: inline-block`. Set Start 85% and End 50%. Params: `dim` (slider 0–0.6, step 0.02, 0.1), `lift` (slider 0–80, step 2, 24), `overlap` (slider 0.1–1, step 0.05, 0.35).

```js
({ element, params, motion, reducedMotion }) => {
	const words = Array.from( element.children );

	if ( reducedMotion || ! words.length ) {
		return;
	}

	return motion.animate( words.map( ( word, index ) => [
		word,
		{ opacity: [ params.dim, 1 ], y: [ params.lift, 0 ] },
		{ duration: 1, at: index * params.overlap, ease: 'linear' },
	] ) );
}
```

### 11. Fit content on resize — `trigger: "resize"`

The element's first child is scaled down to fit when the element gets narrower than `minWidth`. Params: `minWidth` (number 100–1200, 480).

```js
({ element, params, motion, event }) => {
	const content = element.firstElementChild;

	if ( ! content ) {
		return;
	}

	const scale = Math.min( 1, event.width / params.minWidth );

	motion.animate( content, { scale }, { type: 'spring', stiffness: 300, damping: 30 } );
}
```

### 12. Pointer parallax with spring follow — `trigger: "load"`

Listens on the parent, so the layer drifts while the pointer is anywhere in the section. A plain DOM listener is not tracked by Elementor, so the returned function removes it. Params: `parallax` (slider 0–200, step 5, 70), `stiffness` (slider 10–300, step 5, 50).

```js
({ element, params, motion, reducedMotion }) => {
	const { motionValue, springValue, styleEffect } = motion;
	const area = element.parentElement;

	if ( reducedMotion || ! area ) {
		return;
	}

	const pointerX = motionValue( 0 );
	const pointerY = motionValue( 0 );
	const spring = { stiffness: params.stiffness, damping: 18 };

	styleEffect( element, {
		x: springValue( pointerX, spring ),
		y: springValue( pointerY, spring ),
	} );

	const onPointerMove = ( pointerEvent ) => {
		const bounds = area.getBoundingClientRect();
		pointerX.set( ( ( pointerEvent.clientX - bounds.left ) / bounds.width - 0.5 ) * -params.parallax );
		pointerY.set( ( ( pointerEvent.clientY - bounds.top ) / bounds.height - 0.5 ) * -params.parallax );
	};

	area.addEventListener( 'pointermove', onPointerMove );

	return () => area.removeEventListener( 'pointermove', onPointerMove );
}
```

## Free motion.dev references per pattern

Adapt the pattern; don't copy source verbatim. Never use Motion+ examples.

- Scroll reveal: `js-scroll-triggered`. Scroll-linked: `js-parallax`, `js-scroll-fade`.
- Gestures: `js-hover`, `js-press`, `js-gestures`, `js-bounce-easing`, `js-tap-double`, `js-press-hold`.
- Children stagger: `js-stagger`, `js-stagger-grid`, `js-stagger-from-edges`, `js-stagger-random`.
- Loops: `js-loading-jumping-dots`, `js-loading-three-dots-pulse`, `js-loading-circle-spinner`, `js-svg-loading-spinner`.
- Drag: `js-drag`, `js-drag-constraints`, `js-drag-lock-direction`.
