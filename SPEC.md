# Expected Location Importer Spec

## Purpose

This is a static, vanilla JavaScript single page app for importing Everbridge Expected Locations into Everbridge Suite through the REST API.

The app supports manual row entry and CSV import, lets users review and edit rows in a table, then sends the validated payload to Everbridge using Basic Auth.

The app also supports local schedules for operational workflows. A schedule represents one imported or manually managed schedule and stores returned Everbridge Expected Location IDs so users can later retrieve, update, or remove those locations in bulk.

## Persona And Context

The primary users are executive assistant and operations support teams coordinating time-sensitive location schedules. Multiple assistants may work on similar or related schedules from different browsers or workstations, so the UI must make handoff actions explicit, clear, and low-risk.

Design and workflow priorities:

- Use plain operational language and avoid exposing sensitive business context in labels or helper text.
- Prefer compact controls, predictable table behavior, and clear confirmation text over verbose instruction panels.
- Treat schedule data as local browser data unless the user explicitly exports, imports, refreshes, sends, updates, or deletes.
- Import and delete flows must be defensive: validate incoming data, confirm destructive actions, and leave failed Everbridge deletions visible for review.
- Exported schedule files may contain contact identifiers, location details, saved Expected Location IDs, and local row status; export messaging must remind users to share files only with people who should work from those details.

## Conversation Summary

The project started as a static Expected Location CSV importer and expanded into a schedule-management tool for maintaining groups of Expected Locations over time. The current agreed behavior is:

- Use `Schedule`, not `Session`, in the user interface.
- Each schedule has a UUID, Name, Note, default Time Zone, saved location references, drafts, and last known row snapshots.
- Saved schedules live only in the current browser on the current computer; the Schedule section must show a clear storage notice at the bottom of the section.
- The Schedule header contains the section title, Saved Schedules combo, a compact `New Schedule` icon button, and a compact `More Schedule Actions` menu on the same row where space allows. The More menu contains `Import Schedule`, `Export Schedule`, and `Delete Schedule`.
- Schedule Name and default Time Zone share one row where space allows, each taking 50% width. Note sits below them as a full-width field. Schedule form labels sit above fields to match the Expected Locations editor style.
- Schedule Time Zone uses the same editable combo control as row Time Zone.
- `Export` downloads the current schedule as a JSON handoff file. `Import` validates a JSON schedule export and imports it as a local schedule without calling Everbridge.
- Loading a CSV adds rows as local drafts to the active schedule. If no schedule is selected, the app creates a new schedule named `Schedule <timestamp>`.
- Selecting a saved schedule saves the current schedule first, then loads the selected schedule.
- Rows retrieved from Everbridge while switching saved schedules use a `Checking` status, not `Applying Changes`, because the operation is a GET that refreshes local data.
- Saved schedule data is restored from this browser immediately, but Everbridge refresh requires complete authentication. Because the password is never stored, a page reload shows local saved details and asks the user to enter the password before clicking `Refresh`.
- If a saved location cannot be retrieved from Everbridge, the row stays visible as a recreate candidate and `Apply Changes` remains enabled so the user can recreate it from the saved local details.
- Drafts, failed rows, last upload status, and returned Expected Location IDs must survive page reloads.
- Schedule default time zone and per-row time zone must survive page reloads, schedule export, and schedule import.
- Because Everbridge does not provide a lookup-by-location-ID-only API, each stored location reference must include contact ID type, contact identifier, location ID, and a last known row snapshot.
- Existing locations are updated through the update endpoint. A changed row with an Expected Location ID must remain an update, not become a new create.
- If an update returns `404` because the Expected Location no longer exists for that contact, the app automatically recreates that row during the same `Apply Changes` action and replaces the stale saved ID with the new returned ID.
- Successful create/update statuses must show `Location ID: <id>`.
- Every Everbridge API call must save the latest row and schedule status before and after the request, including in-progress, success, warning, and failure states.
- Records without an Expected Location ID are unsent drafts, so their Contact ID Type and Contact ID fields must remain editable, including after a page reload or after a failed send.
- Each row has a controlled Location Type combo with `Address`, `Asset External ID`, and `IATA`; it uses the same dropdown look and behavior as Contact ID Type. The editor only shows the fields relevant to the selected type, and new rows default to `Address`.
- New manual rows default Contact ID Type to `External ID`.
- Each row has a Time Zone field. The schedule Time Zone is the default for new manual rows and CSV rows that do not provide a row time zone.
- Time Zone dropdowns list the browser-supported IANA time zone database values. The saved value is the IANA ID, and dropdown labels show the IANA ID with the current GMT offset, for example `America/Vancouver (GMT-07:00)`. Typing in a Time Zone field filters the dropdown toward the best matching time zones.
- If an unsent draft fails because of a wrong contact ID, the user may correct the contact and send again. When that create succeeds, the corrected contact becomes the saved source contact for future updates.
- Existing saved Expected Locations cannot change contact because Everbridge update/delete paths require the original contact. Locked contact fields must be visually gray and show a professional inline notice at the bottom of the expanded row when selected.
- Deleting an existing Expected Location from the row action calls Everbridge immediately and removes the row from the view only after the delete succeeds.
- `Delete Selected` in the Expected Locations section calls Everbridge immediately to delete selected saved Expected Locations and removes selected draft rows locally; rows that fail Everbridge deletion remain visible.
- `Send to Everbridge` / `Apply Changes` is disabled when there is no create, update, or delete change to apply.
- UI refinements include compact rows, wider Saved Schedules field, capped Status column width, responsive Schedule controls from tablet to mobile widths, same-height dropdown/buttons, vertically centered headings/buttons/button labels, no wrapped button text, phone-friendly action button grids, card-style Expected Location rows on narrow screens, and no business-specific wording.
- Count badges use title-case operational labels, for example `2 Records · 1 Selected` and `2 Locations · 0 Drafts`.

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

