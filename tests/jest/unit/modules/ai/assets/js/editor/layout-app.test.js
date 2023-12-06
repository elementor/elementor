import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import LayoutApp from '../../../../../../../../modules/ai/assets/js/editor/layout-app';
import TestThemeProvider from './mock/test-theme-provider';
import { elementorCommon, ajaxResponses } from './mock/elementor-common';
import { SCREENSHOT_LIGHT_1 } from './mock/data';

const onGenerate = jest.fn();
const onData = () => {
	return SCREENSHOT_LIGHT_1;
};
const sleep = ( ms ) => new Promise( ( resolve ) => setTimeout( resolve, ms ) );

describe( 'LayoutApp', () => {
	const REQUESTS_COUNT = 3;

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
					hasPro={ true }
					sessionId={ 'SESSION_ID' }
					mode={ 'layout' }
					attachmentsTypes={ {} }
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
				sessionId: 'SESSION_ID',
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
		const expected = [
			{
				id: 'sessionId',
				expectedUnique: 1,
			},
			{
				id: 'generateId',
				expectedUnique: 1,
			},
			{
				id: 'batchId',
				expectedUnique: 1,
			},
			{
				id: 'requestId',
				expectedUnique: REQUESTS_COUNT,
			},
		];

		for ( let i = 0; i < expected.length; i++ ) {
			const { id, expectedUnique } = expected[ i ];
			const ids = ajaxResponses.ai_generate_layout.map( ( { request } ) => request.data.ids[ id ] );
			const uniqueIds = new Set( ids );

			// Assert
			expect( ids.length ).toEqual( REQUESTS_COUNT );
			expect( uniqueIds.size ).toEqual( expectedUnique );
		}
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
		const expected = [
			{
				id: 'sessionId',
				expectedUnique: 1,
			},
			{
				id: 'generateId',
				expectedUnique: 1,
			},
			{
				id: 'batchId',
				expectedUnique: 2,
			},
			{
				id: 'requestId',
				expectedUnique: REQUESTS_COUNT * 2,
			},
		];

		for ( let i = 0; i < expected.length; i++ ) {
			const { id, expectedUnique } = expected[ i ];
			const ids = ajaxResponses.ai_generate_layout.map( ( { request } ) => request.data.ids[ id ] );
			const uniqueIds = new Set( ids );

			expect( ids.length ).toEqual( REQUESTS_COUNT * 2 );
			expect( uniqueIds.size ).toEqual( expectedUnique );
		}

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
		const expected2 = [
			{
				id: 'sessionId',
				expectedUnique: 1,
			},
			{
				id: 'generateId',
				expectedUnique: 2,
			},
			{
				id: 'batchId',
				expectedUnique: 3,
			},
			{
				id: 'requestId',
				expectedUnique: REQUESTS_COUNT * 3,
			},
		];

		for ( let i = 0; i < expected2.length; i++ ) {
			const { id, expectedUnique } = expected2[ i ];
			const ids = ajaxResponses.ai_generate_layout.map( ( { request } ) => request.data.ids[ id ] );
			const uniqueIds = new Set( ids );

			expect( ids.length ).toEqual( REQUESTS_COUNT * 3 );
			expect( uniqueIds.size ).toEqual( expectedUnique );
		}
	} );
} );
