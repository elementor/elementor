var RepeaterRowView;

RepeaterRowView = Marionette.CompositeView.extend( {
	template: Marionette.TemplateCache.get( '#tmpl-elementor-repeater-row' ),

	className: 'repeater-fields',

	ui: {
		duplicateButton: '.elementor-repeater-tool-duplicate',
		editButton: '.elementor-repeater-tool-edit',
		removeButton: '.elementor-repeater-tool-remove',
		itemTitle: '.elementor-repeater-row-item-title'
	},

	triggers: {
		'click @ui.removeButton': 'click:remove',
		'click @ui.duplicateButton': 'click:duplicate',
		'click @ui.itemTitle': 'click:edit'
	},

	templateHelpers: function() {
		return {
			itemIndex: this.getOption( 'itemIndex' )
		};
	},

	childViewContainer: '.elementor-repeater-row-controls',

	getChildView: function( item ) {
		var controlType = item.get( 'type' );
		return elementor.getControlItemView( controlType );
	},

	childViewOptions: function() {
		return {
			elementSettingsModel: this.model
		};
	},

	checkConditions: function() {
		var self = this;

		self.collection.each( function( model ) {
			var conditions = model.get( 'conditions' ),
				isVisible = true;

			if ( conditions ) {
				isVisible = elementor.conditions.check( conditions, self.model.attributes );
			}

			var child = self.children.findByModelCid( model.cid );

			child.$el.toggle( isVisible );
		} );
	},

	updateIndex: function( newIndex ) {
		this.itemIndex = newIndex;
		this.setTitle();
	},

	setTitle: function() {
		var self = this,
			titleField = self.getOption( 'titleField' ),
			title = '';

		if ( titleField ) {
			var values = {};

			self.children.each( function( child ) {
				values[ child.model.get( 'name' ) ] = child.getControlValue();
			} );

			title = Marionette.TemplateCache.prototype.compileTemplate( titleField )( values );
		}

		if ( ! title ) {
			title = elementor.translate( 'Item #{0}', [ self.getOption( 'itemIndex' ) ] );
		}

		self.ui.itemTitle.html( title );
	},

	initialize: function( options ) {
		var self = this;

		self.elementSettingsModel = options.elementSettingsModel;

		self.itemIndex = 0;

		// Collection for Controls list
		self.collection = new Backbone.Collection( options.controlFields );

		self.listenTo( self.model, 'change', self.checkConditions );

		if ( options.titleField ) {
			self.listenTo( self.model, 'change', self.setTitle );
		}
	},

	onRender: function() {
		this.setTitle();
		this.checkConditions();
		this.handleInnerTabs( this );
	},

	onChildviewControlTabClicked: function ( childView ) {
	var closedClass = 'elementor-tab-close',
		activeClass = 'elementor-tab-active',
		tabClicked = childView.model.get( 'name' ),
		childrenUnderTab = this.children.filter( function( view ) {
			return ( 'tab' !== view.model.get( 'type' ) && childView.model.get( 'tabs_wrapper' ) === view.model.get( 'tabs_wrapper' ) );
		} ),
		siblingTabs = this.children.filter( function( view ) {
			return ( 'tab' === view.model.get( 'type' ) && childView.model.get( 'tabs_wrapper' ) === view.model.get( 'tabs_wrapper' ) );
		} );

	childView.$el.addClass( activeClass );

	_.each( siblingTabs, function( view ) {
		view.$el.removeClass(activeClass);
	} );

	_.each( childrenUnderTab, function( view ) {
		if ( view.model.get( 'inner_tab' ) === tabClicked ) {
			view.$el.removeClass( closedClass );
		} else {
			view.$el.addClass( closedClass );
		}
	} );

	elementor.channels.data.trigger( 'scrollbar:update' );
},

	handleInnerTabs: function ( parent ) {
	var closedClass = 'elementor-tab-close',
		activeClass = 'elementor-tab-active',
		tabsWrappers = parent.children.filter( function( view ) {
			return ( view.model.get( 'is_tabs_wrapper' ) );
		} );

	_.each( tabsWrappers, function( view ) {
		view.$el.addClass( 'type-tabs' );

		var tabs_id = view.model.get('name'),
			tabs = parent.children.filter( function( childView ) {
				return ( childView.model.get( 'type' ) === 'tab' && childView.model.get( 'tabs_wrapper' ) === tabs_id );
			} );

		_.each( tabs, function( childView, index ) {
			view._addChildView( childView );
			// triggers: {
			// 	'click': 'control:tab:clicked'
			// }

			var tab_id =  childView.model.get( 'name' ),
				controlsUnderTab = parent.children.filter( function( view ) {
					return ( view.model.get( 'inner_tab' ) === tab_id );
				} );

			if ( 0 === index ) {
				childView.$el.addClass( activeClass );
			} else {
				_.each( controlsUnderTab, function( view ) {
					view.$el.addClass( closedClass );
				} );
			}
		} );
	} );
},
} );

module.exports = RepeaterRowView;
