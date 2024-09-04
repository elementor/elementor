export function isConsideredDone( step ) {
	return ! step.config.is_locked && ( step.is_absolute_completed || step.is_marked_completed || step.is_immutable_completed );
}
