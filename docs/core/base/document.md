# Document

The term "Document" refers to a single piece of content that created by Elementor, such as a post, page, or a saved template. It's used only in the code.

Each document has its own type and features.

A document is saved as a `post` in WordPress' `wp_posts` table, while its elements and settings are saved as metadata in the `wp_postmeta` table.

In PHP, the document is represented by the `Elementor\Base\Document` class.

This class is like a DB Model that knows how to save and load its data.

### Why "Document"?

In WordPress, contents are called `posts`. It's an historical term that was introduced in the days when WordPress was just a blogging system instead of the CMS it became to be today.

In Elementor, on the other hand, many document types can share the same `post_type`. For example, "Page" and "Section" templates both have an `elementor_library` post type even though those are different document types.

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

For example, a `Header` in Elementor Pro is a new type of document that knows to appear in the header of the site.

A new document type should be created by extending the `Elementor\Base\Document` class, and defining its type and the post type it will be used in.

#### Example:
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

And then, register the new document type:

```php
add_action( 'elementor/documents/register', function( Documents_Manager $documents_manager ) {
	$documents_manager->register_document_type( Article::get_type(), Article::get_class_full_name() );
} );
```

Once it's registered, it will appear in the templates list: WP Admin > Templates > Add New.

Then the URL to create a new Article document is available at:
```php
$create_url = Article::get_create_url();
```
### A Template Document

In order to create a document type as a template (For internal use) it should extend the `\Elementor\Modules\Library\Documents\Library_Document` class without setting a `cpt` since it will use the template's one.

```php
class Article extends \Elementor\Modules\Library\Documents\Library_Document {
	public static function get_type() {
		return 'article';
	}
	
	public static function get_title() {
		return esc_html__( 'Article', 'plugin-textdomain' );
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
		return __( 'Article', 'plugin-textdomain' );
	}
	
	// Assume that there are widgets that belong to a new category called `article-elements`.
	protected static function get_editor_panel_categories() {
		$categories = [
			'article-elements' => [
				'title' => __( 'Article', 'plugin-textdomain' ),
				'active' => true,
			],
		];

		// Put the `article-elements` category first.
		return $categories + parent::get_editor_panel_categories();
	}
}
```

