import { createMockBreakpointsTree, createMockStyleDefinitionWithVariants, createMockStylesProvider } from 'test-utils';
import { type BreakpointId } from '@elementor/editor-responsive';
import { type StyleDefinition, type StyleDefinitionState, type StyleDefinitionVariant } from '@elementor/editor-styles';

import { getProviderByStyleId } from '../../contexts/style-context';
import { createStylesInheritance } from '../create-styles-inheritance';
import { type StyleDefinitionStateWithNormal, type StylesInheritanceSnapshot } from '../types';
import { createMockSnapshotField } from './mock-utils';

jest.mock( '@elementor/editor-responsive' );
jest.mock( '../../contexts/style-context' );

type ExpectedSnapshots = Partial<
	Record<
		NonNullable< BreakpointId >,
		Partial< Record< StyleDefinitionStateWithNormal, StylesInheritanceSnapshot > >
	>
>;

const desktopNormal = { breakpoint: 'desktop', state: null } as StyleDefinitionVariant[ 'meta' ];
const desktopHover = { breakpoint: 'desktop', state: 'hover' } as StyleDefinitionVariant[ 'meta' ];
const tabletNormal = { breakpoint: 'tablet', state: null } as StyleDefinitionVariant[ 'meta' ];
const mobileNormal = { breakpoint: 'mobile', state: null } as StyleDefinitionVariant[ 'meta' ];

const desktopNormalProp1 = createMockStyleDefinitionWithVariants( {
	variants: [
		{
			meta: desktopNormal,
			props: { prop1: '1' },
		},
	],
} );

const tabletNormalProp2 = createMockStyleDefinitionWithVariants( {
	variants: [
		{
			meta: tabletNormal,
			props: { prop2: '2' },
		},
	],
} );

const mobileNormalProp3 = createMockStyleDefinitionWithVariants( {
	variants: [
		{
			meta: mobileNormal,
			props: { prop3: '3' },
		},
	],
} );

const test1 = {
	explanation:
		'set props in snapshots based on the relevant style variants or inherited props from prior breakpoints',
	styles: [ desktopNormalProp1, tabletNormalProp2, mobileNormalProp3 ],
	expectedSnapshots: {
		desktop: {
			normal: {
				prop1: [
					createMockSnapshotField( desktopNormalProp1, { breakpoint: 'desktop', state: null }, [ 'prop1' ] ),
				],
			},
		},
		tablet: {
			normal: {
				prop1: [
					createMockSnapshotField( desktopNormalProp1, { breakpoint: 'desktop', state: null }, [ 'prop1' ] ),
				],
				prop2: [
					createMockSnapshotField( tabletNormalProp2, { breakpoint: 'tablet', state: null }, [ 'prop2' ] ),
				],
			},
		},
		mobile: {
			normal: {
				prop1: [
					createMockSnapshotField( desktopNormalProp1, { breakpoint: 'desktop', state: null }, [ 'prop1' ] ),
				],
				prop2: [
					createMockSnapshotField( tabletNormalProp2, { breakpoint: 'tablet', state: null }, [ 'prop2' ] ),
				],
				prop3: [
					createMockSnapshotField( mobileNormalProp3, { breakpoint: 'mobile', state: null }, [ 'prop3' ] ),
				],
			},
		},
	},
};

const desktopNormalProp1Override = createMockStyleDefinitionWithVariants( {
	variants: [
		{
			meta: desktopNormal,
			props: { prop1: '4' },
		},
	],
} );

const test2 = {
	explanation: 'sort the snapshot prop values based on the order of the style definitions',
	styles: [ desktopNormalProp1Override, desktopNormalProp1 ],
	expectedSnapshots: {
		desktop: {
			normal: {
				prop1: [
					createMockSnapshotField( desktopNormalProp1Override, { breakpoint: 'desktop', state: null }, [
						'prop1',
					] ),
					createMockSnapshotField( desktopNormalProp1, { breakpoint: 'desktop', state: null }, [ 'prop1' ] ),
				],
			},
		},
	},
};

const desktopNormalHoverProp1 = createMockStyleDefinitionWithVariants( {
	variants: [
		{
			meta: desktopNormal,
			props: { prop1: '5' },
		},
		{
			meta: desktopHover,
			props: { prop1: '6' },
		},
	],
} );

