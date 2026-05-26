<?php

namespace Drupal\access_widget\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Settings form for the Access Widget module.
 */
class AccessWidgetSettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return ['access_widget.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'access_widget_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('access_widget.settings');

    // ── Position ─────────────────────────────────────────────────────────────
    $form['position_settings'] = [
      '#type'  => 'details',
      '#title' => $this->t('Widget Position'),
      '#open'  => TRUE,
    ];

    $form['position_settings']['position'] = [
      '#type'          => 'select',
      '#title'         => $this->t('Corner'),
      '#description'   => $this->t('Where the widget is anchored on the screen (position: fixed).'),
      '#options'       => [
        'top-left'     => $this->t('Top Left'),
        'top-right'    => $this->t('Top Right'),
        'bottom-left'  => $this->t('Bottom Left'),
        'bottom-right' => $this->t('Bottom Right'),
      ],
      '#default_value' => $config->get('position'),
    ];

    $form['position_settings']['offset_x'] = [
      '#type'          => 'number',
      '#title'         => $this->t('Horizontal offset (px)'),
      '#description'   => $this->t('Distance from the left or right edge of the viewport.'),
      '#default_value' => $config->get('offset_x'),
      '#min'           => 0,
      '#max'           => 500,
      '#field_suffix'  => 'px',
    ];

    $form['position_settings']['offset_y'] = [
      '#type'          => 'number',
      '#title'         => $this->t('Vertical offset (px)'),
      '#description'   => $this->t('Distance from the top or bottom edge of the viewport.'),
      '#default_value' => $config->get('offset_y'),
      '#min'           => 0,
      '#max'           => 500,
      '#field_suffix'  => 'px',
    ];

    // ── Font Size ─────────────────────────────────────────────────────────────
    $form['font_size_settings'] = [
      '#type'  => 'details',
      '#title' => $this->t('Font Size Controls'),
      '#open'  => TRUE,
    ];

    $form['font_size_settings']['enable_font_size'] = [
      '#type'          => 'checkbox',
      '#title'         => $this->t('Enable font size controls'),
      '#default_value' => $config->get('enable_font_size'),
    ];

    $font_visible = [':input[name="enable_font_size"]' => ['checked' => TRUE]];

    $form['font_size_settings']['font_size_default'] = [
      '#type'          => 'number',
      '#title'         => $this->t('Default font size'),
      '#default_value' => $config->get('font_size_default'),
      '#min'           => 50,
      '#max'           => 200,
      '#field_suffix'  => '%',
      '#states'        => ['visible' => $font_visible],
    ];

    $form['font_size_settings']['font_size_min'] = [
      '#type'          => 'number',
      '#title'         => $this->t('Minimum font size'),
      '#description'   => $this->t('Smallest size a visitor can set.'),
      '#default_value' => $config->get('font_size_min'),
      '#min'           => 50,
      '#max'           => 200,
      '#field_suffix'  => '%',
      '#states'        => ['visible' => $font_visible],
    ];

    $form['font_size_settings']['font_size_max'] = [
      '#type'          => 'number',
      '#title'         => $this->t('Maximum font size'),
      '#description'   => $this->t('Largest size a visitor can set.'),
      '#default_value' => $config->get('font_size_max'),
      '#min'           => 50,
      '#max'           => 200,
      '#field_suffix'  => '%',
      '#states'        => ['visible' => $font_visible],
    ];

    $form['font_size_settings']['font_size_step'] = [
      '#type'          => 'number',
      '#title'         => $this->t('Step size'),
      '#description'   => $this->t('How much each A+ or A- click changes the size.'),
      '#default_value' => $config->get('font_size_step'),
      '#min'           => 1,
      '#max'           => 50,
      '#field_suffix'  => '%',
      '#states'        => ['visible' => $font_visible],
    ];

    // ── Dark Mode ─────────────────────────────────────────────────────────────
    $form['dark_mode_settings'] = [
      '#type'  => 'details',
      '#title' => $this->t('Dark Mode'),
      '#open'  => TRUE,
    ];

    $form['dark_mode_settings']['enable_dark_mode'] = [
      '#type'          => 'checkbox',
      '#title'         => $this->t('Enable dark mode toggle'),
      '#default_value' => $config->get('enable_dark_mode'),
    ];

    $dm_visible = [':input[name="enable_dark_mode"]' => ['checked' => TRUE]];

    $form['dark_mode_settings']['dark_mode_default'] = [
      '#type'          => 'radios',
      '#title'         => $this->t('Default mode'),
      '#description'   => $this->t('"Follow OS" reads the visitor\'s <code>prefers-color-scheme</code> media feature on first visit.'),
      '#options'       => [
        'light'  => $this->t('Light'),
        'dark'   => $this->t('Dark'),
        'system' => $this->t('Follow OS / Browser setting'),
      ],
      '#default_value' => $config->get('dark_mode_default'),
      '#states'        => ['visible' => $dm_visible],
    ];

    // ── Preferences ───────────────────────────────────────────────────────────
    $form['preference_settings'] = [
      '#type'  => 'details',
      '#title' => $this->t('User Preferences'),
      '#open'  => TRUE,
    ];

    $form['preference_settings']['persist_preferences'] = [
      '#type'          => 'checkbox',
      '#title'         => $this->t('Remember visitor preferences (localStorage)'),
      '#description'   => $this->t('Saves each visitor\'s chosen font size and dark mode in their browser. No server-side storage is used.'),
      '#default_value' => $config->get('persist_preferences'),
    ];

    // ── Visibility ────────────────────────────────────────────────────────────
    $form['visibility_settings'] = [
      '#type'  => 'details',
      '#title' => $this->t('Visibility'),
      '#open'  => TRUE,
    ];

    $form['visibility_settings']['hide_on_admin'] = [
      '#type'          => 'checkbox',
      '#title'         => $this->t('Hide on administration pages'),
      '#description'   => $this->t('The widget will not appear on any <code>/admin/*</code> routes.'),
      '#default_value' => $config->get('hide_on_admin'),
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    $min = (int) $form_state->getValue('font_size_min');
    $max = (int) $form_state->getValue('font_size_max');
    $def = (int) $form_state->getValue('font_size_default');

    if ($min >= $max) {
      $form_state->setErrorByName('font_size_min', $this->t('Minimum font size must be less than the maximum.'));
    }
    if ($def < $min || $def > $max) {
      $form_state->setErrorByName('font_size_default', $this->t('Default font size must be between the minimum and maximum values.'));
    }

    parent::validateForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $this->config('access_widget.settings')
      ->set('position',          $form_state->getValue('position'))
      ->set('offset_x',          (int) $form_state->getValue('offset_x'))
      ->set('offset_y',          (int) $form_state->getValue('offset_y'))
      ->set('enable_font_size',  (bool) $form_state->getValue('enable_font_size'))
      ->set('font_size_default', (int) $form_state->getValue('font_size_default'))
      ->set('font_size_min',     (int) $form_state->getValue('font_size_min'))
      ->set('font_size_max',     (int) $form_state->getValue('font_size_max'))
      ->set('font_size_step',    (int) $form_state->getValue('font_size_step'))
      ->set('enable_dark_mode',  (bool) $form_state->getValue('enable_dark_mode'))
      ->set('dark_mode_default', $form_state->getValue('dark_mode_default'))
      ->set('persist_preferences', (bool) $form_state->getValue('persist_preferences'))
      ->set('hide_on_admin',     (bool) $form_state->getValue('hide_on_admin'))
      ->save();

    parent::submitForm($form, $form_state);
  }

}
