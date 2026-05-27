import apiFetch from '@wordpress/api-fetch';

const VARIABLES_LIST_PATH = '/elementor/v1/variables/list';
const GLOBAL_CLASSES_PATH = '/elementor/v1/global-classes';

type VariablesListResponse = {
	success?: boolean;
	data?: {
		total?: number;
		variables?: unknown;
	};
};

type GlobalClassesListResponse = {
	data?: unknown[];
};

export type DesignSystemCheckResult = {
	variables: number;
	classes: number;
};

async function countVariables(): Promise< number > {
	try {
		const res = ( await apiFetch( { path: VARIABLES_LIST_PATH } ) ) as VariablesListResponse;
		const total = res?.data?.total;
		if ( typeof total === 'number' ) {
			return total;
		}
		const variables = res?.data?.variables;
		if ( Array.isArray( variables ) ) {
			return variables.length;
		}
		if ( variables && typeof variables === 'object' ) {
			return Object.keys( variables as Record< string, unknown > ).length;
		}
		return 0;
	} catch {
		return 0;
	}
}

async function countGlobalClasses(): Promise< number > {
	try {
		const res = ( await apiFetch( { path: GLOBAL_CLASSES_PATH } ) ) as GlobalClassesListResponse;
		return Array.isArray( res?.data ) ? res.data.length : 0;
	} catch {
		return 0;
	}
}

export async function checkDesignSystem(): Promise< DesignSystemCheckResult > {
	const [ variables, classes ] = await Promise.all( [ countVariables(), countGlobalClasses() ] );
	return { variables, classes };
}
