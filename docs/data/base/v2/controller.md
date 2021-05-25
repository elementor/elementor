# Backend REST API 
## Controller --  `Elementor\Data\V2\Controller`
*  **Description**: `Controller` is endpoint(s) manager, that represent a resource in **REST API**.
*  **Location**: *data/v2/base/controller.php*
*  **Parent**: `WP_REST_Controller`
*  **Public Methods**:

	| Method                                  | Parameters                     | Returns                                        | Description
	|-----------------------------------------|--------------------------------|------------------------------------------------|------------------------------|
	| `Controller::get_name()`                |                                | `string` Controller name                       | **Abstract**, Get controller name.
	| `Controller::register_endpoints()`      |                                |                                                | **Abstract**, Register controller endpoints.
	| `Controller::get_parent_name()`         |                                | `null` or `string` Parent controller name.     | Get parent controller name, if provided, controller will work as children controller.
	| `Controller::get_full_name()`           |                                | `string` Full controller name                  | Get full controller name, if parent exist it will be included.
	| `Controller::get_controller_route()`    |                                | `string` Controller route                      | Get full controller route including the namespace.
	| `Controller::get_controller_index()`    |                                | `WP_REST_Response` or `WP_Error`               | Retrieves rest route(s) index for current controller.
	| `Controller::get_permission_callback()` |                                | `{bool}`                                       | Get permission callback for each request in the controller.
	| `Controller::get_items()`               |  `WP_REST_Request` $request    | `WP_REST_Response` or `WP_Error`               | Method to get all the items. By defaults returns `Controller::get_controller_index` (Extendable).
	| `Controller::get_item()`                |  `WP_REST_Request` $request    | `WP_REST_Response` or `WP_Error`               | Method to get one item (Must be extended).
	| `Controller::create_items()`            |  `WP_REST_Request` $request    | `WP_REST_Response` or `WP_Error`               | Method to create items (Must be extended).
	| `Controller::create_item()`             |  `WP_REST_Request` $request    | `WP_REST_Response` or `WP_Error`               | Method to create one item (Must be extended).
	| `Controller::update_items()`            |  `WP_REST_Request` $request    | `WP_REST_Response` or `WP_Error`               | Method to update items (Must be extended).
	| `Controller::update_item()`             |  `WP_REST_Request` $request    | `WP_REST_Response` or `WP_Error`               | Method to update one item (Must be extended).
	| `Controller::delete_items()`            |  `WP_REST_Request` $request    | `WP_REST_Response` or `WP_Error`               | Method to delete items (Must be extended).
	| `Controller::delete_item()`             |  `WP_REST_Request` $request    | `WP_REST_Response` or `WP_Error`               | Method to delete one item (Must be extended).
	| `Controller::get_parent()`              |                                | `null` or `Elementor\Data\V2\Base\Controller`. | Get parent controller.
	| `Controller::get_children()`            |                                | `Elementor\Data\V2\Base\Controller[]`.         | Get children controller(s).
	| `Controller::get_processors()`          |  `string` $command             | `\Elementor\Data\Base\Processor[]`.            | Get processors for specific command.
	| `Controller::register_processors()`     |                                |                                                | Register processors, extend to register processors.

