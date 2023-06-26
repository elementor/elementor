import { changeScrollStatus, setHorizontalTitleScrollValues, setHorizontalScrollAlignment } from 'elementor/assets/dev/js/frontend/utils/flex-horizontal-scroll';

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

// Mock elementorCommon
global.elementorCommon = { config: { isRTL: false } };

describe( 'Test horizontal scroll functions', () => {
	test( 'changeScrollStatus', () => {
		const element = new HTMLElement();
		const event = { type: 'mousedown', pageX: 100 };
		changeScrollStatus( element, event );
		expect( element.classList.add ).toHaveBeenCalledWith( 'e-scroll' );
		expect( element.dataset.pageX ).toBe( 100 );

		const event2 = { type: 'mouseup' };
		changeScrollStatus( element, event2 );
		expect( element.classList.remove ).toHaveBeenCalledWith( 'e-scroll', 'e-scroll-active' );
		expect( element.dataset.pageX ).toBe( '' );
	} );

	test( 'setHorizontalTitleScrollValues', () => {
		const element = new HTMLElement();
		element.classList.contains.mockReturnValueOnce( true );
		const event = { pageX: 100, preventDefault: jest.fn() };
		setHorizontalTitleScrollValues( element, 'enable', event );
		expect( event.preventDefault ).toHaveBeenCalled();
	} );

	test( 'setHorizontalScrollAlignment', () => {
		const element = new HTMLElement();
		setHorizontalScrollAlignment( { element, direction: 'start', justifyCSSVariable: '--align', horizontalScrollStatus: 'enable' } );
		expect( element.scrollLeft ).toBe( 0 );
	} );
} );
