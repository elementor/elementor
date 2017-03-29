# Elementor Pro - Forms API

## Submission - Action

### `elementor_pro/forms/form_submitted`
After the forms module is loaded and it's a POST request with the form action.
This is the place to add a form handlers. 

#### Arguments

Argument          | Type                             | Description
------------      | :------:                         | ---------------------------------------------
`module`          | *`ElementorPro\Modules\Forms`*  | The entire Elementor HTML output of current page/post
 
#### Example

```php
add_action( 'elementor_pro/forms/form_submitted', function( $module ) {
  $module->add_component( 'uploads_handler', new Uploads_Handler() );
} );
```

## Validation - Filter

### `elementor_pro/forms/validation`
After the forms module is loaded and it's a POST request with the form action.
This is the place to add a form handlers. 

#### Arguments

Argument        | Type        | Description
------------    | :--------:  | ---------------------------------------------
`return_array`  | *`array`*  | an array of errors. [ 'fields' => [ 0 => 'Cannot be blank', 1 => ... ]  ]
`form_id`       | *`string`* | The unique form id
`settings`      | *`array`*  | The form settings
`form_raw_data` | *`array`*  | The POST data that sent
 
#### Example

```php
add_filter(	'elementor_pro/forms/validation', function ( $return_array, $form_id, $settings, $form_raw_data ) {
	// Validate the Ticket ID field is in XXX-XXXX format.
	$fields = $settings['form_fields'];

	foreach ( $fields as $field_index => $field ) {
		if ( 'Ticket ID' === $field['field_label'] ) {
			if ( 1 !== preg_match( '/^\w{3}-\w{4}$/', $form_raw_data[ $field_index ] ) ) {
				$return_array['fields'][ $field_index ] = 'Invalid Ticket ID, it must be in the format XXX-XXXX';
				break;
			}
		}
	}

	return $return_array;
}, 10, 4 );
```

## After Validation - Filter

### `elementor_pro/forms/record`
The `$record` is the submitted record that will be sent to the target email. 
here is the place to remove/edit the fields that will be sent to the email.

#### Arguments

Argument        | Type        | Description
------------    | :--------:  | ---------------------------------------------
`record`        | *`array`*  | The `$record` is an array [ 'fields' => [...], 'meta' => [...] ]. The `fields` are the submitted data, The `meta` is the meta data like user agent, ip and etc that attached to the email message. each of the `fields` and the `meta` fields are arrays: [ 'type' => 'text/select/...', 'title' => 'Field Label', 'value' => 'The submitted value']. Use `Ajax_Handler::get_formatted_data` to get it as an array of `$title => $value`. But if two fields have the same title - one of them will be overridden.
`form_id`       | *`string`* | The unique form id
`settings`      | *`array`*  | The form settings

#### Example

```php
add_filter( 'elementor_pro/forms/validation', function( $return_array, $form_id, $settings, $form_raw_data ) {
	// Validate the Ticket ID field is in XXX-XXXX format.
	$fields = $settings['form_fields'];

	foreach ( $fields as $field_index => $field ) {
		if ( 'Ticket ID' === $field['field_label'] ) {
			if ( 1 !== preg_match( '/^\w{3}-\w{4}$/', $form_raw_data[ $field_index ] ) ) {
				$return_array['fields'][ $field_index ] = 'Invalid Ticket ID, it must be in the format XXX-XXXX';
				break;
			}
		}
	}

	return $return_array;
}, 10, 4 );
```

## After Validation - Action

### `elementor_pro/forms/valid_record_submitted`
Same as the [`elementor_pro/forms/record`](###`elementor_pro/forms/record`), but an action.

## Webhooks Request - Filter 

### `elementor_pro/forms/webhooks/request_args`
If the form has a webhook, it's fires here.

#### Arguments

Argument   | Type        | Description
---------- | :--------:  | ---------------------------------------------
`args`     | *`array`*  | The `wp_remote_post` $args argument
`form_id`  | *`string`* | The unique form id
`settings` | *`array`*  | The form settings
`record`   | *`array`*  | See [`elementor_pro/forms/record`](###`elementor_pro/forms/record`)


#### Example

```php
add_filter( 'elementor_pro/forms/webhooks/request_args', function( $args, $form_id, $settings, $record ) {
	// Add additional data to the request body
	$args['body']['user_id'] = get_current_user_id();

	return $args;
}, 10, 4 );
```

## Webhooks Response - Action 

### `elementor_pro/forms/webhooks/response`
Handle the webhook response.

#### Arguments

Argument   | Type        | Description
---------- | :--------:  | ---------------------------------------------
`response`     | *`array/WP_Error`*  | The `wp_remote_post response`. See [https://codex.wordpress.org/Function_Reference/wp_remote_retrieve_response_message]()
`form_id`  | *`string`* | The unique form id
`settings` | *`array`*  | The form settings
`record`   | *`array`*  | See [`elementor_pro/forms/record`](### `elementor_pro/forms/record`)


## Before send to target email - Filters:
### `elementor_pro/forms/skip_send`
Whether to skip the email sending.

#### Arguments

Argument   | Type        | Description
---------- | :--------:  | ---------------------------------------------
`skip`    | *`bool`*    | Whether to skip the email sending. Default false - don't skip..
`form_id`  | *`string`* | The unique form id
`settings` | *`array`*  | The form settings
`record`   | *`array`*  | See [`elementor_pro/forms/record`](### `elementor_pro/forms/record`)

### `elementor_pro/forms/wp_mail_headers`

#### Arguments

Argument   | Type        | Description
---------- | :--------:  | ---------------------------------------------
`headers`  | *`string`*  | The email headers for `wp_mail` arguments

### `elementor_pro/forms/wp_mail_message`

#### Arguments

Argument   | Type        | Description
---------- | :--------:  | ---------------------------------------------
`email_html`  | *`string`*  | The email html content for `wp_mail` arguments


## After email sent successfully - Actions

### `elementor_pro/forms/mail_sent`

#### Arguments

Argument   | Type        | Description
---------- | :--------:  | ---------------------------------------------
`form_id`  | *`string`* | The unique form id
`settings` | *`array`*  | The form settings
`record`   | *`array`*  | See [`elementor_pro/forms/record`](### `elementor_pro/forms/record`)

### `elementor_pro/forms/mail_blocked`
If the email sending fails

#### Arguments

Argument   | Type        | Description
---------- | :--------:  | ---------------------------------------------
`form_id`  | *`string`* | The unique form id
`settings` | *`array`*  | The form settings
`record`   | *`array`*  | See [`elementor_pro/forms/record`](### `elementor_pro/forms/record`)