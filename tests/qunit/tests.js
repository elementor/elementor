import elementor from './js/editor.js';
import section from './mock/elments/section.json';
import column from './mock/elments/column.json';
import button from './mock/elments/button.json';
import heading from './mock/elments/heading.json';
import tabs from './mock/elments/tabs.json';
import form from './mock/elments/form.json';
import postDate from './mock/dynamic-tags/post-date';
import postCustomField from './mock/dynamic-tags/post-custom-field';

elementor.start();

elementor.config.elements = {
	section,
	column,
};

elementor.config.widgets = {
	button,
	heading,
	tabs,
	form,
};

elementor.config.dynamicTags.tags = {
	'post-date': postDate,
	'post-custom-field': postCustomField,
};

elementor.config.wp_editor = '<div id="wp-elementorwpeditor-wrap" class="wp-core-ui wp-editor-wrap tmce-active"><div id="wp-elementorwpeditor-editor-tools" class="wp-editor-tools hide-if-no-js"><div id="wp-elementorwpeditor-media-buttons" class="wp-media-buttons"><button type="button" id="insert-media-button" class="button insert-media add_media" data-editor="elementorwpeditor"><span class="wp-media-buttons-icon"></span> Add Media</button></div>\n' +
	'<div class="wp-editor-tabs"><button type="button" id="elementorwpeditor-tmce" class="wp-switch-editor switch-tmce" data-wp-editor-id="elementorwpeditor">Visual</button>\n' +
	'<button type="button" id="elementorwpeditor-html" class="wp-switch-editor switch-html" data-wp-editor-id="elementorwpeditor">Text</button>\n' +
	'</div>\n' +
	'</div>\n' +
	'<div id="wp-elementorwpeditor-editor-container" class="wp-editor-container"><div id="qt_elementorwpeditor_toolbar" class="quicktags-toolbar"></div><textarea class="elementor-wp-editor wp-editor-area" style="height: 250px" autocomplete="off" cols="40" name="elementorwpeditor" id="elementorwpeditor">%%EDITORCONTENT%%</textarea></div>\n' +
	'</div>\n';

require( './core/common/components.spec' );

require( './core/editor/container/container.spec' );

require( './core/editor/document/commands/base/base.spec' );
require( './core/editor/document/commands/base/history.spec' );

require( './core/editor/document/dynamic/commands/base/disable-enable.spec' );

require( './core/editor/document/component.spec' );

require( './core/editor/document/elements/component.spec' );
require( './core/editor/document/repeater/component.spec' );
require( './core/editor/document/dynamic/component.spec' );
require( './core/editor/document/history/component.spec' );
require( './core/editor/document/shortcuts/component.spec' );
