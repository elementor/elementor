import { createMockElement, createMockElementData } from 'test-utils';
import { getContainer, getElementSetting, updateElementSettings, type V1ElementData } from '@elementor/editor-elements';
import { numberPropTypeUtil, type PropValue, type TransformablePropValue } from '@elementor/editor-props';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { deleteOverridableProp } from '../../extended/store/actions/delete-overridable-prop';
import { componentInstanceOverridePropTypeUtil } from '../../prop-types/component-instance-override-prop-type';
import {
	componentInstanceOverridesPropTypeUtil,
	type ComponentInstanceOverridesPropValue,
} from '../../prop-types/component-instance-overrides-prop-type';
import { componentInstancePropTypeUtil } from '../../prop-types/component-instance-prop-type';
import { componentOverridablePropTypeUtil } from '../../prop-types/component-overridable-prop-type';
import type { OverridableProp, OverridableProps, PublishedComponent } from '../../types';
import { SLICE_NAME } from '../store';

jest.mock( '@elementor/editor-elements' );

jest.mock( '@elementor/store', () => ( {
	...jest.requireActual( '@elementor/store' ),
	__getState: jest.fn(),
	__dispatch: jest.fn(),
} ) );

const mockGetContainer = jest.mocked( getContainer );
const mockGetElementSetting = jest.mocked( getElementSetting );
const mockUpdateElementSettings = jest.mocked( updateElementSettings );

const COMPONENT_ID = 1;
const GROUP_ID = 'group-1';

const createOverridablePropEntry = ( {
	overrideKey,
	elementId,
	propKey,
	widgetType,
	originValue,
}: {
	overrideKey: string;
	elementId: string;
	propKey: string;
	widgetType: string;
	originValue?: PropValue;
} ): OverridableProp => ( {
	overrideKey,
	label: `Label for ${ overrideKey }`,
	propKey,
	elementId,
	widgetType,
	elType: 'widget',
	originValue,
	groupId: GROUP_ID,
} );

const createStoreState = ( props: Record< string, OverridableProp > ): OverridableProps => ( {
	props,
	groups: {
		items: {
			[ GROUP_ID ]: {
				id: GROUP_ID,
				label: 'Content',
				props: Object.keys( props ),
			},
		},
		order: [ GROUP_ID ],
	},
} );

const createOverride = ( key: string, value: unknown ) =>
	componentInstanceOverridePropTypeUtil.create( {
		override_key: key,
		override_value: value,
		schema_source: { type: 'component', id: COMPONENT_ID },
	} );

const createOverridable = ( key: string, originValue: TransformablePropValue< string, unknown > | null ) =>
	componentOverridablePropTypeUtil.create( {
		override_key: key,
		origin_value: originValue,
	} );

const createComponentInstanceWithOverrides = ( overrides: ComponentInstanceOverridesPropValue ) =>
	componentInstancePropTypeUtil.create( {
		component_id: numberPropTypeUtil.create( COMPONENT_ID ),
		overrides: componentInstanceOverridesPropTypeUtil.create( overrides ),
	} );

type TestCase = {
	scenario: string;
	storeOverridables: Record< string, OverridableProp >;
	elements: V1ElementData[];
	propKeyToDelete: string;
	expectedStoreProps: Record< string, OverridableProp >;
	expectedElementUpdate: {
		elementId: string;
		settings: Record< string, unknown >;
	};
};

