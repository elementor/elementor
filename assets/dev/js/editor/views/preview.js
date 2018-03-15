var BaseSectionsContainerView = require( 'elementor-views/base-sections-container' ),
	AddSectionView = require( 'elementor-views/add-section/independent' ),
	Preview;

Preview = BaseSectionsContainerView.extend( {
	template: Marionette.TemplateCache.get( '#tmpl-elementor-preview' ),

	className: 'elementor-inner',

	childViewContainer: '.elementor-section-wrap',

	onRender: function() {
		if ( ! elementor.userCan( 'design' ) ) {
			return;
		}
		var addNewSectionView = new AddSectionView();

		addNewSectionView.render();

		this.$el.append( addNewSectionView.$el );
	}
} );

module.exports = Preview;
