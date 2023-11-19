export default class Module extends elementorModules.editor.utils.Module {
	onElementorInit() {
		if ( ! elementor.config?.promotionWidgets || ! elementor.config.promotionWidgets.length ) {
			return;
		}

		elementor.hooks.addFilter( 'element/view', function( DefaultView, model ) {
			const widgetType = model.get( 'widgetType' );
			const isProWidget = elementor.config.promotionWidgets.find( ( item ) => widgetType === item.name );

			if ( isProWidget ) {
				return require( './widget/view' ).default;
			}

			return DefaultView;
		} );
	}
}
