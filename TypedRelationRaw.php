<?php

namespace Drupal\controlled_access_terms\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\Plugin\Field\FieldFormatter\EntityReferenceIdFormatter;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Form\FormStateInterface;

/**
 * TypedRelation field formatter plugin for raw values.
 *
 * @FieldFormatter(
 *   id = "typed_relation_raw",
 *   label = @Translation("Typed Relation Raw"),
 *   field_types = {
 *     "typed_relation"
 *   }
 * )
 */
class TypedRelationRaw extends EntityReferenceIdFormatter {

  /**
   * (@inheritdoc}
   */
  public static function defaultSettings() {
    return ['delimiter' => '|'] + parent::defaultSettings();
  }

//  /**
//   * {@inheritdoc}
//   */
//  public function settingsForm(array $form, FormStateInterface $form_state) {
//    $form['delimiter'] = [
//      '#title' => t('Relation and Entity Separator'),
//      '#type' => 'textfield',
//      '#size' => 5,
//      '#description' => t("The delimiter between the relator and the target's ID."),
//      '#default_value' => $this->getSetting('delimiter'),
//    ];
//
//    return $form;
//  }

//  /**
//   * {@inheritdoc}
//   */
//  public function settingsSummary() {
//    $summary = parent::settingsSummary();
//   $summary[] = t('Delimiter: @delimiter', ['@delimiter' => $this->getSetting('delimiter')]);
//    return $summary;
//  }

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
\Drupal::logger('test')->notice('Before viewElements runs');
   $elements = parent::viewElements($items, $langcode);
\Drupal::logger('test')->notice('After parent::viewElements runs');
    $delimiter = $this->getSetting('delimiter');
    foreach ($items as $delta => $item) {
      $elements[$delta]['#prefix'] = $item->rel_type . $delimiter;
    }
\Drupal::logger('test')->notice('About to return');
    return $elements;
  }

}