var Mentions = require( 'elementor-dynamic-tags/mentions' );

module.exports = Marionette.Behavior.extend( {

	defaults: {
		addButton: 'inline',
		valueController: 'self'
	},

	ui: {
		mentionsArea: '.elementor-control-mentions-area',
		switcherDynamic: '.elementor-control-mentions-add',
		switcherStatic: '.elementor-control-dynamic-switcher-static'
	},

	events: {
		'click @ui.switcherStatic': 'onSwitcherStaticClick'
	},

	initialize: function() {
		this.viewUpdateElementModel = this.view.updateElementModel;

		this.viewGetControlValue = this.view.getControlValue;

		this.viewOnAfterExternalChange = this.view.onAfterExternalChange;

		this.view.updateElementModel = this.updateElementModel.bind( this );

		this.view.getControlValue = this.getControlValue.bind( this );

		this.view.setSettingsModel = this.setSettingsModel.bind( this );

		this.view.onAfterExternalChange = this.onViewAfterExternalChange.bind( this );

		this.view.applySavedValue = _.noop;
	},

	renderTools: function() {
		var addButtonPlace = this.getOption( 'addButton' );

		if ( 'inline' === addButtonPlace ) {
			var $mentionsWrapper = jQuery( '<div>', { 'class': 'elementor-control-mentions-wrapper' } ),
				$mentionsAdd = jQuery( '<div>', { 'class': 'elementor-control-mentions-add' } ).html( jQuery( '<i>', { 'class': 'fa fa-database' } ) );

			this.ui.mentionsArea.wrap( $mentionsWrapper ).after( $mentionsAdd );
		} else {
			var $dynamicSwitcher = jQuery( Marionette.Renderer.render( '#tmpl-elementor-control-dynamic-switcher', {
				cid: this.view.model.cid,
				addButton: this.getOption( 'addButton' )
			} ) );

			this.ui.controlTitle.after( $dynamicSwitcher );
		}

		this.ui.switcherDynamic = this.$el.find( this.ui.switcherDynamic.selector );

		if ( this.ui.switcherDynamic.length ) {
			this.ui.switcherDynamic[0].addEventListener( 'click', this.onSwitcherDynamicClick.bind( this ), true );
		}

		this.ui.switcherStatic = this.$el.find( this.ui.switcherStatic.selector );
	},

	initMentions: function() {
		var value = this.view.getControlValue(),
			dynamicProperty = this.getOption( 'property' );

		if ( dynamicProperty ) {
			value = value[ dynamicProperty ];
		}

		if ( ! this.isTinyMCE() ) {
			value = _.escape( value )
				.replace( /&lt;br[ /]*&gt;/g, '<br>' )
				.replace( /&quot;/g, '"' )
				.replace( /&amp;/g, '&' );
		}

		var mentionsSettings = {
			$element: this.ui.mentionsArea,
			$addButton: this.ui.switcherDynamic,
			groups: this.getOption( 'groups' ),
			freeText: this.getOption( 'freeText' ),
			mixedContent: this.getOption( 'mixedContent' ),
			multiple: this.getOption( 'multiple' ),
			value: value
		};

		if ( this.isTinyMCE() ) {
			mentionsSettings.$iframe = jQuery( this.view.editor.iframeElement );
		}

		if ( this.mentions ) {
			this.mentions.destroy();
		}

		this.mentions = new Mentions( mentionsSettings );

		this.mentions.on( 'mention:create mention:change mention:remove', this.onMentionChange.bind( this ) );

		this.mentions.$element.on( 'keydown', this.onMentionsElementKeyDown.bind( this ) );
	},

	toggleDynamicClass: function() {
		this.$el.toggleClass( 'elementor-control-dynamic', this.isDynamicMode() );
	},

	buildMentions: function() {
		this.renderTools();

		this.initMentions();

		this.toggleDynamicClass();
	},

	isDynamicMode: function() {
		var dynamicSettingName = 'dynamic_' + this.view.model.get( 'name' );

		return !! this.view.elementSettingsModel.get( dynamicSettingName );
	},

	isValueUnderControl: function() {
		return 'mentions' === this.getOption( 'valueController' );
	},

	isTinyMCE: function() {
		return 'wysiwyg' === this.view.model.get( 'type' );
	},

	setDynamicMode: function( dynamic ) {
		var dynamicSettingName = 'dynamic_' + this.view.model.get( 'name' );

		if ( dynamic ) {
			this.view.elementSettingsModel.set( dynamicSettingName, true, { silent: true } );
		} else {
			this.view.elementSettingsModel.unset( dynamicSettingName, { silent: true } );
		}
	},

	getControlValue: function() {
		if ( this.isValueUnderControl() && this.isDynamicMode() ) {
			return this.view.elementSettingsModel.get( this.view.model.get( 'name' ) );
		} else {
			return this.viewGetControlValue.apply( this.view, arguments );
		}
	},

	updateElementModel: function( value ) {
		if ( this.isValueUnderControl() && this.isDynamicMode() ) {
			this.setSettingsModel( value );
		} else {
			this.viewUpdateElementModel.apply( this.view, arguments );
		}
	},

	setSettingsModel: function( value ) {
		var settingName = this.view.model.get( 'name' ),
			isDynamic = false;

		if ( this.mentions.getMentionsCount() ) {
			var parsedValue = _.unescape( this.mentions.getValue() ),
				dynamicProperty = this.getOption( 'property' );

			if ( dynamicProperty ) {
				value[ dynamicProperty ] = parsedValue;
			} else {
				value = parsedValue;
			}

			isDynamic = true;
		} else if ( 'string' === typeof value ) {
			value = _.unescape( value );
		}

		if ( ! this.isValueUnderControl() ) {
			this.setDynamicMode( isDynamic );

			this.toggleDynamicClass();
		}

		this.view.elementSettingsModel.set( settingName, value );

		this.view.triggerMethod( 'settings:change' );
	},

	onRender: function() {
		var self = this;

		if ( self.isTinyMCE() ) {
			setTimeout( function() {
				var editor = tinymce.get( self.view.editorID );

				self.ui.mentionsArea = jQuery( editor.getBody() );

				self.buildMentions();
			}, 100 );

			return;
		}

		self.buildMentions();
	},

	onMentionChange: function() {
		if ( this.isTinyMCE() ) {
			this.view.editor.fire( 'change' );
		} else {
			this.ui.mentionsArea.trigger( 'input' );
		}
	},

	onMentionsElementKeyDown: function( event ) {
		if ( 13 !== event.which || event.shiftKey || event.isDefaultPrevented() ) {
			return;
		}

		event.preventDefault();

		document.execCommand( 'insertHTML', false, '<br>' );
	},

	onSwitcherDynamicClick: function() {
		if ( this.isValueUnderControl() && ! this.isDynamicMode() ) {
			this.setDynamicMode( true );

			this.setSettingsModel( '' );

			this.mentions.$element.empty();

			this.toggleDynamicClass();
		}
	},

	onSwitcherStaticClick: function() {
		this.mentions.$element.empty();

		this.setDynamicMode( false );

		this.setSettingsModel( this.view.model.get( 'default_value' ) );

		this.view.render();
	},

	onViewAfterExternalChange: function() {
		if ( this.isTinyMCE() ) {
			this.mentions.setValue( this.getControlValue() );
		} else {
			this.viewOnAfterExternalChange.apply( this.view, arguments );
		}
	},

	onDestroy: function() {
		this.mentions.destroy();
	}
} );
