import { type V1ElementModelProps } from '@elementor/editor-elements';

import {
	DEFAULT_DOCUMENT_WIDGET_WRAPPER,
	DOCUMENT_EL_TYPE,
	WIDGET_EL_TYPE,
	wrapRootWidgetForDocumentParent,
} from '../wrap-root-widget-for-document';

const HEADING_MODEL: V1ElementModelProps = {
	id: 'heading-id',
	elType: WIDGET_EL_TYPE,
	widgetType: 'e-heading',
	skipDefaultChildren: true,
	elements: [],
};

describe( 'wrapRootWidgetForDocumentParent', () => {
	it( 'wraps a root-level widget when parent is document', () => {
		// Act
		const { model, wrapped } = wrapRootWidgetForDocumentParent(
			HEADING_MODEL,
			DOCUMENT_EL_TYPE,
			() => 'wrapper-id'
		);

		// Assert
		expect( wrapped ).toBe( true );
		expect( model.elType ).toBe( DEFAULT_DOCUMENT_WIDGET_WRAPPER );
		expect( model.id ).toBe( 'wrapper-id' );
		expect( model.elements ).toEqual( [ HEADING_MODEL ] );
	} );

	it( 'does not wrap when parent is not document', () => {
		// Act
		const { model, wrapped } = wrapRootWidgetForDocumentParent( HEADING_MODEL, 'e-div-block', () => 'wrapper-id' );

		// Assert
		expect( wrapped ).toBe( false );
		expect( model ).toBe( HEADING_MODEL );
	} );

	it( 'does not wrap layout elements on document', () => {
		// Arrange
		const divBlock: V1ElementModelProps = {
			id: 'div-id',
			elType: 'e-div-block',
			skipDefaultChildren: true,
			elements: [],
		};

		// Act
		const { model, wrapped } = wrapRootWidgetForDocumentParent( divBlock, DOCUMENT_EL_TYPE, () => 'wrapper-id' );

		// Assert
		expect( wrapped ).toBe( false );
		expect( model ).toBe( divBlock );
	} );
} );
