import ElementsHelper from 'elementor/tests/qunit/tests/assets/dev/js/editor/document/elements/helper';

export const KitGlobalsUpdateColors = () => {
	QUnit.module( 'KitGlobalsUpdateColors', () => {
		QUnit.test( 'Simple', async ( assert ) => {
			const kitDocument = elementor.documents.getCurrent(),
				container = kitDocument.container;

			// Set custom color.
			ElementsHelper.settings( container, {
				h1_color: '#FF0000',
			} );

			// Create global color.
			const result = await $e.run( 'globals/colors/create', {
					container,
					setting: 'h1_color',
					title: 'red',
				} ),
				repeaterItemContainer = container.repeaters.custom_colors.children.find( ( childContainer ) =>
					childContainer.id === result.data.id
				);

			assert.equal( result.data.title, repeaterItemContainer.settings.get( 'title' ) );
		} );
	} );
};

export default KitGlobalsUpdateColors;
