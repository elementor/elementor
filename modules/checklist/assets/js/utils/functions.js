import { STEP } from './consts';

const { IS_MARKED_COMPLETED, IS_ABSOLUTE_COMPLETED, IS_IMMUTABLE_COMPLETED, IS_LOCKED } = STEP;

export function isStepChecked( step ) {
	return ! step[ IS_LOCKED ] && ( step[ IS_MARKED_COMPLETED ] || step[ IS_ABSOLUTE_COMPLETED ] || step[ IS_IMMUTABLE_COMPLETED ] );
}

export function toggleChecklistPopup() {
	$e.run( 'checklist/toggle-popup' );
}

export function getAndUpdateStep( id, step, key, value ) {
	if ( step.config.id !== id ) {
		return step;
	}

	return { ...step, [ key ]: value };
}
