# Expected Location Importer Spec

## Purpose

This is a static, vanilla JavaScript single page app for importing Everbridge Expected Locations into Everbridge Suite through the REST API.

The app supports manual row entry and CSV import, lets users review and edit rows in a table, then sends the validated payload to Everbridge using Basic Auth.

The app also supports local schedules for operational workflows. A schedule represents one imported or manually managed schedule and stores returned Everbridge Expected Location IDs so users can later retrieve, update, or remove those locations in bulk.

## Conversation Summary

The project started as a static Expected Location CSV importer and expanded into a schedule-management tool for maintaining groups of Expected Locations over time. The current agreed behavior is:

- Use `Schedule`, not `Session`, in the user interface.
- Each schedule has a UUID, name, description, history, saved location references, drafts, and last known row snapshots.
- Saved schedules live only in the current browser on the current computer; the Schedule section must show a clear storage notice at the bottom of the section.
- The Schedule header contains the section title, saved schedule dropdown, `New`, and `Delete` icon buttons on the same row where space allows.
- Schedule name and description sit inside the Schedule section as full-width stacked fields with labels on the left.
- Loading a CSV adds rows as local drafts to the active schedule. If no schedule is selected, the app creates a new schedule named `Schedule <timestamp>`.
- Selecting a saved schedule saves the current schedule first, then loads the selected schedule.
- Rows retrieved from Everbridge while switching saved schedules use a `Refreshing` status, not `Sending`, because the operation is a GET that refreshes local data.
- Saved schedule data is restored from this browser immediately, but Everbridge refresh requires complete authentication. Because the password is never stored, a page reload shows local saved details and asks the user to enter the password before clicking `Refresh`.
- If a saved location cannot be retrieved from Everbridge, the row stays visible as a recreate candidate and `Apply Changes` remains enabled so the user can recreate it from the saved local details.
- Drafts, failed rows, last upload status, and returned Expected Location IDs must survive page reloads.
- Because Everbridge does not provide a lookup-by-location-ID-only API, each stored location reference must include contact ID type, contact identifier, location ID, and a last known row snapshot.
- Existing locations are updated through the update endpoint. A changed row with an Expected Location ID must remain an update, not become a new create.
- If an update returns `404` because the Expected Location no longer exists for that contact, the app automatically recreates that row during the same `Apply Changes` action and replaces the stale saved ID with the new returned ID.
- Successful create/update statuses must show `Location ID: <id>`.
- Every Everbridge API call must save the latest row and schedule status before and after the request, including in-progress, success, warning, and failure states.
- Records without an Expected Location ID are unsent drafts, so their Contact ID Type and Contact Identifier fields must remain editable, including after a page reload or after a failed send.
- Each row has a Location Type dropdown with `Address`, `Asset External ID`, and `IATA`; the editor only shows the fields relevant to the selected type, and new rows default to `Address`.
- If an unsent draft fails because of a wrong contact ID, the user may correct the contact and send again. When that create succeeds, the corrected contact becomes the saved source contact for future updates.
- Existing saved Expected Locations cannot change contact because Everbridge update/delete paths require the original contact. Locked contact fields must be visually gray and show a professional inline notice at the bottom of the expanded row, to the left of `Done`, when selected.
- Deleting an existing Expected Location from the row action calls Everbridge immediately and removes the row from the view only after the delete succeeds.
- `Delete All` in the Expected Locations section calls Everbridge immediately to delete all visible saved Expected Locations and removes visible draft rows locally; rows that fail Everbridge deletion remain visible.
- `Send to Everbridge` / `Apply Changes` is disabled when there is no create, update, or delete change to apply.
- UI refinements include compact rows, wider Saved Schedules field, capped Status column width, responsive Schedule controls from tablet to mobile widths, same-height dropdown/buttons, vertically centered headings/buttons/button labels, no wrapped button text, and no business-specific wording.

## Current Files

- `index.html`: page structure, Everbridge-style shell, authentication form, row table, action buttons, footer
- `styles.css`: Everbridge-inspired styling, banner, table, editable row states, status badges
- `app.js`: CSV parsing, row validation, schedule storage, payload building, API calls, row status mapping
- `README.md`: run and workflow notes
- `images/`: local page assets pulled from the Travel Itinerary Importer reference page

## Visual Style

The page follows the visual style of:

`https://everbridge.github.io/Travel-Itinerary-Importer/`

Current local assets:

- `images/favicon.png`
- `images/Everbridge-Logo-Color.svg`
- `images/Everbridge-Logo-White.svg`
- `images/Homepage-Hero-Protect-What-Matters-Most-1.jpg`

The page shell includes:

- white Everbridge logo band
- hero/banner image
- dark angled title block
- dark footer with white Everbridge logo and legal links

