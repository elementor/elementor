import * as React from 'react';
import { createMockElementType, renderWithTheme } from 'test-utils';
import { useHasContentOnlyAccess } from '@elementor/editor-current-user';
import { getWidgetsCache } from '@elementor/editor-elements';
import { fireEvent, screen } from '@testing-library/react';

import { ElementProvider } from '../../contexts/element-context';
import { useDefaultPanelSettings } from '../../hooks/use-default-panel-settings';
import { useStateByElement } from '../../hooks/use-state-by-element';
import { ContentOnlyInfotip } from '../content-only-infotip';
import { EditingPanelTabs } from '../editing-panel-tabs';

jest.mock( '@elementor/editor-current-user' );
jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	getWidgetsCache: jest.fn(),
} ) );
jest.mock( '../../hooks/use-default-panel-settings' );
jest.mock( '../../hooks/use-state-by-element' );
jest.mock( '../interactions-tab', () => ( {
	InteractionsTab: () => <div>Interactions tab panel</div>,
} ) );
jest.mock( '../settings-tab', () => ( {
	SettingsTab: () => <div>Settings tab panel</div>,
} ) );
jest.mock( '../style-tab', () => ( {
	StyleTab: () => <div>Style tab panel</div>,
	stickyHeaderStyles: {},
} ) );

const ELEMENT_ID = 'test-element-id';
const ELEMENT_TYPE = 'atomic-heading';
const PROMOTED_ELEMENT_TYPE = 'promoted-widget';
const LEARN_MORE_URL = 'https://go.elementor.com/content-only-access-infotip';
const TAB_GENERAL = 'General';
const TAB_STYLE = 'Style';
const TAB_INTERACTIONS = 'Interactions';
const SETTINGS_TAB_PANEL_TEXT = 'Settings tab panel';
const STYLE_TAB_PANEL_TEXT = 'Style tab panel';
const INTERACTIONS_TAB_PANEL_TEXT = 'Interactions tab panel';
const INFOTIP_ROOT_SELECTOR = '[class*="MuiInfotip-root"]';

const renderEditingPanelTabs = ( elementTypeKey: string = ELEMENT_TYPE ) => {
	const element = { id: ELEMENT_ID, type: elementTypeKey };
	const elementType = createMockElementType( { key: elementTypeKey, title: 'Heading' } );

	return renderWithTheme(
		<ElementProvider element={ element } elementType={ elementType } settings={ {} }>
			<EditingPanelTabs />
		</ElementProvider>
	);
};

const getTabByName = ( name: string ) => screen.getByRole( 'tab', { name } );

const expectTabEnabled = ( tab: HTMLElement ) => {
	expect( tab ).toBeEnabled();
	expect( tab ).not.toHaveClass( 'Mui-disabled' );
};

const expectTabDisabled = ( tab: HTMLElement ) => {
	expect( tab ).toBeDisabled();
	expect( tab ).toHaveClass( 'Mui-disabled' );
};

const hasInfotipTrigger = ( tab: HTMLElement ) => {
	// eslint-disable-next-line testing-library/no-node-access
	return Boolean( tab.querySelector( INFOTIP_ROOT_SELECTOR ) );
};

