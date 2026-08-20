import { register } from '@elementor/frontend-handlers';

const ACCORDION_ELEMENT_TYPE = 'e-accordion';
const ITEM_ELEMENT_TYPE = 'e-accordion-item';
const HEADER_ELEMENT_TYPE = 'e-accordion-item-header';
const MAX_EXPANDED_ONE = 'one';
const DEFAULT_STATE_FIRST_EXPANDED = 'first_expanded';
const SELECT_COMMAND = 'document/elements/select';
const COMMAND_RUN_AFTER_EVENT = 'elementor/commands/run/after';

/**
 * Owns the open/closed state of `e-accordion-item` (a native `<details>`) inside the editor preview,
 * because in the editor nothing else can:
 *
 * 1. The native `<summary>` toggle never runs. Every click on an atomic element reaches
 *    `handleAnchorClick()` in `assets/dev/js/editor/elements/views/base.js`, which calls
 *    `event.preventDefault()` for anything `elementor.helpers.isElementAtomic()` recognizes - and
 *    that cancels the summary's activation behaviour along with the link navigation it targets.
 * 2. `open` and `name` are never rendered. `Atomic_Accordion_Item::build_template_context()` derives
 *    them from `Render_Context`, which only exists in the PHP render pass; the editor renders each
 *    element client-side through `createNestedTemplatedElementView()`
 *    (`packages/packages/core/editor-canvas/src/legacy/create-nested-templated-element-type.ts`),
 *    whose Twig context is only `id`/`type`/`settings`/`base_styles`/editor attributes. So
 *    `is_open` and `group_name` are undefined there, and with no `name=` on the `<details>` the
 *    browser's own exclusivity between same-named items never kicks in either.
 *
 * Hence both behaviours below are implemented by hand, mirroring what the frontend gets for free:
 * clicking a header toggles its item, and `Max Items Expanded: One` closes the other items.
 *
 * If `handleAnchorClick()` ever stops cancelling summary clicks, the native toggle and the toggle
 * here would cancel each other out - revisit this file together with that change.
 */
