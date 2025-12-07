import PropTypes from 'prop-types';

const decodeHtmlEntities = ( url ) => {
	if ( ! url ) {
		return url;
	}

	const textarea = document.createElement( 'textarea' );
	textarea.innerHTML = url;
	const decodedValue = textarea.value;
	textarea.remove();

	return decodedValue;
};

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
						className={ `button-item ${ button.variant }` }
						href={ decodeHtmlEntities( button.url ) }
						target={ button.target }
						onClick={ () => onClose( 'cta' ) } >
						{ button.label }
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
