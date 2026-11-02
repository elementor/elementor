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

	public function test_add_active_document_to_edit_link__drops_unknown_active_tab() {
		// Arrange
		$edit_link = 'http://example.com/wp-admin/post.php?post=1&action=elementor';
		$_GET['active-document'] = self::ATTRIBUTE_INJECTION_PAYLOAD;
		$_GET['active-tab'] = 'unknown-tab-id';

		// Act
		$result = $this->get_home_module()->add_active_document_to_edit_link( $edit_link );

		// Assert
		$this->assertSame( $edit_link, $result );
		$this->assertStringNotContainsString( 'active-tab', $result );
		$this->assertStringNotContainsString( 'active-document', $result );
	}

	public function test_add_active_document_to_edit_link__blocks_attribute_breakout() {
		// Arrange
		$edit_link = 'http://example.com/wp-admin/post.php?post=1&action=elementor';
		$payloads = [
			'" onfocus="x',
			"' onclick='x",
			'<script>',
			'> <input',
			'" autofocus="',
		];

		foreach ( $payloads as $payload ) {
			$_GET['active-document'] = $payload;
			$_GET['active-tab'] = $payload;

			// Act
			$result = $this->get_home_module()->add_active_document_to_edit_link( $edit_link );
			$query = parse_url( $result, PHP_URL_QUERY );

			// Assert
			$this->assertStringNotContainsString( '"', $query, "Payload: {$payload}" );
			$this->assertStringNotContainsString( "'", $query, "Payload: {$payload}" );
			$this->assertStringNotContainsString( '<', $query, "Payload: {$payload}" );
			$this->assertStringNotContainsString( '>', $query, "Payload: {$payload}" );
			$this->assertStringNotContainsString( ' ', $query, "Payload: {$payload}" );

			unset( $_GET['active-document'], $_GET['active-tab'] );
		}
	}

	public function test_add_active_document_to_edit_link__appends_all_registered_kit_tabs() {
		// Arrange
		$edit_link = 'http://example.com/wp-admin/post.php?post=1&action=elementor';
		$active_kit = Plugin::$instance->kits_manager->get_active_kit();
		$registered_tab_ids = array_keys( $active_kit->get_tabs() );

		// Assert we have tabs to test
		$this->assertNotEmpty( $registered_tab_ids, 'No kit tabs registered' );

		// Act & Assert
		foreach ( $registered_tab_ids as $tab_id ) {
			$_GET['active-tab'] = $tab_id;

			$result = $this->get_home_module()->add_active_document_to_edit_link( $edit_link );

			$this->assertStringContainsString( 'active-tab=' . $tab_id, $result, "Failed for tab: {$tab_id}" );

			unset( $_GET['active-tab'] );
		}
	}

	private function get_home_module(): Module {
		$module = Plugin::$instance->modules_manager->get_modules( 'home' );

		$this->assertInstanceOf( Module::class, $module );

		return $module;
	}
}
