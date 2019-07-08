var jsonApiPrefix = 'http://localhost:8000/jsonapi/';
var jsonApiHeaders = new Headers();
jsonApiHeaders.append('Authorization', 'Basic ' + btoa('admin'+':'+'islandora'));

var widgetMap = {
  // Only includes non-text items.
  boolean_checkbox: 'checkbox',
  entity_reference_autocomplete_tags: 'autocomplete',
  entity_reference_autocomplete: 'autocomplete',
  number: 'numeric',
  options_buttons: 'dropdown',
  options_select: 'dropdown',
};

// Function to load dropdown boxes with Taxonomy terms.
// TODO: sort the terms after an update.
// TODO: jsonapi pagination support
function updateDropdown(dropdown, termsPrefix, ...vocabs){
  vocabs.forEach(function(vocab) {
    fetch(termsPrefix+vocab)
      .then(function(response) {
        return response.json();
      })
      .then(function(jsonapiResponse) {
        jsonapiResponse.data.forEach(function(term) {
          // Add the term if it is NOT already in the dropdown.
          if (dropdown.findIndex(existingTerm => existingTerm.id === term.attributes.drupal_internal__tid) === -1) {
            term = {
              'name': term.attributes.name,
              'id': term.attributes.drupal_internal__tid
            };
            dropdown.push(term);
          }
        });
      });
  });
}

// Populate content types dropdown
function listContentTypes(){
  fetch(jsonApiPrefix+'node_type/node_type')
    .then(function(response) {
      return response.json();
    })
    .then(function(jsonapiResponse) {
      select = document.getElementById('content_type_select');
      jsonapiResponse.data.forEach(function(contentType){
        select.options[select.options.length] = new Option(contentType.attributes.name, contentType.attributes.drupal_internal__type);
      })
    });
}

// Get the dropdowns ready.
subjectsDropdown = [];
updateDropdown(subjectsDropdown, jsonApiPrefix + 'taxonomy_term/', 'subject', 'geo_location', 'person','family','corporate_body');

accessDropdown = [];
updateDropdown(accessDropdown, jsonApiPrefix + 'taxonomy_term/', 'islandora_access');

// Configure and initialize the spreadsheet.
function loadData(data, columns = [ // TODO: Make configurable based on Drupal Content Type inspection.
    { type: 'image', title:'Thumbnail', width:120 },
    { type: 'text', title:'File', width:120 },
    { type: 'text', title:'Title', width:120, wordWrap:true },
    { type: 'text', title:'Date', width:120 },
    { type: 'text', title:'Description', width:120, wordWrap:true },
    { type: 'text', title:'Rights', width:120, wordWrap:true },
    { type: 'text', title:'Extent', width:100, wordWrap:true },
    { type: 'autocomplete', title:'Subjects', width:200, multiple: true, source:subjectsDropdown },
    { type: 'dropdown', title:'Access Terms', width:200, multiple: true, source:accessDropdown },
    { type: 'dropdown', title:'Member Of', width:120, source:[] },
    { type: 'hidden', title:'Node ID'},
 ]) {
  // Reset the sheet.
  spreadsheetDiv = document.getElementById('spreadsheet');
  spreadsheetDiv.innerHTML = '';

  // Column alignments, first (thumbnail) is centered, the rest are left.
  colAlignments = Array(columns.length - 1).fill('left');
  colAlignments.unshift('center');

  // Load the spreadsheet.
  spreadsheet = jexcel(spreadsheetDiv, {
      data:data,
      // search:true, // https://github.com/paulhodel/jexcel/issues/418#event-2458477505
      columns: columns,
       colAlignments: colAlignments,
       updateTable:function(instance, cell, col, row, val, label, cellName) {
          // Odd row colours
          if (row % 2) {
              cell.style.backgroundColor = '#edf3ff';
          }
      },
      toolbar:[
        { type:'i', content:'undo', onclick:function() { spreadsheet.undo(); } },
        { type:'i', content:'redo', onclick:function() { spreadsheet.redo(); } },
        { type:'i', content:'save', onclick:function () { spreadsheet.download(); } },
        { type:'i', content:'format_align_left', k:'text-align', v:'left' },
        { type:'i', content:'format_align_center', k:'text-align', v:'center' },
        { type:'i', content:'format_align_right', k:'text-align', v:'right' },
    ],
  });
}

// Test to show we can refresh a dropdown without duplicating term ids.
// updateDropdown(subjectsDropdown, jsonApiPrefix + 'taxonomy_term/', 'subject');

// Load Spreadsheet based on content type
function loadContentType() {
  contentType = document.getElementById('content_type_select').value;

  let formFields = fetch(jsonApiPrefix+'entity_form_display/entity_form_display?filter[type][condition][path]=bundle&filter[type][condition][value]='+contentType, {headers: jsonApiHeaders})
    .then(function(response) {
      return response.json();
    })
    .then(function(jsonapiResponse) {
      return jsonapiResponse.data[0].attributes.content;
    });

  // TODO: Add core field overrides to field Settings.
  let fieldSettings = fetch(jsonApiPrefix+'field_config/field_config?filter[type][condition][path]=bundle&filter[type][condition][value]='+contentType, {headers: jsonApiHeaders})
    .then(function(response) {
      return response.json();
    })
    .then(function(jsonapiResponse) {
      let fields = {};
      jsonapiResponse.data.forEach(function(field){
        fields[field.attributes.field_name] = {
          displayName: field.attributes.label,
          required: field.attributes.required,
          defaultValue: field.attributes.default_value,
          settings: field.attributes.settings
        };
      });
      return fields;
    });

  Promise.all([formFields, fieldSettings]).then(function(promises){
    formFields = promises[0];
    fieldSettings = promises[1];
    console.log('Form Fields',formFields);
    console.log('Field Settings',fieldSettings);

    columns = [];
    for (var field in formFields){
      // Defaults
      column = {
        id: field,
        type: 'text',
        title: field,
        width: 200,
        weight: formFields[field].weight
      };
      if (formFields[field].type in widgetMap){
        column.type = widgetMap[formFields[field].type];
      }
      if (formFields[field].settings.rows > 1) {
        column.wordWrap = true;
      }
      // The resulting fields are probably too big...
      // if (formFields[field].settings.size > 1) {
      //   // One character is roughly 16 pixels wide at 12pt font (http://pxtoem.com/).
      //   column.width = formFields[field].settings.size * 16;
      // }
      if (field in fieldSettings) {
        column.title = fieldSettings[field].displayName;

        // Assume dropdowns and autocomplete are multiples until we
        // are able to check field storage configs.
        if (['autocomplete','dropdown'].includes(column.type)){
          dropdownSource = [];
          column.source = dropdownSource;
          column.multiple = true;
          // TODO: We don't yet support missing target_bundles (all bundles of type).
          if (typeof fieldSettings[field].settings.handler_settings.target_bundles !== 'undefined'){
            targetType = fieldSettings[field].settings.handler.replace(/^(default:)/,'');
            targetBundles = Object.keys(fieldSettings[field].settings.handler_settings.target_bundles);
            updateDropdown(dropdownSource, jsonApiPrefix + targetType + '/', ...targetBundles);
          }
        }
      }
      columns.push(column);
    }
    columns.sort((a,b) => {return a.weight - b.weight;});
    columns.unshift({ type: 'image', title:'Thumbnail', width:120 });

    data = [Array(columns.length).fill('')];
    console.log('Spreadsheet columns:',columns);
    loadData(data,columns);
  });
}
