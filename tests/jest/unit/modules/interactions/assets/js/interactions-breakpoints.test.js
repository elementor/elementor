'use strict';

import {
	getActiveBreakpoint,
	initBreakpoints,
} from 'elementor/modules/interactions/assets/js/interactions-breakpoints.js';

const ADVANCE_TIME_BY = 120;

const BREAKPOINTS_CONFIG = {
	mobile: { value: 768, direction: 'max' },
	mobile_extra: { value: 880, direction: 'max' },
	tablet: { value: 1024, direction: 'max' },
	tablet_extra: { value: 1200, direction: 'max' },
	laptop: { value: 1366, direction: 'max' },
	widescreen: { value: 2440, direction: 'min' },
};

function setBreakpointsConfig() {
	window.ElementorInteractionsConfig = {
		breakpoints: BREAKPOINTS_CONFIG,
	};
}

describe( 'interactions-breakpoints', () => {
	beforeEach( () => {
		jest.resetModules();
		setBreakpointsConfig();
		Object.defineProperty( window, 'innerWidth', {
			value: 1024,
			writable: true,
			configurable: true,
		} );
	} );

	describe( 'filtering (matchBreakpoint via getActiveBreakpoint)', () => {
		it( 'detects mobile breakpoint', () => {
			window.innerWidth = 600;
			initBreakpoints();
			expect( getActiveBreakpoint() ).toBe( 'mobile' );
		} );

		it( 'detects mobile_extra breakpoint', () => {
			window.innerWidth = 780;
			initBreakpoints();
			expect( getActiveBreakpoint() ).toBe( 'mobile_extra' );
		} );

		it( 'detects tablet breakpoint', () => {
			window.innerWidth = 900;
			initBreakpoints();
			expect( getActiveBreakpoint() ).toBe( 'tablet' );
		} );

		it( 'detects laptop breakpoint', () => {
			window.innerWidth = 1366;
			initBreakpoints();
			expect( getActiveBreakpoint() ).toBe( 'laptop' );
		} );

		it( 'detects desktop when width is between laptop and widescreen', () => {
			window.innerWidth = 1600;
			initBreakpoints();
			expect( getActiveBreakpoint() ).toBe( 'desktop' );
		} );

		it( 'detects widescreen breakpoint', () => {
			window.innerWidth = 2440;
			initBreakpoints();
			expect( getActiveBreakpoint() ).toBe( 'widescreen' );
		} );
	} );

	describe( 'resize triggers onChange', () => {
		it( 'calls onChange with new breakpoint when resize crosses breakpoint after debounce', () => {
			jest.useFakeTimers();
			const onChange = jest.fn();
			window.innerWidth = 1000;
			initBreakpoints( { onChange } );
			expect( getActiveBreakpoint() ).toBe( 'tablet' );

			window.innerWidth = 800;
			window.dispatchEvent( new Event( 'resize' ) );
			expect( onChange ).not.toHaveBeenCalled();

			jest.advanceTimersByTime( ADVANCE_TIME_BY );
			expect( onChange ).toHaveBeenCalledTimes( 1 );
			expect( onChange ).toHaveBeenCalledWith( 'mobile_extra' );
			expect( getActiveBreakpoint() ).toBe( 'mobile_extra' );

			jest.useRealTimers();
		} );

		it( 'does not call onChange when resize does not change breakpoint', () => {
			jest.useFakeTimers();
			const onChange = jest.fn();
			window.innerWidth = 1000;
			initBreakpoints( { onChange } );
			window.innerWidth = 1024;
			window.dispatchEvent( new Event( 'resize' ) );
			jest.advanceTimersByTime( ADVANCE_TIME_BY );
			expect( onChange ).not.toHaveBeenCalled();
			jest.useRealTimers();
		} );
	} );
} );
