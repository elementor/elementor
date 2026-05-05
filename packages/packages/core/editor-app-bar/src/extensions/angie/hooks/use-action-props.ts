import { isAngieAvailable } from '@elementor/editor-mcp';
import { ElementorAngieIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

const CREATE_WIDGET_PROMPT = `Create a widget for me.
Goal: [What should this widget help me accomplish?]
Placement: [Where will I see it in the editor/UI?]
How it should work: `;

export default function useActionProps() {
	return {
		title: __( 'Angie', 'elementor' ),
		icon: ElementorAngieIcon,
		onClick: () => {
			window.dispatchEvent(
				new CustomEvent( 'elementor/editor/create-widget', {
					detail: {
						prompt: CREATE_WIDGET_PROMPT,
						entry_point: 'top_bar',
					},
				} ),
			);
		},
		selected: false,
		visible: ! isAngieAvailable(),
	};
}
