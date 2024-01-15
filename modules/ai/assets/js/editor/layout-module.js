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

		if ( ! ElementorAiConfig?.usage?.hasAiSubscription ) {
			const svg = `
			<svg viewBox="0 0 24 24">
				<path d="M12 5.25C12.2508 5.25 12.485 5.37533 12.6241 5.58397L16.1703 10.9033L20.5315 7.41435C20.7777
				7.21743 21.1207 7.19544 21.39 7.35933C21.6592 7.52321 21.7973 7.83798 21.7355 8.14709L19.7355
				18.1471C19.6654 18.4977 19.3576 18.75 19 18.75H5.00004C4.64253 18.75 4.33472 18.4977 4.26461
				18.1471L2.2646 8.14709C2.20278 7.83798 2.34084 7.52321 2.61012 7.35933C2.8794 7.19544 3.22241
				7.21743 3.46856 7.41435L7.82977 10.9033L11.376 5.58397C11.5151 5.37533 11.7493 5.25 12 5.25ZM12
				7.35208L8.62408 12.416C8.50748 12.5909 8.32282 12.7089 8.1151 12.7411C7.90738 12.7734 7.69566
				12.717 7.53152 12.5857L4.13926 9.87185L5.61489 17.25H18.3852L19.8608 9.87185L16.4686 12.5857C16.3044
				12.717 16.0927 12.7734 15.885 12.7411C15.6773 12.7089 15.4926 12.5909 15.376 12.416L12 7.35208Z">
				</path>
    		</svg>`;

			contextMenu.shortcut = `<div class="elementor-context-menu-list__item__ai-badge">${ svg }</div>`;
		}

		// Add on top of save group actions
		saveGroup.actions.unshift( contextMenu );

		return groups;
	};
}

new Module();
