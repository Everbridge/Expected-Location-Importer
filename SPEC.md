# Expected Location Importer Spec

## Purpose

This is a static, vanilla JavaScript single page app for importing Everbridge Expected Locations into Everbridge Suite through the REST API.

The app supports manual row entry and CSV import, lets users review and edit rows in a table, then sends the validated payload to Everbridge using Basic Auth.

## Current Files

- `index.html`: page structure, Everbridge-style shell, authentication form, row table, action buttons, footer
- `styles.css`: Everbridge-inspired styling, banner, table, editable row states, status badges
- `app.js`: CSV parsing, row validation, payload building, API calls, row status mapping
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

All rows in a single API request must use the same `contactIdType`. The app blocks mixed Contact ID and External ID rows before sending.

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
- `Add Row`
- `Clear Rows`
- `Send to Everbridge`

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
- expands the first invalid row after loading

## Table Behavior

The Expected Locations table is the source of truth.

Each row shows:

- expand/collapse icon control
- `Contact ID` column with contact identifier and type, displayed as `Contact ID` or `External ID`
- `Timeframe` column with arrival and expiration timestamps in matching bold text
- `Location` column with location lookup or physical location summary
- `Address / Lookup` column with address or lookup summary
- upload status
- compact icon actions for edit/done and remove

Expanded rows show an inline editor for all row fields.

Editing a previously sent row resets its upload status to:

```text
Edited, not sent
```

## Row Upload Status

Rows support these upload states:

- `Not sent`
- `Sending`
- `Sent`
- `Review`
- `Failed`

During a send, all rows are set to `Sending`.

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

The `Clear Rows` action asks for confirmation before removing queued rows.

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
- Add saved local draft using `localStorage`, with clear warning and no credential storage.
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
  - `Send to Everbridge`: call the API
