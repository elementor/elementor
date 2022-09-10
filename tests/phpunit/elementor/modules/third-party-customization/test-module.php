<?php
namespace Elementor\Testing\Modules\ThirdPartyCustomization;

use ElementorEditorTesting\Elementor_Test_Base;

use Elementor\Modules\PerformaceLab\Module as PerformaceLab;

class Elementor_Test_Third_Party_Customization_Module extends Elementor_Test_Base {

	public function test_performace_lab_get_webp_src() {

		$image_id = $this->factory()->attachment->create_upload_object( __DIR__ . '/assets/pixel.jpg' );
		$image_url = wp_get_attachment_url( $image_id );
		$reflection = new \ReflectionClass( PerformaceLab::class );
		$method = $reflection->getMethod( 'performace_lab_get_webp_src' );
		$method->setAccessible( true );
		$performace_lab = new PerformaceLab();
		$webp_src = $method->invokeArgs( $performace_lab, [ $image_id, 'full', $image_url ] );
		$this->assertEquals( $image_url, $webp_src );

	}
}
