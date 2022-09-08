const ElementorSettingsPage = require( '../../pages/elementor-settings-page' );

let elementorFontDisplayOriginalValue;

module.exports = {
	beforeAll: async ( { page } ) => {
		const settingsPage = new ElementorSettingsPage( page );

		await settingsPage.goto();
		await settingsPage.moveToTab( 'Advanced' );

		elementorFontDisplayOriginalValue = await settingsPage.getSelectedValue( 'elementor_font_display' );

		await settingsPage.setSelectedValue( 'elementor_font_display', 'auto' );
		await settingsPage.save();
	},

	afterAll: async ( { page } ) => {
		const settingsPage = new ElementorSettingsPage( page );

		await settingsPage.goto();
		await settingsPage.moveToTab( 'Advanced' );
		await settingsPage.setSelectedValue( 'elementor_font_display', elementorFontDisplayOriginalValue );
		await settingsPage.save();
	},
};
