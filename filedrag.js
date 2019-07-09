var file;

// getElementById
function $id(id) {
  return document.getElementById(id);
}

// file selection
function FileSelectHandler(e) {

  // cancel event and hover styling
  FileDragHover(e);

  // fetch FileList object
  var files = e.target.files || e.dataTransfer.files;
  file = files[0];

  // Build spreadsheet
  var data = [];
  for (let i=0; i<files.length; i++) {
    path = files[i].webkitRelativePath;
    if (!path) {
      path = files[i].name;
    }
    let row = [
      '', //Thumbnail
      path, //File path
      '', //Title
      '', //Date
      '', //Description
      '', //Rights
      files[i].size + ' bytes', //Extent, Possible TODO: human-friendly extent.
      '', //Subjects
      '', //Access Terms
      '', //Member Of
      '', //Node ID
    ];
    data.push(row);
  };

  loadData(data, [
      {
          type: 'image',
          title: 'Thumbnail',
          width: 120
      },
      {
          type: 'text',
          title: 'File',
          width: 120
      },
      {
          type: 'text',
          title: 'Title',
          width: 120,
          wordWrap: true
      },
      {
          type: 'text',
          title: 'Date',
          width: 120
      },
      {
          type: 'text',
          title: 'Description',
          width: 120,
          wordWrap: true
      },
      {
          type: 'text',
          title: 'Rights',
          width: 120,
          wordWrap: true
      },
      {
          type: 'text',
          title: 'Extent',
          width: 100,
          wordWrap: true
      },
      {
          type: 'autocomplete',
          title: 'Subjects',
          width: 200,
          multiple: true,
          source: subjectsDropdown
      },
      {
          type: 'dropdown',
          title: 'Access Terms',
          width: 200,
          multiple: true,
          source: accessDropdown
      },
      {
          type: 'dropdown',
          title: 'Member Of',
          width: 120,
          source: []
      },
      {
          type: 'hidden',
          title: 'Node ID'
      }
  ]);

}

// file drag hover
function FileDragHover(e) {
  e.stopPropagation();
  e.preventDefault();
  e.target.className = (e.type == "dragover" ? "hover" : "");
}

// call initialization file
if (window.File && window.FileList && window.FileReader) {
  Init();
}

//
// initialize
function Init() {
  var fileselect = $id("fileselect"),
    filedrag = $id("filedrag"),
    submitbutton = $id("submitbutton");

  // file select
  fileselect.addEventListener("change", FileSelectHandler, false);

  // is XHR2 available?
  var xhr = new XMLHttpRequest();
  if (xhr.upload) {
    // file drop
    filedrag.addEventListener("dragover", FileDragHover, false);
    filedrag.addEventListener("dragleave", FileDragHover, false);
    filedrag.addEventListener("drop", FileSelectHandler, false);
    filedrag.style.display = "block";

    // remove submit button
    submitbutton.style.display = "none";
  }

}
