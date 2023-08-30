import TextIcon from '../../../icons/text-icon';
import { AIIcon } from '@elementor/icons';

const FALLBACK_ICON = <AIIcon data-testid="e-ph-fi" />;
const ICONS_BY_ACTIONS = Object.freeze( {
	'enhance-image-prompt': <TextIcon />,
	'get-text': <TextIcon />,
	'edit-text': <TextIcon />,
} );

export const getIconByAction = ( action ) => {
	if ( ICONS_BY_ACTIONS[ action ] ) {
		return ICONS_BY_ACTIONS[ action ];
	}

	return FALLBACK_ICON;
};
