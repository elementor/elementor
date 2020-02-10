export const Save = () => {
	QUnit.module( 'Save', () => {
		QUnit.test( 'Simple', async ( assert ) => {
			const response = await $e.internal( 'document/save/save' );

			assert.equal( response.data.status, 'draft', 'The response status is: "draft"' );
		} );

		QUnit.only( 'Multiple documents', async ( assert ) => {
			$e.hooks.deactivate();

			const container = elementor.getPreviewContainer(),
				documentConfigMaster = { id: 2, container },
				documentConfigSlave = { id: 3, container };

			// Add fake documents.
			const documentMaster = elementor.documents.addDocumentByConfig( documentConfigMaster ),
				documentSlave = elementor.documents.addDocumentByConfig( documentConfigSlave );

			let response = await $e.internal( 'document/save/save', {
				document: documentMaster,
			} );

			debugger;

			$e.hooks.activate();
		} );
	} );
};

export default Save;
