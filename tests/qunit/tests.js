QUnit.test( 'Elementor exist', function( assert ) {
	assert.ok( elementor, 'Passed!' );
});

QUnit.test( 'Preview loaded', function( assert ) {
	assert.equal( 1, elementor.$previewContents.find( '.elementor-editor-active' ).length );
});

QUnit.test( 'Frontend CSS loaded', function( assert ) {
	assert.equal( 1, elementor.$previewContents.find( '#elementor-frontend-css' ).length );
});

QUnit.test( 'simulateDragDrop', function( assert ) {
	assert.equal( 1, elementor.$previewContents.find( '#elementor-frontend-css' ).length );
});


function addSimulateDragDrop( $ ) {
	$.fn.simulateDragDrop = function(options) {
		return this.each(function() {
			new $.simulateDragDrop(this, options);
		});
	};
	$.simulateDragDrop = function(elem, options) {
		this.options = options;
		this.simulateEvent(elem, options);
	};
	$.extend($.simulateDragDrop.prototype, {
		simulateEvent: function(elem, options) {
			/*Simulating drag start*/
			var type = "dragstart";
			var event = this.createEvent(type);
			this.dispatchEvent(elem, type, event);

			/*Simulating drag over*/
			type = 'dragover';
			// var dragOverEvent1 = this.createEvent(type, {});
			// var $dragOverTarget1 = $(elem);
			// dragOverEvent1.clientX = $dragOverTarget1.offset().left + $dragOverTarget1.width() / 2;
			// dragOverEvent1.clientY = $dragOverTarget1.offset().top + $dragOverTarget1.height() / 2;
			// this.dispatchEvent(elem, type, dragOverEvent1);

			type = 'dragover';
			var dragOverEvent2 = this.createEvent(type, {});
			var $dragOverTarget2 = $(options.dropTarget);
			dragOverEvent2.clientX = $dragOverTarget2.offset().left + $dragOverTarget2.width() / 2;
			dragOverEvent2.clientY = $dragOverTarget2.offset().top + $dragOverTarget2.height() / 2;
			this.dispatchEvent($dragOverTarget2[0], type, dragOverEvent2);

			/*Simulating drop*/
			type = "drop";
			var dropEvent = this.createEvent(type, {});
			dropEvent.dataTransfer = event.dataTransfer;
			var target;
			if (options.dropTargetFrame) {
				target = $(document.querySelector(options.dropTargetFrame).contentDocument.querySelector(options.dropTarget))[0];
			}
			else {
				target = $(options.dropTarget)[0];
			}
			this.dispatchEvent(target, type, dropEvent);

			/*Simulating drag end*/
			type = "dragend";
			var dragEndEvent = this.createEvent(type, {});
			dragEndEvent.dataTransfer = event.dataTransfer;
			this.dispatchEvent(elem, type, dragEndEvent);
		},
		createEvent: function(type) {
			var event = document.createEvent("CustomEvent");
			event.initCustomEvent(type, true, true, null);
			event.dataTransfer = {
				data: {
				},
				types: [],
				setData: function(type, val){
					this.types.push(type)
					this.data[type] = val;
				},
				getData: function(type){
					return this.data[type];
				}
			};
			return event;
		},
		dispatchEvent: function(elem, type, event) {
			if(elem.dispatchEvent) {
				elem.dispatchEvent(event);
			}else if( elem.fireEvent ) {
				elem.fireEvent("on"+type, event);
			}
		}
	});
}

elementor.on('preview:loaded', function(){
	addSimulateDragDrop(elementorFrontend.getElements('window').jQuery);
});
