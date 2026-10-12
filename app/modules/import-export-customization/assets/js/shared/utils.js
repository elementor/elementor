export function isExperimentActive( experimentName ) {
	const common = typeof globalThis !== 'undefined' ? globalThis.elementorCommon : undefined;

	return !! common?.config?.experimentalFeatures?.[ experimentName ];
}

export function isAtomicElementsFeatureActive() {
	return isExperimentActive( 'e_atomic_elements' );
}

export function isClassesFeatureActive() {
	return isAtomicElementsFeatureActive();
}

export function isVariablesFeatureActive() {
	return isAtomicElementsFeatureActive();
}

export function isDefaultStylesFeatureActive() {
	return isAtomicElementsFeatureActive();
}
