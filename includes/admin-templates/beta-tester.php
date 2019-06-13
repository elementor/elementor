<?php
namespace Elementor;

use Elementor\Core\Admin\Admin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

$user = wp_get_current_user();

$ajax = Plugin::$instance->common->get_component( 'ajax' );

/**
 * Print beta tester dialog.
 *
 * Display a dialog box to suggest the user to opt-in to the beta testers newsletter.
 *
 * Fired by `admin_footer` filter.
 *
 * @since 2.6.0
 * @access public
 */
?>
<script type="text/template" id="tmpl-elementor-beta-tester">
	<form id="elementor-beta-tester-form" method="post">
		<input type="hidden" name="_nonce" value="<?php echo $ajax->create_nonce(); ?>">
		<input type="hidden" name="action" value="elementor_beta_tester_newsletter"/>
		<div id="elementor-beta-tester-form__caption"><?php echo __( 'Beta Testers Newsletter', 'elementor' ); ?></div>
		<div id="elementor-beta-tester-form__description"><?php echo __( 'Want to be the first to hear about new features & software improvements? leave your email below', 'elementor' ); ?></div>
		<div id="elementor-beta-tester-form__input-wrapper">
			<input id="elementor-beta-tester-form__email" name="beta_tester_email" type="email" placeholder="<?php echo __( 'Your Email', 'elementor' ); ?>" required value="<?php echo $user->user_email; ?>"/>
			<button id="elementor-beta-tester-form__submit" class="elementor-button elementor-button-success">
				<span class="elementor-state-icon">
					<i class="eicon-loading eicon-animation-spin" aria-hidden="true"></i>
				</span>
				<?php echo __( 'Sign Up', 'elementor' ); ?>
			</button>
		</div>
		<div id="elementor-beta-tester-form__terms">
			<?php echo sprintf( __( 'By entering your email, you agree to Elementor\'s <a href="%1$s">Terms of Service</a> and <a href="%2$s">Privacy Policy</a>', 'elementor' ), Beta_Testers::NEWSLETTER_TERMS_URL, Beta_Testers::NEWSLETTER_PRIVACY_URL ); ?>
		</div>
	</form>
</script>
