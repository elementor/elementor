var TagPanelView = require( 'elementor-dynamic-tags/tag-panel-view' );

module.exports = Marionette.Behavior.extend( {

	tagView: null,

	viewApplySavedValue: null,

	ui: {
		tagArea: '.elementor-control-tag-area',
		dynamicSwitcher: '.elementor-control-dynamic-switcher'
	},

	events: {
		'click @ui.dynamicSwitcher': 'onDynamicSwitcherClick'
	},

	initialize: function() {
		this.viewApplySavedValue = this.view.applySavedValue.bind( this.view );

		this.view.applySavedValue = this.applySavedValue.bind( this );
	},

	renderTools: function() {
		var $dynamicSwitcher = jQuery( Marionette.Renderer.render( '#tmpl-elementor-control-dynamic-switcher' ) );

		this.ui.controlTitle[ this.view.model.get( 'label_block' ) ? 'after' : 'before' ]( $dynamicSwitcher );

		this.ui.dynamicSwitcher = this.$el.find( this.ui.dynamicSwitcher.selector );
	},

	toggleDynamicClass: function() {
		this.$el.toggleClass( 'elementor-control-dynamic-value', this.isDynamicMode() );
	},

	isDynamicMode: function() {
		var dynamicSettingName = elementor.dynamicTags.getStaticSettingKey( this.view.model.get( 'name' ) );

		return undefined !== this.view.elementSettingsModel.get( dynamicSettingName );
	},

	createTagsList: function() {
		var tags = _.groupBy( this.getOption( 'tags' ), 'group' ),
			groups = elementor.dynamicTags.getConfig( 'groups' ),
			$tagsList = this.ui.tagsList = jQuery( '<div>', { 'class': 'elementor-tags-list' } );

		jQuery.each( groups, function( groupName ) {
			var groupTags = tags[ groupName ];

			if ( ! groupTags ) {
				return;
			}

			var group = this,
				$groupTitle = jQuery( '<div>', { 'class': 'elementor-tags-list__group-title' } ).text( group.title );

			$tagsList.append( $groupTitle );

			groupTags.forEach( function( tag ) {
				var $tag = jQuery( '<div>', { 'class': 'elementor-tags-list__item' } );

				$tag.text( tag.title ).attr( 'data-tag-name', tag.name );

				$tagsList.append( $tag );
			} );
		} );

		$tagsList.on( 'click', '.elementor-tags-list__item', this.onTagsListItemClick.bind( this ) );

		elementor.$body.append( $tagsList );
	},

	getTagsList: function() {
		if ( ! this.ui.tagsList ) {
			this.createTagsList();
		}

		return this.ui.tagsList;
	},

	toggleTagsList: function() {
		var $tagsList = this.getTagsList();

		if ( $tagsList.is( ':visible' ) ) {
			$tagsList.hide();

			return;
		}

		$tagsList.show().position( {
			my: 'right top',
			at: 'right bottom+5',
			of: this.ui.dynamicSwitcher
		} );
	},

	setTagView: function( id, name, settings ) {
		if ( this.tagView ) {
			this.tagView.destroy();
		}

		var tagView = this.tagView = new TagPanelView( {
			id: id,
			name: name,
			settings: settings
		} );

		tagView.render();

		this.ui.tagArea.after( tagView.el );

		this.listenTo( tagView.model, 'change', this.onTagViewModelChange.bind( this ) )
			.listenTo( tagView, 'remove', this.onTagViewRemove.bind( this ) );
	},

	setDefaultTagView: function() {
		var tagData = elementor.dynamicTags.getTagTextData( this.getDynamicValue() );

		this.setTagView( tagData.id, tagData.name, tagData.settings );
	},

	tagViewToTagText: function() {
		var tagView = this.tagView;

		return elementor.dynamicTags.tagDataToTagText( tagView.getOption( 'id' ), tagView.getOption( 'name' ), tagView.model );
	},

	getDynamicValue: function() {
		var value = this.view.elementSettingsModel.get( this.view.model.get( 'name' ) ),
			dynamicProperty = this.getOption( 'property' );

		if ( dynamicProperty ) {
			value = value[ dynamicProperty ];
		}

		return value;
	},

	setDynamicValue: function( value ) {
		var dynamicProperty = this.getOption( 'property' );

		if ( dynamicProperty ) {
			var values = this.view.getControlValue();

			values[ dynamicProperty ] = value;

			value = values;
		}

		var valuesToChange = {},
			settingsKey = this.view.model.get( 'name' );

		valuesToChange[ settingsKey ] = value;

		if ( ! this.isDynamicMode() ) {
			var staticSettingKey = elementor.dynamicTags.getStaticSettingKey( settingsKey );

			valuesToChange[ staticSettingKey ] = this.view.getControlValue();
		}

		this.view.elementSettingsModel.set( valuesToChange );

		this.toggleDynamicClass();
	},

	applySavedValue: function() {
		if ( ! this.isDynamicMode() ) {
			this.viewApplySavedValue();
		}
	},

	destroyTagView: function() {
		if ( this.tagView ) {
			this.tagView.destroy();

			this.tagView = null;
		}
	},

	onRender: function() {
		this.$el.addClass( 'elementor-control-dynamic' );

		this.renderTools();

		this.toggleDynamicClass();

		if ( this.isDynamicMode() ) {
			this.setDefaultTagView();
		}
	},

	onDynamicSwitcherClick: function() {
		this.toggleTagsList();
	},

	onTagsListItemClick: function( event ) {
		var $tag = jQuery( event.currentTarget );

		this.setTagView( elementor.helpers.getUniqueID(), $tag.data( 'tagName' ), {} );

		this.setDynamicValue( this.tagViewToTagText() );

		this.toggleTagsList();

		if ( this.tagView.getTagConfig().settings_required ) {
			this.tagView.showSettingsPopup();
		}
	},

	onTagViewModelChange: function() {
		this.setDynamicValue( this.tagViewToTagText() );
	},

	onTagViewRemove: function() {
		var settingKey = this.view.model.get( 'name' ),
			staticKey = elementor.dynamicTags.getStaticSettingKey( settingKey ),
			valuesToChange = {};

		valuesToChange[ settingKey ] = this.view.elementSettingsModel.get( staticKey );

		valuesToChange[ staticKey ] = undefined;

		this.view.elementSettingsModel.set( valuesToChange );

		this.toggleDynamicClass();

		this.view.applySavedValue();
	},

	onAfterExternalChange: function() {
		this.destroyTagView();

		if ( this.isDynamicMode() ) {
			this.setDefaultTagView();
		}

		this.toggleDynamicClass();
	},

	onDestroy: function() {
		this.destroyTagView();
	}
} );
