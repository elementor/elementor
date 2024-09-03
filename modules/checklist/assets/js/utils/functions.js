export function isStepChecked( step ) {
	return ! step.is_locked && ( step.is_marked_done || step.is_absolute_done || step.is_immutable_done );
}

export function toggleChecklistPopup() {
	$e.run( 'checklist/toggle-popup' );
}
