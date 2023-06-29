<?php
namespace Elementor\Modules\Marketplace;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Admin_Marketplace_Page {

	public static function render() {
		?>
		<div class="wrap e-a-marketplace">

			<div class="e-a-page-title">
				<h2><?php echo esc_html__( 'Elementor\'s Marketplace', 'elementor' ); ?></h2>
				<p><?php echo esc_html__( 'Elementor Marketplace is coming soon!', 'elementor' ); ?></p>
			</div>

			<div class="e-a-list">
				<?php self::render_plugins_list(); ?>
			</div>
		</div>
		<?php
	}

	private static function render_plugins_list() {
		$plugins = self::get_plugins();

		foreach ( $plugins as $plugin ) {
			self::render_plugin_item( $plugin );
		}
	}

	private static function get_plugins() : array {
		return [
			[
				'name' => __( 'Yoast SEO', 'elementor' ),
				'author' => __( 'Team Yoast', 'elementor' ),
				'author_url' => 'https://yoast.com/',
				'badge' => __( 'Pro', 'elementor' ),
				'description' => __( 'Yoast SEO is the most complete WordPress SEO plugin. It handles the technical optimization of your site & assists with optimizing your content.', 'elementor' ),
				'learn_more_url' => 'https://elementor.com/',
				'action_url' => 'https://wordpress.org/plugins/wordpress-seo/',
				'image' => 'https://ps.w.org/wordpress-seo/assets/icon-256x256.png',
			],
			[
				'name' => __( 'WooCommerce', 'elementor' ),
				'author' => __( 'Automattic', 'elementor' ),
				'author_url' => 'https://woocommerce.com/',
				'description' => __( 'WooCommerce is a flexible, open-source eCommerce solution built on WordPress. Sell anything, anywhere and make your way.', 'elementor' ),
				'action_url' => 'https://wordpress.org/plugins/woocommerce/',
				'image' => 'https://ps.w.org/woocommerce/assets/icon-256x256.png',
			],
			[
				'name' => __( 'Akismet Spam Protection', 'elementor' ),
				'author' => __( 'Automattic', 'elementor' ),
				'author_url' => 'https://akismet.com/',
				'description' => __( 'Akismet checks your comments and contact form submissions against our global database of spam to prevent your site from publishing malicious content. You can review the comment spam it catches on your blog’s “Comments” admin screen.', 'elementor' ),
				'action_url' => 'https://wordpress.org/plugins/akismet/',
				'image' => 'https://ps.w.org/akismet/assets/icon-256x256.png',
			],
			[
				'name' => __( 'Contact Form by WPForms – Drag & Drop Form Builder for WordPress', 'elementor' ),
				'author' => __( 'WPForms', 'elementor' ),
				'author_url' => 'https://wpforms.com/',
				'badge' => __( 'Pro', 'elementor' ),
				'description' => __( 'WPForms is the best WordPress contact form plugin. Here are the features that makes WPForms the most powerful and user-friendly WordPress form builder in the market.', 'elementor' ),
				'action_url' => 'https://wordpress.org/plugins/wpforms-lite/',
				'image' => 'https://ps.w.org/wpforms-lite/assets/icon-256x256.png',
			],
			[
				'name' => __( 'Site Kit by Google', 'elementor' ),
				'author' => __( 'Google', 'elementor' ),
				'author_url' => 'https://google.com/',
				'description' => __( 'Site Kit is the official WordPress plugin from Google for insights about how people find and use your site. Site Kit is the one-stop solution to deploy, manage, and get insights from critical Google tools to make the site successful on the web. It provides authoritative, up-to-date insights from multiple Google products directly on the WordPress dashboard for easy access, all for free.', 'elementor' ),
				'action_url' => 'https://wordpress.org/plugins/google-site-kit/',
				'image' => 'https://ps.w.org/google-site-kit/assets/icon-256x256.png',
			],
			[
				'name' => __( 'Regenerate Thumbnails', 'elementor' ),
				'author' => __( 'Alex Mills (Viper007Bond)', 'elementor' ),
				'author_url' => 'https://alex.blog/',
				'description' => __( 'Regenerate the thumbnails for one or more of your image uploads. Useful when changing their sizes or your theme.', 'elementor' ),
				'action_url' => 'https://wordpress.org/plugins/regenerate-thumbnails/',
				'image' => 'https://ps.w.org/regenerate-thumbnails/assets/icon-128x128.png',
			],
		];
	}

	private static function render_plugin_item( $plugin ) {
		?>
		<div class="e-a-item">
			<div class="e-a-heading">
				<img class="e-a-img" src="<?php echo esc_url( $plugin['image'] ); ?>" alt="<?php echo esc_attr( $plugin['name'] ); ?>">
			</div>
			<h3 class="e-a-title"><?php echo esc_html( $plugin['name'] ); ?></h3>
			<?php if ( ! empty( $plugin['badge'] ) ) : ?>
				<span class="e-a-badge"><?php echo esc_html( $plugin['badge'] ); ?></span>
			<?php endif; ?>
			<p class="e-a-author"><?php esc_html_e( 'By', 'elementor' ); ?> <a href="<?php echo esc_url( $plugin['author_url'] ); ?>" target="_blank"><?php esc_html_e( $plugin['author'], 'elementor' ); ?></a></p>
			<p class="e-a-desc"><?php echo esc_html( $plugin['description'] ); ?></p>
			<?php if ( ! empty( $plugin['learn_more_url'] ) ) : ?>
				<p class="e-a-learn-more">
					<a href="<?php echo esc_url( $plugin['learn_more_url'] ); ?>" target="_blank"><?php echo esc_html__( 'Learn More', 'elementor' ); ?></a>
				</p>
			<?php endif; ?>
			<p class="e-a-actions">
				<a href="<?php echo esc_url( $plugin['action_url'] ); ?>" class="button button-primary" target="_blank"><?php echo esc_html__( 'Install', 'elementor' ); ?></a>
			</p>
		</div>
		<?php
	}
}
