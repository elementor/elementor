import { getDeployedToPluginStep, getStepConfig } from 'elementor/modules/home/assets/js/site-builder/utils/planner-step-utils';

const PLANNER_STEPS = {
	INIT: 0,
	CHAT: 1,
	SITEMAP: 2,
	WIREFRAMES: 3,
	DEPLOYING: 4,
	DEPLOYED_TO_PLUGIN: 6,
};

const STEP_CONFIGS = {
	0: { title: 'Init title', hasInput: true },
	3: { title: 'Wireframes title', hasInput: true },
	6: { title: 'Deployed title', hasInput: true },
};

describe( 'planner-step-utils', () => {
	describe( 'getDeployedToPluginStep', () => {
		it( 'returns DEPLOYED_TO_PLUGIN when defined', () => {
			expect( getDeployedToPluginStep( PLANNER_STEPS ) ).toBe( 6 );
		} );

		it( 'defaults to 0 when DEPLOYED_TO_PLUGIN is missing', () => {
			expect( getDeployedToPluginStep( {} ) ).toBe( 0 );
			expect( getDeployedToPluginStep( undefined ) ).toBe( 0 );
		} );
	} );

	describe( 'getStepConfig', () => {
		it( 'returns the exact step config when present', () => {
			expect( getStepConfig( 3, STEP_CONFIGS, PLANNER_STEPS ) ).toEqual( STEP_CONFIGS[ 3 ] );
		} );

		it( 'falls back to deployed config when step is missing but >= DEPLOYED_TO_PLUGIN', () => {
			expect( getStepConfig( 7, STEP_CONFIGS, PLANNER_STEPS ) ).toEqual( STEP_CONFIGS[ 6 ] );
			expect( getStepConfig( 6, STEP_CONFIGS, PLANNER_STEPS ) ).toEqual( STEP_CONFIGS[ 6 ] );
		} );

		it( 'falls back to init config for missing mid-flow steps', () => {
			expect( getStepConfig( 2, STEP_CONFIGS, PLANNER_STEPS ) ).toEqual( STEP_CONFIGS[ 0 ] );
		} );

		it( 'returns init fallback for non-finite steps', () => {
			expect( getStepConfig( null, STEP_CONFIGS, PLANNER_STEPS ) ).toEqual( STEP_CONFIGS[ 0 ] );
			expect( getStepConfig( undefined, STEP_CONFIGS, PLANNER_STEPS ) ).toEqual( STEP_CONFIGS[ 0 ] );
			expect( getStepConfig( 'not-a-number', STEP_CONFIGS, PLANNER_STEPS ) ).toEqual( STEP_CONFIGS[ 0 ] );
		} );

		it( 'does not use deployed fallback when DEPLOYED_TO_PLUGIN is undefined', () => {
			const plannerStepsWithoutDeployed = { INIT: 0 };
			const configsWithoutDeployedStep = { 0: STEP_CONFIGS[ 0 ] };

			expect( getStepConfig( 7, configsWithoutDeployedStep, plannerStepsWithoutDeployed ) ).toEqual( STEP_CONFIGS[ 0 ] );
		} );

		it( 'uses init fallback when deployed config is missing', () => {
			const configsWithoutDeployed = {
				0: { title: 'Init only', hasInput: true },
			};

			expect( getStepConfig( 6, configsWithoutDeployed, PLANNER_STEPS ) ).toEqual( configsWithoutDeployed[ 0 ] );
		} );
	} );
} );
