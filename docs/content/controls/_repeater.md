# Repeater
A base control for creating repeater control. Repeater control allows you to build repeatable blocks of fields. You can create, for example, a set of fields that will contain a title and a WYSIWYG text - the user will then be able to add "rows", and each row will contain a title and a text. The data can be wrapper in custom HTML tags, designed using CSS, and interact using JS or external libraries.

## Example

```php
$this->add_control(
	'list',
	[
		'label' => __( 'Repeater List', 'plugin-domain' ),
		'type' => Controls_Manager::REPEATER,
		'default' => [
			[
				'list_title' => __( 'Title #1', 'plugin-domain' ),
				'list_content' => __( 'Item content. Click the edit button to change this text.', 'plugin-domain' ),
			],
			[
				'list_title' => __( 'Title #2', 'plugin-domain' ),
				'list_content' => __( 'Item content. Click the edit button to change this text.', 'plugin-domain' ),
			],
		],
		'fields' => [
			[
				'name' => 'list_title',
				'label' => __( 'Title', 'plugin-domain' ),
				'type' => Controls_Manager::TEXT,
				'default' => __( 'List Title' , 'plugin-domain' ),
				'label_block' => true,
			],
			[
				'name' => 'list_content',
				'label' => __( 'Content', 'plugin-domain' ),
				'type' => Controls_Manager::WYSIWYG,
				'default' => __( 'List Content' , 'plugin-domain' ),
				'show_label' => false,
			],
		],
		'title_field' => '{{{ list_title }}}',
	]
);
```

### Alternative Example

Alternatively, you could use the `Repeater` class, which provides a better readability and maintainability for repeaters with many fields:

```php
$repeater = new Repeater();

$repeater->add_control( 'list_title', [
	'label' => __( 'Title', 'plugin-domain' ),
	'type' => Controls_Manager::TEXT,
	'default' => __( 'List Title' , 'plugin-domain' ),
	'label_block' => true,
]);

$repeater->add_control( 'list_content', [
	'name' => 'list_content',
	'label' => __( 'Content', 'plugin-domain' ),
	'type' => Controls_Manager::WYSIWYG,
	'default' => __( 'List Content' , 'plugin-domain' ),
	'show_label' => false,
]);

$this->add_control(
	'list',
	[
		'label' => __( 'Repeater List', 'plugin-domain' ),
		'type' => Controls_Manager::REPEATER,
		'default' => [/* same as above */],
		'fields' => array_values( $repeater->get_controls() );,
	]
);
```


## Usage

**PHP** *(Under `render()` method)*
```php
$list = $this->get_settings( 'list' );
if ( $list ) {
	echo '<dl>';
	foreach ( $list as $item ) {
		echo '<dt>' . $item['list_title'] . '</dt>';
		echo '<dd>' . $item['list_content'] . '</dd>';
	}
	echo '</dl>';
}
```

**JS** *(Under `_content_template()` method)*
```html
<# if ( settings.list ) { #>
	<dl>
	<# _.each( settings.list, function( item ) { #>
		<dt> {{ item.tab_title }} </dt>
		<dd> {{ item.list_content }} </dd>
	<# }); #>
	</dl>
<# } #>
```

## Selectors
You can also target repeater items via CSS selectors:

```php
$repeater->add_control( 'color', [
	'name' => 'color',
	'type' => Controls_Manager::COLOR,
	'selectors' => [
		'{{WRAPPER}} {{CURRENT_ITEM}}' => 'color: {{VALUE}}'
	],
]);
```

In order to make this work, the render element should have a special class name (above example, simplified):

```php
foreach ( $list as $item ) {
	$className = 'elementor-repeater-item-' . $item['_id'];
	echo '<dt class="' . $className . '">';
```

Also in JS  (above example, simplified):

```html
<# _.each( settings.list, function( item ) { #>
	<dt class="elementor-repeater-item-{{ item._id }}"> {{ item.tab_title }} </dt>
```

## Arguments

Argument           | Required   | Type         | Default                      | Description
------------       | :--------: | :------:     | :--------------------------: | ---------------------------------------------
`label`            | yes        | *`string`*   |                              | The label of the control - displayed next to it
`type`             | yes        | *`string`*   | `Controls_Manager::REPEATER` | The type of the control
`default`          | no         | *`array`*    |                              | Default repeater values. An array of arrays containing fields as keys and default values for each key as values: `[ [ 'title' => '', 'content' => '' ], [ 'title' => '', 'content' => '' ], ... ]`
`fields`           | no         | *`array`*    |                              | An array of arrays contaning the repeter fields.
`title_field`      | no         | *`string`*   |                              | Field that will be used as the repeater title in the fields list when the item is mnimized.
`label_block`      | no         | *`bool`*     | `false`                      | Display the label above the control by setting to true
`separator`        | no         | *`string`*   | `default`                    | Set the position of the control separator. `default` means that the separator will be posited depending on the control type. `before` or `after` will force the separator position before/after the control. `none` will hide the separator
