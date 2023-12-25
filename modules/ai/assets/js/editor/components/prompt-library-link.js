import { Typography, Link } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

const PromptLibraryLink = ( props ) => {
	return (
		<Typography variant="body2" color="text.secondary">
			{ __( 'For more inspiration, try experimenting with proven prompts from our' ) }{ ' ' }
			<Link href={ props.libraryLink } className="elementor-clickable" target="_blank" rel="noopener noreferrer">
				{ __( 'prompt library' ) }
			</Link>
		</Typography>
	);
};

PromptLibraryLink.propTypes = {
	libraryLink: PropTypes.string,
};

export default PromptLibraryLink;
