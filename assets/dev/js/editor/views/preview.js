var BaseSectionsContainerView = require( 'elementor-views/base-sections-container' ),
	Preview;

Preview = BaseSectionsContainerView.extend( {
	template: Marionette.TemplateCache.get( '#tmpl-elementor-preview' ),

	className: 'elementor-inner',

	childViewContainer: '.elementor-section-wrap',

	ui: {
		addSectionArea: '#elementor-add-section',
		addNewSection: '#elementor-add-new-section',
		closePresetsIcon: '#elementor-select-preset-close',
		addSectionButton: '#elementor-add-section-button',
		addTemplateButton: '#elementor-add-template-button',
		selectPreset: '#elementor-select-preset',
		presets: '.elementor-preset'
	},

	events: {
		'click @ui.addSectionButton': 'onAddSectionButtonClick',
		'click @ui.addTemplateButton': 'onAddTemplateButtonClick',
		'click @ui.closePresetsIcon': 'closeSelectPresets',
		'click @ui.presets': 'onPresetSelected'
	},

	closeSelectPresets: function() {
		this.ui.addNewSection.show();
		this.ui.selectPreset.hide();
	},

	fixBlankPageOffset: function() {
		var sectionHandleHeight = 27,
			elTopOffset = this.$el.offset().top,
			elTopOffsetRange = sectionHandleHeight - elTopOffset;

		if ( 0 < elTopOffsetRange ) {
			var $style = Backbone.$( '<style>' ).text( '.elementor-editor-active .elementor-inner{margin-top: ' + elTopOffsetRange + 'px}' );

			elementor.$previewContents.children().children( 'head' ).append( $style );
		}
	},

	onAddSectionButtonClick: function() {
		this.ui.addNewSection.hide();
		this.ui.selectPreset.show();
	},

	onAddTemplateButtonClick: function() {
		elementor.templates.startModal( function() {
			elementor.templates.showTemplates();
		} );
	},

	onRender: function() {
		var self = this;

		self.ui.addSectionArea.html5Droppable( {
			axis: [ 'vertical' ],
			groups: [ 'elementor-element' ],
			onDragEnter: function( side ) {
				self.ui.addSectionArea.attr( 'data-side', side );
			},
			onDragLeave: function() {
				self.ui.addSectionArea.removeAttr( 'data-side' );
			},
			onDropping: function() {
				self.addSection().addElementFromPanel();
			}
		} );

		_.defer( _.bind( self.fixBlankPageOffset, this ) );
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

		var newSection = this.addSection( { elements: elements } );

		newSection.setStructure( selectedStructure );
		newSection.redefineLayout();
	}
} );

module.exports = Preview;
