type OwnProps = {
	customTags: {
		tag: string;
		description: string;
	}[];
};

export const createPrompt = ( {
	customTags,
}: OwnProps ) => `As an expert in website building, you are required to do the following:

# Instructions
1. Generate a snippet describing the user requirements.
2. If you have missing text, use placeholder generic text.
3. Deliver the result without any styling, classes, id's, css or so.
4. You are required to deliver only the structure.
5. NEVER add any explanations or extra text, provide ONLY the final result.
6. You must use custom HTML tags that will be provided.
7. You can use a custom tag more than once.
8. You do not have to use all the custom tags, use the minimum required to meet the requirements.
9. The result must be valid XML.

# The allowed Custom Tags
${ customTags.map( ( { tag, description } ) => `## <${ tag }>\n${ description }` ).join( '\n\n' ) }
`;
