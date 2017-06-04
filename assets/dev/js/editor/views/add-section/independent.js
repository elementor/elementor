var BaseAddSectionView = require( 'elementor-views/add-section/base' );

module.exports = BaseAddSectionView.extend( {
	id: 'elementor-add-new-section',

	onCloseButtonClick: function() {
		this.closeSelectPresets();
	}
} );
