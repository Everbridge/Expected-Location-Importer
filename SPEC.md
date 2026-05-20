# Expected Location Scheduler Spec

## Purpose

This is a static, vanilla JavaScript single page app for scheduling and maintaining Everbridge Expected Locations in Everbridge Suite through the REST API.

The app supports manual row entry, CSV import, local schedule storage, schedule handoff by JSON export/import, Everbridge create/update/delete operations, saved-location refresh, and print-ready operational reports.

## Users And Principles

The app supports executive protection planning by helping assistants and operations teams maintain expected location schedules for protected persons and related support workflows.

The primary users are executive assistant and operations support teams coordinating time-sensitive location schedules. Multiple assistants may work on similar schedules from different browsers or workstations, so handoff actions must be explicit, clear, and low-risk.

Core principles:

- Use `Schedule`, not `Session`, in user-facing text.
- Use plain operational language and avoid exposing sensitive business context.
- Prefer compact controls, predictable table behavior, and clear confirmation text over long instruction panels.
- Treat schedule data as local browser data unless the user explicitly imports, exports, refreshes, sends, updates, or deletes.
- Validate imports and confirm destructive actions.
- Leave failed Everbridge deletes visible for review.
- Warn users that exported schedule files may contain contact identifiers, location details, saved Expected Location IDs, and row statuses.

## Functional Requirements

### Authentication

- The Authentication section collects API Base URL, Organization ID, Username, and Password.
- API Base URL is an editable dropdown with production options `https://api.everbridge.net` and `https://api.everbridge.eu`; users may type another environment URL.
- The app appends `/rest` automatically unless the entered base URL already ends with `/rest`.
- API Base URL, Organization ID, and Username are saved to website storage and restored.
- Password is never persisted; it is held only in browser memory and sent as a Basic Auth header.
- After reload, if an active schedule has saved Everbridge locations and no password is present, the app shows local saved details and asks the user to authenticate before clicking `Refresh`.
- The page asks for confirmation before refresh, close, or navigation when queued rows or an in-memory password would be lost.

### Schedule Management

- Each schedule has a UUID, Name, Note, default Time Zone, saved Expected Location references, draft rows, selected table sort, pending delete IDs, and compact last-known row snapshots.
- Saved schedules live only in the current browser on the current computer.
- The Schedule section sits between Authentication and Expected Locations and includes a concise storage notice explaining local storage and Export/Import handoff.
- The Schedule header contains Saved Schedules, `New`, `Print`, and a compact More menu containing `Export`, `Import`, and `Delete`.
- Saved Schedules uses the same controlled combo behavior as other dropdown fields and includes each schedule's location/draft summary.
- Count badges use title-case operational labels such as `8 Locations · 1 Draft`.
- Schedule Name and default Time Zone share one row where space allows.
- Schedule Note uses the same yellow note display/editor control as row notes, with a `note-sticky` icon and a visible check button to confirm edits.
- Schedule Time Zone uses the same editable combo as row Time Zone.
- Selecting a saved schedule saves the previously selected schedule locally, then loads the selected schedule.
- Loading a CSV with no active schedule creates a local schedule named `Schedule <timestamp>`.
- Loading a CSV with an active schedule appends local draft rows to that schedule.
- Reloading the page restores the active schedule from local storage, including drafts and saved Expected Location rows from compact snapshots.
- Changing Schedule Time Zone automatically saves the schedule but does not rewrite existing row times because each row stores its own effective Time Zone.
- Loading CSV rows, adding/editing/removing rows, deleting selected rows, switching schedules, sending to Everbridge, and applying changes automatically save the active schedule.
- `Export` downloads the current schedule as a JSON handoff file.
- `Import` validates a JSON schedule export, creates a local schedule, and never calls Everbridge automatically.
- `Delete` removes only the selected local schedule; it does not delete Everbridge Expected Locations.

### Expected Location Rows

