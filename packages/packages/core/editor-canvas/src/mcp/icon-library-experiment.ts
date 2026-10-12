import { isExperimentActive } from '@elementor/editor-v1-adapters';

const ICON_LIBRARY_EXPERIMENT = 'e_svg_library';

export const isIconLibraryActive = () => isExperimentActive( ICON_LIBRARY_EXPERIMENT );
