import environment from 'elementor-common/utils/environment';
import { getAllElementTypes } from 'elementor-editor/utils/element-types';
import AtomicElementEmptyView from './container/atomic-element-empty-view';

const BaseElementView = elementor.modules.elements.views.BaseElement;

export default function createAtomicElementBaseView( type ) {
	const resolvedTagCache = new WeakMap();

	const AtomicElementView = BaseElementView.extend( {
		template: Marionette.TemplateCache.get( `#tmpl-elementor-${ type }-content` ),

		emptyView: AtomicElementEmptyView,

		_childrenRenderPromises: [],

		tagName() {
			return resolvedTagCache.get( this.model ) ?? this._resolveTag();
		},

		_resolveTag() {
			const renderContext = this.getResolverRenderContext?.();
			const tagSetting = this.model.getSetting( 'tag' );
			const resolvedTag = this._resolvePropValue( tagSetting, renderContext );
			const tagValue = resolvedTag?.value ?? resolvedTag;

			if ( this._hasLink( renderContext ) ) {
				return 'a';
			}

			return tagValue || this.model.config.default_html_tag || 'div';
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

		className() {
			return `${ BaseElementView.prototype.className.apply( this ) } e-con e-atomic-element ${ this.getClassString() }`;
		},

		// TODO: Copied from `views/column.js`.
		ui() {
			var ui = BaseElementView.prototype.ui.apply( this, arguments );

			ui.percentsTooltip = '> .elementor-element-overlay .elementor-column-percents-tooltip';

			return ui;
		},

		attributes() {
			const attr = BaseElementView.prototype.attributes.apply( this );
			const local = {};
			const cssId = this.model.getSetting( '_cssid' );
			const customAttributes = this.model.getSetting( 'attributes' )?.value ?? [];
			const initialAttributes = this?.model?.config?.initial_attributes ?? {};

			if ( cssId ) {
				local.id = cssId.value;
			}

			local[ 'data-interaction-id' ] = this.model.get( 'id' );

			customAttributes.forEach( ( attribute ) => {
				const key = attribute.value?.key?.value;
				const value = attribute.value?.value?.value;

				if ( key && value ) {
					local[ key ] = value;
				}
			} );

			return {
				...attr,
				...initialAttributes,
				...local,
			};
		},

		// TODO: Copied from `views/column.js`.
		attachElContent() {
			BaseElementView.prototype.attachElContent.apply( this, arguments );

			const $tooltip = jQuery( '<div>', {
				class: 'elementor-column-percents-tooltip',
				'data-side': elementorCommon.config.isRTL ? 'right' : 'left',
			} );

			this.$el.children( '.elementor-element-overlay' ).append( $tooltip );
		},

		// TODO: Copied from `views/column.js`.
		getPercentSize( size ) {
			if ( ! size ) {
				size = this.el.getBoundingClientRect().width;
			}

			return +( size / this.$el.parent().width() * 100 ).toFixed( 3 );
		},

		// TODO: Copied from `views/column.js`.
		getPercentsForDisplay() {
			const width = +this.model.getSetting( 'width' ) || this.getPercentSize();

			return width.toFixed( 1 ) + '%';
		},

		renderOnChange( settings ) {
			const changed = settings.changedAttributes();

			setTimeout( () => {
				this.updateHandlesPosition();
			} );

			if ( ! changed ) {
				return;
			}

			BaseElementView.prototype.renderOnChange.apply( this, settings );

			if ( changed.attributes ) {
				const $elAttrs = this.$el[ 0 ].attributes;
				for ( let i = $elAttrs.length - 1; i >= 0; i-- ) {
					const attrName = $elAttrs[ i ].name;
					if ( attrName !== 'class' ) {
						this.$el.removeAttr( attrName );
					}
				}

				const newAttrs = this.attributes();
				Object.entries( newAttrs ).forEach( ( [ key, value ] ) => {
					if ( key !== 'class' && value !== undefined ) {
						this.$el.attr( key, value );
					}
				} );

				return;
			}

			if ( changed.classes ) {
				// Preserve runtime state classes (e.g., e--selected) that are managed by Alpine
				// and would be lost when replacing the class attribute.
				const preservedClasses = Array.from( this.$el[ 0 ].classList ).filter( ( cls ) => cls.startsWith( 'e--' ) );
				this.$el.attr( 'class', this.className() );
				preservedClasses.forEach( ( cls ) => this.$el[ 0 ].classList.add( cls ) );

				return;
			}

			if ( changed._cssid ) {
				if ( changed._cssid.value ) {
					this.$el.attr( 'id', changed._cssid.value );
				} else {
					this.$el.removeAttr( 'id' );
				}

				return;
			}

			this.$el.addClass( this.getClasses() );

			if ( this.isTagChanged( changed ) ) {
				this.rerenderEntireView();
			}
		},

		isTagChanged( changed ) {
			return ( changed?.tag !== undefined || changed?.link !== undefined ) && this._parent && this.tagName() !== this.el.tagName;
		},

		rerenderEntireView() {
			const parent = this._parent;
			this._parent.removeChildView( this );

			parent.addChild( this.model, AtomicElementView, this._index );
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
			return this.isRendered && this.children?.length > 0;
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
				this._applyResolvedAttributes();
				resolve();
			} );
		},

		_beforeRender() {
			this._isRendering = true;
			this._invalidateTagCache();
			this.triggerMethod( 'before:render', this );
		},

		_invalidateTagCache() {
			resolvedTagCache.delete( this.model );
		},

		_cacheResolvedTag( tag ) {
			resolvedTagCache.set( this.model, tag );
		},

		_afterRender() {
			this._isRendering = false;
			this.isRendered = true;
			this.triggerMethod( 'render', this );
			this._applyResolvedAttributes();
		},

		_applyResolvedAttributes() {
			if ( ! this._parent ) {
				return;
			}

			if ( this._shouldRecreateForTagChange() ) {
				return;
			}

			this._applyLinkAttributes();
		},

		_shouldRecreateForTagChange() {
			const resolvedTag = this.tagName();
			const currentTag = this.el.tagName.toLowerCase();

			if ( resolvedTag === currentTag ) {
				return false;
			}

			this._cacheResolvedTag( resolvedTag );
			this.rerenderEntireView();
			return true;
		},

		_applyLinkAttributes() {
			this.$el.removeAttr( 'href' );
			this.$el.removeAttr( 'data-action-link' );

			const link = this.getLink();

			if ( link ) {
				this.$el.attr( link.attr, link.value );
			}
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

		_hasLink( renderContext ) {
			const linkSetting = this.model.getSetting( 'link' );
			const resolvedLink = this._resolvePropValue( linkSetting, renderContext );

			if ( 'link' !== resolvedLink?.$$type ) {
				return false;
			}

			const destination = this._resolvePropValue( resolvedLink.value?.destination, renderContext );

			return !! destination?.value;
		},

		getLink() {
			const renderContext = this.getResolverRenderContext?.();
			const linkSetting = this.model.getSetting( 'link' );
			const resolvedLink = this._resolvePropValue( linkSetting, renderContext );

			if ( 'link' !== resolvedLink?.$$type ) {
				return null;
			}

			const destination = this._resolvePropValue( resolvedLink.value?.destination, renderContext );

			if ( ! destination?.value ) {
				return null;
			}

			const { $$type, value } = destination;

			if ( 'dynamic' === $$type ) {
				const resolvedValue = this.handleDynamicLink( value );

				if ( ! resolvedValue ) {
					return null;
				}

				return {
					attr: 'action' === value.settings?.group ? 'data-action-link' : 'href',
					value: resolvedValue,
				};
			}

			const isPostId = 'number' === $$type;
			const hrefPrefix = isPostId ? elementor.config.home_url + '/?p=' : '';

			return {
				attr: 'href',
				value: hrefPrefix + value,
			};
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
				const isProActive = window.elementorV2?.editorComponents?.isProActive?.() ?? true;

				const controlSign = environment.mac ? '&#8984;' : '^';
				const shortcutLabel = controlSign + '+⇧+K';
				const proBadge = `<a href="https://go.elementor.com/go-pro-components-create/" target="_blank" onclick="event.stopPropagation()" class="elementor-context-menu-list__item__shortcut__new-badge">${ __( 'PRO', 'elementor' ) }</a>`;

				saveActions.unshift( {
					name: 'save-component',
					title: __( 'Create component', 'elementor' ),
					shortcut: isProActive ? shortcutLabel : proBadge,
					hasShortcutAction: ! isProActive,
					callback: this.saveAsComponent.bind( this ),
					isEnabled: () => isProActive && ! this.getContainer().isLocked(),
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
			const isProActive = window.elementorV2?.editorComponents?.isProActive?.() ?? true;

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

		getClasses() {
			const transformer = window?.elementorV2?.editorCanvas?.settingsTransformersRegistry?.get?.( 'classes' );

			if ( ! transformer ) {
				return [];
			}

			return transformer( this.options?.model?.getSetting( 'classes' )?.value || [] );
		},

		getClassString() {
			const classes = this.getClasses();
			const base = this.getBaseClass();

			return [ base, ...classes ].join( ' ' );
		},

		getBaseClass() {
			const baseStyles = elementor.helpers.getAtomicWidgetBaseStyles( this.options?.model );

			return Object.keys( baseStyles ?? {} )[ 0 ] ?? '';
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

		getDynamicLinkValue( name, settings ) {
			const simpleTransform = ( props ) => {
				const transformed = Object.entries( props ).map( ( [ settingKey, settingValue ] ) => {
					const value = 'object' === typeof settingValue && 'value' in settingValue ? settingValue.value : settingValue;

					return [ settingKey, value ];
				} );

				return Object.fromEntries( transformed );
			};

			const getTagValue = () => {
				const tag = elementor.dynamicTags.createTag( 'v4-dynamic-tag', name, simpleTransform( settings ) );

				if ( ! tag ) {
					return null;
				}

				return elementor.dynamicTags.loadTagDataFromCache( tag ) ?? null;
			};

			const tagValue = getTagValue();

			if ( tagValue !== null ) {
				return tagValue;
			}

			return new Promise( ( resolve ) => {
				elementor.dynamicTags.refreshCacheFromServer( () => {
					resolve( getTagValue() );
				} );
			} );
		},

		handleDynamicLink( linkValue ) {
			const result = this.getDynamicLinkValue( linkValue.name, linkValue.settings );

			if ( ! result ) {
				return null;
			}

			if ( 'string' === typeof result ) {
				return result;
			}

			result.then( ( href ) => {
				this.el.removeAttribute( 'href' );

				const attribute = 'action' === linkValue.group ? 'data-action-link' : 'href';

				this.el.setAttribute( attribute, href );
			} ).then( () => this.dispatchPreviewEvent( 'elementor/element/render' ) );

			return null;
		},

		_resolvePropValue( prop, renderContext ) {
			if ( ! prop || typeof prop !== 'object' ) {
				return prop;
			}

			if ( 'overridable' !== prop.$$type ) {
				return prop;
			}

			const registry = window?.elementorV2?.editorCanvas?.settingsTransformersRegistry;
			const transformer = registry?.get?.( 'overridable' );

			if ( ! transformer ) {
				return prop.value?.origin_value;
			}

			const transformed = transformer( prop.value, { key: 'overridable', renderContext } );

			return this._resolvePropValue( transformed, renderContext );
		},
	} );

	return AtomicElementView;
}
