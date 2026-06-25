import { createMockPropType } from 'test-utils';

import { useStylesField } from '../../../../hooks/use-styles-field';
import { useStylesFields } from '../../../../hooks/use-styles-fields';

type PositionKeys =
	| 'position'
	| 'z-index'
	| 'inset-block-start'
	| 'inset-block-end'
	| 'inset-inline-start'
	| 'inset-inline-end';

type StyleFieldValue =
	| { $$type: 'string'; value: string }
	| { $$type: 'size'; value: { size: number; unit: string } }
	| null;

export const mockStylesFieldValues = ( values: Partial< Record< PositionKeys, StyleFieldValue > > ) => {
	jest.mocked( useStylesField ).mockImplementation( ( key: string ) => {
		const typedKey = key as PositionKeys;

		return {
			value: values[ typedKey ] ?? null,
			setValue: jest.fn(),
			canEdit: true,
		};
	} );
};

export const mockStyleFields = ( values: Partial< Record< PositionKeys, number | string > > = {} ) => {
	const allKeys: PositionKeys[] = [
		'position',
		'z-index',
		'inset-block-start',
		'inset-block-end',
		'inset-inline-start',
		'inset-inline-end',
	];

	const mappedValues: Record< PositionKeys, StyleFieldValue > = Object.fromEntries(
		allKeys.map( ( key ) => {
			const value = values[ key ];

			if ( value === undefined ) {
				return [ key, null ];
			}

			if ( key === 'z-index' ) {
				return [ key, { $$type: 'number', value } ];
			}

			if ( key === 'position' ) {
				return [ key, { $$type: 'string', value } ];
			}

			return [
				key,
				{
					$$type: 'size',
					value: {
						size: value,
						unit: 'px',
					},
				},
			];
		} )
	) as Record< PositionKeys, StyleFieldValue >;

	jest.mocked( useStylesFields ).mockImplementation( ( propNames ) => {
		const filteredValues = Object.fromEntries(
			Object.entries( mappedValues ).filter( ( [ key ] ) => propNames.includes( key ) )
		) as Record< PositionKeys, StyleFieldValue >;

		return {
			values: filteredValues,
			setValues: jest.fn(),
			canEdit: true,
		};
	} );
};

export const createPropTypeWithDependency = ( args: object ) => {
	return createMockPropType( {
		...args,
		dependencies: {
			relation: 'and',
			terms: [
				{
					operator: 'exists',
					path: [ 'position' ],
					value: null,
				},
				{
					operator: 'ne',
					path: [ 'position' ],
					value: 'static',
				},
			],
		},
	} );
};
