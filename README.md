# Expected Location Importer

Static vanilla JavaScript SPA for creating Everbridge Suite Expected Locations with Basic Auth.

## Run

```sh
python3 -m http.server 5173
```

Open `http://localhost:5173`.

## Workflow

- Use `Download CSV Template` for the expected headers and example rows.
- Use `Load CSV` to add rows from a local CSV file.
- Use `Add Row` for manual entry.
- Expand any row in the table to edit it before sending.
- Use `Send to Everbridge` after the table is reviewed.
- Review the `Status` column after sending. It reflects the API response for each row when row-level details are returned.

The app sends:

```http
POST https://api.everbridge.net/rest/expectedLocations/{organizationId}?contactIdType=id|externalId&returnIds=true
Authorization: Basic <base64(username:password)>
Content-Type: application/json
```

The editable Base URL dropdown provides the two production hosts, `https://api.everbridge.net` and `https://api.everbridge.eu`, while still allowing another environment URL to be typed. The app appends `/rest` and always requests Location IDs when sending requests. The API Base URL, Organization ID, and Username are restored from website storage when the page is reopened; the password is not stored.

Browsers enforce CORS. If Everbridge does not allow your local origin, run the same static files behind an approved internal origin or a small same-origin proxy.
