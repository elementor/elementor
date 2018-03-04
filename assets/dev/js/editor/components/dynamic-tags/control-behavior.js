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

	setDynamicMode: function( isDynamic, staticValue ) {
		var staticSettingKey = elementor.dynamicTags.getStaticSettingKey( this.view.model.get( 'name' ) );

		if ( isDynamic ) {
			this.view.elementSettingsModel.set( staticSettingKey, staticValue, { silent: true } );
		} else {
			this.view.elementSettingsModel.unset( staticSettingKey, { silent: true } );
		}

		this.toggleDynamicClass();
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

		this.view.setSettingsModel( value );
	},

	applySavedValue: function() {
		if ( ! this.isDynamicMode() ) {
			this.viewApplySavedValue();
		}
	},

	onRender: function() {
		this.$el.addClass( 'elementor-control-dynamic' );

		this.renderTools();

		this.toggleDynamicClass();

		if ( this.isDynamicMode() ) {
			var tagData = elementor.dynamicTags.getTagTextData( this.getDynamicValue() );

			this.setTagView( tagData.id, tagData.name, tagData.settings );
		}
	},

	onDynamicSwitcherClick: function() {
		this.toggleTagsList();
	},

	onTagsListItemClick: function( event ) {
		var $tag = jQuery( event.currentTarget );

		if ( ! this.isDynamicMode() ) {
			this.setDynamicMode( true, this.view.getControlValue() );
		}

		this.setTagView( elementor.helpers.getUniqueID(), $tag.data( 'tagName' ), {} );

		this.setDynamicValue( this.tagViewToTagText() );

		this.toggleTagsList();
	},

	onTagViewModelChange: function() {
		this.setDynamicValue( this.tagViewToTagText() );
	},

	onTagViewRemove: function() {
		var staticValue = this.view.elementSettingsModel.get( elementor.dynamicTags.getStaticSettingKey( this.view.model.get( 'name' ) ) );

		this.setDynamicMode( false );

		this.view.setSettingsModel( staticValue );

		this.view.applySavedValue();
	},

	onDestroy: function() {
		if ( this.tagView ) {
			this.tagView.destroy();
		}
	}
} );
