var SortableBehavior;

SortableBehavior = Marionette.Behavior.extend( {
	defaults: {
		elChildType: 'widget'
	},

	events: {
		'sortstart': 'onSortStart',
		'sortreceive': 'onSortReceive',
		'sortupdate': 'onSortUpdate',
		'sortover': 'onSortOver',
		'sortout': 'onSortOut'
	},

	initialize: function() {
		this.listenTo( elementor.channels.dataEditMode, 'switch', this.onEditModeSwitched )
			.listenTo( elementor.channels.deviceMode, 'change', this.onDeviceModeChange );
	},

	onEditModeSwitched: function( activeMode ) {
		if ( 'edit' === activeMode ) {
			this.activate();
		} else {
			this.deactivate();
		}
	},

	onDeviceModeChange: function() {
		var deviceMode = elementor.channels.deviceMode.request( 'currentMode' );

		if ( 'desktop' === deviceMode ) {
			this.activate();
		} else {
			this.deactivate();
		}
	},

	onRender: function() {
		var self = this;

		_.defer( function() {
			self.onEditModeSwitched( elementor.channels.dataEditMode.request( 'activeMode' ) );
		} );
	},

	onDestroy: function() {
		this.deactivate();
	},

	activate: function() {
		if ( this.getChildViewContainer().sortable( 'instance' ) ) {
			return;
		}

		var $childViewContainer = this.getChildViewContainer(),
			defaultSortableOptions = {
				connectWith: $childViewContainer.selector,
				placeholder: 'elementor-sortable-placeholder elementor-' + this.getOption( 'elChildType' ) + '-placeholder',
				cursorAt: {
					top: 20,
					left: 25
				},
				helper: this._getSortableHelper.bind( this ),
				cancel: 'input, textarea, button, select, option, .elementor-inline-editing, .elementor-tab-title'

			},
			sortableOptions = _.extend( defaultSortableOptions, this.view.getSortableOptions() );

		$childViewContainer.sortable( sortableOptions );
	},

	_getSortableHelper: function( event, $item ) {
		var model = this.view.collection.get( {
			cid: $item.data( 'model-cid' )
		} );

		return '<div style="height: 84px; width: 125px;" class="elementor-sortable-helper elementor-sortable-helper-' + model.get( 'elType' ) + '"><div class="icon"><i class="' + model.getIcon() + '"></i></div><div class="elementor-element-title-wrapper"><div class="title">' + model.getTitle() + '</div></div></div>';
	},

	getChildViewContainer: function() {
		return this.view.getChildViewContainer( this.view );
	},

	deactivate: function() {
		if ( this.getChildViewContainer().sortable( 'instance' ) ) {
			this.getChildViewContainer().sortable( 'destroy' );
		}
	},

	onSortStart: function( event, ui ) {
		event.stopPropagation();

		var model = this.view.collection.get( {
			cid: ui.item.data( 'model-cid' )
		} );

		if ( 'column' === this.options.elChildType ) {
			var uiData = ui.item.data( 'sortableItem' ),
				uiItems = uiData.items,
				itemHeight = 0;

			uiItems.forEach( function( item ) {
				if ( item.item[0] === ui.item[0] ) {
					itemHeight = item.height;
					return false;
				}
			} );

			ui.placeholder.height( itemHeight );
		}

		elementor.channels.data
			.reply( 'dragging:model', model )
			.reply( 'dragging:parent:view', this.view )
			.trigger( 'drag:start', model )
			.trigger( model.get( 'elType' ) + ':drag:start' );
	},

	onSortOver: function( event ) {
		event.stopPropagation();

		var model = elementor.channels.data.request( 'dragging:model' );

		jQuery( event.target )
			.addClass( 'elementor-draggable-over' )
			.attr( {
				'data-dragged-element': model.get( 'elType' ),
				'data-dragged-is-inner': model.get( 'isInner' )
			} );

		this.$el.addClass( 'elementor-dragging-on-child' );
	},

	onSortOut: function( event ) {
		event.stopPropagation();

		jQuery( event.target )
			.removeClass( 'elementor-draggable-over' )
			.removeAttr( 'data-dragged-element data-dragged-is-inner' );

		this.$el.removeClass( 'elementor-dragging-on-child' );
	},

	onSortReceive: function( event, ui ) {
		event.stopPropagation();

		if ( this.view.isCollectionFilled() ) {
			jQuery( ui.sender ).sortable( 'cancel' );
			return;
		}

		var model = elementor.channels.data.request( 'dragging:model' ),
			draggedElType = model.get( 'elType' ),
			draggedIsInnerSection = 'section' === draggedElType && model.get( 'isInner' ),
			targetIsInnerColumn = 'column' === this.view.getElementType() && this.view.isInner();

		if ( draggedIsInnerSection && targetIsInnerColumn ) {
			jQuery( ui.sender ).sortable( 'cancel' );

			return;
		}

		elementor.channels.data.trigger( 'drag:before:update', model );

		var newIndex = ui.item.parent().children().index( ui.item ),
			modelJSON = model.toJSON( { copyHtmlCache: true } );

		var senderSection = elementor.channels.data.request( 'dragging:parent:view' );

		senderSection.isManualRemoving = true;

		model.destroy();

		senderSection.isManualRemoving = false;

		this.view.addChildElement( modelJSON, { at: newIndex } );

		elementor.channels.data.trigger( 'drag:after:update', model );
	},

	onSortUpdate: function( event, ui ) {
		event.stopPropagation();

		if ( this.getChildViewContainer()[0] === ui.item.parent()[0] ) {
			var model = elementor.channels.data.request( 'dragging:model' ),
				$childElement = ui.item,
				collection = this.view.collection,
				newIndex = $childElement.parent().children().index( $childElement );

			elementor.channels.data.trigger( 'drag:before:update', model );

			var child = this.view.children.findByModelCid( model.cid );

			child._isRendering = true;

			collection.remove( model );

			this.view.addChildElement( model, { at: newIndex } );

			elementor.saver.setFlagEditorChange( true );

			elementor.channels.data.trigger( 'drag:after:update', model );
		}
	},

	onAddChild: function( view ) {
		view.$el.attr( 'data-model-cid', view.model.cid );
	}
} );

module.exports = SortableBehavior;
