var Mentions = require( 'elementor-micro-elements/mentions' );

module.exports = Marionette.Behavior.extend( {
	mentions: null,

	initialize: function() {
		this.view.getInputValue = this.getInputValue.bind( this );

		this.view.applySavedValue = _.noop;
	},

	onRender: function() {
		this.initMentions();
	},

	initMentions: function() {
		var value = _.escape( this.view.getControlValue() )
			.replace( /&quot;/g, '"' )
			.replace( /&amp;/g, '&' );

		this.mentions = new Mentions( {
			element: this.ui.contentEditable,
			value: value
		} );

		this.mentions.on( 'mention:create mention:change mention:remove', this.onMentionChange.bind( this ) );
	},

	getInputValue: function() {
		return _.unescape( this.mentions.getValue() );
	},

	onMentionChange: function() {
		this.view.ui.contentEditable.trigger( 'input' );
	}
} );
