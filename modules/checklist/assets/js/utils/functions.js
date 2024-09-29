import { STEP, STEPS_ROUTE, USER_PROGRESS_ROUTE } from './consts';

const { IS_MARKED_COMPLETED, IS_ABSOLUTE_COMPLETED, IS_IMMUTABLE_COMPLETED, PROMOTION_DATA } = STEP;

export function isStepChecked( step ) {
	return ! step[ PROMOTION_DATA ] && ( step[ IS_MARKED_COMPLETED ] || step[ IS_ABSOLUTE_COMPLETED ] || step[ IS_IMMUTABLE_COMPLETED ] );
}

export function toggleChecklistPopup() {
	$e.run( 'checklist/toggle-popup' );
}

export async function fetchSteps() {
	const response = await $e.data.get( STEPS_ROUTE, {}, { refresh: true } );

	return response?.data?.data || null;
}

export async function fetchUserProgress() {
	const response = await $e.data.get( USER_PROGRESS_ROUTE, {}, { refresh: true } );

	return response?.data?.data || null;
}

export async function updateStep( id, data ) {
	return await $e.data.update( STEPS_ROUTE, { id, ...data }, { id } );
}

export async function updateUserProgress( data ) {
	return await $e.data.update( USER_PROGRESS_ROUTE, data );
}

export function getAndUpdateStep( id, step, key, value ) {
	if ( step.config.id !== id ) {
		return step;
	}

	return { ...step, [ key ]: value };
}
