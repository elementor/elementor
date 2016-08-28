var SectionView = require( 'elementor-views/section' ),
	SectionsCollectionView;

SectionsCollectionView = Marionette.CompositeView.extend( {
	template: Marionette.TemplateCache.get( '#tmpl-elementor-preview' ),

	id: 'elementor-inner',

	childViewContainer: '#elementor-section-wrap',

	childView: SectionView,

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

	behaviors: {
		Sortable: {
			behaviorClass: require( 'elementor-behaviors/sortable' ),
			elChildType: 'section'
		},
		HandleDuplicate: {
			behaviorClass: require( 'elementor-behaviors/handle-duplicate' )
		},
		HandleAdd: {
			behaviorClass: require( 'elementor-behaviors/duplicate' )
		},
		HandleElementsRelation: {
			behaviorClass: require( 'elementor-behaviors/elements-relation' )
		}
	},

	getSortableOptions: function() {
		return {
			handle: '> .elementor-container > .elementor-row > .elementor-column > .elementor-element-overlay .elementor-editor-section-settings-list .elementor-editor-element-trigger',
			items: '> .elementor-section'
		};
	},

	getChildType: function() {
		return [ 'section' ];
	},

	isCollectionFilled: function() {
		return false;
	},

	initialize: function() {
		this
			.listenTo( this.collection, 'add remove reset', this.onCollectionChanged )
			.listenTo( elementor.channels.panelElements, 'element:drag:start', this.onPanelElementDragStart )
			.listenTo( elementor.channels.panelElements, 'element:drag:end', this.onPanelElementDragEnd );
	},

	addChildModel: function( model, options ) {
		return this.collection.add( model, options, true );
	},

	addSection: function( properties ) {
		var newSection = {
			id: elementor.helpers.getUniqueID(),
			elType: 'section',
			settings: {},
			elements: []
		};

		if ( properties ) {
			_.extend( newSection, properties );
		}

		var newModel = this.addChildModel( newSection );

		return this.children.findByModelCid( newModel.cid );
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
			var $style = Backbone.$( '<style>' ).text( '.elementor-editor-active #elementor-inner{margin-top: ' + elTopOffsetRange + 'px}' );

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
				var elementView = elementor.channels.panelElements.request( 'element:selected' ),
					newSection = self.addSection(),
					elType = elementView.model.get( 'elType' );

				var elementData = {
					id: elementor.helpers.getUniqueID(),
					elType: elType
				};

				if ( 'widget' === elType ) {
					elementData.widgetType = elementView.model.get( 'widgetType' );
				} else {
					elementData.elements = [];
					elementData.isInner = true;
				}

				newSection.triggerMethod( 'request:add', elementData );
			}
		} );

		_.defer( _.bind( self.fixBlankPageOffset, this ) );
	},

	onCollectionChanged: function() {
		elementor.setFlagEditorChange( true );
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
	},

	onPanelElementDragStart: function() {
		elementor.helpers.disableElementEvents( this.$el.find( 'iframe' ) );
	},

	onPanelElementDragEnd: function() {
		elementor.helpers.enableElementEvents( this.$el.find( 'iframe' ) );
	}
} );

module.exports = SectionsCollectionView;
