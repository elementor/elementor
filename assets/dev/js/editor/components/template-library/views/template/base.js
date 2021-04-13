var TemplateLibraryInsertTemplateBehavior = require( 'elementor-templates/behaviors/insert-template' ),
	TemplateLibraryTemplateView;

TemplateLibraryTemplateView = Marionette.ItemView.extend( {
	className: function() {
		var classes = 'elementor-template-library-template',
			source = this.model.get( 'source' );

		classes += ' elementor-template-library-template-' + source;

		if ( 'remote' === source ) {
			classes += ' elementor-template-library-template-' + this.model.get( 'type' );
		}

		if ( elementor.config.library_connect.base_access_level !== this.model.get( 'accessLevel' ) ) {
			classes += ' elementor-template-library-pro-template';
		}

		return classes;
	},

	attributes: function() {
		const subscriptionPlan = elementor.config.library_connect.subscription_plans[ this.model.get( 'accessLevel' ) ];

		if ( ! subscriptionPlan ) {
			return {};
		}

		return {
			style: `--elementor-template-library-subscription-plan-label: "${ subscriptionPlan.label }";--elementor-template-library-subscription-plan-color: ${ subscriptionPlan.color };`,
		};
	},

	ui: function() {
		return {
			previewButton: '.elementor-template-library-template-preview',
		};
	},

	events: function() {
		return {
			'click @ui.previewButton': 'onPreviewButtonClick',
		};
	},

	behaviors: {
		insertTemplate: {
			behaviorClass: TemplateLibraryInsertTemplateBehavior,
		},
	},
} );

module.exports = TemplateLibraryTemplateView;