Banner title:

```text
Everbridge
Expected Location Importer
```

## API

Reference:

`https://developers.everbridge.net/home/reference/ebs-add-expected-locations`

Endpoint:

```http
POST {baseUrl}/rest/expectedLocations/{organizationId}?contactIdType=id|externalId&returnIds=true
Authorization: Basic <base64(username:password)>
Content-Type: application/json
```

Production base URL options:

- `https://api.everbridge.net`
- `https://api.everbridge.eu`

The UI uses an editable API Base URL dropdown with two production host options. Users can type another environment URL. The app appends `/rest` automatically unless the entered value already ends with `/rest`.

Query parameter:

- `returnIds=true`, always included

Additional schedule APIs:

```http
GET {baseUrl}/rest/expectedLocations/{organizationId}/{contactId}/{expectedLocationId}?contactIdType=id|externalId
PUT {baseUrl}/rest/expectedLocations/{organizationId}/{contactId}/{expectedLocationId}?contactIdType=id|externalId
DELETE {baseUrl}/rest/expectedLocations/{organizationId}/batch
```

Expected Location lookup and update both require the contact identifier in the path as well as the Expected Location ID. Because there is no location-only lookup endpoint, the app stores each Expected Location ID with:

- `contactIdType`
- `contactIdentifier`
- `locationId`
- last known row snapshot

When loading a saved schedule, the app calls the get-by-contact-and-location endpoint for each stored reference. If a direct lookup returns `404`, it attempts the list-by-contact endpoint and matches the stored Expected Location ID from that contact's returned locations.

Updates use the existing row editor and send the Expected Location address payload to the update endpoint. Deletes use the batch delete endpoint immediately from the row delete action. A persisted row must remain visible until Everbridge confirms the delete succeeded.

If the update endpoint returns `404` for a saved Expected Location, the location is treated as missing in Everbridge. The app marks the row as a recreate candidate, sends it through the create endpoint during the same Apply operation, and removes the stale saved reference after the new ID is returned.

## Payload Shape

The app sends a JSON array of Expected Location objects:

```json
[
  {
    "contactExternalId": "EMP-1001",
    "address": {
      "arriveDate": "2026-06-01T16:00:00.000Z",
      "expireDate": "2026-06-02T00:00:00.000Z",
      "country": "US",
      "locationName": "Normal Day Shift - HQ",
      "streetAddress": "25 Corporate Dr",
      "suite": "Floor 2",
      "city": "Burlington",
      "state": "MA",
      "postalCode": "01803"
    }
  }
]
```

When `contactIdType=id`, each row uses:

```json
{
  "contactId": "A1234567890"
}
```

Numeric Contact IDs that are safe JavaScript integers may be sent as numbers. Alphanumeric Contact IDs and unsafe numeric Contact IDs are sent as strings.

When `contactIdType=externalId`, each row uses:

```json
{
  "contactExternalId": "EMP-1001"
}
```

All rows in a single create API request must use the same `contactIdType`. When new rows use both Contact ID and External ID types, the app groups them into separate create requests.

## Required Row Fields

Required:

- `contactIdType`
- `contactIdentifier`
- `arriveDate`
- `expireDate`

Each row must also provide one location verification method:

- `assetExternalId`
- `iata`
- physical address fields: `locationName`, `streetAddress`, `city`, `state` / State/Province, `country`

The row editor exposes this as `Location Type`, defaulting to `Address`:

- `Asset External ID`: shows and validates only Asset External ID
- `IATA`: shows and validates only IATA
- `Address`: shows and validates physical address fields and optional latitude/longitude

The API payload includes only the fields for the selected method, plus arrival and expiration. CSV imports infer the method from populated columns unless an optional `locationEntryMode`, `locationMethod`, `locationMode`, or `locationType` header is present.

Optional:

- `suite`
- `postalCode`
- `lat`
- `lon`

Latitude and longitude must be provided together.

The inline editor shows Country as an editable dropdown with ISO alpha-2 country options. When Country is `US`, State/Province is an editable dropdown with US state options; for other countries it remains editable text.

## CSV Import

The UI has:

- `Download CSV Template`
- `Load CSV`
- `Refresh`
- `Add`
- `Delete All`
- `Send to Everbridge` / `Apply Changes`

CSV template headers:

```csv
contactIdType,contactIdentifier,arriveDate,expireDate,assetExternalId,iata,locationName,streetAddress,city,state,country,suite,postalCode,lat,lon
```

Template includes examples for:

- physical address lookup
- IATA lookup
- asset external ID lookup

CSV parser behavior:

- supports quoted fields
- supports escaped double quotes
- accepts common header aliases such as `contactId`, `contactExternalId`, `start`, `end`, `latitude`, `longitude`
- converts CSV date/time values to `datetime-local` where possible
- does not auto-expand any row after loading

