#Code

A Code Editor control based on [Ace editor](https://ace.c9.io/).
Includes syntax highlighting for HTML/CSS/JavaScript and other programming languages. Accepts a `language` argument to define the code language.

*Returns:* `string`

##Example

```php
$this->add_control(
  'custom_html',
  [
     'label'   => __( 'Custom HTML', 'your-plugin' ),
     'type'    => Controls_Manager::CODE,
     'language' => 'html',
  ]
);
```

##Usage

**PHP** *(Under `render()` method)*
```php
$settings = $this->get_settings(); 

echo $settings[‘custom_html’];
```

**JS** *(Under `_content_template()` method)*
```html
{{{ settings.custom_html }}}
```

##Arguments

Argument       | Required   | Type         | Default                      | Description
------------   | :--------: | :------:     | :--------------------------: | ---------------------------------------------
`label`        | yes        | *`string`*   |                              | The label of the control - displayed next to it
`type`         | yes        | *`string`*   | `Controls_Manager::TEXTAREA` | The type of the control
`default`      | no         | *`string`*   |                              | The default value of the control
`label_block`  | no         | *`bool`*     | `true`                       | Display the label above the control by setting to true
`language`     | no         | *`string`*   | `html`                       | Any language(mode) supported by Ace editor. (see https://ace.c9.io/build/kitchen-sink.html)
