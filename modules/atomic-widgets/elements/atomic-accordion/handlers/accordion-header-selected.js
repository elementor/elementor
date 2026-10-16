export const ACCORDION_ELEMENT_TYPE = 'e-accordion';
export const ITEM_ELEMENT_TYPE = 'e-accordion-item';
export const HEADER_ELEMENT_TYPE = 'e-accordion-item-header';
export const SELECTED_CLASS = 'e--selected';

export function syncHeaderSelectedClass( item ) {
	const header = item?.querySelector?.( `[data-element_type="${ HEADER_ELEMENT_TYPE }"]` );

	if ( ! header ) {
		return;
	}

	header.classList.toggle( SELECTED_CLASS, item.hasAttribute( 'open' ) );
}

export function syncAllHeadersInAccordion( accordionElement, belongsToThisAccordion ) {
	Array.from( accordionElement.querySelectorAll( `[data-element_type="${ ITEM_ELEMENT_TYPE }"]` ) )
		.filter( belongsToThisAccordion )
		.forEach( syncHeaderSelectedClass );
}

export function createAccordionScopeHelpers( accordionElement ) {
	const getOwnAccordion = ( node ) => node.closest( `[data-element_type="${ ACCORDION_ELEMENT_TYPE }"]` );
	const belongsToThisAccordion = ( node ) => getOwnAccordion( node ) === accordionElement;

	return { belongsToThisAccordion };
}
