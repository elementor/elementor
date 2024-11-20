describe( 'PlayingCardsHandler', () => {
	let handler;
	const getSettingsMock = jest.fn();
	const findElementMock = jest.fn();

	beforeEach( async () => {
		jest.resetModules();

		global.elementorModules = {
			frontend: {
				handlers: {
					Base: class {
						getSettings() {
							return getSettingsMock();
						}
						findElement() {
							return findElementMock();
						}
						onInit() {
							return jest.fn();
						}
					},
				},
			},
		};

		const PlayingCardHandlerClass = ( await import( 'elementor/modules/playing-cards/assets/js/frontend/handlers/playing-cards-handler' ) ).default;

		handler = new PlayingCardHandlerClass();

		getSettingsMock.mockReturnValue( handler.getDefaultSettings() );
	} );

	it( 'should return default settings', () => {
		// Arrange: Define the expected default settings
		const expectedSettings = {
			selectors: {
				playingCardContainer: '.e-playing-cards',
				playingCardItem: '.e-playing-cards-item',
			},
			classes: {
				playingCardBack: 'e-playing-cards-item-back_suit',
			},
		};

		// Act: Get the default settings from the handler
		const defaultSettings = handler.getDefaultSettings();

		// Assert: Verify that the default settings match the expected settings
		expect( defaultSettings ).toEqual( expectedSettings );
	} );

	it( 'should bind click event', () => {
		// Arrange: Mock the onInit method and findElement method
		jest.spyOn( handler, 'onInit' ).mockImplementation( () => {
			handler.elements = handler.getDefaultElements();
		} );

		findElementMock.mockReturnValue( {
			on: jest.fn(),
			off: jest.fn(),
		} );

		// Act: Initialize the handler and bind events
		handler.onInit();
		handler.bindEvents();

		// Assert: Verify that the click event is bound to the clickHandler
		expect( findElementMock().on ).toHaveBeenCalledWith( 'click', handler.clickHandler );
	} );

	it( 'should toggle back/face class for element', () => {
		// Arrange: Mock the classList and closest methods
		const toggleMock = jest.fn();
		const classListMock = {
			toggle: toggleMock,
		};
		const closestMock = jest.fn().mockImplementation( () => {
			return {
				classList: classListMock,
			};
		} );
		const target = {
			closest: closestMock,
		};
		const event = {
			target,
			preventDefault: jest.fn(),
		};

		// Act: Simulate a click event on the handler
		handler.onClick( event );

		// Assert: Verify that the class is toggled on the clicked card
		expect( toggleMock ).toHaveBeenCalledWith( handler.getSettings().classes.playingCardBack );
	} );
} );
