jest.mock( 'elementor/assets/dev/js/frontend/handlers/base-swiper', () => class {} );

describe( 'CarouselHandlerBase', () => {
	let carousel;

	const createArrowKeydownEvent = ( code ) => ( { originalEvent: { code } } );

	beforeEach( async () => {
		global.elementorFrontend = {
			config: { is_rtl: false },
		};

		const CarouselHandlerBase = ( await import( 'elementor/assets/dev/js/frontend/handlers/base-carousel' ) ).default;

		carousel = new CarouselHandlerBase();
	} );

	afterEach( () => {
		delete global.elementorFrontend;
	} );

	describe( 'when swiper is not initialized (single slide)', () => {
		it( 'should not throw on focus', () => {
			// Arrange
			carousel.swiper = undefined;

			// Act
			const focus = () => carousel.onFocusDisableAutoplay();

			// Assert
			expect( focus ).not.toThrow();
		} );

		it( 'should not throw on inline arrow keydown', () => {
			// Arrange
			carousel.swiper = undefined;

			// Act
			const keydown = () => carousel.onDirectionArrowKeydown( createArrowKeydownEvent( 'ArrowRight' ) );

			// Assert
			expect( keydown ).not.toThrow();
		} );
	} );

	describe( 'when swiper is initialized', () => {
		beforeEach( () => {
			carousel.swiper = {
				autoplay: { stop: jest.fn() },
				slideNext: jest.fn(),
				slidePrev: jest.fn(),
			};
		} );

		it( 'should stop autoplay on focus', () => {
			// Act
			carousel.onFocusDisableAutoplay();

			// Assert
			expect( carousel.swiper.autoplay.stop ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should slide next on ArrowRight', () => {
			// Act
			carousel.onDirectionArrowKeydown( createArrowKeydownEvent( 'ArrowRight' ) );

			// Assert
			expect( carousel.swiper.slideNext ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should slide prev on ArrowLeft', () => {
			// Act
			carousel.onDirectionArrowKeydown( createArrowKeydownEvent( 'ArrowLeft' ) );

			// Assert
			expect( carousel.swiper.slidePrev ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
