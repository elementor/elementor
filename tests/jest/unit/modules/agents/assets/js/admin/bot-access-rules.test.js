import {
	addBot,
	isColumnAllBlocked,
	isRowAllBlocked,
	setColumn,
	setRow,
	toSettingsBots,
	togglePermission,
} from 'elementor/modules/agents/assets/js/admin/components/bot-access/bot-access-rules';

const createBot = ( token, search, aiInput, aiTrain ) => ( { token, search, aiInput, aiTrain } );

describe( 'bot access rules', () => {
	it( 'treats a row as blocked only when every permission is off', () => {
		// Arrange
		const blockedBot = createBot( 'GPTBot', false, false, false );
		const mixedBot = createBot( 'ClaudeBot', false, true, false );

		// Act & Assert
		expect( isRowAllBlocked( blockedBot ) ).toBe( true );
		expect( isRowAllBlocked( mixedBot ) ).toBe( false );
	} );

	it( 'treats a column as blocked only when no bot has the permission', () => {
		// Arrange
		const bots = [ createBot( 'GPTBot', true, false, false ), createBot( 'ClaudeBot', false, false, false ) ];

		// Act & Assert
		expect( isColumnAllBlocked( bots, 'search' ) ).toBe( false );
		expect( isColumnAllBlocked( bots, 'aiInput' ) ).toBe( true );
	} );

	it( 'sets a whole column without touching other permissions', () => {
		// Arrange
		const bots = [ createBot( 'GPTBot', true, true, false ), createBot( 'ClaudeBot', false, true, true ) ];

		// Act
		const result = setColumn( bots, 'aiInput', false );

		// Assert
		expect( result ).toEqual( [ createBot( 'GPTBot', true, false, false ), createBot( 'ClaudeBot', false, false, true ) ] );
	} );

	it( 'sets every permission of a single row', () => {
		// Arrange
		const bots = [ createBot( 'GPTBot', true, false, false ), createBot( 'ClaudeBot', false, true, false ) ];

		// Act
		const result = setRow( bots, 'ClaudeBot', true );

		// Assert
		expect( result ).toEqual( [ createBot( 'GPTBot', true, false, false ), createBot( 'ClaudeBot', true, true, true ) ] );
	} );

	it( 'toggles a single permission of a single row', () => {
		// Arrange
		const bots = [ createBot( 'GPTBot', true, true, false ) ];

		// Act
		const result = togglePermission( bots, 'GPTBot', 'aiTrain' );

		// Assert
		expect( result ).toEqual( [ createBot( 'GPTBot', true, true, true ) ] );
	} );

	it( 'adds a bot with default permissions in catalog order and ignores duplicates', () => {
		// Arrange
		const catalogTokens = [ 'GPTBot', 'ClaudeBot', 'CCBot' ];
		const bots = [ createBot( 'GPTBot', true, true, false ), createBot( 'CCBot', false, false, false ) ];

		// Act
		const added = addBot( bots, 'ClaudeBot', catalogTokens );
		const duplicated = addBot( added, 'ClaudeBot', catalogTokens );

		// Assert
		expect( added.map( ( bot ) => bot.token ) ).toEqual( catalogTokens );
		expect( added[ 1 ] ).toEqual( createBot( 'ClaudeBot', true, true, false ) );
		expect( duplicated ).toBe( added );
	} );

	it( 'maps rows to the settings payload keyed by token', () => {
		// Arrange
		const bots = [ createBot( 'GPTBot', true, false, true ) ];

		// Act
		const result = toSettingsBots( bots );

		// Assert
		expect( result ).toEqual( { GPTBot: { search: true, ai_input: false, ai_train: true } } );
	} );
} );
