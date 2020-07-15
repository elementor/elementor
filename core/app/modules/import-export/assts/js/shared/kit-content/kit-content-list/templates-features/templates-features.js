export default function TemplatesFeatures( props ) {
	const getLockedFeatures = () => {
		if ( ! props.features.locked?.length ) {
			return;
		}

		return (
			<span className="kit-content-list__locked-features">
				{ props.features.locked.join( ', ' ) }
			</span>
		);
	},
	getOpenFeatures = () => {
		let openFeatures = props.features.open?.join( ', ' );

		if ( openFeatures && getLockedFeatures() ) {
			openFeatures += ', ';
		}

		return openFeatures;
	};

	return (
		<>
			{ getOpenFeatures() }
			{ getLockedFeatures() }
		</>
	);
}

TemplatesFeatures.propTypes = {
	features: PropTypes.object,
};