describe( 'deleteOverridableProp', () => {
	let mockState: { data: PublishedComponent[] };

	beforeEach( () => {
		jest.clearAllMocks();

		mockState = {
			data: [
				{
					id: COMPONENT_ID,
					uid: 'comp-uid',
					name: 'Test Component',
					overridableProps: {
						props: {},
						groups: { items: {}, order: [] },
					},
				},
			],
		};

		jest.mocked( getState ).mockImplementation( () => ( {
			[ SLICE_NAME ]: mockState,
		} ) );
	} );

	it.each< TestCase >( [
		{
			scenario: 'widget: single prop reverts to origin value',
			storeOverridables: {
				'title-override': createOverridablePropEntry( {
					overrideKey: 'title-override',
					elementId: 'heading-1',
					propKey: 'title',
					widgetType: 'e-heading',
					originValue: { $$type: 'html', value: 'Original Title' },
				} ),
			},
			elements: [
				createMockElementData( {
					id: 'heading-1',
					widgetType: 'e-heading',
					settings: {
						title: createOverridable( 'title-override', { $$type: 'html', value: 'Original Title' } ),
					},
				} ),
			],
			propKeyToDelete: 'title-override',
			expectedStoreProps: {},
			expectedElementUpdate: {
				elementId: 'heading-1',
				settings: { title: { $$type: 'html', value: 'Original Title' } },
			},
		},
		{
			scenario: 'widget: reverts to null when origin is undefined',
			storeOverridables: {
				'title-override': createOverridablePropEntry( {
					overrideKey: 'title-override',
					elementId: 'heading-1',
					propKey: 'title',
					widgetType: 'e-heading',
					originValue: undefined,
				} ),
			},
			elements: [
				createMockElementData( {
					id: 'heading-1',
					widgetType: 'e-heading',
					settings: {
						title: createOverridable( 'title-override', null ),
					},
				} ),
			],
			propKeyToDelete: 'title-override',
			expectedStoreProps: {},
			expectedElementUpdate: {
				elementId: 'heading-1',
				settings: { title: null },
			},
		},
		{
			scenario: 'widget: deletes middle prop from multiple, keeps others',
			storeOverridables: {
				'text-override': createOverridablePropEntry( {
					overrideKey: 'text-override',
					elementId: 'heading-1',
					propKey: 'text',
					widgetType: 'e-heading',
					originValue: { $$type: 'html', value: 'First' },
				} ),
				'subtitle-override': createOverridablePropEntry( {
					overrideKey: 'subtitle-override',
					elementId: 'heading-1',
					propKey: 'subtitle',
					widgetType: 'e-heading',
					originValue: { $$type: 'html', value: 'Middle' },
				} ),
				'hint-override': createOverridablePropEntry( {
					overrideKey: 'hint-override',
					elementId: 'heading-1',
					propKey: 'hint',
					widgetType: 'e-heading',
					originValue: { $$type: 'string', value: 'Last' },
				} ),
			},
			elements: [
				createMockElementData( {
					id: 'heading-1',
					widgetType: 'e-heading',
					settings: {
						text: createOverridable( 'text-override', { $$type: 'html', value: 'First' } ),
						subtitle: createOverridable( 'subtitle-override', { $$type: 'html', value: 'Middle' } ),
						hint: createOverridable( 'hint-override', { $$type: 'string', value: 'Last' } ),
					},
				} ),
			],
			propKeyToDelete: 'subtitle-override',
			expectedStoreProps: {
				'text-override': createOverridablePropEntry( {
					overrideKey: 'text-override',
					elementId: 'heading-1',
					propKey: 'text',
					widgetType: 'e-heading',
					originValue: { $$type: 'html', value: 'First' },
				} ),
				'hint-override': createOverridablePropEntry( {
					overrideKey: 'hint-override',
					elementId: 'heading-1',
					propKey: 'hint',
					widgetType: 'e-heading',
					originValue: { $$type: 'string', value: 'Last' },
				} ),
			},
			expectedElementUpdate: {
				elementId: 'heading-1',
				settings: { subtitle: { $$type: 'html', value: 'Middle' } },
			},
		},
		{
			scenario: 'component instance: overridable converts to simple override',
			storeOverridables: {
				'key-1': createOverridablePropEntry( {
					overrideKey: 'key-1',
					elementId: 'comp-1',
					propKey: 'component_instance',
					widgetType: 'e-component',
				} ),
			},
			elements: [
				createMockElementData( {
					id: 'comp-1',
					widgetType: 'e-component',
					settings: {
						component_instance: createComponentInstanceWithOverrides( [
							createOverridable(
								'key-1',
								createOverride( 'key-1-override', { $$type: 'string', value: 'value-1' } )
							),
						] ),
					},
				} ),
			],
			propKeyToDelete: 'key-1',
			expectedStoreProps: {},
			expectedElementUpdate: {
				elementId: 'comp-1',
				settings: {
					component_instance: createComponentInstanceWithOverrides( [
						createOverride( 'key-1-override', { $$type: 'string', value: 'value-1' } ),
					] ),
				},
			},
		},
		{
			scenario: 'component instance: simple override remains unchanged when deleted from store',
			storeOverridables: {
				'key-1': createOverridablePropEntry( {
					overrideKey: 'key-1',
					elementId: 'comp-1',
					propKey: 'component_instance',
					widgetType: 'e-component',
				} ),
				'key-2': createOverridablePropEntry( {
					overrideKey: 'key-2',
					elementId: 'comp-1',
					propKey: 'component_instance',
					widgetType: 'e-component',
				} ),
			},
			elements: [
				createMockElementData( {
					id: 'comp-1',
					widgetType: 'e-component',
					settings: {
						component_instance: createComponentInstanceWithOverrides( [
							createOverridable(
								'key-1',
								createOverride( 'key-1-override', { $$type: 'string', value: 'value-1' } )
							),
							createOverride( 'key-2', { $$type: 'string', value: 'value-2' } ),
						] ),
					},
				} ),
			],
			propKeyToDelete: 'key-2',
			expectedStoreProps: {
				'key-1': createOverridablePropEntry( {
					overrideKey: 'key-1',
					elementId: 'comp-1',
					propKey: 'component_instance',
					widgetType: 'e-component',
				} ),
			},
			expectedElementUpdate: {
				elementId: 'comp-1',
				settings: {
					component_instance: createComponentInstanceWithOverrides( [
						createOverridable(
							'key-1',
							createOverride( 'key-1-override', { $$type: 'string', value: 'value-1' } )
						),
						createOverride( 'key-2', { $$type: 'string', value: 'value-2' } ),
					] ),
				},
			},
		},
		{
			scenario: 'component instance: mixed overrides - deletes overridable, keeps others intact',
			storeOverridables: {
				'key-1': createOverridablePropEntry( {
					overrideKey: 'key-1',
					elementId: 'comp-1',
					propKey: 'component_instance',
					widgetType: 'e-component',
				} ),
				'key-2': createOverridablePropEntry( {
					overrideKey: 'key-2',
					elementId: 'comp-1',
					propKey: 'component_instance',
					widgetType: 'e-component',
				} ),
				'key-3': createOverridablePropEntry( {
					overrideKey: 'key-3',
					elementId: 'comp-1',
					propKey: 'component_instance',
					widgetType: 'e-component',
				} ),
			},
			elements: [
				createMockElementData( {
					id: 'comp-1',
					widgetType: 'e-component',
					settings: {
						component_instance: createComponentInstanceWithOverrides( [
							createOverridable(
								'key-1',
								createOverride( 'key-1-override', { $$type: 'string', value: 'value-1' } )
							),
							createOverridable(
								'key-2',
								createOverride( 'key-2-override', { $$type: 'string', value: 'value-2' } )
							),
							createOverridable(
								'key-3',
								createOverride( 'key-3-override', { $$type: 'string', value: 'value-3' } )
							),
						] ),
					},
				} ),
			],
			propKeyToDelete: 'key-2',
			expectedStoreProps: {
				'key-1': createOverridablePropEntry( {
					overrideKey: 'key-1',
					elementId: 'comp-1',
					propKey: 'component_instance',
					widgetType: 'e-component',
				} ),
				'key-3': createOverridablePropEntry( {
					overrideKey: 'key-3',
					elementId: 'comp-1',
					propKey: 'component_instance',
					widgetType: 'e-component',
				} ),
			},
			expectedElementUpdate: {
				elementId: 'comp-1',
				settings: {
					component_instance: createComponentInstanceWithOverrides( [
						createOverridable(
							'key-1',
							createOverride( 'key-1-override', { $$type: 'string', value: 'value-1' } )
						),
						createOverride( 'key-2-override', { $$type: 'string', value: 'value-2' } ),
						createOverridable(
							'key-3',
							createOverride( 'key-3-override', { $$type: 'string', value: 'value-3' } )
						),
					] ),
				},
			},
		},
	] )(
		'$scenario',
		( { storeOverridables, elements, propKeyToDelete, expectedStoreProps, expectedElementUpdate } ) => {
			// Arrange
			mockState.data[ 0 ].overridableProps = createStoreState( storeOverridables );

			const findElementData = ( id: string ) => elements.find( ( element ) => element.id === id );

			mockGetContainer.mockImplementation( ( id ) => {
				const elementData = findElementData( id );

				if ( ! elementData ) {
					return null;
				}

				return createMockElement( {
					model: {
						id: elementData.id,
						widgetType: elementData.widgetType,
						elType: elementData.elType,
					},
					settings: elementData.settings,
				} );
			} );

			mockGetElementSetting.mockImplementation( ( id, settingKey ) => {
				const elementData = findElementData( id );
				return elementData?.settings?.[ settingKey ];
			} );

			// Act
			deleteOverridableProp( { componentId: COMPONENT_ID, propKey: propKeyToDelete, source: 'user' } );

			// Assert
			expect( mockUpdateElementSettings ).toHaveBeenCalledWith( {
				id: expectedElementUpdate.elementId,
				props: expectedElementUpdate.settings,
				withHistory: false,
			} );

			expect( dispatch ).toHaveBeenCalledWith( {
				type: `${ SLICE_NAME }/setOverridableProps`,
				payload: {
					componentId: COMPONENT_ID,
					overridableProps: createStoreState( expectedStoreProps ),
				},
			} );
		}
	);

	it( 'should not update when prop key does not exist', () => {
		// Arrange
		const storeOverridables = {
			'title-override': createOverridablePropEntry( {
				overrideKey: 'title-override',
				elementId: 'heading-1',
				propKey: 'title',
				widgetType: 'e-heading',
				originValue: { $$type: 'html', value: 'Title' },
			} ),
		};

		mockState.data[ 0 ].overridableProps = createStoreState( storeOverridables );

		// Act
		deleteOverridableProp( { componentId: COMPONENT_ID, propKey: 'non-existent', source: 'user' } );

		// Assert
		expect( mockUpdateElementSettings ).not.toHaveBeenCalled();
		expect( dispatch ).not.toHaveBeenCalled();
	} );
} );
