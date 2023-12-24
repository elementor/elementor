import ControlsStack from 'elementor-views/controls-stack';

module.exports = Marionette.CompositeView.extend( {
	template: Marionette.TemplateCache.get( '#tmpl-elementor-repeater-row' ),

	className: 'elementor-repeater-fields',

	ui() {
		return {
			duplicateButton: '.elementor-repeater-tool-duplicate',
			editButton: '.elementor-repeater-tool-edit',
			removeButton: '.elementor-repeater-tool-remove',
			itemTitle: '.elementor-repeater-row-item-title',
		};
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

	templateHelpers() {
		return {
			itemIndex: this.getOption( 'itemIndex' ),
			itemActions: this.getOption( 'itemActions' ),
		};
	},

	childViewContainer: '.elementor-repeater-row-controls',

	getChildView( item ) {
		var controlType = item.get( 'type' );

		return elementor.getControlView( controlType );
	},

	getChildControlView( name ) {
		return this.getControlViewByModel( this.getControlModel( name ) );
	},

	getControlViewByModel( model ) {
		return this.children.findByModelCid( model.cid );
	},

	getControlModel( name ) {
		return this.collection.findWhere( { name } );
	},

	childViewOptions() {
		return {
			container: this.options.container,
		};
	},

	updateIndex( newIndex ) {
		this.itemIndex = newIndex;
	},

	setTitle() {
		const titleField = this.getOption( 'titleField' );

		let title = '';

		if ( titleField ) {
			title = Marionette.TemplateCache.prototype.compileTemplate( titleField )( this.model.parseDynamicSettings() );
		}

		if ( ! title ) {
			/* Translators: %s: Item Index (number). */
			title = sprintf( __( 'Item #%s', 'elementor' ), this.getOption( 'itemIndex' ) );
		}

		this.ui.itemTitle.html( title );
	},

	toggleSort( enable ) {
		this.$el.toggleClass( 'elementor-repeater-row--disable-sort', ! enable );
	},

	initialize( options ) {
		this.itemIndex = 0;

		// Collection for Controls list
		this.collection = new Backbone.Collection( _.values( elementor.mergeControlsSettings( options.controlFields ) ) );
	},

	onRender() {
		this.setTitle();

		ControlsStack.handlePopovers( this );
	},

	onModelChange() {
		if ( this.getOption( 'titleField' ) ) {
			this.setTitle();
		}
	},

	onChildviewResponsiveSwitcherClick( childView, device ) {
		if ( 'desktop' === device ) {
			elementor.getPanelView().getCurrentPageView().$el.toggleClass( 'elementor-responsive-switchers-open' );
		}
	},
} );
