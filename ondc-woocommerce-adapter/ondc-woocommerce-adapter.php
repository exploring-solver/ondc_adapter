<?php
/**
 * Plugin Name: ONDC WooCommerce Adapter
 * Description: Enables WooCommerce stores to become ONDC compliant by handling post-order APIs
 * Version: 1.0.0
 * Author: exploring-solver
 * License: GPL v2 or later
 */

// Prevent direct access to this file
if (!defined('ABSPATH')) {
    exit;
}

// Main plugin class
class ONDC_WooCommerce_Adapter {
    private $plugin_options_key = 'ondc_woocommerce_settings';

    public function __construct() {
        // Add admin menu
        add_action('admin_menu', array($this, 'add_admin_menu'));
        // Register settings
        add_action('admin_init', array($this, 'register_settings'));
        // Add settings link to plugins page
        add_filter('plugin_action_links_' . plugin_basename(__FILE__), array($this, 'add_settings_link'));
    }

    // Add menu item to WordPress admin
    public function add_admin_menu() {
        add_menu_page(
            'ONDC Integration', // Page title
            'ONDC Settings', // Menu title
            'manage_options', // Capability required
            'ondc-settings', // Menu slug
            array($this, 'render_settings_page'), // Callback function
            'dashicons-cart', // Icon
            56 // Position
        );
    }

    // Register plugin settings
    public function register_settings() {
        register_setting(
            'ondc_woocommerce_settings',
            $this->plugin_options_key,
            array($this, 'sanitize_settings')
        );
    }

    // Sanitize settings before saving
    public function sanitize_settings($input) {
        $sanitized = array();
        if (isset($input['consumer_key'])) {
            $sanitized['consumer_key'] = sanitize_text_field($input['consumer_key']);
        }
        if (isset($input['consumer_secret'])) {
            $sanitized['consumer_secret'] = sanitize_text_field($input['consumer_secret']);
        }
        return $sanitized;
    }

    // Add settings link on plugin page
    public function add_settings_link($links) {
        $settings_link = '<a href="admin.php?page=ondc-settings">Settings</a>';
        array_unshift($links, $settings_link);
        return $links;
    }

    // Render the settings page
    public function render_settings_page() {
        // Get existing settings
        $options = get_option($this->plugin_options_key, array(
            'consumer_key' => '',
            'consumer_secret' => ''
        ));

        ?>
        <div class="wrap">
            <h1>ONDC WooCommerce Integration Settings</h1>
            
            <form method="post" action="options.php">
                <?php settings_fields('ondc_woocommerce_settings'); ?>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="consumer_key">WooCommerce Consumer Key</label>
                        </th>
                        <td>
                            <input type="text" 
                                   id="consumer_key" 
                                   name="<?php echo $this->plugin_options_key; ?>[consumer_key]" 
                                   value="<?php echo esc_attr($options['consumer_key']); ?>" 
                                   class="regular-text">
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="consumer_secret">WooCommerce Consumer Secret</label>
                        </th>
                        <td>
                            <input type="password" 
                                   id="consumer_secret" 
                                   name="<?php echo $this->plugin_options_key; ?>[consumer_secret]" 
                                   value="<?php echo esc_attr($options['consumer_secret']); ?>" 
                                   class="regular-text">
                        </td>
                    </tr>
                </table>

                <div class="ondc-help-section" style="margin-top: 20px; padding: 15px; background: #fff; border-left: 4px solid #00a0d2;">
                    <h3>How to get your WooCommerce API Keys?</h3>
                    <p>Follow these steps to generate your WooCommerce Consumer Key and Secret:</p>
                    <ol>
                        <li>Go to your WooCommerce settings</li>
                        <li>Click on the "Advanced" tab</li>
                        <li>Click on "REST API"</li>
                        <li>Click "Add Key"</li>
                        <li>Give the key a description and set permissions to "Read/Write"</li>
                        <li>Click "Generate API Key"</li>
                    </ol>
                    <p>For detailed instructions with screenshots, visit our 
                        <a href="https://merchanter.helpjuice.com/woo-commerce/how-to-create-woocommerce-consumer-key-secret" 
                           target="_blank">help guide</a>.
                    </p>
                </div>

                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }

    // Verify WooCommerce API credentials
    public function verify_credentials($consumer_key, $consumer_secret) {
        // Implement credential verification logic here
        // You might want to make a test API call to WooCommerce
        return true;
    }

    // Get stored credentials
    public static function get_credentials() {
        $options = get_option('ondc_woocommerce_settings');
        return array(
            'consumer_key' => isset($options['consumer_key']) ? $options['consumer_key'] : '',
            'consumer_secret' => isset($options['consumer_secret']) ? $options['consumer_secret'] : ''
        );
    }
}

// Initialize the plugin
function initialize_ondc_adapter() {
    new ONDC_WooCommerce_Adapter();
}

add_action('plugins_loaded', 'initialize_ondc_adapter');

// Activation hook
register_activation_hook(__FILE__, 'ondc_adapter_activate');
function ondc_adapter_activate() {
    // Check if WooCommerce is active
    if (!class_exists('WooCommerce')) {
        deactivate_plugins(plugin_basename(__FILE__));
        wp_die('This plugin requires WooCommerce to be installed and activated.');
    }
}