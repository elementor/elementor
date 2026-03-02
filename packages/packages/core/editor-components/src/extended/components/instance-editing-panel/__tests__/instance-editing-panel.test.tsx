import * as React from 'react';
import { createMockContainer, createMockPropType, mockCurrentUserCapabilities, renderWithStore } from 'test-utils';
import { ControlActionsProvider, TextControl } from '@elementor/editor-controls';
import { controlsRegistry, ElementProvider } from '@elementor/editor-editing-panel';
import { getContainer, getElementLabel, getElementType, getWidgetsCache } from '@elementor/editor-elements';
import {
	__createStore,
	__dispatch as dispatch,
	__registerSlice as registerSlice,
	type SliceState,
	type Store,
} from '@elementor/store';
import { fireEvent, screen } from '@testing-library/react';

import { componentInstancePropTypeUtil } from '../../../../prop-types/component-instance-prop-type';
import { slice } from '../../../../store/store';
import { getContainerByOriginId } from '../../../../utils/get-container-by-origin-id';
import { switchToComponent } from '../../../../utils/switch-to-component';
import { ExtendedInstanceEditingPanel } from '../instance-editing-panel';

jest.mock( '@elementor/editor-elements' );

jest.mock( '@elementor/session' );

jest.mock( '../../../../utils/switch-to-component' );

jest.mock( '../../../../prop-types/component-instance-prop-type', () => ( {
	componentInstancePropTypeUtil: {
		extract: jest.fn(),
		key: 'component-instance',
	},
} ) );

jest.mock( '@elementor/editor-current-user' );

jest.mock( '../../../../utils/get-container-by-origin-id', () => ( {
	getContainerByOriginId: jest.fn(),
} ) );

mockCurrentUserCapabilities( true );

const MOCK_COMPONENT_ID = 456;
const MOCK_COMPONENT_NAME = 'Test Component';
const MOCK_INSTANCE_ID = 'instance-789';
const MOCK_PROP_TYPE = createMockPropType( { kind: 'plain', key: 'string' } );
const MOCK_ELEMENT_LABEL = 'Heading Block';
const MOCK_CONTROL_TYPE = 'test-override-text';

const MOCK_COMPONENT_INSTANCE_PROP_TYPE = createMockPropType( {
	kind: 'object',
	key: 'component-instance',
	shape: {
		component_id: createMockPropType( { kind: 'plain', key: 'number' } ),
		overrides: createMockPropType( { kind: 'array', key: 'overrides' } ),
	},
} );

const MOCK_ELEMENT = {
	id: MOCK_INSTANCE_ID,
	type: 'component-instance',
};

const MOCK_ELEMENT_TYPE = {
	key: 'component-instance',
	title: 'Component Instance',
	controls: [],
	propsSchema: {
		component_instance: MOCK_COMPONENT_INSTANCE_PROP_TYPE,
	},
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
	},
	groups: {
		items: {
			content: { id: 'content', label: 'Content', props: [ 'prop-1', 'prop-2' ] },
		},
		order: [ 'content' ],
	},
};

const MOCK_EMPTY_OVERRIDABLE_PROPS = {
	props: {},
	groups: {
		items: {},
		order: [],
	},
};

function createMockWidgetsCache() {
	return {
		'e-heading': {
			atomic_props_schema: {
				title: MOCK_PROP_TYPE,
				subtitle: MOCK_PROP_TYPE,
			},
			atomic_controls: [
				{
					type: 'control' as const,
					value: { bind: 'title', label: 'Title', type: MOCK_CONTROL_TYPE, props: {} },
				},
				{
					type: 'control' as const,
					value: { bind: 'subtitle', label: 'Subtitle', type: MOCK_CONTROL_TYPE, props: {} },
				},
			],
		},
	};
}

function createMockElementType( widgetType: string ) {
	const widgetsCache = createMockWidgetsCache();
	const widget = widgetsCache[ widgetType as keyof typeof widgetsCache ];

	if ( ! widget ) {
		return null;
	}

	return {
		key: widgetType,
		controls: widget.atomic_controls,
		propsSchema: widget.atomic_props_schema,
		dependenciesPerTargetMapping: {},
		title: widgetType,
		styleStates: [],
	};
}

