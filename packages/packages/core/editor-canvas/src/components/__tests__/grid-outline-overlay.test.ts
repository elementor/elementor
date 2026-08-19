import { countGridTracks, resolveGridOutlineHost } from '../grid-outline-overlay';

describe( 'resolveGridOutlineHost', () => {
	it( 'returns the root when it is a grid container', () => {
		const root = document.createElement( 'div' );
		root.style.display = 'grid';
		document.body.append( root );

		expect( resolveGridOutlineHost( root ) ).toBe( root );

		root.remove();
	} );

	it( 'returns the root when display is inline-grid', () => {
		const root = document.createElement( 'div' );
		root.style.display = 'inline-grid';
		document.body.append( root );

		expect( resolveGridOutlineHost( root ) ).toBe( root );

		root.remove();
	} );

	it( 'returns .e-con-inner when the root is not grid but the direct inner is', () => {
		const root = document.createElement( 'div' );
		const inner = document.createElement( 'div' );
		inner.className = 'e-con-inner';
		inner.style.display = 'grid';
		root.style.display = 'block';
		root.append( inner );
		document.body.append( root );

		expect( resolveGridOutlineHost( root ) ).toBe( inner );

		root.remove();
	} );

	it( 'returns null when neither root nor direct inner is grid', () => {
		const root = document.createElement( 'div' );
		const inner = document.createElement( 'div' );
		inner.className = 'e-con-inner';
		root.append( inner );
		document.body.append( root );

		expect( resolveGridOutlineHost( root ) ).toBe( null );

		root.remove();
	} );

	it( 'returns root for e-grid preview when opts.isEGrid and data-element_type is e-grid', () => {
		const root = document.createElement( 'div' );
		root.setAttribute( 'data-element_type', 'e-grid' );
		root.style.display = 'block';
		document.body.append( root );

		expect( resolveGridOutlineHost( root, { isEGrid: true } ) ).toBe( root );

		root.remove();
	} );

	it( 'returns root for e-grid preview when opts.isEGrid and e-grid-base class', () => {
		const root = document.createElement( 'div' );
		root.className = 'e-grid-base';
		root.style.display = 'block';
		document.body.append( root );

		expect( resolveGridOutlineHost( root, { isEGrid: true } ) ).toBe( root );

		root.remove();
	} );
} );

describe( 'countGridTracks', () => {
	it( 'returns 1 for empty or none', () => {
		expect( countGridTracks( '' ) ).toBe( 1 );
		expect( countGridTracks( 'none' ) ).toBe( 1 );
	} );

	it( 'counts space-separated tracks', () => {
		expect( countGridTracks( '1fr 1fr 1fr' ) ).toBe( 3 );
		expect( countGridTracks( '80px 80px' ) ).toBe( 2 );
	} );

	it( 'does not split inside parentheses', () => {
		expect( countGridTracks( 'minmax(0, 1fr) minmax(0, 1fr)' ) ).toBe( 2 );
	} );

	it( 'counts repeat(N, …) as N tracks when it is a single token', () => {
		expect( countGridTracks( 'repeat(3, minmax(0, 1fr))' ) ).toBe( 3 );
		expect( countGridTracks( 'repeat(2, 1fr)' ) ).toBe( 2 );
	} );
} );
