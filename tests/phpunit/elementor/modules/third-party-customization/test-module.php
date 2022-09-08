<?php
namespace Elementor\Testing\Modules\ThirdPartyCustomization;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\ThirdPartyCustomization as ThirdPartyCustomization;

class Elementor_Test_Third_Party_Customization_Module extends Elementor_Test_Base {

	public function test_performace_lab_get_webp_src() {

		$image_id = $this->factory()->attachment->create_upload_object( __DIR__ . '/assets/pixel.jpg' );
		$image_url = wp_get_attachment_url( $image_id );
		$webp_src = ThirdPartyCustomization\Module::performace_lab_get_webp_src( $image_id, 'full', $image_url );
		$this->assertEquals( $image_url, $webp_src );

	}
}
