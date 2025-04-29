import { convertSizeToFrString, findChildWithAnchor, findParentWithAnchor } from 'elementor-editor-utils/helpers';

describe( 'convertSizeToFrString', () => {
	test( 'Size 1 to 1fr', () => {
		expect( convertSizeToFrString( 1 ) ).toBe( '1fr' );
	} );

	test( 'Size 3 to 1fr 1fr 1fr', () => {
		expect( convertSizeToFrString( 3 ) ).toBe( '1fr 1fr 1fr' );
	} );

	test( 'Return original value if not a number was passed', () => {
		expect( convertSizeToFrString( '3' ) ).toBe( '3' );
	} );
} );

describe( 'findChildWithAnchor', () => {
	beforeEach( () => {
		document.body.innerHTML = '';
	} );

	test( 'should return an anchor element when it exists', () => {
		document.body.innerHTML = `
            <div id="test-container">
                <a>Link 1</a>
                <a href="#">Link 2</a>
            </div>
        `;

		const parentElement = document.getElementById( 'test-container' );
		const anchorElement = findChildWithAnchor( parentElement );

		expect( anchorElement ).not.toBeNull();
		expect( anchorElement.textContent ).toBe( 'Link 1' );
	} );

	test( 'should return null when no anchor element is found', () => {
		document.body.innerHTML = `<div id="empty-container"></div>`;

		const parentElement = document.getElementById( 'empty-container' );
		const anchorElement = findChildWithAnchor( parentElement );

		expect( anchorElement ).toBeNull();
	} );
} );

describe( 'findParentWithAnchor', () => {
	beforeEach( () => {
		document.body.innerHTML = '';
	} );

	test( 'should return the closest a element with an href attribute when it exists', () => {
		document.body.innerHTML = `
            <a href="#" id="anchor-element">
                <div id="test-container">
                	<div id="nested-element"></div>
				</div>
            </a>
        `;

		const nestedElement = document.getElementById( 'nested-element' );
		const anchorElement = findParentWithAnchor( nestedElement );

		expect( anchorElement ).not.toBeNull();
		expect( anchorElement.id ).toBe( 'anchor-element' );
	} );

	test( 'should return null when no parent a element with href is found', () => {
		document.body.innerHTML = `
            <div id="no-anchor">
                <span>Some text</span>
				<a href="#">Not part of the tree</a>
                <div id="nested-no-anchor"></div>
            </div>
        `;

		const nestedElement = document.getElementById( 'nested-no-anchor' );
		const anchorElement = findParentWithAnchor( nestedElement );

		expect( anchorElement ).toBeNull();
	} );
} );
