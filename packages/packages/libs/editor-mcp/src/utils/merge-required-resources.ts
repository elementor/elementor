export type ResourceList = {
	uri: string;
	description: string;
}[];

export const mergeRequiredResources = (
	toolResources: ResourceList | undefined,
	serverDocsUri: string | undefined
): ResourceList | undefined => {
	if ( ! serverDocsUri ) {
		return toolResources;
	}
	if ( toolResources?.some( ( r ) => r.uri === serverDocsUri ) ) {
		return toolResources;
	}
	return [ ...( toolResources ?? [] ), { uri: serverDocsUri, description: 'Server docs' } ];
};
