import { getAnchoredAncestorId, getAnchoredDescendantId, isElementAnchored } from '../link-restriction';

jest.mock( '../sync/get-container', () => {
	return {
		getContainer: jest.fn( ( elementId: string ) => {
			const element = document.querySelector( `[data-id="${ elementId }"]` );
			return element ? { view: { el: element } } : null;
		} ),
	};
} );

const BUTTON_ACTION_LINK_ATTRIBUTE = 'data-action-link';

describe( 'link-restriction', () => {
	beforeEach( () => {
		document.body.innerHTML = '';
	} );

	describe( 'doesElementHaveAnchorTag', () => {
		it( 'should return true if the element has an anchor tag', () => {
			// Arrange
			document.body.innerHTML = `<a data-id="anchor-with-data-id" href="#">Anchor with Data-ID</a>`;

			// Act
			const result = isElementAnchored( 'anchor-with-data-id' );

			// Assert
			expect( result ).toBe( true );
		} );

		it( 'should return true if the element has a child (within the same element) with an anchor tag', () => {
			// Arrange
			document.body.innerHTML = `
				<div data-id="div-with-anchor">
					<a href="#">Anchor Inside Div</a>
				</div>
			`;

			// Act
			const result = isElementAnchored( 'div-with-anchor' );

			// Assert
			expect( result ).toBe( true );
		} );

		it( 'should return false if the element does not have an anchor nor a button tag', () => {
			// Arrange
			document.body.innerHTML = `
				<div data-id="child-div-no-anchor"></div>
			`;

			// Act
			const result = isElementAnchored( 'child-div-no-anchor' );

			// Assert
			expect( result ).toBe( false );
		} );

		it( 'should return true if the element has an button tag', () => {
			// Arrange
			document.body.innerHTML = `<button data-id="button-with-data-id" ${ BUTTON_ACTION_LINK_ATTRIBUTE }="#">Anchor with Data-ID</button>`;

			// Act
			const result = isElementAnchored( 'button-with-data-id' );

			// Assert
			expect( result ).toBe( true );
		} );

		it( 'should return true if the element has a child (within the same element) with an button tag', () => {
			// Arrange
			document.body.innerHTML = `
				<div data-id="div-with-button">
					<button ${ BUTTON_ACTION_LINK_ATTRIBUTE }="#">Button action link Inside Div</button>
				</div>
			`;

			// Act
			const result = isElementAnchored( 'div-with-button' );

			// Assert
			expect( result ).toBe( true );
		} );

		it( 'should return false if the element does not have an anchor tag, but one of its descendants does', () => {
			// Arrange
			document.body.innerHTML = `
				<div data-id="outer-div">
					<div data-id="middle-div">
						<div data-id="inner-div">
							<a href="#">Anchor Inside Inner Div</a>
						</div>
					</div>
				</div>
			`;

			// Act
			const result = isElementAnchored( 'outer-div' );

			// Assert
			expect( result ).toBe( false );
		} );

		it( 'should return false if the element does not exist', () => {
			// Arrange
			document.body.innerHTML = ``;

			// Act
			const result = isElementAnchored( 'non-existent-element' );

			// Assert
			expect( result ).toBe( false );
		} );
	} );

	describe( 'getAncestorWithAnchorTag', () => {
		it( 'should return the element ID of the parent with an anchor tag', () => {
			// Arrange
			document.body.innerHTML = `
                <a data-id="direct-parent-anchor" href="#">
                    <div data-id="child-div">
                        <p>Child Content</p>
                    </div>
                </a>
            `;

			// Act
			const result = getAnchoredAncestorId( 'child-div' );

			// Assert
			expect( result ).toBe( 'direct-parent-anchor' );
		} );

		it( 'should return the element ID of the grandparent with an anchor tag', () => {
			// Arrange
			document.body.innerHTML = `
                <a data-id="grandparent-anchor" href="#">
                    <div data-id="parent-div">
                        <div data-id="grandchild-div">
                            <p>Grandchild Content</p>
                        </div>
                    </div>
                </a>
            `;

			// Act
			const result = getAnchoredAncestorId( 'grandchild-div' );

			// Assert
			expect( result ).toBe( 'grandparent-anchor' );
		} );

		it( 'should return null if no parent with an anchor or button tag exists', () => {
			// Arrange
			document.body.innerHTML = `
                <div data-id="div-no-anchor"></div>
            `;

			// Act
			const result = getAnchoredAncestorId( 'div-no-anchor' );

			// Assert
			expect( result ).toBeNull();
		} );

		it( 'should return null if the current element has anchor tag but not parent', () => {
			// Arrange
			document.body.innerHTML = `
                <a data-id="anchor-with-data-id" href="#">Anchor with Data-ID</a>
            `;

			// Act
			const result = getAnchoredAncestorId( 'anchor-with-data-id' );

			// Assert
			expect( result ).toBeNull();
		} );

		it( 'should return null if the parent has anchor but does not have an element ID', () => {
			// Arrange
			document.body.innerHTML = `
                <div data-id="div-inside-anchor-no-data-id">
                    <a href="#">
                        <p>Content inside div</p>
                    </a>
                </div>
            `;

			// Act
			const result = getAnchoredAncestorId( 'div-inside-anchor-no-data-id' );

			// Assert
			expect( result ).toBeNull();
		} );

		it( 'should return null if the element does not exist', () => {
			// Arrange
			document.body.innerHTML = ``;

			// Act
			const result = getAnchoredAncestorId( 'non-existent-element' );

			// Assert
			expect( result ).toBeNull();
		} );




		it( 'should return the element ID of the parent with an button tag', () => {
			// Arrange
			document.body.innerHTML = `
                <button data-id="direct-parent-button" ${ BUTTON_ACTION_LINK_ATTRIBUTE }="#">
                    <div data-id="child-div">
                        <p>Child Content</p>
                    </div>
                </button>
            `;

			// Act
			const result = getAnchoredAncestorId( 'child-div' );

			// Assert
			expect( result ).toBe( 'direct-parent-button' );
		} );

		it( 'should return the element ID of the grandparent with an button tag', () => {
			// Arrange
			document.body.innerHTML = `
                <button data-id="grandparent-button" ${ BUTTON_ACTION_LINK_ATTRIBUTE }="#">
                    <div data-id="parent-div">
                        <div data-id="grandchild-div">
                            <p>Grandchild Content</p>
                        </div>
                    </div>
                </button>
            `;

			// Act
			const result = getAnchoredAncestorId( 'grandchild-div' );

			// Assert
			expect( result ).toBe( 'grandparent-button' );
		} );

		it( 'should return null if the current element has button tag but not parent', () => {
			// Arrange
			document.body.innerHTML = `
                <a data-id="button-with-data-id" ${ BUTTON_ACTION_LINK_ATTRIBUTE }="#">Button with Data-ID</a>
            `;

			// Act
			const result = getAnchoredAncestorId( 'button-with-data-id' );

			// Assert
			expect( result ).toBeNull();
		} );

		it( 'should return null if the parent has button but does not have an element ID', () => {
			// Arrange
			document.body.innerHTML = `
                <div data-id="div-inside-button-no-data-id">
                    <button ${ BUTTON_ACTION_LINK_ATTRIBUTE }="#">
                        <p>Content inside div</p>
                    </button>
                </div>
            `;

			// Act
			const result = getAnchoredAncestorId( 'div-inside-button-no-data-id' );

			// Assert
			expect( result ).toBeNull();
		} );
	} );

	describe( 'getDescendantWithAnchorTag', () => {
		it( 'should return the element ID of a direct descendant with an anchor tag', () => {
			// Arrange
			document.body.innerHTML = `
                <div data-id="outer-div">
                    <div data-id="middle-div">
                        <div data-id="inner-div">
                            <a href="#">Anchor Inside Inner Div</a>
                        </div>
                    </div>
                </div>
            `;

			// Act
			const result = getAnchoredDescendantId( 'middle-div' );

			// Assert
			expect( result ).toBe( 'inner-div' );
		} );

		it( 'should return the element ID of a descendant with an anchor tag', () => {
			// Arrange
			document.body.innerHTML = `
                <div data-id="outer-div">
                    <div data-id="middle-div">
                        <div data-id="inner-div">
                            <a href="#">Anchor Inside Inner Div</a>
                        </div>
                    </div>
                </div>
            `;

			// Act
			const result = getAnchoredDescendantId( 'outer-div' );

			// Assert
			expect( result ).toBe( 'inner-div' );
		} );

		it( 'should return null if no descendant with an anchor tag exists', () => {
			// Arrange
			document.body.innerHTML = `
                <div data-id="div-no-anchor"></div>
            `;

			// Act
			const result = getAnchoredDescendantId( 'div-no-anchor' );

			// Assert
			expect( result ).toBeNull();
		} );

		it( 'should return null if the element has an anchor tag but no descendants', () => {
			// Arrange
			document.body.innerHTML = `
                <a data-id="anchor-with-data-id" href="#">Anchor with Data-ID</a>
            `;

			// Act
			const result = getAnchoredDescendantId( 'anchor-with-data-id' );

			// Assert
			expect( result ).toBeNull();
		} );

		it( 'should return null if the element child has anchor tag, but its within the same element', () => {
			// Arrange
			document.body.innerHTML = `
                <div data-id="div-with-anchor">
                    <a href="#">Anchor Inside Div</a>
                </div>
            `;

			// Act
			const result = getAnchoredDescendantId( 'div-with-anchor' );

			// Assert
			expect( result ).toBeNull();
		} );

		it( 'should return null if the element does not exist', () => {
			// Arrange
			document.body.innerHTML = ``;

			// Act
			const result = getAnchoredDescendantId( 'non-existent-element' );

			// Assert
			expect( result ).toBeNull();
		} );







		it( 'should return the element ID of a direct descendant with an button tag', () => {
			// Arrange
			document.body.innerHTML = `
                <div data-id="outer-div">
                    <div data-id="middle-div">
                        <div data-id="inner-div">
                            <button ${ BUTTON_ACTION_LINK_ATTRIBUTE }="#">Button Inside Inner Div</button>
                        </div>
                    </div>
                </div>
            `;

			// Act
			const result = getAnchoredDescendantId( 'middle-div' );

			// Assert
			expect( result ).toBe( 'inner-div' );
		} );

		it( 'should return the element ID of a descendant with an button tag', () => {
			// Arrange
			document.body.innerHTML = `
                <div data-id="outer-div">
                    <div data-id="middle-div">
                        <div data-id="inner-div">
                            <button ${ BUTTON_ACTION_LINK_ATTRIBUTE }="#">Button Inside Inner Div</button>
                        </div>
                    </div>
                </div>
            `;

			// Act
			const result = getAnchoredDescendantId( 'outer-div' );

			// Assert
			expect( result ).toBe( 'inner-div' );
		} );

		it( 'should return null if the element has an button tag but no descendants', () => {
			// Arrange
			document.body.innerHTML = `
                <button data-id="button-with-data-id" ${ BUTTON_ACTION_LINK_ATTRIBUTE }="#">Button with Data-ID</button>
            `;

			// Act
			const result = getAnchoredDescendantId( 'button-with-data-id' );

			// Assert
			expect( result ).toBeNull();
		} );

		it( 'should return null if the element child has button tag, but its within the same element', () => {
			// Arrange
			document.body.innerHTML = `
                <div data-id="div-with-button">
                    <button ${ BUTTON_ACTION_LINK_ATTRIBUTE }="#">Button Inside Div</button>
                </div>
            `;

			// Act
			const result = getAnchoredDescendantId( 'div-with-button' );

			// Assert
			expect( result ).toBeNull();
		} );
	} );
} );
