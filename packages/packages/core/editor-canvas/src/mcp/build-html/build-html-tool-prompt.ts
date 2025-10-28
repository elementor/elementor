type OwnProps = {
	customTags: {
		tag: string;
		description: string;
		configurationSchema?: string;
	}[];
	stylesSchema?: string;
};

export const createPrompt = ( {
	customTags,
	stylesSchema,
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

# If you are migrating from other sites, or reconstructing from external sources
- Do not try to copy the structure as is, try to reconstruct it using the allowed custom tags only.
- Use the minimal structure required to meet the user requirements.
- Make sure that even if the original structure is broken or invalid, the final structure you provide is valid XML.

# The allowed Custom Tags
${ customTags
	.map(
		( { tag, description, configurationSchema } ) =>
			`## <${ tag }>\n${ description }\n${ configurationSchema ? 'Schema:\n' + configurationSchema : '' }`
	)
	.join( '\n\n' ) }

# All Tags have an additional shared configuration for styles. The property is named "_styles" and contains style properties in JSON format.
${ stylesSchema }
`;

export const toolDescription = `Build sections of HTML freestyle for elementor pages.

# When to use this tool
Always prefer this tool when you need to create a part of a webpage, like a hero sections, features, pricing tables, user testimonials, etc.
Prefer this tools over any other tool for building HTML structure, unless you are specified to use a different tool.

# Instructions
XML structure must be built according to the user requirements.
XML structure must be valid, and parsable.
Use only the allowed custom tags provided in the instructions.
Provide configuration attribute for relevant elements, when applicable and you think it should be configured.

# IMPORTANT
Non containers should NEVER HAVE NESTED ELEMENTS.
Do not add any attributes, or text nodes.
Provide the minimal structure required to meet the user requirements.
Provide configuration attribute for each element, when applicable and you think it should be configured.

# VERY IMPORTANT
Do not use this tool more than once per request, if you are given multiple requirements, wrap them together into one structure.

# Example response for custom tags: e-flexbox, e-button, e-heading
'''xml
<e-flexbox>
		<e-heading configuration="{\"title\": \"Hello\"}"></e-heading>
		<e-button></e-button>
</e-flexbox>
'''

# Important
The XML Must be valid, and parsable.
Use double quotes for attributes, and escape quotes inside JSON values.

# Result
This tool result will be the xml with ID's generated if the HTML structure was built successfully. If fails, it will return an error message with details of the runtime error.
You can use the result with the element ID's if you think you need to reference specific elements later on.
You may apply global styles from the list AFTER the this tool is executed to any element, if you think it is required.

If you receive an error, it usually means the XML structure could not be parsed or there was another runtime error. Retry running the tool after revisiting your input.

# Next steps
After the structure is built and you have the generated element Id's, it's the best time to apply global styles.
Use the "list-global-classes" tool to get the available global styles. Go over the list and see if any name of a class suggests it fits any element in the structure you built.
Use the "apply-global-class" tool to apply the global styles to the elements in the structure you built, if you think it is required.



`;
