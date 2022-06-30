const BaseElementView = require( 'elementor-elements/views/base' );

/**
 * @augments BaseElementView
 */
class BaseWidgetView extends BaseElementView {
	initialize( options ) {
		super.initialize( options );

		const editModel = this.getEditModel();

		editModel.on( {
			'before:remote:render': this.onModelBeforeRemoteRender.bind( this ),
			'remote:render': this.onModelRemoteRender.bind( this ),
			'settings:loaded': () => setTimeout( this.render.bind( this ) ),
		} );

		if ( 'remote' === this.getTemplateType() && ! this.getEditModel().getHtmlCache() ) {
			editModel.renderRemoteServer();
		}

		const onRenderMethod = this.onRender;

		this.render = _.throttle( this.render, 300 );

		this.onRender = function() {
			_.defer( onRenderMethod.bind( this ) );
		};
	}

	className() {
		const baseClasses = super.className();

		return baseClasses + ' elementor-widget ' + elementor.getElementData( this.getEditModel() ).html_wrapper_class;
	}

	normalizeAttributes() {
		const editModel = this.getEditModel(),
			skinType = editModel.getSetting( '_skin' ) || 'default';

		this.$el
			.attr( 'data-widget_type', editModel.get( 'widgetType' ) + '.' + skinType )
			.removeClass( 'elementor-widget-empty' )
			.children( '.elementor-widget-empty-icon' )
			.remove();
	}

	getTemplate() {
		const editModel = this.getEditModel();

		if ( 'remote' !== this.getTemplateType() ) {
			return Marionette.TemplateCache.get( '#tmpl-elementor-' + editModel.get( 'widgetType' ) + '-content' );
		}

		return _.template( '' );
	}

	getEditButtons() {
		const elementData = elementor.getElementData( this.model ),
			editTools = {};

		editTools.edit = {
			/* Translators: %s: Element name. */
			title: sprintf( __( 'Edit %s', 'elementor' ), elementData.title ),
			icon: 'edit',
		};

		if ( elementor.getPreferences( 'edit_buttons' ) ) {
			editTools.duplicate = {
				/* Translators: %s: Element name. */
				title: sprintf( __( 'Duplicate %s', 'elementor' ), elementData.title ),
				icon: 'clone',
			};
		}

		return editTools;
	}

	getRepeaterSettingKey( settingKey, repeaterKey, repeaterItemIndex ) {
		return [ repeaterKey, repeaterItemIndex, settingKey ].join( '.' );
	}

	onModelBeforeRemoteRender() {
		this.$el.addClass( 'elementor-loading' );
	}

	onModelRemoteRender() {
		if ( this.isDestroyed ) {
			return;
		}

		this.$el.removeClass( 'elementor-loading' );

		// If container document has been changed during the remote request, don't render.
		if ( this.getContainer().document.id !== elementor.documents.getCurrent().id ) {
			return;
		}

		this.render();
	}

	onBeforeDestroy() {
		// Remove old style from the DOM.
		elementor.$previewContents.find( '#elementor-style-' + this.model.get( 'id' ) ).remove();
	}
}

module.exports = BaseWidgetView;
