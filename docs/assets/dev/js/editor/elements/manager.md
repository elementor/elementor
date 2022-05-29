## Elements Manager --  `elementor.elementsManager`
The new Elements Manager (since 3.7.0), provides a simple and convenient way to register elements with custom views and models.

The full list of registered elements, (including custom & 3rd party elements) are available via: `elementor.elementsManager.elementTypes`
> Note: `elementor.elementsManager` is managing the elements only in the editor JS.

For registering a new __Element__/__Widget__, in the backend you can visit [here](https://developers.elementor.com/docs/widgets/)
* **Description**: The Elements Manager is a global object that handles all the elements in the editor.
* **Location**: */assets/dev/js/editor/elements/manager.js*
* **Methods** : 

   | Method                                            | Parameters                                                          | Returns                            | Description                                                                         |
   |---------------------------------------------------|-----------------------------------------------------------------|------------------------------------|-------------------------------------------------------------------------------------|
   | `elementor.elementsManager.constructor()`         |                                                                 |                                    | Run `registerElements()`
   | `elementor.elementsManager.getElementTypeClass()` | `{String}` *type*                                               | `{ElementBase}` or `undefined`     | Return instance of element type.
   | `elementor.elementsManager.registerElementType()` | `{ElementBase}` *element*                                       |                                    | Register instance of element type.
   | `elementor.elementsManager.registerElements()`    |                                                                 |                                    | Register core elements.
  > `elementor.elements.types.Base` is external of `ElementBase` class.

---

### How to register a new element? and what are the capabilities it brings?
* To register a new element, you need to create a new class that extends the `elementor.elements.types.Base` class, eg:
```javascript
class MyElement extends elementor.elements.types.Base {
	getType() {
		return 'my-element';
	}
	
	getView() {}
	getEmptyView() {}
	getModel() {}
}
```
```javascript
elementor.elementsManager.registerElementType( new MyElement() );
```
#### The capabilities

| Method                           | Returns                              | Description                   
|----------------------------------|--------------------------------------|-------------------------------------|
| `ElementBase.getType()`          | `{String}`                           | The type allow you to identify the element.                                      
| `ElementBase.getView()`          | `{Marionette.View}` *class*          | The view will be used to render the element.
| `ElementBase.getEmptyView()`     | `{React.Component}` *class*          | The empty view will be used to render the element when it's empty.
| `ElementBase.getModel()`         | `{BaseElementModel}` *class*         | The model will be used to interact with the element data.

#### Externals:
```javascript
elementor.elements.types.Base // Element base.
```
```javascript
elementor.elements.types.Widget // Widget base.
```

#### Registration
```javascript
elementor.elementsManager.registerElementType( new class extends elementor.elements.types.Widget {
	getType() {
		return 'my-element';
	}

	getView() {
		return class MyElementView extends elementor.elements.views.BaseWidget {
			onModelRemoteRender() {
				console.log( 'onModelRemoteRender' );

				super.onModelRemoteRender();
			}
		};
	}

	getEmptyView() {
		return () => <div>Empty View</div>;
	}

	getModel() {
		return class MyElementModel extends elementor.elements.models.Element {
			isValidChild( childModel ) {
				return childModel.get( 'widgetType' ) === 'my-widget'; // Allow only widget of type 'my-widget' to be added to this element.
			};
		};
	}
} );
```
#### Example of [`container`](../../../../../includes/elements/container.md) registration
```javascript
// types/container.js
import EmptyComponent from 'elementor-elements/views/container/empty-component';
import Model from 'elementor-elements/models/container';
import { default as View } from 'elementor-elements/views/container';

export default class Container extends elementor.elements.types.Base {
	getType() {
		return 'container';
	}

	getView() {
		return View;
	}

	getEmptyView() {
		return EmptyComponent;
	}

	getModel() {
		return Model;
	}
}
```
#### Registration
```javascript
if ( containerExperimentActive ) {
	const ContainerClass = await import( './types/container' );

	elementor.elementsManager.registerElementType( new ContainerClass() );
}
```
