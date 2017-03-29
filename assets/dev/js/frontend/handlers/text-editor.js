var HandlerModule = require( 'elementor-frontend/handler-module' ),
	TextEditor;

TextEditor = HandlerModule.extend( {
	dropCapLetter: '',

	getDefaultSettings: function() {
		return {
			selectors: {
				paragraph: 'p:first'
			},
			classes: {
				dropCap: 'elementor-drop-cap',
				dropCapLetter: 'elementor-drop-cap-letter'
			}
		};
	},

	getDefaultElements: function() {
		var selectors = this.getSettings( 'selectors' ),
			classes = this.getSettings( 'classes' ),
			$dropCap = jQuery( '<span>', { 'class': classes.dropCap } ),
			$dropCapLetter = jQuery( '<span>', { 'class': classes.dropCapLetter } );

		$dropCap.append( $dropCapLetter );

		return {
			$paragraph: this.$element.find( selectors.paragraph ),
			$dropCap: $dropCap,
			$dropCapLetter: $dropCapLetter
		};
	},

	getElementName: function() {
		return 'text-editor';
	},

	wrapDropCap: function() {
		var isDropCapEnabled = this.getElementSettings( 'drop_cap' );

		if ( ! isDropCapEnabled ) {
			// If there is an old drop cap inside the paragraph
			if ( this.dropCapLetter ) {
				this.elements.$dropCap.remove();

				this.elements.$paragraph.prepend( this.dropCapLetter );

				this.dropCapLetter = '';
			}

			return;
		}

		var $paragraph = this.elements.$paragraph;

		if ( ! $paragraph.length ) {
			return;
		}

		var	paragraphContent = $paragraph.html().replace( /&nbsp;/g, ' ' ),
			firstLetterMatch = paragraphContent.match( /^ *([^ ] ?)/ );

		if ( ! firstLetterMatch ) {
			return;
		}

		var firstLetter = firstLetterMatch[1],
			trimmedFirstLetter = firstLetter.trim();

		// Don't apply drop cap when the content starting with an HTML tag
		if ( '<' === trimmedFirstLetter ) {
			return;
		}

		this.dropCapLetter = firstLetter;

		this.elements.$dropCapLetter.text( trimmedFirstLetter );

		var restoredParagraphContent = paragraphContent.slice( firstLetter.length ).replace( /^ */, function( match ) {
			return new Array( match.length + 1 ).join( '&nbsp;' );
		});

		$paragraph.html( restoredParagraphContent ).prepend( this.elements.$dropCap );
	},

	onInit: function() {
		HandlerModule.prototype.onInit.apply( this, arguments );

		this.wrapDropCap();
	},

	onElementChange: function( propertyName ) {
		if ( 'drop_cap' === propertyName ) {
			this.wrapDropCap();
		}
	}
} );

module.exports = function( $scope ) {
	new TextEditor( { $element: $scope } );
};
