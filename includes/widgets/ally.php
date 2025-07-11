<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

use Elementor\Core\Utils\Hints;
use Elementor\Modules\ContentSanitizer\Interfaces\Sanitizable;

/**
 * Elementor Ally widget.
 *
 * Elementor widget that displays an eye-catching Ally Accessibility widget.
 */
class Widget_Ally extends Widget_Base implements Sanitizable {

	/**
	 * Get widget name.
	 *
	 * Retrieve widget name.
	 *
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return 'ally';
	}

	/**
	 * Get widget title.
	 *
	 * Retrieve widget title.
	 *
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return esc_html__( 'Ally Accessibility', 'elementor' );
	}

	/**
	 * Get widget icon.
	 *
	 * Retrieve widget icon.
	 *
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return 'eicon-accessibility';
	}

	/**
	 * Get widget categories.
	 *
	 * Retrieve the list of categories the widget belongs to.
	 *
	 * Used to determine where to display the widget in the editor.
	 *
	 * @access public
	 *
	 * @return array Widget categories.
	 */
	public function get_categories() {
		return [ 'basic' ];
	}

	/**
	 * Get widget keywords.
	 *
	 * Retrieve the list of keywords the widget belongs to.
	 *
	 * @access public
	 *
	 * @return array Widget keywords.
	 */
	public function get_keywords() {
		return [ 'Accessibility' ];
	}

	protected function is_dynamic_content(): bool {
		return false;
	}

	public function has_widget_inner_wrapper(): bool {
		return false;
	}

	/**
	 * Remove data attributes from the html.
	 *
	 * @param string $content Heading title.
	 * @return string
	 */
	public function sanitize( $content ): string {
		return $content;
	}

	private static function should_display_instructions(): bool {
		$plugin = 'pojo-accessibility';
		return ! Hints::is_plugin_installed( $plugin ) || ! Hints::is_plugin_active( $plugin ) || ! class_exists( '\EA11y\Plugin' );
	}

	/**
	 * Register widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @access protected
	 */
	protected function register_controls() {
		if ( self::should_display_instructions() ) {
			$this->get_install_instructions();
			return;
		}

		if ( ! class_exists( '\EA11y\Plugin' ) ) {
			try {
				if ( defined( 'EA11Y_PATH' ) ) {
						include_once EA11Y_PATH . '/pojo-accessibility.php';
				} else {
					// Fallback: try to determine plugin path
					$plugin_path = WP_PLUGIN_DIR . '/pojo-accessibility';
					if ( file_exists( $plugin_path . '/pojo-accessibility.php' ) ) {
						include_once $plugin_path . '/pojo-accessibility.php';
					}
				}
			} catch ( \Exception $e ) {
				$this->start_controls_section(
					'error_notice',
					[
						'label' => esc_html__( 'Error', 'elementor' ),
					]
				);
				$this->add_control( 'error_hint', [
					'type'         => Controls_Manager::NOTICE,
					'notice_type'  => 'error',
					'icon'         => true,
					'dismissible'  => false,
					'heading'      => __( 'Ally Accessibility Widget', 'elementor' ),
					'content'      => __( 'To use the Ally Accessibility widget, please install and activate the Ally Accessibility plugin first.', 'elementor' ),
				] );
				$this->end_controls_section();
			}
		}
		$connect = \EA11y\Plugin::instance()->modules_manager->get_modules( 'Connect' );
		if ( ! $connect::is_connected() ) {
			$this->get_connect_instructions();
		} else {
			$this->add_ally_widget_controls();
		}
	}

