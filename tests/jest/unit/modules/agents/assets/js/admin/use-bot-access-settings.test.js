import { act, renderHook } from '@testing-library/react';

import { saveAgentReadySettings } from 'elementor/modules/agents/assets/js/admin/api';
import { useBotAccessSettings } from 'elementor/modules/agents/assets/js/admin/hooks/use-bot-access-settings';

jest.mock( 'elementor/modules/agents/assets/js/admin/api', () => ( {
	saveAgentReadySettings: jest.fn( () => Promise.resolve() ),
} ) );

const GPT_BOT = 'GPTBot';
const CLAUDE_BOT = 'ClaudeBot';

const initialState = {
	enabled: true,
	hasPhysicalFile: false,
	bots: [ { token: GPT_BOT, search: true, aiInput: true, aiTrain: false } ],
	catalog: [
		{ token: GPT_BOT, name: GPT_BOT, vendor: 'OpenAI' },
		{ token: CLAUDE_BOT, name: CLAUDE_BOT, vendor: 'Anthropic' },
	],
};

describe( 'useBotAccessSettings analytics', () => {
	let dispatchEvent;

	beforeEach( () => {
		dispatchEvent = jest.fn();
		window.elementorCommon = { eventsManager: { dispatchEvent } };
	} );

	afterEach( () => {
		delete window.elementorCommon;
	} );

	it( 'tracks a row level change as a bulk change for all permission types', async () => {
		// Arrange
		const { result } = renderHook( () => useBotAccessSettings( initialState ) );

		// Act
		await act( () => result.current.setRow( GPT_BOT, false ) );

		// Assert
		expect( dispatchEvent ).toHaveBeenCalledWith( 'agent_readiness_bot_permission_changed', expect.objectContaining( {
			scope: 'bulk',
			crawler_id: GPT_BOT,
			permission_type: 'all',
			interaction_result: 'blocked',
		} ) );
	} );

	it( 'tracks ai training as ai_training while still saving it as ai_train', async () => {
		// Arrange
		const { result } = renderHook( () => useBotAccessSettings( initialState ) );

		// Act
		await act( () => result.current.togglePermission( GPT_BOT, 'aiTrain' ) );

		// Assert
		expect( dispatchEvent ).toHaveBeenCalledWith( 'agent_readiness_bot_permission_changed', expect.objectContaining( {
			permission_type: 'ai_training',
			interaction_result: 'allowed',
		} ) );
		expect( saveAgentReadySettings ).toHaveBeenCalledWith( {
			bot_access_control: expect.objectContaining( {
				bots: { [ GPT_BOT ]: expect.objectContaining( { ai_train: true } ) },
			} ),
		} );
	} );

	it( 'tracks an added crawler with its token', async () => {
		// Arrange
		const { result } = renderHook( () => useBotAccessSettings( initialState ) );

		// Act
		await act( () => result.current.addBot( CLAUDE_BOT ) );

		// Assert
		expect( dispatchEvent ).toHaveBeenCalledWith( 'agent_readiness_custom_crawler_added', expect.objectContaining( {
			crawler_token: CLAUDE_BOT,
			interaction_result: 'success',
		} ) );
	} );
} );
