var BaseSectionsContainerView = require( 'elementor-views/base-sections-container' ),
	Preview;

import AddSectionView from './add-section/independent';
import RightClickIntroductionBehavior from '../elements/views/behaviors/right-click-introduction';

Preview = BaseSectionsContainerView.extend( {
	template: Marionette.TemplateCache.get( '#tmpl-elementor-preview' ),

	className: 'elementor-inner',

	childViewContainer: '.elementor-section-wrap',

	behaviors: function() {
		var parentBehaviors = BaseSectionsContainerView.prototype.behaviors.apply( this, arguments ),
			behaviors = {
				contextMenu: {
					behaviorClass: require( 'elementor-behaviors/context-menu' ),
					groups: this.getContextMenuGroups(),
				},
			};

		// TODO: the `2` check is for BC reasons
		if ( ! elementor.config.user.introduction.rightClick && ! elementor.config.user.introduction[ 2 ] ) {
			behaviors.introduction = {
				behaviorClass: RightClickIntroductionBehavior,
			};
		}

		return jQuery.extend( parentBehaviors, behaviors );
	},

	getContainer() {
		return elementor.settings.page.getEditedView().getContainer();
	},

	getContextMenuGroups: function() {
		var hasContent = function() {
			return elementor.elements.length > 0;
		};

		return [
			{
				name: 'paste',
				actions: [
					{
						name: 'paste',
						title: elementor.translate( 'paste' ),
						isEnabled: this.isPasteEnabled.bind( this ),
						callback: ( at ) => $e.run( 'document/elements/paste', {
							container: this.getContainer(),
							at: at,
							rebuild: true,
						} ),
					},
				],
			}, {
				name: 'content',
				actions: [
					{
						name: 'copy_all_content',
						title: elementor.translate( 'copy_all_content' ),
						isEnabled: hasContent,
						callback: () => $e.run( 'document/elements/copy-all' ),
					}, {
						name: 'delete_all_content',
						title: elementor.translate( 'delete_all_content' ),
						isEnabled: hasContent,
						callback: () => $e.run( 'document/elements/empty' ),
},
				],
			},
		];
	},
	isPasteEnabled: function() {
		return elementorCommon.storage.get( 'clipboard' );
	},

	onRender: function() {
		if ( ! elementor.userCan( 'design' ) ) {
			return;
		}
		var addNewSectionView = new AddSectionView();

		addNewSectionView.render();

		this.$el.append( addNewSectionView.$el );
	},
} );

module.exports = Preview;
