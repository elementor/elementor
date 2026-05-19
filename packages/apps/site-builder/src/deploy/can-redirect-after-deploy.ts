export type RedirectAfterDeployArgs = {
	errors?: string[];
	homePageId?: number;
	isIncremental: boolean;
	pageIdMap?: Record< string, number >;
	pages?: { id: string }[];
};

const blockingErrorPrefixes = [ 'pages:', 'home_page:' ];

const hasBlockingDeployErrors = ( errors?: string[] ): boolean =>
	errors?.some( ( err ) => blockingErrorPrefixes.some( ( prefix ) => String( err ).startsWith( prefix ) ) ) ?? false;

export function resolveEditorRedirectPageId( args: RedirectAfterDeployArgs ): number | null {
	if ( hasBlockingDeployErrors( args.errors ) ) {
		return null;
	}

	if ( args.isIncremental ) {
		const lastPlannerPage = args.pages?.[ args.pages.length - 1 ];
		if ( ! lastPlannerPage || ! args.pageIdMap ) {
			return null;
		}

		return args.pageIdMap[ lastPlannerPage.id ] ?? null;
	}

	return args.homePageId ?? null;
}

export function canRedirectToEditorAfterDeploy( args: RedirectAfterDeployArgs ): boolean {
	return resolveEditorRedirectPageId( args ) !== null;
}
