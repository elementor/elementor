<?php

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Divider\Atomic_Divider;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Self_Hosted_Video\Atomic_Self_Hosted_Video;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Youtube\Atomic_Youtube;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Url_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Video_Src_Prop_Type;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Atomic_Css_Id_Attribute extends Elementor_Test_Base {
	const PAYLOAD = 'x onmouseover=alert(1) "><script>alert(2)</script>';

	/**
	 * @dataProvider widgets_data_provider
	 */
	public function test__css_id_stays_inside_the_id_attribute( string $widget_type, array $settings, string $tag ): void {
		// Arrange.
		$widget = Plugin::$instance->elements_manager->create_element_instance( [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => array_merge( $settings, [
				'_cssid' => String_Prop_Type::generate( self::PAYLOAD ),
			] ),
			'widgetType' => $widget_type,
		] );

		// Act.
		ob_start();
		$widget->render_content();
		$output = ob_get_clean();

		// Assert.
		$document = new \DOMDocument();
		$document->loadHTML( '<body>' . trim( $output ) . '</body>', LIBXML_NOERROR );
		$element = ( new \DOMXPath( $document ) )->query( '//' . $tag . '[@id]' )->item( 0 );

		$this->assertNotNull( $element );
		$this->assertSame( self::PAYLOAD, $element->getAttribute( 'id' ) );
		$this->assertFalse( $element->hasAttribute( 'onmouseover' ) );
		$this->assertSame( 0, $document->getElementsByTagName( 'script' )->length );
	}

	public function widgets_data_provider(): array {
		return [
			'youtube' => [ Atomic_Youtube::get_element_type(), [], 'div' ],
			'divider' => [ Atomic_Divider::get_element_type(), [], 'hr' ],
			'self-hosted video' => [
				Atomic_Self_Hosted_Video::get_element_type(),
				[
					'source' => Video_Src_Prop_Type::generate( [
						'id' => null,
						'url' => Url_Prop_Type::generate( 'https://example.com/video.mp4' ),
					] ),
				],
				'video',
			],
		];
	}
}
