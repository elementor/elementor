# Javascript Hooks

## Frontend Filters

### `frontend/handlers/menu_anchor/scroll_top_distance`
Applied to the Menu Anchor widget, set a custom top distance

#### Arguments

Argument     | Type        | Description
------------ | :---------: | ---------------------------------------------
`scrollTop`  | *`integer`* | The default scrollTop. It takes only the WordPress Admin Bar in account.

#### Example

```javascript
jQuery( function( $ ) {
	// Add space for Elementor Menu Anchor link
	if ( window.elementorFrontend ) {
		elementorFrontend.hooks.addFilter( 'frontend/handlers/menu_anchor/scroll_top_distance', function( scrollTop ) {
			return scrollTop - 30;
		} );
	}
} );
```

```php
add_action( 'wp_footer', function() {
	if ( ! defined( 'ELEMENTOR_VERSION' ) ) {
		return;
	}
	?>
	<script>
		jQuery( function( $ ) {
			// Add space for Elementor Menu Anchor link
			if ( window.elementorFrontend ) {
				elementorFrontend.hooks.addFilter( 'frontend/handlers/menu_anchor/scroll_top_distance', function( scrollTop ) {
					return scrollTop - 30;
				} );
			}
		} );
	</script>
	<?php
} );
```

## Frontend Actions

### `init`
Elementor frontend is loaded

#### Arguments
None

#### Example

 ```javascript
elementorFrontend.hooks.addAction( 'init', function() {
  // Do something that is based on the elementorFrontend object.
} );
 ```

### `frontend/element_ready/global`
Runs on every element (includes sections and columns) when it's ready

#### Arguments

Argument    | Type                                        | Description
----------- | :------:                                    | ---------------------------------------------
`$scope`    | *`The current element wrapped with jQuery`* |
`$`         | *`The jQuery instance`*                     |

#### Example

```javascript
elementorFrontend.hooks.addAction( 'frontend/element_ready/global', function( $scope ) {
	if ( $scope.data( 'shake' ) ){
		$scope.shake();
	}
} );
```

### `frontend/element_ready/widget`
Runs on every widget when it's ready.

#### Arguments

Argument    | Type                                        | Description
----------- | :------:                                    | ---------------------------------------------
`$scope`    | *`The current element wrapped with jQuery`* |
`$`         | *`The jQuery instance`*                     |

#### Example

```javascript
elementorFrontend.hooks.addAction( 'frontend/element_ready/widget', function( $scope ) {
	if ( $scope.data( 'shake' ) ){
		$scope.shake();
	}
} );
```

### `frontend/element_ready/{elementType.skinName}`
Runs on a specific element type and it's skin when it's ready.

#### Arguments

Argument    | Type                                        | Description
----------- | :------:                                    | ---------------------------------------------
`$scope`    | *`The current element wrapped with jQuery`* |
`$`         | *`The jQuery instance`*                     |

#### Example

```javascript
// For a widget without a skin (skin = default)
elementorFrontend.hooks.addAction( 'frontend/element_ready/image.default', function( $scope ) {
	if ( $scope.find( 'a' ) ){
		$scope.find( 'a' ).lightbox();
	}
} );

// For a widget with a skin named `satellite`
elementorFrontend.hooks.addAction( 'frontend/element_ready/google-maps.satellite', function( $scope ) {
	var $iframe = $scope.find( 'iframe' ),
		iframeUrl = $iframe.attr( 'src' );

		$iframe.attr( 'src', iframeUrl + '&maptype=satellite' );
	}
} );
```

## Editor Hooks

### `panel/open_editor/{elementType}`
Applied when the settings panel is opened to edit an element.

#### Arguments

Argument     | Type       | Description
------------ | :------:   | ----------------------
`panel`      | *`object`* | The Panel object
`model`      | *`object`* | The Backbone model instance
`view`       | *`object`* | The Backbone view instance

#### Example

 ```javascript
 elementor.hooks.addAction( 'panel/open_editor/widget', function( panel, model, view ) {
 	if ( 'section' !== model.elType && 'column' !== model.elType ) {
 		return;
 	}
	var $element = view.$el.find( '.elementor-selector' );

	if ( $element.length ) {
		$element.click( function() {
		  alert( 'Some Message' );
		} );
	}
 } );
```

### `panel/open_editor/{elementType}/{elementName}`
Applied when the settings panel is opened to edit a specific element name.

#### Arguments

Argument     | Type       | Description
------------ | :------:   | ----------------------
`panel`      | *`object`* | The Panel object
`model`      | *`object`* | The Backbone model instance
`view`       | *`object`* | The Backbone view instance

#### Example

 ```javascript
elementor.hooks.addAction( 'panel/open_editor/widget/slider', function( panel, model, view ) {
	var $element = view.$el.find( '.elementor-selector' );

	if ( $element.length ) {
		$element.click( function() {
		  alert( 'Some Message' );
		} );
	}
} );
```
