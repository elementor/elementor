var AddSectionView;

AddSectionView = Marionette.ItemView.extend( {
	template: Marionette.TemplateCache.get( '#tmpl-elementor-add-section' ),

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

	className: function() {
		return 'elementor-add-section elementor-visible-desktop';
	},

	addSection: function( properties, options ) {
		return elementor.sections.currentView.addSection( properties, options );
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
			onReady: function() {
				elementor.templates.showTemplates();
			}
		};
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

module.exports = AddSectionView;
