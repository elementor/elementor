import { Alpine } from '@alpinejs/csp';
import { init } from '../init';

jest.mock( '@alpinejs/csp', () => ( {
	Alpine: {
		start: jest.fn(),
	},
} ) );

function setReadyState( readyState: DocumentReadyState ) {
	Object.defineProperty( document, 'readyState', {
		value: readyState,
		configurable: true,
	} );
}

describe( 'init', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'starts Alpine immediately when the document has already finished loading', () => {
		// Arrange.
		setReadyState( 'complete' );

		// Act.
		init();

		// Assert.
		expect( Alpine.start ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'starts Alpine immediately when the document is interactive', () => {
		// Arrange.
		setReadyState( 'interactive' );

		// Act.
		init();

		// Assert.
		expect( Alpine.start ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'waits for `DOMContentLoaded` when the document is still loading', () => {
		// Arrange.
		setReadyState( 'loading' );

		// Act.
		init();

		// Assert.
		expect( Alpine.start ).not.toHaveBeenCalled();

		// Act.
		document.dispatchEvent( new Event( 'DOMContentLoaded' ) );

		// Assert.
		expect( Alpine.start ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'never starts Alpine twice if `DOMContentLoaded` fires again', () => {
		// Arrange.
		setReadyState( 'loading' );
		init();

		// Act.
		document.dispatchEvent( new Event( 'DOMContentLoaded' ) );
		document.dispatchEvent( new Event( 'DOMContentLoaded' ) );

		// Assert.
		expect( Alpine.start ).toHaveBeenCalledTimes( 1 );
	} );
} );
