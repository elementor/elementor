import { type ControlItem } from '@elementor/editor-elements';
import { type PropsSchema, type TransformablePropValue } from '@elementor/editor-props';

import { type DynamicTags } from '../types';
import { nestedDynamicSettingsFilter } from '../utils';

describe( 'nestedDynamicSettingsFilter', () => {
	const GROUP = 'group';
	const SUPPORTED_TAG_NAME = 'supported-tag';
	const UNSUPPORTED_TAG_NAME = 'unsupported-tag';

	const TAGS: DynamicTags = {
		[ SUPPORTED_TAG_NAME ]: {
			atomic_controls: [] as ControlItem[],
			categories: [ 'cat' ],
			group: GROUP,
			label: 'Label',
			name: SUPPORTED_TAG_NAME,
			props_schema: {} as PropsSchema,
		},
	};

	let originalElementor: unknown;

	beforeEach( () => {
		originalElementor = ( window as unknown as { elementor?: unknown } ).elementor;

		( window as unknown as { elementor?: unknown } ).elementor = {
			config: {
				atomicDynamicTags: {
					tags: TAGS,
				},
			},
		};
	} );

	afterEach( () => {
		( window as unknown as { elementor?: unknown } ).elementor = originalElementor;
	} );

	const SUPPORTED_DYNAMIC_VALUE: TransformablePropValue< 'dynamic', { name: string } > = {
		$$type: 'dynamic',
		value: { name: SUPPORTED_TAG_NAME },
	};

	const UNSUPPORTED_DYNAMIC_VALUE: TransformablePropValue< 'dynamic', { name: string } > = {
		$$type: 'dynamic',
		value: { name: UNSUPPORTED_TAG_NAME },
	};

	it( 'should keep a supported dynamic value', () => {
		// Act.
		const result = nestedDynamicSettingsFilter( SUPPORTED_DYNAMIC_VALUE, TAGS );

		// Assert.
		expect( result ).toEqual( SUPPORTED_DYNAMIC_VALUE );
	} );

	it( 'should null an unsupported dynamic value', () => {
		// Act.
		const result = nestedDynamicSettingsFilter( UNSUPPORTED_DYNAMIC_VALUE, TAGS );

		// Assert.
		expect( result ).toBeNull();
	} );

	it( 'should null unsupported nested dynamic values and keep the outer structure', () => {
		// Arrange.
		const SETTING_VALUE: TransformablePropValue< 'image', { alt: string; src: unknown } > = {
			$$type: 'image',
			value: {
				alt: 'Alt',
				src: UNSUPPORTED_DYNAMIC_VALUE,
			},
		};

		// Act.
		const result = nestedDynamicSettingsFilter( SETTING_VALUE, TAGS ) as TransformablePropValue<
			'image',
			{ alt: string; src: unknown }
		>;

		// Assert.
		expect( result.$$type ).toBe( 'image' );
		expect( result.value.alt ).toBe( 'Alt' );
		expect( result.value.src ).toBeNull();
	} );

	it( 'should support arrays with mixed supported/unsupported dynamics', () => {
		// Arrange.
		const SETTING_VALUE: TransformablePropValue< 'list', unknown[] > = {
			$$type: 'list',
			value: [ SUPPORTED_DYNAMIC_VALUE, UNSUPPORTED_DYNAMIC_VALUE ],
		};

		// Act.
		const result = nestedDynamicSettingsFilter( SETTING_VALUE, TAGS ) as TransformablePropValue<
			'list',
			unknown[]
		>;

		// Assert.
		expect( result.value[ 0 ] ).toEqual( SUPPORTED_DYNAMIC_VALUE );
		expect( result.value[ 1 ] ).toBeNull();
	} );
} );