describe( '<ExtendedInstanceEditingPanel />', () => {
	let store: Store< SliceState< typeof slice > >;

	beforeAll( () => {
		controlsRegistry.register( MOCK_CONTROL_TYPE, TextControl, 'full' );
	} );

	beforeEach( () => {
		jest.clearAllMocks();
		mockCurrentUserCapabilities( true );
		registerSlice( slice );
		store = __createStore();

		jest.mocked( componentInstancePropTypeUtil.extract ).mockReturnValue( {
			component_id: { $$type: 'number', value: MOCK_COMPONENT_ID },
			overrides: { $$type: 'overrides', value: [] },
		} );
		jest.mocked( getElementLabel ).mockReturnValue( MOCK_ELEMENT_LABEL );
		jest.mocked( getWidgetsCache ).mockReturnValue(
			createMockWidgetsCache() as unknown as ReturnType< typeof getWidgetsCache >
		);
		jest.mocked( getElementType ).mockImplementation( createMockElementType );
		jest.mocked( getContainer ).mockReturnValue( createMockContainer( MOCK_INSTANCE_ID, [] ) );
		jest.mocked( getContainerByOriginId ).mockImplementation( ( originId ) => createMockContainer( originId, [] ) );
	} );

	it( 'should render the component name in the header', () => {
		// Arrange.
		setupComponent();

		// Act.
		renderPanel( store );

		// Assert.
		expect( screen.getByText( MOCK_COMPONENT_NAME ) ).toBeInTheDocument();
	} );

	it( 'should show edit button when user is admin', () => {
		// Arrange.
		setupComponent();

		// Act.
		renderPanel( store );

		// Assert.
		expect( screen.getByLabelText( `Edit ${ MOCK_COMPONENT_NAME }` ) ).toBeInTheDocument();
	} );

	it( 'should not show edit button when user is not admin', () => {
		// Arrange.
		mockCurrentUserCapabilities( false );
		setupComponent();

		// Act.
		renderPanel( store );

		// Assert.
		expect( screen.queryByLabelText( `Edit ${ MOCK_COMPONENT_NAME }` ) ).not.toBeInTheDocument();
	} );

	it( 'should call switchToComponent when edit button is clicked', () => {
		// Arrange.
		setupComponent();
		renderPanel( store );

		// Act.
		const editButton = screen.getByLabelText( `Edit ${ MOCK_COMPONENT_NAME }` );
		fireEvent.click( editButton );

		// Assert.
		expect( switchToComponent ).toHaveBeenCalledTimes( 1 );
		expect( switchToComponent ).toHaveBeenCalledWith( MOCK_COMPONENT_ID, MOCK_INSTANCE_ID );
	} );

	it( 'should show empty state with edit button when admin and no props', () => {
		// Arrange.
		setupComponent( { isWithOverridableProps: false } );

		// Act.
		renderPanel( store );

		// Assert.
		expect( screen.getByText( 'No properties yet' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Edit component' ) ).toBeInTheDocument();
	} );

	it( 'should show empty state without edit button when non-admin', () => {
		// Arrange.
		mockCurrentUserCapabilities( false );
		setupComponent( { isWithOverridableProps: false } );

		// Act.
		renderPanel( store );

		// Assert.
		expect( screen.getByText( 'No properties yet' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Edit component' ) ).not.toBeInTheDocument();
	} );

	it( 'should render overridable props groups', () => {
		// Arrange.
		setupComponent();

		// Act.
		renderPanel( store );

		// Assert.
		expect( screen.getByText( 'Content' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Title' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Subtitle' ) ).toBeInTheDocument();
	} );
} );

type SetupComponentOptions = {
	isWithOverridableProps?: boolean;
};

function setupComponent( { isWithOverridableProps = true }: SetupComponentOptions = {} ) {
	const overridableProps = isWithOverridableProps ? MOCK_OVERRIDABLE_PROPS : MOCK_EMPTY_OVERRIDABLE_PROPS;

	dispatch(
		slice.actions.load( [
			{
				id: MOCK_COMPONENT_ID,
				uid: 'component-uid',
				name: MOCK_COMPONENT_NAME,
				overridableProps,
				isArchived: false,
			},
		] )
	);
}

function renderPanel( store: Store< SliceState< typeof slice > > ) {
	return renderWithStore(
		<ControlActionsProvider items={ [] }>
			<ElementProvider element={ MOCK_ELEMENT } elementType={ MOCK_ELEMENT_TYPE } settings={ {} }>
				<ExtendedInstanceEditingPanel />
			</ElementProvider>
		</ControlActionsProvider>,
		store
	);
}