- The Expected Locations table is the source of truth.
- New manual rows expand immediately, default to a one-hour timeframe rounded forward to the next `:00` or `:30` boundary, default Contact ID Type to `External ID`, and default Location Type to `Address`.
- Rows are not auto-expanded by CSV load, schedule refresh, or validation failure.
- Required fields are Contact ID Type, Contact ID, Start Time, End Time, and one location method.
- The row editor keeps the Everbridge Contact ID Type labels `Contact ID` and `External ID`.
- Location methods are `Address`, `Asset External ID`, and `IATA`.
- Address rows require Location Name, Street Address, City, State/Province, and Country; Suite, Postal Code, Latitude, and Longitude are optional.
- Latitude and Longitude must be provided together.
- The editor shows only fields relevant to the selected Location Type.
- Every row has a Time Zone. The schedule Time Zone is the default for new manual rows and CSV rows without a row Time Zone.
- Row times are stored and displayed as local wall-clock values in the row Time Zone.
- Everbridge payloads convert Start Time and End Time to UTC ISO timestamps using the row Time Zone.
- Time Zone dropdowns list browser-supported IANA time zone values and show current GMT offsets, for example `America/Vancouver (GMT-07:00)`.
- Typing in a Time Zone field filters toward matching time zones.
- Country is searchable by code or country name, displays the full country name after selection, stores the country code locally, and sends the full country name to Everbridge.
- For US addresses, State/Province is searchable by state code or name, displays code and name, stores the full state name, and sends the full state name to Everbridge.
- Searchable combo fields support keyboard selection with Up/Down and Enter.
- Row Note is local operational text. It is stored in CSV and schedule export/import, autosizes while editing, and is not sent to Everbridge unless Everbridge later returns a note-like field during refresh.
- Duplicating a row creates an expanded unsent draft with the source schedule, timeframe, location, Time Zone, and note details, but clears Contact ID, Expected Location ID, recreate/source contact fields, and sync fingerprint.

### Contact Locking

- Unsent drafts have no Expected Location ID, so Contact ID Type and Contact ID remain editable, including after reload or failed send.
- If an unsent draft fails because of a wrong contact, the user may correct the contact and send again.
- When a corrected draft later succeeds, that contact becomes the saved source contact for future updates.
- Existing saved Expected Locations cannot change contact because Everbridge update/delete paths require the original contact.
- Locked contact fields are visually gray and show an inline notice explaining that users can duplicate the row, enter a new Contact ID, and apply the new row.
- If a failed row had an Expected Location ID and the contact is changed, the app converts that row into an unsent draft for the new contact.

### Everbridge Sync

- Saved Expected Location references include contact ID type, contact identifier, optional resolved contact name, Expected Location ID, and last-known row snapshot.
- Refresh retrieves saved Expected Locations from Everbridge after authentication and processes rows in the current table order from top to bottom.
- Rows retrieved during saved schedule loading or refresh use `Checking`; successful refreshes use `Refreshed`.
- Successful refresh overwrites pending local edits for saved Expected Locations.
- Unsent draft rows remain local during refresh because they have no server record.
- Saved rows that fail retrieval stay visible as pending recreate changes until successfully created again.
- Existing rows with Expected Location IDs update through the update endpoint and do not become new creates just because row data changed.
- If update returns `404`, the app recreates that row during the same Apply operation and replaces the stale saved ID with the new ID.
- Every Everbridge API call autosaves before and after the request, including in-progress, success, warning, and failure states.
- `Send to Everbridge` creates new Expected Locations.
- `Apply Changes` creates drafts, updates changed saved rows, and processes pending deletes.
- `Send to Everbridge` / `Apply Changes` is disabled when there is no create, update, or delete change.
- Deleting an existing row calls the batch delete endpoint immediately and removes the row only after Everbridge confirms success.
- `Delete Selected` asks for confirmation, removes selected drafts locally, immediately calls the batch delete endpoint for selected saved rows, and leaves failures visible.

### Import And Export

- `Import Locations` imports a local CSV file into the active schedule and uses an import icon.
- `Download Everbridge Expected Location Template` downloads `Everbridge Expected Location Template.csv` and remains a compact icon link with a clear tooltip and accessible label.
- Imported rows remain local drafts until Everbridge returns Expected Location IDs.
- Schedule import/export uses JSON and is for authorized handoff between browsers or workstations.
- Schedule import is non-destructive: it creates a local schedule, generates a new UUID if needed, restores rows for review, and never refreshes or applies changes automatically.

### Print Report

- Printing produces a concise business report rather than a printout of the interactive app.
- Print hides authentication, schedule controls, action buttons, import status, toast messages, expanded editors, selection controls, row action controls, footer content, the timeline, and the interactive table.
- The print report repeats its header and footer on each page.
- The header shows a smaller Everbridge logo on the left and print date on the right, aligned by their lower edge, with a thin compact divider below.
- The schedule name is the report title.
- The schedule note appears below the title as summary text without a visible label.
- Time Zone is not printed in the report header.
- The location section is titled `Scheduled Locations` and shows the location count beside the title.
- The print table uses content-responsive column sizing with a narrow No. column, narrower Contact column, and wider Location column.
- Both Contact ID and External ID contacts print as `ID: <id>` in the Contact column.
- Contact, Timeframe, and Location print as two-line values with clear vertical spacing.
- The print Location column uses the same two-line location summary as the interactive table.
- Per-location status is not printed.
- Row notes print under the related location with a note icon aligned to the No. column and note content aligned to the Contact column.

