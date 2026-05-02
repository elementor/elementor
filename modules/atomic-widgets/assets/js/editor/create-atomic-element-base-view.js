import { getAllElementTypes } from 'elementor-editor/utils/element-types';
import AtomicElementEmptyView from './container/atomic-element-empty-view';

const BaseElementView = elementor.modules.elements.views.BaseElement;

export default function createAtomicElementBaseView( type ) {
	const AtomicElementView = BaseElementView.extend( {
		template: Marionette.TemplateCache.get( `#tmpl-elementor-${ type }-content` ),

		emptyView: AtomicElementEmptyView,

		_childrenRenderPromises: [],

		_createElement( tag ) {
			const previewDocument = elementor.$preview?.[ 0 ]?.contentDocument;

			if ( previewDocument ) {
				return previewDocument.createElement( tag );
			}

			return document.createElement( tag );
		},

		getChildViewContainer() {
			this.childViewContainer = '';

			return Marionette.CompositeView.prototype.getChildViewContainer.apply( this, arguments );
		},

		getChildType() {
			const atomicElements = Object.entries( elementor.config.elements )
				.filter( ( [ , element ] ) => !! element?.atomic_props_schema )
				.map( ( [ elType ] ) => elType );

			return [
				'widget',
				'container',
				...atomicElements,
			];
		},

		getRenderContext() {
			return this._parent?.getRenderContext?.();
		},

		getResolverRenderContext() {
			return this._parent?.getResolverRenderContext?.();
		},

		render() {
			this._currentRenderPromise = new Promise( ( resolve ) => {
				// Optimize rendering by reusing existing child views instead of recreating them.
				if ( this._shouldSkipFullRender() ) {
					this._renderWithoutDomRecreation( resolve );
				} else {
					this._renderWithDomRecreation( resolve );
				}
			} );

			return this;
		},

		_shouldSkipFullRender() {
			return this.isRendered && this._hasConnectedChildren();
		},

		_hasConnectedChildren() {
			if ( ! this.children?.length ) {
				return false;
			}

			// If the parent's innerHTML was replaced, all children are detached together.
			const firstChild = this.children.findByIndex( 0 );
			return firstChild?.$el?.get( 0 )?.isConnected ?? false;
		},

		_renderWithoutDomRecreation( resolve ) {
			this._beforeRender();
			this._renderChildren();
			this._waitForChildrenToComplete().then( () => {
				this._afterRender();
				resolve();
			} );
		},

		_renderWithDomRecreation( resolve ) {
			BaseElementView.prototype.render.apply( this, arguments );
			this._waitForChildrenToComplete().then( () => {
				resolve();
			} );
		},

		_beforeRender() {
			this._isRendering = true;
			this.triggerMethod( 'before:render', this );
		},

		_afterRender() {
			this._isRendering = false;
			this.isRendered = true;
			this.triggerMethod( 'render', this );
		},

		async _waitForChildrenToComplete() {
			if ( this._childrenRenderPromises.length > 0 ) {
				await Promise.all( this._childrenRenderPromises );
			}
		},

		_renderChildren() {
			if ( this._shouldSkipFullRender() ) {
				this.children?.each( ( childView ) => childView.render() );
			} else {
				BaseElementView.prototype._renderChildren.apply( this, arguments );
			}

			this._collectChildrenRenderPromises();
		},

		_collectChildrenRenderPromises() {
			this._childrenRenderPromises = [];

			this.children?.each( ( childView ) => {
				if ( childView._currentRenderPromise ) {
					this._childrenRenderPromises.push( childView._currentRenderPromise );
				}
			} );
		},

		onRender() {
			this.dispatchPreviewEvent( 'elementor/element/render' );

			BaseElementView.prototype.onRender.apply( this, arguments );

			// Defer to wait for everything to render.
			setTimeout( () => {
				this.droppableInitialize();
				this.updateHandlesPosition();
			} );
		},

		onDestroy() {
			BaseElementView.prototype.onDestroy.apply( this, arguments );

			this.dispatchPreviewEvent( 'elementor/element/destroy' );
		},

		dispatchPreviewEvent( eventType ) {
			elementor?.$preview?.[ 0 ]?.contentWindow.dispatchEvent(
				new CustomEvent( eventType, {
					detail: {
						id: this.model.get( 'id' ),
						type: this.model.get( 'elType' ),
						element: this.getDomElement().get( 0 ),
					},
				} ),
			);
		},

		droppableInitialize() {
			this.$el.html5Droppable( this.getDroppableOptions() );
		},

		/**
		 * Add a `Save as a Template` button to the context menu.
		 *
		 * @return {Object} groups
		 */
		getContextMenuGroups() {
			const saveActions = [
				{
					name: 'save',
					title: __( 'Save as a template', 'elementor' ),
					callback: this.saveAsTemplate.bind( this ),
					isEnabled: () => ! this.getContainer().isLocked(),
				},
			];

			const isAdministrator = elementor.config.user.is_administrator;
			const isExperimentalFeaturesEnabled = elementorCommon.config.experimentalFeatures?.e_components;

			if ( isExperimentalFeaturesEnabled && isAdministrator ) {
				const isProActive = window.elementorV2?.utils?.isProActive?.() ?? true;
				const hasProInstalled = window.elementorV2?.utils?.hasProInstalled?.() ?? false;
				const isProOutdated = hasProInstalled && ! ( window.elementorV2?.utils?.isProAtLeast?.( '4.0' ) ?? false );
				const showPromoBadge = ! isProActive && ! isProOutdated;

				const newBadge = `<span class="elementor-context-menu-list__item__shortcut__new-badge">${ __( 'New', 'elementor' ) }</span>`;
				const badgeClass = 'elementor-context-menu-list__item__shortcut__promotion-badge';
				const proBadge = `<a href="https://go.elementor.com/go-pro-components-Instance-create-context-menu/" target="_blank" onclick="event.stopPropagation()" class="${ badgeClass }"><i class="eicon-upgrade-crown"></i></a>`;

				saveActions.unshift( {
					name: 'save-component',
					title: __( 'Create component', 'elementor' ),
					shortcut: ( isProActive || isProOutdated ) ? newBadge : proBadge,
					hasShortcutAction: showPromoBadge,
					callback: this.saveAsComponent.bind( this ),
					isEnabled: () => ( isProActive || isProOutdated ) && ! this.getContainer().isLocked(),
				} );
			}

			var groups = BaseElementView.prototype.getContextMenuGroups.apply(
					this,
					arguments,
				),
				transferGroupClipboardIndex = groups.indexOf(
					_.findWhere( groups, { name: 'clipboard' } ),
				);

			groups.splice( transferGroupClipboardIndex + 1, 0, {
				name: 'save',
				actions: saveActions,
			} );

			return groups;
		},

		saveAsTemplate() {
			elementor.templates.eventManager.sendNewSaveTemplateClickedEvent();

			$e.route( 'library/save-template', {
				model: this.model,
			} );
		},

		saveAsComponent( openContextMenuEvent, options ) {
			const hasProInstalled = window.elementorV2?.utils?.hasProInstalled?.() ?? false;
			const isProOutdated = hasProInstalled && ! ( window.elementorV2?.utils?.isProAtLeast?.( '4.0' ) ?? false );

			if ( isProOutdated ) {
				window.elementorV2?.editorNotifications?.notify?.( {
					type: 'info',
					id: 'component-create-update',
					message: __( 'To create new components, update Elementor Pro to the latest version.', 'elementor' ),
					additionalActionProps: [ {
						size: 'small',
						variant: 'contained',
						color: 'info',
						href: '/wp-admin/plugins.php',
						target: '_blank',
						children: __( 'Update Now', 'elementor' ),
					} ],
				} );
				return;
			}

			const isProActive = window.elementorV2?.utils?.isProActive?.() ?? true;

			if ( ! isProActive ) {
				return;
			}

			// Calculate the absolute position where the context menu was opened.
			const openMenuOriginalEvent = openContextMenuEvent.originalEvent;
			const iframeRect = elementor.$preview[ 0 ].getBoundingClientRect();
			const anchorPosition = {
				left: openMenuOriginalEvent.clientX + iframeRect.left,
				top: openMenuOriginalEvent.clientY + iframeRect.top,
			};

			window.dispatchEvent( new CustomEvent(
				'elementor/editor/open-save-as-component-form',
				{
					detail: {
						element: elementor.getContainer( this.model.id ).model.toJSON( { remove: [ 'default' ] } ),
						anchorPosition,
						options,
					},
				},
			) );
		},

		isDroppingAllowed() {
			return this.getContainer().isEditable();
		},

		behaviors() {
			const behaviors = BaseElementView.prototype.behaviors.apply( this, arguments );

			_.extend( behaviors, {
				Sortable: {
					behaviorClass: require( 'elementor-behaviors/sortable' ),
					elChildType: 'widget',
				},
			} );

			return elementor.hooks.applyFilters( `elements/${ type }/behaviors`, behaviors, this );
		},

		/**
		 * @return {{}} options
		 */
		getSortableOptions() {
			return {
				preventInit: true,
			};
		},

		getDroppableOptions() {
			const items = '> .elementor-element, > .elementor-empty-view .elementor-first-add';

			return {
				axis: null,
				items,
				groups: [ 'elementor-element' ],
				horizontalThreshold: 0,
				isDroppingAllowed: this.isDroppingAllowed.bind( this ),
				currentElementClass: 'elementor-html5dnd-current-element',
				placeholderClass: 'elementor-sortable-placeholder elementor-widget-placeholder',
				hasDraggingOnChildClass: 'e-dragging-over',
				getDropContainer: () => this.getContainer(),
				onDropping: ( side, event ) => {
					event.stopPropagation();

					// Triggering the drag end manually, since it won't fire above the iframe
					elementor.getPreviewView().onPanelElementDragEnd();

					const draggedView = elementor.channels.editor.request( 'element:dragged' ),
						draggedElement = draggedView?.getContainer().view.el,
						containerElement = event.currentTarget.parentElement,
						elements = Array.from( containerElement?.querySelectorAll( ':scope > .elementor-element' ) || [] );

					let targetIndex = elements.indexOf( event.currentTarget );

					if ( this.isPanelElement( draggedView, draggedElement ) ) {
						if ( this.draggingOnBottomOrRightSide( side ) && ! this.emptyViewIsCurrentlyBeingDraggedOver() ) {
							targetIndex++;
						}

						this.onDrop( event, { at: targetIndex } );

						if ( elementorCommon?.eventsManager?.dispatchEvent ) {
							const selectedElement = elementor.channels.panelElements.request( 'element:selected' );

							if ( selectedElement ) {
								const elType = selectedElement.model?.get( 'elType' ) ?? '';
								const widgetType = selectedElement.model?.get( 'widgetType' ) ?? '';
								const elementName = 'widget' === elType ? widgetType : elType;

								elementorCommon.eventsManager.dispatchEvent( 'add_element', {
									location: 'editor_panel',
									element_name: elementName,
									element_type: elType,
									widget_type: widgetType,
								} );
							}
						}

						return;
					}

					if ( this.isParentElement( draggedView.getContainer().id ) ) {
						return;
					}

					if ( this.emptyViewIsCurrentlyBeingDraggedOver() ) {
						this.moveDroppedItem( draggedView, 0 );
						return;
					}

					this.moveExistingElement( side, draggedView, containerElement, elements, targetIndex, draggedElement );
				},
			};
		},

		moveExistingElement( side, draggedView, containerElement, elements, targetIndex, draggedElement ) {
			const selfIndex = elements.indexOf( draggedElement );

			if ( targetIndex === selfIndex ) {
				return;
			}

			const dropIndex = this.getDropIndex( containerElement, side, targetIndex, selfIndex );

			this.moveDroppedItem( draggedView, dropIndex );
		},

		isPanelElement( draggedView, draggedElement ) {
			return ! draggedView || ! draggedElement;
		},

		isParentElement( draggedId ) {
			let current = this.container;

			while ( current ) {
				if ( current.id === draggedId ) {
					return true;
				}

				current = current.parent;
			}

			return false;
		},

		getDropIndex( container, side, index, selfIndex ) {
			const styles = window.getComputedStyle( container );

			const isFlex = [ 'flex', 'inline-flex' ].includes( styles.display );
			const isFlexReverse = isFlex &&
				[ 'column-reverse', 'row-reverse' ].includes( styles.flexDirection );

			const isRow = isFlex && [ 'row-reverse', 'row' ].includes( styles.flexDirection );

			const isRtl = elementorCommon.config.isRTL;

			const isReverse = isRow ? isFlexReverse !== isRtl : isFlexReverse;

			// The element should be placed BEFORE the current target
			// if is reversed + side is bottom/right OR not is reversed + side is top/left
			if ( ( isReverse === this.draggingOnBottomOrRightSide( side ) ) ) {
				if ( -1 === selfIndex || selfIndex >= index - 1 ) {
					return index;
				}

				return index > 0 ? index - 1 : 0;
			}

			if ( 0 <= selfIndex && selfIndex < index ) {
				return index;
			}

			return index + 1;
		},

		moveDroppedItem( draggedView, dropIndex ) {
			// Reset the dragged element cache.
			elementor.channels.editor.reply( 'element:dragged', null );

			$e.run( 'document/elements/move', {
				container: draggedView.getContainer(),
				target: this.getContainer(),
				options: {
					at: dropIndex,
				},
			} );
		},

		getEditButtons() {
			const elementData = elementor.getElementData( this.model ),
				editTools = {};

			if ( $e.components.get( 'document/elements' ).utils.allowAddingWidgets() ) {
				editTools.add = {
					/* Translators: %s: Element Name. */
					title: sprintf( __( 'Add %s', 'elementor' ), elementData.title ),
					icon: 'plus',
				};

				editTools.edit = {
					/* Translators: %s: Element Name. */
					title: sprintf( __( 'Edit %s', 'elementor' ), elementData.title ),
					icon: 'handle',
				};
			}

			if ( ! this.getContainer().isLocked() ) {
				if ( elementor.getPreferences( 'edit_buttons' ) && $e.components.get( 'document/elements' ).utils.allowAddingWidgets() ) {
					editTools.duplicate = {
						/* Translators: %s: Element Name. */
						title: sprintf( __( 'Duplicate %s', 'elementor' ), elementData.title ),
						icon: 'clone',
					};
				}

				editTools.remove = {
					/* Translators: %s: Element Name. */
					title: sprintf( __( 'Delete %s', 'elementor' ), elementData.title ),
					icon: 'close',
				};
			}

			return editTools;
		},

		draggingOnBottomOrRightSide( side ) {
			return [ 'bottom', 'right' ].includes( side );
		},

		emptyViewIsCurrentlyBeingDraggedOver() {
			return this.$el.find( '> .elementor-empty-view > .elementor-first-add.elementor-html5dnd-current-element' ).length > 0;
		},

		/**
		 * Toggle the `New Section` view when clicking the `add` button in the edit tools.
		 *
		 * @return {void}
		 */
		onAddButtonClick() {
			if ( this.addSectionView && ! this.addSectionView.isDestroyed ) {
				this.addSectionView.fadeToDeath();

				return;
			}

			const addSectionView = new elementor.modules.elements.components.AddSectionView( {
				at: this.model.collection.indexOf( this.model ),
			} );

			addSectionView.render();

			this.$el.before( addSectionView.$el );

			addSectionView.$el.hide();

			// Delaying the slide down for slow-render browsers (such as FF)
			setTimeout( function() {
				addSectionView.$el.slideDown( null, function() {
					// Remove inline style, for preview mode.
					jQuery( this ).css( 'display', '' );
				} );
			} );

			this.addSectionView = addSectionView;
		},

		isOverflowHidden() {
			const elementStyles = window.getComputedStyle( this.el );
			const overflowStyles = [ elementStyles.overflowX, elementStyles.overflowY, elementStyles.overflow ];

			return overflowStyles.includes( 'hidden' ) || overflowStyles.includes( 'auto' );
		},

		updateHandlesPosition() {
			const elementType = this.$el.data( 'element_type' );
			const isElement = getAllElementTypes().includes( elementType );

			if ( ! isElement ) {
				return;
			}

			let shouldPlaceInside = this.isOverflowHidden();

			if ( ! shouldPlaceInside && this.isTopLevelElement() && this.isFirstElementInStructure() ) {
				shouldPlaceInside = true;
			}

			this.$el.toggleClass( 'e-handles-inside', shouldPlaceInside );
		},

		isTopLevelElement() {
			return this.container.parent && 'document' === this.container.parent.id;
		},

		isFirstElementInStructure() {
			if ( ! this.model.collection ) {
				return true;
			}
			return 0 === this.model.collection.indexOf( this.model );
		},

		getInteractionId() {
			const originId = this.model.get( 'originId' );
			const id = this.model.get( 'id' );

			return originId ?? id;
		},
	} );

	return AtomicElementView;
}
