import { register } from '@elementor/frontend-handlers';
import {
	ACCORDION_ELEMENT_TYPE,
	ITEM_ELEMENT_TYPE,
	createAccordionScopeHelpers,
	syncAllHeadersInAccordion,
	syncHeaderSelectedClass,
} from './accordion-header-selected';

register( {
	elementType: ACCORDION_ELEMENT_TYPE,
	id: 'e-accordion-selected-state-handler',
	callback: ( { element, signal } ) => {
		const { belongsToThisAccordion } = createAccordionScopeHelpers( element );

		syncAllHeadersInAccordion( element, belongsToThisAccordion );

		element.addEventListener( 'toggle', ( event ) => {
			const item = event.target;

			if ( ITEM_ELEMENT_TYPE !== item?.dataset?.element_type || ! belongsToThisAccordion( item ) ) {
				return;
			}

			syncHeaderSelectedClass( item );
		}, { capture: true, signal } );
	},
} );