## UI Requirements

### Visual Style

- The page follows the Everbridge-style shell from `https://everbridge.github.io/Travel-Itinerary-Importer/`.
- Local visual assets are `images/favicon.png`, `images/Everbridge-Logo-Color.svg`, `images/Everbridge-Logo-White.svg`, and `images/Homepage-Hero-Protect-What-Matters-Most-1.jpg`.
- The page shell includes a white Everbridge logo band, hero/banner image, dark angled title block, and dark footer with white Everbridge logo and legal links.
- The banner title is:

```text
Everbridge
Expected Location Scheduler
```

### Controls And Messages

- Dropdowns and buttons use consistent heights, centered labels, and non-wrapping button text.
- Authentication fields use four equal desktop columns and collapse to existing two-column and one-column responsive layouts.
- Warning, notice, note, import status, and toast surfaces share font size, padding, gap, line-height, border radius, border weight, and spacing tokens.
- Toast messages appear above sticky table columns and page content.
- Font Awesome solid icons are used consistently:
  - `circle-info` for neutral notices
  - `lock` for locked-contact notices
  - `triangle-exclamation` for warnings and review
  - `circle-exclamation` for validation errors
  - `circle-check` for success
  - `circle-xmark` for failures
  - `file-lines` for Draft
  - `rotate` for Checking/Applying/Refreshed
  - `pen-to-square` for Updated
  - `note-sticky` for notes

### Table And Timeline

- Rows are ordered by Timeframe by default: Start Time, End Time, then Contact as ascending tie-breaker.
- Contact and Timeframe headers are sortable; clicking the active sort toggles direction.
- The selected sort is saved with the schedule and restored after reload, import, or export.
- Times are compared in each row's Time Zone. Rows without a valid timeframe appear after dated rows.
- Current rows are highlighted light green. Past rows are muted light gray.
- Rows with data checking issues use a warning indicator rather than a separate background color.
- Incomplete summary values use softer action prompts such as `Add Asset External ID` and display in red.
- Rows with valid Start and End times show a compact timeline above the table.
- Timeline segments are clickable and expand/scroll to the matching row.
- The timeline marks current time, reuses table current/past/future visual language, centers current time on load when in range, preserves user scroll until the range changes, and hides when no rows have usable timeframes.
- Timeline labels use resolved contact name when available, falling back to Contact ID. Address rows show Location Name; Asset and IATA rows show the actual identifier.

### Row Summary

Each summary row shows:

- selection checkbox
- compact expand/collapse icon
- Contact column with resolved contact name when available, followed by `ID: <id>` for both Contact ID and External ID rows
- Timeframe column with Start Time and End Time in matching bold text
- Location column with two lines: address rows show Location Name and Address; IATA rows show `IATA` and code; Asset rows show `Asset ID` and ID
- optional row Note as a second full-width line with a `note-sticky` icon and inline editor
- upload status
- red warning indicator before edit when the row has checking issues
- compact icon actions for edit/done, duplicate, and remove

Summary row requirements:

- Clicking a non-interactive area toggles expansion.
- Contact, Timeframe, Location, and Status align as compact two-line cells.
- Contact and Timeframe are preserved before less critical location details wrap.
- Contact lines stay to a two-line maximum and ellipsize when narrow.
- Timeframe lines do not wrap on wider layouts and ellipsize when narrow.
- Status shows a badge above a short non-wrapping detail line truncated with ellipsis; the full detail is available in a tooltip.
- Row action controls have enough right spacing and no vertical divider before the action group.
- Table header text and sortable header controls are vertically centered.

### Row Editor

