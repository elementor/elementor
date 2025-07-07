import * as React from 'react';
import { createMockBreakpointsTree, createMockStylesProvider } from 'test-utils';
import { type Element, type ElementType, useElementSetting } from '@elementor/editor-elements';
import { getBreakpointsTree } from '@elementor/editor-responsive';
import { type StyleDefinition } from '@elementor/editor-styles';
import { ELEMENTS_STYLES_PROVIDER_KEY_PREFIX, stylesRepository } from '@elementor/editor-styles-repository';
import { renderHook } from '@testing-library/react';

import { ElementProvider } from '../../contexts/element-context';
import { useClassesProp } from '../classes-prop-context';
import { useStyle } from '../style-context';
import {
	StyleInheritanceProvider,
	useStylesInheritanceChain,
	useStylesInheritanceSnapshot,
} from '../styles-inheritance-context';

export const initStyleInheritanceMocks = ( id: string ) => {
	jest.mocked( useClassesProp ).mockReturnValue( 'classes' );

	jest.mocked( getBreakpointsTree ).mockImplementation( createMockBreakpointsTree );

	jest.mocked( useStyle ).mockReturnValue( {
		id,
		setId: jest.fn(),
		meta: {
			breakpoint: null,
			state: null,
		},
		setMetaState: jest.fn(),
		provider: createMockStylesProvider( { key: `${ ELEMENTS_STYLES_PROVIDER_KEY_PREFIX }1` } ),
	} );
};

export const getInheritanceChainForPath = ( element: Element, elementType: ElementType, path: string[] ) =>
	renderHook( () => useStylesInheritanceChain( path ), {
		wrapper: ( { children } ) => (
			<ElementProvider element={ element } elementType={ elementType }>
				<StyleInheritanceProvider>{ children }</StyleInheritanceProvider>
			</ElementProvider>
		),
	} );

export const getInheritanceSnapshot = ( element: Element, elementType: ElementType ) =>
	renderHook( () => useStylesInheritanceSnapshot(), {
		wrapper: ( { children } ) => (
			<ElementProvider element={ element } elementType={ elementType }>
				<StyleInheritanceProvider>{ children }</StyleInheritanceProvider>
			</ElementProvider>
		),
	} );

export const mockElementStyles = ( styles: StyleDefinition[] ) => {
	jest.mocked( useElementSetting ).mockReturnValue( {
		$$type: 'classes',
		value: styles.map( ( { id } ) => id ),
	} );

	jest.mocked( stylesRepository.all ).mockReturnValue( styles );
};
