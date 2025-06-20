import { createStyleVariablesRepository } from '../create-style-variables-repository';
import { colorVariablePropTypeUtil } from '../prop-types/color-variable-prop-type';
import { fontVariablePropTypeUtil } from '../prop-types/font-variable-prop-type';

describe( 'createStyleVariablesRepository', () => {
	it( 'should be able to update a single variable', () => {
		// Arrange.
		const repo = createStyleVariablesRepository();
		const callback = jest.fn();

		repo.subscribe( callback );

		// Act.
		repo.update( {
			'e-gc-3rT6q1': {
				value: '#fff001',
				label: 'Main: Primary Color',
				type: colorVariablePropTypeUtil.key,
			},
		} );

		// Assert.
		expect( callback ).toHaveBeenCalledTimes( 1 );
		expect( callback ).toHaveBeenCalledWith( { 'e-gc-3rT6q1': '#fff001' } );
	} );

	it( 'should be able to update multiple variables', () => {
		// Arrange.
		const repo = createStyleVariablesRepository();
		const callback = jest.fn();
		repo.subscribe( callback );

		// Act.
		repo.update( {
			'e-gc-001': {
				value: '#3E5879',
				label: 'Navy: secondary',
				type: colorVariablePropTypeUtil.key,
			},
			'e-gf-005': {
				value: 'Roboto',
				label: 'MAIN: Roboto',
				type: fontVariablePropTypeUtil.key,
			},
		} );

		// Assert.
		expect( callback ).toHaveBeenCalledTimes( 1 );
		expect( callback ).toHaveBeenCalledWith( {
			'e-gc-001': '#3E5879',
			'e-gf-005': 'Roboto',
		} );
	} );

	it( 'should not notify when updating a variable with the same value', () => {
		// Arrange.
		const repo = createStyleVariablesRepository();
		const callback = jest.fn();

		repo.update( {
			'e-gc-d04': {
				value: '#85A947',
				label: 'Green: background',
				type: colorVariablePropTypeUtil.key,
			},
		} );

		repo.subscribe( callback );

		// Act.
		repo.update( {
			'e-gc-d04': {
				value: '#85A947',
				label: 'Light Green: main background',
				type: colorVariablePropTypeUtil.key,
			},
		} );

		// Assert.
		expect( callback ).not.toHaveBeenCalled();
	} );

	it( 'should notify when updating a variable with a different value', () => {
		// Arrange
		const repo = createStyleVariablesRepository();
		const callback = jest.fn();

		// First update to set the initial value
		repo.update( {
			'e-gc-c04': {
				value: '#EEEEEE',
				label: 'Violet: background',
				type: colorVariablePropTypeUtil.key,
			},
		} );

		// Subscribe after the initial update
		repo.subscribe( callback );

		// Act - update with a different value
		repo.update( {
			'e-gc-c04': {
				value: '#D4BEE4',
				label: 'Violet: background',
				type: colorVariablePropTypeUtil.key,
			},
		} );

		// Assert
		expect( callback ).toHaveBeenCalledTimes( 1 );
		expect( callback ).toHaveBeenCalledWith( { 'e-gc-c04': '#D4BEE4' } );
	} );

	it( 'should return an unsubscribe function that stops notifications', () => {
		// Arrange
		const repo = createStyleVariablesRepository();
		const callback = jest.fn();
		const unsubscribe = repo.subscribe( callback );

		// Act - unsubscribe and then update
		unsubscribe();

		repo.update( {
			'test-variable': {
				value: 'test-value',
				label: 'Test Variable',
				type: 'color',
			},
		} );

		// Assert
		expect( callback ).not.toHaveBeenCalled();
	} );
} );
