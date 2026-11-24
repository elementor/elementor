import { createIconButtonDefinition } from '../../__tests__/icon-button-definition-fixture';
import { setCompositeWidgetDefinitions } from '../../__tests__/set-composite-widget-definitions';
import { resolveNavigatorTitle } from '../init-navigator-title';

const FLEXBOX_TITLE = 'Flexbox';
const DEFINITION = createIconButtonDefinition();

function createModel( attributes: Record< string, unknown > ) {
	return { get: ( key: string ) => attributes[ key ] };
}

describe( 'resolveNavigatorTitle', () => {
	beforeEach( () => {
		setCompositeWidgetDefinitions( { [ DEFINITION.id ]: DEFINITION } );
	} );

	it( 'should return the definition title for a widget root without a user title', () => {
		// Arrange
		const model = createModel( { widget: { id: DEFINITION.id, version: DEFINITION.version } } );

		// Act
		const title = resolveNavigatorTitle( FLEXBOX_TITLE, model );

		// Assert
		expect( title ).toBe( DEFINITION.title );
	} );

	it( 'should keep the incoming title when the user renamed the widget root', () => {
		// Arrange
		const userTitle = 'Hero CTA';
		const model = createModel( {
			widget: { id: DEFINITION.id, version: DEFINITION.version },
			editor_settings: { title: userTitle },
		} );

		// Act
		const title = resolveNavigatorTitle( userTitle, model );

		// Assert
		expect( title ).toBe( userTitle );
	} );

	it.each( [
		[ 'a widget part', { part: 'icon' } ],
		[ 'an element without markers', {} ],
		[ 'an unknown widget id', { widget: { id: 'elementor/unknown', version: 1 } } ],
	] )( 'should keep the incoming title for %s', ( _, attributes ) => {
		// Arrange
		const model = createModel( attributes );

		// Act
		const title = resolveNavigatorTitle( FLEXBOX_TITLE, model );

		// Assert
		expect( title ).toBe( FLEXBOX_TITLE );
	} );
} );
