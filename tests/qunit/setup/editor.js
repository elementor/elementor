// eslint-disable-next-line no-unused-vars
/* global jQuery, wp */

wp.heartbeat = {
	connectNow: () => {},
};

const originalGet = Marionette.TemplateCache.get;

Marionette.TemplateCache.get = function( template ) {
	if ( jQuery( template ).length ) {
		return originalGet.apply( Marionette.TemplateCache, [ template ] );
	}

	return () => `<div class="${ template.replace( '#tmpl-', '' ) }"><code>${ template }</code></div>`;
};

Marionette.Region.prototype._ensureElement = () => {
	return true;
};

Marionette.Region.prototype.attachHtml = () => {
};

Marionette.CompositeView.prototype.getChildViewContainer = ( containerView ) => {
	const $currentEl = jQuery( containerView.el );

	if ( ! containerView._parent?.$el ) {
		containerView.$el.append( $currentEl );
		containerView.$childViewContainer = $currentEl.children();
	} else {
		containerView._parent.$el.append( $currentEl );
		containerView.$childViewContainer = $currentEl.children();
	}

	return containerView.$childViewContainer;
};
