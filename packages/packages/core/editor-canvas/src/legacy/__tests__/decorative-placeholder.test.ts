import { applyDecorativePlaceholder } from '../decorative-placeholder';

describe( 'applyDecorativePlaceholder', () => {
	const createElement = () => {
		const element = document.createElement( 'div' );
		const emptyView = document.createElement( 'div' );

		emptyView.className = 'elementor-empty-view';
		emptyView.style.minHeight = '120px';
		emptyView.style.minWidth = '100px';
		element.appendChild( emptyView );

		return { element, emptyView };
	};

	it( 'should drop the empty placeholder minimum size when the element is decorative', () => {
		// Arrange
		const { element, emptyView } = createElement();

		// Act
		applyDecorativePlaceholder( element, { decorative: true } );

		// Assert
		expect( emptyView.style.minHeight ).toBe( '0' );
		expect( emptyView.style.minWidth ).toBe( '0' );
	} );

	it.each( [
		[ 'decorative is off', { decorative: false } ],
		[ 'decorative is missing', { title: 'Hero' } ],
		[ 'editor settings are missing', undefined ],
	] )( 'should clear an inline placeholder size when %s', ( _, editorSettings ) => {
		// Arrange
		const { element, emptyView } = createElement();
		emptyView.style.minHeight = '0';
		emptyView.style.minWidth = '0';

		// Act
		applyDecorativePlaceholder( element, editorSettings );

		// Assert
		expect( emptyView.style.minHeight ).toBe( '' );
		expect( emptyView.style.minWidth ).toBe( '' );
	} );

	it( 'should ignore a nested empty view', () => {
		// Arrange
		const element = document.createElement( 'div' );
		const child = document.createElement( 'div' );
		const emptyView = document.createElement( 'div' );

		emptyView.className = 'elementor-empty-view';
		child.appendChild( emptyView );
		element.appendChild( child );

		// Act
		applyDecorativePlaceholder( element, { decorative: true } );

		// Assert
		expect( emptyView.style.minHeight ).toBe( '' );
		expect( emptyView.style.minWidth ).toBe( '' );
	} );
} );
