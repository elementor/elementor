import Widget from './widget';

const AtomicHeadingView = Widget.extend( {
	tagName() {
		const tag = this.model.getSetting( 'tag' );
		return undefined !== tag && '' !== tag ? tag : 'h2';
	},

	className() {
		const atomicClasses = [ 'elementor-widget-v2' ];
		const widgetClasses = ( this.model.getSetting( 'classes' )?.value || [] );

		return atomicClasses.concat( widgetClasses ).join( ' ' );
	},

	renderOnChange( settings ) {
		if ( settings.changed.tag ) {
			// Because the entire element needs to be re-rendered if the HTML tag is to change.
			// Maybe we can re-render only the specific child?
			this.container.parent.render();
		}
	},
} );

module.exports = AtomicHeadingView;
