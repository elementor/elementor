export function requireConfirmationMessage( confirmationMessage: string | undefined, context: string ): void {
	if ( ! confirmationMessage || confirmationMessage.trim() === '' ) {
		throw new Error(
			`LLM Instructions: ${ context } changes require user confirmation. You MUST provide a confirmationMessage parameter explaining what will be changed and its impact.`
		);
	}
}
