import { createMockBreakpointsTree, createMockElement } from 'test-utils';
import {
	getContainer,
	getDefaultStyleTagFromPreviewElement,
	getElementSetting,
	getWidgetsCache,
} from '@elementor/editor-elements';
import { getBreakpointsTree } from '@elementor/editor-responsive';
import { type StyleDefinition } from '@elementor/editor-styles';
import { stylesRepository } from '@elementor/editor-styles-repository';

import { getElementClassesProp } from '../../utils/element-local-style';
import { getElementStylesInheritance } from '../get-element-styles-inheritance';

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	getContainer: jest.fn(),
	getDefaultStyleTagFromPreviewElement: jest.fn(),
	getElementSetting: jest.fn(),
	getWidgetsCache: jest.fn(),
} ) );
jest.mock( '@elementor/editor-responsive', () => ( {
	...jest.requireActual( '@elementor/editor-responsive' ),
	getBreakpointsTree: jest.fn(),
} ) );
jest.mock( '@elementor/editor-styles-repository', () => ( {
	...jest.requireActual( '@elementor/editor-styles-repository' ),
	stylesRepository: { all: jest.fn(), getProviders: jest.fn( () => [] ) },
} ) );
jest.mock( '../../utils/element-local-style' );

const DESKTOP = { breakpoint: 'desktop', state: null } as const;

const style = ( id: string, color: string ): StyleDefinition => ( {
	id,
	label: id,
	type: 'class',
	variants: [ { meta: DESKTOP, props: { color: { $$type: 'color', value: color } }, custom_css: null } ],
} );

describe( 'getElementStylesInheritance', () => {
	it( "should resolve the element's base, class and local styles, and ignore other styles", () => {
		// Arrange.
		jest.mocked( getContainer ).mockReturnValue(
			createMockElement( { model: { id: 'el', widgetType: 'e-paragraph' } } )
		);
		jest.mocked( getElementClassesProp ).mockReturnValue( 'classes' );
		jest.mocked( getElementSetting ).mockReturnValue( { $$type: 'classes', value: [ 'g-class', 'e-el-local' ] } );
		jest.mocked( getDefaultStyleTagFromPreviewElement ).mockReturnValue( null );
		jest.mocked( getWidgetsCache ).mockReturnValue( {
			'e-paragraph': { base_styles: { 'e-paragraph-base': {} } },
		} as unknown as ReturnType< typeof getWidgetsCache > );
		jest.mocked( getBreakpointsTree ).mockReturnValue( createMockBreakpointsTree() );
		jest.mocked( stylesRepository.all ).mockReturnValue( [
			style( 'e-paragraph-base', 'base' ),
			style( 'g-class', 'class' ),
			style( 'e-el-local', 'local' ),
			style( 'g-unrelated', 'unrelated' ),
		] );

		// Act.
		const snapshot = getElementStylesInheritance( 'el' )?.getSnapshot( DESKTOP );

		// Assert.
		expect( snapshot?.color.map( ( { style: { id } } ) => id ).sort() ).toEqual( [
			'e-el-local',
			'e-paragraph-base',
			'g-class',
		] );
	} );

	it( 'should return null for an element without a classes prop', () => {
		// Arrange.
		jest.mocked( getContainer ).mockReturnValue( createMockElement( { model: { id: 'el' } } ) );
		jest.mocked( getElementClassesProp ).mockReturnValue( null );

		// Act & Assert.
		expect( getElementStylesInheritance( 'el' ) ).toBeNull();
	} );
} );
