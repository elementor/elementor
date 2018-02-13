var MentionView = require( 'elementor-dynamic-tags/mention-view' );

module.exports = Marionette.Behavior.extend( {

	mentionView: null,

	ui: {
		mentionsArea: '.elementor-control-mentions-area',
		dynamicSwitcher: '.elementor-control-dynamic-switcher'
	},

	events: {
		'click @ui.dynamicSwitcher': 'onDynamicSwitcherClick'
	},

	renderTools: function() {
		var $dynamicSwitcher = jQuery( Marionette.Renderer.render( '#tmpl-elementor-control-dynamic-switcher' ) );

		this.ui.controlTitle.after( $dynamicSwitcher );

		this.ui.dynamicSwitcher = this.$el.find( this.ui.dynamicSwitcher.selector );
	},

	toggleDynamicClass: function() {
		this.$el.toggleClass( 'elementor-control-dynamic', this.isDynamicMode() );
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
		var tags = elementor.dynamicTags.getConfig( 'tags' ),
			groups = this.getOption( 'groups' );

		tags = _.filter( tags, function( tag ) {
			return _.intersection( tag.groups, groups ).length;
		} );

		var $tagsList = this.ui.tagsList = jQuery( '<div>', { 'class': 'elementor-tags-list' } );

		tags.forEach( function( tag ) {
			var $tag = jQuery( '<div>', { 'class': 'elementor-tags-list__item' } );

			$tag.text( tag.title ).attr( 'data-tag-name', tag.name );

			$tagsList.append( $tag );
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

	setMentionView: function( id, name, settings ) {
		if ( this.mentionView ) {
			this.mentionView.destroy();
		}

		var mentionView = this.mentionView = new MentionView( {
			id: id,
			name: name,
			settings: settings
		} );

		mentionView.render();

		this.ui.mentionsArea.after( mentionView.el );

		this.listenTo( mentionView.model, 'change', this.onMentionViewChange.bind( this ) )
			.listenTo( mentionView, 'remove', this.onMentionViewRemove.bind( this ) );
	},

	mentionViewToTagText: function() {
		var mentionView = this.mentionView;

		return elementor.dynamicTags.tagDataToTagText( mentionView.getOption( 'id' ), mentionView.getOption( 'name' ), mentionView.model );
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

	onRender: function() {
		this.renderTools();

		this.toggleDynamicClass();

		if ( this.isDynamicMode() ) {
			var tagData = elementor.dynamicTags.getTagTextData( this.getDynamicValue() );

			this.setMentionView( tagData.id, tagData.name, tagData.settings );
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

		this.setMentionView( elementor.helpers.getUniqueID(), $tag.data( 'tagName' ), {} );

		this.setDynamicValue( this.mentionViewToTagText() );

		this.toggleTagsList();
	},

	onMentionViewChange: function() {
		this.setDynamicValue( this.mentionViewToTagText() );
	},

	onMentionViewRemove: function() {
		var staticValue = this.view.elementSettingsModel.get( elementor.dynamicTags.getStaticSettingKey( this.view.model.get( 'name' ) ) );

		this.setDynamicMode( false );

		this.view.setSettingsModel( staticValue );

		this.view.render();
	}
} );
