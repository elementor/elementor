export type ResourceList = {
	uri: string;
	description: string;
}[];

export const mergeRequiredResources = (
	toolResources: ResourceList | undefined,
	serverDescriptionUri: string | undefined
): ResourceList | undefined => {
	if ( ! serverDescriptionUri ) {
		return toolResources;
	}
	if ( toolResources?.some( ( r ) => r.uri === serverDescriptionUri ) ) {
		return toolResources;
	}
	return [ ...( toolResources ?? [] ), { uri: serverDescriptionUri, description: 'Server description' } ];
};
