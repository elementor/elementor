import CardOverlay from 'elementor-app/ui/card/card-overlay';

import './promotion-overlay.scss';

export default function PromotionOverlay( props ) {
	const promotionUrlWithType = `${ props.promotionUrl }?type=${ props.type }`;

	return (
		<CardOverlay className="promotion-overlay">
			<a className="promotion-overlay__link" target="_blank" rel="noopener noreferrer" href={promotionUrlWithType}>
				<i className="promotion-overlay__icon eicon-lock" />
				<span className="promotion-overlay__button eps-button">{__( 'Get Pro', 'elementor' )}</span>
			</a>
		</CardOverlay>
	);
}

PromotionOverlay.propTypes = {
	className: PropTypes.string,
	promotionUrl: PropTypes.string.isRequired,
	type: PropTypes.string.isRequired,
};
