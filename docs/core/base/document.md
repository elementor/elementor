# Document

The term "Document" is used in the only in the code. It refers a single piece of content that created by Elementor, such as a post, page, or a saved template.

Each document has its own type and features.

A document is saved as a `post` in the WordPress `wp_posts` table. His elements and settings are saved as metadata in the `wp_postmeta` table.

In PHP, the document is represented by the `Elementor\Base\Document` class.

This class is like a DB Model that knows how to save and load its data.

### Why "Document"?

WordPress' content are called `posts` it's an historical term that came from the days of WordPress as a blogging system.

In Elementor, it can be many document types for one `post_type` like the saved templates Page and Section that are both a `elementor_library` post type.

The term `document` is used instead, as the browser called his DOM content as a "document".

### Main Features

* Get the data from DB
* Save the data in DB
* Get the elements and settings
* Get metadata like URLs to create, edit and preview the document
* Get the WP_Post object
* Get the list of widgets categories to display in the panel

### How to create a new Document type?

A new type of document can be used in order to create special functionality for it.

For example, an `Header` in Elementor Pro is a new type of document that knows to appear in the header of the site.

A new document type should be created by extending the `Elementor\Base\Document` class, and define his type and the post type it will be used in.

```php
class Article extends \Elementor\Core\Base\Document {
	public static function get_type() {
		return 'article';
	}
	
	public static function get_properties() {
		$properties = parent::get_properties();
	
		// Which post type the document will be used in
		$properties['cpt'] = [ 'article' ];
	
		return $properties;
	}
}
```

And then it should be registered the new document type:

```php
add_action( 'elementor/documents/register', function( $documents_manager ) {
	$documents_manager->register_document_type( Article::get_type(), Article::get_class_full_name() );
} );
```

On registering, the URL to create new Article document is available at:
```php
$create_url = Article::get_create_url();
```
### A Template Document

In order to create a document type as a template (For internal use) it should extend the `\Elementor\Modules\Library\Documents\Library_Document` class without set the `cpt`, it will use the templates cpt.

```php
class Article extends \Elementor\Modules\Library\Documents\Library_Document {
	public static function get_type() {
		return 'article';
	}
	
	public static function get_title() {
		return __( 'Article', 'plugin-domain' );
	}
}
```

### How to change the widget categories order?

The widgets categories order is defined by the `get_editor_panel_categories` method of the document type.
In order to change the order, the `get_editor_panel_categories` method should be overridden.

```php
class Article extends \Elementor\Modules\Library\Documents\Library_Document {
	public static function get_type() {
		return 'article';
	}
	
	public static function get_title() {
		return __( 'Article', 'plugin-domain' );
	}
	
	// Assume that the there are widgets that belongs to a new category called `article-elements`
	protected static function get_editor_panel_categories() {
		$categories = [
			'article-elements' => [
				'title' => __( 'Article', 'plugin-textdomain' ),
				'active' => true,
			],
		];

		return $categories + parent::get_editor_panel_categories();
	}
}
```

Once it's registered, it will appear in the templates list: WP Admin > Templates > Add New.
