import * as React from 'react';
import { renderWithStore } from 'test-utils';
import { useSuppressedMessage } from '@elementor/editor-current-user';
import { getV1DocumentsManager, type V1DocumentsManager } from '@elementor/editor-documents';
import { __privateRunCommand } from '@elementor/editor-v1-adapters';
import {
	__createStore,
	__dispatch as dispatch,
	__registerSlice as registerSlice,
	type SliceState,
	type Store,
} from '@elementor/store';
import { describe } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react';
import { __ } from '@wordpress/i18n';

import { slice } from '../../../store/store';
import { ComponentPanelHeader } from '../component-panel-header';

const mockOpenPropertiesPanel = jest.fn();

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	__privateRunCommand: jest.fn(),
} ) );

jest.mock( '@elementor/editor-documents', () => ( {
	...jest.requireActual( '@elementor/editor-documents' ),
	getV1DocumentsManager: jest.fn(),
} ) );

jest.mock( '../../component-properties-panel/component-properties-panel', () => ( {
	usePanelActions: () => ( {
		open: mockOpenPropertiesPanel,
	} ),
} ) );

jest.mock( '@elementor/editor-current-user' );
jest.mock( '@wordpress/i18n' );

const MOCK_INITIAL_DOCUMENT_ID = 1;
const MOCK_COMPONENT_ID = 123;
const MOCK_COMPONENT_NAME = 'Test Component';
const MOCK_INSTANCE_ID = 'instance-456';

const MOCK_OVERRIDABLE_PROPS = {
	props: {
		'prop-1': {
			overrideKey: 'prop-1',
			label: 'Title',
			elementId: 'element-1',
			propKey: 'title',
			widgetType: 'e-heading',
			elType: 'widget',
			groupId: 'default',
			originValue: { $$type: 'string', value: 'Hello' },
		},
		'prop-2': {
			overrideKey: 'prop-2',
			label: 'Subtitle',
			elementId: 'element-2',
			propKey: 'subtitle',
			widgetType: 'e-heading',
			elType: 'widget',
			groupId: 'default',
			originValue: { $$type: 'string', value: 'World' },
		},
	},
	groups: {
		items: {
			default: { id: 'default', label: 'Default', props: [ 'prop-1', 'prop-2' ] },
		},
		order: [ 'default' ],
	},
};

describe( '<ComponentPanelHeader />', () => {
	let store: Store< SliceState< typeof slice > >;

	beforeEach( () => {
		jest.clearAllMocks();
		registerSlice( slice );
		store = __createStore();

		jest.mocked( getV1DocumentsManager ).mockReturnValue( {
			getCurrent: () => ( {
				id: MOCK_COMPONENT_ID,
				container: {
					settings: {
						get: ( key: string ) => ( key === 'post_title' ? MOCK_COMPONENT_NAME : undefined ),
					},
				},
			} ),
			getInitialId: () => MOCK_INITIAL_DOCUMENT_ID,
		} as unknown as V1DocumentsManager );

		jest.mocked( useSuppressedMessage ).mockReturnValue( [ true, jest.fn() ] );
		( __ as jest.Mock ).mockImplementation( ( str ) => str );
	} );

	it( 'should not render when not editing a component', () => {
		// Arrange & Act
		renderWithStore( <ComponentPanelHeader />, store );

		// Assert
		expect( screen.queryByLabelText( 'Back' ) ).not.toBeInTheDocument();
	} );

	it( 'should render when editing a component', () => {
		// Arrange
		setupComponentEditing();

		// Act
		renderWithStore( <ComponentPanelHeader />, store );

		// Assert
		expect( screen.getByLabelText( 'Back' ) ).toBeInTheDocument();
		expect( screen.getByText( MOCK_COMPONENT_NAME ) ).toBeInTheDocument();
	} );

	it( 'should display the component name', () => {
		// Arrange
		setupComponentEditing();

		// Act
		renderWithStore( <ComponentPanelHeader />, store );

		// Assert
		expect( screen.getByText( MOCK_COMPONENT_NAME ) ).toBeInTheDocument();
	} );

	it( 'should display overrides count badge when there are overridable props', () => {
		// Arrange
		setupComponentEditing( { withOverridableProps: true } );

		// Act
		renderWithStore( <ComponentPanelHeader />, store );

		// Assert
		const expectedCount = Object.keys( MOCK_OVERRIDABLE_PROPS.props ).length;
		expect( screen.getByText( expectedCount.toString() ) ).toBeInTheDocument();
	} );

	it( 'should hide badge when there are no overridable props', () => {
		// Arrange
		setupComponentEditing( { withOverridableProps: false } );

		// Act
		renderWithStore( <ComponentPanelHeader />, store );

		// Assert
		expect( screen.queryByText( '0' ) ).not.toBeInTheDocument();
	} );

	it( 'should open properties panel when badge is clicked', () => {
		// Arrange
		setupComponentEditing( { withOverridableProps: true } );
		renderWithStore( <ComponentPanelHeader />, store );

		// Act
		const badgeButton = screen.getByLabelText( 'View overrides' );
		fireEvent.click( badgeButton );

		// Assert
		expect( mockOpenPropertiesPanel ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should navigate back to initial document when back button is clicked', () => {
		// Arrange
		setupComponentEditing();

		// Act
		renderWithStore( <ComponentPanelHeader />, store );
		const backButton = screen.getByLabelText( 'Back' );
		fireEvent.click( backButton );

		// Assert
		expect( __privateRunCommand ).toHaveBeenCalledWith( 'editor/documents/switch', {
			id: MOCK_INITIAL_DOCUMENT_ID,
			mode: 'autosave',
			setAsInitial: false,
			shouldScroll: false,
		} );
	} );

	it( 'should navigate to previous component when in nested component path', () => {
		// Arrange
		const parentComponentId = 100;
		setupComponentEditing( {
			path: [
				{ componentId: parentComponentId, instanceId: MOCK_INSTANCE_ID },
				{ componentId: MOCK_COMPONENT_ID, instanceId: 'current-instance' },
			],
		} );

		// Act
		renderWithStore( <ComponentPanelHeader />, store );
		const backButton = screen.getByLabelText( 'Back' );
		fireEvent.click( backButton );

		// Assert
		expect( __privateRunCommand ).toHaveBeenCalledWith( 'editor/documents/switch', {
			id: parentComponentId,
			selector: `[data-id="${ MOCK_INSTANCE_ID }"]`,
			mode: 'autosave',
			setAsInitial: false,
			shouldScroll: false,
		} );
	} );

	it( 'should hide introduction when message is suppressed', () => {
		// Arrange
		setupComponentEditing();
		jest.mocked( useSuppressedMessage ).mockReturnValue( [ true, jest.fn() ] );

		// Act
		renderWithStore( <ComponentPanelHeader />, store );

		// Assert
		expect( screen.queryByText( 'Add your first property' ) ).not.toBeInTheDocument();
	} );

	function setupComponentEditing(
		options: {
			withOverridableProps?: boolean;
			path?: Array< { componentId: number; instanceId: string } >;
		} = {}
	) {
		const { withOverridableProps = false, path } = options;

		const componentData = {
			id: MOCK_COMPONENT_ID,
			uid: 'component-uid',
			name: MOCK_COMPONENT_NAME,
			overridableProps: withOverridableProps ? MOCK_OVERRIDABLE_PROPS : undefined,
		};

		dispatch( slice.actions.load( [ componentData ] ) );
		dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );
		dispatch( slice.actions.setPath( path ?? [ { componentId: MOCK_COMPONENT_ID, instanceId: 'instance-123' } ] ) );
	}
} );
