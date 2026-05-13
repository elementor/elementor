import { type PropsSchema } from '@elementor/editor-props';
import { getSessionStorageItem, removeSessionStorageItem } from '@elementor/session';
import { describe, expect, it } from '@jest/globals';

import { getElementSettingsWithDefaults, getUpdatedValues } from '../prop-dependency-utils';

jest.mock( '@elementor/session' );

const str = ( value: string ) => ( { $$type: 'string' as const, value } );
const arr = ( ...items: string[] ) => ( {
	$$type: 'string-array' as const,
	value: items.map( str ),
} );
const plain = ( opts: { default?: ReturnType< typeof str > | ReturnType< typeof arr > | null } = {} ) => ( {
	kind: 'plain' as const,
	key: 'test',
	default: opts.default ?? null,
	settings: {},
	meta: {},
	dependencies: undefined,
	initial_value: null,
} );

// ─── tests ───────────────────────────────────────────────────────────────────

describe( 'getElementSettingsWithDefaults', () => {
	const defaultString = str( 'default-value' );
	const defaultArray = arr( 'email' );

	const propsSchema: PropsSchema = {
		withDefault: { ...plain( { default: defaultString } ), key: 'withDefault' },
		withArrayDefault: { ...plain( { default: defaultArray } ), key: 'withArrayDefault' },
		noDefault: plain(),
	};

	describe( 'null value in element settings', () => {
		it( 'applies schema default when stored value is null', () => {
			// Arrange
			const elementSettings = { withDefault: null, withArrayDefault: null };

			// Act
			const result = getElementSettingsWithDefaults( propsSchema, elementSettings );

			// Assert
			expect( result.withDefault ).toEqual( defaultString );
			expect( result.withArrayDefault ).toEqual( defaultArray );
		} );

		it( 'leaves the key null when schema default is also null', () => {
			// Arrange
			const elementSettings = { noDefault: null };

			// Act
			const result = getElementSettingsWithDefaults( propsSchema, elementSettings );

			// Assert
			expect( result.noDefault ).toBeNull();
		} );
	} );

	describe( 'missing key in element settings', () => {
		it( 'does not apply schema default — missing keys are left untouched', () => {
			// Arrange
			const elementSettings = {};

			// Act
			const result = getElementSettingsWithDefaults( propsSchema, elementSettings );

			// Assert
			expect( result.withDefault ).toBeUndefined();
			expect( result.withArrayDefault ).toBeUndefined();
		} );

		it( 'handles undefined element settings — all keys remain absent', () => {
			// Act
			const result = getElementSettingsWithDefaults( propsSchema, undefined );

			// Assert
			expect( result.withDefault ).toBeUndefined();
			expect( result.withArrayDefault ).toBeUndefined();
			expect( result.noDefault ).toBeUndefined();
		} );
	} );

	describe( 'existing non-null value', () => {
		it( 'preserves a stored value even when schema default differs', () => {
			// Arrange
			const storedValue = str( 'custom-value' );

			// Act
			const result = getElementSettingsWithDefaults( propsSchema, { withDefault: storedValue } );

			// Assert
			expect( result.withDefault ).toBe( storedValue );
		} );
	} );

	describe( 'immutability', () => {
		it( 'does not mutate the original elementSettings object', () => {
			// Arrange
			const elementSettings = { withDefault: null };
			const snapshot = { ...elementSettings };

			// Act
			getElementSettingsWithDefaults( propsSchema, elementSettings );

			// Assert
			expect( elementSettings ).toEqual( snapshot );
		} );
	} );

	describe( 'keys outside propsSchema', () => {
		it( 'preserves keys that are not in propsSchema', () => {
			// Arrange
			const extra = str( 'preserved' );
			const elementSettings = { withDefault: null, unknownKey: extra };

			// Act
			const result = getElementSettingsWithDefaults( propsSchema, elementSettings );

			// Assert
			expect( result.withDefault ).toEqual( defaultString );
			expect( result.unknownKey ).toBe( extra );
		} );
	} );

	describe( 'prop with dependencies defined', () => {
		it( 'applies schema default regardless of dependencies — conditions are not evaluated here', () => {
			// Arrange
			const schemaWithDep: PropsSchema = {
				conditional: {
					...plain( { default: defaultString } ),
					key: 'conditional',
					dependencies: {
						relation: 'or',
						terms: [ { path: [ 'other' ], operator: 'eq', value: 'show-me' } ],
					},
				},
			};
			// 'other' is NOT 'show-me', so the dependency condition would fail —
			// but getElementSettingsWithDefaults must still apply the default.
			const elementSettings = { conditional: null, other: str( 'something-else' ) };

			// Act
			const result = getElementSettingsWithDefaults( schemaWithDep, elementSettings );

			// Assert
			expect( result.conditional ).toEqual( defaultString );
		} );
	} );
} );

