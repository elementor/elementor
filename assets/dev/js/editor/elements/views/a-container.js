import AEmptyView from 'elementor-elements/views/container/a-empty-view';

const BaseElementView = require( 'elementor-elements/views/base' );
const AContainerView = BaseElementView.extend( {
	template: Marionette.TemplateCache.get( '#tmpl-elementor-a-container-content' ),

	emptyView: AEmptyView,

	getChildViewContainer() {
		this.childViewContainer = '';

		return Marionette.CompositeView.prototype.getChildViewContainer.apply( this, arguments );
	},

	className() {
		return `${ BaseElementView.prototype.className.apply( this ) } e-con a-con`;
	},

	// TODO: Copied from `views/column.js`.
	ui() {
		var ui = BaseElementView.prototype.ui.apply( this, arguments );

		ui.percentsTooltip = '> .elementor-element-overlay .elementor-column-percents-tooltip';

		return ui;
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

	onResizeStart() {
		if ( this.ui.percentsTooltip ) {
			this.ui.percentsTooltip.show();
		}
	},

	onResize() {
		// TODO: Copied from `views/column.js`.
		if ( this.ui.percentsTooltip ) {
			this.ui.percentsTooltip.text( this.getPercentsForDisplay() );
		}
	},

	onResizeStop() {
		if ( this.ui.percentsTooltip ) {
			this.ui.percentsTooltip.hide();
		}
	},
} );

module.exports = AContainerView;
