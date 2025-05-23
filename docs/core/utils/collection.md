# Collection

The `Elementor\Core\Utils\Collection` class provide a fluent, convenient wrapper for working with arrays of data. The idea is to transform the use of `foreach`, `for` or php built it functions with the `Collection` class, basically to make the code more readable.

The class is heavily inspire by the `Laravel Collection`, it is recommended to read the laravel docs to understand the concept of collections: [Laravel Docs](https://laravel.com/docs/collections).
Another great resource, if videos are your cup of tea, this talk by Adam Wathan: [Curing the common loop ](https://www.youtube.com/watch?v=crSUWtRYw-M).

Example:
```php
use Elementor\Core\Utils\Collection;
use Elementor\Core\Base\Document;

$only_parent_documents = ( new Collection( $data ) )
    ->map( function ( Document $document ) {
        return $document->get_main_id();
    })
    ->unique()
    ->values();
```

Same result without Collection:
```php
use Elementor\Core\Base\Document;

$only_parent_documents = [];

/** @var Document $document */
foreach( $data as $document ) {
    $id = $document->get_main_id();

    if ( in_array( $id, $only_parent_documents, true ) ) {
        continue;
    }
    
    $only_parent_documents[] = $id;
}
```

Another option:
```php
use Elementor\Core\Base\Document;

$only_parent_documents = array_unique(
    array_map( function ( Document $document ) {
        return $document->get_main_id();
    }, $data ) 
);
```

### Extend Collection
There are two ways to extend the `Collection` class, you can add your new method to class itself, or you can extend the `Collection` and create more specific `Collection` class, for example `Documents_Collection`:

```php
use Elementor\Core\Utils\Collection;
use Elementor\Core\Base\Document;

class Documents_Collection extends Collection {
    public function parent_document_ids() {
        return $this->map( function ( Document $document ) {
            return $document->get_main_id();
        })
        ->unique();
    }
}
``` 

usage: 
```php
$ids = ( new Documents_Collection( $data ) )
    ->parent_document_ids()
    ->values();
```
