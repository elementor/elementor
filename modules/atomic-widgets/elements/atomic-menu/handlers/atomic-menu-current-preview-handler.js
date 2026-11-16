import { register } from '@elementor/frontend-handlers';

const ITEM_ELEMENT_TYPE = 'e-menu-item';
const CURRENT_CLASS = 'e--current';
const PREVIEW_STATE_ATTRIBUTE = 'data-e-preview-state';
const STYLE_STATE_EVENT = 'elementor/editor/style-state/change';

let activeState = { id: null, state: null };

register( {
	elementType: ITEM_ELEMENT_TYPE,
	id: 'e-menu-item-current-preview-handler',
	callback: ( { element, signal } ) => {
		const sync = () => {
			const isPreviewed = activeState.id === element.dataset.id && CURRENT_CLASS === activeState.state;

			if ( isPreviewed ) {
				element.setAttribute( PREVIEW_STATE_ATTRIBUTE, CURRENT_CLASS );
				element.classList.add( CURRENT_CLASS );
			} else {
				element.removeAttribute( PREVIEW_STATE_ATTRIBUTE );
			}

			if ( ! isPreviewed && ! element.hasAttribute( 'aria-current' ) ) {
				element.classList.remove( CURRENT_CLASS );
			}
		};

		sync();

		window.parent.addEventListener( STYLE_STATE_EVENT, ( event ) => {
			activeState = event.detail;
			sync();
		}, { signal } );
	},
} );
