var BaseSectionsContainerView = require( 'elementor-views/base-sections-container' ),
	AddSectionView = require( 'elementor-views/add-section/independent' ),
	Preview;

Preview = BaseSectionsContainerView.extend( {
	template: Marionette.TemplateCache.get( '#tmpl-elementor-preview' ),

	className: 'elementor-inner',

	childViewContainer: '.elementor-section-wrap',

	behaviors: function() {
		var behaviors = BaseSectionsContainerView.prototype.behaviors.apply( this, arguments );

		return jQuery.extend( behaviors, {
			contextMenu: {
				behaviorClass: require( 'elementor-behaviors/context-menu' ),
				groups: this.getContextMenuGroups()
			}
		} );
	},

	getContextMenuGroups: function() {
		var hasContent = function() {
			return elementor.elements.length > 0;
		};

		return [
			{
				name: 'paste',
				actions: [
					{
						name: 'paste',
						title: elementor.translate( 'paste' ),
						callback: this.paste.bind( this ),
						isEnabled: this.isPasteEnabled.bind( this )
					}
				]
			}, {
				name: 'content',
				actions: [
					{
						name: 'copy_all_content',
						title: elementor.translate( 'copy_all_content' ),
						callback: this.copy.bind( this ),
						isEnabled: hasContent
					}, {
						name: 'delete_all_content',
						title: elementor.translate( 'delete_all_content' ),
						callback: elementor.clearPage.bind( elementor ),
						isEnabled: hasContent
					}
				]
			}
		];
	},

	copy: function() {
		elementor.setStorage( 'transfer', {
			type: 'copy',
			elementsType: 'section',
			elements: elementor.elements.toJSON( { copyHtmlCache: true } )
		} );
	},

	paste: function( atIndex ) {
		var self = this,
			transferData = elementor.getStorage( 'transfer' ),
			section,
			index = undefined !== atIndex ? atIndex : this.collection.length;

		elementor.channels.data.trigger( 'element:before:add', transferData.elements[0] );

		if ( 'section' === transferData.elementsType ) {
			transferData.elements.forEach( function( element ) {
				self.addChildElement( element, {
					at: index,
					edit: false,
					clone: true
				} );

				index++;
			} );
		} else if ( 'column' === transferData.elementsType ) {
			section = self.addChildElement( { allowEmpty: true }, { at: atIndex } );

			section.model.unset( 'allowEmpty' );

			index = 0;

			transferData.elements.forEach( function( element ) {
				section.addChildElement( element, {
					at: index,
					clone: true
				} );

				index++;
			} );

			section.redefineLayout();
		} else {
			section = self.addChildElement( null, { at: atIndex } );

			index = 0;

			transferData.elements.forEach( function( element ) {
				section.addChildElement( element, {
					at: index,
					clone: true
				} );

				index++;
			} );
		}

		elementor.channels.data.trigger( 'element:after:add', transferData.elements[0] );
	},

	isPasteEnabled: function() {
		return elementor.getStorage( 'transfer' );
	},

	onRender: function() {
		if ( ! elementor.userCan( 'design' ) ) {
			return;
		}
		var addNewSectionView = new AddSectionView();

		addNewSectionView.render();

		this.$el.append( addNewSectionView.$el );
	}
} );

module.exports = Preview;
