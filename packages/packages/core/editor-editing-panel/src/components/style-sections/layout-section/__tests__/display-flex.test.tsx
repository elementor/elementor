import * as React from 'react';
import { type ReactNode } from 'react';
import {
	createMockBreakpointsTree,
	createMockElementType,
	createMockPropType,
	createMockStyleDefinition,
	createMockStylesProvider,
} from 'test-utils';
import { ControlActionsProvider } from '@elementor/editor-controls';
import { getBreakpointsTree } from '@elementor/editor-responsive';
import { getStylesSchema, type StyleDefinition } from '@elementor/editor-styles';
import { stylesRepository } from '@elementor/editor-styles-repository';
import { ThemeProvider } from '@elementor/editor-ui';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { render, screen } from '@testing-library/react';

import { mockElement } from '../../../../__tests__/utils';
import { ClassesPropProvider } from '../../../../contexts/classes-prop-context';
import { ElementProvider } from '../../../../contexts/element-context';
import { StyleProvider } from '../../../../contexts/style-context';
import { StyleInheritanceProvider, useStylesInheritanceChain } from '../../../../contexts/styles-inheritance-context';
import { useStylesFields } from '../../../../hooks/use-styles-fields';
import { DisplayField } from '../display-field';

jest.mock( '@elementor/editor-v1-adapters' );
jest.mock( '../../../../hooks/use-styles-fields' );

jest.mock( '@elementor/editor-styles-repository', () => ( {
	...jest.requireActual( '@elementor/editor-styles-repository' ),
	useUserStylesCapability: jest.fn().mockReturnValue( { userCan: () => ( { updateProps: true } ) } ),
	stylesRepository: {
		getProviders: jest.fn(),
		all: jest.fn(),
	},
} ) );
jest.mock( '@elementor/editor-responsive' );
jest.mock( '../../../../styles-inheritance/components/styles-inheritance-indicator' );
jest.mock( '../../../../contexts/styles-inheritance-context', () => ( {
	...jest.requireActual( '../../../../contexts/styles-inheritance-context' ),
	useStylesInheritanceChain: jest.fn(),
} ) );

jest.mock( '@elementor/ui', () => {
	const actual = jest.requireActual( '@elementor/ui' );
	return {
		...actual,
		Infotip: ( { children }: { children: ReactNode } ) => <>{ children }</>,
	};
} );

describe( '<DisplayField />', () => {
	beforeEach( () => {
		jest.mocked( getStylesSchema ).mockReturnValue( {
			display: createMockPropType( { kind: 'object', key: 'string' } ),
		} );
		const mockProvider = createMockStylesProvider( { key: 'style-provider' }, [
			createMockStyleDefinition( { id: 'style-id' } ),
		] );
		jest.mocked( stylesRepository.getProviders ).mockReturnValue( [ mockProvider ] );

		const mockStyle = createMockStyleDefinition( {} );
		jest.mocked( stylesRepository.all ).mockReturnValue( [ mockStyle ] );

		jest.mocked( isExperimentActive ).mockReturnValue( false );
		jest.mocked( getBreakpointsTree ).mockImplementation( createMockBreakpointsTree );
	} );

	it( 'should select flex when useStylesFields value is flex', () => {
		// Arrange.
		const setValues = jest.fn();
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: { display: { $$type: 'string', value: 'flex' } },
			setValues,
			canEdit: true,
		} );

		mockStylesInheritanceDisplayField();

		// Act.
		renderDisplayField();

		// Assert.
		const flexButton = screen.getByRole( 'button', { name: 'Flex' } );
		expect( flexButton ).toHaveAttribute( 'aria-pressed', 'true' );
	} );

	it( 'should select flex when useStylesFields value is flex even if useActualStylesFieldValue is different', () => {
		// Arrange.
		const setValues = jest.fn();
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: { display: { $$type: 'string', value: 'flex' } },
			setValues,
			canEdit: true,
		} );

		mockStylesInheritanceDisplayField(
			createMockStyleDefinition( {
				props: {
					display: {
						$$type: 'string',
						value: 'block',
					},
				},
			} )
		);
		// Act.
		renderDisplayField();

		// Assert.
		const flexButton = screen.getByRole( 'button', { name: 'Flex' } );
		expect( flexButton ).toHaveAttribute( 'aria-pressed', 'true' );
	} );

	it( 'should not select any value', () => {
		// Arrange.
		const setValues = jest.fn();
		jest.mocked( useStylesFields ).mockReturnValue( { values: { display: null }, setValues, canEdit: true } );

		mockStylesInheritanceDisplayField();

		// Act.
		renderDisplayField();

		// Assert.
		[ 'Block', 'Flex', 'Inline-block', 'None' ].forEach( ( label ) => {
			expect( screen.getByRole( 'button', { name: label } ) ).toHaveAttribute( 'aria-pressed', 'false' );
		} );
	} );
} );

const renderDisplayField = ( element = mockElement(), elementType = createMockElementType() ) => {
	return render(
		<ControlActionsProvider items={ [] }>
			<ThemeProvider>
				<ClassesPropProvider prop="my-classes">
					<StyleProvider
						id="style-id"
						meta={ { breakpoint: null, state: null } }
						setMetaState={ jest.fn() }
						setId={ jest.fn() }
					>
						<ElementProvider element={ element } elementType={ elementType }>
							<StyleInheritanceProvider>
								<DisplayField />
							</StyleInheritanceProvider>
						</ElementProvider>
					</StyleProvider>
				</ClassesPropProvider>
			</ThemeProvider>
		</ControlActionsProvider>
	);
};

const mockStylesInheritanceDisplayField = ( style?: StyleDefinition ) => {
	if ( style ) {
		jest.mocked( useStylesInheritanceChain ).mockReturnValue( [
			{
				style,
				provider: null,
				variant: style.variants[ 0 ],
				value: style.variants[ 0 ].props.display,
			},
		] );

		return;
	}

	jest.mocked( useStylesInheritanceChain ).mockReturnValue( [] );
};
