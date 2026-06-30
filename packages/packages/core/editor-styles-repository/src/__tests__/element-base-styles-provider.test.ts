import { createMockStyleDefinition } from 'test-utils';
import { getWidgetsCache } from '@elementor/editor-elements';

import { elementBaseStylesProvider } from '../providers/element-base-styles-provider';

jest.mock( '@elementor/editor-elements' );

describe( 'elementBaseStylesProvider', () => {
	beforeEach( () => {
		jest.mocked( getWidgetsCache ).mockReturnValue( {
			'widget-1': {
				base_styles: {
					's-1': createMockStyleDefinition( { id: 's-1' } ),
					's-2': createMockStyleDefinition( { id: 's-2' } ),
				},
			},
			'widget-2': {
				base_styles: {
					's-3': createMockStyleDefinition( { id: 's-3' } ),
				},
			},
			'widget-3': {},
		} as unknown as ReturnType< typeof getWidgetsCache > );
	} );

	it( 'should return all the styles attached to all the document elements', () => {
		// Act.
		const styles = elementBaseStylesProvider.actions.all();

		// Assert.
		expect( styles ).toEqual( [
			expect.objectContaining( { id: 's-1' } ),
			expect.objectContaining( { id: 's-2' } ),
			expect.objectContaining( { id: 's-3' } ),
		] );
	} );

	it( 'should return base style by id', () => {
		// Act.
		const style = elementBaseStylesProvider.actions.get( 's-1' );

		// Assert.
		expect( style ).toEqual( expect.objectContaining( { id: 's-1' } ) );
	} );
} );
