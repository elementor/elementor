import { mockLocation, runHook } from 'elementor/tests/jest/unit/assets/dev/js/editor/components/documents/hooks/utils';

describe( `$e.internal( 'editor/documents/attach-preview' ) -- SelectActiveElement`, () => {
	let SelectActiveElement;
	const scrollingElement = { scrollTop: 0 };
	const elementNode = {
		isConnected: true,
		getBoundingClientRect: jest.fn( () => ( {
			top: 1400,
			bottom: 1600,
			height: 200,
		} ) ),
		ownerDocument: {
			defaultView: {
				innerHeight: 800,
				document: {
					scrollingElement,
				},
			},
		},
	};
	const container = {
		id: 'abc1234',
		view: {
			el: elementNode,
			$el: [ elementNode ],
			select: jest.fn(),
		},
	};

	beforeEach( async () => {
		jest.useFakeTimers();

		global.$e = {
			modules: {
				hookUI: {
					After: class {},
				},
			},
			run: jest.fn(),
		};

		scrollingElement.scrollTop = 0;

		global.elementor = {
			documents: {
				getCurrentId: jest.fn( () => 1 ),
			},
			getContainer: jest.fn( () => container ),
		};

		mockLocation();

		const HookClass = ( await import( 'elementor-editor/components/documents/hooks/ui/attach-preview/select-active-element' ) ).SelectActiveElement;

		SelectActiveElement = new HookClass();
	} );

	afterEach( () => {
		jest.clearAllMocks();
		jest.useRealTimers();

		SelectActiveElement.constructor.calledOnce = false;
	} );

	it( 'Should not run when there is no `active-element` query param', async () => {
		// Arrange.
		window.location = new URL( 'http://localhost/' );

		// Act.
		await runHook( SelectActiveElement );

		// Assert.
		expect( $e.run ).not.toHaveBeenCalled();
	} );

	it( 'Should select the element from `active-element` and scroll it into view', async () => {
		// Arrange.
		window.location = new URL( 'http://localhost/?active-element=abc1234' );

		// Act.
		await runHook( SelectActiveElement );
		jest.advanceTimersByTime( 1000 );

		// Assert.
		expect( elementor.getContainer ).toHaveBeenCalledWith( 'abc1234' );
		expect( $e.run ).toHaveBeenCalledWith( 'document/elements/select', { container } );
		expect( scrollingElement.scrollTop ).toBe( 1100 );
		expect( window.location.href ).toBe( 'http://localhost/?active-element=abc1234' );
	} );

	it( 'Should scroll to the visible child when the element box is empty', async () => {
		// Arrange.
		const visibleChild = {
			getBoundingClientRect: jest.fn( () => ( {
				top: 1742,
				bottom: 2239,
				height: 497,
			} ) ),
		};
		elementNode.getBoundingClientRect.mockReturnValue( { top: 0, bottom: 0, height: 0 } );
		elementNode.querySelectorAll = jest.fn( () => [ visibleChild ] );
		window.location = new URL( 'http://localhost/?active-element=abc1234' );

		// Act.
		await runHook( SelectActiveElement );
		jest.advanceTimersByTime( 1000 );

		// Assert.
		expect( scrollingElement.scrollTop ).toBe( 1590.5 );

		elementNode.getBoundingClientRect.mockReturnValue( { top: 1400, bottom: 1600, height: 200 } );
		delete elementNode.querySelectorAll;
	} );

	it( 'Should scroll on a later attempt when the element has no box yet', async () => {
		// Arrange.
		elementNode.getBoundingClientRect
			.mockReturnValueOnce( { top: 0, bottom: 0, height: 0 } )
			.mockReturnValue( { top: 1742, bottom: 2239, height: 497 } );
		window.location = new URL( 'http://localhost/?active-element=abc1234' );

		// Act.
		await runHook( SelectActiveElement );
		jest.advanceTimersByTime( 1000 );

		// Assert.
		expect( scrollingElement.scrollTop ).toBe( 0 );

		jest.advanceTimersByTime( 400 );
		expect( scrollingElement.scrollTop ).toBe( 1590.5 );

		elementNode.getBoundingClientRect.mockReturnValue( { top: 1400, bottom: 1600, height: 200 } );
	} );

	it( 'Should run only once', async () => {
		// Arrange.
		window.location = new URL( 'http://localhost/?active-element=abc1234' );

		// Act.
		await runHook( SelectActiveElement );
		await runHook( SelectActiveElement );
		jest.advanceTimersByTime( 1000 );

		// Assert.
		expect( $e.run ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'Should wait until the `active-document` is the current document', async () => {
		// Arrange.
		window.location = new URL( 'http://localhost/?active-document=2&active-element=abc1234' );
		elementor.documents.getCurrentId.mockReturnValue( 1 );

		// Act.
		await runHook( SelectActiveElement );

		elementor.documents.getCurrentId.mockReturnValue( 2 );
		await runHook( SelectActiveElement );
		jest.advanceTimersByTime( 1000 );

		// Assert.
		expect( $e.run ).toHaveBeenCalledTimes( 1 );
		expect( $e.run ).toHaveBeenCalledWith( 'document/elements/select', { container } );
	} );

	it( 'Should remove `active-element` when the element cannot be found', async () => {
		// Arrange.
		window.location = new URL( 'http://localhost/?active-element=missing1&other-param=test' );
		elementor.getContainer.mockReturnValue( null );

		// Act.
		await runHook( SelectActiveElement );

		// Assert.
		expect( $e.run ).not.toHaveBeenCalled();
		expect( window.location.href ).toBe( 'http://localhost/?other-param=test' );
	} );

	it( 'Should remove `active-element` when the id is not an element id', async () => {
		// Arrange.
		window.location = new URL( 'http://localhost/?active-element=.elementor-widget' );

		// Act.
		await runHook( SelectActiveElement );

		// Assert.
		expect( elementor.getContainer ).not.toHaveBeenCalled();
		expect( window.location.href ).toBe( 'http://localhost/' );
	} );
} );
