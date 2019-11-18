import DocumentHelper from '../../helper';

export const Create = () => {
	QUnit.module( 'Create', () => {
		QUnit.module( 'Single Selection', () => {
			QUnit.test( 'Section', ( assert ) => {
				const eSection = DocumentHelper.createSection( 1 ),
					isSectionCreated = Boolean( elementor.getPreviewContainer().view.children.findByModel( eSection.model ) );

				// Check.
				assert.equal( isSectionCreated, true, 'Section were created.' );
				assert.equal( elementor.saver.isEditorChanged(), true, 'Command applied the saver editor is changed.' );
			} );

			QUnit.test( 'Column', ( assert ) => {
				const eColumn = DocumentHelper.createSection( 1, true ),
					isColumnCreated = elementor.getPreviewContainer().view.children.some( ( a ) => {
						return a.children.findByModel( eColumn.model );
					} );

				// Check column exist.
				assert.equal( isColumnCreated, true, 'Column were created.' );
				assert.equal( elementor.saver.isEditorChanged(), true, 'Command applied the saver editor is changed.' );
			} );

			QUnit.test( 'Widget', ( assert ) => {
				const eColumn = DocumentHelper.createSection( 1, true ),
					eButton = DocumentHelper.createButton( eColumn ),
					isButtonCreated = Boolean( eColumn.view.children.findByModel( eButton.model ) );

				// Check button exist.
				assert.equal( isButtonCreated, true, 'Button were created.' );
			} );

			QUnit.test( 'Widget: Inner Section', ( assert ) => {
				const eSection = DocumentHelper.createSection( 1 ),
					{ defaultInnerSectionColumns } = eSection.view,
					eColumn = eSection.view.children.findByIndex( 0 ).getContainer(),
					eInnerSection = DocumentHelper.createInnerSection( eColumn ),
					isInnerSectionCreated = Boolean( eColumn.view.children.findByModel( eInnerSection.model ) );

				assert.equal( isInnerSectionCreated, true, 'inner section were created.' );
				assert.equal( eInnerSection.view.collection.length, defaultInnerSectionColumns,
					`'${ defaultInnerSectionColumns }' columns were created in the inner section.` );
			} );

			QUnit.test( 'Widget: Custom Position', ( assert ) => {
				const eButton = DocumentHelper.createAutoButton();

				DocumentHelper.settings( eButton, {
					_position: 'absolute',
				} );

				assert.equal( eButton.view.$el.hasClass( 'elementor-absolute' ), true, '',
					'Widget have "elementor-absolute" class.' );
			} );
		} );

		QUnit.module( 'Multiple Selection', () => {
			QUnit.test( 'Columns', ( assert ) => {
				const eSection1 = DocumentHelper.createSection(),
					eSection2 = DocumentHelper.createSection(),
					eColumns = DocumentHelper.multiCreateColumn( [ eSection1, eSection2 ] );

				// Check columns exist.
				let count = 1;
				eColumns.forEach( ( eColumn ) => {
					const isColumnCreated = elementor.getPreviewContainer().view.children.some( ( a ) => {
						return a.children.findByModel( eColumn.model );
					} );

					assert.equal( isColumnCreated, true, `Column #${ count } were created.` );
					++count;
				} );
			} );

			QUnit.test( 'Widgets', ( assert ) => {
				const eColumn1 = DocumentHelper.createSection( 1, true ),
					eColumn2 = DocumentHelper.createSection( 1, true ),
					eButtons = DocumentHelper.multiCreateButton( [ eColumn1, eColumn2 ] ),
					isButton1Created = Boolean( eColumn1.view.children.findByModel( eButtons[ 0 ].model ) ),
					isButton2Created = Boolean( eColumn2.view.children.findByModel( eButtons[ 1 ].model ) );

				// Check button exist.
				assert.equal( isButton1Created, true, 'Button #1 were created.' );
				assert.equal( isButton2Created, true, 'Button #2 were created.' );
			} );
		} );
	} );
};

export default Create;
