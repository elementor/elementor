# Checklist REST API

This is the endpoints and their request and response respective examples. This is part of the launchpad checklist module and it will be available only for the corresponding experiment's active state.

## Get steps [readable] (`/wp-json/elementor/v1/checklist/steps`)

Use this endpoint to get the checklist global config, as well as users progress.
**Request**: `fetch( `${ elementorCommon.config.urls.rest }elementor/v1/checklist/steps` )`
**Response**: <pre>{
"data": [ {
"should_allow_undo": false,
"is_completed": true,
"config": {
"id": "create_pages",
"title": "Create your first 3 pages",
"description": "Jumpstart your creation with professional designs form the Template Library or start from scratch.",
"learn_more_text": "Learn more",
"learn_more_url": "https://go.elementor.com/getting-started-with-elementor/",
"cta_text": "Create a new page",
"cta_url": "http://wordpress-dev.local/wp-admin/edit.php?action=elementor_new_post&post_type=page&_wpnonce=b68e0a348f",
"is_completion_immutable": true } } ]
}</pre>		

## Step keys dictionary

| Key       		        		  | Type		|Description										 |
|------------------------------------|-------------|----------------------------------------------------|
| `should_allow_undo`                | `boolean`	|True if the unmark as done button should be enabled |
| `is_completed`                     | `boolean`	|True if step should be "checked" as done			 |
| `config.id`						  | `string`	|Step unique ID										 |
| `config.title`					  | `string`	|Step title to be displayed as an item list			 |
| `config.description`				  | `string`	|Step instructions inside the list card item element |
| `config.learn_more_text`			  | `string`	|Text for the button, probably 'Learn More'			 |
| `config.learn_more_url`			  | `string`	|URL for learn more button							 |
| `config.cta_text`				  | `string`	|I.e. 'Create 3 pages'								 |
| `config.cta_url`					  | `string`	|Url for the page in wich step can be completed		 |
| `config.is_completetion_immutable` | `string`	|True if step can be undone and still be checked	 |
