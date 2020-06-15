import CardOverlay from 'elementor-app/ui/card/card-overlay';

export default function PromotionOverlay( props ) {
	const promotionUrlWithType = `${ props.promotionUrl }?type=${ props.type }`;

	return (
		<CardOverlay className="promotion-overlay">
			<a target="_blank" rel="noopener noreferrer" href={promotionUrlWithType}>
				<i className="eicon-lock" />
				<span>
				{__( 'Get Pro', 'elementor' )}
			</span>
			</a>
		</CardOverlay>
	);
}

PromotionOverlay.propTypes = {
	className: PropTypes.string,
	promotionUrl: PropTypes.string.isRequired,
	type: PropTypes.string.isRequired,
};
