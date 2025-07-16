# List of all post-content ( elementor elements and such )

## response format:
```json
{
	"posts": [
		{
			"post_type": "post",
			"post_id": 5,
			"meta_value": {}
		},
		{
			"post_type": "post",
			"post_id": 6,
			"meta_value": {}
		}
	]
}
```

# New bulk API for variables:

URI: `/wp-json/elementor/v1/variables/push_with_force`

body:
```json
{

	"variables": {
		"id-001": {
			"type": "global-color-variable",
			"label": "new-varaible",
			"value": "lightblue"
		},
		...
		"variable-id-{N}": {
			"type": "global-size-variable",
			"label": "not-so-main-color",
			"value": "10rem"
		}
	}
}
```