- Expanded rows show all row fields, row Time Zone, row Note, validation errors, failed status details, and locked-contact notices.
- Editor fields use one responsive grid so Contact, Time, and Location controls share column tracks.
- Wider screens use a dense 8-column layout.
- Contact and location identity fields share the first row.
- Start Time and End Time sit beside a wider Time Zone field.
- Street Address gets half-width space.
- State/Province appears before Country.
- Latitude and Longitude use compact side-by-side fields.
- Note spans the full editor width.
- Narrow layouts place Location Type at 50% width with Location Name, IATA, or Asset External ID on the same row.
- Phone-width layouts also keep Contact ID Type with Contact ID, Start Time with End Time, Suite with City, and State/Province with Country as 50% pairs.
- Postal Code takes 50% while Latitude and Longitude each take 25% on the same row.
- Start Time and End Time controls keep the same field height and text scale as other editor inputs across mobile browsers.

### Responsive Layout

- Summary rows are compact, content-responsive, and preserve Contact and Timeframe before wrapping less critical location details.
- Status width is capped so it does not crowd primary row data.
- Saved Schedules remains on the same row as schedule icon actions on narrow screens where space allows.
- Expected Locations import remains on the same row as its icon actions on narrow screens where space allows.
- Section controls stay horizontal through landscape phone widths.
- Below `760px`, primary action controls use flexible width and icon actions stay grouped in fixed-size slots.
- Phone card layouts show Contact and Timeframe on one row, Location and Status on the next row, compact controls in side rails, and a small top inset above row notes.

## Data Contracts

### Everbridge API

Create endpoint:

```http
POST {baseUrl}/rest/expectedLocations/{organizationId}?contactIdType=id|externalId&returnIds=true
Authorization: Basic <base64(username:password)>
Content-Type: application/json
```

Schedule maintenance endpoints:

```http
GET {baseUrl}/rest/expectedLocations/{organizationId}/{contactId}/{expectedLocationId}?contactIdType=id|externalId
PUT {baseUrl}/rest/expectedLocations/{organizationId}/{contactId}/{expectedLocationId}?contactIdType=id|externalId
DELETE {baseUrl}/rest/expectedLocations/{organizationId}/batch
GET {baseUrl}/rest/contacts/{organizationId}/{contactId}?idType=id|externalId
```

Everbridge lookup/update requires both contact identifier and Expected Location ID. If direct lookup returns `404`, the app attempts list-by-contact and matches the stored Expected Location ID from returned locations.

Contact-name lookups are deduplicated per operation, saved locally with the schedule, displayed as local metadata only, and excluded from Expected Location payloads and dirty-change fingerprinting. If the Contacts API accepts `contactIdType` instead of older `idType`, the app retries with that parameter name.

### Payload Shape

The create API sends a JSON array of Expected Location objects:

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

Contact fields:

- `contactIdType=id` sends `contactId`.
- `contactIdType=externalId` sends `contactExternalId`.
- Numeric Contact IDs that are safe JavaScript integers may be sent as numbers.
- Alphanumeric Contact IDs and unsafe numeric Contact IDs are sent as strings.
- A single create request must use one Contact ID Type; mixed new rows are grouped into separate create requests.

Location payloads include only the selected method's fields plus start/end timestamps.

### CSV Contract

Template filename:

```text
Everbridge Expected Location Template.csv
```

Template headers:

```csv
Contact ID Type,Contact ID,Start Time,End Time,Time Zone,Location Type,Asset External ID,IATA,Location Name,Note,Street Address,City,State/Province,Country,Suite,Postal Code,Latitude,Longitude
```

Template examples cover physical address, IATA, and asset external ID lookup.

Parser behavior:

- supports quoted fields and escaped double quotes
- accepts title-case template headers and legacy headers such as `contactIdType`, `contactIdentifier`, `arriveDate`, `expireDate`, `lat`, and `lon`
- accepts aliases such as `contactId`, `contactExternalId`, `start`, `startTime`, `end`, `endTime`, `latitude`, and `longitude`
- accepts `timeZone`, `timezone`, or `tz`
- infers Location Type from populated columns unless `locationEntryMode`, `locationMethod`, `locationMode`, or `locationType` is present
- converts CSV date/time values to `datetime-local` where possible using row Time Zone, then schedule Time Zone
- does not auto-expand imported rows

### Schedule Export Contract

- Export format is JSON with `type: "everbridge-expected-location-schedule"`, `version: 2`, `exportedAt`, and one compact `schedule`.
- Exported files include schedule Name, Note, default Time Zone, selected table sort, saved Expected Location IDs, contact references, compact row snapshots, drafts, pending delete IDs, row Time Zones, and non-default row statuses.
- Import accepts the tool's schedule export package or a single current `version: 2` compact schedule object.
- Import rejects unsupported versions, invalid JSON, malformed rows, duplicate saved location IDs, files larger than 2 MB, and files containing multiple schedules.

