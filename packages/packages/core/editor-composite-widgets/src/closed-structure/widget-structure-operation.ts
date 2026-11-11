let runningOperations = 0;

export function runWidgetStructureOperation< TResult >( operation: () => TResult ): TResult {
	runningOperations++;

	try {
		return operation();
	} finally {
		runningOperations--;
	}
}

export function isWidgetStructureOperationRunning(): boolean {
	return runningOperations > 0;
}
