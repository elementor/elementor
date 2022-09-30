import ContainerHelper from 'elementor-editor-utils/container-helper';

/**
 * @typedef {import('../../container/container')} Container
 */
 class AddSectionBase extends Marionette.ItemView {
	static IS_CONTAINER_ACTIVE = ! ! elementorCommon.config.experimentalFeatures.container;

	// Views.
	static VIEW_CHOOSE_ACTION = 'choose-action';
	static VIEW_SELECT_PRESET = ( AddSectionBase.IS_CONTAINER_ACTIVE ) ? 'select-container-preset' : 'select-preset';

	template() {
		return Marionette.TemplateCache.get( '#tmpl-elementor-add-section' );
	}

	attributes() {
		return {
			'data-view': AddSectionBase.VIEW_CHOOSE_ACTION,
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
			containerPresets: '.e-container-preset',
		};
	}

	events() {
		return {
			'click @ui.addSectionButton': 'onAddSectionButtonClick',
			'click @ui.addTemplateButton': 'onAddTemplateButtonClick',
			'click @ui.closeButton': 'onCloseButtonClick',
			'click @ui.presets': 'onPresetSelected',
			'click @ui.containerPresets': 'onContainerPresetSelected',
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

	setView( view ) {
		this.$el.attr( 'data-view', view );
	}

	showSelectPresets() {
		this.setView( AddSectionBase.VIEW_SELECT_PRESET );
	}

	closeSelectPresets() {
		this.setView( AddSectionBase.VIEW_CHOOSE_ACTION );
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
						title: __( 'Paste', 'elementor' ),
						isEnabled: () => $e.components.get( 'document/elements' ).utils.isPasteEnabled( elementor.getPreviewContainer() ),
						callback: () => $e.run( 'document/ui/paste', {
							container: elementor.getPreviewContainer(),
							options: {
								at: this.getOption( 'at' ),
								rebuild: true,
							},
							onAfter: () => this.onAfterPaste(),
						} ),
					},
				],
			}, {
				name: 'content',
				actions: [
					{
						name: 'copy_all_content',
						title: __( 'Copy All Content', 'elementor' ),
						isEnabled: hasContent,
						callback: () => $e.run( 'document/elements/copy-all' ),
					}, {
						name: 'delete_all_content',
						title: __( 'Delete All Content', 'elementor' ),
						isEnabled: hasContent,
						callback: () => $e.run( 'document/elements/empty' ),
					},
				],
			},
		];
	}

	onAddSectionButtonClick() {
		this.showSelectPresets();
	}

	onAddTemplateButtonClick() {
		$e.run( 'library/open', this.getTemplatesModalOptions() );
	}

	onRender() {
		this.$el.html5Droppable( {
			axis: [ 'vertical' ],
			groups: [ 'elementor-element' ],
			placeholder: false,
			currentElementClass: 'elementor-html5dnd-current-element',
			hasDraggingOnChildClass: 'elementor-dragging-on-child',
			// Merge different options if provided by child elements
			...this.getDroppableOptions(),
		} );
	}

	getDroppableOptions() {
		return {
			onDropping: ( side, event ) => {
				elementor.getPreviewView().onDrop(
					event,
					{ side, at: this.getOption( 'at' ) },
				);
			},
		};
	}

	onPresetSelected( event ) {
		this.closeSelectPresets();

		const selectedStructure = event.currentTarget.dataset.structure,
			parsedStructure = elementor.presetsFactory.getParsedStructure( selectedStructure );

		$e.run( 'document/elements/create', {
			model: {
				elType: 'section',
			},
			container: elementor.getPreviewContainer(),
			columns: parsedStructure.columnsCount,
			structure: selectedStructure,
			options: Object.assign( {}, this.options ),
		} );
	}

	/**
	 * Create a Container preset when the user chooses a preset.
	 *
	 * @param {MouseEvent} e - Click event.
	 *
	 * @return {Container} container
	 */
	onContainerPresetSelected( e ) {
		this.closeSelectPresets();

		return ContainerHelper.createContainerFromPreset(
			e.currentTarget.dataset.preset,
			elementor.getPreviewContainer(),
			this.options,
		);
	}

	onDropping() {
		if ( elementor.helpers.maybeDisableWidget() ) {
			return;
		}

		const selectedElement = elementor.channels.panelElements.request( 'element:selected' ),
			historyId = $e.internal( 'document/history/start-log', {
				type: 'add',
				title: elementor.helpers.getModelLabel( selectedElement.model ),
			} ),
			containingElement = $e.run( 'document/elements/create', {
				model: {
					elType: AddSectionBase.IS_CONTAINER_ACTIVE ? 'container' : 'section',
				},
				container: elementor.getPreviewContainer(),
				columns: 1,
				options: {
					at: this.getOption( 'at' ),
				},
			} );

		if ( ! AddSectionBase.IS_CONTAINER_ACTIVE ) {
			// Create the element in column.
			containingElement.view.children.findByIndex( 0 ).addElementFromPanel();
		} else if ( 'container' !== selectedElement.model.get( 'elType' ) ) {
			// Create the element in a Container, only if the dragged element is not a Container already.
			containingElement.view.addElementFromPanel();
		}

		$e.internal( 'document/history/end-log', { id: historyId } );
	}

	onAfterPaste() {}
}

export default AddSectionBase;
