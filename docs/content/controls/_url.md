# URL
A url field with a `show_external` option that shows a button that allows the user to set it to open the link in a new tab.

*Returns:* Array
```php
[
    'url' => (string),
    'is_external' => (bool),
    'nofollow' => (bool),
]
```

## Example

```php
$this->add_control(
  'website_link',
  [
     'label' => __( 'Website URL', 'your-plugin' ),
     'type' => Controls_Manager::URL,
     'default' => [
        'url' => 'http://',
        'is_external' => '',
     ],
     'show_external' => true, // Show the 'open in new tab' button.
  ]
);
```

## Usage

**PHP** *(Under `render()` method)*
```php
$website_link = $this->get_settings( 'website_link' );
$url = $website_link['url'];
$target = $website_link['is_external'] ? 'target="_blank"' : '';

echo '<a href="' . $url . '" ' . $target .'>Visit Website</a>';
```

**JS** *(Under `_content_template()` method)*
```html
<# // JavaScript code 
var target = settings.website_link.is_external ? 'target="_blank"' : '';
#>
<a href="{{ settings.website_link.url }}" {{ target }}>Visit Website</a>
```

## Arguments

Argument           | Required   | Type         | Default                      | Description
------------       | :--------: | :------:     | :--------------------------: | ---------------------------------------------
`label`            | yes        | *`string`*   |                              | The label of the control - displayed next to it
`type`             | yes        | *`string`*   | `Controls_Manager::TEXTAREA` | The type of the control
`default`          | no         | *`array`*    |                              | The default value of the control
`show_external`    | no         | *`bool`*     | `true`                       | Shows a toggle button that allows user to set it to open the link in a new tab
`description`      | no         | *`string`*   |                              | A description text to display below the control
`separator`        | no         | *`string`*   | `default`                    | Set the position of the control separator. `default` means that the separator will be posited depending on the control type. `before` or `after` will force the separator position before/after the control. `none` will hide the separator
