import ContainerHelper from 'elementor-editor-utils/container-helper';

/**
 * @typedef {import('elementor/assets/lib/backbone/backbone.marionette')} Marionette
 * @name BaseContainer
 * @augments {Marionette.CompositeView}
 */
module.exports = Marionette.CompositeView.extend( {
	templateHelpers() {
		return {
			view: this,
		};
	},

	getBehavior( name ) {
		return this._behaviors[ Object.keys( this.behaviors() ).indexOf( name ) ];
	},

	initialize() {
		this.collection = this.model.get( 'elements' );
	},

	addChildModel( model, options ) {
		return this.collection.add( model, options, true );
	},

	addElement( data, options ) {
		if ( this.isCollectionFilled() ) {
			return;
		}

		options = jQuery.extend( {
			trigger: false,
			edit: true,
			onBeforeAdd: null,
			onAfterAdd: null,
		}, options );

		const childTypes = this.getChildType();
		let newItem,
			elType;

		if ( data instanceof Backbone.Model ) {
			newItem = data;

			elType = newItem.get( 'elType' );
		} else {
			newItem = {
				id: elementorCommon.helpers.getUniqueId(),
				elType: childTypes[ 0 ],
				settings: {},
				elements: [],
			};

			if ( data ) {
				jQuery.extend( newItem, data );
			}

			elType = newItem.elType;
		}

		if ( -1 === childTypes.indexOf( elType ) ) {
			return this.children.last().addElement( newItem, options );
		}

		if ( options.clone ) {
			newItem = this.cloneItem( newItem );
		}

		if ( options.trigger ) {
			elementor.channels.data.trigger( options.trigger.beforeAdd, newItem );
		}

		if ( options.onBeforeAdd ) {
			options.onBeforeAdd();
		}

		if ( this.filterSettings ) {
			this.filterSettings( newItem );
		}

		var newModel = this.addChildModel( newItem, { at: options.at } ),
			newView = this.children.findByModel( newModel );

		if ( options.onAfterAdd ) {
			options.onAfterAdd( newModel, newView );
		}

		if ( options.trigger ) {
			elementor.channels.data.trigger( options.trigger.afterAdd, newItem );
		}

		if ( options.edit && elementor.documents.getCurrent().history.getActive() ) {
			// Ensure container is created. TODO: Open editor via UI hook after `document/elements/create`.
			newView.getContainer();
			newModel.trigger( 'request:edit', { scrollIntoView: options.scrollIntoView } );
		}

		return newView;
	},

	createElementFromContainer( container, options = {} ) {
		return this.createElementFromModel( container.model, options );
	},

	createElementFromModel( model, options = {} ) {
		if ( model instanceof Backbone.Model ) {
			model = model.toJSON();
		}

		if ( elementor.helpers.maybeDisableWidget( model.widgetType ) ) {
			return;
		}

		model = Object.assign( model, model.custom );

		// Check whether the container cannot contain a section, in which case we should use an inner-section.
		if ( 'section' === model.elType ) {
			model.isInner = true;
		}

		if ( model?.isPreset ?? false ) {
			model.settings = model.preset_settings;
		}

		const { useHistory = true } = options;

		let historyId;

		if ( useHistory ) {
			historyId = $e.internal( 'document/history/start-log', {
				type: this.getHistoryType( options.event ),
				title: elementor.helpers.getModelLabel( model ),
			} );
		}

		let container = this.getContainer();

		if ( options.shouldWrap ) {
			container = this.getWrappingContainer( container, model, options );
		}

		// Create the element in column.
		const widget = $e.run( 'document/elements/create', {
			container,
			model,
			options,
		} );

		if ( useHistory ) {
			$e.internal( 'document/history/end-log', { id: historyId } );
		}

		return widget;
	},

	getWrappingContainer( container, model, settings ) {
		const isAtomic = elementor.helpers.isAtomicWidget( model );
		const options = { at: settings.at, scrollIntoView: settings.scrollIntoView, useHistory: settings?.useHistory ?? true };

		if ( isAtomic ) {
			return ContainerHelper.createContainerFromModel(
				{ elType: ContainerHelper.V4_DEFAULT_CONTAINER_TYPE },
				container,
				{ options },
			);
		}

		return this.getV3Container( container, options );
	},

	getV3Container( container, options ) {
		const isContainerExperimentActive = elementorCommon.config.experimentalFeatures.container;

		container = ContainerHelper.createContainerFromModel(
			{ elType: isContainerExperimentActive ? 'container' : 'section' },
			container,
			{ columns: Number( ! isContainerExperimentActive ), options },
		);

		// Since wrapping an element with container doesn't produce a column, we shouldn't try to access it.
		if ( ! isContainerExperimentActive ) {
			container = container.view.children.findByIndex( 0 )
				.getContainer();
		}

		return container;
	},

	onDrop( event, options ) {
		const input = event.originalEvent.dataTransfer.files;

		if ( input.length ) {
			$e.run( 'editor/browser-import/import', {
				input,
				target: this.getContainer(),
				options: { event, target: { at: options.at } },
			} );

			return;
		}

		const args = {};

		args.model = Object.fromEntries(
			Object.entries( elementor.channels.panelElements.request( 'element:selected' )?.model.attributes )
				// The `custom` property is responsible for storing global-widgets related data.
				.filter( ( [ key ] ) => [ 'elType', 'widgetType', 'custom', 'editor_settings' ].includes( key ) ),
		);

		args.container = this.getContainer();
		args.options = options;

		$e.run( 'preview/drop', args );

		if ( elementorCommon?.eventsManager?.dispatchEvent && args?.model ) {
			const elType = args.model?.elType ?? '';
			const widgetType = args.model?.widgetType ?? '';
			const elementName = 'widget' === elType ? widgetType : elType;

			elementorCommon.eventsManager.dispatchEvent( 'add_element', {
				location: 'editor_panel',
				element_name: elementName,
				element_type: elType,
				widget_type: widgetType,
			} );
		}
	},

	getHistoryType( event ) {
		if ( event ) {
			if ( event.originalEvent ) {
				event = event.originalEvent;
			}

			switch ( event.constructor.name ) {
				case 'DragEvent':
					return 'import';
				case 'ClipboardEvent':
					return 'paste';
			}
		}

		return 'add';
	},

	cloneItem( item ) {
		var self = this;

		if ( item instanceof Backbone.Model ) {
			return item.clone();
		}

		item.id = elementorCommon.helpers.getUniqueId();

		item.settings._element_id = '';

		item.elements.forEach( function( childItem, index ) {
			item.elements[ index ] = self.cloneItem( childItem );
		} );

		return item;
	},

	lookup() {
		let element = this;

		if ( element.isDisconnected() ) {
			element = $e.components.get( 'document' ).utils.findViewById( element.model.id );
		}

		return element;
	},

	isDisconnected() {
		return this.isDestroyed || ! this.el.isConnected;
	},

	isCollectionFilled() {
		return false;
	},
} );

