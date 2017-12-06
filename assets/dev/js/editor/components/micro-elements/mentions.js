var ViewModule = require( 'elementor-utils/view-module' ),
	MentionView = require( 'elementor-micro-elements/mention-view' );

module.exports = ViewModule.extend( {
	$element: null,

	lastCaretPosition: null,

	mentionsInstance: null,

	__construct: function( settings ) {
		this.$element = settings.element;
	},

	getDefaultElements: function() {
		return {
			$addMention: this.$element.next()
		};
	},

	bindEvents: function() {
		this.$element.on( 'blur', this.onElementBlur.bind( this ) );

		this.elements.$addMention.on( 'click', this.onAddMentionClick.bind( this ) );
	},

	initValue: function() {
		var self = this;

		var parsedValue = elementor.microElements.parseTagsText( self.getSettings( 'value' ), function( tagID, tagName, tagSettings ) {
			tagSettings = tagSettings ? _.escape( JSON.stringify( tagSettings ) ) : '';

			return '<span class="atwho-inserted" contenteditable="false" data-tag-id="' + tagID + '" data-tag-name="' + tagName + '" data-elementor-settings="' + tagSettings + '"></span>';
		} );

		self.$element.html( parsedValue );

		self.$element.find( '.atwho-inserted' ).each( function() {
			var mentionData = jQuery( this ).data();

			self.createMentionView( {
				element: this,
				id: mentionData.tagId,
				name: mentionData.tagName,
				settings: mentionData.elementorSettings,
				silent: true
			} );
		} );
	},

	initMentions: function() {
		this.$element.atwho( {
			at: '@',
			data: Object.values( elementor.microElements.getConfig( 'tags' ) ),
			displayTpl: function( item ) {
				return '<li>' + item.title + '</li>';
			},
			lookUpOnClick: false
		} );

		this.mentionsInstance = this.$element.data( 'atwho' );

		this.mentionsController = this.mentionsInstance.controllers['@'];

		this.handleMentionInsert();
	},

	createMentionView: function( options ) {
		var self = this;

		var mentionView = new MentionView( {
			el: options.element,
			name: options.name,
			id: options.id || elementor.helpers.getUniqueID(),
			settings: options.settings || {},
			isInsidePreview: this.getSettings( 'isInsidePreview' )
		} );

		mentionView.render();

		if ( ! options.silent ) {
			self.trigger( 'mention:create', mentionView );
		}

		mentionView.on( 'remove', function() {
			self.trigger( 'mention:remove', mentionView );
		} );

		mentionView.model.on( 'change', function() {
			self.trigger( 'mention:change', mentionView );
		} );

		mentionView.mentionPopup.on( {
			show: function() {
				self.trigger( 'mention:popup:show', mentionView );
			},
			hide: function() {
				self.trigger( 'mention:popup:hide', mentionView );
			}
		} );
	},

	handleMentionInsert: function() {
		var self = this,
			insert = this.mentionsController.insert;

		this.mentionsController.insert = function( content, $li ) {
			insert.apply( this, arguments );

			self.createMentionView( {
				element: this.query.el[0],
				name: $li.data( 'item-data' ).name
			} );
		};
	},

	getValue: function() {
		var $clonedElement = this.$element.clone(),
			$tags = $clonedElement.find( '.atwho-inserted' );

		$tags.each( function() {
			var $tag = jQuery( this ),
				tagData = $tag.data();

			$tag.replaceWith( elementor.microElements.tagDataToTagText( tagData.tagId, tagData.tagName, tagData.elementorSettings ) );
		} );

		return $clonedElement.html();
	},

	onInit: function() {
		ViewModule.prototype.onInit.apply( this, arguments );

		this.initValue();

		this.initMentions();
	},

	onElementBlur: function() {
		this.lastCaretPosition = this.$element.caret( 'pos' );
	},

	onAddMentionClick: function() {
		var lastCaretPosition = this.lastCaretPosition;

		if ( ! lastCaretPosition ) {
			lastCaretPosition = this.$element.text().length;
		}

		this.$element
			.focus()
			.caret( 'pos', lastCaretPosition );

		var selection = getSelection(),
			range = selection.getRangeAt( 0 ),
			endContainerData = range.endContainer.data,
			addAt = '@';

		if ( endContainerData ) {
			if ( endContainerData.match( '@$' ) ) { // Content ends with a @.
				addAt = '';
			} else if ( ! endContainerData.match( ' $' ) ) { // Content ends with a text.
				addAt = ' @';
			}
		}

		range.deleteContents();

		range.insertNode( document.createTextNode( addAt ) );

		if ( addAt ) {
			this.$element.caret( 'pos', lastCaretPosition + addAt.length );
		}

		this.mentionsController.lookUp( { which: '' } );
	}
} );
