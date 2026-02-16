import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';

export default function AnnouncementsHeader( { announcement = {}, onClose } ) {
	const { heading = undefined } = announcement;

	return (
		<div className="announcements-heading-container">
			<i className="eicon-elementor" aria-hidden="true" />
			{ heading &&
				<span className="heading-title">{ heading }</span>
			}
			<button
				className="close-button"
				onClick={ () => onClose( 'close' ) }
				aria-label={ __( 'Close announcement', 'elementor' ) }
			>
				<i className="eicon-close" aria-hidden="true" />
			</button>
		</div>
	);
}

AnnouncementsHeader.propTypes = {
	announcement: PropTypes.object.isRequired,
	onClose: PropTypes.func.isRequired,
};