<!-- TODO: Remove comment - after Utilize of WP_REST_Controller -->
<!--     > **Note:** for more information please. please visit: [`{WP_REST_Controller}`](https://developer.wordpress.org/reference/classes/wp_rest_controller/) -->

## Why Controller exists, and what are main advantages:
  
*  To handle this situation, example of scenario:
    ```text
    'house'                       - Return all 'rooms', 'doors', 'keys', and 'garage' recursive.
    'house/keys'                  - Return all 'keys' items.
    'house/keys/{id}'             - Return one 'key' item.
    'house/rooms/'                - Return all 'rooms' and 'doors' items
    'house/rooms/{id}/doors/{id}' - Return one 'door' item.
    'house/garage'                - Return information about garage.             
    'house/garage/items'          - Return items located at garage. ( Excluded from house )          
    ```
    * _Legend_
       * *Controllers*: `House`, `Rooms`, `Doors`, `Keys`.
       * *Sub-Controllers*: `Rooms`, `Doors`, `Keys`.
       * *Endpoints*: `Garage`.
       * *Sub-Endpoints*: `Items`.
       
* What are Sub-Controllers & Sub-Endpoints?
    * Terms used to describe the flow.
    * Sub-Controller are *controller* which is children of another controller.
    * Sub-Endpoint are *endpoint* which is children of another endpoint.
    
*  In which situations you may use Controllers?
    * When you have routes which represent a resource, like: `house/keys`, `house/rooms`, `house/rooms/{id}/doors`.
    
*  In which situations you may use Endpoints?
    * When you have simple routes like `house/garage`. 

*  In which situations you may use Sub-Endpoints?
    * When you have simple routes like `house/garage/items`. 
    
* Why endpoint exists?
   *   To serve the `Controller` itself.
   *   to run processors that are registered via `Processor` class.
   *   Make it possible to simulate it as command, and attach a processor on it.
   *   To handle endpoints which are not resource.

* Why sub-endpoints exists?
   *   Make it possible to simulate it as command, and attach a processor on it.
   *   To get extra depth when no resource is neeeded.

* Representations:
    * Controller represented as _resource_.
    * Endpoint represented as _route_
   
* Controller Simple advantages
    * No requirement for `get_format` existence to support `class Processor` mechanism.
    * Know all of it children controllers and endpoints, gives you ability to get data from a whole hierarchy.

*  How to create children controller?
    * extend `get_parent_name()`

* Demo example of `House`, available here:
    [Advance example](controller.advance.md)

# Simple examples
* Create a simple resource.
    ```text
    'catalog-items'            - Return all catalog items.
    'catalog-items/{id}'       - Return one catalog item.
    ```
* Example:
    ```php
    <?php
  
    class Controller extends \Elementor\Data\V2\Base\Controller {
  
        public function get_name() {
            return 'catalog-items';
        }
    
        public function register_endpoints() {
            $this->index_endpoint->register_item_route(); // To support 'catalog-items/{id}'.
        }
  
        public function get_items( $request ) {
            // GET TO 'catalog-items' will return 'All catalog items'.
        	return 'All catalog items';
        }
  
        public function get_item( $request ) {
            // GET TO 'catalog-items/1' will return 'One catalog item'.
            return 'One catalog item';
        } 
    
        public function get_permission_callback( $request ) {
            // Just for the example to work without extra permissions.
            // In real word, it would check the user permission to the current resource.
            return true;
        }
    }
    ```
  
* With use of endpoints.
    ```text
    'catalog-items'            - Return all catalog items.
    'catalog-items/{id}'       - Return one catalog item.
    'catalog-items/status'     - Endpoint, return catalog status.
    ```
 * Example
     ```php
    <?php
    
    class Status extends \Elementor\Data\V2\Base\Endpoint {
    
        public function get_name() {
            return 'status';
        }
    
        public function get_format() {
            return 'catalog-items/status'; // To support the commands & processors mechanism.
        }
   
        public function get_permission_callback( $request ) {
           // Just for the example to work without extra permissions.
           // In real word, it would check the user permission to the current endpoint.
           return true;
        }
   
        protected function get_items( $request ) {
            // GET to 'catalog-item/status' will return 'Catalog is available'.
            return 'Catalog is available';
        }
    }

    class Controller extends \Elementor\Data\V2\Base\Controller {
        const MOCK_DATA = [
           [
               'name' => 'item_0', 
           ],
           [
               'name' => 'item_1',
           ]
        ];
    	
       public function get_name() {
    		return 'catalog-items';
    	}
            
        public function register_endpoints() {
           $this->index_endpoint->register_item_route(); // To support 'catalog-items/{id}'.
        
           $this->register_endpoint( new Status( $this ) ); // Register 'status' endpoint.
        }
    
        public function get_items( $request ) {
            // GET TO 'catalog-items' will return:
            /**
               [
                  [
                      'name' => 'item_0', 
                  ],
                  [
                      'name' => 'item_1',
                  ]
               ];
            */
           return self::MOCK_DATA;
        }
  
        public function get_item( $request ) {
            // GET TO 'catalog-items/1' will return:
            /**
                  [
                      'name' => 'item_0', 
                  ],
            */
           return self::MOCK_DATA[ $request->get_param( 'id' ) ];
        } 
    
        public function get_permission_callback( $request ) {
                // Just for the example to work without extra permissions.
                // In real word, it would check the user permission to the current resource.
                return true;
        }
    }
    ```

# How to register the controller?
```php
<?php

Elementor\Data\Manager::instance()->register_controller( Controller::class );
```
    
# Created two levels deep resource.
* Simple:
    ```text
    'documents'                           - Return all documents and elements.
    'documents/{id}'                      - Return document and the elements within the document.
    'documents/{id}/elements'             - Return all elements within the document.
    'documents/{id}/elements/{sub_id}'    - Return one element within the document.
    ```
 * Example
    ```php
    <?php
    namespace Documents;
   
    /* Documents controller */   
    class Controller extends \Elementor\Data\V2\Base\Controller {
        const DOCUMENTS_MOCK = [
           [
               'id' => 0,
               'name' => 'document_0',
               'elements' => [
                   [
                       'id' => 0,
                       'name' => 'element_1',
                   ],
                   [
                          'id' => 1,
                          'name' => 'element_1',
                   ],
               ]
           ],
           [
               'id' => 1,
               'name' => 'document_1', 
           ],
        ];
    	
        public function get_name() {
            return 'documents';
        }
            
        public function register_endpoints() {
           $this->index_endpoint->register_item_route(); // To support 'documents/{id}'.
        }
    
        public function get_items( $request ) {
           return self::DOCUMENTS_MOCK;
        }
  
        public function get_item( $request ) {
           return self::DOCUMENTS_MOCK[ $request->get_param( 'id' ) ];
        } 
    
        public function get_permission_callback( $request ) {
            // Just for the example to work without extra permissions.
            // In real word, it would check the user permission to the current resource.
            return true;
        }
   }
   ```
    ```php
    <?php
    namespace Documents\Elements;
   
    /* Documents controller */   
    class Controller extends \Elementor\Data\V2\Base\Controller {
        public function get_name() {
            return 'elements';
        }
   
       public function get_parent_name() {
           // To link the controllers, you still have to register the 'elements/controller'.
           return 'documents'; 
       }
            
        public function register_endpoints() {
            // To support 'documents/{id}/elements/{sub_id}'.
            $this->index_endpoint->register_item_route( WP_REST_Server::READABLE, [
                'id_arg_name' => 'sub_id',
            ] );
        }
    
        public function get_items( $request ) {
           return Documents\Controller::DOCUMENTS_MOCK[ $request->get_param( 'id' ) ][ 'elements' ];
        }
  
        public function get_item( $request ) {
           return Documents\Controller::DOCUMENTS_MOCK[ $request->get_param( 'id' ) ][ 'elements' ][ $request->get_param( 'sub_id' ) ];
        } 
    
        public function get_permission_callback( $request ) {
            // Just for the example to work without extra permissions.
            // In real word, it would check the user permission to the current resource.
            return true;
        }
   }
   ```
## Note:
> If you are debugging the *controller/endpoint* and cannot access it you can simple extend `get_permission_callback()` and return `true` for debugging proposes. 
