import { buildIframeUrl } from '../build-iframe-url';
import { PlannerSteps } from '../planner-steps';

describe( 'buildIframeUrl', () => {
	it( 'returns base URL when session is null', () => {
		const base = 'https://planner.elementor.com/chat.html';

		expect( buildIframeUrl( base, null ) ).toBe( base );
	} );

	it( 'returns base URL when sessionId is empty', () => {
		const base = 'https://planner.elementor.com/chat.html';

		expect( buildIframeUrl( base, { sessionId: '', step: PlannerSteps.WIREFRAMES } ) ).toBe( base );
	} );

	it( 'builds wireframe deep link from chat.html base', () => {
		const result = buildIframeUrl( 'https://planner.elementor.com/chat.html', {
			sessionId: '78c84365-954a-4c32-bfb8-81fe36465fb8',
			step: PlannerSteps.WIREFRAMES,
		} );

		expect( result ).toBe(
			'https://planner.elementor.com/wireframe.html?session=78c84365-954a-4c32-bfb8-81fe36465fb8'
		);
	} );

	it( 'builds sitemap deep link for SITEMAP step', () => {
		const result = buildIframeUrl( 'https://planner.elementor.com/chat.html', {
			sessionId: 'abc',
			step: PlannerSteps.SITEMAP,
		} );

		expect( result ).toBe( 'https://planner.elementor.com/sitemap.html?session=abc' );
	} );

	it( 'builds creation-status deep link for DEPLOYING step', () => {
		const result = buildIframeUrl( 'https://planner.elementor.com/chat.html', {
			sessionId: 'abc',
			step: PlannerSteps.DEPLOYING,
		} );

		expect( result ).toBe( 'https://planner.elementor.com/creation-status.html?session=abc' );
	} );

	it( 'replaces page segment without .html suffix', () => {
		const result = buildIframeUrl( 'https://planner.elementor.com/website-planner/chat', {
			sessionId: 'abc',
			step: PlannerSteps.WIREFRAMES,
		} );

		expect( result ).toBe( 'https://planner.elementor.com/website-planner/wireframe?session=abc' );
	} );

	it( 'strips existing query params from base URL', () => {
		const result = buildIframeUrl( 'https://planner.elementor.com/chat.html?foo=bar', {
			sessionId: 'abc',
			step: PlannerSteps.CHAT,
		} );

		expect( result ).toBe( 'https://planner.elementor.com/chat.html?session=abc' );
	} );
} );