The API payload includes only the fields for the selected method, plus start and end timestamps. CSV imports infer the method from populated columns unless an optional `locationEntryMode`, `locationMethod`, `locationMode`, or `locationType` header is present.

Optional:

- `suite`
- `postalCode`
- `lat`
- `lon`

Latitude and longitude must be provided together.

The inline editor shows Country as an editable dropdown with ISO alpha-2 country options. When Country is `US`, State/Province is an editable dropdown with US state options; for other countries it remains editable text.

## CSV Import

The UI has:

- `Download Everbridge Expected Location Template`
- `Load CSV`
- `Refresh`
- `Add`
- `Delete Selected`
- `Send to Everbridge` / `Apply Changes`

`Load CSV` remains a direct one-click action. `Download Everbridge Expected Location Template` is a compact icon link with a clear tooltip and accessible label, and downloads `Everbridge Expected Location Template.csv`, so it stays available without competing with frequent workflow actions. `Refresh` and `Add` are compact icon buttons with accessible labels. `Delete Selected` appears only after at least one row is selected.

CSV template headers:

```csv
Contact ID Type,Contact ID,Start Time,End Time,Time Zone,Location Type,Asset External ID,IATA,Location Name,Street Address,City,State/Province,Country,Suite,Postal Code,Latitude,Longitude
```

Template includes examples for:

- physical address lookup
- IATA lookup
- asset external ID lookup

CSV parser behavior:

- supports quoted fields
- supports escaped double quotes
- uses title-case template headers that match assistant-facing field labels, while still accepting legacy headers such as `contactIdType`, `contactIdentifier`, `arriveDate`, `expireDate`, `lat`, and `lon`
- accepts common header aliases such as `contactId`, `contactExternalId`, `start`, `startTime`, `end`, `endTime`, `latitude`, and `longitude`
- accepts `timeZone`, `timezone`, or `tz` for per-row IANA time zones
- converts CSV date/time values to `datetime-local` where possible, using the row time zone when present and the schedule default time zone otherwise
- does not auto-expand any row after loading

Loading a CSV adds imported rows as local draft rows to the active schedule. If no schedule is selected, the app creates a new schedule automatically. The generated default schedule name is:

```text
Schedule <timestamp>
```

Imported rows remain local drafts until Everbridge returns Expected Location IDs.

## Schedules

The Schedule section sits between Authentication and Expected Locations.

Schedule fields:

- Saved Schedules combo using the same dropdown look and keyboard behavior as other controlled combo fields
- Name
- Note
- Time Zone
- schedule summary with active location count and draft count
- storage notice at the bottom of the Schedule section explaining that saved schedules are stored only in the current browser on the current computer

