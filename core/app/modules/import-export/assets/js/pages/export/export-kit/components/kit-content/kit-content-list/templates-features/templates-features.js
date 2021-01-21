export default function TemplatesFeatures( props ) {
	const getLockedFeatures = () => {
		if ( ! props.features.locked?.length ) {
			return;
		}

		return (
			<span className={ props.hasPro ? '' : 'kit-content-list__locked-features' }>
				{ ', ' + props.features.locked.join( ', ' ) }
			</span>
		);
	},
	getOpenFeatures = () => props.features.open?.join( ', ' );

	return (
		<>
			{ getOpenFeatures() }
			{ getLockedFeatures() }
		</>
	);
}

TemplatesFeatures.propTypes = {
	features: PropTypes.object,
	hasPro: PropTypes.bool,
};
