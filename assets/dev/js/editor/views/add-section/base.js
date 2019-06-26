class AddSectionBase extends Marionette.ItemView {
	template() {
		return Marionette.TemplateCache.get( '#tmpl-elementor-add-section' );
	}

	attributes() {
		return {
			'data-view': 'choose-action',
		};
	}

	ui() {
		return {
			addNewSection: '.elementor-add-new-section',
			closeButton: '.elementor-add-section-close',
			addSectionButton: '.elementor-add-section-button',
			addTemplateButton: '.elementor-add-template-button',
			selectPreset: '.elementor-select-preset',
			presets: '.elementor-preset',
		};
	}

	events() {
		return {
			'click @ui.addSectionButton': 'onAddSectionButtonClick',
			'click @ui.addTemplateButton': 'onAddTemplateButtonClick',
			'click @ui.closeButton': 'onCloseButtonClick',
			'click @ui.presets': 'onPresetSelected',
		};
	}

	behaviors() {
		return {
			contextMenu: {
				behaviorClass: require( 'elementor-behaviors/context-menu' ),
				groups: this.getContextMenuGroups(),
			},
		};
	}

	className() {
		return 'elementor-add-section elementor-visible-desktop';
	}

	addSection( properties, options ) {
		return elementor.getPreviewView().addChildElement( properties, jQuery.extend( {}, this.options, options ) );
	}

	setView( view ) {
		this.$el.attr( 'data-view', view );
	}

	showSelectPresets() {
		this.setView( 'select-preset' );
	}

	closeSelectPresets() {
		this.setView( 'choose-action' );
	}

	getTemplatesModalOptions() {
		return {
			importOptions: {
				at: this.getOption( 'at' ),
			},
		};
	}

	getContextMenuGroups() {
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
						isEnabled: this.isPasteEnabled.bind( this ),
					},
				],
			}, {
				name: 'content',
				actions: [
					{
						name: 'copy_all_content',
						title: elementor.translate( 'copy_all_content' ),
						callback: this.copy.bind( this ),
						isEnabled: hasContent,
					}, {
						name: 'delete_all_content',
						title: elementor.translate( 'delete_all_content' ),
						callback: elementor.clearPage.bind( elementor ),
						isEnabled: hasContent,
					},
				],
			},
		];
	}

	copy() {
		elementor.getPreviewView().copy();
	}

	paste() {
		elementor.getPreviewView().paste( this.getOption( 'at' ) );
	}

	isPasteEnabled() {
		return elementorCommon.storage.get( 'transfer' );
	}

	onAddSectionButtonClick() {
		this.showSelectPresets();
	}

	onAddTemplateButtonClick() {
		elementor.templates.startModal( this.getTemplatesModalOptions() );
	}

	onRender() {
		this.$el.html5Droppable( {
			axis: [ 'vertical' ],
			groups: [ 'elementor-element' ],
			placeholder: false,
			currentElementClass: 'elementor-html5dnd-current-element',
			hasDraggingOnChildClass: 'elementor-dragging-on-child',
			onDropping: this.onDropping.bind( this ),
		} );
	}

	onPresetSelected( event ) {
		this.closeSelectPresets();

		const selectedStructure = event.currentTarget.dataset.structure,
			parsedStructure = elementor.presetsFactory.getParsedStructure( selectedStructure ),
			elements = [];

		let loopIndex;

		for ( loopIndex = 0; loopIndex < parsedStructure.columnsCount; loopIndex++ ) {
			elements.push( {
				id: elementor.helpers.getUniqueID(),
				elType: 'column',
				settings: {},
				elements: [],
			} );
		}

		elementor.channels.data.trigger( 'element:before:add', {
			elType: 'section',
		} );

		const newSection = this.addSection( { elements: elements }, { edit: false } );

		newSection.setStructure( selectedStructure );

		newSection.getEditModel().trigger( 'request:edit' );

		elementor.channels.data.trigger( 'element:after:add' );
	}

	onDropping() {
		elementor.channels.data.trigger( 'section:before:drop' );

		if ( elementor.helpers.maybeDisableWidget() ) {
			return;
		}

		this.addSection().addElementFromPanel();

		elementor.channels.data.trigger( 'section:after:drop' );
	}
}

export default AddSectionBase;
