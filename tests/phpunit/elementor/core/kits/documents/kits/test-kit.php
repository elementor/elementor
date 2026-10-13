<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Kits\Documents;

use Elementor\Core\Breakpoints\Manager as Breakpoints_Manager;
use Elementor\Core\Files\CSS\Base as Post_CSS_Base;
use Elementor\Core\Files\CSS\Post as Post_CSS;
use Elementor\Modules\History\Revisions_Manager;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Kit extends Elementor_Test_Base {

	/**
	 * @var \Elementor\Core\Kits\Documents\Kit
	 */
	private $kit;

	public function setUp(): void {
		parent::setUp();

		wp_set_current_user( $this->factory()->get_administrator_user()->ID );

		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$this->kit = Plugin::$instance->documents->get( $kit->get_id(), false );

		// In the production environment 'JS' sends empty array, do the same.
		add_post_meta( $kit->get_main_id(), '_elementor_data', '[]' );
	}

	public function test_add_repeater_row_does_not_echo_post_css_with_internal_embedding() {
		global $wp_styles;

		$had_css_print_method_option = ( false !== get_option( 'elementor_css_print_method', false ) );
		$previous_css_print_method = $had_css_print_method_option ? get_option( 'elementor_css_print_method' ) : null;

		$original_wp_styles = $wp_styles;
		$wp_styles = new \WP_Styles();

		try {
			update_option( 'elementor_css_print_method', 'internal' );

			$kit_id = $this->kit->get_main_id();
			$post_css = Post_CSS::create( $kit_id );
			$post_css->update();
			$css_meta_before = $post_css->get_meta();

			$item = [
				'_id' => 'test_color_row',
				'title' => 'Test color',
				'color' => '#ff00ff',
			];

			ob_start();
			$this->kit->add_repeater_row( 'custom_colors', $item );
			$unexpected_output = ob_get_clean();

			$this->assertSame( '', $unexpected_output, 'Kit post CSS must not be echoed when adding a repeater row.' );

			$css_meta_after = Post_CSS::create( $kit_id )->get_meta();

			$this->assertSame( Post_CSS_Base::CSS_STATUS_INLINE, $css_meta_after['status'] );
			$this->assertNotEmpty( $css_meta_after['css'] );
			$this->assertNotSame( $css_meta_before['css'], $css_meta_after['css'] );
			$this->assertGreaterThanOrEqual( $css_meta_before['time'], $css_meta_after['time'] );

			$refreshed_kit = Plugin::$instance->documents->get( $kit_id, false );
			$colors = $refreshed_kit->get_settings( 'custom_colors' );

			$this->assertIsArray( $colors );
			$this->assertContains( $item['_id'], array_column( $colors, '_id' ) );
		} finally {
			if ( $had_css_print_method_option ) {
				update_option( 'elementor_css_print_method', $previous_css_print_method );
			} else {
				delete_option( 'elementor_css_print_method' );
			}

			$wp_styles = $original_wp_styles;
		}
	}

	public function test_save__kits_revision_ensure_changed() {
		// Arrange.
		$this->kit->set_settings( 'post_status', 'draft');

		$excepted_count = count( Revisions_Manager::get_revisions( $this->kit->get_main_id() ) );

		// Ensure new revision added.
		$excepted_count++;

		// Act.
		$this->kit->save( [ 'settings' => $this->kit->get_settings() ] );

		// Assert.
		$this->assertCount( $excepted_count, Revisions_Manager::get_revisions( $this->kit->get_main_id() ) );
	}

	public function test_save__kits_revision_ensure_same() {
		// Arrange.
		$this->kit->save( [ 'settings' => $this->kit->get_settings() ] );

		$excepted_count = count( Revisions_Manager::get_revisions( $this->kit->get_main_id() ) );

		// Act.
		$this->kit->save( [ 'settings' => $this->kit->get_settings() ] );

		// Assert.
		$this->assertCount( $excepted_count, Revisions_Manager::get_revisions( $this->kit->get_main_id() ) );
	}

	public function test_settings_layout_before_save() {
		$prefix = Breakpoints_Manager::BREAKPOINT_SETTING_PREFIX;
		$kit_id = $this->kit->get_id();
		$settings = $this->kit->get_settings();

		// Set custom values for the mobile and tablet settings.
		$settings['viewport_mobile'] = 599;
		$settings['viewport_tablet'] = 799;

		// Save the kit to trigger `before_save()`.
		$this->kit->save( [ 'settings' => $settings ] );
		// Refresh the kit and kit settings variables.
		$this->kit = Plugin::$instance->documents->get( $kit_id, false );
		$settings = $this->kit->get_settings();

		// Check that the legacy mobile and tablet values are equal to the newer mobile and tablet settings + 1px.
		$this->assertEquals( $settings['viewport_md'], $settings[ $prefix . Breakpoints_Manager::BREAKPOINT_KEY_MOBILE ] + 1 );
		$this->assertEquals( $settings['viewport_lg'], $settings[ $prefix . Breakpoints_Manager::BREAKPOINT_KEY_TABLET ] + 1 );
	}
}
