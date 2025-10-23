import { act, renderHook } from '@testing-library/react';

import { useEditable } from '../use-editable';

describe( 'useEditable', () => {
	it( 'should return editable content attributes and handlers', () => {
		// Arrange & Act.
		const { result } = renderHook( () =>
			useEditable( {
				value: '',
				onSubmit: jest.fn(),
			} )
		);

		const props = result.current.getProps();

		// Assert.
		expect( props ).toEqual( {
			value: '',
			role: 'textbox',
			contentEditable: false,
			suppressContentEditableWarning: undefined,
			onBlur: expect.any( Function ),
			onClick: expect.any( Function ),
			onInput: expect.any( Function ),
			onKeyDown: expect.any( Function ),
		} );
	} );

	it( 'should set editable to true', () => {
		// Arrange & Act.
		const { result } = renderHook( () => useEditable( { value: '', onSubmit: jest.fn() } ) );

		// Assert.
		expect( result.current.isEditing ).toBe( false );

		// Act.
		act( result.current.openEditMode );

		// Assert.
		expect( result.current.isEditing ).toBe( true );
		expect( result.current.getProps() ).toMatchObject( {
			contentEditable: true,
			suppressContentEditableWarning: true,
		} );
	} );

	it( 'should call onSubmit with the new value on enter', async () => {
		// Arrange.
		const onSubmit = jest.fn();
		const value = 'Some value';
		const newValue = 'New value';
		const validation = jest.fn();

		// Act.
		const { result } = renderHook( () =>
			useEditable( {
				value,
				onSubmit,
				validation,
			} )
		);

		act( () => {
			result.current.openEditMode();
			result.current.getProps().onInput( { target: { innerText: newValue } } as never );
		} );

		// Assert.
		expect( validation ).toHaveBeenCalledWith( newValue );

		// Act.
		const { onKeyDown } = result.current.getProps();

		act( () => {
			onKeyDown( {
				key: 'Enter',
				stopPropagation: jest.fn(),
				preventDefault: jest.fn(),
				target: { innerText: newValue },
			} as never );
		} );

		expect( onSubmit ).toHaveBeenCalledWith( newValue );
	} );

	it( 'should remove the editable content attribute on blur', () => {
		// Arrange
		const { result } = renderHook( () =>
			useEditable( {
				value: '',
				onSubmit: jest.fn(),
			} )
		);

		// Act.
		act( result.current.openEditMode );

		// Assert.
		expect( result.current.isEditing ).toBe( true );

		// Act.
		act( result.current.getProps().onBlur );

		// Assert.
		expect( result.current.isEditing ).toBe( false );
	} );

	it( 'should set error message id validation fails', () => {
		// Arrange.
		const newValue = 'invalid-value';
		const value = 'Some value';
		const onSubmit = jest.fn();

		const validation = ( v: string ) => {
			if ( v === newValue ) {
				return 'Nope';
			}

			return null;
		};

		const { result } = renderHook( () =>
			useEditable( {
				value,
				onSubmit,
				validation,
			} )
		);

		// Act.
		act( result.current.openEditMode );

		// Assert.
		expect( result.current.error ).toBeNull();

		// Act.
		act( () => {
			result.current.getProps().onInput( { target: { innerText: newValue } } as never );
		} );

		// Assert.
		expect( result.current.error ).toBe( 'Nope' );

		// Act.
		act( () => {
			result.current.getProps().onKeyDown( {
				key: 'Enter',
				stopPropagation: jest.fn(),
				preventDefault: jest.fn(),
				target: { innerText: newValue },
			} as never );
		} );

		// Assert.
		expect( onSubmit ).not.toHaveBeenCalled();
	} );

	it( 'should not run validation & submit if the value has not changed', () => {
		// Arrange.
		const value = 'initial value';
		const onSubmit = jest.fn();

		const validation = () => {
			return 'test-error';
		};

		const { result } = renderHook( () =>
			useEditable( {
				value,
				onSubmit,
				validation,
			} )
		);

		// Act.
		act( result.current.openEditMode );

		// Assert.
		expect( result.current.error ).toBeNull();

		// Act.
		act( () => {
			result.current.getProps().onInput( { target: { innerText: 'new value' } } as never );
		} );

		// Assert.
		expect( result.current.error ).toBe( 'test-error' );

		act( () => {
			result.current.getProps().onInput( { target: { innerText: value } } as never );
		} );

		expect( result.current.error ).toBe( null );

		// Act.
		act( () => {
			result.current.getProps().onKeyDown( {
				key: 'Enter',
				stopPropagation: jest.fn(),
				preventDefault: jest.fn(),
				target: { innerText: value },
			} as never );
		} );

		// Assert.
		expect( onSubmit ).not.toHaveBeenCalled();
	} );
} );
