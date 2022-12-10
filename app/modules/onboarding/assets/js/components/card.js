export default function Card( { image, imageAlt, text, link, name, clickAction } ) {
	const onClick = () => {
		elementorCommon.events.dispatchEvent( {
			event: 'starting canvas click',
			version: '',
			details: {
				placement: elementorAppConfig.onboarding.eventPlacement,
				selection: name,
			},
		} );

		if ( clickAction ) {
			clickAction();
		}
	};

	return (
		<a className="e-onboarding__card" href={ link } onClick={ onClick }>
			<img className="e-onboarding__card-image" src={ image } alt={ imageAlt } />
			<div className="e-onboarding__card-text">{ text }</div>
		</a>
	);
}

Card.propTypes = {
	image: PropTypes.string.isRequired,
	imageAlt: PropTypes.string.isRequired,
	text: PropTypes.string.isRequired,
	link: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	clickAction: PropTypes.func,
};