### Local Storage Contract

Local schedules are stored under:

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
      "sort": ["contact", "desc"],
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
          "note": "Meetings on floor 2",
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

The app reads and writes only compact `version: 2`. Older saved formats must be converted before running this version.

Storage notes:

- Drafts without Expected Location IDs are retained in `drafts`.
- Saved rows use compact row fields directly on each stored location.
- Unapplied edits on saved rows are restored as pending updates.
- Row snapshots include last upload status only when it differs from default.
- Compact `type` values are `address`, `asset`, or `iata`.
- Compact `tz` values preserve row Time Zones.
- Sort is stored as `[field, direction]`, where field is `timeframe` or `contact`; default `timeframe` ascending may be omitted.

### Row Status Contract

Upload states:

- `Draft` with `file-lines`
- `Checking` with `rotate`
- `Refreshed` with `rotate`
- `Applying Changes` with `rotate`
- `Created` with `circle-check`
- `Updated` with `pen-to-square`
- `Needs Review` with `triangle-exclamation`
- `Failed` with `circle-xmark`

Status behavior:

- Created and updated rows show `Location ID: <id>`.
- Editing a previously sent row resets status to `Edited, not sent`.
- Editing a saved row with an Expected Location ID resets status to `Edited, pending update`.
- API response mapping is best-effort using response array position, row/index/line fields, text patterns such as `row 3`, and embedded contact identifiers.
- Numeric string entries in a batch `data` array are treated as Location IDs even when the overall API `code` is `200`.
- Error-like text such as `not found`, `invalid`, `failed`, or `cannot` marks that row as failed.

## Decision Log

- The project evolved from a static Expected Location CSV importer into a local schedule-management tool.
- `Schedule` replaced `Session` because it better matches executive assistant and operations workflows.
- Schedule data remains local by default; Export/Import is the explicit handoff path because files can contain sensitive operational details.
- Stored Expected Location references include contact data because Everbridge lookup, update, and delete paths require contact identifier plus Expected Location ID.
- Saved schedule refresh uses `Checking` and `Refreshed` to distinguish GET-based verification from create/update/delete operations.
- Location Type was added so Address, Asset External ID, and IATA workflows can share one editor while showing only relevant fields.
- Saved location contact fields are locked because changing contact requires creating a new Expected Location under a different API path.
- Row notes are local operational notes and are excluded from Everbridge payloads.
- The print layout is a business report rather than a printed copy of the interactive app.
- Narrow layouts prioritize Contact and Timeframe visibility, compact action controls, and browser-consistent field sizing.
- The action-column divider was removed because it drew unwanted attention next to the edit action in Safari and Firefox.

## Deployment And Implementation

- Keep the app vanilla JavaScript and deployable as static files from the repository root.
- Keep image references local under `images/`.
- Keep all sensitive values out of source control.
- Add `.nojekyll` when publishing to GitHub Pages.
- GitHub Pages can deploy from `main` at `/ (root)`.
- Expected hosted URL format is `https://<owner>.github.io/<repo>/`.

Wording distinctions:

- `Import Locations`: import a local CSV file into the table
- `Send to Everbridge`: create new Expected Locations
- `Apply Changes`: create/update/delete based on saved schedule state
- row delete action: delete an existing Expected Location immediately

## Known Limitations

- Browser CORS may block API calls from `github.io` unless Everbridge allows that origin.
- Basic Auth from a browser is convenient but not ideal for shared production use.
- CSV date parsing depends on browser `Date` behavior for non-ISO formats; ISO-like `YYYY-MM-DDTHH:mm` values are preferred.
- Row-level response mapping is best-effort because the API response schema can vary.

## Future Improvements

- Add a small backend/proxy for CORS-safe API calls and to avoid exposing Basic Auth directly in the browser.
- Add environment labels for US and EU instead of only showing base URLs.
- Add CSV export of current table rows and row statuses.
- Add retry failed rows only.
- Add duplicate row/contact/timeframe detection before send.
- Add bulk edit for common fields such as country, city, and timeframe.
- Add drag-and-drop CSV upload.
- Add a response details drawer for raw API response inspection.
- Add unit tests for CSV parsing and response-to-row status mapping.
- Add Playwright checks for GitHub Pages layout and interactions.
- Add a GitHub Actions deploy workflow for Pages.
- Add a help section explaining where to find Organization ID and API user requirements.
