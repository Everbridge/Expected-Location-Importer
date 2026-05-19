# Expected Location Scheduler

Static vanilla JavaScript SPA for scheduling and maintaining Everbridge Suite Expected Locations with Basic Auth.

## Run

```sh
python3 -m http.server 5173
```

Open `http://localhost:5173`.

## Workflow

- Use `Download Everbridge Expected Location Template` for the expected headers and example rows.
- Use `Import Locations` to add CSV rows to the selected schedule. If no schedule is selected, the app creates a new saved schedule.
- Use `Add Row` for manual entry.
- Expand any row in the table to edit it before sending.
- Use the duplicate action on a row to copy its schedule and location details into a new draft with a blank Contact ID.
- Rows are ordered by Timeframe, then Contact, by default. Click the Contact or Timeframe header to change the table sort.
- Use the compact timeline above the table to scan the schedule by time and jump directly to a row.
- Use the Schedule print button or browser print to create a concise schedule report. The print view uses a dedicated report table, hides the timeline and app controls, uses the same two-line Location summary as the table, and shows the record count beside the Scheduled Locations heading.
- Refresh and successful creates also fill in contact names from Everbridge when a row has only a Contact ID.
- Use `Send to Everbridge` after the table is reviewed. After a schedule has returned Expected Location IDs, the button changes to `Apply Changes` for create/update/delete sync.
- Draft rows, row notes, unapplied edits, and each row's last send or refresh status are stored in the active schedule. Manual drafts create a local schedule automatically, and schedule state is saved when rows are loaded, edited, removed, cleared, switched, sent, refreshed, or restored after a page reload.
- Click the yellow Schedule note to edit it, then use the check button to confirm.
- Click an existing yellow row note to edit it in place, then use the check button to confirm. Row notes are local schedule context and are not sent to Everbridge.
- Use the Saved Schedules dropdown to switch schedules. Saved schedule labels include location and draft counts. Selecting a schedule saves the previous schedule locally, then loads the selected schedule. The app stores each Expected Location ID with its contact ID type and contact identifier because Everbridge lookup/update endpoints require both contact and location IDs.
- Review the `Status` column after sending. It reflects the API response for each row when row-level details are returned.

The app sends:

```http
POST https://api.everbridge.net/rest/expectedLocations/{organizationId}?contactIdType=id|externalId&returnIds=true
Authorization: Basic <base64(username:password)>
Content-Type: application/json
```

For saved schedules, the app also uses:

```http
GET https://api.everbridge.net/rest/expectedLocations/{organizationId}/{contactId}/{expectedLocationId}?contactIdType=id|externalId
PUT https://api.everbridge.net/rest/expectedLocations/{organizationId}/{contactId}/{expectedLocationId}?contactIdType=id|externalId
DELETE https://api.everbridge.net/rest/expectedLocations/{organizationId}/batch
GET https://api.everbridge.net/rest/contacts/{organizationId}/{contactId}?idType=id|externalId
```

The editable Base URL dropdown provides the two production hosts, `https://api.everbridge.net` and `https://api.everbridge.eu`, while still allowing another environment URL to be typed. The app appends `/rest` and always requests Location IDs when sending requests. The API Base URL, Organization ID, Username, and schedule history are restored from website storage when the page is reopened; the password is not stored.

Browsers enforce CORS. If Everbridge does not allow your local origin, run the same static files behind an approved internal origin or a small same-origin proxy.
