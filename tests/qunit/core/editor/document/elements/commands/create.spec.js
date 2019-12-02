import DocumentHelper from '../../helper';
import HistoryHelper from '../../history/helper';

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

				const done = assert.async();

				setTimeout( () => {
					assert.equal( eButton.view.$el.hasClass( 'elementor-absolute' ), true, '',
						'Widget have "elementor-absolute" class.' );
					done();
				} );
			} );

			QUnit.module( 'History', () => {
				QUnit.test( 'Section', ( assert ) => {
					const eSection = DocumentHelper.createSection( 1 ),
						historyItem = elementor.history.history.getItems().at( 0 ).attributes;

					// Exist in history.
					HistoryHelper.inHistoryValidate( assert, historyItem, 'add', 'Section' );

					// Undo.
					HistoryHelper.undoValidate( assert, historyItem );

					// Element Does not exist.
					HistoryHelper.destroyedValidate( assert, eSection );

					// Redo.
					HistoryHelper.redoValidate( assert, historyItem );

					// Element exist again.
					HistoryHelper.recreatedValidate( assert, eSection );
				} );

				QUnit.test( 'Column', ( assert ) => {
					const eSection = DocumentHelper.createSection(),
						eColumn = DocumentHelper.createColumn( eSection ),
						historyItem = elementor.history.history.getItems().at( 0 ).attributes;

					// Exist in history.
					HistoryHelper.inHistoryValidate( assert, historyItem, 'add', 'Column' );

					// Undo.
					HistoryHelper.undoValidate( assert, historyItem );

					// Element Does not exist.
					HistoryHelper.destroyedValidate( assert, eColumn );

					// Redo.
					HistoryHelper.redoValidate( assert, historyItem );

					// Element exist again.
					HistoryHelper.recreatedValidate( assert, eColumn );
				} );

				QUnit.test( 'Widget', ( assert ) => {
					const eWidget = DocumentHelper.createAutoButton(),
						historyItem = elementor.history.history.getItems().at( 0 ).attributes;

					// Exist in history.
					HistoryHelper.inHistoryValidate( assert, historyItem, 'add', 'Button' );

					// Undo.
					HistoryHelper.undoValidate( assert, historyItem );

					// Element Does not exist.
					HistoryHelper.destroyedValidate( assert, eWidget );

					// Redo.
					HistoryHelper.redoValidate( assert, historyItem );

					// Element exist again.
					HistoryHelper.recreatedValidate( assert, eWidget );
				} );

				QUnit.test( 'Widget: Inner Section', ( assert ) => {
					const eColumn = DocumentHelper.createSection( 1, true ),
						eInnerSection = DocumentHelper.createInnerSection( eColumn ),
						historyItem = elementor.history.history.getItems().at( 0 ).attributes,
						{ defaultInnerSectionColumns } = eInnerSection.view,
						innerSectionColumnsIds = [];

					eInnerSection.view.children.forEach( ( el ) => innerSectionColumnsIds.push( el.model.id ) );

					// Exist in history.
					HistoryHelper.inHistoryValidate( assert, historyItem, 'add', 'inner_section' );

					// Inner section have x columns.
					assert.equal( eInnerSection.view.collection.length, defaultInnerSectionColumns,
						`InnerSection have "${ defaultInnerSectionColumns }" columns` );

					// Undo.
					HistoryHelper.undoValidate( assert, historyItem );

					// Element Does not exist.
					HistoryHelper.destroyedValidate( assert, eInnerSection );

					// Redo.
					HistoryHelper.redoValidate( assert, historyItem );

					// Element exist again.
					HistoryHelper.recreatedValidate( assert, eInnerSection );

					const eInnerSectionAfterRedo = eInnerSection.lookup(),
						innerSectionAfterRedoColumnsIds = [];

					eInnerSectionAfterRedo.view.children.forEach( ( el ) => innerSectionAfterRedoColumnsIds.push( el.model.id ) );

					// Does two columns with the same ids as before.
					assert.equal( innerSectionAfterRedoColumnsIds.length, defaultInnerSectionColumns,
						`Inner Section have "${ defaultInnerSectionColumns } columns"` );
					assert.deepEqual( innerSectionAfterRedoColumnsIds, innerSectionColumnsIds,
						'Inner section columns have the same ids as before.' );
				} );
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

			QUnit.module( 'History', () => {
				QUnit.test( 'Columns', ( assert ) => {
					const eSection1 = DocumentHelper.createSection(),
						eSection2 = DocumentHelper.createSection(),
						eColumns = DocumentHelper.multiCreateColumn( [ eSection1, eSection2 ] ),
						historyItem = elementor.history.history.getItems().at( 0 ).attributes;

					// Exist in history.
					HistoryHelper.inHistoryValidate( assert, historyItem, 'add', 'Column' );

					// Undo.
					HistoryHelper.undoValidate( assert, historyItem );

					// Elements Does not exist.
					eColumns.forEach( ( eColumn ) => HistoryHelper.destroyedValidate( assert, eColumn ) );

					// Redo.
					HistoryHelper.redoValidate( assert, historyItem );

					// Elements exist again.
					eColumns.forEach( ( eColumn ) => HistoryHelper.recreatedValidate( assert, eColumn ) );
				} );

				QUnit.test( 'Widgets', ( assert ) => {
					const eWidgets = DocumentHelper.multiCreateAutoButton(),
						historyItem = elementor.history.history.getItems().at( 0 ).attributes;

					// Exist in history.
					HistoryHelper.inHistoryValidate( assert, historyItem, 'add', 'Button' );

					// Undo.
					HistoryHelper.undoValidate( assert, historyItem );

					// Elements Does not exist.
					eWidgets.forEach( ( eWidget ) => HistoryHelper.destroyedValidate( assert, eWidget ) );

					// Redo.
					HistoryHelper.redoValidate( assert, historyItem );

					eWidgets.forEach( ( eWidget ) => HistoryHelper.recreatedValidate( assert, eWidget ) );
				} );

				QUnit.test( 'Widgets: Inner Section', ( assert ) => {
					const eColumn1 = DocumentHelper.createSection( 1, true ),
						eColumn2 = DocumentHelper.createSection( 1, true ),
						eInnerSections = DocumentHelper.multiCreateInnerSection( [ eColumn1, eColumn2 ] ),
						historyItem = elementor.history.history.getItems().at( 0 ).attributes,
						{ defaultInnerSectionColumns } = eInnerSections[ 0 ].view,
						innerSectionColumnsIds = {};

					eInnerSections.forEach( ( eInnerSection ) => {
						if ( ! innerSectionColumnsIds[ eInnerSection.id ] ) {
							innerSectionColumnsIds[ eInnerSection.id ] = [];
						}

						eInnerSection.view.children.forEach( ( el ) => innerSectionColumnsIds[ eInnerSection.id ].push( el.model.id ) );
					} );

					// Exist in history.
					HistoryHelper.inHistoryValidate( assert, historyItem, 'add', 'inner_section' );

					// Inner section have x columns.
					eInnerSections.forEach( ( eInnerSection ) => assert.equal( eInnerSection.view.collection.length,
						defaultInnerSectionColumns, `InnerSection have "${ defaultInnerSectionColumns }" columns` ) );

					// Undo.
					HistoryHelper.undoValidate( assert, historyItem );

					// Elements Does not exist.
					eInnerSections.forEach( ( eInnerSection ) => HistoryHelper.destroyedValidate( assert, eInnerSection ) );

					// Redo.
					HistoryHelper.redoValidate( assert, historyItem );

					eInnerSections.forEach( ( eInnerSection ) => HistoryHelper.recreatedValidate( assert, eInnerSection ) );

					// Does two columns with the same ids as before.
					const innerSectionAfterRedoColumnsIds = {};

					eInnerSections.forEach( ( eInnerSection ) => {
						eInnerSection = eInnerSection.lookup();

						if ( ! innerSectionAfterRedoColumnsIds[ eInnerSection.id ] ) {
							innerSectionAfterRedoColumnsIds[ eInnerSection.id ] = [];
						}

						eInnerSection.view.children.forEach( ( el ) =>
							innerSectionAfterRedoColumnsIds[ eInnerSection.id ].push( el.model.id )
						);
					} );

					Object.entries( innerSectionAfterRedoColumnsIds ).forEach( ( [ key, ids ] ) => { // eslint-disable-line no-unused-vars
						assert.equal( ids.length, defaultInnerSectionColumns,
							`Inner Section have "${ defaultInnerSectionColumns } columns"` );
					} );

					assert.deepEqual( innerSectionAfterRedoColumnsIds, innerSectionColumnsIds,
						'Inner section columns have the same ids as before.' );
				} );
			} );
		} );
	} );
};

export default Create;
