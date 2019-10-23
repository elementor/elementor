import Elements from '../helpers/elements';
import { DEFAULT_DEBOUNCE_DELAY } from '../../../../../../assets/dev/js/editor/document/commands/debounce';
import BlockFaq from './../../../../mock/library/blocks/faq.json';

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

const inHistoryValidate = ( assert, historyItem, type, title ) => {
	// Exist in history.
	assert.equal( historyItem.type, type, `History Item type is '${ type }'.` );
	assert.equal( historyItem.title, title, `History Item title is '${ title }'.` );
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
			Elements.empty();

			elementor.documents.getCurrent().history.getItems().reset();
		} );

		QUnit.module( 'miscellaneous', () => {
			QUnit.test( 'Saver Editor Flag', ( assert ) => {
				elementor.saver.setFlagEditorChange( false );

				Elements.createSection( 1 );

				const historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

				// Saver editor flag is `true`.
				assert.equal( elementor.saver.isEditorChanged(), true, 'After create, saver editor flag is "true".' );

				// Undo.
				undoValidate( assert, historyItem );

				// Saver editor flag is `true`.
				assert.equal( elementor.saver.isEditorChanged(), false, 'After create, saver editor flag is "false".' );

				// Redo.
				redoValidate( assert, historyItem );

				// Saver editor flag is `true`.
				assert.equal( elementor.saver.isEditorChanged(), true, 'After create, saver editor flag is "true".' );
			} );

			QUnit.test( 'History Rollback', ( assert ) => {
				try {
					$e.run( 'document/elements/settings', {
						container: ( new elementorModules.editor.Container( {} ) ),
						settings: {},
					} );
				} catch ( e ) {
					// Do nothing (ignore).
				}

				const historyItem = elementor.documents.getCurrent().history.getItems().at( 0 );

				assert.equal( historyItem, undefined, 'History was rolled back.' );
			} );
		} );

		QUnit.module( 'document/elements: Single Selection', () => {
			QUnit.test( 'Create Section', ( assert ) => {
				const eSection = Elements.createSection( 1 ),
					historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'add', 'Section' );

				// Undo.
				undoValidate( assert, historyItem );

				// Element Does not exist.
				destroyedValidate( assert, eSection );

				// Redo.
				redoValidate( assert, historyItem );

				// Element exist again.
				recreatedValidate( assert, eSection );
			} );

			QUnit.test( 'Create Column', ( assert ) => {
				const eSection = Elements.createSection(),
					eColumn = Elements.createColumn( eSection ),
					historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'add', 'Column' );

				// Undo.
				undoValidate( assert, historyItem );

				// Element Does not exist.
				destroyedValidate( assert, eColumn );

				// Redo.
				redoValidate( assert, historyItem );

				// Element exist again.
				recreatedValidate( assert, eColumn );
			} );

			QUnit.test( 'Resize Column', ( assert ) => {
				const newSize = 20,
					eSection = Elements.createSection( 2 ),
					eColumn1 = eSection.view.children.findByIndex( 0 ).getContainer(),
					eColumn2 = eSection.view.children.findByIndex( 1 ).getContainer();

				// Manual specific `_inline_size` since tests does not have real ui.
				$e.run( 'document/elements/settings', {
					containers: [ eColumn1, eColumn2 ],
					settings: {
						[ eColumn1.id ]: { _inline_size: 50 },
						[ eColumn2.id ]: { _inline_size: 50 },
					},
					isMultiSettings: true,
				} );

				Elements.resizeColumn( eColumn1, newSize );

				const historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'change', 'Column' );

				// Undo.
				undoValidate( assert, historyItem );

				assert.equal( eColumn1.settings.attributes._inline_size, 50, 'Column1 back to default' );
				assert.equal( eColumn2.settings.attributes._inline_size, 50, 'Column2 back to default' );

				// Redo.
				redoValidate( assert, historyItem );

				assert.equal( eColumn1.settings.attributes._inline_size, newSize,
					'Column1 restored' );
				assert.equal( eColumn2.settings.attributes._inline_size, 100 - newSize,
					'Column2 restored' );
			} );

			QUnit.test( 'Create Widget', ( assert ) => {
				const eWidget = Elements.createAutoButton(),
					historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'add', 'Button' );

				// Undo.
				undoValidate( assert, historyItem );

				// Element Does not exist.
				destroyedValidate( assert, eWidget );

				// Redo.
				redoValidate( assert, historyItem );

				// Element exist again.
				recreatedValidate( assert, eWidget );
			} );

			QUnit.test( 'Create Widget: Inner Section', ( assert ) => {
				const eColumn = Elements.createSection( 1, true ),
					eInnerSection = Elements.createInnerSection( eColumn ),
					historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes,
					{ defaultInnerSectionColumns } = eInnerSection.view,
					innerSectionColumnsIds = [];

				eInnerSection.view.children.forEach( ( el ) => innerSectionColumnsIds.push( el.model.id ) );

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'add', 'inner_section' );

				// Inner section have x columns.
				assert.equal( eInnerSection.view.collection.length, defaultInnerSectionColumns, `InnerSection have "${ defaultInnerSectionColumns }" columns` );

				// Undo.
				undoValidate( assert, historyItem );

				// Element Does not exist.
				destroyedValidate( assert, eInnerSection );

				// Redo.
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
				const eWidget = Elements.createAutoButton(),
					eWidgetDuped = Elements.duplicate( eWidget ),
					historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'duplicate', 'Button' );

				// Undo.
				undoValidate( assert, historyItem );

				// Element Does not exist.
				destroyedValidate( assert, eWidgetDuped );

				// Redo.
				redoValidate( assert, historyItem );

				// Element exist again.
				recreatedValidate( assert, eWidgetDuped );
			} );

			QUnit.test( 'Copy & Paste', ( assert ) => {
				const eColumn = Elements.createSection( 1, true ),
					eWidget = Elements.createButton( eColumn );

				Elements.copy( eWidget );

				const ePastedWidget = Elements.paste( eColumn ),
					historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'add', 'Button' );

				// Undo.
				undoValidate( assert, historyItem );

				// Element Does not exist.
				destroyedValidate( assert, ePastedWidget );

				// Redo.
				redoValidate( assert, historyItem );

				// Element exist again.
				recreatedValidate( assert, ePastedWidget );
			} );

			QUnit.test( 'Settings', ( assert ) => {
				const eWidget = Elements.createAutoButton(),
					defaultText = eWidget.settings.attributes.text,
					text = 'i test it';

				// Change button text.
				Elements.settings( eWidget, { text } );

				const historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'change', 'Button' );

				// Undo.
				undoValidate( assert, historyItem );

				assert.equal( eWidget.settings.attributes.text, defaultText, 'Settings back to default' );

				// Redo.
				redoValidate( assert, historyItem );

				assert.equal( eWidget.settings.attributes.text, text, 'Settings restored' );
			} );

			QUnit.test( 'Settings: Debounce', ( assert ) => {
				const historyItems = elementor.documents.getCurrent().history.getItems(),
					settingsChangeCount = 10,
					eWidget = Elements.createAutoButton(),
					historyCountBeforeDebounce = historyItems.length,
					text = 'i test it',
					defaultText = eWidget.settings.attributes.text;

				// Change button text.
				for ( let i = 0; i < settingsChangeCount; ++i ) {
					Elements.settings( eWidget, { text }, {
						debounceHistory: true,
					} );
				}

				let done = assert.async(); // Pause the test till done.

				setTimeout( () => {
					const historyItem = historyItems.at( 0 ).attributes,
						historyDiff = historyItems.length - historyCountBeforeDebounce;

					// How many changes.
					assert.equal( historyDiff, 1, 'History items length is "1"' );

					// Exist in history.
					inHistoryValidate( assert, historyItem, 'change', 'Button' );

					// Undo.
					undoValidate( assert, historyItem );

					assert.equal( eWidget.settings.attributes.text, defaultText, 'Settings back to default' );

					// Redo.
					redoValidate( assert, historyItem );

					assert.equal( eWidget.settings.attributes.text, text, 'Settings restored' );

					done();
				}, DEFAULT_DEBOUNCE_DELAY );
			} );

			QUnit.test( 'Paste Style', ( assert ) => {
				const eWidgetSimple = Elements.createAutoButton(),
					eWidgetStyled = Elements.createAutoButtonStyled(),
					widgetSimpleBackground = eWidgetSimple.settings.get( 'background_color' ),
					widgetStyledBackground = eWidgetStyled.settings.get( 'background_color' );

				Elements.copy( eWidgetStyled );
				Elements.pasteStyle( eWidgetSimple );

				const historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'paste_style', 'Button' );

				// Undo.
				undoValidate( assert, historyItem );

				assert.equal( eWidgetSimple.settings.get( 'background_color' ), widgetSimpleBackground,
					'Settings back to default.' );

				// Redo.
				redoValidate( assert, historyItem );

				/*assert.equal( eWidgetSimple.settings.get( 'background_color' ), widgetSimpleBackground,
					'Settings restored.' ); // TODO: in tests its not back to default color.*/
			} );

			QUnit.test( 'Reset Style', ( assert ) => {
				const eWidgetStyled = Elements.createAutoButtonStyled(),
					BackgroundBeforeReset = eWidgetStyled.settings.get( 'background_color' ); // Black

				Elements.resetStyle( eWidgetStyled );

				const BackgroundAfterReset = eWidgetStyled.settings.get( 'background_color' ), // No Color
					historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'reset_style', 'Button' );

				// Undo.
				undoValidate( assert, historyItem );

				assert.equal( eWidgetStyled.settings.get( 'background_color' ), BackgroundBeforeReset,
					'Settings back to default.' );

				// Redo.
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

				const historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'move', 'Section' );

				// Undo.
				undoValidate( assert, historyItem );

				const eSectionAfterUndo = eSection.lookup();

				assert.equal( eSectionAfterUndo.view._index, originalPosition, 'Element has been returned to the original position' );

				// Redo.
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

				const historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'move', 'Column' );

				// Undo.
				undoValidate( assert, historyItem );

				const eColumnAfterUndo = eColumn.lookup();

				assert.equal( eColumnAfterUndo.view._index, originalPosition, 'Element has been returned to the original position' );

				// Redo.
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

				const historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'move', 'Column' );

				// Undo.
				undoValidate( assert, historyItem );

				const eColumnAfterUndo = eColumn2.lookup();

				assert.equal( eColumnAfterUndo.view._index, originalPosition, 'Element has been returned to the original position' );

				// Redo.
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

				const historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'move', 'Button' );

				// Undo.
				undoValidate( assert, historyItem );

				const eWidgetAfterUndo = eWidget.lookup();

				assert.equal( eWidgetAfterUndo.view._index, originalPosition, 'Element has been returned to the original position' );

				// Redo.
				redoValidate( assert, historyItem );

				const eWidgetAfterRedo = eWidget.lookup();

				assert.equal( eWidgetAfterRedo.view._index, targetPosition, 'Element was re-added to correct position' );
			} );

			QUnit.test( 'Delete', ( assert ) => {
				const eWidget = Elements.createAutoButton();

				Elements.delete( eWidget );

				const historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'remove', 'Button' );

				// Undo.
				undoValidate( assert, historyItem );

				// Element exist again.
				recreatedValidate( assert, eWidget );

				// Redo.
				redoValidate( assert, historyItem );

				// Element Does not exist.
				destroyedValidate( assert, eWidget );
			} );

			QUnit.test( 'Dynamic', ( assert ) => {
				const eButton = Elements.createAutoButton(),
					defaultButtonText = eButton.settings.attributes.text,
					text = '[elementor-tag id="33e3c57" name="post-custom-field" settings="%7B%7D"]',
					dynamicValue = '{ dynamic text }',
					{ id, name, settings } = elementor.dynamicTags.tagTextToTagData( text ),
					tag = elementor.dynamicTags.createTag( id, name, settings ),
					key = elementor.dynamicTags.createCacheKey( tag );

				// Set fake data.
				elementor.dynamicTags.cache[ key ] = dynamicValue;

				eButton.view.attachElContent = function( html ) {
					eButton.view.$el.empty().append( html );
				};

				// TODO: Add dynamic settings to `Elements` helper.
				$e.run( 'document/dynamic/settings', {
					container: eButton,
					settings: { text },
				} );

				const historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'change', 'Button' );

				// Undo.
				undoValidate( assert, historyItem );

				assert.equal( eButton.settings.attributes.text, defaultButtonText, 'Settings back to default' );

				// Redo.
				redoValidate( assert, historyItem );

				const done = assert.async();

				setTimeout( () => {
					assert.equal( eButton.view.$el.find( '.button-text' ).html(), dynamicValue, 'Settings restored' );
					done();
				}, DEFAULT_DEBOUNCE_DELAY );
			} );

			QUnit.test( 'Import', ( assert ) => {
				// eslint-disable-next-line camelcase
				const { model, content, page_settings } = BlockFaq;
				const data = { content, page_settings };

				Elements.import( data, new Backbone.Model( model ) );

				const historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'add', 'template' );

				// Undo.
				undoValidate( assert, historyItem );

				// Check items were removed.
				assert.equal( elementor.elements.length, 0, 'Template were removed.' );

				// Redo.
				redoValidate( assert, historyItem );

				// Level depth.
				const count = {
					L1: 0,
					L2: 0,
					L3: 0,
				};

				// Deep Validation ( base on `data.content` & `elementor.elements` ).
				data.content.forEach( ( section ) => {
					const _section = elementor.elements.at( count.L1 );

					assert.equal( _section.id, section.id, `Section L0#${ count.L1 } were created` );

					section.elements.forEach( ( column ) => {
						const _column = _section.get( 'elements' ).at( count.L2 );

						assert.equal( _column.id, column.id,
							`Column L1#${ count.L2 } were created` );

						column.elements.forEach( ( widget ) => {
							const _widget = _column.get( 'elements' ).at( count.L3 );

							assert.equal( _widget.id, widget.id, `Widget L3#${ count.L3 } were created` );

							count.L3++;
						} );

						count.L2++;
					} );

					count.L1++;
				} );
			} );
		} );

		QUnit.module( 'document/elements: Multiple Selection', () => {
			QUnit.test( 'Create Columns', ( assert ) => {
				const eSection1 = Elements.createSection(),
					eSection2 = Elements.createSection(),
					eColumns = Elements.multiCreateColumn( [ eSection1, eSection2 ] ),
					historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'add', 'Column' );

				// Undo.
				undoValidate( assert, historyItem );

				// Elements Does not exist.
				eColumns.forEach( ( eColumn ) => destroyedValidate( assert, eColumn ) );

				// Redo.
				redoValidate( assert, historyItem );

				// Elements exist again.
				eColumns.forEach( ( eColumn ) => recreatedValidate( assert, eColumn ) );
			} );

			QUnit.test( 'Create Widgets', ( assert ) => {
				const eWidgets = Elements.multiCreateAutoButton(),
					historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'add', 'Button' );

				// Undo.
				undoValidate( assert, historyItem );

				// Elements Does not exist.
				eWidgets.forEach( ( eWidget ) => destroyedValidate( assert, eWidget ) );

				// Redo.
				redoValidate( assert, historyItem );

				eWidgets.forEach( ( eWidget ) => recreatedValidate( assert, eWidget ) );
			} );

			QUnit.test( 'Create Widgets: Inner Section', ( assert ) => {
				const eColumn1 = Elements.createSection( 1, true ),
					eColumn2 = Elements.createSection( 1, true ),
					eInnerSections = Elements.multiCreateInnerSection( [ eColumn1, eColumn2 ] ),
					historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes,
					{ defaultInnerSectionColumns } = eInnerSections[ 0 ].view,
					innerSectionColumnsIds = {};

				eInnerSections.forEach( ( eInnerSection ) => {
					if ( ! innerSectionColumnsIds[ eInnerSection.id ] ) {
						innerSectionColumnsIds[ eInnerSection.id ] = [];
					}

					eInnerSection.view.children.forEach( ( el ) => innerSectionColumnsIds[ eInnerSection.id ].push( el.model.id ) );
				} );

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'add', 'inner_section' );

				// Inner section have x columns.
				eInnerSections.forEach( ( eInnerSection ) => assert.equal( eInnerSection.view.collection.length,
					defaultInnerSectionColumns, `InnerSection have "${ defaultInnerSectionColumns }" columns` ) );

				// Undo.
				undoValidate( assert, historyItem );

				// Elements Does not exist.
				eInnerSections.forEach( ( eInnerSection ) => destroyedValidate( assert, eInnerSection ) );

				// Redo.
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
				const eWidgets = Elements.multiCreateAutoButton(),
					eWidgetsDuped = Elements.multiDuplicate( eWidgets ),
					historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'duplicate', 'elements' );

				// Undo.
				undoValidate( assert, historyItem );

				// Element Does not exist.
				eWidgetsDuped.forEach( ( eWidgetDuped ) => destroyedValidate( assert, eWidgetDuped ) );

				// Redo.
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
					historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'add', 'Button' );

				// Undo.
				undoValidate( assert, historyItem );

				// Element Does not exist.
				ePastedWidgets.forEach( ( ePastedWidget ) => destroyedValidate( assert, ePastedWidget ) );

				// Redo.
				redoValidate( assert, historyItem );

				ePastedWidgets.forEach( ( ePastedWidget ) => recreatedValidate( assert, ePastedWidget ) );
			} );

			QUnit.test( 'Settings', ( assert ) => {
				const eWidgets = Elements.multiCreateAutoButton(),
					text = 'i test it',
					defaultText = eWidgets[ 0 ].settings.attributes.text;

				// Change button text.
				Elements.multiSettings( eWidgets, { text } );

				const historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'change', 'elements' );

				// Undo.
				undoValidate( assert, historyItem );

				eWidgets.forEach( ( eWidget ) =>
					assert.equal( eWidget.settings.attributes.text, defaultText, 'Settings back to default.' )
				);

				// Redo.
				redoValidate( assert, historyItem );

				eWidgets.forEach( ( eWidget ) =>
					assert.equal( eWidget.settings.attributes.text, text, 'Settings restored.' )
				);
			} );

			QUnit.test( 'Paste Style', ( assert ) => {
				const eWidgetsSimple = Elements.multiCreateAutoButton(),
					eWidgetStyled = Elements.createAutoButtonStyled(),
					widgetSimpleBackground = eWidgetsSimple[ 0 ].settings.get( 'background_color' ),
					widgetStyledBackground = eWidgetStyled.settings.get( 'background_color' );

				Elements.copy( eWidgetStyled );
				Elements.multiPasteStyle( eWidgetsSimple );

				const historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'paste_style', 'elements' );

				// Undo.
				undoValidate( assert, historyItem );

				eWidgetsSimple.forEach( ( eWidgetSimple ) => {
					assert.equal( eWidgetSimple.settings.get( 'background_color' ), widgetSimpleBackground,
						'Settings back to default.' );
				} );

				// Redo.
				redoValidate( assert, historyItem );

				eWidgetsSimple.forEach( ( eWidgetSimple ) => {
					assert.equal( eWidgetSimple.settings.get( 'background_color' ), widgetStyledBackground,
						'Settings restored.' );
				} );
			} );

			QUnit.test( 'Reset Style', ( assert ) => {
				const eWidgetsStyled = Elements.multiCreateAutoButtonStyled(),
					backgroundBeforeReset = eWidgetsStyled[ 0 ].settings.get( 'background_color' );

				Elements.multiResetStyle( eWidgetsStyled );

				const backgroundAfterReset = eWidgetsStyled[ 0 ].settings.get( 'background_color' ),
					historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'reset_style', 'elements' );

				// Undo.
				undoValidate( assert, historyItem );

				eWidgetsStyled.forEach( ( eWidgetStyled ) => {
					assert.equal( eWidgetStyled.settings.get( 'background_color' ), backgroundBeforeReset, 'Settings back to default.' );
				} );

				// Redo.
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
					originalItemsCount = eTabs.settings.get( 'tabs' ).length;

				Elements.repeaterInsert( eTabs, 'tabs', {
					tab_title: 'Test Tab Title',
					tab_content: 'Test Tab Content',
				} );

				const historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'add', 'Tabs' );

				// Undo.
				undoValidate( assert, historyItem );

				assert.equal( eTabs.settings.get( 'tabs' ).length, originalItemsCount,
					'Item was removed from the model' );

				// Redo.
				redoValidate( assert, historyItem );

				// Check item restored.
				assert.equal( eTabs.settings.get( 'tabs' ).length, ( originalItemsCount + 1 ),
					'Item were restored to the model' );
			} );

			QUnit.test( 'Remove', ( assert ) => {
				const eColumn = Elements.createSection( 1, true ),
					eTabs = Elements.createTabs( eColumn ),
					originalItemsCount = eTabs.settings.get( 'tabs' ).length,
					eTabModel = Elements.repeaterRemove( eTabs, 'tabs', 1 ),
					historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'remove', 'Tabs' );

				// Undo.
				undoValidate( assert, historyItem );

				// Check item restored.
				assert.equal( eTabs.settings.get( 'tabs' ).length, originalItemsCount,
					'Item were restored to the model' );

				// Redo.
				redoValidate( assert, historyItem );

				// Check item was removed.
				assert.equal( eTabs.settings.get( 'tabs' ).length, ( originalItemsCount - 1 ),
					'Item was removed from the model' );
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

				const historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'change', 'Tabs' );

				// Undo.
				undoValidate( assert, historyItem );

				// Settings back to default.
				assert.equal( eTab.get( 'tab_title' ), originalTitle, 'Settings back to default' );

				// Redo.
				redoValidate( assert, historyItem );

				// Settings restored.
				assert.equal( eTab.get( 'tab_title' ), tabTitle, 'Settings restored' );
			} );

			QUnit.test( 'Duplicate', ( assert ) => {
				const eColumn = Elements.createSection( 1, true ),
					eTabs = Elements.createTabs( eColumn ),
					originalItemsCount = eTabs.settings.get( 'tabs' ).length,
					eTabModel = Elements.repeaterDuplicate( eTabs, 'tabs', 1 ),
					historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'duplicate', 'Tabs' );

				// Undo.
				undoValidate( assert, historyItem );

				// Check item was removed.
				assert.equal( eTabs.settings.get( 'tabs' ).length, originalItemsCount,
					'Item was removed from the model' );

				// Redo.
				redoValidate( assert, historyItem );

				// Check item restored.
				assert.equal( eTabs.settings.get( 'tabs' ).length, ( originalItemsCount + 1 ),
					'Item were restored to the model' );
			} );

			QUnit.test( 'Move', ( assert ) => {
				const eColumn = Elements.createSection( 1, true ),
					eTabs = Elements.createTabs( eColumn ),
					sourceIndex = 1,
					targetIndex = 0,
					eTabModel = eTabs.settings.get( 'tabs' ).at( sourceIndex );

				Elements.repeaterMove( eTabs, 'tabs', sourceIndex, targetIndex );

				const historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'move', 'Tabs' );

				// Undo.
				undoValidate( assert, historyItem );

				// Check item moved to sourceIndex
				assert.equal( eTabs.settings.get( 'tabs' ).at( sourceIndex ).id,
					eTabModel.id, 'Item back to sourceIndex' );

				// Redo.
				redoValidate( assert, historyItem );

				// Check item moved to targetIndex
				assert.equal( eTabs.settings.get( 'tabs' ).at( targetIndex ).id,
					eTabModel.id, 'Item restored to targetIndex' );
			} );

			QUnit.test( 'Deep', ( assert ) => {
				const eColumn = Elements.createSection( 1, true ),
					name = 'form_fields',
					eForm = Elements.createForm( eColumn ),
					beforeInsertItemsCount = eForm.settings.get( name ).length;

				// Insert Item.
				Elements.repeaterInsert( eForm, name, {
					field_type: 'text',
					field_label: 'Name',
				} );

				const currentItemIndex = eForm.settings.get( name ).length - 1;

				// Change field_type = 'email' for new item.
				Elements.repeaterSettings( eForm, name, currentItemIndex, { field_type: 'email' }, {
					external: true,
				} );

				// Change required = 'true' for new item.
				Elements.repeaterSettings( eForm, name, currentItemIndex, { required: 'yes' }, {
					external: true,
				} );

				// Undo
				$e.run( 'document/history/undo' );

				// Validate required = '' for new item.
				assert.equal( eForm.settings.get( name ).at( currentItemIndex ).get( 'required' ), '',
					'Require setting back to default' );

				// Undo
				$e.run( 'document/history/undo' );

				// Validate field_type = 'text' for new item.
				assert.equal( eForm.settings.get( name ).at( currentItemIndex ).get( 'field_type' ), 'text',
					'field_type setting back to default' );

				$e.run( 'document/history/undo' );

				// Validate new inserted item removed.
				assert.equal( eForm.settings.get( name ).length, beforeInsertItemsCount,
					'New item was removed' );

				// Redo
				$e.run( 'document/history/redo' );

				// Validate new inserted item was recreated.
				assert.equal( eForm.settings.get( name ).length, ( beforeInsertItemsCount + 1 ),
					'New item was recreated' );

				// Redo
				$e.run( 'document/history/redo' );

				// Validate field_type = 'email' for new item.
				assert.equal( eForm.settings.get( name ).at( currentItemIndex ).get( 'field_type' ), 'email',
					'field_type setting was restored' );

				$e.run( 'document/history/redo' );

				// Validate required = 'true' for new item.
				assert.equal( eForm.settings.get( name ).at( currentItemIndex ).get( 'required' ), 'yes',
					'Require setting was restored' );
			} );
		} );

		QUnit.module( 'document/elements/repeater: Multiple Selection', () => {
			QUnit.test( 'Insert', ( assert ) => {
				const eColumn = Elements.createSection( 1, true ),
					eTabs1 = Elements.createTabs( eColumn ),
					eTabs2 = Elements.createTabs( eColumn ),
					eMultiTabs = [ eTabs1, eTabs2 ],
					originalItemsCount = eTabs1.settings.get( 'tabs' ).length;

				Elements.multiRepeaterInsert( eMultiTabs, 'tabs', {
					tab_title: 'Test Tab Title',
					tab_content: 'Test Tab Content',
				} );

				const historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'add', 'elements' );

				// Undo.
				undoValidate( assert, historyItem );

				// Check item was removed.
				eMultiTabs.forEach( ( eTabs ) => {
					assert.equal( eTabs.settings.get( 'tabs' ).length, originalItemsCount,
						`For Tab: '${ eTabs.id }' - item was removed from the model` );
				} );

				// Redo.
				redoValidate( assert, historyItem );

				// Check item restored.
				eMultiTabs.forEach( ( eTabs ) => {
					assert.equal( eTabs.settings.get( 'tabs' ).length, ( originalItemsCount + 1 ),
						`For Tab: '${ eTabs.id }' - Item were restored to the model` );
				} );
			} );

			QUnit.test( 'Remove', ( assert ) => {
				const eColumn = Elements.createSection( 1, true ),
					eTabs1 = Elements.createTabs( eColumn ),
					eTabs2 = Elements.createTabs( eColumn ),
					eMultiTabs = [ eTabs1, eTabs2 ],
					originalItemsCount = eTabs1.settings.get( 'tabs' ).length;

				Elements.multiRepeaterRemove( eMultiTabs, 'tabs', 1 );

				const historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'remove', 'elements' );

				// Undo.
				undoValidate( assert, historyItem );

				// Check item restored.
				eMultiTabs.forEach( ( eTabs ) => {
					assert.equal( eTabs.settings.get( 'tabs' ).length, originalItemsCount,
						`For Tab: '${ eTabs.id }' - Item were restored to the model` );
				} );

				// Redo.
				redoValidate( assert, historyItem );

				// Check item was removed.
				eMultiTabs.forEach( ( eTabs ) => {
					assert.equal( eTabs.settings.get( 'tabs' ).length, ( originalItemsCount - 1 ),
						`For Tab: '${ eTabs.id }' - item was removed from the model` );
				} );
			} );

			QUnit.test( 'Settings', ( assert ) => {
				const eColumn = Elements.createSection( 1, true ),
					eTabs1 = Elements.createTabs( eColumn ),
					eTabs2 = Elements.createTabs( eColumn ),
					index = 1,
					eMultiTabs = [ eTabs1, eTabs2 ],
					tabTitle = 'This is was changed',
					defaultTitle = eTabs1.settings.get( 'tabs' ).at( index ).get( 'tab_title' );

				Elements.multiRepeaterSettings( eMultiTabs, 'tabs', index, {
					tab_title: tabTitle,
				} );

				const historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'change', 'elements' );

				// Undo.
				undoValidate( assert, historyItem );

				// Check settings were changed.
				eMultiTabs.forEach( ( eTabs ) => {
					assert.equal( eTabs.settings.get( 'tabs' ).at( index ).get( 'tab_title' ), defaultTitle,
						`For Tab: '${ eTabs.id }' - Setting was changed` );
				} );

				// Redo.
				redoValidate( assert, historyItem );

				// Check settings were restored.
				eMultiTabs.forEach( ( eTabs ) => {
					assert.equal( eTabs.settings.get( 'tabs' ).at( index ).get( 'tab_title' ), tabTitle,
						`For Tab: '${ eTabs.id }' - Setting was restored` );
				} );
			} );

			QUnit.test( 'Duplicate', ( assert ) => {
				const eColumn = Elements.createSection( 1, true ),
					eTabs1 = Elements.createTabs( eColumn ),
					eTabs2 = Elements.createTabs( eColumn ),
					eMultiTabs = [ eTabs1, eTabs2 ],
					originalItemsCount = eTabs1.settings.get( 'tabs' ).length;

				Elements.multiRepeaterDuplicate( [ eTabs1, eTabs2 ], 'tabs', 1 );

				const historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'duplicate', 'elements' );

				// Undo.
				undoValidate( assert, historyItem );

				eMultiTabs.forEach( ( eTabs ) => {
					assert.equal( eTabs.settings.get( 'tabs' ).length, originalItemsCount,
						`For Tab: '${ eTabs.id }' - item was removed from the model` );
				} );

				// Redo.
				redoValidate( assert, historyItem );

				// Check item restored.
				eMultiTabs.forEach( ( eTabs ) => {
					assert.equal( eTabs.settings.get( 'tabs' ).length, ( originalItemsCount + 1 ),
						`For Tab: '${ eTabs.id }' - Item were restored to the model` );
				} );
			} );

			QUnit.test( 'Move', ( assert ) => {
				const eColumn = Elements.createSection( 1, true ),
					eTabs1 = Elements.createTabs( eColumn ),
					eTabs2 = Elements.createTabs( eColumn ),
					eMultiTabs = [ eTabs1, eTabs2 ],
					sourceIndex = 1,
					targetIndex = 0,
					eTabItem1 = eTabs1.settings.get( 'tabs' ).at( sourceIndex ),
					eTabItem2 = eTabs2.settings.get( 'tabs' ).at( sourceIndex ),
					eTabItems = [ eTabItem1, eTabItem2 ];

				Elements.multiRepeaterMove(
					eMultiTabs,
					'tabs',
					sourceIndex,
					targetIndex
				);

				const historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;
				let count = 0;

				// Exist in history.
				inHistoryValidate( assert, historyItem, 'move', 'elements' );

				// Undo.
				undoValidate( assert, historyItem );

				// Check item moved to sourceIndex
				count = 0;
				eMultiTabs.forEach( ( eTabs ) => {
					assert.equal( eTabs.settings.get( 'tabs' ).at( sourceIndex ).id, eTabItems[ count ].id,
						`Tab#${ count + 1 } - Item back to sourceIndex` );
					++count;
				} );

				// Redo.
				redoValidate( assert, historyItem );

				// Check item moved to targetIndex
				count = 0;
				eMultiTabs.forEach( ( eTabs ) => {
					assert.equal( eTabs.settings.get( 'tabs' ).at( targetIndex ).id, eTabItems[ count ].id,
						`Tab#${ count + 1 } - Item back to targetIndex` );
					++count;
				} );
			} );
		} );
	} );
} );