register( {
	elementType: ACCORDION_ELEMENT_TYPE,
	id: 'e-accordion-preview-handler',
	callback: ( { element, signal, listenToChildren } ) => {
		const getOwnAccordion = ( node ) => node.closest( `[data-element_type="${ ACCORDION_ELEMENT_TYPE }"]` );

		const belongsToThisAccordion = ( node ) => getOwnAccordion( node ) === element;

		// Items of a nested accordion match the selector too, so they are filtered out by their
		// nearest accordion ancestor - the inner accordion runs its own instance of this handler.
		const getItems = () =>
			Array.from( element.querySelectorAll( `[data-element_type="${ ITEM_ELEMENT_TYPE }"]` ) )
				.filter( belongsToThisAccordion );

		// Reads a live root setting instead of the DOM: neither `open` nor the `name` attribute the
		// frontend relies on for exclusivity is ever rendered in the editor (see the docblock).
		// Settings are prop values (`{ $$type, value }`), and a key is absent until the user touches
		// its control, hence the caller-supplied fallback repeating the schema default.
		//
		// Once the prop is exposed as a component property its value is replaced by the overridable
		// wrapper (`{ override_key, origin_value: { $$type, value } }`), so the actual value sits one
		// level deeper - without unwrapping it, an exposed `default_state`/`max_expanded` would read as
		// an object and silently fall back to "not first_expanded" / "not exclusive".
		const getRootSetting = ( key, fallback ) => {
			const container = window.parent?.elementor?.getContainer?.( element.dataset.id );
			const setting = container?.settings?.get?.( key );
			const settingValue = setting && 'object' === typeof setting && 'value' in setting
				? setting.value
				: setting;
			const value = settingValue && 'object' === typeof settingValue
				? settingValue.origin_value?.value
				: settingValue;

			return value ?? fallback;
		};

		const isExclusive = () => MAX_EXPANDED_ONE === getRootSetting( 'max_expanded', MAX_EXPANDED_ONE );

		const openItem = ( item ) => {
			if ( isExclusive() ) {
				getItems().forEach( ( sibling ) => {
					if ( sibling !== item ) {
						sibling.removeAttribute( 'open' );
					}
				} );
			}

			item.setAttribute( 'open', '' );
		};

		// Whether a human has already decided this accordion's open state in the current DOM
		// generation. `Default State` describes how the accordion *first* renders, so once someone
		// toggles an item by hand, a later re-render of a single child (a title, an icon) must not
		// re-apply it over their choice. Re-rendering the accordion itself re-runs this whole callback
		// with a fresh flag, which is exactly when the default becomes relevant again.
		let userToggledAnItem = false;

		// Items whose freshly rendered node the default state was already evaluated against, so it is
		// applied once per node and not on every sibling's render event.
		const defaultStateEvaluated = new WeakSet();

		/**
		 * Applies the accordion's `Default State` in the editor preview, which nothing else can:
		 * `open` is derived from `Render_Context` in the PHP pass only, and the editor renders each
		 * element client-side from Twig without it (see the docblock), so every `<details>` arrives
		 * collapsed no matter what the setting says. `first_expanded` is therefore honoured here, the
		 * same way this handler already stands in for the native toggle and for `name`-based
		 * exclusivity.
		 */
		const applyDefaultState = () => {
			if ( userToggledAnItem ) {
				return;
			}

			const items = getItems();
			const shouldExpandFirst = DEFAULT_STATE_FIRST_EXPANDED === getRootSetting( 'default_state', DEFAULT_STATE_FIRST_EXPANDED );
			const hasOpenItem = items.some( ( item ) => item.hasAttribute( 'open' ) );

			items.forEach( ( item, index ) => {
				if ( defaultStateEvaluated.has( item ) ) {
					return;
				}

				defaultStateEvaluated.add( item );

				if ( shouldExpandFirst && 0 === index && ! hasOpenItem ) {
					item.setAttribute( 'open', '' );
				}
			} );
		};

		applyDefaultState();

		// The accordion's own render event can arrive before its items exist in the DOM (the item
		// views render as separate children), so the default is re-evaluated as they come in.
		listenToChildren( [ ITEM_ELEMENT_TYPE ] ).render( ( event ) => {
			if ( belongsToThisAccordion( event.detail.element ) ) {
				applyDefaultState();
			}
		} );

		// The item toggled by the click currently being dispatched, if any. Clicking a header also
		// selects it, and the selection listener below reacts to that by opening the item it lives in
		// - which would immediately undo a click that closed it. The click decides, the selection
		// listener stands down for that one item. Cleared on the next task, after the synchronous
		// `$e.run( 'document/elements/select' )` this click triggers has finished.
		let itemToggledByClick = null;

		// Capture phase: the state has to be read before the editor's own click handlers (bound on the
		// element views nested inside this accordion) run and change the selection.
		element.addEventListener( 'click', ( event ) => {
			const header = event.target?.closest?.( `[data-element_type="${ HEADER_ELEMENT_TYPE }"]` );
			const item = header?.closest( `[data-element_type="${ ITEM_ELEMENT_TYPE }"]` );

			if ( ! item || ! belongsToThisAccordion( item ) ) {
				return;
			}

			itemToggledByClick = item;
			userToggledAnItem = true;
			setTimeout( () => {
				itemToggledByClick = null;
			} );

			if ( item.hasAttribute( 'open' ) ) {
				item.removeAttribute( 'open' );

				return;
			}

			openItem( item );
		}, { capture: true, signal } );

		/**
		 * Auto-opens the item that contains the element the editor just selected, regardless of how the
		 * selection happened (canvas click, Structure panel click, or any other route). Never runs on
		 * load - it only reacts to a selection change.
		 *
		 * Route-agnostic signal: `document/elements/select` is the single v1 command every selection
		 * route funnels through before the editor's selection actually changes -
		 * `assets/dev/js/editor/document/elements/commands/toggle-selection.js` (canvas click, via
		 * `onEditRequest` in `assets/dev/js/editor/elements/views/base.js`, and Structure panel click,
		 * via the same `request:edit` -> `onEditRequest` path in
		 * `assets/dev/js/editor/regions/navigator/element.js`) both resolve to it. Every `$e.run()` call
		 * dispatches `window.dispatchEvent( new CustomEvent( 'elementor/commands/run/after', { detail: {
		 * command, args } } ) )` once it finishes (`modules/web-cli/assets/js/core/commands.js`), so
		 * filtering that event for `command === 'document/elements/select'` observes the selection
		 * changing no matter which route triggered it.
		 *
		 * That dispatch happens on the top editor window, not the preview iframe this handler's code
		 * runs in - exactly like `elementor/navigator/item/click` in `atomic-tabs-preview-handler.js`,
		 * hence `window.parent.addEventListener(...)`.
		 *
		 * `@elementor/editor-v1-adapters`'s `listenTo()`/`commandEndEvent()` wrap this exact event, but
		 * are not used here: that package is externalized to the `elementorV2.editorV1Adapters` global
		 * (`scripts/vite/shared/externals.mjs`), and nothing registers/enqueues that script for the
		 * preview iframe (`Frontend_Assets_Loader::register_package_scripts()` only registers the
		 * Alpine.js and frontend-handlers globals) - the global would be undefined at runtime here.
		 * Listening to the raw window event directly avoids that gap; it's the same signal the npm
		 * helper reads.
		 */
		window.parent.addEventListener( COMMAND_RUN_AFTER_EVENT, ( event ) => {
			if ( event.detail?.command !== SELECT_COMMAND ) {
				return;
			}

			// Re-read the current selection rather than trusting the command's own args shape (which
			// varies - e.g. multi-select passes `containers`, not `container` - see
			// `assets/dev/js/editor/document/elements/commands/toggle-selection.js`). Mirrors
			// `getSelectedElements()` in `packages/packages/libs/editor-elements/src/sync/get-selected-elements.ts`,
			// inlined for the same externals reason as above (`@elementor/editor-elements` is
			// externalized too; `elementor` itself is the plain legacy global, not an import).
			const selectedElements = window.parent?.elementor?.selection?.getElements?.() ?? [];
			const [ selected ] = selectedElements;
			const selectedId = selected?.model?.get?.( 'id' );

			if ( ! selectedId ) {
				return;
			}

			const selectedNode = element.querySelector( `[data-id="${ CSS.escape( selectedId ) }"]` );

			if ( ! selectedNode ) {
				return;
			}

			const item = selectedNode.closest( `[data-element_type="${ ITEM_ELEMENT_TYPE }"]` );

			if ( ! item || ! belongsToThisAccordion( item ) || item === itemToggledByClick ) {
				return;
			}

			if ( item.hasAttribute( 'open' ) ) {
				return;
			}

			openItem( item );
		}, { signal } );
	},
} );
