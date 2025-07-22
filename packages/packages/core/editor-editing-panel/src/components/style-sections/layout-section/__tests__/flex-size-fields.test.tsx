import * as React from 'react';
import { createMockPropType, renderWithTheme } from 'test-utils';
import { ControlActionsProvider } from '@elementor/editor-controls';
import { type FlexPropValue } from '@elementor/editor-props';
import { getStylesSchema } from '@elementor/editor-styles';
import { fireEvent, screen } from '@testing-library/react';

import { useDirection } from '../../../../hooks/use-direction';
import { useStylesField } from '../../../../hooks/use-styles-field';
import { useStylesFields } from '../../../../hooks/use-styles-fields';
import { FlexSizeField } from '../flex-size-field';

jest.mock( '@elementor/editor-styles' );
jest.mock( '../../../../hooks/use-direction' );
jest.mock( '../../../../hooks/use-styles-field' );
jest.mock( '../../../../hooks/use-styles-fields' );
jest.mock( '../../../../styles-inheritance/components/styles-inheritance-indicator' );
jest.mock( '../../../../contexts/styles-inheritance-context', () => ( {
	useStylesInheritanceChain: () => [],
} ) );

jest.mock( '../../../../contexts/element-context', () => ( {
	useElement: () => ( {
		id: 'test-element-id',
		model: {},
		settings: {},
	} ),
} ) );

jest.mock( '../../../../contexts/style-context', () => ( {
	useStyle: () => ( {
		id: null,
		meta: {},
		setId: jest.fn(),
		setMetaState: jest.fn(),
		canEdit: true,
	} ),
} ) );

jest.mock( '@elementor/editor-controls', () => {
	const actual = jest.requireActual( '@elementor/editor-controls' );
	return {
		...actual,
		useControlActions: () => ( {
			items: [],
		} ),
	};
} );

