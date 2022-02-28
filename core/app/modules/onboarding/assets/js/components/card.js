export default function Card( props ) {
	const { image, imageAlt, text, link, name } = props;

	const onClick = () => {
		elementorCommon.events.dispatchEvent( {
			placement: elementorAppConfig.onboarding.eventPlacement,
			event: 'starting canvas click',
			selection: name,
		} );

		if ( props.clickAction ) {
			props.clickAction();
		}
	};

	return (
		<a className="e-onboarding__card" href={ link } onClick={ onClick }>
			<img className="e-onboarding__card-image" src={ image } alt={ imageAlt }/>
			<div className="e-onboarding__card-text">{ text }</div>
		</a>
	);
}

Card.propTypes = {
	image: PropTypes.string.isRequired,
	imageAlt: PropTypes.string.isRequired,
	text: PropTypes.string.isRequired,
	link: PropTypes.string.isRequired,
	name: PropTypes.string,
	clickAction: PropTypes.func,
};
