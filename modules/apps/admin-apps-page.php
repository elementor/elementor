<?php
namespace Elementor\Modules\Apps;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Admin_Apps_Page {

	public static function render() {
		?>
		<div class="wrap e-a-apps">

			<div class="e-a-page-title">
				<h2><?php echo esc_html__( 'Popular Apps, New Possibilities.', 'elementor' ); ?></h2>
				<p><?php echo esc_html__( 'Boost your web-creation process with add-ons, plugins, and more tools specially selected to unleash your creativity, increase productivity, and enhance your Elementor-powered website.', 'elementor' ); ?><br>
					<a href="https://go.elementor.com/wp-dash-apps-about-apps-page/" target="_blank"><?php echo esc_html__( 'Learn more about this page.', 'elementor' ); ?></a>
				</p>
			</div>

			<div class="e-a-list">
				<?php self::render_plugins_list(); ?>
			</div>
			<div class="e-a-page-footer">
				<p><?php echo esc_html__( 'Please note that certain services on this page are developed by third-party companies. When you click on the their action button, you may be redirected to an external website.', 'elementor' ); ?></p>
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
		$images_url = static::get_images_url();

		$plugins = [
			[
				'name' => 'Elementor AI',
				'author' => 'Elementor',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-elementor-ai/',
				'badge' => 'Premium',
				'description' => 'Boost creativity with Elementor AI. Craft & enhance copy, create custom CSS & Code, and generate images to elevate your website.',
				'action_label' => 'Let\'s Go',
				'action_url' => 'https://go.elementor.com/wp-dash-apps-go-to-elementor-ai/',
				'image' => $images_url . 'elementor.svg',
			],
			[
				'name' => 'JetPlugins Add-ons',
				'author' => 'Crocoblock',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-crocoblock/',
				'badge' => '10% Off',
				'description' => 'Unlock dynamic widgets, e-commerce features, and a powerful filtering system for enhanced website capabilities.',
				'offering' => 'Use coupon code: onlyforelementor',
				'action_label' => 'Let\'s Go',
				'action_url' => 'https://go.elementor.com/wp-dash-apps-go-to-crocoblock/',
				'image' => $images_url . 'crocoblock.png',
			],
			[
				'name' => 'Unlimited Elements',
				'author' => 'Unlimited Group',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-unlimited-elements/',
				'badge' => '20% Off',
				'description' => 'An all-in-one plugin that instantly gives you the most advanced tools to make better Elementor websites faster.',
				'offering' => 'Use coupon code: elementor20',
				'action_label' => 'Let\'s Go',
				'action_url' => 'https://go.elementor.com/wp-dash-apps-go-to-unlimited-elements/',
				'image' => $images_url . 'unlimited-elements.gif',
			],
			[
				'name' => 'Essential Addons',
				'author' => 'WPDeveloper',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-wpdeveloper/',
				'badge' => '20% Off',
				'description' => 'Essential Addons is the ultimate library for Elementor, with 1 Million+ users and 100+ widgets & extensions to enhance web-building & design experiences.',
				'offering' => 'Use coupon code: elementor20',
				'action_label' => 'Let\'s Go',
				'action_url' => 'https://go.elementor.com/wp-dash-apps-go-to-wpdeveloper/',
				'image' => $images_url . 'essential-addons.svg',
			],
			[
				'name' => 'Element Pack Pro',
				'author' => 'BdThemes Ltd',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-element-pack-pro/',
				'description' => 'Revolutionize your web design experience with 250+ powerful features, tailored for designers of all skill levels. Create websites without breaking a sweat!',
				'badge' => '10% Off',
				'offering' => 'Discount is automatically applied',
				'action_label' => 'Let\'s Go',
				'action_url' => 'https://go.elementor.com/wp-dash-apps-go-to-element-pack-pro/',
				'image' => $images_url . 'element-pack.gif',
			],
			[
				'name' => 'Ultimate Addons',
				'author' => 'Brainstorm Force',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-ultimate-elementor/',
				'description' => 'Ultimate Addons for Elementor is a powerful plugin with advanced widgets, templates, and features for designing stunning websites using Elementor.',
				'badge' => '25% Off',
				'offering' => 'Discount is automatically applied',
				'action_label' => 'Let\'s Go',
				'action_url' => 'https://go.elementor.com/wp-dash-apps-go-to-ultimate-elementor/',
				'image' => $images_url . 'uae.svg',
			],
			[
				'name' => 'Fiverr Logo Maker',
				'author' => 'Fiverr',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-fiverr/',
				'description' => 'Craft your brand\'s identity on Fiverr Logo Maker. Upload logo, choose typography & colors for versatile variations. Elevate your brand effortlessly.',
				'badge' => 'Premium',
				'action_label' => 'Let\'s Go',
				'action_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-fiverr/',
				'image' => $images_url . 'fiverr.svg',
			],
			[
				'name' => 'Hover Custom Domains',
				'author' => 'Tucows',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-hover/',
				'description' => 'Elevate your website with a custom domain for maximum online impact. Enjoy exclusive Elementor user discounts through our Hover partnership.',
				'badge' => '10% Off',
				'offering' => 'Discount is automatically applied',
				'action_label' => 'Let\'s Go',
				'action_url' => 'https://go.elementor.com/wp-dash-apps-go-to-hover/',
				'image' => $images_url . 'hover.svg',
			],
			[
				'name' => 'Gravity Forms',
				'author' => 'Gravity Forms',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-gravityforms/',
				'description' => 'Millions trust Gravity Forms for versatile forms—boost email lists, create quizzes, accept payments, and more!',
				'badge' => '30% Off',
				'offering' => 'Discount is automatically applied',
				'action_label' => 'Let\'s Go',
				'action_url' => 'https://go.elementor.com/wp-dash-apps-go-to-gravityforms/',
				'image' => $images_url . 'gravity-forms.svg',
			],
			[
				'name' => 'TranslatePress',
				'author' => 'Reflection Media SRL',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-translatepress/',
				'description' => 'TranslatePress is the easiest way to translate your WordPress site and go multilingual. It\'s a proven way to grow multilingual traffic and reach more people.',
				'badge' => '15% Off',
				'offering' => 'Discount is automatically applied',
				'action_label' => 'Let\'s Go',
				'action_url' => 'https://go.elementor.com/wp-dash-apps-go-to-translatepress/',
				'image' => $images_url . 'translate-press.png',
			],
			[
				'name' => 'Profile Builder',
				'author' => 'Cozmoslabs',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-cozmoslabs-wordpress-profile-builder/',
				'description' => 'Create beautiful user registration forms, user profiles and member directories with the #1 user management tool for modern websites.',
				'badge' => '15% Off',
				'offering' => 'Discount is automatically applied',
				'action_label' => 'Let\'s Go',
				'action_url' => 'https://go.elementor.com/wp-dash-apps-go-to-cozmoslabs-wordpress-profile-builder/',
				'image' => $images_url . 'profile-builder.svg',
			],
			[
				'name' => 'Paid Member Subscriptions',
				'author' => 'Cozmoslabs',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-cozmoslabs-wordpress-paid-member-subscriptions/',
				'description' => 'Launch your membership site, online course or paid community, increase conversions and generate subscription revenue with one flexible and seamless solution.',
				'badge' => '15% Off',
				'offering' => 'Discount is automatically applied',
				'action_label' => 'Let\'s Go',
				'action_url' => 'https://go.elementor.com/wp-dash-apps-go-to-cozmoslabs-wordpress-paid-member-subscriptions/',
				'image' => $images_url . 'paid-member-subscriptions.svg',
			],
			[
				'name' => 'BetterDocs',
				'author' => 'WPDeveloper',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-wpdeveloper-betterdocs/',
				'description' => 'BetterDocs is the ultimate WordPress knowledge base tool to create powerful documentation, multiple or internal knowledge bases, FAQ sections, and more.',
				'badge' => '20% Off',
				'offering' => 'Use coupon code: Elementor20',
				'action_label' => 'Let\'s Go',
				'action_url' => 'https://go.elementor.com/wp-dash-apps-go-to-wpdeveloper-betterdocs/',
				'image' => $images_url . 'better-docs.svg',
			],
			[
				'name' => 'SchedulePress',
				'author' => 'WPDeveloper',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-wpdeveloper-wp-scheduled-posts/',
				'description' => 'SchedulePress is the advanced WordPress content management solution for effortlessly scheduling site content & sharing on multiple social media platforms.',
				'badge' => '20% Off',
				'offering' => 'Use coupon code: Elementor20',
				'action_label' => 'Let\'s Go',
				'action_url' => 'https://go.elementor.com/wp-dash-apps-go-to-wpdeveloper-wp-scheduled-posts/',
				'image' => $images_url . 'schedule-press.svg',
			],
			[
				'name' => 'BetterPayments',
				'author' => 'WPDeveloper',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-better-payment/',
				'description' => 'Better Payment is an advanced plugin to integrate payment gateways, like PayPal & Stripe, into your WordPress website to accept, manage & track payments.',
				'badge' => '20% Off',
				'offering' => 'Use coupon code: Elementor20',
				'action_label' => 'Let\'s Go',
				'action_url' => 'https://go.elementor.com/wp-dash-apps-go-to-better-payment/',
				'image' => $images_url . 'better-payment.svg',
			],
			[
				'name' => 'EmbedPress',
				'author' => 'WPDeveloper',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-embedpress/',
				'description' => 'EmbedPress is the ultimate WordPress plugin to easily embed multimedia content from 150+ sources and to boost website engagement & interaction.',
				'badge' => '20% Off',
				'offering' => 'Use coupon code: Elementor20',
				'action_label' => 'Let\'s Go',
				'action_url' => 'https://go.elementor.com/wp-dash-apps-go-to-embedpress/',
				'image' => $images_url . 'embed-press.svg',
			],
			[
				'name' => 'NotificationX',
				'author' => 'WPDeveloper',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-notificationx/',
				'description' => 'NotificationX is a leading WordPress FOMO & social proof marketing tool to create powerful notification alerts that boost site credibility and conversion.',
				'badge' => '20% Off',
				'offering' => 'Use coupon code: Elementor20',
				'action_label' => 'Let\'s Go',
				'action_url' => 'https://go.elementor.com/wp-dash-apps-go-to-notificationx/',
				'image' => $images_url . 'notification-x.svg',
			],
			[
				'name' => 'BetterLinks',
				'author' => 'WPDeveloper',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-betterlinks/',
				'description' => 'BetterLinks is the finest WordPress link management tool to easily create, shorten, manage, track, and analyze any website URLs and marketing campaigns.',
				'badge' => '20% Off',
				'offering' => 'Use coupon code: Elementor20',
				'action_label' => 'Let\'s Go',
				'action_url' => 'https://go.elementor.com/wp-dash-apps-go-to-betterlinks/',
				'image' => $images_url . 'better-links.svg',
			],
			[
				'name' => 'ShortPixel',
				'author' => 'ShortPixel',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-shortpixel/',
				'description' => 'Optimize images, PDFs and create WebP/AVIF version of all your website\'s images with an easy-to-use and lightweight plugin with great support.',
				'action_label' => 'Let\'s Go',
				'action_url' => 'https://go.elementor.com/wp-dash-apps-go-to-shortpixel/',
				'image' => $images_url . 'shortpixel.png',
			],
			[
				'name' => 'Solid WP',
				'author' => 'Stellar WP',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-solid-wp/',
				'description' => 'SolidWP provides best-in-case security, backups, and site maintenance plugins – the backbone of high-performing websites.',
				'action_label' => 'Let\'s Go',
				'action_url' => 'https://go.elementor.com/wp-dash-apps-go-to-solid-wp/',
				'image' => $images_url . 'solidwp.png',
			],
			[
				'name' => 'The Events Calendar',
				'author' => 'Stellar WP',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-the-events-calendar/',
				'description' => 'The Events Calendar is an essential plugin for seamless event management. Perfect for businesses, organizations & individuals hosting events of any scale.',
				'action_label' => 'Let\'s Go',
				'action_url' => 'https://go.elementor.com/wp-dash-apps-go-to-the-events-calendar/',
				'image' => $images_url . 'tec.png',
			],
			[
				'name' => 'GiveWP',
				'author' => 'Stellar WP',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-give-wp/',
				'description' => 'GiveWP is a WordPress plugin for nonprofit fundraising. Tailored for charities and organizations, simplifying online donations and boosting impact.',
				'action_label' => 'Let\'s Go',
				'action_url' => 'https://go.elementor.com/wp-dash-apps-go-to-give-wp/',
				'image' => $images_url . 'give.svg',
			],
			[
				'name' => 'LearnDash',
				'author' => 'Stellar WP',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-learndash/',
				'description' => 'LearnDash is a best-in-class LMS platform empowering educators, trainers, and businesses to create engaging online learning courses on WordPress.',
				'action_label' => 'Let\'s Go',
				'action_url' => 'https://go.elementor.com/wp-dash-apps-go-to-learndash/',
				'image' => $images_url . 'learndash.svg',
			],
			[
				'name' => 'Restrict Content Pro',
				'author' => 'Stellar WP',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-restrict-content-pro/',
				'description' => 'RCP is a WordPress plugin for effortless membership management and monetization, ideal for businesses & content creators seeking subscription-based models.',
				'action_label' => 'Let\'s Go',
				'action_url' => 'https://go.elementor.com/wp-dash-apps-go-to-restrict-content-pro/',
				'image' => $images_url . 'rcp.svg',
			],
			[
				'name' => 'Weglot',
				'author' => 'Weglot',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-weglot/',
				'description' => 'Weglot is one of the best WordPress multilingual plugins to translate and display your website in multiple languages.',
				'action_label' => 'Let\'s Go',
				'action_url' => 'https://go.elementor.com/wp-dash-apps-go-to-weglot/',
				'image' => $images_url . 'weglot.svg',
			],
			[
				'name' => 'Draw Attention',
				'author' => 'N Squared',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-draw-attention/',
				'description' => 'Easy to use drawing tool for creating interactive images (fully responsive image maps). Highlight sections of your images with clickable hotspots!',
				'action_label' => 'Let\'s Go',
				'action_url' => 'https://go.elementor.com/wp-dash-apps-go-to-draw-attention/',
				'image' => $images_url . 'draw-attention.png',
			],
			[
				'name' => 'Simply Schedule Appointments',
				'author' => 'N Squared',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-simply-schedule-appointments/',
				'description' => 'Meet the powerful WordPress booking plugin with built-in Elementor widgets, easy custom styling, unlimited booking calendars, and tons of integrations!',
				'action_label' => 'Let\'s Go',
				'action_url' => 'https://go.elementor.com/wp-dash-apps-go-to-simply-schedule-appointments/',
				'image' => $images_url . 'ssa.png',
			],
		];

		$wporg_plugins = [
			[
				'file_path' => 'aryo-activity-log/aryo-activity-log.php',
				'name' => 'Activity Log',
				'author' => 'Activity Log Team',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-activity-log/',
				'badge' => 'Free',
				'description' => 'Track user activity easily. Discover who does what on your website and perform a comprehensive security audit for peace of mind.',
				'learn_more_url' => 'https://go.elementor.com/wp-dash-apps-learn-more-activity-log/',
				'action_label' => 'Install',
				'action_url' => '#',
				'image' => $images_url . 'activity-log.png',
				'target' => '_self',
			],
			[
				'file_path' => 'pojo-accessibility/pojo-accessibility.php',
				'name' => 'One Click Accessibility',
				'author' => 'Accessibility Team',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-wpaccessibility/',
				'badge' => 'Free',
				'description' => 'The fastest plugin to enhance WordPress website accessibility. Empower your website to be user-friendly for all visitors.',
				'learn_more_url' => 'https://go.elementor.com/wp-dash-apps-learn-more-wpaccessibility/',
				'action_label' => 'Install',
				'action_url' => '#',
				'image' => $images_url . 'one-click-accessibility.png',
				'target' => '_self',
			],
		];

		foreach ( $wporg_plugins as $wporg_plugin_data ) {
			if ( static::is_plugin_activated( $wporg_plugin_data['file_path'] ) ) {
				continue;
			}

			if ( static::is_plugin_installed( $wporg_plugin_data['file_path'] ) ) {
				if ( current_user_can( 'activate_plugins' ) ) {
					$wporg_plugin_data['action_label'] = 'Activate';
					$wporg_plugin_data['action_url'] = static::get_activate_plugin_url( $wporg_plugin_data['file_path'] );
				} else {
					$wporg_plugin_data['action_label'] = 'Cannot Activate';
					$wporg_plugin_data['action_url'] = '#';
				}
			} else {
				if ( current_user_can( 'install_plugins' ) ) {
					$wporg_plugin_data['action_label'] = 'Install';
					$wporg_plugin_data['action_url'] = static::get_install_plugin_url( $wporg_plugin_data['file_path'] );
				} else {
					$wporg_plugin_data['action_label'] = 'Cannot Install';
					$wporg_plugin_data['action_url'] = '#';
				}
			}

			array_unshift( $plugins, $wporg_plugin_data );
		}

		if ( ! static::is_elementor_pro_installed() ) {
			array_unshift( $plugins, [
				'name' => 'Elementor Pro',
				'author' => 'Elementor',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-elementor-pro/',
				'badge' => 'Premium',
				'description' => 'Unlock Elementor Pro and build any website with advanced design capabilities, marketing tools, WooCommerce features, Dynamic Content, and more.',
				'action_label' => 'Let\'s Go',
				'action_url' => 'https://go.elementor.com/wp-dash-apps-go-to-elementor-pro/',
				'image' => $images_url . 'elementor.svg',
			] );
		}

		return $plugins;
	}

