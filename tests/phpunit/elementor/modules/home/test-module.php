<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Home;

use Elementor\Modules\Home\Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Module extends Elementor_Test_Base {
	private const ATTRIBUTE_INJECTION_PAYLOAD = '" onfocus="alert(\'Parlix\')" autofocus="" tabindex="1" a="';

	public function tearDown(): void {
		unset( $_GET['active-document'] );
		unset( $_GET['active-tab'] );

		parent::tearDown();
	}

	public function test_add_active_document_to_edit_link__appends_numeric_document_id_and_key_tab() {
		// Arrange
		$edit_link = 'http://example.com/wp-admin/post.php?post=1&action=elementor';
		$_GET['active-document'] = '42';
		$_GET['active-tab'] = 'global-typography';

		// Act
		$result = $this->get_home_module()->add_active_document_to_edit_link( $edit_link );

		// Assert
		$this->assertStringContainsString( 'active-document=42', $result );
		$this->assertStringContainsString( 'active-tab=global-typography', $result );
	}

	public function test_add_active_document_to_edit_link__does_not_append_attribute_injection_payload() {
		// Arrange
		$edit_link = 'http://example.com/wp-admin/post.php?post=1&action=elementor';
		$_GET['active-document'] = self::ATTRIBUTE_INJECTION_PAYLOAD;
		$_GET['active-tab'] = self::ATTRIBUTE_INJECTION_PAYLOAD;

		// Act
		$result = $this->get_home_module()->add_active_document_to_edit_link( $edit_link );

		// Assert
		$this->assertSame( $edit_link, $result );
		$this->assertStringNotContainsString( 'onfocus', $result );
		$this->assertStringNotContainsString( '"', parse_url( $result, PHP_URL_QUERY ) );
	}

	private function get_home_module(): Module {
		$module = Plugin::$instance->modules_manager->get_modules( 'home' );

		$this->assertInstanceOf( Module::class, $module );

		return $module;
	}
}
