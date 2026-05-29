export const PlannerSteps = {
	INIT: 0,
	CHAT: 1,
	SITEMAP: 2,
	WIREFRAMES: 3,
	DEPLOYING: 4,
	DEPLOYED_TO_HOSTING: 5,
	DEPLOYED_TO_PLUGIN: 6,
} as const;

export function mapPlannerStepToPage( step: number ): string {
	switch ( step ) {
		case PlannerSteps.INIT:
		case PlannerSteps.CHAT:
			return 'chat';
		case PlannerSteps.SITEMAP:
			return 'sitemap';
		case PlannerSteps.WIREFRAMES:
			return 'wireframe';
		case PlannerSteps.DEPLOYING:
			return 'creation-status';
		case PlannerSteps.DEPLOYED_TO_HOSTING:
		case PlannerSteps.DEPLOYED_TO_PLUGIN:
			return 'wireframe';
		default:
			return 'chat';
	}
}
