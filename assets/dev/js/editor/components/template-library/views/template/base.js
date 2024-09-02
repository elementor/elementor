var TemplateLibraryInsertTemplateBehavior = require( 'elementor-templates/behaviors/insert-template' ),
	TemplateLibraryTemplateView;
const { isTierAtLeast, TIERS } = require( 'elementor-utils/tiers' );

TemplateLibraryTemplateView = Marionette.ItemView.extend( {
	className() {
		var classes = 'elementor-template-library-template',
			source = this.model.get( 'source' );

		classes += ' elementor-template-library-template-' + source;

		if ( 'remote' === source ) {
			classes += ' elementor-template-library-template-' + this.model.get( 'type' );
		}

		if ( elementor.config.library_connect.base_access_tier !== this.model.get( 'accessTier' ) ) {
			classes += ' elementor-template-library-pro-template';
		}

		return elementor.hooks.applyFilters( 'elementor/editor/template-library/template/classes', classes, this );
	},

	attributes() {
		const userAccessTier = elementor.config.library_connect.current_access_tier;
		const templateAccessTier = this.model.get( 'accessTier' );
		const canDownloadTemplate = isTierAtLeast( userAccessTier, templateAccessTier );

		// User with access to the template shouldn't see the badge.
		if ( canDownloadTemplate ) {
			return {};
		}

		const subscriptionPlans = elementor.config.library_connect.subscription_plans;
		let subscriptionPlan = subscriptionPlans[ templateAccessTier ];

		// Free user should see a generic "Pro" badge.
		if ( userAccessTier === TIERS.free ) {
			subscriptionPlan = subscriptionPlans.essential;
		}

		if ( ! subscriptionPlan ) {
			return {};
		}

		return {
			style: `--elementor-template-library-subscription-plan-label: "${ subscriptionPlan.label }";--elementor-template-library-subscription-plan-color: ${ subscriptionPlan.color };`,
		};
	},

	ui() {
		return {
			previewButton: '.elementor-template-library-template-preview',
		};
	},

	events() {
		return {
			'click @ui.previewButton': 'onPreviewButtonClick',
		};
	},

	behaviors() {
		const behaviors = {
			insertTemplate: {
				behaviorClass: TemplateLibraryInsertTemplateBehavior,
			},
		};

		return elementor.hooks.applyFilters( 'elementor/editor/template-library/template/behaviors', behaviors, this );
	},
} );

module.exports = TemplateLibraryTemplateView;