Loading a CSV adds imported rows as local draft rows to the active schedule. If no schedule is selected, the app creates a new schedule automatically. The generated default schedule name is:

```text
Schedule <timestamp>
```

Imported rows remain local drafts until Everbridge returns Expected Location IDs.

## Schedules

The Schedule section sits between Authentication and Expected Locations.

Schedule fields:

- saved schedule dropdown
- schedule name
- schedule description
- schedule summary with active location count and draft count
- storage notice at the bottom of the Schedule section explaining that saved schedules are stored only in the current browser on the current computer

Schedule actions:

- selecting a saved schedule: saves the previously selected schedule locally, then retrieves the newly selected schedule's saved Expected Locations from Everbridge using stored contact/location references
- `New`: creates an empty local schedule with a UUID
- `Delete`: removes only the currently selected local schedule record; it does not delete Everbridge Expected Locations
- `Refresh` in the Expected Locations section: retrieves the selected schedule's saved Expected Locations from Everbridge after authentication is complete
- loading a CSV into the active schedule, adding or editing rows, removing rows, clearing rows, switching schedules, and sending to Everbridge automatically saves the active schedule locally
- loading a CSV while a schedule is selected appends those rows to the current schedule; loading a CSV with no schedule selected creates a new schedule
- reloading the page restores the active schedule from local storage, including draft rows and saved Expected Location rows from their local `lastKnown` snapshots
- after reload, if the password is empty and the active schedule has saved Everbridge locations, the app does not attempt API refresh; it shows a message asking the user to authenticate and then use `Refresh`
- during `Send to Everbridge` / `Apply Changes`, the app saves before API calls, after each create/update operation, and after failures so returned IDs and remaining unsent drafts are retained
- every Everbridge API call autosaves the latest row and schedule state so a refresh preserves the most recent in-progress, success, warning, or failure status
- `Send to Everbridge` / `Apply Changes` is disabled when the active schedule has no draft, update, or delete changes to apply
- deleting an existing row calls Everbridge immediately and removes the row from the table only after the delete succeeds
- saved rows that fail schedule retrieval are treated as pending recreate changes until they are successfully created again

Schedule storage uses browser `localStorage` under:

```text
expected-location-importer.sessions
```

Stored schedule shape:

```json
{
  "id": "uuid",
  "name": "Schedule 2026-05-18 09:00",
  "description": "Schedule context",
  "createdAt": "2026-05-18T16:00:00.000Z",
  "updatedAt": "2026-05-18T16:05:00.000Z",
  "locationRefs": [
    {
      "locationId": "2233144086364164",
      "contactIdType": "externalId",
      "contactIdentifier": "EMP-1001",
      "lastKnown": {}
    }
  ],
  "pendingDeleteRefs": [],
  "draftRows": [],
  "history": []
}
```

Each stored row snapshot includes its last upload status. Draft rows that have not returned an Everbridge Expected Location ID are retained in `draftRows`. Manual row entry creates a local schedule automatically when needed so unsent drafts are tied to a schedule before they are sent. Unapplied edits to rows that already have Expected Location IDs are retained in each reference's `lastKnown` snapshot and restored as pending updates when the schedule is loaded again.

Stored row snapshots include `locationEntryMode` so the selected location entry method survives page reloads.

When a create or update succeeds for a row with an Expected Location ID, the row status message is always shown as:

```text
Location ID: <id>
```

All schedule history is retained locally in the `history` array, capped to the most recent 250 entries per schedule.

Existing Expected Locations loaded from a schedule lock and visually gray out the contact ID fields in the row editor because the update API path is tied to the original contact. If a user selects a locked contact field, the app shows an inline notice at the bottom of that row, to the left of the `Done` button, explaining that they must remove the location and create a new one for the correct contact.

Failed rows are an exception. If a failed row has no Expected Location ID, its contact fields remain editable. If a failed row had an Expected Location ID and the contact is changed, the app converts that row into an unsent draft for the new contact so the next send creates a new location instead of updating the previous contact/path.

Unsent draft rows do not have an Expected Location ID. Their contact fields remain editable regardless of saved draft status, including restored `Sending` states from an interrupted browser session.

When an unsent draft fails because the contact ID was wrong, users can correct the contact and send again. If that later create succeeds, the successful contact becomes the row's saved source contact so future updates do not report a false contact-change error.

## Table Behavior

The Expected Locations table is the source of truth.

Rows are never auto-expanded by app actions such as CSV load, schedule refresh, validation failure, or adding a row. Users expand and collapse rows manually.

Each row shows:

