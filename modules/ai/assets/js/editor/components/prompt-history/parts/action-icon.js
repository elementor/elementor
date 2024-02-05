import PropTypes from 'prop-types';
import TextIcon from '../../../icons/text-icon';
import { AIIcon } from '@elementor/icons';
import CodeIcon from '../../../icons/code-icon';

const FALLBACK_ICON = <AIIcon data-testid="e-ph-fi" />;
const ICONS_BY_ACTIONS = Object.freeze( {
	'enhance-image-prompt': <TextIcon />,
	'get-text': <TextIcon />,
	'edit-text': <TextIcon />,

	'custom-css': <CodeIcon />,
	'custom-code': <CodeIcon />,
} );

const PromptHistoryActionIcon = ( { action } ) => {
	if ( ICONS_BY_ACTIONS[ action ] ) {
		return ICONS_BY_ACTIONS[ action ];
	}

	return FALLBACK_ICON;
};

PromptHistoryActionIcon.propTypes = {
	action: PropTypes.string.isRequired,
};

export default PromptHistoryActionIcon;
