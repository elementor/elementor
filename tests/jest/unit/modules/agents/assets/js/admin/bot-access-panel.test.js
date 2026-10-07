/* eslint-disable react/prop-types, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { BotAccessPanel } from 'elementor/modules/agents/assets/js/admin/components/bot-access/bot-access-panel';
import { useBotAccessSettings } from 'elementor/modules/agents/assets/js/admin/hooks/use-bot-access-settings';

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text ) => text,
	sprintf: ( format, ...args ) => args.reduce( ( text, arg, index ) => text
		.replace( `%${ index + 1 }$s`, arg )
		.replace( '%s', arg ), format ),
} ) );

jest.mock( 'elementor/modules/agents/assets/js/admin/api', () => ( {
	saveAgentReadySettings: jest.fn( () => Promise.resolve() ),
} ) );

jest.mock( '@elementor/icons', () => ( {
	AcademyIcon: () => <span />,
	AlertCircleIcon: () => <span />,
	BanIcon: () => <span />,
	ChevronDownIcon: () => <span />,
	CircleCheckIcon: () => <span />,
	ContentIcon: () => <span />,
	SearchIcon: () => <span />,
	XIcon: () => <span />,
	ZoomIcon: () => <span />,
} ) );

jest.mock( '@elementor/ui/Avatar', () => ( { children } ) => <span>{ children }</span> );
jest.mock( '@elementor/ui/Box', () => ( { children } ) => <div>{ children }</div> );
jest.mock( '@elementor/ui/Button', () => ( { children, onClick, disabled } ) => (
	<button type="button" onClick={ onClick } disabled={ disabled }>{ children }</button>
) );
jest.mock( '@elementor/ui/Chip', () => ( { label } ) => <span>{ label }</span> );
jest.mock( '@elementor/ui/CloseButton', () => ( { onClick, 'aria-label': label } ) => (
	<button type="button" onClick={ onClick } aria-label={ label } />
) );
jest.mock( '@elementor/ui/Divider', () => () => <hr /> );
jest.mock( '@elementor/ui/IconButton', () => ( { children, onClick, disabled, 'aria-label': label } ) => (
	<button type="button" onClick={ onClick } disabled={ disabled } aria-label={ label }>{ children }</button>
) );
jest.mock( '@elementor/ui/InputAdornment', () => ( { children } ) => <span>{ children }</span> );
jest.mock( '@elementor/ui/MenuItem', () => ( { children, onClick } ) => (
	<li role="option" aria-selected={ false } onClick={ onClick }>{ children }</li>
) );
jest.mock( '@elementor/ui/MenuList', () => ( { children } ) => <ul role="listbox">{ children }</ul> );
jest.mock( '@elementor/ui/Popover', () => ( { children, open } ) => ( open ? <div>{ children }</div> : null ) );
jest.mock( '@elementor/ui/Stack', () => require( 'react' ).forwardRef( ( { children, onClick, onKeyDown, role, 'aria-label': label }, ref ) => (
	<div ref={ ref } role={ role } aria-label={ label } onClick={ onClick } onKeyDown={ onKeyDown }>{ children }</div>
) ) );
jest.mock( '@elementor/ui/Switch', () => ( { checked, disabled, onChange, inputProps } ) => (
	<input type="checkbox" role="switch" checked={ checked } disabled={ disabled } onChange={ onChange } aria-label={ inputProps[ 'aria-label' ] } />
) );
jest.mock( '@elementor/ui/TextField', () => ( { value, onChange, inputProps } ) => (
	<input value={ value } onChange={ onChange } aria-label={ inputProps[ 'aria-label' ] } />
) );
jest.mock( '@elementor/ui/Typography', () => ( { children } ) => <span>{ children }</span> );

import { saveAgentReadySettings } from 'elementor/modules/agents/assets/js/admin/api';

const catalog = [
	{ token: 'GPTBot', name: 'GPTBot', vendor: 'OpenAI', logoUrl: '' },
	{ token: 'ClaudeBot', name: 'ClaudeBot', vendor: 'Anthropic', logoUrl: '' },
	{ token: 'CCBot', name: 'CCBot', vendor: 'Common Crawl', logoUrl: '' },
];

const createConfig = ( overrides = {} ) => ( {
	enabled: true,
	hasPhysicalFile: false,
	bots: [
		{ token: 'GPTBot', search: true, aiInput: true, aiTrain: false },
		{ token: 'ClaudeBot', search: false, aiInput: false, aiTrain: false },
	],
	catalog,
	...overrides,
} );

const PanelWithSettings = ( { config } ) => <BotAccessPanel settings={ useBotAccessSettings( config ) } />;

describe( 'BotAccessPanel', () => {
	beforeEach( () => {
		saveAgentReadySettings.mockClear();
	} );

	it( 'derives card and row actions from the current permissions', () => {
		// Arrange & Act
		render( <PanelWithSettings config={ createConfig() } /> );

		// Assert
		expect( screen.getAllByRole( 'button', { name: 'Block all' } ) ).toHaveLength( 2 );
		expect( screen.getAllByRole( 'button', { name: 'Enable all' } ) ).toHaveLength( 1 );
		expect( screen.getByRole( 'button', { name: 'Block GPTBot' } ) ).toBeTruthy();
		expect( screen.getByRole( 'button', { name: 'Enable' } ) ).toBeTruthy();
	} );

	it( 'saves the blocked column for every managed bot', async () => {
		// Arrange
		render( <PanelWithSettings config={ createConfig() } /> );

		// Act
		fireEvent.click( screen.getAllByRole( 'button', { name: 'Block all' } )[ 0 ] );

		// Assert
		expect( saveAgentReadySettings ).toHaveBeenCalledWith( {
			bot_access_control: {
				enabled: true,
				bots: {
					GPTBot: { search: false, ai_input: true, ai_train: false },
					ClaudeBot: { search: false, ai_input: false, ai_train: false },
				},
			},
		} );
		await waitFor( () => {
			expect( screen.getAllByRole( 'switch' )[ 0 ].disabled ).toBe( false );
		} );
	} );

	it( 'rolls back the row and keeps its action when saving fails', async () => {
		// Arrange
		saveAgentReadySettings.mockRejectedValueOnce( null );
		render( <PanelWithSettings config={ createConfig() } /> );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Enable' } ) );

		// Assert
		await waitFor( () => {
			expect( screen.getByRole( 'switch', { name: 'Search for ClaudeBot' } ).checked ).toBe( false );
			expect( screen.getByRole( 'switch', { name: 'Search for ClaudeBot' } ).disabled ).toBe( false );
		} );
		expect( screen.getByRole( 'button', { name: 'Enable' } ) ).toBeTruthy();
	} );

	it( 'adds an unmanaged bot from the search menu with default permissions', async () => {
		// Arrange
		render( <PanelWithSettings config={ createConfig() } /> );

		// Act
		fireEvent.click( screen.getByRole( 'combobox', { name: 'Select bot' } ) );
		fireEvent.change( screen.getByRole( 'textbox', { name: 'Search bots' } ), { target: { value: 'crawl' } } );
		fireEvent.click( screen.getByRole( 'option' ) );
		fireEvent.click( screen.getByRole( 'button', { name: 'Add' } ) );

		// Assert
		expect( saveAgentReadySettings ).toHaveBeenCalledWith( {
			bot_access_control: {
				enabled: true,
				bots: {
					GPTBot: { search: true, ai_input: true, ai_train: false },
					ClaudeBot: { search: false, ai_input: false, ai_train: false },
					CCBot: { search: true, ai_input: true, ai_train: false },
				},
			},
		} );
		await waitFor( () => {
			expect( screen.getByRole( 'switch', { name: 'Search for CCBot' } ).disabled ).toBe( false );
		} );
	} );

	it( 'disables every control when the module is off', () => {
		// Arrange & Act
		render( <PanelWithSettings config={ createConfig( { enabled: false } ) } /> );

		// Assert
		screen.getAllByRole( 'switch' ).forEach( ( toggle ) => expect( toggle.disabled ).toBe( true ) );
		expect( screen.getByRole( 'button', { name: 'Add' } ).disabled ).toBe( true );
		expect( screen.getAllByRole( 'button', { name: 'Block all' } )[ 0 ].disabled ).toBe( true );
	} );
} );