	private static function get_images_url() {
		return ELEMENTOR_URL . 'modules/apps/images/';
	}

	private static function is_elementor_pro_installed() {
		return defined( 'ELEMENTOR_PRO_VERSION' );
	}

	private static function is_plugin_installed( $file_path ) {
		$installed_plugins = get_plugins();

		return isset( $installed_plugins[ $file_path ] );
	}

	private static function is_plugin_activated( $file_path ) {
		return is_plugin_active( $file_path );
	}

	private static function get_activate_plugin_url( $file_path ) {
		return wp_nonce_url( 'plugins.php?action=activate&amp;plugin=' . $file_path . '&amp;plugin_status=all&amp;paged=1&amp;s', 'activate-plugin_' . $file_path );
	}

	private static function get_install_plugin_url( $file_path ) {
		$slug = dirname( $file_path );

		return wp_nonce_url( self_admin_url( 'update.php?action=install-plugin&plugin=' . $slug ), 'install-plugin_' . $slug );
	}

	private static function render_plugin_item( $plugin ) {
		?>
		<div class="e-a-item">
			<div class="e-a-heading">
				<img class="e-a-img" src="<?php echo esc_url( $plugin['image'] ); ?>" alt="<?php echo esc_attr( $plugin['name'] ); ?>">
				<?php if ( ! empty( $plugin['badge'] ) ) : ?>
					<span class="e-a-badge"><?php echo esc_html( $plugin['badge'] ); ?></span>
				<?php endif; ?>
			</div>
			<h3 class="e-a-title"><?php echo esc_html( $plugin['name'] ); ?></h3>
			<p class="e-a-author"><?php esc_html_e( 'By', 'elementor' ); ?> <a href="<?php echo esc_url( $plugin['author_url'] ); ?>" target="_blank"><?php echo esc_html( $plugin['author'] ); ?></a></p>
			<div class="e-a-desc">
				<p><?php echo esc_html( $plugin['description'] ); ?></p>
				<?php if ( ! empty( $plugin['offering'] ) ) : ?>
					<p class="e-a-offering"><?php echo esc_html( $plugin['offering'] ); ?></p>
				<?php endif; ?>
			</div>

			<p class="e-a-actions">
				<?php if ( ! empty( $plugin['learn_more_url'] ) ) : ?>
					<a class="e-a-learn-more" href="<?php echo esc_url( $plugin['learn_more_url'] ); ?>" target="_blank"><?php echo esc_html__( 'Learn More', 'elementor' ); ?></a>
				<?php endif; ?>
				<a href="<?php echo esc_url( $plugin['action_url'] ); ?>" class="e-btn e-accent" target="<?php echo isset( $plugin['target'] ) ? esc_attr( $plugin['target'] ) : '_blank'; ?>"><?php echo esc_html( $plugin['action_label'] ); ?></a>
			</p>
		</div>
		<?php
	}
}
