import { COMPOSITE_WIDGET_ICON, resolveNavigatorIcon } from '../init-navigator-icon';

const FLEXBOX_ICON = 'eicon-flexbox';

function createModel( attributes: Record< string, unknown > ) {
	return { get: ( key: string ) => attributes[ key ] };
}

describe( 'resolveNavigatorIcon', () => {
	it( 'should return the composite widget icon for a widget root', () => {
		// Arrange
		const model = createModel( { widget: { id: 'elementor/icon-button', version: 1 } } );

		// Act
		const icon = resolveNavigatorIcon( FLEXBOX_ICON, model );

		// Assert
		expect( icon ).toBe( COMPOSITE_WIDGET_ICON );
	} );

	it( 'should keep the element icon when there is no widget marker', () => {
		// Arrange
		const model = createModel( {} );

		// Act
		const icon = resolveNavigatorIcon( FLEXBOX_ICON, model );

		// Assert
		expect( icon ).toBe( FLEXBOX_ICON );
	} );

	it( 'should keep the element icon for a widget part', () => {
		// Arrange
		const model = createModel( { part: 'icon' } );

		// Act
		const icon = resolveNavigatorIcon( FLEXBOX_ICON, model );

		// Assert
		expect( icon ).toBe( FLEXBOX_ICON );
	} );
} );
