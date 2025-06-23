import * as React from 'react';
import { createMockStylesProvider, renderWithTheme } from 'test-utils';
import { type StyleDefinition } from '@elementor/editor-styles';
import { isElementsStylesProvider } from '@elementor/editor-styles-repository';
import { screen } from '@testing-library/react';

import { useStyle } from '../../../contexts/style-context';
import { useStylesInheritanceSnapshot } from '../../../contexts/styles-inheritance-context';
import {
	styleGlobal1DisplayBlock,
	styleGlobalMultipleProps,
	styleGlobalPartialMultiProps,
	styleLocalDisplayFlex,
} from '../../__tests__/mock-inheritance-chain';
import { createMockSnapshot } from '../../__tests__/mock-utils';
import { type StylesInheritanceSnapshot } from '../../types';
import { StylesInheritanceSectionIndicators } from '../styles-inheritance-section-indicators';

jest.mock( '@elementor/editor-responsive', () => ( {
	...jest.requireActual( '@elementor/editor-responsive' ),
	useBreakpoints: jest.fn(),
} ) );

jest.mock( '@elementor/editor-styles-repository', () => ( {
	...jest.requireActual( '@elementor/editor-styles-repository' ),
	isElementsStylesProvider: jest.fn(),
} ) );
jest.mock( '../../../contexts/style-context' );
jest.mock( '../../../contexts/styles-inheritance-context' );

const mockInheritanceSnapshot = createMockSnapshot(
	[ styleLocalDisplayFlex, styleGlobal1DisplayBlock, styleGlobalPartialMultiProps, styleGlobalMultipleProps ],
	{ breakpoint: 'desktop', state: null }
);

const desktopNormal = { breakpoint: 'desktop', state: null } as const;

describe( 'StylesInheritanceSectionIndicators', () => {
	it.each( [
		{
			currentStyle: getCurrentStyle( styleLocalDisplayFlex ),
			isLocal: true,
			snapshot: mockInheritanceSnapshot,
			fields: [ 'display', 'color', 'font-size' ],
			expected: [ 'local' ],
		},
		{
			currentStyle: getCurrentStyle( styleLocalDisplayFlex ),
			isLocal: true,
			snapshot: mockInheritanceSnapshot,
			fields: [ 'color', 'font-size' ],
			expected: [],
		},
		{
			currentStyle: getCurrentStyle( styleGlobalPartialMultiProps ),
			isLocal: false,
			snapshot: mockInheritanceSnapshot,
			fields: [ 'display', 'color', 'font-size' ],
			expected: [ 'global', 'overridden' ],
		},
		{
			currentStyle: getCurrentStyle( styleGlobalPartialMultiProps ),
			isLocal: false,
			snapshot: mockInheritanceSnapshot,
			fields: [ 'display', 'font-size' ],
			expected: [ 'overridden' ],
		},
		{
			currentStyle: getCurrentStyle( styleGlobalPartialMultiProps ),
			isLocal: false,
			snapshot: mockInheritanceSnapshot,
			fields: [ 'font-size' ],
			expected: [],
		},
		{
			currentStyle: getCurrentStyle( styleGlobalMultipleProps ),
			isLocal: false,
			snapshot: mockInheritanceSnapshot,
			fields: [ 'display', 'color', 'font-size' ],
			expected: [ 'global', 'overridden' ],
		},
		{
			currentStyle: getCurrentStyle( styleGlobalMultipleProps ),
			isLocal: false,
			snapshot: mockInheritanceSnapshot,
			fields: [ 'font-size' ],
			expected: [ 'global' ],
		},
	] )( 'should render indicators: $expected', ( { currentStyle, isLocal, snapshot, fields, expected } ) => {
		// Arrange.
		jest.mocked( useStyle ).mockReturnValue( {
			...currentStyle,
			setId: jest.fn(),
			setMetaState: jest.fn(),
		} );

		jest.mocked( useStylesInheritanceSnapshot ).mockReturnValue( snapshot as StylesInheritanceSnapshot );

		jest.mocked( isElementsStylesProvider ).mockReturnValue( isLocal );

		// Act.
		renderWithTheme( <StylesInheritanceSectionIndicators fields={ fields } /> );

		// Assert.
		const indicators = screen.queryAllByRole( `listitem` );
		expect( indicators ).toHaveLength( expected.length );

		expected.forEach( ( label, index ) => {
			expect( indicators[ index ] ).toHaveAttribute( 'data-variant', label );
		} );
	} );
} );

function getCurrentStyle( styleDef: StyleDefinition ) {
	return {
		id: styleDef.id,
		meta: desktopNormal,
		provider: createMockStylesProvider( { key: 'test' } ),
	};
}
