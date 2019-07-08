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

// Get the dropdowns ready.
var jsonApiPrefix = 'http://localhost:8000/jsonapi/';

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
  // Load it.
  spreadsheet = jexcel(spreadsheetDiv, {
      data:data,
      // search:true, // https://github.com/paulhodel/jexcel/issues/418#event-2458477505
      columns: columns,
       // colAlignments: [ 'center', 'left', 'left', 'left', 'left', 'left', 'left' ],
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
