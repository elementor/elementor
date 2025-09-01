import { createMockPropType, createMockStyleDefinition } from 'test-utils';
import type { PlainPropType } from '@elementor/editor-props';
import type { StyleDefinitionVariant } from '@elementor/editor-styles';
import { ELEMENTS_BASE_STYLES_PROVIDER_KEY } from '@elementor/editor-styles-repository';

import { type SnapshotPropValue } from '../types';
import { createMockSnapshotField } from './mock-utils';

const desktopNormal = { breakpoint: 'desktop', state: null } as StyleDefinitionVariant[ 'meta' ];

export const styleLocalDisplayFlex = createMockStyleDefinition( {
	id: 'e-b7cc960-bb78ae3',
	label: 'local',
	meta: desktopNormal,
	props: {
		display: {
			$$type: 'string',
			value: 'flex',
		},
	},
} );

export const styleGlobal1DisplayBlock = createMockStyleDefinition( {
	id: 'g-a1bfd2d',
	label: 'test',
	meta: desktopNormal,
	props: {
		display: {
			$$type: 'string',
			value: 'block',
		},
	},
} );

const styleGlobal2DisplayBlock = createMockStyleDefinition( {
	id: 'g-random-1',
	label: 'test-1',
	meta: desktopNormal,
	props: {
		display: {
			$$type: 'string',
			value: 'block',
		},
	},
} );

const styleEmptyDisplayInlineFlex = createMockStyleDefinition( {
	id: 'empty-element',
	label: '',
	meta: desktopNormal,
	props: {
		display: {
			$$type: 'string',
			value: 'inline-flex',
		},
	},
} );

const styleBaseDisplayInlineFlex = createMockStyleDefinition( {
	id: 'e-element-base',
	label: '',
	meta: desktopNormal,
	props: {
		display: {
			$$type: 'string',
			value: 'inline-flex',
		},
	},
} );

export const mockInheritanceChainWithDisplay: SnapshotPropValue[] = [
	createMockSnapshotField( styleLocalDisplayFlex, desktopNormal, [ 'display' ], 'document-elements-2449' ),
	createMockSnapshotField( styleGlobal1DisplayBlock, desktopNormal, [ 'display' ], 'global-classes' ),
	createMockSnapshotField( styleGlobal2DisplayBlock, desktopNormal, [ 'display' ], 'global-classes' ),
];

export const mockInheritanceChainWithEmptyLabels: SnapshotPropValue[] = [
	createMockSnapshotField( styleLocalDisplayFlex, desktopNormal, [ 'display' ], 'document-elements-2449' ),
	createMockSnapshotField( styleEmptyDisplayInlineFlex, desktopNormal, [ 'display' ], 'global-classes' ),
];

export const mockInheritanceChainWithBaseLabels: SnapshotPropValue[] = [
	createMockSnapshotField( styleLocalDisplayFlex, desktopNormal, [ 'display' ], 'document-elements-2449' ),
	createMockSnapshotField(
		styleBaseDisplayInlineFlex,
		desktopNormal,
		[ 'display' ],
		ELEMENTS_BASE_STYLES_PROVIDER_KEY
	),
];

const styleLocalMargin50 = createMockStyleDefinition( {
	id: 'e-2092ca6-3909dda',
	label: 'local',
	meta: desktopNormal,
	props: {
		margin: {
			$$type: 'dimensions',
			value: {
				'block-start': {
					$$type: 'size',
					value: {
						unit: 'px',
						size: 50,
					},
				},
				'block-end': {
					$$type: 'size',
					value: {
						unit: 'px',
						size: 50,
					},
				},
			},
		},
	},
} );

const styleGlobalMargin10 = createMockStyleDefinition( {
	id: 'g-500ccb4',
	label: 'customMargin',
	meta: desktopNormal,
	props: {
		margin: {
			$$type: 'dimensions',
			value: {
				'block-start': {
					$$type: 'size',
					value: {
						unit: 'px',
						size: 10,
					},
				},
				'block-end': {
					$$type: 'size',
					value: {
						size: 20,
						unit: 'vh',
					},
				},
				'inline-start': null,
				'inline-end': {
					$$type: 'string',
					value: 'auto',
				},
			},
		},
	},
} );

export const mockInheritanceChainWithMarginMultiSizeOnly = [
	createMockSnapshotField( styleLocalMargin50, desktopNormal, [ 'margin', 'block-start' ], 'document-elements-2483' ),
	createMockSnapshotField( styleGlobalMargin10, desktopNormal, [ 'margin', 'block-start' ], 'global-classes' ),
];

export const mockTestPropType = createMockPropType( { kind: 'plain', key: 'test-prop' } ) as PlainPropType;

const styleLocalTestProp1 = createMockStyleDefinition( {
	id: 'g-random-1',
	label: 'test-1',
	meta: desktopNormal,
	props: {
		someTestProp: {
			$$type: 'test-prop',
			value: '1',
		},
	},
} );

const styleLocalTestProp2 = createMockStyleDefinition( {
	id: 'g-random-2',
	label: 'test-2',
	meta: desktopNormal,
	props: {
		someTestProp: {
			$$type: 'test-prop',
			value: '2',
		},
	},
} );

export const mockInheritanceChainWithTestProp: SnapshotPropValue[] = [
	createMockSnapshotField( styleLocalTestProp1, desktopNormal, [ 'someTestProp' ], 'document-elements-2483' ),
	createMockSnapshotField( styleLocalTestProp2, desktopNormal, [ 'someTestProp' ], 'global-classes' ),
];

export const styleGlobalPartialMultiProps = createMockStyleDefinition( {
	id: 'g-123456',
	label: 'global-partial-multi-props',
	meta: desktopNormal,
	props: {
		display: {
			$$type: 'string',
			value: 'flex',
		},
		color: {
			$$type: 'color',
			value: '#000000',
		},
	},
} );
export const styleGlobalMultipleProps = createMockStyleDefinition( {
	id: 'g-1234567',
	label: 'global-multi-props',
	meta: desktopNormal,
	props: {
		display: {
			$$type: 'string',
			value: 'flex',
		},
		color: {
			$$type: 'color',
			value: '#000000',
		},
		'font-size': {
			$$type: 'size',
			value: {
				unit: 'px',
				size: 16,
			},
		},
	},
} );
