<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

use Elementor\Core\Utils\Hints;
use Elementor\Modules\ContentSanitizer\Interfaces\Sanitizable;

/**
 * Elementor heading widget.
 *
 * Elementor widget that displays an eye-catching headlines.
 *
 * @since 1.0.0
 */
class Widget_Ally extends Widget_Base implements Sanitizable {

	/**
	 * Get widget name.
	 *
	 * Retrieve heading widget name.
	 *
	 * @since 1.0.0
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
	 * Retrieve heading widget title.
	 *
	 * @since 1.0.0
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
	 * Retrieve heading widget icon.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return 'eicon-globe';
	}

	/**
	 * Get widget categories.
	 *
	 * Retrieve the list of categories the heading widget belongs to.
	 *
	 * Used to determine where to display the widget in the editor.
	 *
	 * @since 2.0.0
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
	 * @since 2.1.0
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
	public function sanitize( $content ) : string {
		return $content;
	}

	private static function should_display_instructions() : bool {
		$plugin = 'pojo-accessibility';
		return ! Hints::is_plugin_installed( $plugin ) || ! Hints::is_plugin_active( $plugin ) || ! class_exists( '\EA11y\Plugin' );
	}

	/**
	 * Register heading widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 3.1.0
	 * @access protected
	 */
	protected function register_controls() {
		if ( self::should_display_instructions() ) {
			$this->get_install_instructions();
			return;
		} else {
			if ( ! class_exists( ' \EA11y\Plugin' ) ) {
				try {
					include_once EA11Y_PATH . '/plugin.php';
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
	}

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
			$this->add_control( 'install_hint', [
				'type'         => Controls_Manager::NOTICE,
				'notice_type'  => 'info',
				'icon'         => true,
				'dismissible'  => false,
				'heading'      => __( 'Ally Accessibility Widget', 'elementor' ),
				'content'      => __( 'To use the Ally Accessibility widget, please install and activate the Ally Accessibility plugin first.', 'elementor' ),
				'button_text'  => Hints::is_plugin_installed( $plugin ) ? __( 'Activate Ally', 'elementor' ) : __( 'Install & activate Ally', 'elementor' ),
				'button_event' => 'openLink#' . base64_encode( json_encode( [
					'target' => 'fetch',
					'url'    => hints::get_plugin_action_url( $plugin ),
				] ) ),
			] );
		} else {
			$this->add_control( 'install_hint', [
				'type'         => Controls_Manager::NOTICE,
				'notice_type'  => 'info',
				'icon'         => true,
				'dismissible'  => false,
				'heading'      => __( 'Ally Accessibility Widget', 'elementor' ),
				'content'      => __( 'To use the Ally Accessibility widget please contact your site administrator and ask him to install and activate the Ally Accessibility plugin first', 'elementor' ),
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
				'heading'       => __( 'Ally Accessibility Widget', 'elementor' ),
				'content'       => __( 'To use the Ally Accessibility widget, please install and activate the Connect plugin first.', 'elementor' ),
				'button_text'   => 'Connect Now',
				'button_event'  => 'openLink#' . base64_encode( json_encode( [
					'target' => 'fetch',
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
			'heading'       => __( 'Ally Accessibility Widget', 'elementor' ),
			'content'       => __( 'The Ally Accessibility Widget, is installed and ready to be used. You can customize the widget settings and appearance from the Ally Accessibility plugin settings page.', 'elementor' ),
			'button_text'   => 'Customize Now',
			'button_event'  => 'openLink#' . base64_encode( json_encode( [
				'target' => '_blank',
				'url'    => admin_url( 'admin.php?page=accessibility-settings' ),
			] ) ),
		] );

		$this->end_controls_section();
	}

	/**
	 * Render heading widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @since 1.0.0
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
	private function should_sanitize( array $settings ) : bool {
		return ( is_admin() && ! current_user_can( 'manage_options' ) );
	}
}