/**
 * Source: https://marionettejs.com/docs/v2.4.5/marionette.collectionview.html#collectionviews-buildchildview
 *
 * Since Elementor created custom container(bridge) between view, model, settings, children, parent and so on,
 * the container requires the parent view for proper work, but in 'marionettejs', the parent view is not available
 * during the `buildChildView` method, but actually exist, Elementor modified the `buildChildView` method to
 * set the parent view as a property `_parent` of the child view.
 * Anyways later, the `_parent` property is set by: 'marionettejs' to same view.
 */

/**
 * @inheritDoc
 */
Marionette.CollectionView.prototype.buildChildView = function( child, ChildViewClass, childViewOptions ) {
	const options = _.extend( { model: child }, childViewOptions ),
		childView = new ChildViewClass( options );

	// `ELEMENTOR EDITING`: Fix `_parent` not available on render.
	childView._parent = this;

	Marionette.MonitorDOMRefresh( childView );

	return childView;
};

/**
 * This function overrides the original Marionette `attachBuffer` function.
 * This modification targets nested widgets that should contain a container within a wrapper.
 * The goal is to load the container inside the wrapper when initially loading in the editor.
 * This function updates the `buffer.childNodes` content by checking if an item should be interlaced.
 * If interlacing is needed, it places the container inside the widget's `child_container_placeholder_selector`.
 */

/**
 * @inheritDoc
 */
Marionette.CompositeView.prototype.attachBuffer = function( compositeView, buffer ) {
	const $container = this.getChildViewContainer( compositeView );

	if ( this.model?.config?.support_improved_repeaters && this.model?.config?.is_interlaced ) {
		const $items = $container.find( this.model?.config?.defaults?.child_container_placeholder_selector );

		_.each( $items, function( item ) {
			item.appendChild( buffer.childNodes[ 0 ] );
			buffer.appendChild( item );
		} );
	}

	$container.append( buffer );
};

