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
		// Arrange.
		const expectedSettings = {
			selectors: {
				playingCardContainer: '.e-playing-cards',
				playingCardItem: '.e-playing-cards-item',
			},
			classes: {
				playingCardBack: 'e-playing-cards-item-back_suit',
			},
		};

		// Act.
		const defaultSettings = handler.getDefaultSettings();

		// Assert.
		expect( defaultSettings ).toEqual( expectedSettings );
	} );

	it( 'should bind click event', () => {
		// Arrange.
		jest.spyOn( handler, 'onInit' ).mockImplementation( () => {
			handler.elements = handler.getDefaultElements();
		} );

		findElementMock.mockReturnValue( {
			on: jest.fn(),
			off: jest.fn(),
		} );

		// Act.
		handler.onInit();
		handler.bindEvents();

		// Assert.
		expect( findElementMock().on ).toHaveBeenCalledWith( 'click', handler.clickHandler );
	} );

	it( 'should toggle back/face class for element', () => {
		// Arrange.
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

		// Act.
		handler.onClick( event );

		// Assert.
		expect( toggleMock ).toHaveBeenCalledWith( handler.getSettings().classes.playingCardBack );
	} );
} );
