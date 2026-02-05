<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Promotions;

use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Panel_Elements_Banner extends Elementor_Test_Base {
	private $template_path;
	private $pro_version_defined = false;

	public function set_up() {
		parent::set_up();
		
		$this->template_path = ELEMENTOR_PATH . 'includes/editor-templates/panel-elements.php';
		$this->pro_version_defined = defined( 'ELEMENTOR_PRO_VERSION' );
	}

	public function tear_down() {
		parent::tear_down();
		
		remove_all_filters( 'elementor/editor/panel/get_pro_details' );
	}

	public function test_banner_visible_when_pro_not_active() {
		// Arrange
		$this->ensure_pro_not_defined();

		// Act
		$output = $this->render_template();

		// Assert
		$this->assertStringContainsString( 'id="elementor-panel-get-pro-elements"', $output );
		$this->assertStringContainsString( 'Get more with Elementor Pro', $output );
		$this->assertStringContainsString( 'Upgrade Now', $output );
	}

	public function test_banner_hidden_when_pro_active_with_show_banner_false() {
		// Arrange
		$this->ensure_pro_defined();
		add_filter( 'elementor/editor/panel/get_pro_details', function() {
			return [
				'link' => '',
				'message' => '',
				'button_text' => '',
				'show_banner' => false,
			];
		} );

		// Act
		$output = $this->render_template();

		// Assert
		$this->assertStringNotContainsString( 'id="elementor-panel-get-pro-elements"', $output );
	}

	public function test_banner_visible_when_pro_active_with_show_banner_true() {
		// Arrange
		$this->ensure_pro_defined();
		add_filter( 'elementor/editor/panel/get_pro_details', function() {
			return [
				'link' => 'https://example.com',
				'message' => 'Custom Pro Message',
				'button_text' => 'Custom Button',
				'show_banner' => true,
			];
		} );

		// Act
		$output = $this->render_template();

		// Assert
		$this->assertStringContainsString( 'id="elementor-panel-get-pro-elements"', $output );
		$this->assertStringContainsString( 'Custom Pro Message', $output );
		$this->assertStringContainsString( 'Custom Button', $output );
	}

	public function test_default_show_banner_is_false_when_pro_active() {
		// Arrange
		$this->ensure_pro_defined();

		// Act
		$output = $this->render_template();

		// Assert
		$this->assertStringNotContainsString( 'id="elementor-panel-get-pro-elements"', $output );
	}

	public function test_sticky_banner_hidden_when_pro_active() {
		// Arrange
		$this->ensure_pro_defined();

		// Act
		$output = $this->render_template();

		// Assert
		$this->assertStringNotContainsString( 'id="elementor-panel-get-pro-elements-sticky"', $output );
	}

	public function test_sticky_banner_visible_when_pro_not_active() {
		// Arrange
		$this->ensure_pro_not_defined();

		// Act
		$output = $this->render_template();

		// Assert
		$this->assertStringContainsString( 'id="elementor-panel-get-pro-elements-sticky"', $output );
	}

	private function render_template(): string {
		ob_start();
		include $this->template_path;
		return ob_get_clean();
	}

	private function ensure_pro_defined() {
		if ( ! defined( 'ELEMENTOR_PRO_VERSION' ) ) {
			define( 'ELEMENTOR_PRO_VERSION', '99.99.99' );
		}
	}

	private function ensure_pro_not_defined() {
		if ( defined( 'ELEMENTOR_PRO_VERSION' ) ) {
			$this->markTestSkipped( 'Cannot test free version behavior when Pro is already active' );
		}
	}
}
