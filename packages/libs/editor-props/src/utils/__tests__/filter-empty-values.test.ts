import { filterEmptyValues } from '../filter-empty-values';

describe( 'filterEmptyValues', () => {
	it.each( [
		// empty values
		{
			value: '',
			expected: null,
		},
		{
			value: null,
			expected: null,
		},
		{
			value: undefined,
			expected: null,
		},
		{
			value: {
				a: undefined,
				b: null,
				c: '',
			},
			expected: null,
		},
		{
			value: [ undefined, null, '' ],
			expected: null,
		},
		{
			value: {
				a: {
					b: null,
				},
				c: undefined,
			},
			expected: null,
		},
		{
			value: [ [ undefined ], [ null, '' ], undefined, null, '' ],
			expected: null,
		},
		{
			value: [
				{
					a: null,
				},
				{
					b: undefined,
					c: '',
				},
			],
			expected: null,
		},
		{
			value: {
				a: {
					b: [
						{
							c: null,
						},
						{
							d: undefined,
							e: '',
						},
					],
				},
			},
			expected: null,
		},
		{
			value: {
				$$type: 'test-type',
				value: {
					a: {
						b: [
							{
								c: null,
							},
							{
								d: undefined,
								e: '',
							},
						],
					},
				},
			},
			expected: null,
		},

		// non-empty values
		{
			value: 'a',
			expected: 'a',
		},
		{
			value: 0,
			expected: 0,
		},
		{
			value: false,
			expected: false,
		},
		{
			value: {
				a: 0,
				b: false,
				c: null,
				d: undefined,
				e: '',
				f: 'a',
			},
			expected: {
				a: 0,
				b: false,
				f: 'a',
			},
		},
		{
			value: [
				0,
				false,
				null,
				undefined,
				'',
				'a',
				{
					a: null,
				},
				{
					b: undefined,
					c: true,
				},
			],
			expected: [
				0,
				false,
				'a',
				{
					c: true,
				},
			],
		},
		{
			value: {
				a: [ 0, false, null, undefined, '', 'a' ],
				b: [ null, undefined, '' ],
				c: { d: null },
				e: [
					{
						f: null,
						g: true,
					},
					{
						h: undefined,
						i: '',
					},
				],
			},
			expected: {
				a: [ 0, false, 'a' ],
				e: [
					{
						g: true,
					},
				],
			},
		},
		{
			value: {
				$$type: 'test-type',
				value: {
					a: [ 0, false, null, undefined, '', 'a' ],
					b: [ null, undefined, '' ],
					c: { d: null },
					e: [
						{
							f: null,
							g: true,
						},
						{
							h: undefined,
							i: '',
						},
					],
				},
			},
			expected: {
				$$type: 'test-type',
				value: {
					a: [ 0, false, 'a' ],
					e: [
						{
							g: true,
						},
					],
				},
			},
		},
	] )( 'should filter empty values from %s', ( { value, expected } ) => {
		expect( filterEmptyValues( value ) ).toStrictEqual( expected );
	} );
} );
