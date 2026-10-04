import { buildEditorAttributes } from '../create-nested-templated-element-type';
import { type ElementView } from '../types';

const model = {
	cid: 'c1',
	get: ( key: string ) => ( { id: 'abc123' } )[ key ],
} as unknown as ElementView[ 'model' ];

describe( 'buildEditorAttributes', () => {
	it( 'should mark decorative elements', () => {
		// Act
		const attributes = buildEditorAttributes( model, { decorative: true } );

		// Assert
		expect( attributes ).toContain( 'data-e-decorative="true"' );
	} );

	it.each( [
		[ 'no decorative setting', {} ],
		[ 'decorative disabled', { decorative: false } ],
	] )( 'should not mark the element when it has %s', ( _, settings ) => {
		// Act
		const attributes = buildEditorAttributes( model, settings );

		// Assert
		expect( attributes ).not.toContain( 'data-e-decorative' );
		expect( attributes ).toContain( 'data-interaction-id="abc123"' );
	} );
} );
