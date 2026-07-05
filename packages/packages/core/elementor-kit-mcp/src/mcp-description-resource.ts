import { type McpServer } from '@elementor/editor-mcp';

export const KIT_DESCRIPTION_URI = 'elementor://kit/server-description';

export const KIT_DESCRIPTION = `## Elementor Kit Settings Management

### Capabilities:
**Global Design System:**
- Create, update, name, and delete global colors (both system and custom)
- Create, update, name, and delete global fonts (both system and custom)

**Site Identity:**
- Insert site logo
- Set site favicon
- Update site name
- Modify site description

### Limitations:
**Theme Style Settings:**
- Cannot set or update Elementor Theme Style settings including typography, buttons, images, form fields, Hello Theme header, or Hello Theme footer that affect the entire website appearance

**Site-Wide Settings:**
- Cannot set site-wide background (color or image)
- Cannot configure mobile browser background
- Cannot modify global layout settings such as content width, container padding, and widget gaps (the default space between widgets)

**Note**: Angie can adjust all of these layout properties at the container or page level - just not site-wide.`;

export function addKitDescriptionResource( server: McpServer ) {
	server.registerResource(
		'elementor-kit-server-description',
		KIT_DESCRIPTION_URI,
		{
			title: 'Elementor Kit Server Description',
			description: 'Elementor Kit capabilities and limitations',
			mimeType: 'text/plain',
		},
		async ( uri ) => ( {
			contents: [ { uri: uri.href, mimeType: 'text/plain', text: KIT_DESCRIPTION } ],
		} )
	);
}
