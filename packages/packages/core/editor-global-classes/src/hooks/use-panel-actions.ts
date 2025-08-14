import { usePanelActions as useEditorPanelActions } from '@elementor/editor-editing-panel';

export const usePanelActions = () => {
	const { open } = useEditorPanelActions();

	const openPanel = () => {
		localStorage.setItem( 'elementor-global-classes-search', 'DUP_' );
		open();
	};

	return {
		openPanel,
		open
	};
};
