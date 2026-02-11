import * as React from 'react';
import {
	createMockContainer,
	createMockElement,
	createMockPropType,
	mockCurrentUserCapabilities,
	renderWithStore,
} from 'test-utils';
import { ControlActionsProvider, TextControl } from '@elementor/editor-controls';
import { controlsRegistry, ElementProvider } from '@elementor/editor-editing-panel';
import {
	getContainer,
	getElementLabel,
	getElementSetting,
	getElementType,
	getWidgetsCache,
	useElementSetting,
	useSelectedElement,
} from '@elementor/editor-elements';
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
import { getContainerByOriginId } from '../../../utils/get-container-by-origin-id';
import { switchToComponent } from '../../../utils/switch-to-component';
import { InstanceEditingPanel } from '../instance-editing-panel';

jest.mock( '@elementor/editor-elements' );

jest.mock( '@elementor/session' );

jest.mock( '../../../utils/switch-to-component' );

jest.mock( '../../../utils/get-container-by-origin-id', () => ( {
	getContainerByOriginId: jest.fn(),
} ) );

jest.mock( '../../../prop-types/component-instance-prop-type', () => ( {
	componentInstancePropTypeUtil: {
		extract: jest.fn(),
		key: 'component-instance',
	},
} ) );

jest.mock( '@elementor/editor-current-user' );

mockCurrentUserCapabilities( true );

const MOCK_ELEMENT_ID = 'element-123';
const MOCK_COMPONENT_ID = 456;
const MOCK_INNER_COMPONENT_ID = 789;
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
	id: MOCK_ELEMENT_ID,
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

const MOCK_ORIGIN_OVERRIDABLE_PROP = {
	propKey: 'title',
	widgetType: 'e-text',
	elType: 'widget',
	elementId: 'test-123',
};

const MOCK_INNER_COMPONENT_OVERRIDABLE_PROPS = {
	props: {
		'inner-prop-1': {
			overrideKey: 'inner-prop-1',
			label: 'Inner Title',
			elementId: 'test-123',
			propKey: 'title',
			widgetType: 'e-text',
			elType: 'widget',
			groupId: 'inner-content',
			originValue: { $$type: 'string', value: 'Inner Value' },
		},
	},
	groups: {
		items: {
			'inner-content': { id: 'inner-content', label: 'Inner Content', props: [ 'inner-prop-1' ] },
		},
		order: [ 'inner-content' ],
	},
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

const MOCK_OVERRIDABLE_PROPS_WITH_EMPTY_GROUP = {
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
	},
	groups: {
		items: {
			content: { id: 'content', label: 'Content', props: [ 'prop-1' ] },
			empty: { id: 'empty', label: 'Empty Group', props: [] },
		},
		order: [ 'content', 'empty' ],
	},
};

