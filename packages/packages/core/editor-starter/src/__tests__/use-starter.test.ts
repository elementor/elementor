import { act, renderHook } from '@testing-library/react';
import apiFetch from '@wordpress/api-fetch';

import { useStarter } from '../hooks/use-starter';
import * as utils from '../utils';

jest.mock( '@wordpress/api-fetch' );
jest.mock( '../utils' );
jest.mock( '@elementor/editor-v1-adapters', () => ( {
	__privateRunCommand: jest.fn(),
} ) );

const mockApiFetch = apiFetch as jest.MockedFunction< typeof apiFetch >;
const mockGetStarterConfig = utils.getStarterConfig as jest.MockedFunction< typeof utils.getStarterConfig >;
const mockDeleteStarterConfig = utils.deleteStarterConfig as jest.MockedFunction< typeof utils.deleteStarterConfig >;

describe( 'useStarter hook', () => {
	const mockConfig = {
		restPath: 'test-rest-path',
		aiPlannerUrl: 'https://planner.test',
		kitLibraryUrl: 'https://kit-library.test',
	};

	let result: ReturnType< typeof renderHook< ReturnType< typeof useStarter >, unknown > >[ 'result' ];

	beforeEach( () => {
		jest.clearAllMocks();
		mockGetStarterConfig.mockReturnValue( mockConfig );
		document.body.innerHTML = '<div id="elementor-editor-wrapper"></div>';
		window.open = jest.fn();

		( { result } = renderHook( () => useStarter() ) );

		act( () => {
			window.dispatchEvent(
				new CustomEvent( 'elementor/commands/run/after', {
					detail: { command: 'editor/documents/attach-preview' },
				} )
			);
		} );
	} );

	it( 'should initialize with config when editor/documents/attach-preview is triggered', () => {
		expect( result.current.config ).toEqual( mockConfig );
		expect( mockApiFetch ).toHaveBeenCalledWith(
			expect.objectContaining( {
				path: mockConfig.restPath,
				method: 'POST',
				data: { starter_dismissed: true },
			} )
		);
	} );

	it( 'should call deleteStarterConfig and set isDismissing when dismiss is called', () => {
		act( () => {
			result.current.dismiss();
		} );

		expect( result.current.isDismissing ).toBe( true );
		expect( mockDeleteStarterConfig ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should open AI Planner in a new tab', () => {
		act( () => {
			result.current.openAiPlanner();
		} );

		expect( window.open ).toHaveBeenCalledWith( mockConfig.aiPlannerUrl, '_blank', 'noopener,noreferrer' );
	} );

	it( 'should open Kit Library in a new tab with onboarding referrer', () => {
		act( () => {
			result.current.openTemplatesLibrary();
		} );

		const expectedUrl = new URL( mockConfig.kitLibraryUrl );
		expectedUrl.searchParams.set( 'referrer', 'onboarding' );

		expect( window.open ).toHaveBeenCalledWith( expectedUrl.toString(), '_blank', 'noopener,noreferrer' );
	} );
} );
