# Date Time Picker
A control that allows the user to choose a date/time from a calendar. 
Based on the [jquery-simple-datetimepicker](https://github.com/mugifly/jquery-simple-datetimepicker) jQuery plugin.

*Returns:* `string` The date/time chosen in mysql format: `YYYY-mm-dd HH:ii`

## Example

```php
$this->add_control(
  'due_date',
  [
     'label' => __( 'Due Date', 'your-plugin' ),
     'type' => Controls_Manager::DATE_TIME,
  ]
);
```

## Usage

**PHP** *(Under `render()` method)*
```php
$due_date =  strtotime( $this->get_settings( 'due_date' ) );

// If you want it in GMT timezone 
// $due_date -= ( get_option( 'gmt_offset' ) * HOUR_IN_SECONDS );

$due_date_in_days = $due_date / DAY_IN_SECONDS;

echo '<div>Something will happen in ' .  $due_date_in_days .  ' days</div>';
```

**JS** *(Under `_content_template()` method)*
```html
<#
	var due_date = new Date( settings.due_date ), 
	    now = new Date(),;
	    due_date_in_days = Math.floor( ( due_date - now ) / 86400000 /* Day in miliseconds */ );
#>

<div>Something will happen in  {{{ due_date_in_days }}} </div>
```

## Arguments

Argument           | Required   | Type         | Default                      | Description
------------       | :--------: | :------:     | :--------------------------: | ---------------------------------------------
`label`            | yes        | *`string`*   |                              | The label of the control - displayed next to it
`type`             | yes        | *`string`*   | `Controls_Manager::DATE_TIME`| The type of the control
`default`          | no         | *`array`*    |                              | The default value can be set as a string in mysql format `YYYY-mm-dd HH:ii`
`picker_options`   | no         | *`array`*    | `onHide: saveValue()`        | The jQuery plugin option, see [details here](http://mugifly.github.io/jquery-simple-datetimepicker/jquery.simple-dtpicker.html#section_available_options). But you cannot use the `onHide` callback that already in use by Elementor
`label_block`      | no         | *`bool`*     | `false`                      | Display the label above the control by setting to true
`description`      | no         | *`string`*   |                              | A description text to display below the control
`separator`        | no         | *`string`*   | `default`                    | Set the position of the control separator. `default` means that the separator will be posited depending on the control type. `before` or `after` will force the separator position before/after the control. `none` will hide the separator