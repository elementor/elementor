import * as React from 'react';
import { renderWithStore } from 'test-utils';
import { ElementProvider } from '@elementor/editor-editing-panel';
import { useElementSetting, useSelectedElement } from '@elementor/editor-elements';
import {
	__createStore,
	__dispatch as dispatch,
	__registerSlice as registerSlice,
	type SliceState,
	type Store,
} from '@elementor/store';
import { fireEvent, screen } from '@testing-library/react';

import { componentInstancePropTypeUtil } from '../../../prop-types/component-instance-prop-type';
import { slice } from '../../../store/store';
import { switchToComponent } from '../../../utils/switch-to-component';
import { InstanceEditPanel } from '../instance-edit-panel';

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	useElementSetting: jest.fn(),
	useSelectedElement: jest.fn(),
} ) );

jest.mock( '@elementor/session', () => ( {
	getSessionStorageItem: jest.fn(),
	setSessionStorageItem: jest.fn(),
} ) );

jest.mock( '../../../utils/switch-to-component' );

jest.mock( '../../../prop-types/component-instance-prop-type', () => ( {
	componentInstancePropTypeUtil: {
		extract: jest.fn(),
	},
} ) );

const MOCK_ELEMENT_ID = 'element-123';
const MOCK_COMPONENT_ID = 456;
const MOCK_COMPONENT_NAME = 'Test Component';
const MOCK_INSTANCE_ID = 'instance-789';

const MOCK_ELEMENT = {
	id: MOCK_ELEMENT_ID,
	type: 'component-instance',
};

const MOCK_ELEMENT_TYPE = {
	key: 'component-instance',
	title: 'Component Instance',
	controls: [],
	propsSchema: {},
	dependenciesPerTargetMapping: {},
	styleStates: [],
};

const MOCK_OVERRIDABLE_PROPS = {
	props: {
		'prop-1': {
			overrideKey: 'prop-1',
			label: 'Title',
			elementId: 'element-1',
			propKey: 'title',
			widgetType: 'e-heading',
			elType: 'widget',
			groupId: 'content',
			originValue: { $$type: 'string', value: 'Hello' },
		},
		'prop-2': {
			overrideKey: 'prop-2',
			label: 'Subtitle',
			elementId: 'element-2',
			propKey: 'subtitle',
			widgetType: 'e-heading',
			elType: 'widget',
			groupId: 'content',
			originValue: { $$type: 'string', value: 'World' },
		},
		'prop-3': {
			overrideKey: 'prop-3',
			label: 'Link',
			elementId: 'element-3',
			propKey: 'link',
			widgetType: 'e-button',
			elType: 'widget',
			groupId: 'settings',
			originValue: { $$type: 'string', value: 'https://example.com' },
		},
	},
	groups: {
		items: {
			content: { id: 'content', label: 'Content', props: [ 'prop-1', 'prop-2' ] },
			settings: { id: 'settings', label: 'Settings', props: [ 'prop-3' ] },
		},
		order: [ 'content', 'settings' ],
	},
};

describe( '<EditInstancePanel />', () => {
	let store: Store< SliceState< typeof slice > >;

	beforeEach( () => {
		jest.clearAllMocks();
		registerSlice( slice );
		store = __createStore();

		jest.mocked( useElementSetting ).mockReturnValue( {} );
		jest.mocked( useSelectedElement ).mockReturnValue( {
			element: { id: MOCK_INSTANCE_ID, type: 'component-instance' },
			elementType: MOCK_ELEMENT_TYPE,
		} );
		jest.mocked( componentInstancePropTypeUtil.extract ).mockReturnValue( {
			component_id: { $$type: 'number', value: MOCK_COMPONENT_ID },
			overrides: { $$type: 'overrides', value: [] },
		} );
	} );

	it( 'should render the component name in the header', () => {
		// Arrange.
		setupComponent();

		// Act.
		renderEditInstancePanel( store );

		// Assert.
		expect( screen.getByText( MOCK_COMPONENT_NAME ) ).toBeInTheDocument();
	} );

	it( 'should render all overridable props groups with correct headings', () => {
		// Arrange.
		setupComponent();

		// Act.
		renderEditInstancePanel( store );

		// Assert.
		expect( screen.getByLabelText( 'Content' ) ).toBeInTheDocument();
		expect( screen.getByLabelText( 'Settings' ) ).toBeInTheDocument();
	} );

	it( 'should call switchToComponent when edit button is clicked', () => {
		// Arrange.
		setupComponent();
		renderEditInstancePanel( store );

		// Act.
		const editButtonLabel = `Edit ${ MOCK_COMPONENT_NAME }`;
		const editButton = screen.getByLabelText( editButtonLabel );
		fireEvent.click( editButton );

		// Assert.
		expect( switchToComponent ).toHaveBeenCalledTimes( 1 );
		expect( switchToComponent ).toHaveBeenCalledWith( MOCK_COMPONENT_ID, MOCK_INSTANCE_ID );
	} );

	it( 'should not render when componentId is missing', () => {
		// Arrange.
		setupComponent();
		jest.mocked( componentInstancePropTypeUtil.extract ).mockReturnValue( {
			component_id: { $$type: 'number', value: null },
			overrides: { $$type: 'overrides', value: [] },
		} );

		// Act.
		const { container } = renderEditInstancePanel( store );

		// Assert.
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'should not render any sections when no overridable props', () => {
		// Arrange.
		setupComponent( false );

		// Act.
		renderEditInstancePanel( store );

		// Assert.
		expect( screen.getByText( MOCK_COMPONENT_NAME ) ).toBeInTheDocument();
		expect( screen.queryByLabelText( 'Content' ) ).not.toBeInTheDocument();
		expect( screen.queryByLabelText( 'Settings' ) ).not.toBeInTheDocument();
	} );
} );

function setupComponent( isWithOverridableProps: boolean = true ) {
	const componentData = {
		id: MOCK_COMPONENT_ID,
		uid: 'component-uid',
		name: MOCK_COMPONENT_NAME,
		overridableProps: isWithOverridableProps ? MOCK_OVERRIDABLE_PROPS : undefined,
	};

	dispatch( slice.actions.load( [ componentData ] ) );
}

function renderEditInstancePanel( store: Store< SliceState< typeof slice > > ) {
	return renderWithStore(
		<ElementProvider element={ MOCK_ELEMENT } elementType={ MOCK_ELEMENT_TYPE }>
			<InstanceEditPanel />
		</ElementProvider>,
		store
	);
}
