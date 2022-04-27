import ElementsHelper from 'elementor/tests/qunit/tests/assets/dev/js/editor/document/elements/helper';

export const Drop = () => {
	QUnit.module( 'Drop', ( hooks ) => {
		hooks.beforeEach( () => {
			ElementsHelper.empty();
		} );

		QUnit.test( 'Drop to document', ( assert ) => {
			// Act.
			$e.run( 'preview/drop', {
				model: {
					elType: 'widget',
					widgetType: 'heading',
				},
				container: elementor.getPreviewContainer(),
			} );

			// Assert.
			const eWidget = elementor.getPreviewContainer().children.findRecursive(
				( container ) => container.model.get( 'widgetType' )
			);

			assert.equal( eWidget.model.get( 'widgetType' ), 'heading' );
		} );

		QUnit.test( 'Drop to container', ( assert ) => {
			// Arrange.
			const eContainer = ElementsHelper.createContainer();

			// Act.
			$e.run( 'preview/drop', {
				model: {
					elType: 'widget',
					widgetType: 'heading',
				},
				container: eContainer,
			} );

			// Assert.
			const eWidget = elementor.getPreviewContainer().children.findRecursive(
				( container ) => container.model.get( 'widgetType' )
			);

			assert.equal( eWidget.model.get( 'widgetType' ), 'heading' );
		} );
	} );
};

export default Drop;
