import DocumentHelper from '../../helper';

export const Empty = () => {
	QUnit.module( 'Empty', () => {
		QUnit.test( 'Single Selection', ( assert ) => {
			const eColumn = DocumentHelper.createSection( 1, true );

			DocumentHelper.createButton( eColumn );
			DocumentHelper.createButton( eColumn );

			// Ensure editor saver.
			elementor.saver.setFlagEditorChange( false );

			DocumentHelper.empty();

			// Check.
			assert.equal( elementor.getPreviewContainer().view.collection.length, 0,
				'all elements were removed.' );
			assert.equal( elementor.saver.isEditorChanged(), true, 'Command applied the saver editor is changed.' );
		} );
	} );
};

export default Empty;
