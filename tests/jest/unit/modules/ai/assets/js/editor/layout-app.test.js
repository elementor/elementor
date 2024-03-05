import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import LayoutApp from '../../../../../../../../modules/ai/assets/js/editor/layout-app';
import TestThemeProvider from './mock/test-theme-provider';
import { ajaxResponses } from './mock/elementor-common';
import { SCREENSHOT_LIGHT_1 } from './mock/data';
import {
	addPromptAndGenerate,
	assertUniqueIds,
	clickEditPromptButton,
	mockEditorEnvironment,
	sleep,
	waitForNextTick,
} from './test-utils';

const REQUESTS_PER_BATCH = 3;

const onGenerate = jest.fn();

const onData = () => {
	return SCREENSHOT_LIGHT_1;
};

const defaultExpectedUniqueIds = {
	editorSessionId: 1,
	sessionId: 1,
	generateId: 1,
	batchId: 1,
	requestId: REQUESTS_PER_BATCH,
};

const App = () => (
	<TestThemeProvider>
		<LayoutApp
			onClose={ () => {
			} }
			onConnect={ () => {
			} }
			onData={ onData }
			onInsert={ () => {
			} }
			onSelect={ () => {
			} }
			onGenerate={ onGenerate }
			mode={ 'layout' }
			attachmentsTypes={ {} }
			hasPro={ true }
		/>
	</TestThemeProvider>
);

describe( 'LayoutApp', () => {
	let rerender;
	beforeEach( async () => {
		mockEditorEnvironment();

		const result = render( <App /> );

		rerender = result.rerender;

		await sleep( 1000 );
	} );

	afterEach( () => {
		ajaxResponses.ai_generate_layout = [];
		global.elementorCommon = undefined;
		rerender = undefined;
	} );

	it( 'Should add unique ids to the request', async () => {
		// Act
		await addPromptAndGenerate( 'test' );

		// Assert
		expect( onGenerate ).toHaveBeenCalled();

		expect( ajaxResponses.ai_generate_layout[ 0 ].request.data ).toMatchObject( {
			attachments: [],
			ids: {
				generateId: expect.stringMatching( /^generate-[a-z0-9]{7}$/ ),
				batchId: expect.stringMatching( /^batch-[a-z0-9]{7}$/ ),
				requestId: expect.stringMatching( /^request-[a-z0-9]{7}$/ ),
				sessionId: expect.stringMatching( /^session-[a-z0-9]{7}$/ ),
				editorSessionId: expect.stringMatching( /^editor-session-[a-z0-9]{7}$/ ),
			},
			prevGeneratedIds: [],
			prompt: 'test',
			variationType: 0,
		} );

		assertUniqueIds( defaultExpectedUniqueIds );
	} );

	it( 'Should keep the same sessionId and generateID on regenerate, but discard other ids', async () => {
		// Arrange
		await addPromptAndGenerate( 'test' );

		// Wait for next tick
		await waitFor( () => Promise.resolve() );

		// Act
		fireEvent.click( screen.getByText( /^regenerate/i ) );

		await waitFor( () => Promise.resolve() );

		// Assert
		assertUniqueIds( {
			...defaultExpectedUniqueIds,
			batchId: 2,
			requestId: REQUESTS_PER_BATCH * 2,
		} );

		// Arrange - another generate with a new prompt
		await clickEditPromptButton();

		// Act - Should keep only the sessionId, on a new prompt.
		await addPromptAndGenerate( 'test2' );

		await waitForNextTick();

		// Assert
		assertUniqueIds( {
			...defaultExpectedUniqueIds,
			generateId: 2,
			batchId: 3,
			requestId: REQUESTS_PER_BATCH * 3,
		} );
	} );

	it( 'Should create a new sessionId on rerender component', async () => {
		// Arrange
		await addPromptAndGenerate( 'test' );

		// Act - rerender and generate again
		rerender( <App /> );

		await sleep( 1000 );

		// Arrange - another generate with a new prompt
		await clickEditPromptButton();

		await act( async () => {
			await addPromptAndGenerate( 'test' );
		} );

		// Assert
		assertUniqueIds( {
			...defaultExpectedUniqueIds,
			sessionId: 2,
			generateId: 2,
			batchId: 2,
			requestId: REQUESTS_PER_BATCH * 2,
		} );
	} );
} );
