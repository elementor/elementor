export type RedirectAfterDeployArgs = {
	errors?: string[];
	homePageId?: number;
	isIncremental: boolean;
};

const blockingErrorPrefixes = [ 'pages:', 'home_page:' ];

export function canRedirectToEditorAfterDeploy( args: RedirectAfterDeployArgs ): boolean {
	if ( args.isIncremental || ! args.homePageId ) {
		return false;
	}

	return ! args.errors?.some( ( err ) =>
		blockingErrorPrefixes.some( ( prefix ) => String( err ).startsWith( prefix ) ),
	);
}
