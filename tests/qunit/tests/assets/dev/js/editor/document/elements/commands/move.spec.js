import ElementsHelper from '../helper';
import HistoryHelper from 'elementor/tests/qunit/tests/assets/dev/js/editor/document/history/helper';
import AddSectionView from 'elementor-views/add-section/independent';
import InlineAddSectionView from 'elementor-views/add-section/inline';
import NavigatorElement from 'elementor/assets/dev/js/editor/regions/navigator/element';
import { getDraggedContainerView } from 'elementor/assets/dev/js/editor/utils/dragged-container';

const stubVerticalBand = ( element, top, bottom ) => {
	element.getBoundingClientRect = () => ( { top, bottom, height: bottom - top, left: 0, right: 100, width: 100 } );
};

export const Move = () => {
	QUnit.module( 'Move', () => {
		QUnit.module( 'Single Selection', () => {
			QUnit.test( 'Section', ( assert ) => {
				// Create Section at 0.
				ElementsHelper.createSection();

				const eSection = ElementsHelper.createSection( 3 );

				ElementsHelper.move( eSection, elementor.getPreviewContainer(), { at: 0 } );

				const done = assert.async();

				// Validate first section have 3 columns.
				setTimeout( () => {
					assert.equal( elementor.getPreviewContainer().children[ 0 ].children.length, 3,
						'Section were moved.' );

					done();
				} );
			} );

			QUnit.test( 'Column', ( assert ) => {
				const eSection1 = ElementsHelper.createSection(),
					eSection2 = ElementsHelper.createSection(),
					eColumn = ElementsHelper.createColumn( eSection1 );

				ElementsHelper.move( eColumn, eSection2 );

				// Validate.
				assert.equal( eSection2.children.length, 2,
					'Columns were moved.' );
			} );

			QUnit.test( 'Widget', ( assert ) => {
				const eSection = ElementsHelper.createSection(),
					eColumn1 = ElementsHelper.createColumn( eSection ),
					eColumn2 = ElementsHelper.createColumn( eSection ),
					eButton = ElementsHelper.createWidgetButton( eColumn1 );

				ElementsHelper.move( eButton, eColumn2 );

				// Validate.
				assert.equal( eColumn1.children.length, 0,
					'Widget were removed from first column.' );
				assert.equal( eColumn2.children.length, 1,
					'Widget were moved/created at the second column.' );
			} );

			QUnit.test( 'Top-level container is draggable', ( assert ) => {
				const container = ElementsHelper.createContainer(),
					done = assert.async();

				setTimeout( () => {
					assert.equal( container.lookup().view.getDomElement().attr( 'draggable' ), 'true',
						'Top-level container can be dragged into another container.' );

					done();
				} );
			} );

			QUnit.test( 'Document drop zone accepts an existing container', ( assert ) => {
				const container = ElementsHelper.createContainer(),
					addSectionView = new AddSectionView();

				elementor.channels.editor.reply( 'element:dragged', container.view );

				assert.true( addSectionView.getDroppableOptions().isDroppingAllowed(),
					'Existing containers can be dragged back to the document level.' );

				elementor.channels.editor.reply( 'element:dragged', null );
			} );

			QUnit.test( 'Document drop zone rejects existing non-container elements', ( assert ) => {
				const container = ElementsHelper.createContainer(),
					widget = ElementsHelper.createWidgetButton( container ),
					addSectionView = new AddSectionView();

				elementor.channels.editor.reply( 'element:dragged', widget.view );

				const isDroppingAllowed = addSectionView.getDroppableOptions().isDroppingAllowed();

				elementor.channels.editor.reply( 'element:dragged', null );

				assert.false( isDroppingAllowed, 'Existing widgets cannot be moved to the document level.' );
			} );

			QUnit.test( 'Inline drop zone rejects existing containers', ( assert ) => {
				const container = ElementsHelper.createContainer(),
					addSectionView = new InlineAddSectionView();

				elementor.channels.editor.reply( 'element:dragged', container.view );

				const isDroppingAllowed = addSectionView.getDroppableOptions().isDroppingAllowed?.();

				elementor.channels.editor.reply( 'element:dragged', null );

				assert.false( isDroppingAllowed,
					'Only the document drop zone can move an existing container to the top level.' );
			} );

			QUnit.test( 'Document drop zone moves a nested container to the top level', ( assert ) => {
				const parentContainer = ElementsHelper.createContainer(),
					childContainer = ElementsHelper.createContainer(),
					addSectionView = new AddSectionView();

				ElementsHelper.move( childContainer, parentContainer );

				const nestedContainer = childContainer.lookup(),
					event = {
						originalEvent: {
							dataTransfer: {
								files: [],
							},
						},
					};

				elementor.channels.editor.reply( 'element:dragged', nestedContainer.view );
				elementor.channels.panelElements.reply( 'element:selected', nestedContainer.view );

				addSectionView.getDroppableOptions().onDropping( null, event );

				assert.equal( childContainer.lookup().parent.type, 'document',
					'Nested container becomes a top-level container.' );

				elementor.channels.editor.reply( 'element:dragged', null );
				elementor.channels.panelElements.reply( 'element:selected', null );
			} );

			QUnit.test( 'Canvas edge is detected on the top-level ancestor, not the hovered container', ( assert ) => {
				const topContainer = ElementsHelper.createContainer(),
					nestedContainer = ElementsHelper.createContainer();

				ElementsHelper.move( nestedContainer, topContainer );

				const nestedView = nestedContainer.lookup().view,
					element = topContainer.view.el,
					{ top, bottom } = element.getBoundingClientRect();

				assert.equal( nestedView.getDocumentLevelDropSide( element, { clientY: top } ), 'top',
					'Dropping at the top edge places the container above the top-level ancestor.' );
				assert.equal( nestedView.getDocumentLevelDropSide( element, { clientY: bottom } ), 'bottom',
					'Dropping at the bottom edge places the container below the top-level ancestor.' );
				assert.equal( nestedView.getDocumentLevelDropSide( element, { clientY: ( top + bottom ) / 2 } ), null,
					'Dropping away from the edges nests as usual.' );
			} );

			QUnit.test( 'Canvas edge moves a nested container beside the container it was dropped on', ( assert ) => {
				const firstContainer = ElementsHelper.createContainer(),
					parentContainer = ElementsHelper.createContainer(),
					childContainer = ElementsHelper.createContainer();

				ElementsHelper.move( childContainer, parentContainer );

				const draggedView = childContainer.lookup().view;

				elementor.channels.editor.reply( 'element:dragged', draggedView );

				parentContainer.view.moveToDocumentLevel( { view: draggedView, side: 'top' } );

				const movedContainer = childContainer.lookup(),
					topLevelChildren = elementor.getPreviewContainer().children;

				assert.equal( movedContainer.parent.type, 'document',
					'Nested container becomes a top-level container.' );
				assert.equal( topLevelChildren.indexOf( movedContainer ), topLevelChildren.indexOf( firstContainer.lookup() ) + 1,
					'Nested container is placed right above the container it was dropped on.' );

				elementor.channels.editor.reply( 'element:dragged', null );
			} );

			QUnit.test( 'Canvas edge previews the document-level drop on the top-level ancestor', ( assert ) => {
				const parentContainer = ElementsHelper.createContainer(),
					childContainer = ElementsHelper.createContainer();

				ElementsHelper.move( childContainer, parentContainer );

				const parentView = parentContainer.lookup().view,
					{ getPlaceholderOverride } = parentView.getDroppableOptions(),
					{ top, bottom } = parentView.el.getBoundingClientRect();

				elementor.channels.editor.reply( 'element:dragged', childContainer.lookup().view );

				const edgeOverride = getPlaceholderOverride( 'top', { clientY: top } ),
					centerOverride = getPlaceholderOverride( 'top', { clientY: ( top + bottom ) / 2 } );

				elementor.channels.editor.reply( 'element:dragged', null );

				assert.equal( edgeOverride?.element, parentView.el,
					'The placeholder previews beside the top-level ancestor, not inside it.' );
				assert.equal( edgeOverride?.side, 'top',
					'The placeholder previews on the side the container will land on.' );
				assert.equal( centerOverride, null,
					'Away from the edges the regular nesting placeholder is used.' );
			} );

			QUnit.test( 'Canvas edge reorders a top-level container instead of nesting it', ( assert ) => {
				const firstContainer = ElementsHelper.createContainer(),
					secondContainer = ElementsHelper.createContainer();

				const secondView = secondContainer.lookup().view,
					{ getPlaceholderOverride } = secondView.getDroppableOptions();

				// The test document has no layout, so the target needs a measurable band of its own.
				stubVerticalBand( secondView.el, 0, 200 );

				elementor.channels.editor.reply( 'element:dragged', firstContainer.lookup().view );

				const topOverride = getPlaceholderOverride( 'top', { clientY: 4 } ),
					middleOverride = getPlaceholderOverride( 'top', { clientY: 100 } ),
					bottomOverride = getPlaceholderOverride( 'top', { clientY: 196 } );

				elementor.channels.editor.reply( 'element:dragged', null );

				assert.equal( topOverride?.element, secondView.el,
					'At the edge a top-level container is previewed beside its sibling, so it can be reordered.' );
				assert.equal( topOverride?.side, 'top',
					'The preview sits on the side the container will land on.' );
				assert.equal( bottomOverride?.side, 'bottom',
					'The opposite edge places it after its sibling.' );
				assert.equal( middleOverride, null,
					'Away from the edges it nests as usual.' );
			} );

			QUnit.test( 'Canvas edge leaves a short container a middle to nest into', ( assert ) => {
				const firstContainer = ElementsHelper.createContainer(),
					secondContainer = ElementsHelper.createContainer();

				const secondView = secondContainer.lookup().view,
					{ getPlaceholderOverride } = secondView.getDroppableOptions();

				// Short enough that fixed-width edges would leave almost nothing between them.
				stubVerticalBand( secondView.el, 0, 40 );

				elementor.channels.editor.reply( 'element:dragged', firstContainer.lookup().view );

				const edgeOverride = getPlaceholderOverride( 'top', { clientY: 8 } ),
					insideOverride = getPlaceholderOverride( 'top', { clientY: 12 } );

				elementor.channels.editor.reply( 'element:dragged', null );

				assert.equal( edgeOverride?.side, 'top',
					'The edge still reorders.' );
				assert.equal( insideOverride, null,
					'The edge shrinks with the container, so its middle can still be aimed at.' );
			} );

			QUnit.test( 'Canvas edge ignores a container dropped on its own descendant', ( assert ) => {
				const parentContainer = ElementsHelper.createContainer(),
					childContainer = ElementsHelper.createContainer();

				ElementsHelper.move( childContainer, parentContainer );

				const childView = childContainer.lookup().view,
					{ getPlaceholderOverride } = childView.getDroppableOptions();

				elementor.channels.editor.reply( 'element:dragged', parentContainer.lookup().view );

				const override = getPlaceholderOverride( 'top', { clientY: childView.el.getBoundingClientRect().top } );

				elementor.channels.editor.reply( 'element:dragged', null );

				assert.equal( override, null,
					'A container is never previewed beside itself.' );
			} );

			QUnit.test( 'Containers are moved by drag & drop rather than by the document sortable', ( assert ) => {
				const { items } = elementor.getPreviewView().getSortableOptions();

				assert.notOk( items.includes( '.e-con' ),
					'The document sortable leaves containers to the drag & drop system, which can also nest them.' );
			} );

			QUnit.test( 'A boxed container accepts drops across its full width', ( assert ) => {
				const container = ElementsHelper.createContainer(),
					view = container.lookup().view;

				container.settings.set( 'content_width', 'boxed' );

				assert.true( view.getDroppableItems().startsWith( '> .e-con-inner' ),
					'A boxed container addresses its drop targets from the outer element, so its gutters belong to it too.' );

				container.settings.set( 'content_width', 'full' );

				assert.true( view.getDroppableItems().startsWith( '> .elementor-element' ),
					'A full-width container has no gutters and addresses its children directly.' );
			} );

			QUnit.test( 'A drop outside the children falls back to the nearest one', ( assert ) => {
				const container = ElementsHelper.createContainer(),
					firstWidget = ElementsHelper.createWidgetButton( container ),
					secondWidget = ElementsHelper.createWidgetButton( container ),
					view = container.lookup().view;

				// The test document has no layout, so the children need measurable bands of their own.
				stubVerticalBand( firstWidget.view.el, 0, 50 );
				stubVerticalBand( secondWidget.view.el, 50, 100 );

				assert.equal( view.getDroppableFallbackItem( { clientY: 10 } ), firstWidget.view.el,
					'A drop beside the first child resolves to it.' );
				assert.equal( view.getDroppableFallbackItem( { clientY: 90 } ), secondWidget.view.el,
					'A drop beside the last child resolves to it.' );
				assert.equal( view.getDroppableFallbackItem( { clientY: 500 } ), secondWidget.view.el,
					'A drop past the last child resolves to it rather than being rejected.' );
			} );

			QUnit.test( 'Canvas edge ignores widgets dragged from an existing container', ( assert ) => {
				const container = ElementsHelper.createContainer(),
					widget = ElementsHelper.createWidgetButton( container );

				elementor.channels.editor.reply( 'element:dragged', widget.view );

				const draggedContainerView = getDraggedContainerView();

				elementor.channels.editor.reply( 'element:dragged', null );

				assert.equal( draggedContainerView, null,
					'Only containers can be moved to the document level from the canvas edge.' );
			} );

			QUnit.test( 'Structure root accepts nestable elements', ( assert ) => {
				const rootModel = new Backbone.Model( {
						elements: new Backbone.Collection(),
						settings: new Backbone.Model(),
					} ),
					rootView = new NavigatorElement( { model: rootModel } );

				assert.true( rootView.className().includes( 'elementor-navigator__element-new-nestable' ),
					'Nested containers can be dragged back to the Structure root.' );

				rootView.destroy();
			} );

			QUnit.test( 'Structure moves a nested container to the root', ( assert ) => {
				const parentContainer = ElementsHelper.createContainer(),
					childContainer = ElementsHelper.createContainer();

				ElementsHelper.move( childContainer, parentContainer );

				const nestedContainer = childContainer.lookup(),
					sortableBehavior = elementor.getPreviewView().getBehavior( 'Sortable' );

				elementor.channels.data
					.reply( 'dragging:model', nestedContainer.model )
					.reply( 'dragging:view', nestedContainer.view );

				let error;

				try {
					sortableBehavior.receiveSort( { stopPropagation() {} }, { sender: jQuery( '<div>' ) }, 0 );
				} catch ( caughtError ) {
					error = caughtError;
				}

				assert.notOk( error, 'Structure root accepts the nested container without an error.' );
				assert.equal( childContainer.lookup().parent.type, 'document',
					'Structure moves the nested container to the document.' );

				elementor.channels.data
					.reply( 'dragging:model', null )
					.reply( 'dragging:view', null );
			} );

			QUnit.test( 'Structure prevents moving a widget to the root', ( assert ) => {
				const parentContainer = ElementsHelper.createContainer(),
					widget = ElementsHelper.createWidgetButton( parentContainer ),
					sortableBehavior = elementor.getPreviewView().getBehavior( 'Sortable' ),
					sender = jQuery( '<div>' ).sortable();

				elementor.channels.data
					.reply( 'dragging:model', widget.model )
					.reply( 'dragging:view', widget.view );

				let error;

				try {
					sortableBehavior.receiveSort( { stopPropagation() {} }, { sender }, 0 );
				} catch ( caughtError ) {
					error = caughtError;
				}

				assert.notOk( error, 'Structure rejects the widget without an error.' );
				assert.equal( widget.lookup()?.parent?.id, parentContainer.id,
					'Widget remains in its valid parent.' );

				sender.sortable( 'destroy' );

				elementor.channels.data
					.reply( 'dragging:model', null )
					.reply( 'dragging:view', null );
			} );

			QUnit.test( 'Container updates isInner when moving between nesting levels', ( assert ) => {
				const parentContainer = ElementsHelper.createContainer(),
					childContainer = ElementsHelper.createContainer(),
					done = assert.async();

				ElementsHelper.move( childContainer, parentContainer );

				setTimeout( () => {
					const nestedContainer = childContainer.lookup();

					assert.true( nestedContainer.model.get( 'isInner' ),
						'Container moved into another container becomes inner.' );

					ElementsHelper.move( nestedContainer, elementor.getPreviewContainer() );

					setTimeout( () => {
						assert.false( childContainer.lookup().model.get( 'isInner' ),
							'Container moved to the document becomes top-level.' );

						done();
					} );
				} );
			} );

			QUnit.module( 'History', () => {
				QUnit.test( 'Section', ( assert ) => {
					// Create Section at 0.
					ElementsHelper.createSection();

					const eSection = ElementsHelper.createSection( 3 ),
						originalPosition = eSection.view._index,
						targetPosition = 0;

					ElementsHelper.move( eSection, elementor.getPreviewContainer(), { at: targetPosition } );

					const historyItem = HistoryHelper.getFirstItem().attributes;

					// Exist in history.
					HistoryHelper.inHistoryValidate( assert, historyItem, 'move', 'Section' );

					// Undo.
					HistoryHelper.undoValidate( assert, historyItem );

					const eSectionAfterUndo = eSection.lookup();

					assert.equal( eSectionAfterUndo.view._index, originalPosition,
						'Element has been returned to the original position' );

					// Redo.
					HistoryHelper.redoValidate( assert, historyItem );

					const eSectionAfterRedo = eSection.lookup();

					assert.equal( eSectionAfterRedo.view._index, targetPosition,
						'Element was re-added to correct position' );
				} );

				QUnit.test( 'Column between sections', ( assert ) => {
					const eSection1 = ElementsHelper.createSection(),
						eSection2 = ElementsHelper.createSection(),
						eColumn = ElementsHelper.createColumn( eSection1 ),
						originalPosition = eColumn.view._index,
						targetPosition = 1;

					ElementsHelper.move( eColumn, eSection2, { at: targetPosition } );

					const historyItem = HistoryHelper.getFirstItem().attributes;

					// Exist in history.
					HistoryHelper.inHistoryValidate( assert, historyItem, 'move', 'Column' );

					// Undo.
					HistoryHelper.undoValidate( assert, historyItem );

					const eColumnAfterUndo = eColumn.lookup();

					assert.equal( eColumnAfterUndo.view._index, originalPosition,
						'Element has been returned to the original position' );

					// Redo.
					HistoryHelper.redoValidate( assert, historyItem );

					const eColumnAfterRedo = eColumn.lookup();

					assert.equal( eColumnAfterRedo.view._index, targetPosition,
						'Element was re-added to correct position' );
				} );

				QUnit.test( 'Column in same section', ( assert ) => {
					const eSection = ElementsHelper.createSection();

					ElementsHelper.createColumn( eSection );

					const eColumn2 = ElementsHelper.createColumn( eSection ),
						originalPosition = eColumn2.view._index,
						targetPosition = 0;

					ElementsHelper.move( eColumn2, eSection, { at: targetPosition } );

					const historyItem = HistoryHelper.getFirstItem().attributes;

					// Exist in history.
					HistoryHelper.inHistoryValidate( assert, historyItem, 'move', 'Column' );

					// Undo.
					HistoryHelper.undoValidate( assert, historyItem );

					const eColumnAfterUndo = eColumn2.lookup();

					assert.equal( eColumnAfterUndo.view._index, originalPosition,
						'Element has been returned to the original position' );

					// Redo.
					HistoryHelper.redoValidate( assert, historyItem );

					const eColumnAfterRedo = eColumn2.lookup();

					assert.equal( eColumnAfterRedo.view._index, targetPosition,
						'Element was re-added to correct position' );
				} );

				QUnit.test( 'Widget', ( assert ) => {
					const eSection = ElementsHelper.createSection(),
						eColumn1 = ElementsHelper.createColumn( eSection ),
						eColumn2 = ElementsHelper.createColumn( eSection ),
						eWidget = ElementsHelper.createWidgetButton( eColumn1 ),
						originalPosition = eWidget.view._index,
						targetPosition = 1;

					ElementsHelper.createWidgetButton( eColumn2 );
					ElementsHelper.createWidgetButton( eColumn2 );

					ElementsHelper.move( eWidget, eColumn2, { at: targetPosition } );

					const historyItem = HistoryHelper.getFirstItem().attributes;

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
			} );
		} );

		QUnit.module( 'Multiple Selection', () => {
			QUnit.test( 'Sections', ( assert ) => {
				// Create Section at 0.
				ElementsHelper.createSection();

				const section1ColumnsCount = 3,
					section2ColumnsCount = 4,
					eSection1 = ElementsHelper.createSection( section1ColumnsCount ),
					eSection2 = ElementsHelper.createSection( section2ColumnsCount );

				ElementsHelper.multiMove( [ eSection1, eSection2 ], elementor.getPreviewContainer(), { at: 0 } );

				// Validate first section have 3 columns.
				assert.equal( elementor.getPreviewContainer().model.attributes.elements.first().attributes.elements.length,
					section1ColumnsCount,
					`Section #1, '${ section1ColumnsCount }' columns were created.` );

				// Validate second section have 4 columns.
				assert.equal( elementor.getPreviewContainer().model.attributes.elements.at( 1 ).attributes.elements.length,
					section2ColumnsCount,
					`Section #2, '${ section2ColumnsCount }' columns were created.` );
			} );

			QUnit.test( 'Columns', ( assert ) => {
				const eSection1 = ElementsHelper.createSection(),
					eSection2 = ElementsHelper.createSection(),
					eColumn1 = ElementsHelper.createColumn( eSection1 ),
					eColumn2 = ElementsHelper.createColumn( eSection1 );

				ElementsHelper.multiMove( [ eColumn1, eColumn2 ], eSection2 );

				// Validate.
				assert.equal( eSection2.children.length, 3,
					'Columns were moved.' );
			} );

			QUnit.test( 'Widgets', ( assert ) => {
				const eSection = ElementsHelper.createSection(),
					eColumn1 = ElementsHelper.createColumn( eSection ),
					eColumn2 = ElementsHelper.createColumn( eSection ),
					eButton1 = ElementsHelper.createWidgetButton( eColumn1 ),
					eButton2 = ElementsHelper.createWidgetButton( eColumn1 );

				ElementsHelper.multiMove( [ eButton1, eButton2 ], eColumn2 );

				// Validate.
				assert.equal( eColumn1.children.length, 0,
					'Widgets were removed from the first column.' );
				assert.equal( eColumn2.children.length, 2,
					'Widgets were moved/create at the second column.' );
			} );
		} );

		QUnit.module( 'Misc', () => {
			QUnit.test( 'Swap column places -- Ensure valid containers', ( assert ) => {
				// Arrange.
				const eSection = ElementsHelper.createSectionStructure( 2 ),
					columnsIds = [],
					actualColumnsIds = [];

				eSection.children.forEach( ( eColumn ) => columnsIds.push( eColumn.id ) );

				// Act.
				ElementsHelper.move( eSection.children[ 0 ], eSection, { at: 1 } );

				eSection.children.forEach( ( eColumn ) => actualColumnsIds.push( eColumn.id ) );

				// Assert.
				assert.deepEqual( actualColumnsIds, columnsIds.reverse(),
					'The column ids actually reversed' );
			} );
		} );
	} );
};

export default Move;
