var BaseAddSectionView = require( 'elementor-views/add-section/base' );

module.exports = BaseAddSectionView.extend( {

	className: function() {
		return BaseAddSectionView.prototype.className.apply( this, arguments ) + ' elementor-add-section-inline';
	},

	fadeToDeath: function() {
		var self = this;

		self.$el.slideUp( function() {
			self.destroy();
		} );
	},

	paste: function() {
		BaseAddSectionView.prototype.paste.apply( this, arguments );

		this.destroy();
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