- expand/collapse icon control
- `Contact ID` column with contact identifier and type, displayed as `Contact ID` or `External ID`; the contact identifier title must not wrap
- `Timeframe` column with arrival and expiration timestamps in matching bold text; timestamp lines must not wrap
- `Location` column with location lookup or physical location summary
- `Address / Lookup` column with address or lookup summary
- upload status
- compact icon actions for edit/done and remove

Expanded rows show an inline editor for all row fields.

For unsent draft rows, the remove action deletes the row locally. For rows with an Expected Location ID, the remove action calls Everbridge immediately through the batch delete endpoint. The row remains visible with an in-progress or error status until the delete succeeds. After a successful delete, the row is removed from the table and the schedule's saved location references are updated.

Editing a previously sent row resets its upload status to:

```text
Edited, not sent
```

For a row with an existing Expected Location ID, editing resets its upload status to:

```text
Edited, pending update
```

## Row Upload Status

Rows support these upload states:

- `Not sent`
- `Refreshing`
- `Sending`
- `Sent`
- `Review`
- `Failed`

During saved schedule loading, rows being retrieved from Everbridge are set to `Refreshing`. During a send or sync, rows participating in a create or update operation are set to `Sending`. Unchanged loaded rows keep their existing status.

After the API response, `app.js` attempts to map response details back to individual rows.

Supported response mapping strategies:

- response array position
- fields like `rowIndex`, `index`, `row`, `rowNumber`, `line`, `lineNumber`
- text patterns like `row 3` or `line 4`
- contact identifiers embedded in response text

Special Everbridge batch response behavior:

```json
{
  "message": "OK",
  "code": 200,
  "data": [
    "2233144086364164",
    "2233144086364165",
    "Contact externalId : abc not found."
  ]
}
```

This means:

- row 1 succeeded, Location ID `2233144086364164`
- row 2 succeeded, Location ID `2233144086364165`
- row 3 failed, message `Contact externalId : abc not found.`

Numeric string entries in `data` are treated as Location IDs even when the overall API `code` is `200`. Error-like text such as `not found`, `invalid`, `failed`, or `cannot` marks that row as failed.

## Authentication

The Authentication section collects:

- API Base URL
- Organization ID
- Username
- Password

The selected API Base URL, Organization ID, and Username are saved to website storage and restored when the page is opened again. Passwords are not persisted; they are only held in browser memory and sent as a Basic Auth header.

The page asks for confirmation before refresh, close, or navigation when queued rows or an in-memory password would be lost.

The `Delete All` action asks for confirmation. It removes unsent draft rows locally and immediately calls the batch delete endpoint for visible rows with Expected Location IDs. Rows are removed from the table only after the Everbridge delete succeeds; failures stay visible with an error status.

## Deployment

The app is static and can be hosted from GitHub Pages.

Recommended repo layout:

```text
/
  index.html
  styles.css
  app.js
  README.md
  SPEC.md
  images/
```

Add `.nojekyll` when publishing to GitHub Pages.

GitHub Pages settings:

- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/ (root)`

Expected URL:

```text
https://<owner>.github.io/<repo>/
```

## Known Limitations

- Browser CORS may block API calls from `github.io` unless Everbridge allows that origin.
- Basic Auth from a browser is convenient but not ideal for shared production use.
- Contact IDs may be numeric or alphanumeric. Numeric Contact IDs that are unsafe as JavaScript numbers are sent as strings.
- CSV date parsing depends on browser `Date` behavior for non-ISO formats. ISO-like `YYYY-MM-DDTHH:mm` values are preferred.
- Row-level response mapping is best-effort because the API response schema can vary.

## Future Improvements

Potential next work:

- Add a small backend/proxy for CORS-safe API calls and to avoid exposing Basic Auth directly in the browser.
- Add environment labels for US and EU instead of only showing base URLs.
- Add CSV export of current table rows and row statuses.
- Add retry failed rows only.
- Add duplicate row/contact/timeframe detection before send.
- Add bulk edit for common fields such as country, city, and timeframe.
- Add schedule export/import for moving local schedule history between browsers.
- Add drag-and-drop CSV upload.
- Add a response details drawer for raw API response inspection.
- Add unit tests for CSV parsing and response-to-row status mapping.
- Add Playwright checks for GitHub Pages layout and interactions.
- Add a GitHub Actions deploy workflow for Pages.
- Add a help section explaining where to find Organization ID and API user requirements.

## Important Implementation Notes

- Keep it vanilla JavaScript unless there is a strong reason to add a build step.
- Keep the app deployable as static files from the repository root.
- Keep image references local under `images/`.
- Keep all sensitive values out of source control.
- Preserve the current wording distinction:
  - `Load CSV`: import a local file into the table
  - `Send to Everbridge`: create new Expected Locations
  - `Apply Changes`: create or update based on saved schedule state
  - row delete action: delete an existing Expected Location immediately