	/**
	 * Get Install Instructions
	 *
	 * @return void
	 */
	public function get_install_instructions() {
		$plugin = 'pojo-accessibility';
		$has_capability = current_user_can( 'manage_options' );
		$this->start_controls_section(
			'installation_notice',
			[
				'label' => esc_html__( 'Installation Required', 'elementor' ),
			]
		);

		if ( $has_capability ) {
			$plugin_installed = Hints::is_plugin_installed( $plugin );
			$cta = $plugin_installed ? __( 'Activate Ally Now', 'elementor' ) : __( 'Install & Activate', 'elementor' );
			$heading = $plugin_installed ? __( "Don't Let Accessibility Hold You Back", 'elementor' ) : __( 'Make Accessibility Simple', 'elementor' );
			$content = $plugin_installed ? __( 'Activate Ally to add an accessibility widget and statement in one click.', 'elementor' ) : __( 'Ally gives you a ready-to-use accessibility widget and statement - fast.', 'elementor' );
			$this->add_control( 'install_hint', [
				'type'         => Controls_Manager::NOTICE,
				'notice_type'  => 'info',
				'icon'         => true,
				'dismissible'  => false,
				'heading'      => $heading,
				'content'      => $content,
				'button_text'  => $cta,
				'button_event' => 'pluginActions',
				'plugin_action' => [
					'action' => $plugin_installed ? 'activate' : 'installAndActivate',
					'url' => Hints::get_plugin_action_url( $plugin ),
					'loaderTab' => true,
					'followLink' => admin_url( 'admin.php?page=accessibility-settings' ),
					'pluginSlug' => 'pojo-accessibility',
					'loaderTitle' => $plugin_installed ? __( 'Activating Ally Accessibility', 'elementor' ) : __( 'Installing Ally Accessibility', 'elementor' ),
					'installText' => __( 'Installing Ally Accessibility', 'elementor' ),
					'activateText' => __( 'Activating Ally Accessibility', 'elementor' ),
					'preInstallCampaign' => [
						'action' => 'elementor_core_ally_campaign',
						'data' => [
							'source' => 'ally-editor-widget-install',
						],
					],
				],
			] );
		} else {
			$this->add_control( 'install_hint', [
				'type'         => Controls_Manager::NOTICE,
				'notice_type'  => 'info',
				'icon'         => true,
				'dismissible'  => false,
				'heading'      => __( 'Ally Accessibility Widget', 'elementor' ),
				'content'      => __( 'To use the Ally Accessibility widget please contact your site administrator and ask him to install and activate the Ally Accessibility plugin first.', 'elementor' ),
			] );
		}

		$this->end_controls_section();
	}

	public function get_connect_instructions() {
		$has_capability = current_user_can( 'manage_options' );
		$this->start_controls_section( 'connect_notice', [
			'label' => esc_html__( 'Connect Required', 'elementor' ),
		] );

		if ( $has_capability ) {
			$this->add_control( 'connect_hint', [
				'type'          => Controls_Manager::NOTICE,
				'notice_type'   => 'info',
				'icon'          => true,
				'dismissible'   => false,
				'heading'       => __( 'Set Yourself Up for Smarter Accessibility', 'elementor' ),
				'content'       => __( 'Connect to manage your widget and accessibility statement in one place.', 'elementor' ),
				'button_text'   => 'Connect Now',
				'button_event'  => 'openLink#' . base64_encode( json_encode( [
					'target' => 'blank',
					'url'    => admin_url( 'admin.php?page=accessibility-settings' ),
				] ) ),
			] );
		} else {
			$this->add_control( 'connect_hint', [
				'type'         => Controls_Manager::NOTICE,
				'notice_type'  => 'info',
				'icon'         => true,
				'dismissible'  => false,
				'heading'      => __( 'Ally Accessibility Widget', 'elementor' ),
				'content'      => __( 'To use the Ally Accessibility widget please contact your site administrator and ask him to install and activate the Connect plugin first', 'elementor' ),
			] );
		}

		$this->end_controls_section();
	}

	/**
	 * Add Ally Widget Controls
	 *
	 * @return void
	 */
	public function add_ally_widget_controls() {
		$this->start_controls_section(
			'section_ally',
			[
				'label' => esc_html__( 'Ally Widget', 'elementor' ),
			]
		);

		$this->add_control( 'ally_widget_notice', [
			'type'          => Controls_Manager::NOTICE,
			'notice_type'   => 'info',
			'icon'          => true,
			'dismissible'   => false,
			'heading'       => __( 'Make Ally Match Your Site', 'elementor' ),
			'content'       => __( "Fine-tune the widget's icon, position, and features, and update your accessibility statement- all in just a few clicks.", 'elementor' ),
			'button_text'   => __( 'Customize Now', 'elementor' ),
			'button_event'  => 'openLink#' . base64_encode( json_encode( [
				'target' => '_blank',
				'url'    => admin_url( 'admin.php?page=accessibility-settings' ),
			] ) ),
		] );

		$this->end_controls_section();
	}

	/**
	 * Render widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render() {}

	/**
	 * Check if the content should be sanitized. Sanitizing should be applied for non-admin users in the editor and for shortcodes.
	 *
	 * @param array $settings
	 *
	 * @return bool
	 */
	private function should_sanitize( array $settings ): bool {
		return ( is_admin() && ! current_user_can( 'manage_options' ) );
	}
}
