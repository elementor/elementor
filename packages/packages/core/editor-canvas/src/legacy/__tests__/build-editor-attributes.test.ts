import { buildEditorAttributes } from '../create-nested-templated-element-type';
import { type ElementView } from '../types';

const createModel = ( editorSettings?: Record< string, unknown > ) =>
	( {
		cid: 'c1',
		get: ( key: string ) =>
			( {
				id: 'abc123',
				editor_settings: editorSettings,
			} )[ key ],
	} ) as unknown as ElementView[ 'model' ];

describe( 'buildEditorAttributes', () => {
	it( 'should mark decorative elements', () => {
		// Arrange
		const model = createModel( { decorative: true } );

		// Act
		const attributes = buildEditorAttributes( model );

		// Assert
		expect( attributes ).toContain( 'data-e-decorative="true"' );
	} );

	it.each( [
		[ 'no editor settings', undefined ],
		[ 'decorative disabled', { decorative: false } ],
		[ 'other editor settings only', { title: 'Hero' } ],
	] )( 'should not mark the element when it has %s', ( _, editorSettings ) => {
		// Arrange
		const model = createModel( editorSettings );

		// Act
		const attributes = buildEditorAttributes( model );

		// Assert
		expect( attributes ).not.toContain( 'data-e-decorative' );
		expect( attributes ).toContain( 'data-interaction-id="abc123"' );
	} );
} );
