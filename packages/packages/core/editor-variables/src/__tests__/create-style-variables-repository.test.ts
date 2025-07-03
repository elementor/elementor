import { createStyleVariablesRepository } from '../create-style-variables-repository';
import { colorVariablePropTypeUtil } from '../prop-types/color-variable-prop-type';
import { fontVariablePropTypeUtil } from '../prop-types/font-variable-prop-type';
import * as enqueueModule from '../sync/enqueue-font';

jest.mock( '../sync/enqueue-font' );

describe( 'createStyleVariablesRepository', () => {
	const mockEnqueueFont = jest.mocked( enqueueModule.enqueueFont );

	beforeEach( () => {
		jest.clearAllMocks();
		mockEnqueueFont.mockImplementation( () => {} );
	} );

	it( 'should be able to update a single variable', () => {
		// Arrange.
		const repo = createStyleVariablesRepository();
		const callback = jest.fn();

		repo.subscribe( callback );

		// Act.
		repo.update( {
			'e-gc-a1': {
				value: '#fff001',
				label: 'main-primary-color',
				type: colorVariablePropTypeUtil.key,
			},
		} );

		// Assert.
		expect( callback ).toHaveBeenCalledTimes( 1 );
		expect( callback ).toHaveBeenCalledWith( {
			'e-gc-a1': {
				value: '#fff001',
				label: 'main-primary-color',
				type: 'global-color-variable',
			},
		} );
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
				label: 'navy-secondary',
				type: colorVariablePropTypeUtil.key,
			},
			'e-gf-005': {
				value: 'Roboto',
				label: 'main-roboto',
				type: fontVariablePropTypeUtil.key,
			},
		} );

		// Assert.
		expect( callback ).toHaveBeenCalledTimes( 1 );
		expect( callback ).toHaveBeenCalledWith( {
			'e-gc-001': {
				value: '#3E5879',
				label: 'navy-secondary',
				type: 'global-color-variable',
			},
			'e-gf-005': {
				value: 'Roboto',
				label: 'main-roboto',
				type: 'global-font-variable',
			},
		} );
	} );

	it( 'should not notify when updating a variable with the same value', () => {
		// Arrange.
		const repo = createStyleVariablesRepository();
		const callback = jest.fn();

		repo.update( {
			'e-gc-d04': {
				value: '#85A947',
				label: 'green-background',
				type: colorVariablePropTypeUtil.key,
			},
		} );

		repo.subscribe( callback );

		// Act.
		repo.update( {
			'e-gc-d04': {
				value: '#85A947',
				label: 'green-background',
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
				label: 'violet-background',
				type: colorVariablePropTypeUtil.key,
			},
		} );

		// Subscribe after the initial update
		repo.subscribe( callback );

		// Act - update with a different value
		repo.update( {
			'e-gc-c04': {
				value: '#D4BEE4',
				label: 'violet-background',
				type: colorVariablePropTypeUtil.key,
			},
		} );

		// Assert
		expect( callback ).toHaveBeenCalledTimes( 1 );
		expect( callback ).toHaveBeenCalledWith( {
			'e-gc-c04': {
				value: '#D4BEE4',
				label: 'violet-background',
				type: 'global-color-variable',
			},
		} );
	} );

	it( 'should notify when updating a variable with a different label', () => {
		// Arrange
		const repo = createStyleVariablesRepository();
		const callback = jest.fn();

		// First update to set the initial value
		repo.update( {
			'e-gc-c04': {
				value: '#EEEEEE',
				label: 'violet-background',
				type: colorVariablePropTypeUtil.key,
			},
		} );

		// Subscribe after the initial update
		repo.subscribe( callback );

		// Act - update with a different value
		repo.update( {
			'e-gc-c04': {
				value: '#D4BEE4',
				label: 'violet-background-new',
				type: colorVariablePropTypeUtil.key,
			},
		} );

		// Assert
		expect( callback ).toHaveBeenCalledTimes( 1 );
		expect( callback ).toHaveBeenCalledWith( {
			'e-gc-c04': {
				value: '#D4BEE4',
				label: 'violet-background-new',
				type: 'global-color-variable',
			},
		} );
	} );

	it( 'should notify when updating a variable that was deleted', () => {
		// Arrange
		const repo = createStyleVariablesRepository();
		const callback = jest.fn();

		// First update to set the initial value
		repo.update( {
			'e-gc-c04': {
				value: 'red',
				label: 'red-background',
				type: colorVariablePropTypeUtil.key,
			},
		} );

		// Subscribe after the initial update
		repo.subscribe( callback );

		// Act - update with a different value
		repo.update( {
			'e-gc-c04': {
				value: 'red',
				label: 'red-background',
				type: colorVariablePropTypeUtil.key,
				deleted: true,
			},
		} );

		// Assert
		expect( callback ).toHaveBeenCalledTimes( 1 );
		expect( callback ).toHaveBeenCalledWith( {
			'e-gc-c04': {
				value: 'red',
				label: 'red-background',
				type: 'global-color-variable',
				deleted: true,
			},
		} );
	} );

	it( 'should notify when updating a variable with a different label', () => {
		// Arrange
		const repo = createStyleVariablesRepository();
		const callback = jest.fn();

		// First update to set the initial value
		repo.update( {
			'e-gc-c04': {
				value: '#EEEEEE',
				label: 'violet-background',
				type: colorVariablePropTypeUtil.key,
			},
		} );

		// Subscribe after the initial update
		repo.subscribe( callback );

		// Act - update with a different value
		repo.update( {
			'e-gc-c04': {
				value: '#D4BEE4',
				label: 'violet-background-new',
				type: colorVariablePropTypeUtil.key,
			},
		} );

		// Assert
		expect( callback ).toHaveBeenCalledTimes( 1 );
		expect( callback ).toHaveBeenCalledWith( {
			'e-gc-c04': {
				value: '#D4BEE4',
				label: 'violet-background-new',
				type: 'global-color-variable',
			},
		} );
	} );

	it( 'should notify when updating a variable that was restored', () => {
		// Arrange
		const repo = createStyleVariablesRepository();
		const callback = jest.fn();

		// First update to set the initial value
		repo.update( {
			'e-gc-c04': {
				value: 'red',
				label: 'red-background',
				type: colorVariablePropTypeUtil.key,
				deleted: true,
			},
		} );

		// Subscribe after the initial update
		repo.subscribe( callback );

		// Act - update with a different value
		repo.update( {
			'e-gc-c04': {
				value: 'red',
				label: 'red-background',
				type: colorVariablePropTypeUtil.key,
			},
		} );

		// Assert
		expect( callback ).toHaveBeenCalledTimes( 1 );
		expect( callback ).toHaveBeenCalledWith( {
			'e-gc-c04': {
				value: 'red',
				label: 'red-background',
				type: 'global-color-variable',
			},
		} );
	} );

	it( 'should not notify when updating a variable that was deleted and stays deleted', () => {
		// Arrange
		const repo = createStyleVariablesRepository();
		const callback = jest.fn();

		// First update to set the initial value
		repo.update( {
			'e-gc-c04': {
				value: 'red',
				label: 'red-background',
				type: colorVariablePropTypeUtil.key,
				deleted: true,
			},
		} );

		// Subscribe after the initial update
		repo.subscribe( callback );

		// Act - update with a different value
		repo.update( {
			'e-gc-c04': {
				value: 'red',
				label: 'red-background',
				type: colorVariablePropTypeUtil.key,
				deleted: true,
			},
		} );

		// Assert
		expect( callback ).toHaveBeenCalledTimes( 0 );
		expect( callback ).not.toHaveBeenCalledWith( {
			'e-gc-c04': {
				value: 'red',
				label: 'red-background',
				type: 'global-color-variable',
				deleted: true,
			},
		} );
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

	it( 'should enqueue font when font variable is added', () => {
		// Arrange.
		const repo = createStyleVariablesRepository();
		const fontFamily = 'Arial, sans-serif';
		const variables = {
			'font-var-1': {
				label: 'My Font Variable',
				value: fontFamily,
				type: fontVariablePropTypeUtil.key,
			},
		};

		// Act.
		repo.update( variables );

		// Assert.
		expect( mockEnqueueFont ).toHaveBeenCalledWith( fontFamily );
		expect( mockEnqueueFont ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should not enqueue font if value has not changed', () => {
		// Arrange.
		const repository = createStyleVariablesRepository();
		const fontFamily = 'Open Sans, sans-serif';
		const variables = {
			'font-var-1': {
				label: 'Font Variable',
				value: fontFamily,
				type: fontVariablePropTypeUtil.key,
			},
		};

		// Act.
		repository.update( variables );

		variables[ 'font-var-1' ].label = 'Font Variable Updated';

		// Second update with same values
		repository.update( variables );

		// Assert.
		expect( mockEnqueueFont ).toHaveBeenCalledWith( fontFamily );
		expect( mockEnqueueFont ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should not enqueue font for non-font variables', () => {
		// Arrange.
		const repository = createStyleVariablesRepository();
		const variables = {
			'color-var-1': {
				label: 'Color Variable',
				value: '#ff0000',
				type: colorVariablePropTypeUtil.key,
			},
			'text-var-1': {
				label: 'Text Variable',
				value: 'Some text',
				type: 'text',
			},
		};

		// Act.
		repository.update( variables );

		// Assert.
		expect( mockEnqueueFont ).not.toHaveBeenCalled();
	} );

	it( 'should handle empty font family values', () => {
		// Arrange.
		const repository = createStyleVariablesRepository();
		const variables = {
			'font-var-1': {
				label: 'Empty Font Variable',
				value: '',
				type: fontVariablePropTypeUtil.key,
			},
		};

		// Act.
		repository.update( variables );

		// Assert.
		expect( mockEnqueueFont ).not.toHaveBeenCalled();
	} );

	it( 'should handle font enqueue errors gracefully without throwing', () => {
		// Arrange.
		const repository = createStyleVariablesRepository();
		const fontFamily = 'Arial, sans-serif';

		mockEnqueueFont.mockImplementation( () => {
			throw new Error( 'Failed to enqueue font' );
		} );

		// Act.
		const variables = {
			'font-var-1': {
				label: 'Error Font Variable',
				value: fontFamily,
				type: fontVariablePropTypeUtil.key,
			},
		};

		// Assert.
		expect( () => {
			repository.update( variables );
		} ).not.toThrow();

		expect( mockEnqueueFont ).toHaveBeenCalledWith( fontFamily );
	} );
} );
