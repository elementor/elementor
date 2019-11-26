import DocumentHelper from '../helper';
import HistoryHelper from './helper';
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
			DocumentHelper.empty();

			elementor.history.history.getItems().reset();
		} );

		QUnit.module( 'Miscellaneous', () => {
			QUnit.test( 'Post Settings', ( assert ) => {
				const eDocument = elementor.getPreviewContainer(),
					settings = {
						padding: {
							top: '50',
						},
				};

				DocumentHelper.settings( eDocument, settings );

				const done = assert.async();

				setTimeout( () => {
					const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

					// Exist in history.
					HistoryHelper.inHistoryValidate( assert, historyItem, 'change', 'Post' );

					// Undo.
					HistoryHelper.undoValidate( assert, historyItem );

					assert.equal( eDocument.settings.attributes.padding, undefined,
						'Settings back to default' );

					// Redo.
					HistoryHelper.redoValidate( assert, historyItem );

					assert.equal( eDocument.settings.attributes.padding.top, settings.padding.top,
						'Settings restored' );

					done();
				} );
			} );

			QUnit.test( 'General Settings: Style', ( assert ) => {
				elementor.getPreviewView();

				const eGeneralSettings = elementor.settings.general.getEditedView().getContainer(),
					settings = {
					elementor_default_generic_fonts: 'fake',
				};

				DocumentHelper.settings( eGeneralSettings, settings );

				const done = assert.async();

				setTimeout( () => {
					const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

					// Exist in history.
					HistoryHelper.inHistoryValidate( assert, historyItem, 'change', 'Global Settings' );

					// Undo.
					HistoryHelper.undoValidate( assert, historyItem );

					assert.equal( eGeneralSettings.settings.attributes.elementor_default_generic_fonts,
						elementor.config.settings.general.settings.elementor_default_generic_fonts,
						'Settings back to default' );

					// Redo.
					HistoryHelper.redoValidate( assert, historyItem );

					assert.equal( eGeneralSettings.settings.attributes.elementor_default_generic_fonts,
						settings.elementor_default_generic_fonts,
						'Settings restored'
					);

					done();
				} );
			} );

			QUnit.test( 'General Settings: Lightbox', ( assert ) => {
				elementor.getPreviewView();

				const eGeneralSettings = elementor.settings.general.getEditedView().getContainer(),
					settings = {
						elementor_global_image_lightbox: 'fake',
					};

				DocumentHelper.settings( eGeneralSettings, settings );

				const done = assert.async();

				setTimeout( () => {
					const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

					// Exist in history.
					HistoryHelper.inHistoryValidate( assert, historyItem, 'change', 'Global Settings' );

					// Undo.
					HistoryHelper.undoValidate( assert, historyItem );

					assert.equal( eGeneralSettings.settings.attributes.elementor_global_image_lightbox,
						elementor.config.settings.general.settings.elementor_global_image_lightbox,
						'Settings back to default' );

					// Redo.
					HistoryHelper.redoValidate( assert, historyItem );

					assert.equal( eGeneralSettings.settings.attributes.elementor_global_image_lightbox,
						settings.elementor_global_image_lightbox,
						'Settings restored'
					);

					done();
				} );
			} );

			QUnit.test( 'Saver Editor Flag', ( assert ) => {
				elementor.saver.setFlagEditorChange( false );

				DocumentHelper.createSection( 1 );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Saver editor flag is `true`.
				assert.equal( elementor.saver.isEditorChanged(), true,
					'After create, saver editor flag is "true".' );

				// Undo.
				undoValidate( assert, historyItem );

				// Saver editor flag is `true`.
				assert.equal( elementor.saver.isEditorChanged(), false,
					'After create, saver editor flag is "false".' );

				// Redo.
				redoValidate( assert, historyItem );

				// Saver editor flag is `true`.
				assert.equal( elementor.saver.isEditorChanged(), true,
					'After create, saver editor flag is "true".' );
			} );

			QUnit.test( 'History Rollback', ( assert ) => {
				try {
					$e.run( 'document/elements/create', {
						container: ( new elementorModules.editor.Container( {} ) ),
						settings: {},
					} );
				} catch ( e ) {
					// Do nothing (ignore).
				}

				const historyItem = elementor.history.history.getItems().at( 0 );

				assert.equal( historyItem, undefined, 'History was rolled back.' );
			} );
		} );

		QUnit.module( 'document/elements: Single Selection', () => {
			QUnit.test( 'Resize Column', ( assert ) => {
				assert.equal( 1, 1, 'Test skipped.' );
				/*const newSize = 20,
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

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

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
					'Column2 restored' );*/
			} );

			QUnit.test( 'Move Section', ( assert ) => {
				// Create Section at 0.
				DocumentHelper.createSection();

				const eSection = DocumentHelper.createSection( 3 ),
					originalPosition = eSection.view._index,
					targetPosition = 0;

				DocumentHelper.move( eSection, elementor.getPreviewContainer(), { at: targetPosition } );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

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
				const eSection1 = DocumentHelper.createSection(),
					eSection2 = DocumentHelper.createSection(),
					eColumn = DocumentHelper.createColumn( eSection1 ),
					originalPosition = eColumn.view._index,
					targetPosition = 1;

				DocumentHelper.move( eColumn, eSection2, { at: targetPosition } );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

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
				const eSection = DocumentHelper.createSection();

				/* eColumn1 = */ DocumentHelper.createColumn( eSection );

				const eColumn2 = DocumentHelper.createColumn( eSection ),
					originalPosition = eColumn2.view._index,
					targetPosition = 0;

				DocumentHelper.move( eColumn2, eSection, { at: targetPosition } );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

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
				const eSection = DocumentHelper.createSection(),
					eColumn1 = DocumentHelper.createColumn( eSection ),
					eColumn2 = DocumentHelper.createColumn( eSection ),
					eWidget = DocumentHelper.createButton( eColumn1 ),
					originalPosition = eWidget.view._index,
					targetPosition = 1;

				DocumentHelper.createButton( eColumn2 );
				DocumentHelper.createButton( eColumn2 );

				DocumentHelper.move( eWidget, eColumn2, { at: targetPosition } );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				HistoryHelper.inHistoryValidate( assert, historyItem, 'move', 'Button' );

				// Undo.
				HistoryHelper.undoValidate( assert, historyItem );

				const eWidgetAfterUndo = eWidget.lookup();

				assert.equal( eWidgetAfterUndo.view._index, originalPosition,
					'Element has been returned to the original position' );

				// Redo.
				HistoryHelper.redoValidate( assert, historyItem );

				const eWidgetAfterRedo = eWidget.lookup();

				assert.equal( eWidgetAfterRedo.view._index, targetPosition,
					'Element was re-added to correct position' );
			} );

			QUnit.test( 'Delete', ( assert ) => {
				const eWidget = DocumentHelper.createAutoButton();

				DocumentHelper.delete( eWidget );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

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
				const eButton = DocumentHelper.createAutoButton(),
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

				const doneSettings = assert.async();

				setTimeout( () => {
					const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

					// Exist in history.
					inHistoryValidate( assert, historyItem, 'change', 'Button' );

					// Undo.
					undoValidate( assert, historyItem );

					assert.equal( eButton.settings.attributes.text, defaultButtonText, 'Settings back to default' );

					// Redo.
					redoValidate( assert, historyItem );

					doneSettings();

					const doneDynamic = assert.async();

					setTimeout( () => {
						assert.equal( eButton.view.$el.find( '.button-text' ).html(), dynamicValue, 'Settings restored' );
						doneDynamic();
					}, 1000 );
				} );
			} );

			// QUnit.test( 'Dynamic in repeater', ( assert ) => {
			// 	const eForm = DocumentHelper.createAutoForm(),
			// 		eFormItem = eForm.children[ 0 ],
			// 		dynamicTag = '[elementor-tag id="d96ebd2" name="post-date" settings="%7B%22format%22%3A%22d%2Fm%2FY%22%7D"]', // post-date with non default format.
			// 		dynamicValue = '{ dynamic text }',
			// 		{ id, name, settings } = elementor.dynamicTags.tagTextToTagData( dynamicTag ),
			// 		tag = elementor.dynamicTags.createTag( id, name, settings ),
			// 		key = elementor.dynamicTags.createCacheKey( tag );
			//
			// 	// Set fake data.
			// 	elementor.dynamicTags.cache[ key ] = dynamicValue;
			//
			// 	const doneAttach = assert.async();
			//
			// 	eFormItem.view.attachElContent = function( html ) {
			// 		debugger;
			// 		eFormItem.view.$el.empty().append( html );
			//
			// 		doneAttach();
			// 	};
			//
			// 	const done = assert.async();
			//
			// 	$e.run( 'document/dynamic/settings', {
			// 		container: eFormItem,
			// 		settings: { field_value: dynamicTag },
			// 	} );
			//
			// 	setTimeout( () => {
			// 		assert.equal( eForm.view.$el.find( '.button-text' ).html(), dynamicValue,
			// 			`button text changed to dynamic value: '${ dynamicValue }'` );
			//
			// 		done();
			// 	} )
			// } );

			QUnit.test( 'Import', ( assert ) => {
				// eslint-disable-next-line camelcase
				const { model, content, page_settings } = BlockFaq;
				const data = { content, page_settings };

				DocumentHelper.import( data, new Backbone.Model( model ) );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

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

		QUnit.module( 'document/repeater: Single Selection', () => {
			QUnit.test( 'Insert', ( assert ) => {
				const eColumn = DocumentHelper.createSection( 1, true ),
					eTabs = DocumentHelper.createTabs( eColumn ),
					originalItemsCount = eTabs.settings.get( 'tabs' ).length;

				DocumentHelper.repeaterInsert( eTabs, 'tabs', {
					tab_title: 'Test Tab Title',
					tab_content: 'Test Tab Content',
				} );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

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
				const eColumn = DocumentHelper.createSection( 1, true ),
					eTabs = DocumentHelper.createTabs( eColumn ),
					originalItemsCount = eTabs.settings.get( 'tabs' ).length;

				DocumentHelper.repeaterRemove( eTabs, 'tabs', 1 );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

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

			QUnit.test( 'Duplicate', ( assert ) => {
				const eColumn = DocumentHelper.createSection( 1, true ),
					eTabs = DocumentHelper.createTabs( eColumn ),
					originalItemsCount = eTabs.settings.get( 'tabs' ).length;

				DocumentHelper.repeaterDuplicate( eTabs, 'tabs', 1 );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

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
				const eColumn = DocumentHelper.createSection( 1, true ),
					eTabs = DocumentHelper.createTabs( eColumn ),
					sourceIndex = 1,
					targetIndex = 0,
					eTabModel = eTabs.settings.get( 'tabs' ).at( sourceIndex );

				DocumentHelper.repeaterMove( eTabs, 'tabs', sourceIndex, targetIndex );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

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

			// QUnit.test( 'Deep', ( assert ) => {
			// 	const eColumn = DocumentHelper.createSection( 1, true ),
			// 		name = 'form_fields',
			// 		eForm = DocumentHelper.createForm( eColumn ),
			// 		beforeInsertItemsCount = eForm.settings.get( name ).length;
			//
			// 	// Insert Item.
			// 	DocumentHelper.repeaterInsert( eForm, name, {
			// 		field_type: 'text',
			// 		field_label: 'Name',
			// 	} );
			//
			// 	const currentItemIndex = 3;
			//
			// 	// Change field_type = 'email' for new item.
			// 	DocumentHelper.repeaterSettings( eForm, name, currentItemIndex, { field_type: 'email' }, {
			// 		external: true,
			// 	} );
			//
			// 	// Change required = 'true' for new item.
			// 	DocumentHelper.repeaterSettings( eForm, name, currentItemIndex, { required: 'true' }, {
			// 		external: true,
			// 	} );
			//
			// 	// Undo
			// 	$e.run( 'document/history/undo' );
			//
			// 	// Validate required = '' for new item.
			// 	assert.equal( eForm.settings.get( name ).at( currentItemIndex ).get( 'required' ), '',
			// 		'Require setting back to default' );
			//
			// 	// Undo
			// 	$e.run( 'document/history/undo' );
			//
			// 	// Validate field_type = 'text' for new item.
			// 	assert.equal( eForm.settings.get( name ).at( currentItemIndex ).get( 'field_type' ), 'text',
			// 		'field_type setting back to default' );
			//
			// 	$e.run( 'document/history/undo' );
			//
			// 	// Validate new inserted item removed.
			// 	assert.equal( eForm.settings.get( name ).length, beforeInsertItemsCount,
			// 		'New item was removed' );
			//
			// 	// Redo
			// 	$e.run( 'document/history/redo' );
			//
			// 	// Validate new inserted item was recreated.
			// 	assert.equal( eForm.settings.get( name ).length, ( beforeInsertItemsCount + 1 ),
			// 		'New item was recreated' );
			//
			// 	// Redo
			// 	$e.run( 'document/history/redo' );
			//
			// 	// Validate field_type = 'email' for new item.
			// 	assert.equal( eForm.settings.get( name ).at( currentItemIndex ).get( 'field_type' ), 'email',
			// 		'field_type setting was restored' );
			//
			// 	$e.run( 'document/history/redo' );
			//
			// 	// Validate required = 'true' for new item.
			// 	assert.equal( eForm.settings.get( name ).at( currentItemIndex ).get( 'required' ), 'true',
			// 		'Require setting was restored' );
			// } );
		} );

		QUnit.module( 'document/repeater: Multiple Selection', () => {
			QUnit.test( 'Insert', ( assert ) => {
				const eColumn = DocumentHelper.createSection( 1, true ),
					eTabs1 = DocumentHelper.createTabs( eColumn ),
					eTabs2 = DocumentHelper.createTabs( eColumn ),
					eMultiTabs = [ eTabs1, eTabs2 ],
					originalItemsCount = eTabs1.settings.get( 'tabs' ).length;

				DocumentHelper.multiRepeaterInsert( eMultiTabs, 'tabs', {
					tab_title: 'Test Tab Title',
					tab_content: 'Test Tab Content',
				} );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

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
				const eColumn = DocumentHelper.createSection( 1, true ),
					eTabs1 = DocumentHelper.createTabs( eColumn ),
					eTabs2 = DocumentHelper.createTabs( eColumn ),
					eMultiTabs = [ eTabs1, eTabs2 ],
					originalItemsCount = eTabs1.settings.get( 'tabs' ).length;

				DocumentHelper.multiRepeaterRemove( eMultiTabs, 'tabs', 1 );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

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

			QUnit.test( 'Duplicate', ( assert ) => {
				const eColumn = DocumentHelper.createSection( 1, true ),
					eTabs1 = DocumentHelper.createTabs( eColumn ),
					eTabs2 = DocumentHelper.createTabs( eColumn ),
					eMultiTabs = [ eTabs1, eTabs2 ],
					originalItemsCount = eTabs1.settings.get( 'tabs' ).length;

				DocumentHelper.multiRepeaterDuplicate( [ eTabs1, eTabs2 ], 'tabs', 1 );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

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
				const eColumn = DocumentHelper.createSection( 1, true ),
					eTabs1 = DocumentHelper.createTabs( eColumn ),
					eTabs2 = DocumentHelper.createTabs( eColumn ),
					eMultiTabs = [ eTabs1, eTabs2 ],
					sourceIndex = 1,
					targetIndex = 0,
					eTabItem1 = eTabs1.settings.get( 'tabs' ).at( sourceIndex ),
					eTabItem2 = eTabs2.settings.get( 'tabs' ).at( sourceIndex ),
					eTabItems = [ eTabItem1, eTabItem2 ];

				DocumentHelper.multiRepeaterMove(
					eMultiTabs,
					'tabs',
					sourceIndex,
					targetIndex
				);

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;
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
