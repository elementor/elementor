/**
 * @param {string} experimentName - Experiment feature name (e.g. `e_opt_in_v4`).
 *
 * @return {boolean} Whether the experiment is active in the editor.
 */
export function isExperimentActive( experimentName ) {
	return !! elementorCommon?.config?.experimentalFeatures?.[ experimentName ];
}
