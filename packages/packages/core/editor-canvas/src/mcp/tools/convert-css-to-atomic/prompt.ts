import { toolPrompts } from '@elementor/editor-mcp';

export const generatePrompt = () => {
	const prompt = toolPrompts( 'convert-css-to-atomic' );

	prompt.description( `
Convert CSS string to Elementor atomic widget styling format (PropValue).

# MANDATORY TOOL FOR COLOR PROPERTIES
**CRITICAL**: This tool is REQUIRED before using "configure-element" with any color property. The "configure-element" tool will REJECT color PropValues that were not created by this tool. You CANNOT manually construct PropValues - you MUST use this tool.

# When to use this tool
**ALWAYS** use this tool when you need to convert CSS color properties to Elementor atomic format for use with "configure-element" tool.
This tool only processes whitelisted properties. Unsupported properties are ignored.
This tool eliminates the need to fetch and interpret style schema resources.

# Input Format
CSS string: { "cssString": "color: red;" }

# Output Format
Returns PropValue objects ready to use in _styles configuration:
{
    "props": {
        "color": { "$$type": "color", "value": "#ff0000", "_convertedBy": "convert-css-to-atomic" }
    }
}

**IMPORTANT**: The returned PropValue includes a special "_convertedBy" marker. You MUST use the EXACT object returned by this tool - do not modify it or recreate it manually.

# Supported Properties
Currently supports: color property only
- Named colors: red, blue, transparent, etc.
- Hex colors: #ff0000, #f00
- RGB/RGBA: rgb(255,0,0), rgba(255,0,0,0.5)
- HSL/HSLA: hsl(0,100%,50%)
- CSS variables: var(--primary-color)

# Usage Workflow
1. Call this tool with: { "cssString": "color: YOUR_COLOR;" }
2. Extract: result.props.color
3. Use that EXACT object in configure-element's stylePropertiesToChange.color
4. Do NOT modify the object or recreate it manually

# Important
- Only whitelisted properties are processed
- Unsupported properties (e.g., font-size, margin) are silently ignored
- Do NOT use this tool for properties other than color
- The "_convertedBy" marker is REQUIRED - configure-element will reject PropValues without it
	` );

	prompt.parameter(
		'cssString',
		'CSS string containing only supported properties (currently: color). Unsupported properties will be ignored.'
	);

	return prompt.prompt();
};
