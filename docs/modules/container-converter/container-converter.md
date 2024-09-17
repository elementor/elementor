# Container Converter

## Product Knowledge Base:

- [Convert Existing Sections To Containers](https://elementor.com/help/convert-existing-sections-to-containers/)

## Technical Description:

This is a migration tool for Elementor that helps users migrating from the older Sections/Columns layouts to the new and
updated Container layouts.

It's a standalone module that injects conversion buttons to each Section & Page, and will (or at least should) be
removed in the future when the Container element will be a stable feature and become the default building block.

It registers 2 commands:

- `$e.run( 'container-converter/convert', { container } )` - Converts a single "convertible" element and its descendants to a Containers.


- `$e.run( 'container-converter/convert-all' )` - Converts the whole page to Containers.

## How It Works:

The PHP side of things is fairly easy. It just handles injecting the conversion buttons and loading the assets.

On the frontend from the other hand (pun intended), things get more complicated.

We can generally divide that into 2 parts:

1. **Migrator** - Handles the actual migration logic using a simple API.
2. **Maps** - Objects that represents how element settings should be migrated (e.g. renaming, responsive controls, etc.).

The usage is fairly easy. First, create a mapping function under the `assets/js/editor/maps` directory. It receives an element model and returns a mapping object:
	
```js
import { getDeviceKey, responsive } from './utils';

export const myMap = ( model ) => ( {
	// Setting removal:
	align: null,
	
	// Simple renaming:
	align: 'new_align',
	
	// Advanced renaming using callback:
	align: ( {
		key, // Old setting key.
		value, // Old setting value.
		settings, // The whole element settings object.
	} ) => {
		if ( 'center' === value && '' !== settings.text && model.isInner ) {
			return [ 'new_align', 'left' ];
		}
		
		return [ 'new_align', value ]; // Should always return a key-value tuple.
	},

	// Simple responsive renaming:
	...responsive( 'align', 'new_align' ),

	// Advanced responsive renaming using callback:
	...responsive( 'space_between_widgets', ( {
		key, // Old default (desktop) setting key (e.g. 'align').
		value, // Old default (desktop) setting value (e.g. 'left').
		deviceKey, // Current device key (e.g. 'align_mobile').
		deviceValue, // Current device value (e.g. 'center').
		breakpoint, // Current breakpoint name (returns an empty string for desktop, and device name for others).
		settings, // The whole element settings object.
	} ) => {
		// Get the device key by control name & breakpoint (e.g. 'flex_gap', 'flex_gap_mobile').
		const newKey = getDeviceKey( 'flex_gap', breakpoint );
		
		const newValue = {
			size: deviceValue,
			unit: 'px',
		};
		
		return [ newKey, newValue ];
	} ),
} );
```

Then, add this to the configuration object of the Migrator. It's a static object that defines which element types can
be converted and what's their mappings. It also supports a normalization callback (not required):  
```js
import { myMap } from './maps/my-map';
		
class Migrator {
	// ...
	// Other code
	// ...
	
	static config = {
		// ...
		// Other elements
		// ...

		column: {
			legacyControlsMapping: myMap,
			normalizeSettings: ( settings ) => ( {
				...settings, // The settings object after the migration.
				content_width: 'full',
			} ),
		},
	};
};
```

And that's it! The commands will take care of the rest to make sure that everything gets converted properly.

## Attention Needed / Known Issues:

- The migration normalization process should be handled inside the Migrator itself instead of inside the commands.
  We need to fix that in the future.


- Make sure to add integration tests to any new or modified mapping configuration.
___

## See Also:

- [The Container element](../../includes/elements/container.md)
