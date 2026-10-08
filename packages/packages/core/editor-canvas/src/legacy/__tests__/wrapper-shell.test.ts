import { parseShell, syncAttributes } from '../wrapper-shell';

describe( 'parseShell', () => {
	it( 'parses a simple element with one attribute', () => {
		// Arrange.
		const html = '<div class="foo">inner text</div>';

		// Act.
		const result = parseShell( html );

		// Assert.
		expect( result ).toEqual( {
			tag: 'div',
			attrs: { class: 'foo' },
			inner: 'inner text',
		} );
	} );

	it( 'parses multiple attributes', () => {
		// Arrange.
		const html = '<div id="5" class="bar baz" data-x="y"><!-- placeholder --></div>';

		// Act.
		const result = parseShell( html );

		// Assert.
		expect( result ).toEqual( {
			tag: 'div',
			attrs: { id: '5', class: 'bar baz', 'data-x': 'y' },
			inner: '<!-- placeholder -->',
		} );
	} );

	it( 'parses an element with no attributes', () => {
		// Arrange.
		const html = '<span>text</span>';

		// Act.
		const result = parseShell( html );

		// Assert.
		expect( result ).toEqual( { tag: 'span', attrs: {}, inner: 'text' } );
	} );

	it( 'parses an element with a quoted value containing spaces', () => {
		// Arrange.
		const html = '<p class="foo bar">content</p>';

		// Act.
		const result = parseShell( html );

		// Assert.
		expect( result?.attrs.class ).toBe( 'foo bar' );
	} );

	it( 'handles attribute values containing > character (escaped in quotes)', () => {
		// Arrange — the > is inside double quotes so the open-tag scanner must not stop there.
		const html = '<div data-val="a>b">inner</div>';

		// Act.
		const result = parseShell( html );

		// Assert.
		expect( result?.tag ).toBe( 'div' );
		expect( result?.attrs[ 'data-val' ] ).toBe( 'a>b' );
	} );

	it( 'returns null for plain text input', () => {
		expect( parseShell( 'just text' ) ).toBeNull();
	} );

	it( 'returns null when there is no closing tag', () => {
		expect( parseShell( '<div class="x">no closing tag' ) ).toBeNull();
	} );

	it( 'returns null when the closing tag does not match', () => {
		expect( parseShell( '<div>inner</span>' ) ).toBeNull();
	} );

	it( 'returns null when there is trailing content after the closing tag', () => {
		expect( parseShell( '<div>inner</div>  extra' ) ).toBeNull();
	} );

	it( 'trims leading/trailing whitespace before parsing', () => {
		// Arrange.
		const html = '  <p>text</p>  ';

		// Act.
		const result = parseShell( html );

		// Assert.
		expect( result?.tag ).toBe( 'p' );
	} );

	it( 'captures multiline inner content', () => {
		// Arrange.
		const html = '<div>\n  <span>child</span>\n</div>';

		// Act.
		const result = parseShell( html );

		// Assert.
		expect( result?.tag ).toBe( 'div' );
		expect( result?.inner ).toBe( '\n  <span>child</span>\n' );
	} );
} );

describe( 'syncAttributes', () => {
	const makeEl = ( attrs: Record< string, string > ): HTMLElement => {
		const el = document.createElement( 'div' );
		Object.entries( attrs ).forEach( ( [ k, v ] ) => el.setAttribute( k, v ) );
		return el;
	};

	it( 'adds a new attribute', () => {
		// Arrange.
		const el = makeEl( {} );

		// Act.
		syncAttributes( el, { id: '5' } );

		// Assert.
		expect( el.getAttribute( 'id' ) ).toBe( '5' );
	} );

	it( 'updates an existing attribute', () => {
		// Arrange.
		const el = makeEl( { class: 'old' } );

		// Act.
		syncAttributes( el, { class: 'new' } );

		// Assert.
		expect( el.getAttribute( 'class' ) ).toBe( 'new' );
	} );

	it( 'removes an attribute absent from next', () => {
		// Arrange.
		const el = makeEl( { 'data-old': 'x', class: 'keep' } );

		// Act.
		syncAttributes( el, { class: 'keep' } );

		// Assert.
		expect( el.hasAttribute( 'data-old' ) ).toBe( false );
		expect( el.getAttribute( 'class' ) ).toBe( 'keep' );
	} );

	it( 'does not call setAttribute when the value is already correct', () => {
		// Arrange.
		const el = makeEl( { id: '5' } );
		const spy = jest.spyOn( el, 'setAttribute' );

		// Act.
		syncAttributes( el, { id: '5' } );

		// Assert.
		expect( spy ).not.toHaveBeenCalled();
	} );

	it( 'does not touch child elements', () => {
		// Arrange.
		const el = makeEl( {} );
		const child = document.createElement( 'span' );
		child.textContent = 'child text';
		el.appendChild( child );

		// Act.
		syncAttributes( el, { class: 'new' } );

		// Assert.
		expect( el.firstChild ).toBe( child );
		expect( child.textContent ).toBe( 'child text' );
	} );
} );
