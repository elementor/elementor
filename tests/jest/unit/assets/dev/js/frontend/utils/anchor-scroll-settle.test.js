import {
	ANCHOR_SCROLL_CORRECTION_THRESHOLD,
	ANCHOR_SCROLL_SETTLE_MS,
	settleAnchorScrollPosition,
} from 'elementor-frontend-utils/anchor-scroll-settle';

describe( 'settleAnchorScrollPosition', () => {
	test( 'corrects scroll when target offset moves during settle window', () => {
		let targetScrollTop = 100;
		let currentScrollTop = 0;
		const applyScrollTop = jest.fn( ( value ) => {
			currentScrollTop = value;
		} );
		const frames = [];
		let nowMs = 0;

		settleAnchorScrollPosition( {
			getTargetScrollTop: () => targetScrollTop,
			getCurrentScrollTop: () => currentScrollTop,
			applyScrollTop,
			settleDurationMs: ANCHOR_SCROLL_SETTLE_MS,
			now: () => nowMs,
			requestFrame: ( callback ) => {
				frames.push( callback );
			},
		} );

		frames[ 0 ]();
		expect( applyScrollTop ).toHaveBeenLastCalledWith( 100 );

		targetScrollTop = 450;
		nowMs = 200;
		frames[ 1 ]();
		expect( applyScrollTop ).toHaveBeenLastCalledWith( 450 );

		nowMs = ANCHOR_SCROLL_SETTLE_MS + 1;
		frames[ 2 ]();

		expect( currentScrollTop ).toBe( 450 );
	} );

	test( 'does not apply corrections below threshold', () => {
		const applyScrollTop = jest.fn();
		const frames = [];

		settleAnchorScrollPosition( {
			getTargetScrollTop: () => 200,
			getCurrentScrollTop: () => 200 + ANCHOR_SCROLL_CORRECTION_THRESHOLD,
			applyScrollTop,
			settleDurationMs: 50,
			now: () => 0,
			requestFrame: ( callback ) => {
				frames.push( callback );
			},
		} );

		frames[ 0 ]();

		expect( applyScrollTop ).not.toHaveBeenCalled();
	} );
} );
