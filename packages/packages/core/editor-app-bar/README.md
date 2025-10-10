# Editor App Bar

> [!WARNING]
> Please refrain from accessing or depending on functions and variables starting with double underscores, as they are subject to change without notice.
> Naming convention involving double underscores (`__`) as a prefix to indicate that a function or variable is meant for internal use and should not be accessed or relied upon by third-party developers.

## Usage

### Menus

There are 5 types of menus:

- `mainMenu` - Provides access to the main features and functionality of the application. Represented by an Elementor logo that changes to a hamburger.
- `toolsMenu` - A menu where the user can access various editing tools (e.g. "add widget", "structure", etc.) for manipulating the data or interface in some way. This
  section may contain a limited number of buttons for common tools, as well as a dropdown menu for accessing additional
  ones.
- `utilitiesMenu` - A menu where the user can access various utility features that are not directly related to the main
  functionality of the application. This may include options for accessing the finder, getting help, or accessing other miscellaneous features.
- `documentOptionsMenu` - A menu where the user can access various options for saving the document. This may include
  options for saving as draft or conditional options related to the document (e.g. "display conditions", etc.).
- `integrationsMenu` - A sub-menu inside the `mainMenu` where the user can access various options for integrating with other services. This may
  include options for connecting to a third-party service or accessing other miscellaneous features.

Each menu contains a list of items, each item can be:

- `Action` - A button that performs an action.
- `Link` - A link that navigates to a different page.
- `ToggleAction` - A button that toggles between two states (checked or unchecked).

Let's extend the `integrationsMenu` with multiple examples that will cover all the types of items:

#### Action

```tsx
import { integrationsMenu } from '@elementor/editor-app-bar';
import { PlusIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

integrationsMenu.registerAction( {
	id: 'example-action-id',
	props: {
		title: __( 'My Custom Action', 'elementor' ),
		icon: PlusIcon, // A react component that renders an SVG icon
		disabled: false, // Optional
		onClick: () => alert( 'Custom action triggered!' ), // Optional
	}
} );    
```

#### ToggleAction

```tsx
import { integrationsMenu } from '@elementor/editor-app-bar';
import { EyeIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

integrationsMenu.registerToggleAction( {
	name: 'my-custom-toggle',
	useProps: () => {
		const [ isSelected, setIsSelected ] = useState( false );

		return {
			title: __( 'My Custom Toggle', 'elementor' ),
			icon: EyeIcon,
			selected: isSelected, // Optional
			onClick: () => setIsSelected( ( prev ) => ! prev ), // Optional
			disabled: false, // Optional
		};
	},
} );
```

#### Link

```tsx
import { integrationsMenu } from '@elementor/editor-app-bar';
import { LinkIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

integrationsMenu.registerLink( {
	name: 'my-custom-link',
	props: {
		title: __( 'My Custom Link', 'elementor' ),
		icon: LinkIcon,
		href: 'https://elementor.com', // Optional
		target: '_blank', // Optional
	},
} );
```

---

> [!NOTE]
> You can use either `props` or `useProps` (depending on your need) for all the items types:
> - `props` - An object with the action props.
> - `useProps` - A React hook that returns the action props and lets you make the props reactive.

> [!NOTE]
> The `icon` property can be any React component that renders an SVG icon, it is recommended to use `SVGIcon` from `@elementor/ui`

### Custom Locations

TBD
