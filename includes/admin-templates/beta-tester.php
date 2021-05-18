<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}
$user = wp_get_current_user();

$ajax = Plugin::$instance->common->get_component( 'ajax' );

$beta_tester_email = $user->user_email;

/**
 * Print beta tester dialog.
 *
 * Display a dialog box to suggest the user to opt-in to the beta testers newsletter.
 *
 * Fired by `admin_footer` filter.
 *
 * @since  2.6.0
 * @access public
 */
?>
<script type="text/template" id="tmpl-elementor-beta-tester">
	<form id="elementor-beta-tester-form" method="post">
		<?php // PHPCS - This is a nonce, doesn't need to be escaped. ?>
		<input type="hidden" name="_nonce" value="<?php echo $ajax->create_nonce(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>">
		<input type="hidden" name="action" value="elementor_beta_tester_signup" />
		<div id="elementor-beta-tester-form__caption"><?php echo esc_html__( 'Get Beta Updates', 'elementor' ); ?></div>
		<div id="elementor-beta-tester-form__description"><?php echo esc_html__( 'As a beta tester, you’ll receive an update that includes a testing version of Elementor and its content directly to your Email', 'elementor' ); ?></div>
		<div id="elementor-beta-tester-form__input-wrapper">
			<input id="elementor-beta-tester-form__email" name="beta_tester_email" type="email" placeholder="<?php echo esc_html__( 'Your Email', 'elementor' ); ?>" required value="<?php echo esc_html( $beta_tester_email ); ?>" />
			<button id="elementor-beta-tester-form__submit" class="elementor-button elementor-button-success">
				<span class="elementor-state-icon">
					<i class="eicon-loading eicon-animation-spin" aria-hidden="true"></i>
				</span>
				<?php echo esc_html__( 'Sign Up', 'elementor' ); ?>
			</button>
		</div>
		<div id="elementor-beta-tester-form__terms">
			<?php // PHPCS - The content is escaped inside the sprintf. ?>
			<?php echo sprintf( esc_html__( 'By clicking Sign Up, you agree to Elementor\'s <a href="%1$s">Terms of Service</a> and <a href="%2$s">Privacy Policy</a>', 'elementor' ), Beta_Testers::NEWSLETTER_TERMS_URL, Beta_Testers::NEWSLETTER_PRIVACY_URL ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		</div>
	</form>
</script>
