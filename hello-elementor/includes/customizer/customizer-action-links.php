<?php

namespace HelloElementor\Includes\Customizer;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Hello_Customizer_Action_Links extends \WP_Customize_Control {

	// Whitelist content parameter
	public $content = '';

	/**
	 * Render the control's content.
	 *
	 * Allows the content to be overridden without having to rewrite the wrapper.
	 *
	 * @return void
	 */
	public function render_content() {
		$this->print_customizer_action_links();

		if ( isset( $this->description ) ) {
			echo '<span class="description customize-control-description">' . wp_kses_post( $this->description ) . '</span>';
		}
	}

	/**
	 * Print customizer action links.
	 *
	 * @return void
	 */
	private function print_customizer_action_links() {
		if ( ! function_exists( 'get_plugins' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		$action_link_data = [];
		$action_link_type = '';
		$installed_plugins = get_plugins();

		if ( ! isset( $installed_plugins['elementor/elementor.php'] ) ) {
			$action_link_type = 'install-elementor';
		} elseif ( ! defined( 'ELEMENTOR_VERSION' ) ) {
			$action_link_type = 'activate-elementor';
		} elseif ( ! hello_header_footer_experiment_active() ) {
			$action_link_type = 'activate-header-footer-experiment';
		} else {
			$action_link_type = 'style-header-footer';
		}

		switch ( $action_link_type ) {
			case 'install-elementor':
				$action_link_data = [
					'image' => get_template_directory_uri() . '/assets/images/elementor.svg',
					'alt' => esc_attr__( 'Elementor', 'hello-elementor' ),
					'title' => esc_html__( 'Install Elementor', 'hello-elementor' ),
					'message' => esc_html__( 'Create cross-site header & footer using Elementor.', 'hello-elementor' ),
					'button' => esc_html__( 'Install Elementor', 'hello-elementor' ),
					'link' => wp_nonce_url(
						add_query_arg(
							[
								'action' => 'install-plugin',
								'plugin' => 'elementor',
							],
							admin_url( 'update.php' )
						),
						'install-plugin_elementor'
					),
				];
				break;
			case 'activate-elementor':
				$action_link_data = [
					'image' => get_template_directory_uri() . '/assets/images/elementor.svg',
					'alt' => esc_attr__( 'Elementor', 'hello-elementor' ),
					'title' => esc_html__( 'Activate Elementor', 'hello-elementor' ),
					'message' => esc_html__( 'Create cross-site header & footer using Elementor.', 'hello-elementor' ),
					'button' => esc_html__( 'Activate Elementor', 'hello-elementor' ),
					'link' => wp_nonce_url( 'plugins.php?action=activate&plugin=elementor/elementor.php', 'activate-plugin_elementor/elementor.php' ),
				];
				break;
			case 'activate-header-footer-experiment':
				$action_link_data = [
					'image' => get_template_directory_uri() . '/assets/images/elementor.svg',
					'alt' => esc_attr__( 'Elementor', 'hello-elementor' ),
					'title' => esc_html__( 'Style using Elementor', 'hello-elementor' ),
					'message' => esc_html__( 'Design your cross-site header & footer from Elementor’s "Site Settings" panel.', 'hello-elementor' ),
					'button' => esc_html__( 'Activate header & footer experiment', 'hello-elementor' ),
					'link' => wp_nonce_url( 'admin.php?page=elementor#tab-experiments' ),
				];
				break;
			case 'style-header-footer':
				$action_link_data = [
					'image' => get_template_directory_uri() . '/assets/images/elementor.svg',
					'alt' => esc_attr__( 'Elementor', 'hello-elementor' ),
					'title' => esc_html__( 'Style cross-site header & footer', 'hello-elementor' ),
					'message' => esc_html__( 'Customize your cross-site header & footer from Elementor’s "Site Settings" panel.', 'hello-elementor' ),
					'button' => esc_html__( 'Start Designing', 'hello-elementor' ),
					'link' => wp_nonce_url( 'post.php?post=' . get_option( 'elementor_active_kit' ) . '&action=elementor' ),
				];
				break;
		}

		$customizer_content = $this->get_customizer_action_links_html( $action_link_data );

		echo wp_kses_post( $customizer_content );
	}

	/**
	 * Get the customizer action links HTML.
	 *
	 * @param array $data
	 *
	 * @return string
	 */
	private function get_customizer_action_links_html( $data ) {
		if (
			empty( $data )
			|| ! isset( $data['image'] )
			|| ! isset( $data['alt'] )
			|| ! isset( $data['title'] )
			|| ! isset( $data['message'] )
			|| ! isset( $data['link'] )
			|| ! isset( $data['button'] )
		) {
			return;
		}

		return sprintf(
			'<div class="hello-action-links">
				<img src="%1$s" alt="%2$s">
				<p class="hello-action-links-title">%3$s</p>
				<p class="hello-action-links-message">%4$s</p>
				<a class="button button-primary" target="_blank" href="%5$s">%6$s</a>
			</div>',
			$data['image'],
			$data['alt'],
			$data['title'],
			$data['message'],
			$data['link'],
			$data['button'],
		);
	}
}
