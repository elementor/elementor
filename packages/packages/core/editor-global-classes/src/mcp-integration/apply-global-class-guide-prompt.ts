import { toolPrompts } from '@elementor/editor-mcp';

export const APPLY_GLOBAL_CLASS_GUIDE_URI = 'elementor://global-classes/tools/apply-global-class-guide';

export const generateApplyGlobalClassGuidePrompt = () => {
	const prompt = toolPrompts( 'apply-global-class' );

	prompt.description( 'Apply a global class to an element, enabling consistent styling through your design system.' );

	prompt.instruction(
		`## When to use this tool:
**ALWAYS use this IMMEDIATELY AFTER building compositions** to apply the global classes you created beforehand:
- After using "build-compositions" tool, apply semantic classes to the created elements
- When applying consistent typography styles (heading-primary, text-body, etc.)
- When applying theme colors or brand styles (bg-brand, button-cta, etc.)
- When ensuring spacing consistency (spacing-section-large, etc.)

**DO NOT use this tool** for:
- Elements that don't share styles with other elements (use inline styles instead)
- Layout-specific properties (those should remain inline in stylesConfig)`
	);

	prompt.instruction(
		`## Prerequisites:
- **REQUIRED**: Get the list of available global classes from 'elementor://global-classes' resource
- **REQUIRED**: Get element IDs from the composition XML returned by "build-compositions" tool
- Ensure you have the most up-to-date list of classes applied to the element to avoid duplicates
- Make sure you have the correct class ID that you want to apply`
	);

	prompt.instruction(
		`## Best Practices:
1. Apply multiple classes to a single element if needed (typography + color + spacing)
2. After applying, the tool will remind you to remove duplicate inline styles from elementConfig
3. Classes should describe purpose, not implementation (e.g., "heading-primary" not "big-red-text")`
	);

	return prompt.prompt();
};
