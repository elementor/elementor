import { fireEvent, render, screen } from '@testing-library/react';
import LayoutApp from '../../../../../../../../modules/ai/assets/js/editor/layout-app';
import TestProvider from './mock/TestProvider';
import { elementorCommon, ajaxResponses } from './mock/elementorCommon';
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
			<TestProvider>
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
			</TestProvider>,
		);

		await sleep( 1000 );
	} );

	afterEach( () => {
		global.elementorCommon = undefined;
		ajaxResponses.ai_generate_layout = [];
	} );

	test( 'Should generate unique ids', async () => {
		const wrapper = await screen.getByTestId( 'root' );

		fireEvent.change( wrapper.querySelector( 'textarea' ), {
			target: { value: 'test' },
		} );

		fireEvent.click( screen.getByText( /^generate/i ) );

		expect( onGenerate ).toHaveBeenCalled();

		// Have ids
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

	it( 'should have unique session id on first generate', async () => {
		const wrapper = await screen.getByTestId( 'root' );

		fireEvent.change( wrapper.querySelector( 'textarea' ), {
			target: { value: 'test' },
		} );

		fireEvent.click( screen.getByText( /^generate/i ) );

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
			expect( ids.length ).toEqual( REQUESTS_COUNT );
			const uniqueIds = new Set( ids );
			expect( uniqueIds.size ).toEqual( expectedUnique );
		}
	} );

	it( 'should have unique same sessionId, generateID, but different batchId on regenerate', async () => {
		const wrapper = await screen.getByTestId( 'root' );

		fireEvent.change( wrapper.querySelector( 'textarea' ), {
			target: { value: 'test' },
		} );

		fireEvent.click( screen.getByText( /^generate/i ) );

		// Wait for next tick
		await sleep( 10 );

		fireEvent.click( screen.getByText( /^regenerate/i ) );

		await sleep( 10 );

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
			expect( ids.length ).toEqual( REQUESTS_COUNT * 2 );
			const uniqueIds = new Set( ids );
			await expect( uniqueIds.size ).toEqual( expectedUnique );
		}

		const editButton = wrapper.querySelector( '[aria-label="Edit prompt"] button' );
		fireEvent.click( editButton );

		// 'should have unique same sessionId, but different generateID, batchId on a new prompt', async () => {
		fireEvent.change( wrapper.querySelector( 'textarea' ), {
			target: { value: 'test2' },
		} );

		fireEvent.click( screen.getByText( /^generate/i ) );

		// Wait for next tick
		await sleep( 10 );

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
			expect( ids.length ).toEqual( REQUESTS_COUNT * 3 );
			const uniqueIds = new Set( ids );
			expect( uniqueIds.size ).toEqual( expectedUnique );
		}
	} );
} );
