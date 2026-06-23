export const getDeployedToPluginStep = ( plannerSteps ) => plannerSteps?.DEPLOYED_TO_PLUGIN ?? 0;

export const getStepConfig = ( step, stepConfigs, plannerSteps ) => {
	const normalizedStep = Number( step );
	const configs = stepConfigs ?? {};
	const initStep = plannerSteps?.INIT ?? 0;
	const deployedToPlugin = plannerSteps?.DEPLOYED_TO_PLUGIN;
	const initFallback = configs[ initStep ] ?? {};
	const deployedFallback = Number.isFinite( deployedToPlugin )
		? ( configs[ deployedToPlugin ] ?? initFallback )
		: initFallback;

	if ( ! Number.isFinite( normalizedStep ) ) {
		return initFallback;
	}

	if ( configs[ normalizedStep ] ) {
		return configs[ normalizedStep ];
	}

	if ( Number.isFinite( deployedToPlugin ) && normalizedStep >= deployedToPlugin ) {
		return deployedFallback;
	}

	return initFallback;
};
