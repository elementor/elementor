import '@testing-library/jest-dom';

import * as React from 'react';
import { isProUser } from '@elementor/editor-components';
import { useSelectedElement } from '@elementor/editor-elements';
import { render, screen } from '@testing-library/react';

import { useStyle } from '../../../../contexts/style-context';
import { EffectsSection } from '../effects-section';

jest.mock( '@elementor/editor-components', () => ( {
	isProUser: jest.fn(),
} ) );

jest.mock( '@elementor/editor-elements', () => ( {
	useSelectedElement: jest.fn(),
} ) );

jest.mock( '../../../../contexts/style-context', () => ( {
	useStyle: jest.fn(),
} ) );

jest.mock( '@elementor/editor-controls', () => ( {
	BoxShadowRepeaterControl: () => <div data-testid="box-shadow-control">BoxShadow</div>,
	FilterRepeaterControl: ( { filterPropName }: { filterPropName?: string } ) => (
		<div data-testid={ filterPropName ? 'backdrop-filter-control' : 'filter-control' }>Filter</div>
	),
	TransformRepeaterControl: () => <div data-testid="transform-control">Transform</div>,
	TransitionRepeaterControl: () => <div data-testid="transition-control">Transitions</div>,
} ) );

jest.mock( '../../../../controls-registry/styles-field', () => ( {
	StylesField: ( { children, propDisplayName }: { children: React.ReactNode; propDisplayName: string } ) => (
		<div data-testid={ `styles-field-${ propDisplayName }` }>{ children }</div>
	),
} ) );

jest.mock( '../../../panel-divider', () => ( {
	PanelDivider: () => <hr />,
} ) );

jest.mock( '../../../section-content', () => ( {
	SectionContent: ( { children }: { children: React.ReactNode } ) => <div>{ children }</div>,
} ) );

jest.mock( '../blend-mode-field', () => ( {
	BlendModeField: () => <div data-testid="blend-mode-field">BlendMode</div>,
} ) );

jest.mock( '../opacity-control-field', () => ( {
	OpacityControlField: () => <div data-testid="opacity-field">Opacity</div>,
} ) );

jest.mock( '../../../../utils/get-recently-used-styles', () => ( {
	getRecentlyUsedList: jest.fn( () => [] ),
} ) );

describe( '<EffectsSection />', () => {
	beforeEach( () => {
		jest.mocked( useSelectedElement ).mockReturnValue( {
			element: { id: 'test-element-id' },
		} as ReturnType< typeof useSelectedElement > );

		jest.mocked( useStyle ).mockReturnValue( {
			id: 'test-style-id',
			meta: { breakpoint: null, state: null },
			provider: null,
		} as never );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should render transitions control when user has Pro', () => {
		// Arrange.
		jest.mocked( isProUser ).mockReturnValue( true );

		// Act.
		render( <EffectsSection /> );

		// Assert.
		expect( screen.getByTestId( 'transition-control' ) ).toBeInTheDocument();
		expect( screen.getByTestId( 'styles-field-Transitions' ) ).toBeInTheDocument();
	} );

	it( 'should not render transitions control when user does not have Pro', () => {
		// Arrange.
		jest.mocked( isProUser ).mockReturnValue( false );

		// Act.
		render( <EffectsSection /> );

		// Assert.
		expect( screen.queryByTestId( 'transition-control' ) ).not.toBeInTheDocument();
		expect( screen.queryByTestId( 'styles-field-Transitions' ) ).not.toBeInTheDocument();
	} );
} );
