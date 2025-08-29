1. Use canonical APIs: editor.addElement({ elType }, parentId), editor.addWidget({ widgetType, container }).
2. When you need to communicate with your widget, use it's id: 
    const container = await editor.addElement( { elType: 'container' }, 'document' );
	const buttonId = await editor.addWidget( { widgetType: 'e-button', container } );
	const linkUrl = 'https://example.com';
    await editor.openV2PanelTab( 'general' );
	await page.locator( '[aria-label="Toggle link"]' ).click();
	await editor.v4Panel.fillField( 1, linkUrl );
	const button = await editor.getWidget( buttonId );
3. Instead of writing: 
    - await editor.page.getByRole( 'tab', { name: 'Style' } ).click(); or await editor.page.getByRole( 'button', { name: 'Size' } ).click();
    Look for existing methods: 
    - await editor.openV2PanelTab( 'style' );
	- await editor.openV2Section( 'size' );
4. Elementor has two types of widgets
    - If you are working with 'atomic' aka 'v4' aka 'v2' widgets, you must have experiments active: e_opt_in_v4_page: 'active', e_atomic_elements: 'active', and you choose from 'Atomic Elements' section. In this case, you have 'Style' tab and all styling options on this tab. 
    - If you are working with 'old' widgets from 'Layout', 'Basic', 'Pro', 'General', 'Link in Bio', 'Site', 'Single' sections, you have 'Style' and 'Advanced' tabs for styling.
5. Code Quality Rules
- NEVER use hardcoded values without named constants
- Use existing enums: viewportSize.tablet, viewportSize.mobile  
- Remove all console.log and comments from final tests
- No try/catch blocks around control interactions
- Define control values as constants: const BACKGROUND_COLORS = ['#FF5722', '#2196F3'];
6. Helper Function Policy  
- Check tests/playwright/pages/editor-page.ts for existing helpers first
- Add new narrow-purpose helpers only when needed
- Avoid modifying existing helpers unless DOM changed or verified flakiness
- New helpers available:
  - editor.setBackgroundColorControlValue() - with visibility check  
  - editor.publishAndViewPage() - consistent frontend navigation
7. Testing Strategy
- Default: 
- Add  test cases for comprehensive coverage using business logic 
- Test conditional controls progressively
- Include responsive testing (desktop/tablet/mobile) automatically 