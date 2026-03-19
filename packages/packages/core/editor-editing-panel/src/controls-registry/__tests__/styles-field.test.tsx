import * as React from 'react';
import { createMockPropType, renderWithTheme } from 'test-utils';
import { useBoundProp } from '@elementor/editor-controls';
import { dimensionsPropTypeUtil, sizePropTypeUtil } from '@elementor/editor-props';
import { getStylesSchema } from '@elementor/editor-styles';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { fireEvent, screen } from '@testing-library/react';

import { useStylesFields } from '../../hooks/use-styles-fields';
import { StylesField } from '../styles-field';

jest.mock( '@elementor/editor-styles' );
jest.mock( '@elementor/editor-v1-adapters' );
jest.mock( '../../hooks/use-styles-fields' );
jest.mock( '../../contexts/style-context', () => ( {
	useStyle: jest.fn().mockReturnValue( { canEdit: true } ),
} ) );
jest.mock( '../../contexts/styles-inheritance-context', () => ( {
	useStylesInheritanceChain: jest.fn().mockReturnValue( [] ),
} ) );

describe( '<StylesField />', () => {
	beforeEach( () => {
		jest.mocked( getStylesSchema ).mockReturnValue( {
			padding: createMockPropType( { kind: 'object' } ),
			margin: createMockPropType( { kind: 'object' } ),
		} );

		jest.mocked( isExperimentActive ).mockReturnValue( true );
	} );

	it( 'should set the initial value for the bind property', () => {
		// Arrange.
		mockStyles( { padding: '10px' } );

		// Act.
		renderWithTheme(
			<StylesField bind="padding" propDisplayName="Padding">
				<MockControl />
			</StylesField>
		);

		// Assert.
		expect( screen.getByRole( 'textbox', { name: 'padding' } ) ).toHaveValue( '10px' );
	} );

	it( 'should pass empty string as initial value if the bind property is not found', () => {
		mockStyles( { notMargin: '10px' } );

		// Act.
		renderWithTheme(
			<StylesField bind="margin" propDisplayName="Margin">
				<MockControl />
			</StylesField>
		);

		// Assert.
		expect( screen.getByRole( 'textbox', { name: 'margin' } ) ).toHaveValue( '' );
	} );

	it( 'should update the value when the input changes', () => {
		// Arrange.
		const mockSetValue = mockStyles( { padding: '10px' } );

		renderWithTheme(
			<StylesField bind="padding" propDisplayName="Padding">
				<MockControl />
			</StylesField>
		);

		const input = screen.getByRole( 'textbox', { name: 'padding' } );

		// Act.
		fireEvent.change( input, { target: { value: '20px' } } );

		// Assert.
		expect( mockSetValue ).toHaveBeenCalledWith( { padding: '20px' }, { history: { propDisplayName: 'Padding' } } );
	} );

	describe( 'placeholders', () => {
		afterEach( () => {
			jest.clearAllMocks();
		} );

		it( 'should use inheritance chain value as placeholder when chain has value', () => {
			// Arrange.
			const mockInheritanceChain = [
				{
					value: '15px',
					style: { id: 'style-1' },
					variant: { meta: { breakpoint: null, state: null } },
					provider: 'test',
				},
			];

			const { useStylesInheritanceChain } = require( '../../contexts/styles-inheritance-context' );
			jest.mocked( useStylesInheritanceChain ).mockReturnValue( mockInheritanceChain );

			mockStyles( { padding: '' } );

			// Act.
			renderWithTheme(
				<StylesField bind="padding" propDisplayName="Padding" placeholder="fallback">
					<MockControl />
				</StylesField>
			);

			// Assert.
			expect( screen.getByRole( 'textbox', { name: 'padding' } ) ).toHaveProperty( 'placeholder', '15px' );
		} );

		it( 'should use chain[1] (inherited) as placeholder when there is a local value', () => {
			// Arrange.
			const mockInheritanceChain = [
				{
					value: '10px',
					style: { id: 'style-1' },
					variant: { meta: { breakpoint: 'mobile', state: null } },
					provider: 'test',
				},
				{
					value: '15px',
					style: { id: 'style-1' },
					variant: { meta: { breakpoint: 'tablet', state: null } },
					provider: 'test',
				},
			];

			const { useStylesInheritanceChain } = require( '../../contexts/styles-inheritance-context' );
			jest.mocked( useStylesInheritanceChain ).mockReturnValue( mockInheritanceChain );

			mockStyles( { padding: '10px' } );

			// Act.
			renderWithTheme(
				<StylesField bind="padding" propDisplayName="Padding">
					<MockControl />
				</StylesField>
			);

			// Assert — placeholder should be chain[1] (tablet's value), not chain[0] (mobile's own value).
			expect( screen.getByRole( 'textbox', { name: 'padding' } ) ).toHaveProperty( 'placeholder', '15px' );
		} );

		it( 'should merge partial dimensions placeholder with a size fallback in the chain', () => {
			// Arrange — simulates: desktop = size 10px, tablet = partial dims (inline-start only).
			// Mobile has no local value so it should inherit a MERGED placeholder where
			// inline-start = 5px (from tablet) and all other sides = 10px (from desktop's size).
			const size10 = sizePropTypeUtil.create( { size: 10, unit: 'px' } );
			const size5 = sizePropTypeUtil.create( { size: 5, unit: 'px' } );

			const tabletPartialDims = dimensionsPropTypeUtil.create( {
				'block-start': null,
				'block-end': null,
				'inline-start': size5,
				'inline-end': null,
			} );

			const mockInheritanceChain = [
				{
					value: tabletPartialDims,
					style: { id: 'style-1' },
					variant: { meta: { breakpoint: 'tablet', state: null } },
					provider: 'test',
				},
				{
					value: size10,
					style: { id: 'style-1' },
					variant: { meta: { breakpoint: null, state: null } },
					provider: 'test',
				},
			];

			const { useStylesInheritanceChain } = require( '../../contexts/styles-inheritance-context' );
			jest.mocked( useStylesInheritanceChain ).mockReturnValue( mockInheritanceChain );

			mockStyles( { padding: null as never } );

			// Act.
			renderWithTheme(
				<StylesField bind="padding" propDisplayName="Padding">
					<MockPlaceholderControl />
				</StylesField>
			);

			// Assert — the resolved placeholder should be a full dimensions object.
			const placeholder = JSON.parse(
				screen.getByRole( 'status', { name: 'resolved-placeholder' } ).dataset.value ?? 'null'
			);

			expect( dimensionsPropTypeUtil.isValid( placeholder ) ).toBe( true );

			const dims = dimensionsPropTypeUtil.extract( placeholder );
			expect( sizePropTypeUtil.extract( dims?.[ 'block-start' ] ) ).toEqual( { size: 10, unit: 'px' } );
			expect( sizePropTypeUtil.extract( dims?.[ 'block-end' ] ) ).toEqual( { size: 10, unit: 'px' } );
			expect( sizePropTypeUtil.extract( dims?.[ 'inline-start' ] ) ).toEqual( { size: 5, unit: 'px' } );
			expect( sizePropTypeUtil.extract( dims?.[ 'inline-end' ] ) ).toEqual( { size: 10, unit: 'px' } );
		} );

		it( 'should have empty placeholder when inheritance chain is empty', () => {
			// Arrange.
			const { useStylesInheritanceChain } = require( '../../contexts/styles-inheritance-context' );
			jest.mocked( useStylesInheritanceChain ).mockReturnValue( [] );

			mockStyles( { padding: '' } );

			// Act.
			renderWithTheme(
				<StylesField bind="padding" propDisplayName="Padding" placeholder="fallback">
					<MockControl />
				</StylesField>
			);

			// Assert.
			expect( screen.getByRole( 'textbox', { name: 'padding' } ) ).toHaveProperty( 'placeholder', '' );
		} );

		it( 'should return empty value is there is no provider', () => {
			// Arrange.
			mockStyles( null as never );

			// Act.
			renderWithTheme(
				<StylesField bind="padding" propDisplayName="Padding">
					<MockControl />
				</StylesField>
			);

			// Assert.
			expect( screen.getByRole( 'textbox', { name: 'padding' } ) ).toHaveValue( '' );
		} );
	} );
} );

export function mockStyles( styles: Record< string, string > ) {
	const setValue = jest.fn();

	jest.mocked( useStylesFields ).mockImplementation( () => ( {
		values: styles,
		setValues: setValue,
		canEdit: true,
	} ) );

	return setValue;
}

const MockControl = () => {
	const { value, setValue, bind, placeholder } = useBoundProp< string >();

	const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		setValue( event.target.value );
	};

	return (
		<input
			type="text"
			aria-label={ bind }
			value={ value ?? '' }
			onChange={ handleChange }
			placeholder={ placeholder ? String( placeholder ) : '' }
		/>
	);
};

// A control that exposes the raw placeholder as a JSON data attribute for structural assertions.
const MockPlaceholderControl = () => {
	const { placeholder } = useBoundProp();

	return <output aria-label="resolved-placeholder" data-value={ JSON.stringify( placeholder ?? null ) } />;
};
