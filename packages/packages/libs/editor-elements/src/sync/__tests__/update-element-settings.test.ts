import { createMockPropType } from 'test-utils';
import { updateElementSettings } from '@elementor/editor-elements';
import { type PropsSchema } from '@elementor/editor-props';
import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';

import { getContainer } from '../get-container';
import { buildInverseDependencyGraph } from '../get-element-setting';

jest.mock( '../get-container' );
jest.mock( '@elementor/editor-v1-adapters' );

describe( 'updateElementSettings', () => {
	it( 'should update element settings with history', () => {
		// Arrange.
		const element = { id: 'test-element-id' };
		const props = { testProp: 'test-value' };

		jest.mocked( getContainer ).mockImplementation( ( elementId ) => {
			return elementId === element.id ? ( element as never ) : null;
		} );

		// Act.
		updateElementSettings( {
			id: element.id,
			props,
		} );

		// Assert.
		expect( runCommandSync ).toHaveBeenCalledWith( 'document/elements/settings', {
			container: element,
			settings: props,
		} );
	} );

	it( 'should update element settings without history', () => {
		// Arrange.
		const element = { id: 'test-element-id' };
		const props = { testProp: 'test-value' };

		jest.mocked( getContainer ).mockImplementation( ( elementId ) => {
			return elementId === element.id ? ( element as never ) : null;
		} );

		// Act.
		updateElementSettings( {
			id: element.id,
			props,
			withHistory: false,
		} );

		// Assert.
		expect( runCommandSync ).toHaveBeenCalledWith(
			'document/elements/set-settings',
			{
				container: element,
				settings: props,
			},
			{ internal: true }
		);
	} );

	describe( 'buildInverseDependencyGraph', () => {
		describe( 'Basic functionality', () => {
			it( 'should return empty graph for empty schema', () => {
				// Arrange & Act.
				const result = buildInverseDependencyGraph( {} );

				// Assert.
				expect( result ).toEqual( {} );
			} );

			it( 'should return empty graph for null schema', () => {
				// Arrange & Act.
				const result = buildInverseDependencyGraph( null as never );

				// Assert.
				expect( result ).toEqual( {} );
			} );

			it( 'should return empty graph for non-object schema', () => {
				// Arrange & Act.
				const result = buildInverseDependencyGraph( 'invalid' as never );

				// Assert.
				expect( result ).toEqual( {} );
			} );

			it( 'should handle props without dependencies', () => {
				// Arrange.
				const schema: PropsSchema = {
					'prop-a': createMockPropType( { kind: 'plain' } ),
					'prop-b': createMockPropType( { kind: 'plain' } ),
				};

				// Act.
				const result = buildInverseDependencyGraph( schema );

				// Assert.
				expect( result ).toEqual( {} );
			} );
		} );

		describe( 'Simple dependencies', () => {
			it( 'should build graph for single dependency', () => {
				// Arrange.
				const schema: PropsSchema = {
					'source-prop': createMockPropType( { kind: 'plain' } ),
					'dependent-prop': createMockPropType( {
						kind: 'plain',
						dependencies: {
							relation: 'or',
							terms: [
								{
									operator: 'eq',
									path: [ 'source-prop' ],
									value: 'enable',
								},
							],
						},
					} ),
				};

				// Act.
				const result = buildInverseDependencyGraph( schema );

				// Assert.
				expect( result ).toEqual( {
					'source-prop': [ 'dependent-prop' ],
				} );
			} );

			it( 'should build graph for multiple dependencies on same source', () => {
				// Arrange.
				const schema: PropsSchema = {
					'source-prop': createMockPropType( { kind: 'plain' } ),
					'dependent-a': createMockPropType( {
						kind: 'plain',
						dependencies: {
							relation: 'or',
							terms: [
								{
									operator: 'ne',
									path: [ 'source-prop' ],
									value: 'disable',
								},
							],
						},
					} ),
					'dependent-b': createMockPropType( {
						kind: 'plain',
						dependencies: {
							relation: 'and',
							terms: [
								{
									operator: 'exists',
									path: [ 'source-prop' ],
									value: null,
								},
							],
						},
					} ),
				};

				// Act.
				const result = buildInverseDependencyGraph( schema );

				// Assert.
				expect( result ).toEqual( {
					'source-prop': [ 'dependent-a', 'dependent-b' ],
				} );
			} );

			it( 'should handle multiple dependency terms', () => {
				// Arrange.
				const schema: PropsSchema = {
					'source-a': createMockPropType( { kind: 'plain' } ),
					'source-b': createMockPropType( { kind: 'plain' } ),
					'dependent-prop': createMockPropType( {
						kind: 'plain',
						dependencies: {
							relation: 'and',
							terms: [
								{
									operator: 'eq',
									path: [ 'source-a' ],
									value: 'value-a',
								},
								{
									operator: 'ne',
									path: [ 'source-b' ],
									value: 'value-b',
								},
							],
						},
					} ),
				};

				// Act.
				const result = buildInverseDependencyGraph( schema );

				// Assert.
				expect( result ).toEqual( {
					'source-a': [ 'dependent-prop' ],
					'source-b': [ 'dependent-prop' ],
				} );
			} );
		} );

		describe( 'Object prop dependencies', () => {
			it( 'should build graph for object prop with nested dependencies', () => {
				// Arrange.
				const schema: PropsSchema = {
					'parent-prop': createMockPropType( {
						kind: 'object',
						shape: {
							'child-a': createMockPropType( { kind: 'plain' } ),
							'child-b': createMockPropType( {
								kind: 'plain',
								dependencies: {
									relation: 'or',
									terms: [
										{
											operator: 'eq',
											path: [ 'target-prop' ],
											value: 'enable-child',
										},
									],
								},
							} ),
						},
					} ),
					'target-prop': createMockPropType( { kind: 'plain' } ),
				};

				// Act.
				const result = buildInverseDependencyGraph( schema );

				// Assert.
				expect( result ).toEqual( {
					'target-prop': [ 'parent-prop.child-b' ],
				} );
			} );

			it( 'should handle deeply nested object dependencies', () => {
				// Arrange.
				const schema: PropsSchema = {
					'level-one': createMockPropType( {
						kind: 'object',
						shape: {
							'level-two': createMockPropType( {
								kind: 'object',
								shape: {
									'level-three': createMockPropType( {
										kind: 'plain',
										dependencies: {
											relation: 'or',
											terms: [
												{
													operator: 'exists',
													path: [ 'external-prop' ],
													value: null,
												},
											],
										},
									} ),
								},
							} ),
						},
					} ),
					'external-prop': createMockPropType( { kind: 'plain' } ),
				};

				// Act.
				const result = buildInverseDependencyGraph( schema );

				// Assert.
				expect( result ).toEqual( {
					'external-prop': [ 'level-one.level-two.level-three' ],
				} );
			} );

			it( 'should handle object prop depending on nested prop', () => {
				// Arrange.
				const schema: PropsSchema = {
					settings: createMockPropType( {
						kind: 'object',
						shape: {
							mode: createMockPropType( { kind: 'plain' } ),
							advanced: createMockPropType( {
								kind: 'object',
								shape: {
									option: createMockPropType( { kind: 'plain' } ),
								},
							} ),
						},
					} ),
					'dependent-control': createMockPropType( {
						kind: 'plain',
						dependencies: {
							relation: 'and',
							terms: [
								{
									operator: 'eq',
									path: [ 'settings', 'mode' ],
									value: 'advanced',
								},
								{
									operator: 'ne',
									path: [ 'settings', 'advanced', 'option' ],
									value: 'disabled',
								},
							],
						},
					} ),
				};

				// Act.
				const result = buildInverseDependencyGraph( schema );

				// Assert.
				expect( result ).toEqual( {
					'settings.mode': [ 'dependent-control' ],
					'settings.advanced.option': [ 'dependent-control' ],
				} );
			} );
		} );

		describe( 'Array prop dependencies', () => {
			it( 'should build graph for array prop with item dependencies', () => {
				// Arrange.
				const schema: PropsSchema = {
					items: createMockPropType( {
						kind: 'array',
						item_prop_type: createMockPropType( {
							kind: 'plain',
							dependencies: {
								relation: 'or',
								terms: [
									{
										operator: 'exists',
										path: [ 'enable-items' ],
										value: null,
									},
								],
							},
						} ),
					} ),
					'enable-items': createMockPropType( { kind: 'plain' } ),
				};

				// Act.
				const result = buildInverseDependencyGraph( schema );

				// Assert.
				expect( result ).toEqual( {
					'enable-items': [ 'items' ],
				} );
			} );

			it( 'should handle array of objects with nested dependencies', () => {
				// Arrange.
				const schema: PropsSchema = {
					items: createMockPropType( {
						kind: 'array',
						item_prop_type: createMockPropType( {
							kind: 'object',
							shape: {
								title: createMockPropType( { kind: 'plain' } ),
								content: createMockPropType( {
									kind: 'plain',
									dependencies: {
										relation: 'or',
										terms: [
											{
												operator: 'ne',
												path: [ 'global-setting' ],
												value: 'hide-content',
											},
										],
									},
								} ),
							},
						} ),
					} ),
					'global-setting': createMockPropType( { kind: 'plain' } ),
				};

				// Act.
				const result = buildInverseDependencyGraph( schema );

				// Assert.
				expect( result ).toEqual( {
					'global-setting': [ 'items.content' ],
				} );
			} );
		} );

		describe( 'Union prop dependencies', () => {
			it( 'should build graph for union prop with multiple type dependencies', () => {
				// Arrange.
				const schema: PropsSchema = {
					layout: createMockPropType( {
						kind: 'union',
						prop_types: {
							grid: createMockPropType( {
								kind: 'object',
								shape: {
									columns: createMockPropType( {
										kind: 'plain',
										dependencies: {
											relation: 'or',
											terms: [
												{
													operator: 'eq',
													path: [ 'responsive-mode' ],
													value: 'desktop',
												},
											],
										},
									} ),
								},
							} ),
							list: createMockPropType( {
								kind: 'object',
								shape: {
									spacing: createMockPropType( {
										kind: 'plain',
										dependencies: {
											relation: 'or',
											terms: [
												{
													operator: 'exists',
													path: [ 'show-spacing' ],
													value: null,
												},
											],
										},
									} ),
								},
							} ),
						},
					} ),
					'responsive-mode': createMockPropType( { kind: 'plain' } ),
					'show-spacing': createMockPropType( { kind: 'plain' } ),
				};

				// Act.
				const result = buildInverseDependencyGraph( schema );

				// Assert.
				expect( result ).toEqual( {
					'responsive-mode': [ 'layout.grid.columns' ],
					'show-spacing': [ 'layout.list.spacing' ],
				} );
			} );

			it( 'should handle union with array prop types', () => {
				// Arrange.
				const schema: PropsSchema = {
					content: createMockPropType( {
						kind: 'union',
						prop_types: {
							items: createMockPropType( {
								kind: 'array',
								item_prop_type: createMockPropType( {
									kind: 'plain',
									dependencies: {
										relation: 'or',
										terms: [
											{
												operator: 'ne',
												path: [ 'display-mode' ],
												value: 'hidden',
											},
										],
									},
								} ),
							} ),
							text: createMockPropType( { kind: 'plain' } ),
						},
					} ),
					'display-mode': createMockPropType( { kind: 'plain' } ),
				};

				// Act.
				const result = buildInverseDependencyGraph( schema );

				// Assert.
				expect( result ).toEqual( {
					'display-mode': [ 'content.items' ],
				} );
			} );
		} );

		describe( 'Complex nested dependencies', () => {
			it( 'should handle complex mixed structure dependencies', () => {
				// Arrange.
				const schema: PropsSchema = {
					settings: createMockPropType( {
						kind: 'object',
						shape: {
							layout: createMockPropType( {
								kind: 'union',
								prop_types: {
									advanced: createMockPropType( {
										kind: 'object',
										shape: {
											items: createMockPropType( {
												kind: 'array',
												item_prop_type: createMockPropType( {
													kind: 'object',
													shape: {
														visible: createMockPropType( {
															kind: 'plain',
															dependencies: {
																relation: 'and',
																terms: [
																	{
																		operator: 'eq',
																		path: [ 'global-visibility' ],
																		value: true,
																	},
																	{
																		operator: 'ne',
																		path: [ 'mode' ],
																		value: 'disabled',
																	},
																],
															},
														} ),
													},
												} ),
											} ),
										},
									} ),
								},
							} ),
						},
					} ),
					'global-visibility': createMockPropType( { kind: 'plain' } ),
					mode: createMockPropType( { kind: 'plain' } ),
				};

				// Act.
				const result = buildInverseDependencyGraph( schema );

				// Assert.
				expect( result ).toEqual( {
					'global-visibility': [ 'settings.layout.advanced.items.visible' ],
					mode: [ 'settings.layout.advanced.items.visible' ],
				} );
			} );

			it( 'should handle nested dependency with multiple relation types', () => {
				// Arrange.
				const schema: PropsSchema = {
					'source-a': createMockPropType( { kind: 'plain' } ),
					'source-b': createMockPropType( { kind: 'plain' } ),
					'source-c': createMockPropType( { kind: 'plain' } ),
					'complex-prop': createMockPropType( {
						kind: 'plain',
						dependencies: {
							relation: 'and',
							terms: [
								{
									relation: 'or',
									terms: [
										{
											operator: 'eq',
											path: [ 'source-a' ],
											value: 'option-1',
										},
										{
											operator: 'eq',
											path: [ 'source-b' ],
											value: 'option-2',
										},
									],
								},
								{
									operator: 'exists',
									path: [ 'source-c' ],
									value: null,
								},
							],
						},
					} ),
				};

				// Act.
				const result = buildInverseDependencyGraph( schema );

				// Assert.
				expect( result ).toEqual( {
					'source-a': [ 'complex-prop' ],
					'source-b': [ 'complex-prop' ],
					'source-c': [ 'complex-prop' ],
				} );
			} );
		} );

		describe( 'Edge cases and error handling', () => {
			it( 'should avoid duplicate dependencies', () => {
				// Arrange.
				const schema: PropsSchema = {
					source: createMockPropType( { kind: 'plain' } ),
					'dependent-a': createMockPropType( {
						kind: 'plain',
						dependencies: {
							relation: 'or',
							terms: [
								{
									operator: 'eq',
									path: [ 'source' ],
									value: 'value-1',
								},
								{
									operator: 'ne',
									path: [ 'source' ],
									value: 'value-2',
								},
							],
						},
					} ),
					'dependent-b': createMockPropType( {
						kind: 'plain',
						dependencies: {
							relation: 'or',
							terms: [
								{
									operator: 'exists',
									path: [ 'source' ],
									value: null,
								},
							],
						},
					} ),
				};

				// Act.
				const result = buildInverseDependencyGraph( schema );

				// Assert.
				expect( result ).toEqual( {
					source: [ 'dependent-a', 'dependent-b' ],
				} );
			} );

			it( 'should detect circular dependencies and throw error', () => {
				// Arrange.
				const schema: PropsSchema = {
					'prop-a': createMockPropType( {
						kind: 'plain',
						dependencies: {
							relation: 'or',
							terms: [
								{
									operator: 'eq',
									path: [ 'prop-b' ],
									value: 'enable',
								},
							],
						},
					} ),
					'prop-b': createMockPropType( {
						kind: 'plain',
						dependencies: {
							relation: 'or',
							terms: [
								{
									operator: 'ne',
									path: [ 'prop-a' ],
									value: 'disable',
								},
							],
						},
					} ),
				};

				// Act & Assert.
				expect( () => buildInverseDependencyGraph( schema ) ).toThrow( 'Circular prop dependencies detected' );
			} );

			it( 'should detect circular dependencies in complex nested structure', () => {
				// Arrange.
				const schema: PropsSchema = {
					settings: createMockPropType( {
						kind: 'object',
						shape: {
							layout: createMockPropType( {
								kind: 'plain',
								dependencies: {
									relation: 'or',
									terms: [
										{
											operator: 'eq',
											path: [ 'responsive', 'mode' ],
											value: 'mobile',
										},
									],
								},
							} ),
						},
					} ),
					responsive: createMockPropType( {
						kind: 'object',
						shape: {
							mode: createMockPropType( {
								kind: 'plain',
								dependencies: {
									relation: 'or',
									terms: [
										{
											operator: 'ne',
											path: [ 'settings', 'layout' ],
											value: 'fixed',
										},
									],
								},
							} ),
						},
					} ),
				};

				// Act & Assert.
				expect( () => buildInverseDependencyGraph( schema ) ).toThrow( 'Circular prop dependencies detected' );
			} );

			it( 'should handle all dependency operators correctly', () => {
				// Arrange.
				const operators = [
					'lt',
					'lte',
					'eq',
					'ne',
					'gte',
					'gt',
					'exists',
					'not_exist',
					'in',
					'nin',
					'contains',
					'ncontains',
				] as const;

				const schema: PropsSchema = {
					source: createMockPropType( { kind: 'plain' } ),
					...Object.fromEntries(
						operators.map( ( operator, index ) => [
							`dependent-${ operator }`,
							createMockPropType( {
								kind: 'plain',
								dependencies: {
									relation: 'or',
									terms: [
										{
											operator,
											path: [ 'source' ],
											value: `value-${ index }`,
										},
									],
								},
							} ),
						] )
					),
				};

				// Act.
				const result = buildInverseDependencyGraph( schema );

				// Assert.
				expect( result ).toEqual( {
					source: operators.map( ( op ) => `dependent-${ op }` ),
				} );
			} );
		} );
	} );
} );
