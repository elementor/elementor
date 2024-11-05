const BaseElementView = require( 'elementor-elements/views/base' );

const AtomicWidgetBaseView = require( 'elementor-elements/views/atomic-widget-base' );

class AtomicHeadingView extends AtomicWidgetBaseView {
	tagName() {
		const tag = this.model.getSetting( 'tag' );
		return undefined !== tag && '' !== tag ? tag : 'h2';
	}

	renderOnChange( settings ) {
		BaseElementView.prototype.renderOnChange.apply( this, arguments );
		if ( settings.changed.tag ) {
			// Because the entire element needs to be re-rendered if the HTML tag is to change.
			// Maybe we can re-render only the specific child?
			this.container.parent.render();
		}
	}
}

module.exports = AtomicHeadingView;
