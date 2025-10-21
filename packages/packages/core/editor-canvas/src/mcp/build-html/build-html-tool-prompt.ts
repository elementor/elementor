type OwnProps = {
	customTags: {
		tag: string;
		description: string;
		configurationSchema?: string;
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
10. Provide for every element a "configuration" attribute with JSON value of the values to be updated. Use the elements-configuration-schema provided to understand what properties are available for each element. The configuration will be reflected in the creation of the elements.

# The allowed Custom Tags
${ customTags
	.map(
		( { tag, description, configurationSchema } ) =>
			`## <${ tag }>\n${ description }\n${ configurationSchema ? 'Schema:\n' + configurationSchema : '' }`
	)
	.join( '\n\n' ) }
`;

export const toolDescription = `Build sections of HTML freestyle for elementor pages.

# When to use this tool
Always prefer this tool when you need to create a part of a webpage, like a hero sections, features, pricing tables, user testimonials, etc.
Prefer this tools over any other tool for building HTML structure, unless you are specified to use a different tool.

# IMPORTANT
Non containers should NEVER HAVE NESTED ELEMENTS.
Do not add any attributes, or text nodes.

# VERY IMPORTANT
Do not use this tool more than once per request, if you are given multiple requirements, wrap them together into one structure.

# Example response for custom tags: e-flexbox, e-button, e-heading
'''xml
<e-flexbox>
		<e-heading configuration="{\"title\": \"Hello\"}"></e-heading>
		<e-button></e-button>
</e-flexbox>
'''

# Result
This tool result will be the generated XML provided by you, with id attributes added to each elements.
Expect the response to match you structure, with ID's added.

# IMPORTANT
After this tool usage, iterate over each element with an ID in the XML structure, and use the 'configure-element' tool to configure each element to match the user requirements.
Do NOT change the structure by yourself, only use the 'configure-element' tool.

It is MANDATORY to use the 'configure-element' tool after this tool usage for each of the created elements.


`;
