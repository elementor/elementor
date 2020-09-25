import ElementsHelper from 'elementor-tests-qunit/core/editor/document/elements/helper';

export const KitGlobalsUpdateTypography = () => {
	QUnit.module( 'KitGlobalsUpdateTypography', () => {
		QUnit.test( 'Simple', async ( assert ) => {
			const kitDocument = elementor.documents.getCurrent(),
				container = kitDocument.container;

			// Set custom typography.
			ElementsHelper.settings( container, {
				h1_typography_font_family: 'Arial',
			} );

			// Create global typography.
			const result = await $e.run( 'globals/typography/create', {
					container,
					setting: 'h1_typography_typography',
					title: 'Arial',
				} ),
				repeaterItemContainer = container.repeaters.custom_typography.children.find( ( childContainer ) =>
					childContainer.id === result.data.id
				);

			assert.equal( result.data.title, repeaterItemContainer.settings.get( 'title' ) );
			assert.equal( result.data.value.typography_font_family, repeaterItemContainer.settings.get( 'typography_font_family' ) );
		} );
	} );
};

export default KitGlobalsUpdateTypography;
