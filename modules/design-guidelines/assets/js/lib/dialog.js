(function($, global) {
	'use strict';

	DialogsManager.addWidgetType('styleguide-preview', DialogsManager.getWidgetType('lightbox').extend('alert', {
		buildWidget: function() {

			DialogsManager.getWidgetType('lightbox').prototype.buildWidget.apply(this, arguments);

			var $widgetContent = this.addElement('widgetContent'),
				elements = this.getElements();

			$widgetContent.append(elements.message);

			elements.widget.html($widgetContent);
		},
	}));

})(
	typeof jQuery !== 'undefined' ? jQuery : typeof require === 'function' && require('jquery'),
	(typeof module !== 'undefined' && typeof module.exports !== 'undefined') ? module.exports : window
);
