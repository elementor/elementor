import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import LayoutApp from '../../../../../../../../modules/ai/assets/js/editor/layout-app';
import TestThemeProvider from './mock/test-theme-provider';
import { elementorCommon, ajaxResponses } from './mock/elementor-common';
import { SCREENSHOT_LIGHT_1 } from './mock/data';

const REQUESTS_PER_BATCH = 3;
const onGenerate = jest.fn();
const onData = () => {
	return SCREENSHOT_LIGHT_1;
};
const sleep = ( ms ) => new Promise( ( resolve ) => setTimeout( resolve, ms ) );
const defaultExpectedUniqueIds = {
	editorSessionId: 1,
	sessionId: 1,
	generateId: 1,
	batchId: 1,
	requestId: REQUESTS_PER_BATCH,
};

const assertUniqueIds = ( expected ) => {
	for ( const [ id, expectedUnique ] of Object.entries( expected ) ) {
		const ids = ajaxResponses.ai_generate_layout.map( ( { request } ) => request.data.ids[ id ] );
		const uniqueIds = new Set( ids );

		// Assert
		expect( ids.length ).toEqual( expected.requestId );
		expect( uniqueIds.size ).toEqual( expectedUnique );
	}
};

describe( 'LayoutApp', () => {
	beforeEach( async () => {
		global.elementorCommon = elementorCommon;

		global.ResizeObserver =
			global.ResizeObserver ||
			jest.fn().mockImplementation( () => ( {
				disconnect: jest.fn(),
				observe: jest.fn(),
				unobserve: jest.fn(),
			} ) );

		render(
			<TestThemeProvider>
				<LayoutApp
					onClose={ () => {} }
					onConnect={ () => {} }
					onData={ onData }
					onInsert={ () => {} }
					onSelect={ () => {} }
					onGenerate={ onGenerate }
					mode={ 'layout' }
					attachmentsTypes={ {} }
					hasPro={ true }
					editorSessionId={ 'EDITOR_SESSION_ID' }
				/>
			</TestThemeProvider>,
		);

		await sleep( 1000 );
	} );

	afterEach( () => {
		global.elementorCommon = undefined;
		ajaxResponses.ai_generate_layout = [];
	} );

	test( 'Should add unique ids to the request', async () => {
		// Arrange
		const wrapper = await screen.getByTestId( 'root' );

		// Act
		fireEvent.change( wrapper.querySelector( 'textarea' ), {
			target: { value: 'test' },
		} );

		fireEvent.click( screen.getByText( /^generate/i ) );

		// Assert
		expect( onGenerate ).toHaveBeenCalled();

		expect( ajaxResponses.ai_generate_layout[ 0 ].request.data ).toMatchObject( {
			attachments: [],
			ids: {
				generateId: expect.stringMatching( /^generate-[a-z0-9]{7}$/ ),
				batchId: expect.stringMatching( /^batch-[a-z0-9]{7}$/ ),
				requestId: expect.stringMatching( /^request-[a-z0-9]{7}$/ ),
				sessionId: expect.stringMatching( /^session-[a-z0-9]{7}$/ ),
				editorSessionId: 'EDITOR_SESSION_ID',
			},
			prevGeneratedIds: [],
			prompt: 'test',
			variationType: 0,
		} );
	} );

	it( 'Should have unique ids on first generate', async () => {
		// Arrange
		const wrapper = await screen.getByTestId( 'root' );

		// Act
		fireEvent.change( wrapper.querySelector( 'textarea' ), {
			target: { value: 'test' },
		} );

		fireEvent.click( screen.getByText( /^generate/i ) );

		// Assert
		assertUniqueIds( defaultExpectedUniqueIds );
	} );

	it( 'Should keep the same sessionId and generateID on regenerate, but discard other ids', async () => {
		// Arrange
		const wrapper = await screen.getByTestId( 'root' );

		fireEvent.change( wrapper.querySelector( 'textarea' ), {
			target: { value: 'test' },
		} );

		fireEvent.click( screen.getByText( /^generate/i ) );

		// Wait for next tick
		await waitFor( () => Promise.resolve() );

		// Act
		fireEvent.click( screen.getByText( /^regenerate/i ) );

		await waitFor( () => Promise.resolve() );

		// Assert
		const expected = {
			... defaultExpectedUniqueIds,
			batchId: 2,
			requestId: REQUESTS_PER_BATCH * 2,
		};

		assertUniqueIds( expected );

		// Arrange - another generate with a new prompt
		const editButton = wrapper.querySelector( '[aria-label="Edit prompt"] button' );
		fireEvent.click( editButton );

		// Act - Should keep only the sessionId, on a new prompt.
		fireEvent.change( wrapper.querySelector( 'textarea' ), {
			target: { value: 'test2' },
		} );

		fireEvent.click( screen.getByText( /^generate/i ) );

		// Wait for next tick
		await waitFor( () => Promise.resolve() );

		// Assert
		const expected2 = {
			... defaultExpectedUniqueIds,
			generateId: 2,
			batchId: 3,
			requestId: REQUESTS_PER_BATCH * 3,
		};

		assertUniqueIds( expected2 );
	} );
} );