const mobileNormalProp1 = createMockStyleDefinitionWithVariants( {
	variants: [
		{
			meta: mobileNormal,
			props: { prop1: '7' },
		},
	],
} );

const desktopHoverProp1 = createMockStyleDefinitionWithVariants( {
	variants: [
		{
			meta: desktopHover,
			props: { prop1: '8' },
		},
	],
} );

const test3 = {
	explanation: 'give priority to matching state prop values in state-specific snapshots',
	styles: [ desktopNormalHoverProp1, mobileNormalProp1, desktopHoverProp1 ],
	expectedSnapshots: {
		desktop: {
			normal: {
				prop1: [
					createMockSnapshotField( desktopNormalHoverProp1, { breakpoint: 'desktop', state: null }, [
						'prop1',
					] ),
				],
			},
			hover: {
				prop1: [
					createMockSnapshotField( desktopNormalHoverProp1, { breakpoint: 'desktop', state: 'hover' }, [
						'prop1',
					] ),
					createMockSnapshotField( desktopHoverProp1, { breakpoint: 'desktop', state: 'hover' }, [
						'prop1',
					] ),
					createMockSnapshotField( desktopNormalHoverProp1, { breakpoint: 'desktop', state: null }, [
						'prop1',
					] ),
				],
			},
		},
		mobile: {
			normal: {
				prop1: [
					createMockSnapshotField( mobileNormalProp1, { breakpoint: 'mobile', state: null }, [ 'prop1' ] ),
					createMockSnapshotField( desktopNormalHoverProp1, { breakpoint: 'desktop', state: null }, [
						'prop1',
					] ),
				],
			},
			hover: {
				prop1: [
					createMockSnapshotField( desktopNormalHoverProp1, { breakpoint: 'desktop', state: 'hover' }, [
						'prop1',
					] ),
					createMockSnapshotField( desktopHoverProp1, { breakpoint: 'desktop', state: 'hover' }, [
						'prop1',
					] ),
					createMockSnapshotField( mobileNormalProp1, { breakpoint: 'mobile', state: null }, [ 'prop1' ] ),
					createMockSnapshotField( desktopNormalHoverProp1, { breakpoint: 'desktop', state: null }, [
						'prop1',
					] ),
				],
			},
		},
	},
};

const desktopNormalEmpty = createMockStyleDefinitionWithVariants( {
	variants: [
		{
			meta: desktopNormal,
			props: { prop1: null, prop2: [ undefined, null, '', { a: null, b: undefined } ] },
		},
	],
} );

const mobileNormalEmpty = createMockStyleDefinitionWithVariants( {
	variants: [
		{
			meta: mobileNormal,
			props: { prop1: { a: null, b: undefined, c: '', d: [ { e: null } ] } },
		},
	],
} );

const test4 = {
	explanation: 'clear empty values from snapshot prop arrays',
	styles: [ desktopNormalEmpty, mobileNormalEmpty, desktopHoverProp1 ],
	expectedSnapshots: {
		desktop: {
			normal: {},
		},
		mobile: {
			normal: {},
		},
	},
};

describe( 'Styles Inheritance', () => {
	beforeEach( () => {
		jest.mocked( getProviderByStyleId ).mockReturnValue( createMockStylesProvider( { key: 'test' } ) );
	} );

	it.each( [ test1, test2, test3, test4 ] )(
		'should $explanation',
		( { styles, expectedSnapshots }: { styles: StyleDefinition[]; expectedSnapshots: ExpectedSnapshots } ) => {
			// Arrange.
			const { getSnapshot } = createStylesInheritance( styles, createMockBreakpointsTree() );

			Object.entries( expectedSnapshots ).forEach( ( [ breakpointId, states ] ) => {
				Object.entries( states ).forEach( ( [ state, expectedSnapshot ] ) => {
					// Act.
					const snapshot =
						getSnapshot( {
							breakpoint: breakpointId as BreakpointId,
							state: state as StyleDefinitionState,
						} ) ?? {};

					// Assert.
					expect( snapshot ).toEqual( expectedSnapshot );
				} );
			} );
		}
	);
} );
