// Mock HTMLElement
global.HTMLElement = class {
	constructor() {
		this.classList = {
			add: jest.fn(),
			remove: jest.fn(),
			contains: jest.fn(),
		};
		this.dataset = {};
		this.scrollWidth = 100;
		this.clientWidth = 50;
		this.scrollLeft = 0;
		this.style = {
			setProperty: jest.fn(),
		};
		this.children = [ { offsetWidth: 20 }, { offsetWidth: 20 }, { offsetWidth: 20 } ];
	}
};

// Mock getComputedStyle
window.getComputedStyle = jest.fn().mockReturnValue( { gap: 10 } );

// Mock elementorFrontend
global.elementorFrontend = { config: { is_rtl: false } };

describe( 'Test horizontal scroll functions', () => {
	test( 'changeScrollStatus', () => {
		const element = new HTMLElement();
		const event = { type: 'mousedown', pageX: 100 };
		window.FlexHorizontalScroll.changeScrollStatus( element, event );
		expect( element.classList.add ).toHaveBeenCalledWith( 'e-scroll' );
		expect( element.dataset.pageX ).toBe( 100 );

		const event2 = { type: 'mouseup' };
		window.FlexHorizontalScroll.changeScrollStatus( element, event2 );
		expect( element.classList.remove ).toHaveBeenCalledWith( 'e-scroll', 'e-scroll-active' );
		expect( element.dataset.pageX ).toBe( '' );
	} );

	test( 'setHorizontalTitleScrollValues', () => {
		const element = new HTMLElement();
		element.classList.contains.mockReturnValueOnce( true );
		const event = { pageX: 100, preventDefault: jest.fn() };
		window.FlexHorizontalScroll.setHorizontalTitleScrollValues( element, 'enable', event );
		expect( event.preventDefault ).toHaveBeenCalled();
	} );

	test( 'setHorizontalScrollAlignment', () => {
		const element = new HTMLElement();
		window.FlexHorizontalScroll.setHorizontalScrollAlignment( { element, direction: 'start', justifyCSSVariable: '--align', horizontalScrollStatus: 'enable' } );
		expect( element.scrollLeft ).toBe( 0 );
	} );
} );
