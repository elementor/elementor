import PropTypes from 'prop-types';

export default function Card( { image, imageAlt, title, text, link, clickAction, target = '_self' } ) {
	const onClick = () => {
		if ( clickAction ) {
			clickAction();
		}
	};

	return (
		<a target={ target } className="e-onboarding__card" href={ link } onClick={ onClick }>
			<img className="e-onboarding__card-image" src={ image } alt={ imageAlt } />
			{ !! title && <>
				<div className="e-onboarding__card-text">{ title }</div>
				<div className="e-onboarding__card-text-small">{ text }</div>
			</>
			}
			{ ! title && <div className="e-onboarding__card-text">{ text }</div> }
		</a>
	);
}

Card.propTypes = {
	image: PropTypes.string.isRequired,
	imageAlt: PropTypes.string.isRequired,
	title: PropTypes.string,
	text: PropTypes.string.isRequired,
	link: PropTypes.string.isRequired,
	clickAction: PropTypes.func,
	target: PropTypes.string,
};