Schedule actions:

- selecting a saved schedule: saves the previously selected schedule locally, then retrieves the newly selected schedule's saved Expected Locations from Everbridge using stored contact/location references
- `New`: creates an empty local schedule with a UUID
- `Import`: opens a JSON schedule export file, validates it, and imports it as a local schedule without calling Everbridge
- `Export`: saves the current schedule to a JSON file for handoff to another authorized assistant or workstation
- `Delete`: removes only the currently selected local schedule record; it does not delete Everbridge Expected Locations
- `Refresh` in the Expected Locations section: retrieves the selected schedule's saved Expected Locations from Everbridge after authentication is complete
- successful refresh from Everbridge overwrites pending local edits for saved Expected Locations; unsent draft rows without an Expected Location ID remain local because they have no server record to refresh
- loading a CSV into the active schedule, adding or editing rows, removing rows, deleting selected rows, switching schedules, and sending to Everbridge automatically saves the active schedule locally
- changing the schedule Time Zone automatically saves the schedule; it does not rewrite existing row times because each row stores its own effective Time Zone
- loading a CSV while a schedule is selected appends those rows to the current schedule; loading a CSV with no schedule selected creates a new schedule
- reloading the page restores the active schedule from local storage, including draft rows and saved Expected Location rows from their compact local row snapshots
- after reload, if the password is empty and the active schedule has saved Everbridge locations, the app does not attempt API refresh; it shows a message asking the user to authenticate and then use `Refresh`
- during `Send to Everbridge` / `Apply Changes`, the app saves before API calls, after each create/update operation, and after failures so returned IDs and remaining unsent drafts are retained
- every Everbridge API call autosaves the latest row and schedule state so a refresh preserves the most recent in-progress, success, warning, or failure status
- `Send to Everbridge` / `Apply Changes` is disabled when the active schedule has no draft, update, or delete changes to apply
- deleting an existing row calls Everbridge immediately and removes the row from the table only after the delete succeeds
- saved rows that fail schedule retrieval are treated as pending recreate changes until they are successfully created again

Schedule export/import:

- export format is JSON with `type: "everbridge-expected-location-schedule"`, `version: 2`, `exportedAt`, and one compact `schedule`
- exported files include schedule Name, Note, default Time Zone, saved Expected Location IDs, contact references, compact row snapshots, drafts, pending delete IDs, row time zones, and row status when needed
- import accepts the tool's schedule export package or a single current `version: 2` compact schedule object
- import rejects unsupported versions, invalid JSON, malformed rows, duplicate saved location IDs, files larger than 2 MB, and files containing multiple schedules
- import is non-destructive: it creates a local schedule, generates a new UUID if the imported ID collides with an existing local schedule, and does not call Everbridge automatically
- after import, rows are restored from the file and users can review, refresh after authentication, apply changes, or delete selected rows

Schedule storage uses browser `localStorage` under:

```text
expected-location-importer.sessions
```

Stored schedule shape:

```json
{
  "version": 2,
  "activeSessionId": "uuid",
  "schedules": [
    {
      "id": "uuid",
      "name": "Schedule 2026-05-18 09:00",
      "note": "Schedule context",
      "tz": "America/New_York",
      "locations": [
        {
          "id": "2233144086364164",
          "contactIDType": "externalId",
          "contactID": "EMP-1001",
          "type": "address",
          "arrive": "2026-05-18T09:00",
          "expire": "2026-05-18T17:00",
          "tz": "America/New_York",
          "name": "HQ",
          "street": "25 Corporate Dr",
          "city": "Burlington",
          "region": "MA",
          "country": "US"
        }
      ],
      "deleteIds": [],
      "drafts": []
    }
  ]
}
```

The app reads and writes the current compact `version: 2` schedule shape only. Older saved schedule formats must be converted before running this version.

Each stored row snapshot includes its last upload status only when it differs from the default. Draft rows that have not returned an Everbridge Expected Location ID are retained in `drafts`. Manual row entry creates a local schedule automatically when needed so unsent drafts are tied to a schedule before they are sent. Unapplied edits to rows that already have Expected Location IDs are retained as compact fields directly on each stored location and restored as pending updates when the schedule is loaded again.

