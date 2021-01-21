import './templates-features.scss';

export default function TemplatesFeatures( props ) {
	const getLockedFeatures = () => {
		if ( ! props.features.locked?.length ) {
			return;
		}

		return (
			<span className={ props.isLocked ? 'e-app-export-templates-features__locked' : '' }>
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
	isLocked: PropTypes.bool,
};
