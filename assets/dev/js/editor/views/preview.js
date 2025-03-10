import AddSectionView from './add-section/independent';

const BaseSectionsContainerView = require( 'elementor-views/base-sections-container' );

const Preview = BaseSectionsContainerView.extend( {
	initialize() {
		this.$childViewContainer = jQuery( '<div>', { class: 'elementor-section-wrap' } );

		this.config = {
			allowEdit: true,
		};

		BaseSectionsContainerView.prototype.initialize.apply( this, arguments );
	},

	setConfig( config ) {
		this.config = Object.assign( this.config, config );
	},

	getChildViewContainer() {
		return this.$childViewContainer;
	},

	behaviors() {
		var parentBehaviors = BaseSectionsContainerView.prototype.behaviors.apply( this, arguments ),
			behaviors = {
				contextMenu: {
					behaviorClass: require( 'elementor-behaviors/context-menu' ),
					groups: this.getContextMenuGroups(),
				},
			};

		return jQuery.extend( parentBehaviors, behaviors );
	},

	getContainer() {
		return elementor.settings.page.getEditedView().getContainer();
	},

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
						isEnabled: () => $e.components.get( 'document/elements' ).utils.isPasteEnabled( this.getContainer() ),
						callback: ( at ) => $e.run( 'document/ui/paste', {
							container: this.getContainer(),
							options: {
								at,
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
	},

	createElementFromModel( model, options = {} ) {
		return BaseSectionsContainerView.prototype.createElementFromModel.call(
			this,
			model,
			{ ...options, shouldWrap: 'container' !== model.elType && 'div-block' !== model.elType },
		);
	},

	addElementFromPanel( options ) {
		if ( ! this.config.allowEdit || elementor.helpers.maybeDisableWidget() ) {
			return;
		}

		const isContainerActive = ! ! elementorCommon.config.experimentalFeatures.container;

		const selectedElement = elementor.channels.panelElements.request( 'element:selected' ),
			historyId = $e.internal( 'document/history/start-log', {
				type: 'add',
				title: elementor.helpers.getModelLabel( selectedElement.model ),
			} ),
			containingElement = $e.run( 'document/elements/create', {
				model: {
					elType: isContainerActive ? 'container' : 'section',
				},
				container: elementor.getPreviewContainer(),
				columns: 1,
				options: {
					at: this.getOption( 'at' ),
					...options,
				},
			} );

		if ( ! isContainerActive ) {
			// Create the element in column.
			containingElement.view.children.findByIndex( 0 ).addElementFromPanel( options );
		} else if ( 'container' !== selectedElement.model.get( 'elType' ) ) {
			// Create the element in a Container, only if the dragged element is not a Container already.
			containingElement.view.addElementFromPanel( options );
		}

		$e.internal( 'document/history/end-log', { id: historyId } );
	},

	shouldRenderAddNewSectionArea() {
		return this.config.allowEdit && elementor.userCan( 'design' );
	},

	onRender() {
		this.$el.html( this.$childViewContainer );

		if ( this.shouldRenderAddNewSectionArea() ) {
			const addNewSectionView = new AddSectionView();

			addNewSectionView.render();

			this.$el.append( addNewSectionView.$el );
		}
	},
} );

module.exports = Preview;
