import AiLayoutBehavior from './ai-layout-behavior';
import { importToEditor, renderLayoutApp } from './utils/editor-integration';
import { __ } from '@wordpress/i18n';
import { MODE_VARIATION } from './layout-app';

export default class Module extends elementorModules.editor.utils.Module {
	onElementorInit() {
		elementor.hooks.addFilter( 'views/add-section/behaviors', this.registerAiLayoutBehavior );

		elementor.hooks.addFilter( 'elements/container/contextMenuGroups', this.registerVariationsContextMenu );
	}

	registerAiLayoutBehavior( behaviors ) {
		behaviors.ai = {
			behaviorClass: AiLayoutBehavior,
		};

		return behaviors;
	}

	registerVariationsContextMenu = ( groups, currentElement ) => {
		const saveGroup = groups.find( ( group ) => 'save' === group.name );

		if ( ! saveGroup ) {
			return groups;
		}

		// Add on top of save group actions
		saveGroup.actions.unshift( {
			name: 'ai',
			icon: 'eicon-ai',
			title: __( 'Generate AI Variations', 'elementor' ),
			callback: async () => {
				const container = currentElement.getContainer();
				const json = container.model.toJSON( { remove: [ 'default' ] } );
				const attachments = [ {
					type: 'json',
					previewHTML: '',
					content: json,
					label: container.model.get( 'title' ),
				} ];

				renderLayoutApp( {
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
							at: container.view._index,
							template,
							historyTitle: __( 'AI Variation', 'elementor' ),
							replace: true,
						} );
					},
				} );
			},
		} );

		return groups;
	};
}

new Module();
