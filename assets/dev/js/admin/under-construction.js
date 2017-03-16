var ViewModule = require( 'elementor-utils/view-module' ),
	UnderConstructionModule;

UnderConstructionModule = ViewModule.extend( {
	getDefaultSettings: function() {
		return {
			selectors: {
				modeSelect: '.elementor_under_construction_mode select',
				underConstructionTable: 'table',
				excludeModeSelect: '.elementor_under_construction_exclude_mode select',
				excludeRolesArea: '.elementor_under_construction_exclude_roles',
				templateSelect: '.elementor_under_construction_template_id select',
				editTemplateButton: '.elementor-edit-template'
			},
			classes: {
				isEnabled: 'elementor-under-construction-is-enabled'
			}
		};
	},

	getDefaultElements: function() {
		var elements = {},
			selectors = this.getSettings( 'selectors' );

		elements.$modeSelect = jQuery( selectors.modeSelect );

		elements.$underConstructionTable = elements.$modeSelect.parents( selectors.underConstructionTable );

		elements.$excludeModeSelect = elements.$underConstructionTable.find( selectors.excludeModeSelect );

		elements.$excludeRolesArea = elements.$underConstructionTable.find( selectors.excludeRolesArea );

		elements.$templateSelect = elements.$underConstructionTable.find( selectors.templateSelect );

		elements.$editTemplateButton = elements.$underConstructionTable.find( selectors.editTemplateButton );

		return elements;
	},

	bindEvents: function() {
		var settings = this.getSettings(),
			elements = this.elements;

		elements.$modeSelect.on( 'change', function() {
			elements.$underConstructionTable.toggleClass( settings.classes.isEnabled, !! elements.$modeSelect.val() );
		} ).trigger( 'change' );

		elements.$excludeModeSelect.on( 'change', function() {
			elements.$excludeRolesArea.toggle( 'custom' === elements.$excludeModeSelect.val() );
		} ).trigger( 'change' );

		elements.$templateSelect.on( 'change', function() {
			var templateID = elements.$templateSelect.val();

			if ( ! templateID ) {
				elements.$editTemplateButton.hide();
				return;
			}

			var editUrl = ElementorAdminConfig.home_url + '?p=' + templateID + '&elementor';

			elements.$editTemplateButton
				.prop( 'href', editUrl )
				.show();
		} ).trigger( 'change' );
	}
} );

module.exports = UnderConstructionModule;
