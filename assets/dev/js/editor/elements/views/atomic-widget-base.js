const WidgetView = require( 'elementor-elements/views/widget' );

class AtomicWidgetBaseView extends WidgetView {
	tagName() {
		return 'div';
	}

	className() {
		const atomicClasses = [ 'elementor-widget-v2', `elementor-widget-v2-${ this.model.id }` ];
		const widgetClasses = ( this.model.getSetting( 'classes' )?.value || [] );

		return atomicClasses.concat( widgetClasses ).join( ' ' );
	}
}

module.exports = AtomicWidgetBaseView;
