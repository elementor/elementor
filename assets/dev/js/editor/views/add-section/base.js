module.exports = Marionette.ItemView.extend( {
	template: Marionette.TemplateCache.get( '#tmpl-elementor-add-section' ),

	options: {
		atIndex: null
	},

	attributes: {
		'data-view': 'choose-action'
	},

	ui: {
		addNewSection: '.elementor-add-new-section',
		closeButton: '.elementor-add-section-close',
		addSectionButton: '.elementor-add-section-button',
		addTemplateButton: '.elementor-add-template-button',
		selectPreset: '.elementor-select-preset',
		presets: '.elementor-preset'
	},

	events: {
		'click @ui.addSectionButton': 'onAddSectionButtonClick',
		'click @ui.addTemplateButton': 'onAddTemplateButtonClick',
		'click @ui.closeButton': 'onCloseButtonClick',
		'click @ui.presets': 'onPresetSelected'
	},

	behaviors: function() {
		return {
			contextMenu: {
				behaviorClass: require( 'elementor-behaviors/context-menu' ),
				groups: this.getContextMenuGroups()
			}
		};
	},

	className: function() {
		return 'elementor-add-section elementor-visible-desktop';
	},

	addSection: function( properties, options ) {
		return elementor.sections.currentView.addChildElement( properties, jQuery.extend( {}, this.options, options ) );
	},

	setView: function( view ) {
		this.$el.attr( 'data-view', view );
	},

	showSelectPresets: function() {
		this.setView( 'select-preset' );
	},

	closeSelectPresets: function() {
		this.setView( 'choose-action' );
	},

	getTemplatesModalOptions: function() {
		return {
			importOptions: {
				at: this.getOption( 'atIndex' )
			}
		};
	},

	getContextMenuGroups: function() {
		return [
			{
				name: 'general',
				actions: [
					{
						name: 'copy_all_content',
						title: elementor.translate( 'copy_all_content' ),
						callback: this.copyAllContent.bind( this )
					},	{
						name: 'paste',
						title: elementor.translate( 'paste' ),
						callback: this.paste.bind( this ),
						isEnabled: function() {
							return elementor.getStorage( 'transfer' );
						}
					}
				]
			}
		];
	},

	copyAllContent: function() {
		elementor.setStorage( 'transfer', {
			type: 'copy',
			elementsType: 'section',
			elements: elementor.elements.toJSON( { copyHtmlCache: true } )
		} );
	},

	paste: function() {
		var self = this,
			transferData = elementor.getStorage( 'transfer' ),
			section,
			index;

		elementor.channels.data.trigger( 'element:before:add', transferData.elements[0] );

		if ( 'section' === transferData.elementsType ) {
			index = this.getOption( 'atIndex' );

			if ( null !== index ) {
				index++;
			} else {
				index = elementor.sections.currentView.collection.length;
			}

			transferData.elements.forEach( function( element ) {
				self.addSection( element, {
					at: index,
					edit: false,
					clone: true
				} );

				index++;
			} );
		} else if ( 'column' === transferData.elementsType ) {
			section = self.addSection( { allowEmpty: true } );

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
			section = self.addSection();

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

	onAddSectionButtonClick: function() {
		this.showSelectPresets();
	},

	onAddTemplateButtonClick: function() {
		elementor.templates.startModal( this.getTemplatesModalOptions() );
	},

	onRender: function() {
		this.$el.html5Droppable( {
			axis: [ 'vertical' ],
			groups: [ 'elementor-element' ],
			placeholder: false,
			currentElementClass: 'elementor-html5dnd-current-element',
			hasDraggingOnChildClass: 'elementor-dragging-on-child',
			onDropping: this.onDropping.bind( this )
		} );
	},

	onPresetSelected: function( event ) {
		this.closeSelectPresets();

		var selectedStructure = event.currentTarget.dataset.structure,
			parsedStructure = elementor.presetsFactory.getParsedStructure( selectedStructure ),
			elements = [],
			loopIndex;

		for ( loopIndex = 0; loopIndex < parsedStructure.columnsCount; loopIndex++ ) {
			elements.push( {
				id: elementor.helpers.getUniqueID(),
				elType: 'column',
				settings: {},
				elements: []
			} );
		}

		elementor.channels.data.trigger( 'element:before:add', {
			elType: 'section'
		} );

		var newSection = this.addSection( { elements: elements } );

		newSection.setStructure( selectedStructure );

		elementor.channels.data.trigger( 'element:after:add' );
	},

	onDropping: function() {
		elementor.channels.data.trigger( 'section:before:drop' );

		this.addSection().addElementFromPanel();

		elementor.channels.data.trigger( 'section:after:drop' );
	}
} );
