import {
	ACCORDION_ELEMENT_TYPE,
	HEADER_ELEMENT_TYPE,
	ITEM_ELEMENT_TYPE,
	SELECTED_CLASS,
	createAccordionScopeHelpers,
	syncAllHeadersInAccordion,
	syncHeaderSelectedClass,
} from 'elementor/modules/atomic-widgets/elements/atomic-accordion/handlers/accordion-header-selected';

function buildAccordionDom() {
	const accordion = document.createElement( 'div' );
	accordion.dataset.element_type = ACCORDION_ELEMENT_TYPE;

	const outerItem = document.createElement( 'details' );
	outerItem.dataset.element_type = ITEM_ELEMENT_TYPE;
	const outerHeader = document.createElement( 'summary' );
	outerHeader.dataset.element_type = HEADER_ELEMENT_TYPE;
	outerItem.append( outerHeader );
	accordion.append( outerItem );

	const nestedAccordion = document.createElement( 'div' );
	nestedAccordion.dataset.element_type = ACCORDION_ELEMENT_TYPE;
	const innerItem = document.createElement( 'details' );
	innerItem.dataset.element_type = ITEM_ELEMENT_TYPE;
	innerItem.setAttribute( 'open', '' );
	const innerHeader = document.createElement( 'summary' );
	innerHeader.dataset.element_type = HEADER_ELEMENT_TYPE;
	innerItem.append( innerHeader );
	nestedAccordion.append( innerItem );
	accordion.append( nestedAccordion );

	document.body.append( accordion );

	return { accordion, outerItem, outerHeader, nestedAccordion, innerItem, innerHeader };
}

describe( 'accordion-header-selected', () => {
	afterEach( () => {
		document.body.innerHTML = '';
	} );

	it( 'adds e--selected when the item is open', () => {
		const item = document.createElement( 'details' );
		item.dataset.element_type = ITEM_ELEMENT_TYPE;
		item.setAttribute( 'open', '' );
		const header = document.createElement( 'summary' );
		header.dataset.element_type = HEADER_ELEMENT_TYPE;
		item.append( header );

		syncHeaderSelectedClass( item );

		expect( header.classList.contains( SELECTED_CLASS ) ).toBe( true );
	} );

	it( 'removes e--selected when the item is closed', () => {
		const item = document.createElement( 'details' );
		item.dataset.element_type = ITEM_ELEMENT_TYPE;
		const header = document.createElement( 'summary' );
		header.dataset.element_type = HEADER_ELEMENT_TYPE;
		header.classList.add( SELECTED_CLASS );
		item.append( header );

		syncHeaderSelectedClass( item );

		expect( header.classList.contains( SELECTED_CLASS ) ).toBe( false );
	} );

	it( 'syncAllHeadersInAccordion ignores nested accordion items', () => {
		const { accordion, outerItem, outerHeader, innerHeader } = buildAccordionDom();
		const { belongsToThisAccordion } = createAccordionScopeHelpers( accordion );

		outerItem.setAttribute( 'open', '' );

		syncAllHeadersInAccordion( accordion, belongsToThisAccordion );

		expect( outerHeader.classList.contains( SELECTED_CLASS ) ).toBe( true );
		expect( innerHeader.classList.contains( SELECTED_CLASS ) ).toBe( false );
	} );
} );
