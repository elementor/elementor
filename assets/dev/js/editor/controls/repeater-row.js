import ControlsStack from 'elementor-views/controls-stack';

module.exports = Marionette.CompositeView.extend( {
	template: Marionette.TemplateCache.get( '#tmpl-elementor-repeater-row' ),

	className: 'elementor-repeater-fields',

	ui: {
		duplicateButton: '.elementor-repeater-tool-duplicate',
		editButton: '.elementor-repeater-tool-edit',
		removeButton: '.elementor-repeater-tool-remove',
		itemTitle: '.elementor-repeater-row-item-title',
	},

	behaviors: {
		HandleInnerTabs: {
			behaviorClass: require( 'elementor-behaviors/inner-tabs' ),
		},
	},

	triggers: {
		'click @ui.removeButton': 'click:remove',
		'click @ui.duplicateButton': 'click:duplicate',
		'click @ui.itemTitle': 'click:edit',
	},

	modelEvents: {
		change: 'onModelChange',
	},

	templateHelpers: function() {
		return {
			itemIndex: this.getOption( 'itemIndex' ),
			itemActions: this.getOption( 'itemActions' ),
		};
	},

	childViewContainer: '.elementor-repeater-row-controls',

	getChildView: function( item ) {
		var controlType = item.get( 'type' );

		return elementor.getControlView( controlType );
	},

	childViewOptions: function() {
		return {
			container: this.options.container,
		};
	},

	updateIndex: function( newIndex ) {
		this.itemIndex = newIndex;
	},

	setTitle: function() {
		const titleField = this.getOption( 'titleField' );

		let title = '';

		if ( titleField ) {
			title = Marionette.TemplateCache.prototype.compileTemplate( titleField )( this.model.parseDynamicSettings() );
		}

		if ( ! title ) {
			title = elementor.translate( 'Item #%s', [ this.getOption( 'itemIndex' ) ] );
		}

		this.ui.itemTitle.html( title );
	},

	toggleSort( enable ) {
		this.$el.toggleClass( 'elementor-repeater-row--disable-sort', ! enable );
	},

	initialize: function( options ) {
		this.itemIndex = 0;

		// Collection for Controls list
		this.collection = new Backbone.Collection( _.values( elementor.mergeControlsSettings( options.controlFields ) ) );
	},

	onRender: function() {
		this.setTitle();

		ControlsStack.handlePopovers( this );
	},

	onModelChange: function() {
		if ( this.getOption( 'titleField' ) ) {
			this.setTitle();
		}
	},

	onChildviewResponsiveSwitcherClick: function( childView, device ) {
		if ( 'desktop' === device ) {
			elementor.getPanelView().getCurrentPageView().$el.toggleClass( 'elementor-responsive-switchers-open' );
		}
	},
} );
