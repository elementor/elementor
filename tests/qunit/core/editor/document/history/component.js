import Elements from '../helpers/elements';

const undoValidate = ( assert, historyItem ) => {
	$e.run( 'document/history/undo' );

	// History status changed.
	assert.equal( historyItem.status, 'applied', 'After undo, history Item status is applied.' );
};

const redoValidate = ( assert, historyItem ) => {
	$e.run( 'document/history/redo' );

	// History status changed.
	assert.equal( historyItem.status, 'not_applied', 'After redo, history Item status is not_applied.' );
};

const inHistoryValidate = ( assert, historyItem, type, elementType = null ) => {
	// Exist in history.
	assert.equal( historyItem.type, type, `History Item type is '${ type }'.` );

	if ( elementType ) {
		assert.equal( historyItem.elementType, elementType, `History Item element is '${ elementType }'.` );
	}
};

const destroyedValidate = ( assert, eController ) => {
	assert.equal( eController.view.isDestroyed, true, 'Element has been destroyed.' );
	assert.equal( jQuery( document ).find( eController.view.$el ).length, 0, 'Element has been removed from DOM.' );
};

const recreatedValidate = ( assert, eController ) => {
	const eControllerLookedUp = eController.lookup();

	assert.notEqual( eControllerLookedUp.view.cid, eController.view.cid, 'Element was recreated and not a reference to the old one.' );
	assert.equal( eControllerLookedUp.id, eController.id, 'Element was re-added to DOM.' );
	assert.equal( eControllerLookedUp.view._index, eController.view._index, 'Element was re-added to correct position.' );
};

