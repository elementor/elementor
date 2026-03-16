import { renderHook, act } from '@testing-library/react';
import { useStarter } from '../use-starter';
import * as utils from '../utils';
import apiFetch from '@wordpress/api-fetch';

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

	beforeEach( () => {
		jest.clearAllMocks();
		mockGetStarterConfig.mockReturnValue( mockConfig );
		setupEditorWrapper();
		window.open = jest.fn();
	} );

	const setupEditorWrapper = () => {
		document.body.innerHTML = '<div id="elementor-editor-wrapper"></div>';
	};

	const triggerAttachPreviewEvent = () => {
		act( () => {
			const event = new CustomEvent( 'elementor/commands/run/after', {
				detail: { command: 'editor/documents/attach-preview' },
			} );
			window.dispatchEvent( event );
		} );
	};

	it( 'should initialize with config when editor/documents/attach-preview is triggered', () => {
		const { result } = renderHook( () => useStarter() );

		triggerAttachPreviewEvent();

		expect( result.current.config ).toEqual( mockConfig );
		expect( mockApiFetch ).toHaveBeenCalledWith( expect.objectContaining( {
			path: mockConfig.restPath,
			method: 'POST',
			data: { starter_dismissed: true },
		} ) );
	} );

	it( 'should call deleteStarterConfig and set isDismissing when dismiss is called', () => {
		const { result } = renderHook( () => useStarter() );

		triggerAttachPreviewEvent();

		act( () => {
			result.current.dismiss();
		} );

		expect( result.current.isDismissing ).toBe( true );
		expect( mockDeleteStarterConfig ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should open AI Planner in a new tab', () => {
		const { result } = renderHook( () => useStarter() );

		triggerAttachPreviewEvent();

		act( () => {
			result.current.openAiPlanner();
		} );

		expect( window.open ).toHaveBeenCalledWith(
			mockConfig.aiPlannerUrl,
			'_blank',
			'noopener,noreferrer'
		);
	} );

	it( 'should open Kit Library in a new tab with onboarding referrer', () => {
		const { result } = renderHook( () => useStarter() );

		triggerAttachPreviewEvent();

		act( () => {
			result.current.openTemplatesLibrary();
		} );

		expect( window.open ).toHaveBeenCalledWith(
			mockConfig.kitLibraryUrl + '/?referrer=onboarding',
			'_blank',
			'noopener,noreferrer'
		);
	} );
} );
