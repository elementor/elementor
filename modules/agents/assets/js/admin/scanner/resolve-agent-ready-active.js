export const resolveExperimentFlag = ( value ) => true === value || 1 === value || '1' === value;

export const resolveAgentReadyActive = ( propValue ) => {
	if ( resolveExperimentFlag( propValue ) ) {
		return true;
	}

	const config = window.elementorAgentsReadyConfig || {};

	return resolveExperimentFlag( config.isExperimentActive )
		|| resolveExperimentFlag( config.scanner?.isExperimentActive );
};