jQuery( () => {
	QUnit.module( 'Component: document/history', ( hooks ) => {
		hooks.beforeEach( () => {
			// TODO: Whatever you wish.
		} );

		QUnit.module( 'miscellaneous', () => {
			QUnit.test( 'Saver Editor Flag', ( assert ) => {
				elementor.history.history.getItems().reset();
				elementor.saver.setFlagEditorChange( false );

				Elements.createSection( 1 );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Saver editor flag is `true`.
				assert.equal( elementor.saver.isEditorChanged(), true, 'After create, saver editor flag is "true".' );

				// Undo
				undoValidate( assert, historyItem );

				// Saver editor flag is `true`.
				assert.equal( elementor.saver.isEditorChanged(), false, 'After create, saver editor flag is "false".' );

				// Redo
				redoValidate( assert, historyItem );

				// Saver editor flag is `true`.
				assert.equal( elementor.saver.isEditorChanged(), true, 'After create, saver editor flag is "true".' );
			} );
		} );

		QUnit.module( 'document/elements: Single Selection', () => {
			QUnit.test( 'Create Section', ( assert ) => {
				const eSection = Elements.createSection( 1 ),
					historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'add', 'section' );

				// Undo
				undoValidate( assert, historyItem );

				// Element Does not exist.
				destroyedValidate( assert, eSection );

				// Redo
				redoValidate( assert, historyItem );

				// Element exist again.
				recreatedValidate( assert, eSection );
			} );

			QUnit.test( 'Create Column', ( assert ) => {
				const eSection = Elements.createSection(),
					eColumn = Elements.createColumn( eSection ),
					historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'add', 'column' );

				// Undo
				undoValidate( assert, historyItem );

				// Element Does not exist.
				destroyedValidate( assert, eColumn );

				// Redo
				redoValidate( assert, historyItem );

				// Element exist again.
				recreatedValidate( assert, eColumn );
			} );

			QUnit.test( 'Resize Column', ( assert ) => {
				const newSize = 20,
					eSection = Elements.createSection( 2 ),
					eColumn1 = eSection.view.children.findByIndex( 0 ).getContainer(),
					eColumn2 = eSection.view.children.findByIndex( 1 ).getContainer(),
					column1InlineSize = eColumn1.settings.attributes._inline_size,
					column2InlineSize = eColumn2.settings.attributes._inline_size;

				Elements.resizeColumn( eColumn1, newSize );

				let done = assert.async(); // Pause the test till done.

				// Since resize columns using lazy, we should wait for it to be done.
				setTimeout( () => {
					const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

					// Exist in history.
					inHistoryValidate( assert, historyItem, 'change', 'column' );

					// Undo
					undoValidate( assert, historyItem );

					assert.equal( eColumn1.settings.attributes._inline_size, column1InlineSize, 'Column1 back to default' );
					assert.equal( eColumn2.settings.attributes._inline_size, column2InlineSize, 'Column2 back to default' );

					// Redo
					redoValidate( assert, historyItem );

					assert.equal( eColumn1.settings.attributes._inline_size, newSize, 'Column1 restored' );
					//assert.equal( eColumn2.settings.attributes._inline_size, column2InlineSize, 'Column2 back restored' ); TODO: In test resize columns works different ;(

					done();
				}, 1000 ); // TODO: make timeout access able.
			} );

			QUnit.test( 'Create Widget', ( assert ) => {
				const eWidget = Elements.createMockButtonWidget(),
					historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'add', 'widget' );

				// Undo
				undoValidate( assert, historyItem );

				// Element Does not exist.
				destroyedValidate( assert, eWidget );

				// Redo
				redoValidate( assert, historyItem );

				// Element exist again.
				recreatedValidate( assert, eWidget );
			} );

			QUnit.test( 'Create Widget: Inner Section', ( assert ) => {
				const eColumn = Elements.createSection( 1, true ),
					eInnerSection = Elements.createInnerSection( eColumn ),
					historyItem = elementor.history.history.getItems().at( 0 ).attributes,
					{ defaultInnerSectionColumns } = eInnerSection.view,
					innerSectionColumnsIds = [];

				eInnerSection.view.children.forEach( ( el ) => innerSectionColumnsIds.push( el.model.id ) );

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'add', 'section' );

				// Inner section have x columns.
				assert.equal( eInnerSection.view.collection.length, defaultInnerSectionColumns, `InnerSection have "${ defaultInnerSectionColumns }" columns` );

				// Undo
				undoValidate( assert, historyItem );

				// Element Does not exist.
				destroyedValidate( assert, eInnerSection );

				// Redo
				redoValidate( assert, historyItem );

				// Element exist again.
				recreatedValidate( assert, eInnerSection );

				const eInnerSectionAfterRedo = eInnerSection.lookup(),
					innerSectionAfterRedoColumnsIds = [];

				eInnerSectionAfterRedo.view.children.forEach( ( el ) => innerSectionAfterRedoColumnsIds.push( el.model.id ) );

				// Does two columns with the same ids as before.
				assert.equal( innerSectionAfterRedoColumnsIds.length, defaultInnerSectionColumns, `Inner Section have "${ defaultInnerSectionColumns } columns"` );
				assert.deepEqual( innerSectionAfterRedoColumnsIds, innerSectionColumnsIds, 'Inner section columns have the same ids as before.' );
			} );

			QUnit.test( 'Duplicate', ( assert ) => {
				const eWidget = Elements.createMockButtonWidget(),
					eWidgetDuped = Elements.duplicate( eWidget ),
					historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'duplicate', 'widget' );

				// Undo
				undoValidate( assert, historyItem );

				// Element Does not exist.
				destroyedValidate( assert, eWidgetDuped );

				// Redo
				redoValidate( assert, historyItem );

				// Element exist again.
				recreatedValidate( assert, eWidgetDuped );
			} );

			QUnit.test( 'Copy & Paste', ( assert ) => {
				const eColumn = Elements.createSection( 1, true ),
					eWidget = Elements.createButton( eColumn );

				Elements.copy( eWidget );

				const ePastedWidget = Elements.paste( eColumn ),
					historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'add', 'widget' );

				// Undo
				undoValidate( assert, historyItem );

				// Element Does not exist.
				destroyedValidate( assert, ePastedWidget );

				// Redo
				redoValidate( assert, historyItem );

				// Element exist again.
				recreatedValidate( assert, ePastedWidget );
			} );

			QUnit.test( 'Settings', ( assert ) => {
				const eWidget = Elements.createMockButtonWidget(),
					text = 'i test it';

				// Change button text.
				Elements.settings( eWidget, { text } );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'change', 'widget' );

				// Undo
				undoValidate( assert, historyItem );

				assert.notEqual( eWidget.settings.attributes.text, text, 'Settings back to default' );

				// Redo
				redoValidate( assert, historyItem );

				assert.equal( eWidget.settings.attributes.text, text, 'Settings restored' );
			} );

			QUnit.test( 'Settings: Lazy', ( assert ) => {
				const historyItems = elementor.history.history.getItems(),
					settingsChangeCount = 10,
					eWidget = Elements.createMockButtonWidget(),
					historyCountBeforeLazy = historyItems.length,
					text = 'i test it';

				// Change button text.
				for ( let i = 0; i < settingsChangeCount; ++i ) {
					Elements.settings( eWidget, { text }, {
						lazy: true,
					} );
				}

				let done = assert.async(); // Pause the test till done.

				setTimeout( () => {
					const historyItem = historyItems.at( 0 ).attributes,
						historyDiff = historyItems.length - historyCountBeforeLazy;

					// How many changes.
					assert.equal( historyDiff, 1, 'History items length is "1"' );

					// Exist in history.
					inHistoryValidate( assert, historyItem, 'change', null );

					// Undo
					undoValidate( assert, historyItem );

					assert.notEqual( eWidget.settings.attributes.text, text, 'Settings back to default' );

					// Redo
					redoValidate( assert, historyItem );

					assert.equal( eWidget.settings.attributes.text, text, 'Settings restored' );

					done();
				}, 1000 ); // TODO: make timeout access able.
			} );

			QUnit.test( 'Paste Style', ( assert ) => {
				const eWidgetSimple = Elements.createMockButtonWidget(),
					eWidgetStyled = Elements.createMockButtonStyled(),
					widgetSimpleBackground = eWidgetSimple.settings.get( 'background_color' ),
					widgetStyledBackground = eWidgetStyled.settings.get( 'background_color' );

				Elements.copy( eWidgetStyled );
				Elements.pasteStyle( eWidgetSimple );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'paste_style', 'widget' );

				// Undo
				undoValidate( assert, historyItem );

				assert.notEqual( eWidgetSimple.settings.get( 'background_color' ), widgetStyledBackground,
					'Settings back to default.' );

				// Redo
				redoValidate( assert, historyItem );

				/*assert.equal( eWidgetSimple.settings.get( 'background_color' ), widgetSimpleBackground,
					'Settings restored.' ); // TODO: in tests its not back to default color.*/
			} );

			QUnit.test( 'Reset Style', ( assert ) => {
				const eWidgetStyled = Elements.createMockButtonStyled(),
					BackgroundBeforeReset = eWidgetStyled.settings.get( 'background_color' ); // Black

				Elements.resetStyle( eWidgetStyled );

				const BackgroundAfterReset = eWidgetStyled.settings.get( 'background_color' ), // No Color
					historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'reset_style', 'widget' );

				// Undo
				undoValidate( assert, historyItem );

				assert.equal( eWidgetStyled.settings.get( 'background_color' ), BackgroundBeforeReset,
					'Settings back to default.' );

				// Redo
				redoValidate( assert, historyItem );

				/*assert.equal( eWidgetStyled.settings.get( 'background_color' ), BackgroundAfterReset,
					'Settings restored.' ); // TODO: in tests its not back to default color.*/
			} );

			QUnit.test( 'Move Section', ( assert ) => {
				// Create Section at 0.
				Elements.createSection();

				const eSection = Elements.createSection( 3 ),
					originalPosition = eSection.view._index,
					targetPosition = 0;

				Elements.move( eSection, elementor.getPreviewContainer(), { at: targetPosition } );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'move', 'section' );

				// Undo
				undoValidate( assert, historyItem );

				const eSectionAfterUndo = eSection.lookup();

				assert.equal( eSectionAfterUndo.view._index, originalPosition, 'Element has been returned to the original position' );

				// Redo
				redoValidate( assert, historyItem );

				const eSectionAfterRedo = eSection.lookup();

				assert.equal( eSectionAfterRedo.view._index, targetPosition, 'Element was re-added to correct position' );
			} );

			QUnit.test( 'Move Column between sections', ( assert ) => {
				const eSection1 = Elements.createSection(),
					eSection2 = Elements.createSection(),
					eColumn = Elements.createColumn( eSection1 ),
					originalPosition = eColumn.view._index,
					targetPosition = 1;

				Elements.move( eColumn, eSection2, { at: targetPosition } );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'move', 'column' );

				// Undo
				undoValidate( assert, historyItem );

				const eColumnAfterUndo = eColumn.lookup();

				assert.equal( eColumnAfterUndo.view._index, originalPosition, 'Element has been returned to the original position' );

				// Redo
				redoValidate( assert, historyItem );

				const eColumnAfterRedo = eColumn.lookup();

				assert.equal( eColumnAfterRedo.view._index, targetPosition, 'Element was re-added to correct position' );
			} );

			QUnit.test( 'Move Column in same section', ( assert ) => {
				const eSection = Elements.createSection(),
					eColumn1 = Elements.createColumn( eSection ),
					eColumn2 = Elements.createColumn( eSection ),
					originalPosition = eColumn2.view._index,
					targetPosition = 0;

				Elements.move( eColumn2, eSection, { at: targetPosition } );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'move', 'column' );

				// Undo
				undoValidate( assert, historyItem );

				const eColumnAfterUndo = eColumn2.lookup();

				assert.equal( eColumnAfterUndo.view._index, originalPosition, 'Element has been returned to the original position' );

				// Redo
				redoValidate( assert, historyItem );

				const eColumnAfterRedo = eColumn2.lookup();

				assert.equal( eColumnAfterRedo.view._index, targetPosition, 'Element was re-added to correct position' );
			} );

			QUnit.test( 'Move Widget', ( assert ) => {
				const eSection = Elements.createSection(),
					eColumn1 = Elements.createColumn( eSection ),
					eColumn2 = Elements.createColumn( eSection ),
					eWidget = Elements.createButton( eColumn1 ),
					originalPosition = eWidget.view._index,
					targetPosition = 1;

				Elements.createButton( eColumn2 );
				Elements.createButton( eColumn2 );

				Elements.move( eWidget, eColumn2, { at: targetPosition } );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'move', 'widget' );

				// Undo
				undoValidate( assert, historyItem );

				const eWidgetAfterUndo = eWidget.lookup();

				assert.equal( eWidgetAfterUndo.view._index, originalPosition, 'Element has been returned to the original position' );

				// Redo
				redoValidate( assert, historyItem );

				const eWidgetAfterRedo = eWidget.lookup();

				assert.equal( eWidgetAfterRedo.view._index, targetPosition, 'Element was re-added to correct position' );
			} );

			QUnit.test( 'Delete', ( assert ) => {
				const eWidget = Elements.createMockButtonWidget();

				Elements.delete( eWidget );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'remove', 'widget' );

				// Undo
				undoValidate( assert, historyItem );

				// Element exist again.
				recreatedValidate( assert, eWidget );

				// Redo
				redoValidate( assert, historyItem );

				// Element Does not exist.
				destroyedValidate( assert, eWidget );
			} );
		} );

		QUnit.module( 'document/elements: Multiple Selection', () => {
			QUnit.test( 'Create Columns', ( assert ) => {
				const eSection1 = Elements.createSection(),
					eSection2 = Elements.createSection(),
					eColumns = Elements.multiCreateColumn( [ eSection1, eSection2 ] ),
					historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'add', 'column' );

				// Undo
				undoValidate( assert, historyItem );

				// Elements Does not exist.
				eColumns.forEach( ( eColumn ) => destroyedValidate( assert, eColumn ) );

				// Redo
				redoValidate( assert, historyItem );

				// Elements exist again.
				eColumns.forEach( ( eColumn ) => recreatedValidate( assert, eColumn ) );
			} );

			QUnit.test( 'Create Widgets', ( assert ) => {
				const eWidgets = Elements.multiCreateMockButtonWidget(),
					historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'add', 'widget' );

				// Undo
				undoValidate( assert, historyItem );

				// Elements Does not exist.
				eWidgets.forEach( ( eWidget ) => destroyedValidate( assert, eWidget ) );

				// Redo
				redoValidate( assert, historyItem );

				eWidgets.forEach( ( eWidget ) => recreatedValidate( assert, eWidget ) );
			} );

			QUnit.test( 'Create Widgets: Inner Section', ( assert ) => {
				const eColumn1 = Elements.createSection( 1, true ),
					eColumn2 = Elements.createSection( 1, true ),
					eInnerSections = Elements.multiCreateInnerSection( [ eColumn1, eColumn2 ] ),
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
				inHistoryValidate( assert, historyItem, 'add', 'section' );

				// Inner section have x columns.
				eInnerSections.forEach( ( eInnerSection ) => assert.equal( eInnerSection.view.collection.length,
					defaultInnerSectionColumns, `InnerSection have "${ defaultInnerSectionColumns }" columns` ) );

				// Undo
				undoValidate( assert, historyItem );

				// Elements Does not exist.
				eInnerSections.forEach( ( eInnerSection ) => destroyedValidate( assert, eInnerSection ) );

				// Redo
				redoValidate( assert, historyItem );

				eInnerSections.forEach( ( eInnerSection ) => recreatedValidate( assert, eInnerSection ) );

				// Does two columns with the same ids as before.
				const innerSectionAfterRedoColumnsIds = {};

				eInnerSections.forEach( ( eInnerSection ) => {
					eInnerSection = eInnerSection.lookup();

					if ( ! innerSectionAfterRedoColumnsIds[ eInnerSection.id ] ) {
						innerSectionAfterRedoColumnsIds[ eInnerSection.id ] = [];
					}

					eInnerSection.view.children.forEach( ( el ) => innerSectionAfterRedoColumnsIds[ eInnerSection.id ].push( el.model.id ) );
				} );

				Object.entries( innerSectionAfterRedoColumnsIds ).forEach( ( [ key, ids ] ) => {
					assert.equal( ids.length, defaultInnerSectionColumns, `Inner Section have "${ defaultInnerSectionColumns } columns"` );
				} );

				assert.deepEqual( innerSectionAfterRedoColumnsIds, innerSectionColumnsIds, 'Inner section columns have the same ids as before.' );
			} );

			QUnit.test( 'Duplicate', ( assert ) => {
				const eWidgets = Elements.multiCreateMockButtonWidget(),
					eWidgetsDuped = Elements.multiDuplicate( eWidgets ),
					historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'duplicate', null ); // TODO: Handle elementType.

				// Undo
				undoValidate( assert, historyItem );

				// Element Does not exist.
				eWidgetsDuped.forEach( ( eWidgetDuped ) => destroyedValidate( assert, eWidgetDuped ) );

				// Redo
				redoValidate( assert, historyItem );

				// Element exist again.
				eWidgetsDuped.forEach( ( eWidgetDuped ) => recreatedValidate( assert, eWidgetDuped ) );
			} );

			QUnit.test( 'Copy & Paste', ( assert ) => {
				const eColumn1 = Elements.createSection( 1, true ),
					eColumn2 = Elements.createSection( 1, true ),
					eColumn3 = Elements.createSection( 1, true ),
					eWidget = Elements.createButton( eColumn1 );

				Elements.copy( eWidget );

				const ePastedWidgets = Elements.multiPaste( [ eColumn2, eColumn3 ] ),
					historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'add', 'widget' );

				// Undo
				undoValidate( assert, historyItem );

				// Element Does not exist.
				ePastedWidgets.forEach( ( ePastedWidget ) => destroyedValidate( assert, ePastedWidget ) );

				// Redo
				redoValidate( assert, historyItem );

				ePastedWidgets.forEach( ( ePastedWidget ) => recreatedValidate( assert, ePastedWidget ) );
			} );

			QUnit.test( 'Settings', ( assert ) => {
				const eWidgets = Elements.multiCreateMockButtonWidget(),
					text = 'i test it';

				// Change button text.
				Elements.multiSettings( eWidgets, { text } );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'change', null ); // TODO: Handle elementType.

				// Undo
				undoValidate( assert, historyItem );

				eWidgets.forEach( ( eWidget ) =>
					assert.notEqual( eWidget.settings.attributes.text, text, 'Settings back to default.' )
				);

				// Redo
				redoValidate( assert, historyItem );

				eWidgets.forEach( ( eWidget ) =>
					assert.equal( eWidget.settings.attributes.text, text, 'Settings restored.' )
				);
			} );

			QUnit.test( 'Paste Style', ( assert ) => {
				const eWidgetsSimple = Elements.multiCreateMockButtonWidget(),
					eWidgetStyled = Elements.createMockButtonStyled(),
					widgetSimpleBackground = eWidgetsSimple[ 0 ].settings.get( 'background_color' ),
					widgetStyledBackground = eWidgetStyled.settings.get( 'background_color' );

				Elements.copy( eWidgetStyled );
				Elements.multiPasteStyle( eWidgetsSimple );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'paste_style', null ); // TODO: Handle elementType.

				// Undo
				undoValidate( assert, historyItem );

				eWidgetsSimple.forEach( ( eWidgetSimple ) => {
					assert.equal( eWidgetSimple.settings.get( 'background_color' ), widgetSimpleBackground,
						'Settings back to default.' );
				} );

				// Redo
				redoValidate( assert, historyItem );

				eWidgetsSimple.forEach( ( eWidgetSimple ) => {
					assert.equal( eWidgetSimple.settings.get( 'background_color' ), widgetStyledBackground,
						'Settings restored.' );
				} );
			} );

			QUnit.test( 'Reset Style', ( assert ) => {
				const eWidgetsStyled = Elements.multiCreateMockButtonStyled(),
					backgroundBeforeReset = eWidgetsStyled[ 0 ].settings.get( 'background_color' );

				Elements.multiResetStyle( eWidgetsStyled );

				const backgroundAfterReset = eWidgetsStyled[ 0 ].settings.get( 'background_color' ),
					historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'reset_style', null ); // TODO: Handle elementType.

				// Undo
				undoValidate( assert, historyItem );

				eWidgetsStyled.forEach( ( eWidgetStyled ) => {
					assert.equal( eWidgetStyled.settings.get( 'background_color' ), backgroundBeforeReset, 'Settings back to default.' );
				} );

				// Redo
				redoValidate( assert, historyItem );

				eWidgetsStyled.forEach( ( eWidgetStyled ) => {
					assert.equal( eWidgetStyled.settings.get( 'background_color' ), backgroundAfterReset, 'Settings restored.' );
				} );
			} );
		} );

		QUnit.module( 'document/elements/repeater: Single Selection', () => {
			QUnit.test( 'Insert', ( assert ) => {
				const eColumn = Elements.createSection( 1, true ),
					eTabs = Elements.createTabs( eColumn ),
					originalItemsCount = eTabs.settings.get( 'tabs' ).length,
					eTabModel = Elements.repeaterInsert( eTabs, 'tabs', {
						tab_title: 'Test Tab Title',
						tab_content: 'Test Tab Content',
					} );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				assert.equal( historyItem.type, 'add', 'History Item type is "add"' );
				assert.equal( historyItem.elementType, 'widget', 'History Item element is "widget"' );
				assert.equal( historyItem.subTitle, 'Item', 'History Item subTitle is "item"' );

				$e.run( 'document/history/undo' );

				// Item does not exist.
				assert.equal( historyItem.status, 'applied', 'History Item status is applied' );
				assert.equal( eTabs.settings.get( 'tabs' ).find( eTabModel ), undefined, 'Item has been removed from collection' );
				assert.equal( eTabs.settings.get( 'tabs' ).length, originalItemsCount, 'Element collection count is like original count' );

				$e.run( 'document/history/redo' );

				// Item  exist.
				assert.equal( historyItem.status, 'not_applied', 'History Item status is not_applied' );
				assert.notEqual( eTabs.settings.get( 'tabs' ).length, originalItemsCount, 'Element collection count is not like original count' );
			} );

			QUnit.test( 'Remove', ( assert ) => {
				const eColumn = Elements.createSection( 1, true ),
					eTabs = Elements.createTabs( eColumn ),
					originalItemsCount = eTabs.settings.get( 'tabs' ).length,
					eTabModel = Elements.repeaterRemove( eTabs, 'tabs', 1 );

				// Check.
				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				assert.equal( historyItem.type, 'remove', 'History Item type is "remove"' );
				assert.equal( historyItem.elementType, 'widget', 'History Item element is "widget"' );
				assert.equal( historyItem.subTitle, 'Item', 'History Item subTitle is "item"' );

				$e.run( 'document/history/undo' );

				// Item  exist.
				assert.equal( historyItem.status, 'applied', 'History Item status is applied' );
				assert.equal( eTabs.settings.get( 'tabs' ).length, originalItemsCount, 'Element collection count is like original count' );

				$e.run( 'document/history/redo' );

				assert.equal( historyItem.status, 'not_applied', 'History Item status is not_applied' );
				assert.equal( eTabs.settings.get( 'tabs' ).find( eTabModel ), undefined, 'Item has been removed from collection' );
				assert.notEqual( eTabs.settings.get( 'tabs' ).length, originalItemsCount, 'Element collection count is not like original count' );
			} );

			QUnit.test( 'Settings', ( assert ) => {
				const eColumn = Elements.createSection( 1, true ),
					eTabs = Elements.createTabs( eColumn ),
					tabTitle = 'This is was changed',
					index = 1,
					eTab = eTabs.settings.get( 'tabs' ).at( index ),
					originalTitle = eTab.get( 'tab_title' );

				Elements.repeaterSettings( eTabs, 'tabs', index, {
					tab_title: tabTitle,
				} );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				assert.equal( historyItem.type, 'change', 'History Item type is "change"' );
				assert.equal( historyItem.elementType, 'widget', 'History Item element is "widget"' );
				assert.equal( historyItem.subTitle, 'Item', 'History Item subTitle is "item"' );

				$e.run( 'document/history/undo' );

				assert.equal( eTab.get( 'tab_title' ), originalTitle, 'Settings back to default' );

				$e.run( 'document/history/redo' );

				assert.equal( eTab.get( 'tab_title' ), tabTitle, 'Settings restored' );
			} );

			QUnit.test( 'Duplicate', ( assert ) => {
				const eColumn = Elements.createSection( 1, true ),
					eTabs = Elements.createTabs( eColumn ),
					originalItemsCount = eTabs.settings.get( 'tabs' ).length,
					eTabModel = Elements.repeaterDuplicate( eTabs, 'tabs', 1 );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				assert.equal( historyItem.type, 'add', 'History Item type is "add"' );
				assert.equal( historyItem.elementType, 'widget', 'History Item element is "widget"' );
				assert.equal( historyItem.subTitle, 'Item', 'History Item subTitle is "item"' );

				$e.run( 'document/history/undo' );

				// Item does not exist.
				assert.equal( historyItem.status, 'applied', 'History Item status is applied' );
				assert.equal( eTabs.settings.get( 'tabs' ).find( eTabModel ), undefined, 'Item has been removed from collection' );
				assert.equal( eTabs.settings.get( 'tabs' ).length, originalItemsCount, 'Element collection count is like original count' );

				$e.run( 'document/history/redo' );

				// Item  exist.
				assert.equal( historyItem.status, 'not_applied', 'History Item status is not_applied' );
				assert.notEqual( eTabs.settings.get( 'tabs' ).length, originalItemsCount, 'Element collection count is not like original count' );
			} );

			QUnit.test( 'Move', ( assert ) => {
				const eColumn = Elements.createSection( 1, true ),
					eTabs = Elements.createTabs( eColumn ),
					sourceIndex = 1,
					targetIndex = 0,
					eTabModel = eTabs.settings.get( 'tabs' ).at( sourceIndex );

				Elements.repeaterMove( eTabs, 'tabs', sourceIndex, targetIndex );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				assert.equal( historyItem.type, 'move', 'History Item type is "move"' );
				assert.equal( historyItem.elementType, 'widget', 'History Item element is "widget"' );
				assert.equal( historyItem.subTitle, 'Item', 'History Item subTitle is "item"' );

				$e.run( 'document/history/undo' );

				// Check item moved to sourceIndex
				assert.equal( eTabs.settings.get( 'tabs' ).at( sourceIndex ).id,
					eTabModel.id, 'Item back to sourceIndex' );

				$e.run( 'document/history/redo' );

				// Check item moved to targetIndex
				assert.equal( eTabs.settings.get( 'tabs' ).at( targetIndex ).id,
					eTabModel.id, 'Item restored to targetIndex' );
			} );
		} );
	} );
} );