Stored row snapshots include compact `type` values (`address`, `asset`, or `iata`) so the selected Location Type survives page reloads. They also include compact `tz` values so row time zones survive reloads and handoff through export/import.

The app stores and displays row times as local wall-clock values in the row Time Zone. When building Everbridge create or update payloads, it converts the row's `arriveDate` and `expireDate` to UTC ISO timestamps using that row Time Zone.

When a create or update succeeds for a row with an Expected Location ID, the row status message is always shown as:

```text
Location ID: <id>
```

Existing Expected Locations loaded from a schedule lock and visually gray out the contact ID fields in the row editor because the update API path is tied to the original contact. If a user selects a locked contact field, the app shows an inline notice at the bottom of that row explaining that they must remove the location and create a new one for the correct contact.

Failed rows are an exception. If a failed row has no Expected Location ID, its contact fields remain editable. If a failed row had an Expected Location ID and the contact is changed, the app converts that row into an unsent draft for the new contact so the next send creates a new location instead of updating the previous contact/path.

Unsent draft rows do not have an Expected Location ID. Their contact fields remain editable regardless of saved draft status, including restored in-progress states from an interrupted browser session.

When an unsent draft fails because the contact ID was wrong, users can correct the contact and send again. If that later create succeeds, the successful contact becomes the row's saved source contact so future updates do not report a false contact-change error.

## Table Behavior

The Expected Locations table is the source of truth.

Rows are not auto-expanded by app actions such as CSV load, schedule refresh, or validation failure. A newly added manual row expands immediately so the user can enter the expected location details.

Each row shows:

- selection checkbox for bulk actions
- expand/collapse icon control
- `Contact ID` column with contact identifier and type, displayed as `Contact ID` or `External ID`; the contact identifier title must not wrap
- `Timeframe` column with Start Time and End Time timestamps in matching bold text; timestamp lines must not wrap
- `Location` column with Location Name for address rows, or Location Type for Asset External ID and IATA rows; this column has no subtitle
- `Address` column with address summary for address rows, or only the Asset External ID / IATA value for lookup rows
- upload status
- compact icon actions for edit/done and remove

Expanded rows show an inline editor for all row fields, including the row Time Zone. Editor fields use one aligned responsive grid so Contact, Time, and Location controls share the same column tracks. On wider screens, the editor uses a dense 8-column layout: contact and location identity fields share the first row, Start Time and End Time sit beside a wider Time Zone field, Street Address gets half-width space, State/Province appears before Country, and Latitude/Longitude use compact side-by-side fields. Country is searchable by code or country name while typing, displays the full country name after selection, and keeps the selected country code locally for search/storage. Everbridge payloads send the full country name. For US addresses, State/Province is searchable by state code or state name while typing, displays the code and full state name in the UI, stores the full state name, and Everbridge payloads send the full state name. Searchable combo fields support keyboard selection with Up/Down arrows and Enter. Contact ID Type and Location Type use the same controlled combo styling; Contact ID Type only allows `Contact ID` and `External ID`, and Location Type only allows `Address`, `Asset External ID`, and `IATA`.

For unsent draft rows, the remove action deletes the row locally. For rows with an Expected Location ID, the remove action calls Everbridge immediately through the batch delete endpoint. The row remains visible with an in-progress or error status until the delete succeeds. After a successful delete, the row is removed from the table and the schedule's saved location references are updated.

`Delete Selected` asks for confirmation. It removes selected unsent draft rows locally and immediately calls the batch delete endpoint for selected rows with Expected Location IDs. Rows are removed from the table only after Everbridge delete succeeds; failures stay visible with an error status.

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

- `Draft`
- `Checking`
- `Applying Changes`
- `Created`
- `Needs Review`
- `Failed`

During saved schedule loading, rows being retrieved from Everbridge are shown as `Checking`. During a send or sync, rows participating in a create, update, or delete operation are shown as `Applying Changes`. Unchanged loaded rows keep their existing status.

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

The `Delete Selected` action asks for confirmation. It removes selected unsent draft rows locally and immediately calls the batch delete endpoint for selected rows with Expected Location IDs. Rows are removed from the table only after the Everbridge delete succeeds; failures stay visible with an error status.

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
- Add schedule export/import for moving local schedules between browsers.
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
