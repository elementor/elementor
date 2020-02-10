export const Save = () => {
	QUnit.module( 'Save', () => {
		QUnit.test( 'Simple', async ( assert ) => {
			const response = await $e.internal( 'document/save/save' );

			assert.equal( response.data.status, 'draft', 'The response status is: "draft"' );
		} );

		QUnit.test( 'Multiple documents', async ( assert ) => {
			const container = elementor.getPreviewContainer(),
				documentConfigs = [
					{ id: 2, container },
					{ id: 3, container },
				],
				documents = [];

			// Add fake documents.
			documentConfigs.forEach( ( config ) => {
				documents.push( elementor.documents.addDocumentByConfig( config ) );
			} );

			for ( const document of documents ) {
				const response = await $e.internal( 'document/save/save', { document } );

				assert.equal( response.data.status, 'draft', 'The response status is: "draft"' );
			}
		} );
	} );
};

export default Save;