describe( '<FlexSizeField />', () => {
	const styleFields = {
		flex: { value: null as FlexPropValue | null },
	};

	const useStylesFieldMock = () => {
		return {
			value: styleFields.flex.value,
			setValue: ( newValue: FlexPropValue | null ) => {
				styleFields.flex.value = newValue;
			},
			canEdit: true,
		};
	};

	const renderFlexSizeField = () => {
		return renderWithTheme(
			<ControlActionsProvider items={ [] }>
				<FlexSizeField />
			</ControlActionsProvider>
		);
	};

	beforeEach( () => {
		jest.mocked( useDirection ).mockReturnValue( { isUiRtl: false, isSiteRtl: false } );

		jest.mocked( getStylesSchema ).mockReturnValue( {
			flex: createMockPropType( {
				kind: 'object',
				key: 'flex',
				shape: {
					flexGrow: createMockPropType( { kind: 'plain', key: 'number' } ),
					flexShrink: createMockPropType( { kind: 'plain', key: 'number' } ),
					flexBasis: createMockPropType( {
						kind: 'union',
						prop_types: {
							size: createMockPropType( {
								kind: 'object',
								key: 'size',
								shape: {
									size: createMockPropType( { kind: 'plain', key: 'number' } ),
									unit: createMockPropType( { kind: 'plain', key: 'string' } ),
								},
							} ),
							string: createMockPropType( { kind: 'plain', key: 'string' } ),
						},
					} ),
				},
			} ),
		} );

		jest.mocked( useStylesField ).mockImplementation( useStylesFieldMock as never );

		jest.mocked( useStylesFields ).mockReturnValue( {
			values: { flex: styleFields.flex.value },
			setValues: jest.fn,
			canEdit: true,
		} );
	} );

	afterEach( () => {
		styleFields.flex.value = null;
	} );

	it( 'should not have any toggle button marked as "selected" when no value is set', () => {
		renderFlexSizeField();
		const buttons = screen.getAllByRole( 'button' );
		buttons.forEach( ( button ) => expect( button ).not.toHaveAttribute( 'aria-pressed', 'true' ) );
	} );

	it( 'should affect flex-grow prop when "Grow" button is clicked', () => {
		renderFlexSizeField();
		const growButton = screen.getByLabelText( 'Grow' );
		fireEvent.click( growButton );
		expect( styleFields.flex.value?.value ).toEqual( {
			flexGrow: { $$type: 'number', value: 1 },
			flexShrink: null,
			flexBasis: null,
		} );
		fireEvent.click( growButton );
		expect( styleFields.flex.value ).toBe( null );
	} );

	it( 'should mark the "Grow" button as "selected" when flexGrow is 1', () => {
		styleFields.flex.value = {
			$$type: 'flex',
			value: {
				flexGrow: { $$type: 'number', value: 1 },
				flexShrink: null,
				flexBasis: null,
			},
		};

		renderFlexSizeField();
		const growButton = screen.getByLabelText( 'Grow' );
		expect( growButton ).toHaveAttribute( 'aria-pressed', 'true' );
	} );

	it( 'should affect flex-shrink prop when "Shrink" button is clicked', () => {
		renderFlexSizeField();
		const shrinkButton = screen.getByLabelText( 'Shrink' );
		fireEvent.click( shrinkButton );
		expect( styleFields.flex.value?.value ).toEqual( {
			flexGrow: null,
			flexShrink: { $$type: 'number', value: 1 },
			flexBasis: null,
		} );
		fireEvent.click( shrinkButton );
		expect( styleFields.flex.value ).toBe( null );
	} );

	it( 'should mark the "Shrink" button as "selected" when flexShrink is 1', () => {
		styleFields.flex.value = {
			$$type: 'flex',
			value: {
				flexGrow: null,
				flexShrink: { $$type: 'number', value: 1 },
				flexBasis: null,
			},
		};
		renderFlexSizeField();
		const shrinkButton = screen.getByLabelText( 'Shrink' );
		expect( shrinkButton ).toHaveAttribute( 'aria-pressed', 'true' );
	} );

	it( 'Flex custom button functionality', () => {
		renderFlexSizeField();
		const customButton = screen.getByLabelText( 'Custom' );
		fireEvent.click( customButton );
		const basisInputLabel = screen.getByText( 'Basis' );
		expect( styleFields.flex.value?.value ).toEqual( {
			flexBasis: null,
			flexGrow: null,
			flexShrink: null,
		} );
		expect( basisInputLabel ).toBeVisible();
		fireEvent.click( customButton );
		expect( styleFields.flex.value ).toBe( null );
		expect( basisInputLabel ).not.toBeVisible();
	} );

	it( 'should mark "Custom" button as "selected" when flexGrow is not 1', () => {
		styleFields.flex.value = {
			$$type: 'flex',
			value: {
				flexGrow: { $$type: 'number', value: 2 },
				flexShrink: null,
				flexBasis: null,
			},
		};
		renderFlexSizeField();
		const customButton = screen.getByLabelText( 'Custom' );
		expect( customButton ).toHaveAttribute( 'aria-pressed', 'true' );
	} );

	it( 'should mark "Custom" button as "selected" when flexShrink is not 1', () => {
		styleFields.flex.value = {
			$$type: 'flex',
			value: {
				flexGrow: null,
				flexShrink: { $$type: 'number', value: 2 },
				flexBasis: null,
			},
		};
		renderFlexSizeField();
		const customButton = screen.getByLabelText( 'Custom' );
		expect( customButton ).toHaveAttribute( 'aria-pressed', 'true' );
	} );

	it( 'should mark "Custom" button as "selected" when flexBasis is set', () => {
		styleFields.flex.value = {
			$$type: 'flex',
			value: {
				flexGrow: null,
				flexShrink: null,
				flexBasis: { $$type: 'size', value: { size: 1, unit: 'px' } },
			},
		};
		renderFlexSizeField();
		const customButton = screen.getByLabelText( 'Custom' );
		expect( customButton ).toHaveAttribute( 'aria-pressed', 'true' );
	} );

	it( 'should mark "Custom" button as "selected" when both flexGrow and flexShrink are set', () => {
		styleFields.flex.value = {
			$$type: 'flex',
			value: {
				flexGrow: { $$type: 'number', value: 1 },
				flexShrink: { $$type: 'number', value: 1 },
				flexBasis: null,
			},
		};
		renderFlexSizeField();
		const customButton = screen.getByLabelText( 'Custom' );
		expect( customButton ).toHaveAttribute( 'aria-pressed', 'true' );
	} );

	it( 'should mark "Grow" button as "selected" when flexGrow is 1 and flexShrink is 0', () => {
		styleFields.flex.value = {
			$$type: 'flex',
			value: {
				flexGrow: { $$type: 'number', value: 1 },
				flexShrink: { $$type: 'number', value: 0 },
				flexBasis: null,
			},
		};
		renderFlexSizeField();
		const growButton = screen.getByLabelText( 'Grow' );
		expect( growButton ).toHaveAttribute( 'aria-pressed', 'true' );
	} );

	it( 'should mark "Shrink" button as "selected" when flexGrow is 0 and flexShrink is 1', () => {
		styleFields.flex.value = {
			$$type: 'flex',
			value: {
				flexGrow: { $$type: 'number', value: 0 },
				flexShrink: { $$type: 'number', value: 1 },
				flexBasis: null,
			},
		};
		renderFlexSizeField();
		const shrinkButton = screen.getByLabelText( 'Shrink' );
		expect( shrinkButton ).toHaveAttribute( 'aria-pressed', 'true' );
	} );
} );
