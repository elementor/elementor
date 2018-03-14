var TagPanelView = require( 'elementor-dynamic-tags/tag-panel-view' );

module.exports = Marionette.Behavior.extend( {

	tagView: null,

	listenerAttached: false,

	ui: {
		tagArea: '.elementor-control-tag-area',
		dynamicSwitcher: '.elementor-control-dynamic-switcher'
	},

	events: {
		'click @ui.dynamicSwitcher': 'onDynamicSwitcherClick'
	},

	initialize: function() {
		if ( ! this.listenerAttached ) {
			this.listenTo( this.view.options.elementSettingsModel, 'change:external:__dynamic__', this.onAfterExternalChange );
			this.listenerAttached = true;
		}
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
		var dynamicSettings = this.view.elementSettingsModel.get( '__dynamic__' );
		return ! ! ( dynamicSettings && dynamicSettings[ this.view.model.get( 'name' ) ] );
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
		return this.view.elementSettingsModel.get( '__dynamic__' )[ this.view.model.get( 'name' ) ];
	},

	getDynamicControlSettings: function( settingKey ) {
		return {
			control: {
				name: '__dynamic__',
				label: this.view.elementSettingsModel.controls[ settingKey ].label
			}
		};
	},

	setDynamicValue: function( value ) {
		var settingKey = this.view.model.get( 'name' ),
			dynamicSettings = this.view.elementSettingsModel.get( '__dynamic__' ) || {};

		dynamicSettings = elementor.helpers.cloneObject( dynamicSettings );

		dynamicSettings[ settingKey ] = value;

		this.view.elementSettingsModel.set( '__dynamic__', dynamicSettings, this.getDynamicControlSettings( settingKey ) );

		this.toggleDynamicClass();
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
			dynamicSettings = this.view.elementSettingsModel.get( '__dynamic__' );

		dynamicSettings = elementor.helpers.cloneObject( dynamicSettings );

		delete dynamicSettings[settingKey ];

		if ( Object.keys( dynamicSettings ).length ) {
			this.view.elementSettingsModel.set( '__dynamic__', dynamicSettings, this.getDynamicControlSettings( settingKey ) );
		} else {
			this.view.elementSettingsModel.unset( '__dynamic__', this.getDynamicControlSettings( settingKey ) );
		}

		this.toggleDynamicClass();
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
