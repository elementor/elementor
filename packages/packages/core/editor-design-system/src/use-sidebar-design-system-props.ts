import { useIsLegacyElementsPanelSelected } from '@elementor/editor-elements-panel';

import { useOpenDesignSystemToolbar } from './use-open-design-system-toolbar';

export function useSidebarDesignSystemProps() {
	const toolbarProps = useOpenDesignSystemToolbar();
	const isLegacySelected = useIsLegacyElementsPanelSelected();

	return {
		...toolbarProps,
		disabled: ( toolbarProps.disabled ?? false ) || ( isLegacySelected && ! toolbarProps.selected ),
	};
}