describe( '<EditingPanelTabs />', () => {
	beforeEach( () => {
		jest.mocked( useHasContentOnlyAccess ).mockReturnValue( false );
		jest.mocked( getWidgetsCache ).mockReturnValue( {} );
		jest.mocked( useDefaultPanelSettings ).mockReturnValue( {
			defaultSectionsExpanded: {
				settings: [],
				style: [],
			},
			defaultTab: 'settings',
		} );
		jest.mocked( useStateByElement ).mockReturnValue( [ 'settings', jest.fn() ] );
	} );

	it( 'should render General, Style and Interactions tabs enabled for an unrestricted user', () => {
		// Arrange
		renderEditingPanelTabs();

		// Act
		const generalTab = getTabByName( TAB_GENERAL );
		const styleTab = getTabByName( TAB_STYLE );
		const interactionsTab = getTabByName( TAB_INTERACTIONS );

		// Assert
		expectTabEnabled( generalTab );
		expectTabEnabled( styleTab );
		expectTabEnabled( interactionsTab );
		expect( screen.getByText( SETTINGS_TAB_PANEL_TEXT ) ).toBeInTheDocument();
		fireEvent.click( styleTab );
		expect( screen.getByText( STYLE_TAB_PANEL_TEXT ) ).toBeInTheDocument();
		fireEvent.click( interactionsTab );
		expect( screen.getByText( INTERACTIONS_TAB_PANEL_TEXT ) ).toBeInTheDocument();
	} );

	it( 'should render Style and Interactions tabs disabled for a content-only user', () => {
		// Arrange
		jest.mocked( useHasContentOnlyAccess ).mockReturnValue( true );
		renderEditingPanelTabs();

		// Act
		const generalTab = getTabByName( TAB_GENERAL );
		const styleTab = getTabByName( TAB_STYLE );
		const interactionsTab = getTabByName( TAB_INTERACTIONS );

		// Assert
		expectTabEnabled( generalTab );
		expectTabDisabled( styleTab );
		expectTabDisabled( interactionsTab );
		expect( screen.getByText( SETTINGS_TAB_PANEL_TEXT ) ).toBeInTheDocument();
		expect( screen.queryByText( STYLE_TAB_PANEL_TEXT ) ).not.toBeInTheDocument();
		expect( screen.queryByText( INTERACTIONS_TAB_PANEL_TEXT ) ).not.toBeInTheDocument();
	} );

	it( 'should force the General tab when a content-only user stored tab was Style', () => {
		// Arrange
		jest.mocked( useHasContentOnlyAccess ).mockReturnValue( true );
		jest.mocked( useStateByElement ).mockReturnValue( [ 'style', jest.fn() ] );
		renderEditingPanelTabs();

		// Act
		const generalTab = getTabByName( TAB_GENERAL );
		const styleTab = getTabByName( TAB_STYLE );

		// Assert
		expect( generalTab ).toHaveAttribute( 'aria-selected', 'true' );
		expect( styleTab ).toHaveAttribute( 'aria-selected', 'false' );
		expect( screen.getByText( SETTINGS_TAB_PANEL_TEXT ) ).toBeInTheDocument();
		expect( screen.queryByText( STYLE_TAB_PANEL_TEXT ) ).not.toBeInTheDocument();
	} );

	it( 'should attach the content-only infotip to the restricted tabs', () => {
		// Arrange
		jest.mocked( useHasContentOnlyAccess ).mockReturnValue( true );

		// Act
		renderEditingPanelTabs();

		// Assert
		expect( hasInfotipTrigger( getTabByName( TAB_STYLE ) ) ).toBe( true );
		expect( hasInfotipTrigger( getTabByName( TAB_INTERACTIONS ) ) ).toBe( true );
	} );

	it( 'should not attach the content-only infotip for an unrestricted user', () => {
		// Arrange
		jest.mocked( useHasContentOnlyAccess ).mockReturnValue( false );

		// Act
		renderEditingPanelTabs();

		// Assert
		expect( hasInfotipTrigger( getTabByName( TAB_STYLE ) ) ).toBe( false );
		expect( hasInfotipTrigger( getTabByName( TAB_INTERACTIONS ) ) ).toBe( false );
	} );

	it( 'should render the content-only infotip copy', () => {
		// Arrange
		renderWithTheme( <ContentOnlyInfotip>{ TAB_STYLE }</ContentOnlyInfotip> );

		// Act
		fireEvent.mouseEnter( screen.getByText( TAB_STYLE ) );

		// Assert
		expect( screen.getByText( 'Content-only access' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Your Site Admin has limited this role to content editing.' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'link', { name: 'Learn More' } ) ).toHaveAttribute( 'href', LEARN_MORE_URL );
	} );

	it( 'should keep the Style tab enabled for a promoted element when the user has content-only access', () => {
		// Arrange
		jest.mocked( useHasContentOnlyAccess ).mockReturnValue( true );
		jest.mocked( getWidgetsCache ).mockReturnValue( {
			[ PROMOTED_ELEMENT_TYPE ]: {
				title: 'Promoted widget',
				controls: {},
				meta: { is_pro_promotion: true },
			},
		} );
		renderEditingPanelTabs( PROMOTED_ELEMENT_TYPE );

		// Act
		const styleTab = getTabByName( TAB_STYLE );
		const interactionsTab = getTabByName( TAB_INTERACTIONS );

		// Assert
		expect( screen.queryByRole( 'tab', { name: TAB_GENERAL } ) ).not.toBeInTheDocument();
		expectTabEnabled( styleTab );
		expectTabEnabled( interactionsTab );
		expect( screen.getByText( STYLE_TAB_PANEL_TEXT ) ).toBeInTheDocument();
		fireEvent.click( interactionsTab );
		expect( screen.getByText( INTERACTIONS_TAB_PANEL_TEXT ) ).toBeInTheDocument();
	} );
} );
