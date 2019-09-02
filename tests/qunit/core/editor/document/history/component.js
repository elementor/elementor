import Elements from '../helpers/elements';

// TODO: Refactor.

jQuery( () => {
	QUnit.module( 'Component: document/history', () => {
		QUnit.module( 'document/elements: Single Selection', () => {
			QUnit.test( 'Create Section', ( assert ) => {
				const eSection = Elements.createSection( 1 ),
					historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				assert.equal( historyItem.type, 'add', 'History Item type is "add"' );
				assert.equal( historyItem.elementType, 'section', 'History Item element is "section"' );

				$e.run( 'document/history/undo' );

				// Element Does not exist.
				assert.equal( historyItem.status, 'applied', 'History Item status is applied' );
				assert.equal( eSection.isDestroyed, true, 'Element has been destroyed' );
				assert.equal( jQuery( document ).find( eSection.$el ).length, 0, 'Element has been removed from DOM' );

				$e.run( 'document/history/redo' );

				// History status changed.
				assert.equal( historyItem.status, 'not_applied', 'History Item status is not_applied' );

				const eSectionAfterRedo = eSection.lookup();

				// Element exist again.
				assert.notEqual( eSectionAfterRedo.cid, eSection.cid, 'Element was recreated and not a reference to the old one' );
				assert.equal( eSectionAfterRedo.model.id, eSection.model.id, 'Element was re-added to DOM' );
				assert.equal( eSectionAfterRedo._index, eSection._index, 'Element was re-added to correct position' );
			} );

			QUnit.test( 'Create Column', ( assert ) => {
				const eSection = Elements.createSection(),
					eColumn = Elements.createColumn( eSection ),
					historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				assert.equal( historyItem.type, 'add', 'History Item type is "add"' );
				assert.equal( historyItem.elementType, 'column', 'History Item element is "column"' );

				$e.run( 'document/history/undo' );

				// Element Does not exist.
				assert.equal( historyItem.status, 'applied', 'History Item status is applied' );
				assert.equal( eColumn.isDestroyed, true, 'Element has been destroyed' );
				assert.equal( jQuery( document ).find( eColumn.$el ).length, 0, 'Element has been removed from DOM' );

				$e.run( 'document/history/redo' );

				// History status changed.
				assert.equal( historyItem.status, 'not_applied', 'History Item status is not_applied' );

				const eColumnAfterRedo = eColumn.lookup();

				// Element exist again.
				assert.notEqual( eColumnAfterRedo.cid, eColumn.cid, 'Element was recreated and not a reference to the old one' );
				assert.equal( eColumnAfterRedo.model.id, eColumn.model.id, 'Element was re-added to DOM' );
				assert.equal( eColumnAfterRedo._index, eColumn._index, 'Element was re-added to correct position' );
			} );

			QUnit.test( 'Create Widget', ( assert ) => {
				const eWidget = Elements.createMockButtonWidget(),
					historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				assert.equal( historyItem.type, 'add', 'History Item type is "add"' );
				assert.equal( historyItem.elementType, 'widget', 'History Item element is "widget"' );

				$e.run( 'document/history/undo' );

				// Element Does not exist.
				assert.equal( historyItem.status, 'applied', 'History Item status is applied' );
				assert.equal( eWidget.isDestroyed, true, 'Element has been destroyed' );
				assert.equal( jQuery( document ).find( eWidget.$el ).length, 0, 'Element has been removed from DOM' );

				$e.run( 'document/history/redo' );

				// History status changed.
				assert.equal( historyItem.status, 'not_applied', 'History Item status is not_applied' );

				const eWidgetAfterRedo = eWidget.lookup();

				// Element exist again.
				assert.notEqual( eWidgetAfterRedo.cid, eWidget.cid, 'Element was recreated and not a reference to the old one' );
				assert.equal( eWidgetAfterRedo.model.id, eWidget.model.id, 'Element was re-added to DOM' );
				assert.equal( eWidgetAfterRedo._index, eWidget._index, 'Element was re-added to correct position' );
			} );

			QUnit.test( 'Create Widget: Inner Section', ( assert ) => {
				const eColumn = Elements.createSection( 1, true ),
					eInnerSection = Elements.createInnerSection( eColumn ),
					historyItem = elementor.history.history.getItems().at( 0 ).attributes,
					{ defaultInnerSectionColumns } = eInnerSection,
					innerSectionColumnsIds = [];

				eInnerSection.children.forEach( ( el ) => innerSectionColumnsIds.push( el.model.id ) );

				// Exist in history.
				assert.equal( historyItem.type, 'add', 'History Item type is "add"' );
				assert.equal( historyItem.elementType, 'section', 'History Item element is "section"' );

				// Inner section have x columns.
				assert.equal( eInnerSection.collection.length, defaultInnerSectionColumns, `InnerSection have "${ defaultInnerSectionColumns }" columns` );

				$e.run( 'document/history/undo' );

				// Element Does not exist.
				assert.equal( historyItem.status, 'applied', 'History Item status is applied' );
				assert.equal( eInnerSection.isDestroyed, true, 'Element has been destroyed' );
				assert.equal( jQuery( document ).find( eInnerSection.$el ).length, 0, 'Element has been removed from DOM' );

				$e.run( 'document/history/redo' );

				// History status changed.
				assert.equal( historyItem.status, 'not_applied', 'History Item status is not_applied' );

				const eInnerSectionAfterRedo = eInnerSection.lookup();

				// Element exist again.
				assert.notEqual( eInnerSectionAfterRedo.cid, eInnerSection.cid, 'Element was recreated and not a reference to the old one' );
				assert.equal( eInnerSectionAfterRedo.model.id, eInnerSection.model.id, 'Element was re-added to DOM' );
				assert.equal( eInnerSectionAfterRedo._index, eInnerSection._index, 'Element was re-added to correct position' );

				// back two columns with the same ids as before.
				const innerSectionAfterRedoColumnsIds = [];

				eInnerSectionAfterRedo.children.forEach( ( el ) => innerSectionAfterRedoColumnsIds.push( el.model.id ) );

				assert.equal( innerSectionAfterRedoColumnsIds.length, defaultInnerSectionColumns, `Inner Section have "${ defaultInnerSectionColumns } columns"` );
				assert.deepEqual( innerSectionAfterRedoColumnsIds, innerSectionColumnsIds, 'Inner section columns have the same ids as before.' );
			} );

			QUnit.test( 'Duplicate', ( assert ) => {
				const eWidget = Elements.createMockButtonWidget(),
					eWidgetDuped = Elements.duplicate( eWidget ),
					historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				assert.equal( historyItem.type, 'duplicate', 'History Item type is "duplicate"' );
				assert.equal( historyItem.elementType, 'widget', 'History Item element is "widget"' );

				$e.run( 'document/history/undo' );

				// Element Does not exist.
				assert.equal( historyItem.status, 'applied', 'History Item status is applied' );
				assert.equal( eWidgetDuped.isDestroyed, true, 'Element has been destroyed' );
				assert.equal( jQuery( document ).find( eWidgetDuped.$el ).length, 0, 'Element has been removed from DOM' );

				$e.run( 'document/history/redo' );

				// History status changed.
				assert.equal( historyItem.status, 'not_applied', 'History Item status is not_applied' );

				const eDupedWidgetAfterRedo = eWidgetDuped.lookup();

				// Element exist again.
				assert.notEqual( eDupedWidgetAfterRedo.cid, eWidgetDuped.cid, 'Element was recreated and not a reference to the old one' );
				assert.equal( eDupedWidgetAfterRedo.model.id, eWidgetDuped.model.id, 'Element was re-added to DOM' );
				assert.equal( eDupedWidgetAfterRedo._index, eWidgetDuped._index, 'Element was re-added to correct position' );
			} );

			QUnit.test( 'Copy & Paste', ( assert ) => {
				const eColumn = Elements.createSection( 1, true ),
					eWidget = Elements.createButton( eColumn );

				Elements.copy( eWidget );

				const ePastedWidget = Elements.paste( eColumn ),
					historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				assert.equal( historyItem.type, 'add', 'History Item type is "add"' );
				assert.equal( historyItem.elementType, 'widget', 'History Item element is "widget"' );

				$e.run( 'document/history/undo' );

				// Element Does not exist.
				assert.equal( historyItem.status, 'applied', 'History Item status is applied' );
				assert.equal( ePastedWidget.isDestroyed, true, 'Element has been destroyed' );
				assert.equal( jQuery( document ).find( ePastedWidget.$el ).length, 0, 'Element has been removed from DOM' );

				$e.run( 'document/history/redo' );

				// History status changed.
				assert.equal( historyItem.status, 'not_applied', 'History Item status is not_applied' );

				const ePastedWidgetAfterRedo = ePastedWidget.lookup();

				// Element exist again.
				assert.notEqual( ePastedWidgetAfterRedo.cid, ePastedWidget.cid, 'Element was recreated and not a reference to the old one' );
				assert.equal( ePastedWidgetAfterRedo.model.id, ePastedWidget.model.id, 'Element was re-added to DOM' );
				assert.equal( ePastedWidgetAfterRedo._index, ePastedWidget._index, 'Element was re-added to correct position' );
			} );

			QUnit.test( 'Settings', ( assert ) => {
				const eWidget = Elements.createMockButtonWidget();

				// Change button text.
				Elements.settings( eWidget, {
					text: 'i test it',
				} );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				assert.equal( historyItem.type, 'change', 'History Item type is "change"' );
				assert.equal( historyItem.elementType, 'widget', 'History Item element is "widget"' );

				$e.run( 'document/history/undo' );

				assert.notEqual( eWidget.model.attributes.settings.attributes.text, 'i test it', 'Settings back to default' );

				$e.run( 'document/history/redo' );

				assert.equal( eWidget.model.attributes.settings.attributes.text, 'i test it', 'Settings restored' );
			} );

			QUnit.test( 'Paste Style', ( assert ) => {
				const eWidgetSimple = Elements.createMockButtonWidget(),
					eWidgetStyled = Elements.createMockButtonStyled();

				Elements.copy( eWidgetStyled );
				Elements.pasteStyle( eWidgetSimple );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				assert.equal( historyItem.type, 'paste_style', 'History Item type is "paste_style"' );
				assert.equal( historyItem.elementType, 'widget', 'History Item element is "widget"' );

				$e.run( 'document/history/undo' );

				assert.notEqual( eWidgetSimple.model.get( 'settings' ).get( 'background_color' ),
					eWidgetStyled.model.get( 'settings' ).get( 'background_color' ), 'Settings back to default' );

				$e.run( 'document/history/redo' );

				assert.equal( eWidgetSimple.model.get( 'settings' ).get( 'background_color' ),
					eWidgetStyled.model.get( 'settings' ).get( 'background_color' ), 'Settings restored' );
			} );

			QUnit.test( 'Reset Style', ( assert ) => {
				const eWidgetStyled = Elements.createMockButtonStyled(),
					BgColorBeforeReset = eWidgetStyled.model.get( 'settings' ).get( 'background_color' );

				Elements.resetStyle( eWidgetStyled );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				assert.equal( historyItem.type, 'reset_style', 'History Item type is "reset_style"' );
				assert.equal( historyItem.elementType, 'widget', 'History Item element is "widget"' );

				$e.run( 'document/history/undo' );

				assert.equal( eWidgetStyled.model.get( 'settings' ).get( 'background_color' ), BgColorBeforeReset, 'Settings back to default' );
			} );

			QUnit.test( 'Move Section', ( assert ) => {
				// Create Section at 0.
				Elements.createSection();

				const eSection = Elements.createSection( 3 ),
					originalPosition = eSection._index,
					targetPosition = 0;

				Elements.move( eSection, elementor.getPreviewView(), { at: targetPosition } );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				assert.equal( historyItem.type, 'move', 'History Item type is "move"' );
				assert.equal( historyItem.elementType, 'section', 'History Item element is "section"' );

				$e.run( 'document/history/undo' );

				const eSectionAfterUndo = eSection.lookup();

				assert.equal( eSectionAfterUndo._index, originalPosition, 'Element has been returned to the original position' );

				$e.run( 'document/history/redo' );

				const eSectionAfterRedo = eSection.lookup();

				assert.equal( eSectionAfterRedo._index, targetPosition, 'Element was re-added to correct position' );
			} );

			QUnit.test( 'Move Column between sections', ( assert ) => {
				const eSection1 = Elements.createSection(),
					eSection2 = Elements.createSection(),
					eColumn = Elements.createColumn( eSection1 ),
					originalPosition = eColumn._index,
					targetPosition = 1;

				Elements.move( eColumn, eSection2, { at: targetPosition } );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				assert.equal( historyItem.type, 'move', 'History Item type is "move"' );
				assert.equal( historyItem.elementType, 'column', 'History Item element is "column"' );

				$e.run( 'document/history/undo' );

				const eColumnAfterUndo = eColumn.lookup();

				assert.equal( eColumnAfterUndo._index, originalPosition, 'Element has been returned to the original position' );

				$e.run( 'document/history/redo' );

				const eColumnAfterRedo = eColumn.lookup();

				assert.equal( eColumnAfterRedo._index, targetPosition, 'Element was re-added to correct position' );
			} );

			QUnit.test( 'Move Column in same section', ( assert ) => {
				const eSection = Elements.createSection(),
					eColumn1 = Elements.createColumn( eSection ),
					eColumn2 = Elements.createColumn( eSection ),
					originalPosition = eColumn2._index,
					targetPosition = 0;

				Elements.move( eColumn2, eSection, { at: targetPosition } );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				assert.equal( historyItem.type, 'move', 'History Item type is "move"' );
				assert.equal( historyItem.elementType, 'column', 'History Item element is "column"' );

				$e.run( 'document/history/undo' );

				const eColumnAfterUndo = eColumn2.lookup();

				assert.equal( eColumnAfterUndo._index, originalPosition, 'Element has been returned to the original position' );

				$e.run( 'document/history/redo' );

				const eColumnAfterRedo = eColumn2.lookup();

				assert.equal( eColumnAfterRedo._index, targetPosition, 'Element was re-added to correct position' );
			} );

			QUnit.test( 'Move Widget', ( assert ) => {
				const eSection = Elements.createSection(),
					eColumn1 = Elements.createColumn( eSection ),
					eColumn2 = Elements.createColumn( eSection ),
					eWidget = Elements.createButton( eColumn1 ),
					originalPosition = eWidget._index,
					targetPosition = 1;

				Elements.createButton( eColumn2 );
				Elements.createButton( eColumn2 );

				Elements.move( eWidget, eColumn2, { at: targetPosition } );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				assert.equal( historyItem.type, 'move', 'History Item type is "move"' );
				assert.equal( historyItem.elementType, 'widget', 'History Item element is "widget"' );

				$e.run( 'document/history/undo' );

				const eWidgetAfterUndo = eWidget.lookup();

				assert.equal( eWidgetAfterUndo._index, originalPosition, 'Element has been returned to the original position' );

				$e.run( 'document/history/redo' );

				const eWidgetAfterRedo = eWidget.lookup();

				assert.equal( eWidgetAfterRedo._index, targetPosition, 'Element was re-added to correct position' );
			} );

			QUnit.test( 'Delete', ( assert ) => {
				const eWidget = Elements.createMockButtonWidget();

				Elements.delete( eWidget );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				assert.equal( historyItem.type, 'remove', 'History Item type is "remove"' );
				assert.equal( historyItem.elementType, 'widget', 'History Item element is "widget"' );

				$e.run( 'document/history/undo' );

				// History status changed.
				assert.equal( historyItem.status, 'applied', 'History Item status is applied' );

				const eWidgetAfterUndo = eWidget.lookup();

				// Element Does not exist.
				assert.notEqual( eWidgetAfterUndo.cid, eWidget.cid, 'Element was recreated and not a reference to the old one' );
				assert.equal( eWidgetAfterUndo.model.id, eWidget.model.id, 'Element was re-added to DOM' );
				assert.equal( eWidgetAfterUndo._index, eWidget._index, 'Element was re-added to correct position' );

				$e.run( 'document/history/redo' );

				// Element exist again.
				assert.equal( historyItem.status, 'not_applied', 'History Item status is not_applied' );
				assert.equal( eWidget.isDestroyed, true, 'Element has been destroyed' );
				assert.equal( jQuery( document ).find( eWidget.$el ).length, 0, 'Element has been removed from DOM' );
			} );
		} );

		QUnit.module( 'document/elements: Multiple Selection', () => {
			QUnit.test( 'Create Columns', ( assert ) => {
				const eSection1 = Elements.createSection(),
					eSection2 = Elements.createSection(),
					eColumns = Elements.multiCreateColumn( [ eSection1, eSection2 ] ),
					historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				assert.equal( historyItem.type, 'add', 'History Item type is "add"' );
				assert.equal( historyItem.elementType, 'column', 'History Item element is "column"' );

				$e.run( 'document/history/undo' );

				assert.equal( historyItem.status, 'applied', 'History Item status is applied' );

				// Elements Does not exist.
				eColumns.forEach( ( eColumn ) => {
					assert.equal( eColumn.isDestroyed, true, 'Element has been destroyed' );
					assert.equal( jQuery( document ).find( eColumn.$el ).length, 0, 'Element has been removed from DOM' );
				} );

				$e.run( 'document/history/redo' );

				// History status changed.
				assert.equal( historyItem.status, 'not_applied', 'History Item status is not_applied' );

				// Elements exist again.
				eColumns.forEach( ( eColumn ) => {
					const eColumnAfterRedo = eColumn.lookup();

					assert.notEqual( eColumnAfterRedo.cid, eColumn.cid, 'Element was recreated and not a reference to the old one' );
					assert.equal( eColumnAfterRedo.model.id, eColumn.model.id, 'Element was re-added to DOM' );
					assert.equal( eColumnAfterRedo._index, eColumn._index, 'Element was re-added to correct position' );
				} );
			} );

			QUnit.test( 'Create Widgets', ( assert ) => {
				const eWidgets = Elements.multiCreateMockButtonWidget(),
					historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				assert.equal( historyItem.type, 'add', 'History Item type is "add"' );
				assert.equal( historyItem.elementType, 'widget', 'History Item element is "widget"' );

				$e.run( 'document/history/undo' );

				assert.equal( historyItem.status, 'applied', 'History Item status is applied' );

				// Elements Does not exist.
				eWidgets.forEach( ( eWidget ) => {
					assert.equal( eWidget.isDestroyed, true, 'Element has been destroyed' );
					assert.equal( jQuery( document ).find( eWidget.$el ).length, 0, 'Element has been removed from DOM' );
				} );

				$e.run( 'document/history/redo' );

				// History status changed.
				assert.equal( historyItem.status, 'not_applied', 'History Item status is not_applied' );

				eWidgets.forEach( ( eWidget ) => {
					const eWidgetAfterRedo = eWidget.lookup();

					// Elements exist again.
					assert.notEqual( eWidgetAfterRedo.cid, eWidget.cid, 'Element was recreated and not a reference to the old one' );
					assert.equal( eWidgetAfterRedo.model.id, eWidget.model.id, 'Element was re-added to DOM' );
					assert.equal( eWidgetAfterRedo._index, eWidget._index, 'Element was re-added to correct position' );
				} );
			} );

			QUnit.test( 'Create Widgets: Inner Section', ( assert ) => {
				const eColumn1 = Elements.createSection( 1, true ),
					eColumn2 = Elements.createSection( 1, true ),
					eInnerSections = Elements.multiCreateInnerSection( [ eColumn1, eColumn2 ] ),
					historyItem = elementor.history.history.getItems().at( 0 ).attributes,
					{ defaultInnerSectionColumns } = eInnerSections[ 0 ],
					innerSectionColumnsIds = {};

				eInnerSections.forEach( ( eInnerSection ) => {
					if ( ! innerSectionColumnsIds[ eInnerSection.model.id ] ) {
						innerSectionColumnsIds[ eInnerSection.model.id ] = [];
					}

					eInnerSection.children.forEach( ( el ) => innerSectionColumnsIds[ eInnerSection.model.id ].push( el.model.id ) );
				} );

				// Exist in history.
				assert.equal( historyItem.type, 'add', 'History Item type is "add"' );
				assert.equal( historyItem.elementType, 'section', 'History Item element is "section"' );

				// Inner section have x columns.
				eInnerSections.forEach( ( eInnerSection ) => assert.equal( eInnerSection.collection.length,
					defaultInnerSectionColumns, `InnerSection have "${ defaultInnerSectionColumns }" columns` ) );

				$e.run( 'document/history/undo' );

				assert.equal( historyItem.status, 'applied', 'History Item status is applied' );

				// Elements Does not exist.
				eInnerSections.forEach( ( eInnerSection ) => {
					assert.equal( eInnerSection.isDestroyed, true, 'Element has been destroyed' );
					assert.equal( jQuery( document ).find( eInnerSection.$el ).length, 0, 'Element has been removed from DOM' );
				} );

				$e.run( 'document/history/redo' );

				// History status changed.
				assert.equal( historyItem.status, 'not_applied', 'History Item status is not_applied' );

				eInnerSections.forEach( ( eInnerSection ) => {
					const eInnerSectionAfterRedo = eInnerSection.lookup();

					// Element exist again.
					assert.notEqual( eInnerSectionAfterRedo.cid, eInnerSection.cid, 'Element was recreated and not a reference to the old one' );
					assert.equal( eInnerSectionAfterRedo.model.id, eInnerSection.model.id, 'Element was re-added to DOM' );
					assert.equal( eInnerSectionAfterRedo._index, eInnerSection._index, 'Element was re-added to correct position' );
				} );

				// back two columns with the same ids as before.
				const innerSectionAfterRedoColumnsIds = {};

				eInnerSections.forEach( ( eInnerSection ) => {
					eInnerSection = eInnerSection.lookup();

					if ( ! innerSectionAfterRedoColumnsIds[ eInnerSection.model.id ] ) {
						innerSectionAfterRedoColumnsIds[ eInnerSection.model.id ] = [];
					}

					eInnerSection.children.forEach( ( el ) => innerSectionAfterRedoColumnsIds[ eInnerSection.model.id ].push( el.model.id ) );
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
				assert.equal( historyItem.type, 'duplicate', 'History Item type is "duplicate"' );
				// TODO: Check with mati.
				//assert.equal( historyItem.elementType, 'widget', 'History Item element is "widget"' );

				$e.run( 'document/history/undo' );

				assert.equal( historyItem.status, 'applied', 'History Item status is applied' );

				// Element Does not exist.
				eWidgetsDuped.forEach( ( eWidgetDuped ) => {
					assert.equal( eWidgetDuped.isDestroyed, true, 'Element has been destroyed' );
					assert.equal( jQuery( document ).find( eWidgetDuped.$el ).length, 0, 'Element has been removed from DOM' );
				} );

				$e.run( 'document/history/redo' );

				// History status changed.
				assert.equal( historyItem.status, 'not_applied', 'History Item status is not_applied' );

				eWidgetsDuped.forEach( ( eWidgetDuped ) => {
					const eDupedWidgetAfterRedo = eWidgetDuped.lookup();

					// Element exist again.
					assert.notEqual( eDupedWidgetAfterRedo.cid, eWidgetDuped.cid, 'Element was recreated and not a reference to the old one' );
					assert.equal( eDupedWidgetAfterRedo.model.id, eWidgetDuped.model.id, 'Element was re-added to DOM' );
					assert.equal( eDupedWidgetAfterRedo._index, eWidgetDuped._index, 'Element was re-added to correct position' );
				} );
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
				assert.equal( historyItem.type, 'add', 'History Item type is "add"' );
				assert.equal( historyItem.elementType, 'widget', 'History Item element is "widget"' );

				$e.run( 'document/history/undo' );

				assert.equal( historyItem.status, 'applied', 'History Item status is applied' );

				// Element Does not exist.
				ePastedWidgets.forEach( ( ePastedWidget ) => {
					assert.equal( ePastedWidget.isDestroyed, true, 'Element has been destroyed' );
					assert.equal( jQuery( document ).find( ePastedWidget.$el ).length, 0, 'Element has been removed from DOM' );
				} );

				$e.run( 'document/history/redo' );

				// History status changed.
				assert.equal( historyItem.status, 'not_applied', 'History Item status is not_applied' );

				ePastedWidgets.forEach( ( ePastedWidget ) => {
					const ePastedWidgetAfterRedo = ePastedWidget.lookup();

					// Element exist again.
					assert.notEqual( ePastedWidgetAfterRedo.cid, ePastedWidget.cid, 'Element was recreated and not a reference to the old one' );
					assert.equal( ePastedWidgetAfterRedo.model.id, ePastedWidget.model.id, 'Element was re-added to DOM' );
					assert.equal( ePastedWidgetAfterRedo._index, ePastedWidget._index, 'Element was re-added to correct position' );
				} );
			} );

			QUnit.test( 'Settings', ( assert ) => {
				const eWidgets = Elements.multiCreateMockButtonWidget();

				// Change button text.
				Elements.multiSettings( eWidgets, {
					text: 'i test it',
				} );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				assert.equal( historyItem.type, 'change', 'History Item type is "change"' );
				// TODO: check with mati.
				//assert.equal( historyItem.elementType, 'widget', 'History Item element is "widget"' );

				$e.run( 'document/history/undo' );

				eWidgets.forEach( ( eWidget ) =>
					assert.notEqual( eWidget.model.attributes.settings.attributes.text, 'i test it', 'Settings back to default' )
				);

				$e.run( 'document/history/redo' );

				eWidgets.forEach( ( eWidget ) =>
					assert.equal( eWidget.model.attributes.settings.attributes.text, 'i test it', 'Settings restored' )
				);
			} );

			QUnit.test( 'Paste Style', ( assert ) => {
				const eWidgetsSimple = Elements.multiCreateMockButtonWidget(),
					eWidgetStyled = Elements.createMockButtonStyled();

				Elements.copy( eWidgetStyled );
				Elements.multiPasteStyle( eWidgetsSimple );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				assert.equal( historyItem.type, 'paste_style', 'History Item type is "paste_style"' );
				// TODO: check with mati.
				//assert.equal( historyItem.elementType, 'widget', 'History Item element is "widget"' );

				$e.run( 'document/history/undo' );

				eWidgetsSimple.forEach( ( eWidgetSimple ) => {
					assert.notEqual( eWidgetSimple.model.get( 'settings' ).get( 'background_color' ),
						eWidgetStyled.model.get( 'settings' ).get( 'background_color' ), 'Settings back to default' );
				} );

				$e.run( 'document/history/redo' );

				eWidgetsSimple.forEach( ( eWidgetSimple ) => {
					assert.equal( eWidgetSimple.model.get( 'settings' ).get( 'background_color' ),
						eWidgetStyled.model.get( 'settings' ).get( 'background_color' ), 'Settings restored' );
				} );
			} );

			QUnit.test( 'Reset Style', ( assert ) => {
				const eWidgetsStyled = Elements.multiCreateMockButtonStyled(),
					BgColorBeforeReset = eWidgetsStyled[ 0 ].model.get( 'settings' ).get( 'background_color' );

				Elements.multiResetStyle( eWidgetsStyled );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				assert.equal( historyItem.type, 'reset_style', 'History Item type is "reset_style"' );
				// TODO: check with mati.
				//assert.equal( historyItem.elementType, 'widget', 'History Item element is "widget"' );

				$e.run( 'document/history/undo' );

				eWidgetsStyled.forEach( ( eWidgetStyled ) => {
					assert.equal( eWidgetStyled.model.get( 'settings' ).get( 'background_color' ), BgColorBeforeReset, 'Settings back to default' );
				} );
			} );
		} );

		QUnit.module( 'document/elements/repeater: Single Selection', () => {
			QUnit.test( 'Insert', ( assert ) => {
				const eColumn = Elements.createSection( 1, true ),
					eTabs = Elements.createTabs( eColumn ),
					originalItemsCount = eTabs.model.get( 'settings' ).get( 'tabs' ).length,
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
				assert.equal( eTabs.model.get( 'settings' ).get( 'tabs' ).find( eTabModel ), undefined, 'Item has been removed from collection' );
				assert.equal( eTabs.model.get( 'settings' ).get( 'tabs' ).length, originalItemsCount, 'Element collection count is like original count' );

				$e.run( 'document/history/redo' );

				// Item  exist.
				assert.equal( historyItem.status, 'not_applied', 'History Item status is not_applied' );
				assert.notEqual( eTabs.model.get( 'settings' ).get( 'tabs' ).length, originalItemsCount, 'Element collection count is not like original count' );
			} );

			QUnit.test( 'Remove', ( assert ) => {
				const eColumn = Elements.createSection( 1, true ),
					eTabs = Elements.createTabs( eColumn ),
					originalItemsCount = eTabs.model.get( 'settings' ).get( 'tabs' ).length,
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
				assert.equal( eTabs.model.get( 'settings' ).get( 'tabs' ).length, originalItemsCount, 'Element collection count is like original count' );

				$e.run( 'document/history/redo' );

				assert.equal( historyItem.status, 'not_applied', 'History Item status is not_applied' );
				assert.equal( eTabs.model.get( 'settings' ).get( 'tabs' ).find( eTabModel ), undefined, 'Item has been removed from collection' );
				assert.notEqual( eTabs.model.get( 'settings' ).get( 'tabs' ).length, originalItemsCount, 'Element collection count is not like original count' );
			} );

			QUnit.test( 'Settings', ( assert ) => {
				const eColumn = Elements.createSection( 1, true ),
					eTabs = Elements.createTabs( eColumn ),
					tabTitle = 'This is was changed',
					index = 1,
					eTab = eTabs.model.get( 'settings' ).get( 'tabs' ).at( index ),
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
					originalItemsCount = eTabs.model.get( 'settings' ).get( 'tabs' ).length,
					eTabModel = Elements.repeaterDuplicate( eTabs, 'tabs', 1 );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				assert.equal( historyItem.type, 'add', 'History Item type is "add"' );
				assert.equal( historyItem.elementType, 'widget', 'History Item element is "widget"' );
				assert.equal( historyItem.subTitle, 'Item', 'History Item subTitle is "item"' );

				$e.run( 'document/history/undo' );

				// Item does not exist.
				assert.equal( historyItem.status, 'applied', 'History Item status is applied' );
				assert.equal( eTabs.model.get( 'settings' ).get( 'tabs' ).find( eTabModel ), undefined, 'Item has been removed from collection' );
				assert.equal( eTabs.model.get( 'settings' ).get( 'tabs' ).length, originalItemsCount, 'Element collection count is like original count' );

				$e.run( 'document/history/redo' );

				// Item  exist.
				assert.equal( historyItem.status, 'not_applied', 'History Item status is not_applied' );
				assert.notEqual( eTabs.model.get( 'settings' ).get( 'tabs' ).length, originalItemsCount, 'Element collection count is not like original count' );
			} );

			QUnit.test( 'Move', ( assert ) => {
				const eColumn = Elements.createSection( 1, true ),
					eTabs = Elements.createTabs( eColumn ),
					sourceIndex = 1,
					targetIndex = 0,
					eTabModel = eTabs.model.get( 'settings' ).get( 'tabs' ).at( sourceIndex );

				Elements.repeaterMove( eTabs, 'tabs', sourceIndex, targetIndex );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				assert.equal( historyItem.type, 'move', 'History Item type is "move"' );
				assert.equal( historyItem.elementType, 'widget', 'History Item element is "widget"' );
				assert.equal( historyItem.subTitle, 'Item', 'History Item subTitle is "item"' );

				$e.run( 'document/history/undo' );

				// Check item moved to sourceIndex
				assert.equal( eTabs.model.get( 'settings' ).get( 'tabs' ).at( sourceIndex ).id,
					eTabModel.id, 'Item back to sourceIndex' );

				$e.run( 'document/history/redo' );

				// Check item moved to targetIndex
				assert.equal( eTabs.model.get( 'settings' ).get( 'tabs' ).at( targetIndex ).id,
					eTabModel.id, 'Item restored to targetIndex' );
			} );
		} );
	} );
} );
