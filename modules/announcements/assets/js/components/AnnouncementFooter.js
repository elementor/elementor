import PropTypes from 'prop-types';

export default function AnnouncementFooter( { buttons, onClose } ) {
	if ( ! buttons ) {
		return null;
	}

	return (
		<div className="announcement-footer-container">
			{ Object.values( buttons ).map( ( button, index ) => {
				return (
					<a
						key={ `button${ index }` }
						className={ `button-item ${ button?.variant }` }
						href={ button?.url?.replaceAll( '&amp;', '&' ) }
						target={ button?.target }
						onClick={ () => onClose( 'cta' ) } >
						{ button?.label }
					</a>
				);
			} ) }
		</div>
	);
}

AnnouncementFooter.propTypes = {
	buttons: PropTypes.oneOfType( [
		PropTypes.array,
		PropTypes.object,
	] ),
	onClose: PropTypes.func.isRequired,
};
