DialogsManager.addWidgetType( 'styleguide', DialogsManager.getWidgetType( 'lightbox' ).extend( 'alert', {
	buildWidget() {
		DialogsManager.getWidgetType( 'lightbox' ).prototype.buildWidget.apply( this, arguments );

		var $widgetContent = this.addElement( 'widgetContent' ),
			elements = this.getElements();

		$widgetContent.append( elements.message );

		elements.widget.html( $widgetContent );
	},
} ) );
