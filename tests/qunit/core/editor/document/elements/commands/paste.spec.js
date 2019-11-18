import DocumentHelper from '../../helper';

export const Paste = () => {
	QUnit.module( 'Paste', () => {
		QUnit.test( 'Single Selection', ( assert ) => {
			const eColumn = DocumentHelper.createSection( 1, true ),
				eButton = DocumentHelper.createButton( eColumn );

			DocumentHelper.copy( eButton );

			// Ensure editor saver.
			elementor.saver.setFlagEditorChange( false );

			DocumentHelper.paste( eColumn );

			// Check.
			assert.equal( elementor.elements.at( 0 ).get( 'elements' ).at( 0 ).get( 'elements' ).length, 2,
				'Pasted element were created.' );
			assert.equal( elementor.saver.isEditorChanged(), true,
				'Command applied the saver editor is changed.' );
		} );

		// TODO: Check code coverage and add required tests.
	} );
};

export default Paste;
