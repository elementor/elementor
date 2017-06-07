var BaseAddSectionView = require( 'elementor-views/add-section/base' );

module.exports = BaseAddSectionView.extend( {
	options: {
		atIndex: null
	},

	className: function() {
		return BaseAddSectionView.prototype.className.apply( this, arguments ) + ' elementor-add-section-inline';
	},

	addSection: function( properties, options ) {
		options = options || {};

		options.at = this.getOption( 'atIndex' );

		return BaseAddSectionView.prototype.addSection.call( this, properties, options );
	},

	getTemplatesModalOptions: function() {
		return _.extend( BaseAddSectionView.prototype.getTemplatesModalOptions.apply( this, arguments ), {
			importOptions: {
				at: this.getOption( 'atIndex' )
			}
		} );
	},

	fadeToDeath: function() {
		var self = this;

		self.$el.slideUp( function() {
			self.destroy();
		} );
	},

	onCloseButtonClick: function() {
		this.fadeToDeath();
	},

	onPresetSelected: function() {
		BaseAddSectionView.prototype.onPresetSelected.apply( this, arguments );

		this.destroy();
	},

	onAddTemplateButtonClick: function() {
		BaseAddSectionView.prototype.onAddTemplateButtonClick.apply( this, arguments );

		this.destroy();
	},

	onDropping: function() {
		BaseAddSectionView.prototype.onDropping.apply( this, arguments );

		this.destroy();
	}
} );
