# islandora-jexcel-scratchpad
 Exploring using jExcel as a bulk metadata editor for Islandora 8.

## Proofs of Concept:

- [Spreadsheet](spreadsheet.html) - The initial proof of concept exploring spreadsheet options.
- [Import CSV](papaparse.html) - Explores loading from a spreadsheet. (Still a lot to do here; could use an Excel-like import wizard to work really well.)
- [Load files](filedrag.html) - Explores populating a spreadsheet from a list of files on the user's computer. (Works best on Chrome; waiting for the [Electron app](https://electronjs.org/) skeleton.)
- [Load from Drupal Content Type](load_content_type.html) - Explores building an empty spreadsheet based on the entity's form display. (Assumes JSON:API is enabled on a site located at localhost:8000.)
- [Load Content Type and File List](combined.html) - Combines the "load files" and "load Drupal content type" examples above.
- [Load View](view.html) - Uses a [View](views.view.test.yml) (serialized as json) and [image_base64_formatter](https://www.drupal.org/project/image_base64_formatter) to populate the spreadsheet. (Useful for either editing lots of nodes or creating bulk-upload templates) *Note: Won't work as a base for updating nodes because we need the full object to perform the update, not just the changed field unless we create our own update point we can POST changes to. Right now it is most useful for creating a display, not an editor.*

## TODOs:

- CSV Import Wizard
- Make JSON:API Endpoint and Drupal credentials configurable (currently using 'localhost:8000/jsonapi' and 'admin:islandora', respectively).
- Lazy-loading/pagination support for [view-based tables](view.html).
- Dropdown/autocomplete improvements:
  - JSON:API pagination support for dropdowns and autocompletes (need a bigger test set loaded).
  - Sort the dropdown source arrays after updates.
  - Detect dropdown cardinality (jExcel supports either '1' or 'many'; so, if cardinality !== 1 then use 'multiple' setting. We currently default to 'multiple' regardless of cardinality).
  - Support dropdowns with missing target_bundles (use 'all' the available bundles). (Probably an uncommon edge-case.)
- Highlight changed cells (if content is preloaded).
- "Hide" and "Show" column buttons.
- Update node on cell change. (If we ever get partial node updates working.)