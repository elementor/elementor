import AiLayoutBehavior from './ai-layout-behavior';
import { importToEditor, renderLayoutApp } from './utils/editor-integration';
import { __ } from '@wordpress/i18n';
import { MODE_VARIATION } from './pages/form-layout/context/config';
import ApplyTemplateForAi from './integration/library/apply-template-for-ai-behavior';
import { ELEMENTOR_LIBRARY_SOURCE, USER_VARIATION_SOURCE } from './pages/form-layout/components/attachments';

export const AI_ATTACHMENT = 'ai-attachment';
export default class Module extends elementorModules.editor.utils.Module {
	onElementorInit() {
		elementor.hooks.addFilter( 'views/add-section/behaviors', this.registerAiLayoutBehavior );

		elementor.hooks.addFilter( 'elements/container/contextMenuGroups', this.registerVariationsContextMenu );

		elementor.hooks.addFilter( 'elementor/editor/template-library/template/behaviors', this.registerLibraryActionButtonBehavior );

		elementor.hooks.addFilter( 'elementor/editor/template-library/template/action-button', this.filterLibraryActionButtonTemplate, 11 );

		$e.commands.register( 'library', 'generate-ai-variation', ( args ) => {
			return this.applyTemplate( args );
		} );
	}

	applyTemplate( args ) {
		window.postMessage( {
			type: 'library/attach:start',
		} );

		$e.components.get( 'library' ).downloadTemplate( args, ( data ) => {
			const model = args.model;
			window.postMessage( {
				type: 'library/attach',
				json: data.content[ 0 ],
				html: `<img src="${ model.get( 'thumbnail' ) }" />`,
				label: `${ model.get( 'template_id' ) } - ${ model.get( 'title' ) }`,
				source: ELEMENTOR_LIBRARY_SOURCE,
			}, window.location.origin );
		} );
	}

	registerLibraryActionButtonBehavior( behaviors ) {
		behaviors.applyAiTemplate = {
			behaviorClass: ApplyTemplateForAi,
		};

		return behaviors;
	}

	registerAiLayoutBehavior( behaviors ) {
		behaviors.ai = {
			behaviorClass: AiLayoutBehavior,
			context: { documentType: window.elementor.documents.getCurrent().config.type },
		};

		return behaviors;
	}

	filterLibraryActionButtonTemplate( viewId ) {
		const modalConfig = $e.components.get( 'library' ).manager.modalConfig;
		const originalCoreViewId = '#tmpl-elementor-template-library-insert-button';

		if ( originalCoreViewId !== viewId ) {
			return viewId;
		}

		if ( $e.routes.current.library !== 'library/templates/blocks' ) {
			return viewId;
		}

		if ( AI_ATTACHMENT === modalConfig.mode ) {
			viewId = '#tmpl-elementor-template-library-apply-ai-button';
		} else {
			viewId = '#tmpl-elementor-template-library-insert-and-ai-variations-buttons';
		}
		return viewId;
	}

	registerVariationsContextMenu = ( groups, currentElement ) => {
		const saveGroup = groups.find( ( group ) => 'save' === group.name );

		if ( ! saveGroup ) {
			return groups;
		}

		const contextMenu = {
			name: 'ai',
			icon: 'eicon-ai',
			isEnabled: () => 0 !== currentElement.getContainer().children.length,
			title: __( 'Generate variations with AI', 'elementor' ),
			callback: async () => {
				const container = currentElement.getContainer();
				const json = container.model.toJSON( { remove: [ 'default' ] } );
				const attachments = [ {
					type: 'json',
					previewHTML: '',
					content: json,
					label: container.model.get( 'title' ),
					source: USER_VARIATION_SOURCE,
				} ];

				renderLayoutApp( {
					parentContainer: container.parent,
					mode: MODE_VARIATION,
					at: container.view._index,
					attachments,
					onSelect: () => {
						container.view.$el.hide();
					},
					onClose: () => {
						container.view.$el.show();
					},
					onInsert: ( template ) => {
						importToEditor( {
							parentContainer: container.parent,
							at: container.view._index,
							template,
							historyTitle: __( 'AI Variation', 'elementor' ),
							replace: true,
						} );
					},
				} );
			},
		};

		// Add on top of save group actions
		saveGroup.actions.unshift( contextMenu );

		return groups;
	};
}

new Module();