const MOCK_OVERRIDABLE_PROPS_WITH_NESTED = {
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
		'nested-prop-1': {
			overrideKey: 'nested-prop-1',
			label: 'Nested Component Title',
			elementId: 'nested-instance-1',
			propKey: 'title',
			widgetType: 'e-component',
			elType: 'widget',
			groupId: 'nested',
			originValue: {
				$$type: 'override',
				value: {
					override_key: 'inner-prop-1',
					override_value: { $$type: 'string', value: 'Nested Title Value' },
					schema_source: { type: 'component', id: MOCK_INNER_COMPONENT_ID },
				},
			},
			originPropFields: MOCK_ORIGIN_OVERRIDABLE_PROP,
		},
	},
	groups: {
		items: {
			content: { id: 'content', label: 'Content', props: [ 'prop-1' ] },
			nested: { id: 'nested', label: 'Nested Component Props', props: [ 'nested-prop-1' ] },
		},
		order: [ 'content', 'nested' ],
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
		'e-button': {
			atomic_props_schema: {
				link: MOCK_PROP_TYPE,
			},
			atomic_controls: [
				{
					type: 'control' as const,
					value: { bind: 'link', label: 'Link', type: MOCK_CONTROL_TYPE, props: {} },
				},
			],
		},
		'e-text': {
			atomic_props_schema: {
				title: MOCK_PROP_TYPE,
			},
			atomic_controls: [
				{
					type: 'control' as const,
					value: { bind: 'title', label: 'Title', type: MOCK_CONTROL_TYPE, props: {} },
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

describe( '<InstanceEditingPanel />', () => {
	let store: Store< SliceState< typeof slice > >;

	beforeAll( () => {
		controlsRegistry.register( MOCK_CONTROL_TYPE, TextControl, 'full' );
	} );

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
		jest.mocked( getElementLabel ).mockReturnValue( MOCK_ELEMENT_LABEL );
		jest.mocked( getWidgetsCache ).mockReturnValue(
			createMockWidgetsCache() as unknown as ReturnType< typeof getWidgetsCache >
		);
		jest.mocked( getElementType ).mockImplementation( createMockElementType );
		jest.mocked( getContainer ).mockReturnValue( createMockContainer( MOCK_ELEMENT_ID, [] ) );
		jest.mocked( getComponentInnerElement ).mockImplementation( ( originId ) =>
			createMockContainer( originId, [] )
		);
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
		expect( screen.getByText( 'Content' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Settings' ) ).toBeInTheDocument();
	} );

	it( 'should render overridable prop labels', () => {
		// Arrange.
		setupComponent();

		// Act.
		renderEditInstancePanel( store );

		// Assert.
		expect( screen.getByText( 'Title' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Subtitle' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Link' ) ).toBeInTheDocument();
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

	it( 'should show edit button when user is admin', () => {
		// Arrange.
		mockCurrentUserCapabilities( true );
		setupComponent();

		// Act.
		renderEditInstancePanel( store );

		// Assert.
		expect( screen.getByLabelText( `Edit ${ MOCK_COMPONENT_NAME }` ) ).toBeInTheDocument();
	} );

	it( 'should not show edit button when user is not admin', () => {
		// Arrange.
		mockCurrentUserCapabilities( false );
		setupComponent();

		// Act.
		renderEditInstancePanel( store );

		// Assert.
		expect( screen.queryByLabelText( `Edit ${ MOCK_COMPONENT_NAME }` ) ).not.toBeInTheDocument();
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
		setupComponent( { isWithOverridableProps: false } );

		// Act.
		renderEditInstancePanel( store );

		// Assert.
		expect( screen.getByText( MOCK_COMPONENT_NAME ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Content' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Settings' ) ).not.toBeInTheDocument();
	} );

	it( 'should render overridable props from nested components', () => {
		// Arrange.
		setupComponent( { isWithOverridableProps: true, isWithNestedOverridableProps: true } );

		// Act.
		renderEditInstancePanel( store );

		// Assert.
		expect( screen.getByText( 'Content' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Nested Component Props' ) ).toBeInTheDocument();
	} );

	it( 'should render nested component prop labels', () => {
		// Arrange.
		setupComponent( { isWithOverridableProps: true, isWithNestedOverridableProps: true } );

		// Act.
		renderEditInstancePanel( store );

		// Assert.
		expect( screen.getByText( 'Title' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Nested Component Title' ) ).toBeInTheDocument();
	} );

	it( 'should not display groups that have no props', () => {
		// Arrange.
		setupComponent( { isWithOverridableProps: true, isWithEmptyGroup: true } );

		// Act.
		renderEditInstancePanel( store );

		// Assert.
		expect( screen.getByText( 'Content' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Empty Group' ) ).not.toBeInTheDocument();
	} );

	it( 'should render panel for archived component instance', () => {
		// Arrange.
		setupComponent( { isArchived: true } );

		// Act.
		renderEditInstancePanel( store );

		// Assert.
		expect( screen.getByText( MOCK_COMPONENT_NAME ) ).toBeInTheDocument();
		expect( screen.getByText( 'Content' ) ).toBeInTheDocument();
	} );

	it( 'should render panel for component archived during session', () => {
		// Arrange.
		setupComponent();
		dispatch( slice.actions.archive( MOCK_COMPONENT_ID ) );

		// Act.
		renderEditInstancePanel( store );

		// Assert.
		expect( screen.getByText( MOCK_COMPONENT_NAME ) ).toBeInTheDocument();
		expect( screen.getByText( 'Content' ) ).toBeInTheDocument();
	} );
} );

type SetupComponentOptions = {
	isWithOverridableProps?: boolean;
	isWithNestedOverridableProps?: boolean;
	isWithEmptyGroup?: boolean;
	isArchived?: boolean;
};

function setupComponent( {
	isWithOverridableProps = true,
	isWithNestedOverridableProps = false,
	isWithEmptyGroup = false,
	isArchived = false,
}: SetupComponentOptions = {} ) {
	const getOverridableProps = () => {
		if ( isWithNestedOverridableProps ) {
			return MOCK_OVERRIDABLE_PROPS_WITH_NESTED;
		}
		if ( isWithEmptyGroup ) {
			return MOCK_OVERRIDABLE_PROPS_WITH_EMPTY_GROUP;
		}
		return MOCK_OVERRIDABLE_PROPS;
	};

	const overridableProps = getOverridableProps();

	const componentData = {
		id: MOCK_COMPONENT_ID,
		uid: 'component-uid',
		name: MOCK_COMPONENT_NAME,
		overridableProps: isWithOverridableProps ? overridableProps : undefined,
		isArchived,
	};

	const componentsToLoad = [ componentData ];

	if ( isWithNestedOverridableProps ) {
		const innerComponentData = {
			id: MOCK_INNER_COMPONENT_ID,
			uid: 'inner-component-uid',
			name: 'Inner Component',
			overridableProps: MOCK_INNER_COMPONENT_OVERRIDABLE_PROPS,
			isArchived: false,
		};
		componentsToLoad.push( innerComponentData as unknown as typeof componentData );

		const nestedComponentInstanceValue = {
			component_id: { $$type: 'number', value: MOCK_INNER_COMPONENT_ID },
			overrides: {
				$$type: 'overrides',
				value: [
					{
						$$type: 'overridable',
						value: {
							override_key: 'nested-prop-1',
							origin_value: {
								$$type: 'override',
								value: {
									override_key: 'inner-prop-1',
									override_value: null,
									schema_source: { type: 'component', id: MOCK_INNER_COMPONENT_ID },
								},
							},
						},
					},
				],
			},
		};

		jest.mocked( getContainerByOriginId ).mockImplementation( ( originId ) => {
			if ( originId === 'nested-instance-1' ) {
				return createMockElement( {
					model: { id: 'nested-instance-1', widgetType: 'e-component' },
					settings: {
						component_instance: {
							$$type: 'component-instance',
							value: nestedComponentInstanceValue,
						},
					},
				} );
			}
			return createMockContainer( originId, [] );
		} );

		jest.mocked( componentInstancePropTypeUtil.extract ).mockImplementation( ( value: unknown ) => {
			const typedValue = value as { $$type?: string; value?: { component_id?: { value?: number } } } | undefined;
			if (
				typedValue?.$$type === 'component-instance' &&
				typedValue?.value?.component_id?.value === MOCK_INNER_COMPONENT_ID
			) {
				return nestedComponentInstanceValue as ReturnType< typeof componentInstancePropTypeUtil.extract >;
			}
			return {
				component_id: { $$type: 'number' as const, value: MOCK_COMPONENT_ID },
				overrides: { $$type: 'overrides' as const, value: [] },
			};
		} );
	}

	dispatch( slice.actions.load( componentsToLoad ) );
}

function renderEditInstancePanel( store: Store< SliceState< typeof slice > > ) {
	return renderWithStore(
		<ControlActionsProvider items={ [] }>
			<ElementProvider element={ MOCK_ELEMENT } elementType={ MOCK_ELEMENT_TYPE }>
				<InstanceEditingPanel />
			</ElementProvider>
		</ControlActionsProvider>,
		store
	);
}
