import ContainerHelper from 'elementor-editor-utils/container-helper';
import environment from 'elementor-common/utils/environment';

/**
 * @typedef {import('../../container/container')} Container
 */
class AddSectionBase extends Marionette.ItemView {
	static IS_CONTAINER_ACTIVE = ! ! elementorCommon.config.experimentalFeatures.container;

	// Views.
	static VIEW_CHOOSE_ACTION = 'choose-action';
	static VIEW_CONTAINER_FLEX_PRESET = 'select-container-preset';
	static VIEW_CONTAINER_GRID_PRESET = 'select-container-preset-grid';

	static getSelectType() {
		return AddSectionBase.IS_CONTAINER_ACTIVE
			? AddSectionBase.getSelectTypePreset()
			: 'select-preset';
	}

	static getSelectTypePreset() {
		return AddSectionBase.IS_CONTAINER_ACTIVE
			? 'select-type'
			: 'select-container-preset';
	}

	template() {
		return Marionette.TemplateCache.get( '#tmpl-elementor-add-section' );
	}

	attributes() {
		return {
			'aria-label': __( 'Add new layout element', 'elementor' ),
			'data-view': AddSectionBase.VIEW_CHOOSE_ACTION,
		};
	}

	ui() {
		return {
			addNewSection: '.elementor-add-new-section',
			closeButton: '.elementor-add-section-close',
			backButton: '.elementor-add-section-back',
			addSectionButton: '.elementor-add-section-button',
			addTemplateButton: '.elementor-add-template-button',
			selectPreset: '.elementor-select-preset',
			presets: '.elementor-preset',
			flexPresetButton: '.flex-preset-button',
			gridPresetButton: '.grid-preset-button',
			chooseFlexPreset: '.e-con-select-preset-flex .e-con-preset',
			chooseGridPreset: '.e-con-select-preset-grid .e-con-preset',
		};
	}

	events() {
		return {
			'click @ui.addSectionButton': 'onAddSectionButtonClick',
			'click @ui.addTemplateButton': 'onAddTemplateButtonClick',
			'click @ui.closeButton': 'onCloseButtonClick',
			'click @ui.backButton': () => this.setView( AddSectionBase.getSelectType() ),
			'click @ui.presets': 'onPresetSelected',
			'click @ui.flexPresetButton': () => this.setView( AddSectionBase.VIEW_CONTAINER_FLEX_PRESET ),
			'click @ui.gridPresetButton': () => this.setView( AddSectionBase.VIEW_CONTAINER_GRID_PRESET ),
			'click @ui.chooseFlexPreset': 'onFlexPresetSelected',
			'click @ui.chooseGridPreset': 'onGridPresetSelected',
		};
	}

	behaviors() {
		const behaviors = {
			contextMenu: {
				behaviorClass: require( 'elementor-behaviors/context-menu' ),
				groups: this.getContextMenuGroups(),
				eventTargets: [ '.elementor-add-section-inner' ],
			},
		};

		return elementor.hooks.applyFilters( 'views/add-section/behaviors', behaviors, this );
	}

	tagName() {
		return 'section';
	}

	className() {
		return 'elementor-add-section elementor-visible-desktop';
	}

	setView( view ) {
		this.$el.attr( 'data-view', view );
	}

	showSelectPresets() {
		this.setView( AddSectionBase.getSelectType() );
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

		const controlSign = environment.mac ? '&#8984;' : '^';

		return [
			{
				name: 'paste',
				actions: [
					{
						name: 'paste',
						title: __( 'Paste', 'elementor' ),
						shortcut: controlSign + '+V',
						isEnabled: () => $e.components.get( 'document/elements' ).utils.isPasteEnabled( elementor.getPreviewContainer() ),
						callback: () => $e.run( 'document/ui/paste', {
							container: elementor.getPreviewContainer(),
							options: {
								at: this.getOption( 'at' ),
								rebuild: true,
							},
							onAfter: () => this.onAfterPaste(),
						} ),
					}, {
						name: 'paste_area',
						icon: 'eicon-import-export',
						title: __( 'Paste from other site', 'elementor' ),
						callback: () => $e.run( 'document/elements/paste-area', {
							container: elementor.getPreviewContainer(),
							options: {
								at: this.getOption( 'at' ),
								rebuild: true,
							},
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
			isDroppingAllowed: ( ) => {
				return ! elementor.channels.editor.request( 'element:dragged' )?.el?.dataset?.id;
			},
			onDropping: ( side, event ) => {
				elementor.getPreviewView().onDrop(
					event,
					{ side, at: this.getOption( 'at' ) },
				);
			},
		};
	}

	onGridPresetSelected( event ) {
		this.closeSelectPresets();

		const selectedStructure = event.currentTarget.dataset.structure,
			parsedStructure = elementor.presetsFactory.getParsedGridStructure( selectedStructure ),
			isAddedAboveAnotherContainer = !! this.options.at || 0 === this.options.at;

		const newContainer = ContainerHelper.createContainer(
			{
				container_type: ContainerHelper.CONTAINER_TYPE_GRID,
				grid_columns_grid: {
					unit: 'fr',
					size: parsedStructure.columns,
				},
				grid_rows_grid: {
					unit: 'fr',
					size: parsedStructure.rows,
				},
				grid_rows_grid_mobile: {
					unit: 'fr',
					size: parsedStructure.rows,
				},
			},
			elementor.getPreviewContainer(),
			this.options,
			{
				title: __( 'Grid', 'elementor' ),
				custom: {
					isPreset: true,
					preset_settings: {
						presetIcon: 'eicon-container-grid',
					},
				},
			},
		);

		if ( isAddedAboveAnotherContainer ) {
			this.destroy();
		}

		return newContainer;
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
	onFlexPresetSelected( e ) {
		this.closeSelectPresets();

		return ContainerHelper.createContainerFromPreset(
			e.currentTarget.dataset.preset,
			elementor.getPreviewContainer(),
			this.options,
		);
	}

	onDropping() {
		elementor.getPreviewView().addElementFromPanel();
	}

	onAfterPaste() {}
}

export default AddSectionBase;
