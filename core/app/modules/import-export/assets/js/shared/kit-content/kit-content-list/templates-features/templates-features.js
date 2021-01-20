export default function TemplatesFeatures( props ) {
	const getLockedFeatures = () => {
		if ( ! props.features.locked?.length ) {
			return;
		}

		return (
			<span className="kit-content-list__locked-features">
				{ props.features.locked.join( ', ' ) + ', ' }
			</span>
		);
	},
	getOpenFeatures = () => props.features.open?.join( ', ' );

	return (
		<>
			{ getLockedFeatures() }
			{ getOpenFeatures() }
		</>
	);
}

TemplatesFeatures.propTypes = {
	features: PropTypes.object,
};
