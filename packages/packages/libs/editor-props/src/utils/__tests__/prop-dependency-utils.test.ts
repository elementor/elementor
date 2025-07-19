import { type Dependency, type DependencyTerm, type PropValue } from '../../types';
import { evaluateTerm, isDependencyMet } from '../prop-dependency-utils';

type TestCase = DependencyTerm & {
	description: string;
	expected: boolean;
	actualValue: PropValue;
};

describe( 'prop-dependency-utils', () => {
	describe( 'evaluateTerm', () => {
		describe( 'equality operators', () => {
			it.each( [
				{
					operator: 'eq',
					actualValue: 'test',
					value: 'test',
					expected: true,
					description: 'should return true when values are equal',
				},
				{
					operator: 'eq',
					actualValue: 'test',
					value: 'different',
					expected: false,
					description: 'should return false when values are not equal',
				},
				{
					operator: 'eq',
					actualValue: 5,
					value: 5,
					expected: true,
					description: 'should return true when numbers are equal',
				},
				{
					operator: 'eq',
					actualValue: true,
					value: true,
					expected: true,
					description: 'should return true when booleans are equal',
				},
				{
					operator: 'ne',
					actualValue: 'test',
					value: 'different',
					expected: true,
					description: 'should return true when values are not equal',
				},
				{
					operator: 'ne',
					actualValue: 'test',
					value: 'test',
					expected: false,
					description: 'should return false when values are equal',
				},
			] as TestCase[] )( '$description', ( { operator, actualValue, value, expected } ) => {
				const term: DependencyTerm = {
					operator,
					path: [ 'test' ],
					value,
				};

				expect( evaluateTerm( term, actualValue ) ).toBe( expected );
			} );
		} );

		describe( 'numeric comparison operators', () => {
			it.each( [
				{
					operator: 'gt',
					actualValue: 10,
					value: 5,
					expected: true,
					description: 'should return true when actual value is greater than target',
				},
				{
					operator: 'gt',
					actualValue: 5,
					value: 10,
					expected: false,
					description: 'should return false when actual value is not greater than target',
				},
				{
					operator: 'gt',
					actualValue: '10',
					value: '5',
					expected: false,
					description: 'should not handle string numbers for greater than',
				},
				{
					operator: 'gt',
					actualValue: 'invalid',
					value: 5,
					expected: false,
					description: 'should return false for invalid numbers',
				},
				{
					operator: 'gte',
					actualValue: 10,
					value: 10,
					expected: true,
					description: 'should return true when actual value is greater than or equal to target',
				},
				{
					operator: 'gte',
					actualValue: 5,
					value: 10,
					expected: false,
					description: 'should return false when actual value is less than target',
				},
				{
					operator: 'lt',
					actualValue: 5,
					value: 10,
					expected: true,
					description: 'should return true when actual value is less than target',
				},
				{
					operator: 'lt',
					actualValue: 10,
					value: 5,
					expected: false,
					description: 'should return false when actual value is not less than target',
				},
				{
					operator: 'lte',
					actualValue: 10,
					value: 10,
					expected: true,
					description: 'should return true when actual value is less than or equal to target',
				},
				{
					operator: 'lte',
					actualValue: 15,
					value: 10,
					expected: false,
					description: 'should return false when actual value is greater than target',
				},
			] as TestCase[] )( '$description', ( { operator, actualValue, value, expected } ) => {
				const term: DependencyTerm = {
					operator,
					path: [ 'test' ],
					value,
				};

				expect( evaluateTerm( term, actualValue ) ).toBe( expected );
			} );
		} );

		describe( 'array operators', () => {
			it.each( [
				{
					operator: 'in',
					actualValue: 'apple',
					value: [ 'apple', 'banana', 'orange' ],
					expected: true,
					description: 'should return true when value is in array',
				},
				{
					operator: 'in',
					actualValue: 'grape',
					value: [ 'apple', 'banana', 'orange' ],
					expected: false,
					description: 'should return false when value is not in array',
				},
				{
					operator: 'in',
					actualValue: 5,
					value: [ 1, 2, 3, 4, 5 ],
					expected: true,
					description: 'should handle numbers in arrays',
				},
				{
					operator: 'nin',
					actualValue: 'grape',
					value: [ 'apple', 'banana', 'orange' ],
					expected: true,
					description: 'should return true when value is not in array',
				},
				{
					operator: 'nin',
					actualValue: 'apple',
					value: [ 'apple', 'banana', 'orange' ],
					expected: false,
					description: 'should return false when value is in array',
				},
				{
					operator: 'in',
					actualValue: 'test',
					value: 'not-an-array',
					expected: false,
					description: 'should return false when value is not an array',
				},
			] as TestCase[] )( '$description', ( { operator, actualValue, value, expected } ) => {
				const term: DependencyTerm = {
					operator,
					path: [ 'test' ],
					value,
				};

				expect( evaluateTerm( term, actualValue ) ).toBe( expected );
			} );
		} );

		describe( 'string operators', () => {
			it.each( [
				{
					operator: 'contains',
					actualValue: 'hello world',
					value: 'world',
					expected: true,
					description: 'should return true when string contains substring',
				},
				{
					operator: 'contains',
					actualValue: 'hello world',
					value: 'universe',
					expected: false,
					description: 'should return false when string does not contain substring',
				},
				{
					operator: 'ncontains',
					actualValue: 'hello world',
					value: 'universe',
					expected: true,
					description: 'should return true when string does not contain substring',
				},
				{
					operator: 'ncontains',
					actualValue: 'hello world',
					value: 'world',
					expected: false,
					description: 'should return false when string contains substring',
				},
				{
					operator: 'contains',
					actualValue: 123,
					value: 'test',
					expected: false,
					description: 'should return false when actual value is not a string',
				},
				{
					operator: 'contains',
					actualValue: 'hello world',
					value: 123,
					expected: false,
					description: 'should return false when target value is not a string',
				},
			] as TestCase[] )( '$description', ( { operator, actualValue, value, expected } ) => {
				const term: DependencyTerm = {
					operator,
					path: [ 'test' ],
					value,
				};

				expect( evaluateTerm( term, actualValue ) ).toBe( expected );
			} );
		} );

		describe( 'existence operators', () => {
			it.each( [
				{
					operator: 'exists',
					actualValue: 'test',
					value: null,
					expected: true,
					description: 'should return true when value exists (string)',
				},
				{
					operator: 'exists',
					actualValue: 0,
					value: null,
					expected: true,
					description: 'should return true when value exists (zero)',
				},
				{
					operator: 'exists',
					actualValue: false,
					value: null,
					expected: true,
					description: 'should return true when value exists (false)',
				},
				{
					operator: 'exists',
					actualValue: null,
					value: null,
					expected: false,
					description: 'should return false when value does not exist (null)',
				},
				{
					operator: 'exists',
					actualValue: undefined,
					value: null,
					expected: false,
					description: 'should return false when value does not exist (undefined)',
				},
				{
					operator: 'not_exist',
					actualValue: null,
					value: null,
					expected: true,
					description: 'should return true when value does not exist (null)',
				},
				{
					operator: 'not_exist',
					actualValue: undefined,
					value: null,
					expected: true,
					description: 'should return true when value does not exist (undefined)',
				},
				{
					operator: 'not_exist',
					actualValue: 0,
					value: null,
					expected: false,
					description: 'should return false when value exists (zero)',
				},
				{
					operator: 'not_exist',
					actualValue: 'test',
					value: null,
					expected: false,
					description: 'should return false when value exists (string)',
				},
			] as TestCase[] )( '$description', ( { operator, actualValue, value, expected } ) => {
				const term: DependencyTerm = {
					operator,
					path: [ 'test' ],
					value,
				};

				expect( evaluateTerm( term, actualValue ) ).toBe( expected );
			} );
		} );

		describe( 'unknown operators', () => {
			it( 'should return true for unknown operators', () => {
				const term: DependencyTerm = {
					operator: 'unknown' as never,
					path: [ 'test' ],
					value: 'test',
				};

				expect( evaluateTerm( term, 'test' ) ).toBe( true );
			} );
		} );
	} );

	describe( 'shouldApplyEffect', () => {
		describe( 'simple dependencies', () => {
			it( 'should return true when no terms are provided', () => {
				const dependency: Dependency = {
					relation: 'and',
					terms: [],
				};

				expect( isDependencyMet( dependency, {} ) ).toBe( true );
			} );

			it( 'should return true when all terms are met (AND)', () => {
				const values = {
					test1: {
						$$type: 'plain',
						value: 'value1',
					},
					test2: {
						$$type: 'plain',
						value: 10,
					},
				};

				const dependency: Dependency = {
					relation: 'and',
					terms: [
						{
							operator: 'eq',
							path: [ 'test1' ],
							value: 'value1',
						},
						{
							operator: 'gt',
							path: [ 'test2' ],
							value: 5,
						},
					],
				};

				expect( isDependencyMet( dependency, values ) ).toBe( true );
			} );

			it( 'should return false when any term is not met (AND)', () => {
				const values = {
					test1: {
						$$type: 'plain',
						value: 'value1',
					},
					test2: {
						$$type: 'plain',
						value: 10,
					},
				};

				const dependency: Dependency = {
					relation: 'and',
					terms: [
						{
							operator: 'eq',
							path: [ 'test1' ],
							value: 'value1',
						},
						{
							operator: 'gt',
							path: [ 'test2' ],
							value: 15,
						},
					],
				};

				expect( isDependencyMet( dependency, values ) ).toBe( false );
			} );

			it( 'should return true when any term is met (OR)', () => {
				const values = {
					test1: {
						$$type: 'string',
						value: 'different',
					},
					test2: {
						$$type: 'number',
						value: 10,
					},
				};
				const dependency: Dependency = {
					relation: 'or',
					terms: [
						{
							operator: 'eq',
							path: [ 'test1' ],
							value: 'value1',
						},
						{
							operator: 'gt',
							path: [ 'test2' ],
							value: 5,
						},
					],
				};

				expect( isDependencyMet( dependency, values ) ).toBe( true );
			} );

			it( 'should return false when no terms are met (OR)', () => {
				const values = {
					test1: {
						value: 'different',
					},
					test2: {
						value: 10,
					},
				};

				const dependency: Dependency = {
					relation: 'or',
					terms: [
						{
							operator: 'eq',
							path: [ 'test1' ],
							value: 'value1',
						},
						{
							operator: 'gt',
							path: [ 'test2' ],
							value: 15,
						},
					],
				};

				expect( isDependencyMet( dependency, values ) ).toBe( false );
			} );
		} );

		describe( 'nested dependencies', () => {
			it( 'should handle nested AND dependencies', () => {
				const values = {
					status: {
						$$type: 'string',
						value: 'active',
					},
					priority: {
						$$type: 'number',
						value: 8,
					},
					title: {
						$$type: 'string',
						value: 'This is an important message',
					},
				};

				const dependency: Dependency = {
					relation: 'and',
					terms: [
						{
							operator: 'eq',
							path: [ 'status' ],
							value: 'active',
						},
						{
							relation: 'and',
							terms: [
								{
									operator: 'gt',
									path: [ 'priority' ],
									value: 5,
								},
								{
									operator: 'contains',
									path: [ 'title' ],
									value: 'important',
								},
							],
						},
					],
				};

				expect( isDependencyMet( dependency, values ) ).toBe( true );
			} );

			it( 'should handle nested OR dependencies', () => {
				const values = {
					status: {
						$$type: 'string',
						value: 'inactive',
					},
					priority: {
						$$type: 'number',
						value: 8,
					},
					title: {
						$$type: 'string',
						value: 'This is an urgent message',
					},
				};

				const dependency: Dependency = {
					relation: 'or',
					terms: [
						{
							operator: 'eq',
							path: [ 'status' ],
							value: 'active',
						},
						{
							relation: 'or',
							terms: [
								{
									operator: 'gt',
									path: [ 'priority' ],
									value: 10,
								},
								{
									operator: 'contains',
									path: [ 'title' ],
									value: 'urgent',
								},
							],
						},
					],
				};

				expect( isDependencyMet( dependency, values ) ).toBe( true );
			} );

			it( 'should handle mixed nested dependencies', () => {
				const values = {
					user: {
						$$type: 'object',
						value: { id: 1, name: 'John' },
					},
					role: {
						$$type: 'string',
						value: 'user',
					},
					permissions: {
						$$type: 'string',
						value: 'write',
					},
				};

				const dependency: Dependency = {
					relation: 'and',
					terms: [
						{
							operator: 'exists',
							path: [ 'user' ],
							value: null,
						},
						{
							relation: 'or',
							terms: [
								{
									operator: 'eq',
									path: [ 'role' ],
									value: 'admin',
								},
								{
									operator: 'in',
									path: [ 'permissions' ],
									value: [ 'read', 'write' ],
								},
							],
						},
					],
				};

				expect( isDependencyMet( dependency, values ) ).toBe( true );
			} );
		} );

		describe( 'complex scenarios', () => {
			it( 'should handle deep nested dependencies', () => {
				const values = {
					environment: {
						$$type: 'string',
						value: 'production',
					},
					version: {
						$$type: 'nubmer',
						value: 2.1,
					},
					feature_flags: {
						$$type: 'object',
						value: { new_ui: true },
					},
					legacy_mode: {
						$$type: 'boolean',
						value: false,
					},
				};

				const dependency: Dependency = {
					relation: 'and',
					terms: [
						{
							operator: 'eq',
							path: [ 'environment' ],
							value: 'production',
						},
						{
							relation: 'and',
							terms: [
								{
									operator: 'gte',
									path: [ 'version' ],
									value: 2.0,
								},
								{
									relation: 'or',
									terms: [
										{
											operator: 'exists',
											path: [ 'feature_flags' ],
											value: null,
										},
										{
											operator: 'eq',
											path: [ 'legacy_mode' ],
											value: false,
										},
									],
								},
							],
						},
					],
				};

				expect( isDependencyMet( dependency, values ) ).toBe( true );
			} );

			it( 'should handle complex conditional logic', () => {
				const values = {
					user_type: {
						$$type: 'string',
						value: 'premium',
					},
					subscription_days: {
						$$type: 'number',
						value: 45,
					},
					capabilities: {
						$$type: 'string',
						value: 'basic_access',
					},
				};

				const dependency: Dependency = {
					relation: 'or',
					terms: [
						{
							relation: 'and',
							terms: [
								{
									operator: 'eq',
									path: [ 'user_type' ],
									value: 'premium',
								},
								{
									operator: 'gt',
									path: [ 'subscription_days' ],
									value: 30,
								},
							],
						},
						{
							relation: 'and',
							terms: [
								{
									operator: 'eq',
									path: [ 'user_type' ],
									value: 'admin',
								},
								{
									operator: 'contains',
									path: [ 'capabilities' ],
									value: 'beta_access',
								},
							],
						},
					],
				};

				expect( isDependencyMet( dependency, values ) ).toBe( true );
			} );
		} );

		describe( 'edge cases', () => {
			it( 'should throw error for unsupported relation', () => {
				const values = {
					test: {
						value: 'value',
					},
					test2: {
						value: 10,
					},
				};

				const dependency = {
					relation: 'xor',
					terms: [
						{
							operator: 'eq',
							path: [ 'test' ],
							value: 'value',
						},
					],
				} as unknown as Dependency;

				expect( () => isDependencyMet( dependency, values ) ).toThrow();
			} );

			it( 'should handle single term dependencies', () => {
				const values = {
					test: {
						$$type: 'string',
						value: 'value',
					},
					test2: {
						$$type: 'number',
						value: 10,
					},
				};

				const dependency: Dependency = {
					relation: 'and',
					terms: [
						{
							operator: 'eq',
							path: [ 'test' ],
							value: 'value',
						},
					],
				};

				expect( isDependencyMet( dependency, values ) ).toBe( true );
			} );

			it( 'should handle single term dependencies that fail', () => {
				const values = {
					test: {
						$$type: 'string',
						value: 'different',
					},
					test2: {
						$$type: 'number',
						value: 10,
					},
				};

				const dependency: Dependency = {
					relation: 'and',
					terms: [
						{
							operator: 'eq',
							path: [ 'test' ],
							value: 'value',
						},
					],
				};

				expect( isDependencyMet( dependency, values ) ).toBe( false );
			} );
		} );
	} );
} );
