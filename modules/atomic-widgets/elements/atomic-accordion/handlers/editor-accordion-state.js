import { register } from '@elementor/frontend-handlers';

const ITEM_ELEMENT_TYPE = 'e-accordion-item';
const SELECT_COMMAND = 'document/elements/select';
const COMMAND_RUN_AFTER_EVENT = 'elementor/commands/run/after';

/**
 * Auto-opens the `e-accordion-item` (a native `<details>`) that contains the element the editor
 * just selected, regardless of how the selection happened (canvas click, Structure panel click, or
 * any other route). Never touches any other item, and never runs on load - it only reacts to a
 * selection change.
 *
 * Route-agnostic signal: `document/elements/select` is the single v1 command every selection route
 * funnels through before the editor's selection actually changes -
 * `assets/dev/js/editor/document/elements/commands/toggle-selection.js` (canvas click, via
 * `onEditRequest` in `assets/dev/js/editor/elements/views/base.js`, and Structure panel click, via
 * the same `request:edit` -> `onEditRequest` path in
 * `assets/dev/js/editor/regions/navigator/element.js`) both resolve to it. Every `$e.run()` call
 * dispatches `window.dispatchEvent( new CustomEvent( 'elementor/commands/run/after', { detail: {
 * command, args } } ) )` once it finishes (`modules/web-cli/assets/js/core/commands.js`), so
 * filtering that event for `command === 'document/elements/select'` observes the selection changing
 * no matter which route triggered it.
 *
 * That dispatch happens on the top editor window, not the preview iframe this handler's code runs
 * in - exactly like `elementor/navigator/item/click` in
 * `atomic-tabs-preview-handler.js`, hence `window.parent.addEventListener(...)` below.
 *
 * `@elementor/editor-v1-adapters`'s `listenTo()`/`commandEndEvent()` wrap this exact event, but are
 * not used here: that package is externalized to the `elementorV2.editorV1Adapters` global
 * (`scripts/vite/shared/externals.mjs`), and nothing registers/enqueues that script for the preview
 * iframe (`Frontend_Assets_Loader::register_package_scripts()` only registers the Alpine.js and
 * frontend-handlers globals) - the global would be undefined at runtime here. Listening to the raw
 * window event directly avoids that gap; it's the same signal the npm helper reads.
 */
register( {
	elementType: 'e-accordion',
	id: 'e-accordion-preview-handler',
	callback: ( { element, signal } ) => {
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

			if ( ! item || item.hasAttribute( 'open' ) ) {
				return;
			}

			item.setAttribute( 'open', '' );
		}, { signal } );
	},
} );
