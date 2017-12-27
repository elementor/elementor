# Elementor Pro - Forms API

##Changes since 1.3.0
- The `record` parameter is now an `Form_Record` object.
- The filter `elementor_pro/forms/mail_sent` runs now only if the user adds the `Email` action. 
- Removed filters: 
  - `elementor_pro/forms/validation`. It's now an [Action](#elementor_proformsvalidation)
  - `elementor_pro/forms/record`. To run something **while** the validation process use the [`elementor_pro/forms/validation`](#elementor_proformsvalidation) action. To run something **after** validation process use the [`elementor_pro/forms/valid_record_submitted`](#elementor_proformsvalid_record_submitted) action.
  - `elementor_pro/forms/skip_send`. The Email is now an action that can be set from the panel.
  - `elementor_pro/forms/mail_blocked`.
     
## Submission - Action

### `elementor_pro/forms/form_submitted`
After the forms module is loaded and it's a POST request with the form action.
This is the place to add a form handlers. 

#### Arguments

Argument | Type                           | Description
-------- | :------:                       | ---------------------------------------------
`module` | *`ElementorPro\Modules\Forms`* | The entire Elementor HTML output of current page/post
 
#### Example

```php
add_action( 'elementor_pro/forms/form_submitted', function( $module ) {
  $module->add_component( 'uploads_handler', new Uploads_Handler() );
} );
```

## Validation - Action

### `elementor_pro/forms/validation`
After the forms module is loaded and it's a POST request with the form action.
This is the place to add a form handlers. 

#### Arguments

Argument       | Type             | Description
------------   | :--------:       | ---------------------------------------------
`record`       | *`Form_Record`*  | The record submitted
`ajax_handler` | *`Ajax_Handler`* | The Ajax Handler component
 
#### Example

```php
// Validate the Ticket ID field is in XXX-XXXX format.
add_action( 'elementor_pro/forms/validation', function ( $record, $ajax_handler ) {
	$fields = $record->get_field( [
    	'id' => 'ticket_id',
	] );
	
	if ( empty( $fields ) ) {
    	return;
    }
	
	$field = current( $fields );

	if ( 1 !== preg_match( '/^\w{3}-\w{4}$/', $field['value'] ) ) {
		$ajax_handler->add_error( $field['id'], 'Invalid Ticket ID, it must be in the format XXX-XXXX' );
	}
}, 10, 2 );
```

## After Validation - Action

### `elementor_pro/forms/valid_record_submitted`
Same as the [`elementor_pro/forms/validation`](#elementor_proformsvalidation), but it's runs after the form actions like Email, Webhooks and etc.

## Webhooks Request - Filter 

### `elementor_pro/forms/webhooks/request_args`
If the form has a webhook, it's fires here.

#### Arguments

Argument   | Type            | Description
---------- | :--------:      | ---------------------------------------------
`args`     | *`array`*       | The `wp_remote_post` $args argument
`record`   | *`Form_Record`* | The record submitted

#### Example

```php
add_filter( 'elementor_pro/forms/webhooks/request_args', function( $args, $record ) {
	// Add additional data to the request body
	$args['body']['user_id'] = get_current_user_id();

	return $args;
}, 10, 2 );
```

## Webhooks Response - Action 

### `elementor_pro/forms/webhooks/response`
Handle the webhook response.

#### Arguments

Argument  | Type               | Description
--------- | :--------:         | ---------------------------------------------
`response`| *`array/WP_Error`* | The `wp_remote_post response`. See [https://codex.wordpress.org/Function_Reference/wp_remote_retrieve_response_message]()
`record`  | *`Form_Record`*    | The record submitted

### `elementor_pro/forms/wp_mail_headers`

#### Arguments

Argument  | Type       | Description
--------- | :--------: | -----------------------------------------
`headers` | *`string`* | The email headers for `wp_mail` arguments

### `elementor_pro/forms/wp_mail_message`

#### Arguments

Argument     | Type       | Description
----------   | :--------: | ---------------------------------------------
`email_text` | *`string`* | The email html content for `wp_mail` arguments


## After email sent successfully - Actions

### `elementor_pro/forms/mail_sent`

#### Arguments

Argument   | Type            | Description
---------- | :--------:      | --------------------
`settings` | *`array`*       | The form settings
`record`   | *`Form_Record`* | The record submitted