import PropTypes from 'prop-types';

export default function AnnouncementsHeader( { announcement, onClose } ) {
	const { heading } = announcement;

	return (
		<div className="announcements-heading-container">
			<i className="eicon-elementor" aria-hidden="true" />
			<span className="heading-title">{ heading }</span>
			<button
				className="close-button"
				onClick={ () => onClose( 'close' ) }
				aria-label="Close announcement"
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