describe( 'getUpdatedValues — overridable shape mismatch on restore', () => {
	const ELEMENT_ID = 'el-1';
	const STORAGE_PREFIX = `elementor/${ ELEMENT_ID }`;

	const overridable = ( overrideKey: string, origin: { $$type: string; value: unknown } ) => ( {
		$$type: 'overridable' as const,
		value: { override_key: overrideKey, origin_value: origin },
	} );

	const tagSchema = ( linkConditionValue: string ): PropsSchema => ( {
		tag: {
			...plain( { default: str( 'div' ) } ),
			key: 'tag',
			dependencies: {
				relation: 'and',
				terms: [
					{
						path: [ 'link' ],
						operator: 'ne',
						value: linkConditionValue,
						newValue: str( 'a' ),
					},
				],
			},
		},
		link: { ...plain(), key: 'link' },
	} );

	beforeEach( () => {
		jest.mocked( getSessionStorageItem ).mockReturnValue( undefined );
	} );

	it( 'restores the saved overridable wrapper when the prop is still overridable', () => {
		// Arrange
		const savedOverridable = overridable( 'k1', str( 'div' ) );
		jest.mocked( getSessionStorageItem ).mockImplementation( ( key ) =>
			key === `${ STORAGE_PREFIX }:tag` ? savedOverridable : undefined
		);

		const propsSchema = tagSchema( 'no-link' );
		const elementValues = {
			tag: overridable( 'k1', str( 'a' ) ),
			link: str( 'no-link' ),
		};
		const newValues = { link: null };

		// Act
		const result = getUpdatedValues( newValues, [ 'tag' ], propsSchema, elementValues, ELEMENT_ID );

		// Assert
		expect( result.tag ).toEqual( savedOverridable );
		expect( removeSessionStorageItem ).toHaveBeenCalledWith( `${ STORAGE_PREFIX }:tag` );
	} );

	it( 'falls back to default and discards the cache when the user removed overridable wrapper between save and restore', () => {
		// Arrange
		const savedOverridable = overridable( 'k1', str( 'div' ) );
		jest.mocked( getSessionStorageItem ).mockImplementation( ( key ) =>
			key === `${ STORAGE_PREFIX }:tag` ? savedOverridable : undefined
		);

		const propsSchema = tagSchema( 'no-link' );
		const elementValues = {
			tag: str( 'a' ),
			link: str( 'no-link' ),
		};
		const newValues = { link: null };

		// Act
		const result = getUpdatedValues( newValues, [ 'tag' ], propsSchema, elementValues, ELEMENT_ID );

		// Assert
		expect( result.tag ).toEqual( str( 'div' ) );
		expect( removeSessionStorageItem ).toHaveBeenCalledWith( `${ STORAGE_PREFIX }:tag` );
	} );

	it( 'falls back to default when user added overridable wrapper between save and restore', () => {
		// Arrange
		const savedPlain = str( 'div' );
		jest.mocked( getSessionStorageItem ).mockImplementation( ( key ) =>
			key === `${ STORAGE_PREFIX }:tag` ? savedPlain : undefined
		);

		const propsSchema = tagSchema( 'no-link' );
		const elementValues = {
			tag: overridable( 'k1', str( 'a' ) ),
			link: str( 'no-link' ),
		};
		const newValues = { link: null };

		// Act
		const result = getUpdatedValues( newValues, [ 'tag' ], propsSchema, elementValues, ELEMENT_ID );

		// Assert
		expect( result.tag ).toEqual( overridable( 'k1', str( 'div' ) ) );
		expect( removeSessionStorageItem ).toHaveBeenCalledWith( `${ STORAGE_PREFIX }:tag` );
	} );
} );
