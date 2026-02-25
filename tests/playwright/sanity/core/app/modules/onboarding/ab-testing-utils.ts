const AB_TESTING_URL = 'https://assets.elementor.com/ab-testing/v1/ab-testing.json';

const EXPERIMENTS_TO_SKIP = [];

type AbTestingResponse = {
	'ab-testing': Array<{
		coreOnboarding?: Record<string, boolean>;
	}>;
};

let cachedResult: boolean | null = null;

async function fetchAbTestingData(): Promise<AbTestingResponse | null> {
	try {
		const response = await fetch( AB_TESTING_URL );
		if ( ! response.ok ) {
			return null;
		}
		return await response.json();
	} catch {
		return null;
	}
}

export async function hasActiveOnboardingExperiment(): Promise<boolean> {
	if ( cachedResult !== null ) {
		return cachedResult;
	}

	const data = await fetchAbTestingData();
	if ( ! data || ! data[ 'ab-testing' ] || 0 === data[ 'ab-testing' ].length ) {
		cachedResult = false;
		return false;
	}

	const coreOnboarding = data[ 'ab-testing' ][ 0 ]?.coreOnboarding;
	if ( ! coreOnboarding ) {
		cachedResult = false;
		return false;
	}

	cachedResult = EXPERIMENTS_TO_SKIP.some( ( experimentName ) => true === coreOnboarding[ experimentName ] );
	return cachedResult;
}
