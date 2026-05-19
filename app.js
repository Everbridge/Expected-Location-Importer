const CSV_COLUMNS = [
  "contactIdType",
  "contactIdentifier",
  "arriveDate",
  "expireDate",
  "timeZone",
  "locationEntryMode",
  "assetExternalId",
  "iata",
  "locationName",
  "streetAddress",
  "city",
  "state",
  "country",
  "suite",
  "postalCode",
  "lat",
  "lon",
];

const CSV_TEMPLATE_HEADERS = {
  contactIdType: "Contact ID Type",
  contactIdentifier: "Contact ID",
  arriveDate: "Start Time",
  expireDate: "End Time",
  timeZone: "Time Zone",
  locationEntryMode: "Location Type",
  assetExternalId: "Asset External ID",
  iata: "IATA",
  locationName: "Location Name",
  streetAddress: "Street Address",
  city: "City",
  state: "State/Province",
  country: "Country",
  suite: "Suite",
  postalCode: "Postal Code",
  lat: "Latitude",
  lon: "Longitude",
};

const LOCATION_ENTRY_MODES = new Set(["assetExternalId", "iata", "address"]);
const LOCATION_ENTRY_MODE_OPTIONS = [
  ["address", "Address"],
  ["assetExternalId", "Asset External ID"],
  ["iata", "IATA"],
];
const CONTACT_ID_TYPE_OPTIONS = [
  ["id", "Contact ID"],
  ["externalId", "External ID"],
];

const FALLBACK_TIME_ZONE_VALUES = [
  "UTC",
  "America/Vancouver",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Toronto",
  "Europe/London",
  "Europe/Paris",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Hong_Kong",
  "Asia/Tokyo",
  "Australia/Sydney",
];
const TIME_ZONE_SEARCH_RESULT_LIMIT = 80;
const COUNTRY_SEARCH_RESULT_LIMIT = 80;
const STATE_SEARCH_RESULT_LIMIT = 80;
const TIME_ZONE_OPTIONS = buildTimeZoneOptions();

const FIELD_DEFS = [
  {
    key: "contactIdType",
    label: "Contact ID Type",
    options: CONTACT_ID_TYPE_OPTIONS,
  },
  { key: "contactIdentifier", label: "Contact ID", required: true },
  { key: "locationEntryMode", label: "Location Type", options: LOCATION_ENTRY_MODE_OPTIONS, wide: true },
  { key: "assetExternalId", label: "Asset External ID", locationModes: ["assetExternalId"], wide: true },
  { key: "iata", label: "IATA", maxLength: 8, locationModes: ["iata"], wide: true },
  { key: "locationName", label: "Location Name", locationModes: ["address"] },
  { key: "arriveDate", label: "Start Time", type: "datetime-local", required: true },
  { key: "expireDate", label: "End Time", type: "datetime-local", required: true },
  { key: "timeZone", label: "Time Zone", options: "timeZones", required: true, wide: true },
  { key: "streetAddress", label: "Street Address", wide: true, locationModes: ["address"] },
  { key: "suite", label: "Suite", locationModes: ["address"] },
  { key: "city", label: "City", locationModes: ["address"] },
  { key: "region", label: "State/Province", options: "usStates", locationModes: ["address"] },
  { key: "country", label: "Country", type: "select", options: "countries", locationModes: ["address"] },
  { key: "postalCode", label: "Postal Code", locationModes: ["address"] },
  { key: "lat", label: "Latitude", inputmode: "decimal", locationModes: ["address"] },
  { key: "lon", label: "Longitude", inputmode: "decimal", locationModes: ["address"] },
];

const HEADER_ALIASES = {
  arrivaltime: "arriveDate",
  arrival: "arriveDate",
  arrivedate: "arriveDate",
  assetexternalid: "assetExternalId",
  city: "city",
  contactexternalid: "contactExternalId",
  contactid: "contactIdentifier",
  contactidentifier: "contactIdentifier",
  contactidtype: "contactIdType",
  country: "country",
  end: "expireDate",
  enddate: "expireDate",
  endtime: "expireDate",
  expiration: "expireDate",
  expirationdate: "expireDate",
  expiredate: "expireDate",
  everbridgecontactid: "contactId",
  iata: "iata",
  internalcontactid: "contactId",
  lat: "lat",
  latitude: "lat",
  locationname: "locationName",
  locationentrymode: "locationEntryMode",
  locationmethod: "locationEntryMode",
  locationmode: "locationEntryMode",
  locationtype: "locationEntryMode",
  lon: "lon",
  longitude: "lon",
  postalcode: "postalCode",
  region: "region",
  start: "arriveDate",
  startdate: "arriveDate",
  starttime: "arriveDate",
  state: "region",
  stateorregion: "region",
  stateorprovince: "region",
  stateprovince: "region",
  street: "streetAddress",
  streetaddress: "streetAddress",
  suite: "suite",
  timezone: "timeZone",
  timezoneid: "timeZone",
  tz: "timeZone",
};

const CONNECTION_STORAGE_KEY = "expected-location-importer.connection";
const SESSION_STORAGE_KEY = "expected-location-importer.sessions";
const SESSION_STORAGE_VERSION = 2;
const SCHEDULE_EXPORT_TYPE = "everbridge-expected-location-schedule";
const SCHEDULE_IMPORT_MAX_BYTES = 2 * 1024 * 1024;
const CONTACT_FIELD_KEYS = new Set(["contactIdType", "contactIdentifier"]);
const LOCKED_CONTACT_MESSAGE = "This saved location is already assigned to its original contact. To assign it to another contact, remove this location and create a new one for the correct contact.";

const ICONS = {
  check: '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"></path></svg>',
  chevronDown: '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"></path></svg>',
  chevronRight: '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"></path></svg>',
  edit: '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M12 20h9"></path><path d="m16.5 3.5 4 4L8 20H4v-4L16.5 3.5z"></path></svg>',
  trash: '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="m19 6-1 14H6L5 6"></path><path d="M10 11v5"></path><path d="M14 11v5"></path></svg>',
};

const COUNTRY_OPTIONS = [
  ["", "Select Country"],
  ["AF", "AF - Afghanistan"],
  ["AX", "AX - Aland Islands"],
  ["AL", "AL - Albania"],
  ["DZ", "DZ - Algeria"],
  ["AS", "AS - American Samoa"],
  ["AD", "AD - Andorra"],
  ["AO", "AO - Angola"],
  ["AI", "AI - Anguilla"],
  ["AQ", "AQ - Antarctica"],
  ["AG", "AG - Antigua and Barbuda"],
  ["AR", "AR - Argentina"],
  ["AM", "AM - Armenia"],
  ["AW", "AW - Aruba"],
  ["AU", "AU - Australia"],
  ["AT", "AT - Austria"],
  ["AZ", "AZ - Azerbaijan"],
  ["BS", "BS - Bahamas"],
  ["BH", "BH - Bahrain"],
  ["BD", "BD - Bangladesh"],
  ["BB", "BB - Barbados"],
  ["BY", "BY - Belarus"],
  ["BE", "BE - Belgium"],
  ["BZ", "BZ - Belize"],
  ["BJ", "BJ - Benin"],
  ["BM", "BM - Bermuda"],
  ["BT", "BT - Bhutan"],
  ["BO", "BO - Bolivia"],
  ["BQ", "BQ - Bonaire, Sint Eustatius and Saba"],
  ["BA", "BA - Bosnia and Herzegovina"],
  ["BW", "BW - Botswana"],
  ["BV", "BV - Bouvet Island"],
  ["BR", "BR - Brazil"],
  ["IO", "IO - British Indian Ocean Territory"],
  ["BN", "BN - Brunei Darussalam"],
  ["BG", "BG - Bulgaria"],
  ["BF", "BF - Burkina Faso"],
  ["BI", "BI - Burundi"],
  ["CV", "CV - Cabo Verde"],
  ["KH", "KH - Cambodia"],
  ["CM", "CM - Cameroon"],
  ["CA", "CA - Canada"],
  ["KY", "KY - Cayman Islands"],
  ["CF", "CF - Central African Republic"],
  ["TD", "TD - Chad"],
  ["CL", "CL - Chile"],
  ["CN", "CN - China"],
  ["CX", "CX - Christmas Island"],
  ["CC", "CC - Cocos (Keeling) Islands"],
  ["CO", "CO - Colombia"],
  ["KM", "KM - Comoros"],
  ["CG", "CG - Congo"],
  ["CD", "CD - Congo, Democratic Republic of the"],
  ["CK", "CK - Cook Islands"],
  ["CR", "CR - Costa Rica"],
  ["CI", "CI - Cote d'Ivoire"],
  ["HR", "HR - Croatia"],
  ["CU", "CU - Cuba"],
  ["CW", "CW - Curacao"],
  ["CY", "CY - Cyprus"],
  ["CZ", "CZ - Czechia"],
  ["DK", "DK - Denmark"],
  ["DJ", "DJ - Djibouti"],
  ["DM", "DM - Dominica"],
  ["DO", "DO - Dominican Republic"],
  ["EC", "EC - Ecuador"],
  ["EG", "EG - Egypt"],
  ["SV", "SV - El Salvador"],
  ["GQ", "GQ - Equatorial Guinea"],
  ["ER", "ER - Eritrea"],
  ["EE", "EE - Estonia"],
  ["SZ", "SZ - Eswatini"],
  ["ET", "ET - Ethiopia"],
  ["FK", "FK - Falkland Islands"],
  ["FO", "FO - Faroe Islands"],
  ["FJ", "FJ - Fiji"],
  ["FI", "FI - Finland"],
  ["FR", "FR - France"],
  ["GF", "GF - French Guiana"],
  ["PF", "PF - French Polynesia"],
  ["TF", "TF - French Southern Territories"],
  ["GA", "GA - Gabon"],
  ["GM", "GM - Gambia"],
  ["GE", "GE - Georgia"],
  ["DE", "DE - Germany"],
  ["GH", "GH - Ghana"],
  ["GI", "GI - Gibraltar"],
  ["GR", "GR - Greece"],
  ["GL", "GL - Greenland"],
  ["GD", "GD - Grenada"],
  ["GP", "GP - Guadeloupe"],
  ["GU", "GU - Guam"],
  ["GT", "GT - Guatemala"],
  ["GG", "GG - Guernsey"],
  ["GN", "GN - Guinea"],
  ["GW", "GW - Guinea-Bissau"],
  ["GY", "GY - Guyana"],
  ["HT", "HT - Haiti"],
  ["HM", "HM - Heard Island and McDonald Islands"],
  ["VA", "VA - Holy See"],
  ["HN", "HN - Honduras"],
  ["HK", "HK - Hong Kong"],
  ["HU", "HU - Hungary"],
  ["IS", "IS - Iceland"],
  ["IN", "IN - India"],
  ["ID", "ID - Indonesia"],
  ["IR", "IR - Iran"],
  ["IQ", "IQ - Iraq"],
  ["IE", "IE - Ireland"],
  ["IM", "IM - Isle of Man"],
  ["IL", "IL - Israel"],
  ["IT", "IT - Italy"],
  ["JM", "JM - Jamaica"],
  ["JP", "JP - Japan"],
  ["JE", "JE - Jersey"],
  ["JO", "JO - Jordan"],
  ["KZ", "KZ - Kazakhstan"],
  ["KE", "KE - Kenya"],
  ["KI", "KI - Kiribati"],
  ["KP", "KP - Korea, Democratic People's Republic of"],
  ["KR", "KR - Korea, Republic of"],
  ["KW", "KW - Kuwait"],
  ["KG", "KG - Kyrgyzstan"],
  ["LA", "LA - Lao People's Democratic Republic"],
  ["LV", "LV - Latvia"],
  ["LB", "LB - Lebanon"],
  ["LS", "LS - Lesotho"],
  ["LR", "LR - Liberia"],
  ["LY", "LY - Libya"],
  ["LI", "LI - Liechtenstein"],
  ["LT", "LT - Lithuania"],
  ["LU", "LU - Luxembourg"],
  ["MO", "MO - Macao"],
  ["MG", "MG - Madagascar"],
  ["MW", "MW - Malawi"],
  ["MY", "MY - Malaysia"],
  ["MV", "MV - Maldives"],
  ["ML", "ML - Mali"],
  ["MT", "MT - Malta"],
  ["MH", "MH - Marshall Islands"],
  ["MQ", "MQ - Martinique"],
  ["MR", "MR - Mauritania"],
  ["MU", "MU - Mauritius"],
  ["YT", "YT - Mayotte"],
  ["MX", "MX - Mexico"],
  ["FM", "FM - Micronesia"],
  ["MD", "MD - Moldova"],
  ["MC", "MC - Monaco"],
  ["MN", "MN - Mongolia"],
  ["ME", "ME - Montenegro"],
  ["MS", "MS - Montserrat"],
  ["MA", "MA - Morocco"],
  ["MZ", "MZ - Mozambique"],
  ["MM", "MM - Myanmar"],
  ["NA", "NA - Namibia"],
  ["NR", "NR - Nauru"],
  ["NP", "NP - Nepal"],
  ["NL", "NL - Netherlands"],
  ["NC", "NC - New Caledonia"],
  ["NZ", "NZ - New Zealand"],
  ["NI", "NI - Nicaragua"],
  ["NE", "NE - Niger"],
  ["NG", "NG - Nigeria"],
  ["NU", "NU - Niue"],
  ["NF", "NF - Norfolk Island"],
  ["MP", "MP - Northern Mariana Islands"],
  ["NO", "NO - Norway"],
  ["OM", "OM - Oman"],
  ["PK", "PK - Pakistan"],
  ["PW", "PW - Palau"],
  ["PS", "PS - Palestine"],
  ["PA", "PA - Panama"],
  ["PG", "PG - Papua New Guinea"],
  ["PY", "PY - Paraguay"],
  ["PE", "PE - Peru"],
  ["PH", "PH - Philippines"],
  ["PN", "PN - Pitcairn"],
  ["PL", "PL - Poland"],
  ["PT", "PT - Portugal"],
  ["PR", "PR - Puerto Rico"],
  ["QA", "QA - Qatar"],
  ["RE", "RE - Reunion"],
  ["RO", "RO - Romania"],
  ["RU", "RU - Russian Federation"],
  ["RW", "RW - Rwanda"],
  ["BL", "BL - Saint Barthelemy"],
  ["SH", "SH - Saint Helena, Ascension and Tristan da Cunha"],
  ["KN", "KN - Saint Kitts and Nevis"],
  ["LC", "LC - Saint Lucia"],
  ["MF", "MF - Saint Martin"],
  ["PM", "PM - Saint Pierre and Miquelon"],
  ["VC", "VC - Saint Vincent and the Grenadines"],
  ["WS", "WS - Samoa"],
  ["SM", "SM - San Marino"],
  ["ST", "ST - Sao Tome and Principe"],
  ["SA", "SA - Saudi Arabia"],
  ["SN", "SN - Senegal"],
  ["RS", "RS - Serbia"],
  ["SC", "SC - Seychelles"],
  ["SL", "SL - Sierra Leone"],
  ["SG", "SG - Singapore"],
  ["SX", "SX - Sint Maarten"],
  ["SK", "SK - Slovakia"],
  ["SI", "SI - Slovenia"],
  ["SB", "SB - Solomon Islands"],
  ["SO", "SO - Somalia"],
  ["ZA", "ZA - South Africa"],
  ["GS", "GS - South Georgia and the South Sandwich Islands"],
  ["SS", "SS - South Sudan"],
  ["ES", "ES - Spain"],
  ["LK", "LK - Sri Lanka"],
  ["SD", "SD - Sudan"],
  ["SR", "SR - Suriname"],
  ["SJ", "SJ - Svalbard and Jan Mayen"],
  ["SE", "SE - Sweden"],
  ["CH", "CH - Switzerland"],
  ["SY", "SY - Syrian Arab Republic"],
  ["TW", "TW - Taiwan"],
  ["TJ", "TJ - Tajikistan"],
  ["TZ", "TZ - Tanzania"],
  ["TH", "TH - Thailand"],
  ["TL", "TL - Timor-Leste"],
  ["TG", "TG - Togo"],
  ["TK", "TK - Tokelau"],
  ["TO", "TO - Tonga"],
  ["TT", "TT - Trinidad and Tobago"],
  ["TN", "TN - Tunisia"],
  ["TR", "TR - Turkey"],
  ["TM", "TM - Turkmenistan"],
  ["TC", "TC - Turks and Caicos Islands"],
  ["TV", "TV - Tuvalu"],
  ["UG", "UG - Uganda"],
  ["UA", "UA - Ukraine"],
  ["AE", "AE - United Arab Emirates"],
  ["GB", "GB - United Kingdom"],
  ["US", "US - United States"],
  ["UM", "UM - United States Minor Outlying Islands"],
  ["UY", "UY - Uruguay"],
  ["UZ", "UZ - Uzbekistan"],
  ["VU", "VU - Vanuatu"],
  ["VE", "VE - Venezuela"],
  ["VN", "VN - Viet Nam"],
  ["VG", "VG - Virgin Islands, British"],
  ["VI", "VI - Virgin Islands, U.S."],
  ["WF", "WF - Wallis and Futuna"],
  ["EH", "EH - Western Sahara"],
  ["YE", "YE - Yemen"],
  ["ZM", "ZM - Zambia"],
  ["ZW", "ZW - Zimbabwe"],
];

const US_STATE_OPTIONS = [
  ["", "Select State/Province"],
  ["AL", "AL - Alabama"],
  ["AK", "AK - Alaska"],
  ["AZ", "AZ - Arizona"],
  ["AR", "AR - Arkansas"],
  ["CA", "CA - California"],
  ["CO", "CO - Colorado"],
  ["CT", "CT - Connecticut"],
  ["DE", "DE - Delaware"],
  ["DC", "DC - District of Columbia"],
  ["FL", "FL - Florida"],
  ["GA", "GA - Georgia"],
  ["HI", "HI - Hawaii"],
  ["ID", "ID - Idaho"],
  ["IL", "IL - Illinois"],
  ["IN", "IN - Indiana"],
  ["IA", "IA - Iowa"],
  ["KS", "KS - Kansas"],
  ["KY", "KY - Kentucky"],
  ["LA", "LA - Louisiana"],
  ["ME", "ME - Maine"],
  ["MD", "MD - Maryland"],
  ["MA", "MA - Massachusetts"],
  ["MI", "MI - Michigan"],
  ["MN", "MN - Minnesota"],
  ["MS", "MS - Mississippi"],
  ["MO", "MO - Missouri"],
  ["MT", "MT - Montana"],
  ["NE", "NE - Nebraska"],
  ["NV", "NV - Nevada"],
  ["NH", "NH - New Hampshire"],
  ["NJ", "NJ - New Jersey"],
  ["NM", "NM - New Mexico"],
  ["NY", "NY - New York"],
  ["NC", "NC - North Carolina"],
  ["ND", "ND - North Dakota"],
  ["OH", "OH - Ohio"],
  ["OK", "OK - Oklahoma"],
  ["OR", "OR - Oregon"],
  ["PA", "PA - Pennsylvania"],
  ["RI", "RI - Rhode Island"],
  ["SC", "SC - South Carolina"],
  ["SD", "SD - South Dakota"],
  ["TN", "TN - Tennessee"],
  ["TX", "TX - Texas"],
  ["UT", "UT - Utah"],
  ["VT", "VT - Vermont"],
  ["VA", "VA - Virginia"],
  ["WA", "WA - Washington"],
  ["WV", "WV - West Virginia"],
  ["WI", "WI - Wisconsin"],
  ["WY", "WY - Wyoming"],
];

const state = {
  queue: [],
  sessions: [],
  activeSessionId: "",
  pendingDeletes: [],
  selectedRowIds: new Set(),
  expandedId: null,
  lockedContactNoticeId: null,
  isSending: false,
  isLoadingSession: false,
  pendingAuthRefreshSessionId: "",
  toastTimer: null,
};

const els = {
  apiBaseUrl: document.querySelector("#apiBaseUrl"),
  apiBaseUrlCombo: document.querySelector("#apiBaseUrlCombo"),
  apiBaseUrlToggle: document.querySelector("#apiBaseUrlToggle"),
  apiBaseUrlMenu: document.querySelector("#apiBaseUrlMenu"),
  organizationId: document.querySelector("#organizationId"),
  username: document.querySelector("#username"),
  password: document.querySelector("#password"),
  endpointPreview: document.querySelector("#endpointPreview"),
  sessionSelect: document.querySelector("#sessionSelect"),
  sessionSelectToggle: document.querySelector("#sessionSelectToggle"),
  sessionSelectOptions: document.querySelector("#sessionSelectOptions"),
  sessionName: document.querySelector("#sessionName"),
  sessionDescription: document.querySelector("#sessionDescription"),
  sessionTimeZone: document.querySelector("#sessionTimeZone"),
  sessionTimeZoneToggle: document.querySelector("#sessionTimeZoneToggle"),
  timeZoneOptions: document.querySelector("#timeZoneOptions"),
  sessionMeta: document.querySelector("#sessionMeta"),
  refreshSession: document.querySelector("#refreshSession"),
  newSession: document.querySelector("#newSession"),
  scheduleMoreToggle: document.querySelector("#scheduleMoreToggle"),
  scheduleMoreMenu: document.querySelector("#scheduleMoreMenu"),
  importSession: document.querySelector("#importSession"),
  scheduleImportFile: document.querySelector("#scheduleImportFile"),
  exportSession: document.querySelector("#exportSession"),
  deleteSession: document.querySelector("#deleteSession"),
  downloadTemplate: document.querySelector("#downloadTemplate"),
  loadCsv: document.querySelector("#loadCsv"),
  csvFile: document.querySelector("#csvFile"),
  addRow: document.querySelector("#addRow"),
  queueCount: document.querySelector("#queueCount"),
  queueBody: document.querySelector("#queueBody"),
  selectAllRows: document.querySelector("#selectAllRows"),
  deleteSelected: document.querySelector("#deleteSelected"),
  sendImport: document.querySelector("#sendImport"),
  importStatus: document.querySelector("#importStatus"),
  toast: document.querySelector("#toast"),
};

function clean(value) {
  return String(value ?? "").trim();
}

function upperClean(value) {
  return clean(value).toUpperCase();
}

function newId() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function browserTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function isIntlTimeZone(value) {
  const timeZone = clean(value);
  if (!timeZone) return false;

  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

function timeZoneIdFromInput(value) {
  const timeZone = clean(value);
  if (isIntlTimeZone(timeZone)) return timeZone;

  const labelMatch = timeZone.match(/^(.+?)\s+\(GMT[+-]\d{2}:\d{2}\)$/i);
  if (labelMatch && isIntlTimeZone(labelMatch[1])) return labelMatch[1];

  return timeZone;
}

function canonicalTimeZoneValue(value) {
  const timeZone = timeZoneIdFromInput(value);
  return isIntlTimeZone(timeZone) ? timeZone : "";
}

function isValidTimeZone(value) {
  return Boolean(canonicalTimeZoneValue(value));
}

function normalizeTimeZone(value, fallback = browserTimeZone()) {
  const timeZone = canonicalTimeZoneValue(value);
  if (timeZone) return timeZone;
  return canonicalTimeZoneValue(fallback) || "UTC";
}

function supportedTimeZoneValues() {
  let supported = [];
  if (typeof Intl.supportedValuesOf === "function") {
    try {
      supported = Intl.supportedValuesOf("timeZone");
    } catch {
      supported = [];
    }
  }

  const values = supported.length ? supported : FALLBACK_TIME_ZONE_VALUES;
  return [...new Set([...values, "UTC"])]
    .filter(isValidTimeZone)
    .sort((a, b) => a.localeCompare(b));
}

function formatOffsetLabel(offsetMs) {
  const totalMinutes = Math.round(offsetMs / 60000);
  const sign = totalMinutes >= 0 ? "+" : "-";
  const absoluteMinutes = Math.abs(totalMinutes);
  const hours = String(Math.floor(absoluteMinutes / 60)).padStart(2, "0");
  const minutes = String(absoluteMinutes % 60).padStart(2, "0");
  return `GMT${sign}${hours}:${minutes}`;
}

function timeZoneOptionLabel(timeZone, date = new Date()) {
  const offset = formatOffsetLabel(timeZoneOffsetMs(date, timeZone));
  return `${timeZone} (${offset})`;
}

function buildTimeZoneOptions() {
  const labelDate = new Date();
  return supportedTimeZoneValues().map((timeZone) => [timeZone, timeZoneOptionLabel(timeZone, labelDate)]);
}

function normalizeTimeZoneSearch(value) {
  return clean(value)
    .toLowerCase()
    .replace(/[_/()]/g, " ")
    .replace(/[^a-z0-9+-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compactTimeZoneSearch(value) {
  return clean(value).toLowerCase().replace(/[^a-z0-9+-]/g, "");
}

function timeZoneSearchText(timeZone, label) {
  return [
    timeZone,
    label,
    timeZone.replaceAll("_", " "),
    timeZone.split("/").at(-1)?.replaceAll("_", " ") ?? "",
  ].join(" ");
}

function timeZoneOptionScore(option, query) {
  const rawQuery = clean(query);
  if (!rawQuery) return 0;

  const [timeZone, label] = option;
  const queryLower = rawQuery.toLowerCase();
  const normalizedQuery = normalizeTimeZoneSearch(rawQuery);
  const compactQuery = compactTimeZoneSearch(rawQuery);
  const city = timeZone.split("/").at(-1)?.replaceAll("_", " ") ?? timeZone;
  const citySearch = normalizeTimeZoneSearch(city);
  const fullSearch = normalizeTimeZoneSearch(timeZoneSearchText(timeZone, label));
  const compactSearch = compactTimeZoneSearch(timeZoneSearchText(timeZone, label));
  const timeZoneLower = timeZone.toLowerCase();
  const labelLower = label.toLowerCase();

  if (timeZoneLower === queryLower || labelLower === queryLower) return 0;
  if (timeZoneLower.startsWith(queryLower)) return 10;
  if (citySearch === normalizedQuery) return 15;
  if (citySearch.startsWith(normalizedQuery)) return 20;
  if (labelLower.includes(queryLower)) return 30;
  if (normalizedQuery && fullSearch.includes(normalizedQuery)) return 40;
  if (compactQuery && compactSearch.includes(compactQuery)) return 50;

  const queryParts = normalizedQuery.split(" ").filter(Boolean);
  if (queryParts.length && queryParts.every((part) => fullSearch.includes(part))) {
    return 60 + queryParts.length;
  }

  return Infinity;
}

function timeZoneOptionsForQuery(selectedValue = "", query = "") {
  const selectedTimeZone = canonicalTimeZoneValue(selectedValue);
  const options = selectedTimeZone
    ? optionsWithCurrent(TIME_ZONE_OPTIONS, selectedTimeZone)
    : TIME_ZONE_OPTIONS;
  const search = clean(query);

  if (!search) return options;

  return options
    .map((option) => ({ option, score: timeZoneOptionScore(option, search) }))
    .filter((result) => Number.isFinite(result.score))
    .sort((a, b) => a.score - b.score || a.option[0].localeCompare(b.option[0]))
    .slice(0, TIME_ZONE_SEARCH_RESULT_LIMIT)
    .map((result) => result.option);
}

function countryNameFromLabel(label) {
  return clean(label).replace(/^[A-Z]{2}\s+-\s+/, "");
}

function optionFullName(options, value) {
  const option = options.find(([optionValue]) => optionValue === value);
  return option ? countryNameFromLabel(option[1]) : "";
}

function normalizedCountrySearch(value) {
  return clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countryValueFromInput(value) {
  const raw = clean(value);
  if (!raw) return "";

  const upper = raw.toUpperCase();
  const option = COUNTRY_OPTIONS.find(([countryCode, label]) => {
    if (!countryCode) return false;
    const countryName = countryNameFromLabel(label);
    return countryCode === upper
      || label.toUpperCase() === upper
      || countryName.toUpperCase() === upper;
  });

  return option?.[0] ?? "";
}

function countryCodeValue(value) {
  return countryValueFromInput(value) || upperClean(value);
}

function countryDisplayValue(value) {
  const countryCode = countryValueFromInput(value);
  return countryCode ? optionFullName(COUNTRY_OPTIONS, countryCode) : clean(value);
}

function countryOptionScore(option, query) {
  const rawQuery = clean(query);
  if (!rawQuery) return 0;

  const [countryCode, label] = option;
  if (!countryCode) return Infinity;

  const queryLower = rawQuery.toLowerCase();
  const normalizedQuery = normalizedCountrySearch(rawQuery);
  const countryName = countryNameFromLabel(label);
  const countryCodeLower = countryCode.toLowerCase();
  const labelLower = label.toLowerCase();
  const countryNameSearch = normalizedCountrySearch(countryName);
  const fullSearch = normalizedCountrySearch(`${countryCode} ${label} ${countryName}`);

  if (countryCodeLower === queryLower || labelLower === queryLower || countryNameSearch === normalizedQuery) return 0;
  if (countryCodeLower.startsWith(queryLower)) return 10;
  if (countryNameSearch.startsWith(normalizedQuery)) return 20;
  if (labelLower.includes(queryLower)) return 30;
  if (normalizedQuery && fullSearch.includes(normalizedQuery)) return 40;

  const queryParts = normalizedQuery.split(" ").filter(Boolean);
  if (queryParts.length && queryParts.every((part) => fullSearch.includes(part))) {
    return 60 + queryParts.length;
  }

  return Infinity;
}

function countryOptionsForQuery(selectedValue = "", query = "") {
  const search = clean(query);
  const selectedCountry = countryValueFromInput(selectedValue);
  const currentCountry = upperClean(selectedValue);
  const options = selectedCountry
    ? optionsWithCurrent(COUNTRY_OPTIONS, selectedCountry)
    : !search && currentCountry
      ? optionsWithCurrent(COUNTRY_OPTIONS, currentCountry)
      : COUNTRY_OPTIONS;

  if (!search) return options;

  return options
    .map((option) => ({ option, score: countryOptionScore(option, search) }))
    .filter((result) => Number.isFinite(result.score))
    .sort((a, b) => a.score - b.score || a.option[0].localeCompare(b.option[0]))
    .slice(0, COUNTRY_SEARCH_RESULT_LIMIT)
    .map((result) => result.option);
}

function stateOptionFromInput(value) {
  const raw = clean(value);
  if (!raw) return null;

  const upper = raw.toUpperCase();
  return US_STATE_OPTIONS.find(([stateCode, label]) => {
    if (!stateCode) return false;
    const stateName = countryNameFromLabel(label);
    return stateCode === upper
      || label.toUpperCase() === upper
      || stateName.toUpperCase() === upper;
  }) ?? null;
}

function stateValueFromInput(value) {
  const option = stateOptionFromInput(value);

  return option ? optionFullName(US_STATE_OPTIONS, option[0]) : "";
}

function stateDisplayValue(value) {
  return stateValueFromInput(value) || clean(value);
}

function stateInputDisplayValue(value) {
  const option = stateOptionFromInput(value);
  return option ? clean(option[1]) : clean(value);
}

function regionValueForItem(item = {}) {
  return countryCodeValue(item.country) === "US" ? stateDisplayValue(item.region) : clean(item.region);
}

function stateOptionScore(option, query) {
  const rawQuery = clean(query);
  if (!rawQuery) return 0;

  const [stateCode, label] = option;
  if (!stateCode) return Infinity;

  const queryLower = rawQuery.toLowerCase();
  const normalizedQuery = normalizedCountrySearch(rawQuery);
  const stateName = countryNameFromLabel(label);
  const stateCodeLower = stateCode.toLowerCase();
  const labelLower = label.toLowerCase();
  const stateNameSearch = normalizedCountrySearch(stateName);
  const fullSearch = normalizedCountrySearch(`${stateCode} ${label} ${stateName}`);

  if (stateCodeLower === queryLower || labelLower === queryLower || stateNameSearch === normalizedQuery) return 0;
  if (stateCodeLower.startsWith(queryLower)) return 10;
  if (stateNameSearch.startsWith(normalizedQuery)) return 20;
  if (labelLower.includes(queryLower)) return 30;
  if (normalizedQuery && fullSearch.includes(normalizedQuery)) return 40;

  const queryParts = normalizedQuery.split(" ").filter(Boolean);
  if (queryParts.length && queryParts.every((part) => fullSearch.includes(part))) {
    return 60 + queryParts.length;
  }

  return Infinity;
}

function stateOptionsForQuery(selectedValue = "", query = "") {
  const search = clean(query);
  const selectedState = stateValueFromInput(selectedValue);
  const currentState = clean(selectedValue);
  const options = selectedState
    ? US_STATE_OPTIONS
    : !search && currentState
      ? [[currentState, currentState], ...US_STATE_OPTIONS]
      : US_STATE_OPTIONS;

  if (!search) return options;

  return options
    .map((option) => ({ option, score: stateOptionScore(option, search) }))
    .filter((result) => Number.isFinite(result.score))
    .sort((a, b) => a.score - b.score || a.option[0].localeCompare(b.option[0]))
    .slice(0, STATE_SEARCH_RESULT_LIMIT)
    .map((result) => result.option);
}

function stateOptionValue(option) {
  return optionFullName(US_STATE_OPTIONS, option[0]) || clean(option[0]);
}

function stateOptionLabel(option) {
  return clean(option[1]) || optionFullName(US_STATE_OPTIONS, option[0]) || clean(option[0]);
}

function currentScheduleTimeZone() {
  return normalizeTimeZone(currentSession()?.timeZone, browserTimeZone());
}

function itemTimeZone(item = {}) {
  return normalizeTimeZone(item.timeZone, currentScheduleTimeZone());
}

function zonedDateParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: normalizeTimeZone(timeZone),
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = Object.fromEntries(formatter.formatToParts(new Date(date)).map((part) => [part.type, part.value]));
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

function padDatePart(value) {
  return String(value).padStart(2, "0");
}

function toLocalInput(date, timeZone = browserTimeZone()) {
  const parts = zonedDateParts(date, timeZone);
  return `${parts.year}-${padDatePart(parts.month)}-${padDatePart(parts.day)}T${padDatePart(parts.hour)}:${padDatePart(parts.minute)}`;
}

function parseLocalDateTime(value) {
  const match = clean(value).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return null;

  const [, year, month, day, hour, minute, second = "0"] = match;
  const parts = {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
    second: Number(second),
  };
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second));
  if (
    date.getUTCFullYear() !== parts.year
    || date.getUTCMonth() !== parts.month - 1
    || date.getUTCDate() !== parts.day
    || date.getUTCHours() !== parts.hour
    || date.getUTCMinutes() !== parts.minute
    || date.getUTCSeconds() !== parts.second
  ) {
    return null;
  }

  return parts;
}

function timeZoneOffsetMs(date, timeZone) {
  const zoned = zonedDateParts(date, timeZone);
  const asUtc = Date.UTC(zoned.year, zoned.month - 1, zoned.day, zoned.hour, zoned.minute, zoned.second);
  return asUtc - new Date(date).getTime();
}

function localPartsMatch(date, timeZone, parts) {
  const zoned = zonedDateParts(date, timeZone);
  return zoned.year === parts.year
    && zoned.month === parts.month
    && zoned.day === parts.day
    && zoned.hour === parts.hour
    && zoned.minute === parts.minute
    && zoned.second === parts.second;
}

function toIsoFromLocal(value, timeZone = currentScheduleTimeZone()) {
  const parts = parseLocalDateTime(value);
  if (!parts) return "";

  const normalizedTimeZone = normalizeTimeZone(timeZone);
  const utcGuess = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  let utcTime = utcGuess - timeZoneOffsetMs(new Date(utcGuess), normalizedTimeZone);
  utcTime = utcGuess - timeZoneOffsetMs(new Date(utcTime), normalizedTimeZone);

  const date = new Date(utcTime);
  return localPartsMatch(date, normalizedTimeZone, parts) ? date.toISOString() : "";
}

function defaultWindow(timeZone = currentScheduleTimeZone()) {
  const start = new Date();
  start.setSeconds(0, 0);

  const end = new Date(start);
  end.setHours(end.getHours() + 8);

  return {
    arriveDate: toLocalInput(start, timeZone),
    expireDate: toLocalInput(end, timeZone),
  };
}

function normalizeLocationEntryMode(value) {
  const normalized = clean(value).toLowerCase().replace(/[^a-z0-9]/g, "");
  if (["asset", "assetid", "assetexternalid", "assetlookup"].includes(normalized)) return "assetExternalId";
  if (["iata", "iatacode", "iatalookup"].includes(normalized)) return "iata";
  return "address";
}

function locationEntryModeLabel(value) {
  const mode = normalizeLocationEntryMode(value);
  return LOCATION_ENTRY_MODE_OPTIONS.find(([optionValue]) => optionValue === mode)?.[1] ?? "Address";
}

function locationEntryMode(item = {}) {
  if (clean(item.locationEntryMode)) return normalizeLocationEntryMode(item.locationEntryMode);
  if (clean(item.assetExternalId)) return "assetExternalId";
  if (clean(item.iata)) return "iata";
  return "address";
}

function createItem(overrides = {}, useDefaults = true) {
  const defaultTimeZone = normalizeTimeZone(overrides.timeZone, currentScheduleTimeZone());
  const windowDefaults = useDefaults ? defaultWindow(defaultTimeZone) : { arriveDate: "", expireDate: "" };
  const item = {
    id: newId(),
    contactIdType: "externalId",
    contactIdentifier: "",
    expectedLocationId: "",
    recreateFromLocationId: "",
    sourceContactIdType: "",
    sourceContactIdentifier: "",
    syncedFingerprint: "",
    locationEntryMode: "address",
    locationName: "",
    country: useDefaults ? "US" : "",
    arriveDate: windowDefaults.arriveDate,
    expireDate: windowDefaults.expireDate,
    timeZone: defaultTimeZone,
    streetAddress: "",
    suite: "",
    city: "",
    region: "",
    postalCode: "",
    iata: "",
    assetExternalId: "",
    lat: "",
    lon: "",
    uploadStatus: {
      state: "pending",
      message: "Not sent",
    },
    ...overrides,
  };

  item.locationEntryMode = locationEntryMode(item);

  if (item.expectedLocationId) {
    item.sourceContactIdType ||= item.contactIdType;
    item.sourceContactIdentifier ||= clean(item.contactIdentifier);
  }

  return item;
}

function normalizeContactIdType(value) {
  const normalized = clean(value).toLowerCase().replace(/[^a-z0-9]/g, "");
  if (["external", "externalid", "contactexternalid"].includes(normalized)) return "externalId";
  return "id";
}

function toLocalInputFromCsv(value, timeZone = currentScheduleTimeZone()) {
  const trimmed = clean(value);
  if (!trimmed) return "";

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const normalized = trimmed.includes(" ") ? trimmed.replace(" ", "T") : trimmed;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalized)) {
    return normalized;
  }

  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? trimmed : toLocalInput(date, timeZone);
}

function formatDateForTable(value, timeZone = currentScheduleTimeZone()) {
  if (!value) return "";
  const iso = toIsoFromLocal(value, timeZone);
  if (!iso) return value;

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: normalizeTimeZone(timeZone),
    timeZoneName: "short",
  }).format(new Date(iso));
}

function basicAuth(username, password) {
  const bytes = new TextEncoder().encode(`${username}:${password}`);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function loadStoredConnection() {
  let saved;
  try {
    saved = JSON.parse(localStorage.getItem(CONNECTION_STORAGE_KEY) || "null");
  } catch {
    return;
  }

  if (!saved || typeof saved !== "object") return;

  const apiBaseUrl = clean(saved.apiBaseUrl);
  if (apiBaseUrl) {
    els.apiBaseUrl.value = apiBaseUrl;
  }
  els.organizationId.value = clean(saved.organizationId);
  els.username.value = clean(saved.username);
}

function saveStoredConnection() {
  const connection = {
    apiBaseUrl: clean(els.apiBaseUrl.value),
    organizationId: clean(els.organizationId.value),
    username: clean(els.username.value),
  };

  try {
    localStorage.setItem(CONNECTION_STORAGE_KEY, JSON.stringify(connection));
  } catch {
    // Storage can be unavailable in private or locked-down browser contexts.
  }
}

function nowIso() {
  return new Date().toISOString();
}

function formatSessionTimestamp(date = new Date()) {
  const localDate = new Date(date);
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
  return localDate.toISOString().slice(0, 16).replace("T", " ");
}

function defaultSessionName() {
  return `Schedule ${formatSessionTimestamp()}`;
}

function legacyItemFingerprint(item) {
  return JSON.stringify({
    contactIdType: item.contactIdType,
    contactIdentifier: clean(item.contactIdentifier),
    arriveDate: clean(item.arriveDate),
    expireDate: clean(item.expireDate),
    timeZone: itemTimeZone(item),
    assetExternalId: clean(item.assetExternalId),
    iata: clean(item.iata).toUpperCase(),
    locationName: clean(item.locationName),
    streetAddress: clean(item.streetAddress),
    city: clean(item.city),
    region: regionValueForItem(item),
    country: countryCodeValue(item.country),
    suite: clean(item.suite),
    postalCode: clean(item.postalCode),
    lat: clean(item.lat),
    lon: clean(item.lon),
  });
}

function itemFingerprint(item) {
  return JSON.stringify({
    locationEntryMode: locationEntryMode(item),
    ...JSON.parse(legacyItemFingerprint(item)),
  });
}

function itemMatchesSyncedFingerprint(item) {
  return Boolean(item.syncedFingerprint)
    && (itemFingerprint(item) === item.syncedFingerprint
      || legacyItemFingerprint(item) === item.syncedFingerprint);
}

function serializeItem(item) {
  const expectedLocationId = clean(item.expectedLocationId) || locationIdFromStatusMessage(item.uploadStatus?.message);
  const sourceContactIdType = expectedLocationId ? item.sourceContactIdType || item.contactIdType : "";
  const sourceContactIdentifier = expectedLocationId ? clean(item.sourceContactIdentifier || item.contactIdentifier) : "";
  return {
    id: item.id,
    expectedLocationId,
    recreateFromLocationId: clean(item.recreateFromLocationId),
    contactIdType: item.contactIdType,
    contactIdentifier: clean(item.contactIdentifier),
    sourceContactIdType,
    sourceContactIdentifier,
    locationEntryMode: locationEntryMode(item),
    arriveDate: clean(item.arriveDate),
    expireDate: clean(item.expireDate),
    timeZone: clean(item.timeZone) || currentScheduleTimeZone(),
    assetExternalId: clean(item.assetExternalId),
    iata: clean(item.iata).toUpperCase(),
    locationName: clean(item.locationName),
    streetAddress: clean(item.streetAddress),
    city: clean(item.city),
    region: regionValueForItem(item),
    country: countryCodeValue(item.country),
    suite: clean(item.suite),
    postalCode: clean(item.postalCode),
    lat: clean(item.lat),
    lon: clean(item.lon),
    syncedFingerprint: item.syncedFingerprint || "",
    uploadStatus: normalizeUploadStatus(item.uploadStatus, item),
  };
}

function locationIdFromStatusMessage(message) {
  return clean(message).match(/Location ID:\s*([^\s]+)/i)?.[1] ?? "";
}

function normalizeUploadStatus(status, row = {}) {
  const allowedStates = new Set(["pending", "refreshing", "sending", "success", "warn", "error"]);
  const expectedLocationId = clean(row?.expectedLocationId) || locationIdFromStatusMessage(status?.message);
  const hasExpectedLocation = Boolean(expectedLocationId);
  let state = allowedStates.has(clean(status?.state)) ? clean(status.state) : "";
  let message = clean(status?.message);

  if (!state) state = hasExpectedLocation ? "success" : "pending";

  if (state === "success" && hasExpectedLocation) {
    message = `Location ID: ${expectedLocationId}`;
  }

  if (!message) {
    if (state === "sending") {
      message = "Sending...";
    } else if (state === "refreshing") {
      message = "Refreshing from Everbridge...";
    } else {
      message = hasExpectedLocation ? `Location ID: ${expectedLocationId}` : "Not sent";
    }
  }

  return { state, message };
}

function restoreDraftItem(row) {
  const item = createItem({
    ...row,
    id: clean(row?.id) || newId(),
    expectedLocationId: clean(row?.expectedLocationId) || locationIdFromStatusMessage(row?.uploadStatus?.message),
  }, false);
  item.uploadStatus = normalizeUploadStatus(row?.uploadStatus, item);
  return item;
}

function hasUnsyncedLocalItem(item) {
  return clean(item.expectedLocationId)
    && Boolean(item.syncedFingerprint)
    && !itemMatchesSyncedFingerprint(item);
}

function shouldRecreateLocation(item) {
  return Boolean(clean(item.recreateFromLocationId));
}

function compactObject(object) {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => {
      if (value === null || value === undefined || value === "") return false;
      if (Array.isArray(value) && !value.length) return false;
      if (typeof value === "object" && !Array.isArray(value) && !Object.keys(value).length) return false;
      return true;
    }),
  );
}

function storageLocationType(mode) {
  if (mode === "assetExternalId") return "asset";
  if (mode === "iata") return "iata";
  return "address";
}

function locationTypeFromStorage(value) {
  if (value === "asset") return "assetExternalId";
  if (value === "iata") return "iata";
  return "address";
}

function compactUploadStatusForStorage(item) {
  const status = normalizeUploadStatus(item.uploadStatus, item);
  const defaultStatus = normalizeUploadStatus(null, item);
  if (status.state === defaultStatus.state && status.message === defaultStatus.message) return null;
  return [status.state, status.message];
}

function uploadStatusFromStorage(value) {
  if (Array.isArray(value)) {
    return normalizeUploadStatus({ state: value[0], message: value[1] });
  }

  return null;
}

function compactRowForStorage(row, includeContact = true, defaults = {}) {
  if (!row || typeof row !== "object") return null;

  const item = restoreDraftItem(row);
  const mode = locationEntryMode(item);
  const expectedLocationId = clean(item.expectedLocationId);
  const timeZone = normalizeTimeZone(row.timeZone || row.tz, defaults.timeZone || currentScheduleTimeZone());
  item.timeZone = timeZone;
  const compact = {
    type: storageLocationType(mode),
    contactIDType: includeContact ? normalizeContactIdType(item.contactIdType) : "",
    contactID: includeContact ? clean(item.contactIdentifier) : "",
    arrive: clean(item.arriveDate),
    expire: clean(item.expireDate),
    tz: timeZone,
    recreate: clean(item.recreateFromLocationId),
    dirty: expectedLocationId && (shouldRecreateLocation(item) || item.uploadStatus?.state === "pending" || hasUnsyncedLocalItem(item)) ? true : "",
    status: compactUploadStatusForStorage(item),
  };

  if (mode === "assetExternalId") {
    compact.asset = clean(item.assetExternalId);
  } else if (mode === "iata") {
    compact.iata = clean(item.iata).toUpperCase();
  } else {
    compact.name = clean(item.locationName);
    compact.street = clean(item.streetAddress);
    compact.city = clean(item.city);
    compact.region = regionValueForItem(item);
    compact.country = countryCodeValue(item.country);
    compact.suite = clean(item.suite);
    compact.postal = clean(item.postalCode);
    compact.lat = clean(item.lat);
    compact.lon = clean(item.lon);
  }

  return compactObject(compact);
}

function expandCompactRow(row, defaults = {}) {
  if (!row || typeof row !== "object") return null;

  const status = uploadStatusFromStorage(row.status);
  const defaultTimeZone = normalizeTimeZone(defaults.timeZone, currentScheduleTimeZone());
  const expanded = {
    expectedLocationId: clean(defaults.expectedLocationId),
    recreateFromLocationId: clean(row.recreate),
    contactIdType: normalizeContactIdType(row.contactIDType ?? defaults.contactIdType),
    contactIdentifier: clean(row.contactID ?? defaults.contactIdentifier),
    locationEntryMode: locationTypeFromStorage(row.type),
    arriveDate: clean(row.arrive),
    expireDate: clean(row.expire),
    timeZone: normalizeTimeZone(row.tz, defaultTimeZone),
    assetExternalId: clean(row.asset),
    iata: clean(row.iata).toUpperCase(),
    locationName: clean(row.name),
    streetAddress: clean(row.street),
    city: clean(row.city),
    region: countryCodeValue(row.country) === "US" ? stateDisplayValue(row.region) : clean(row.region),
    country: countryCodeValue(row.country),
    suite: clean(row.suite),
    postalCode: clean(row.postal),
    lat: clean(row.lat),
    lon: clean(row.lon),
    syncedFingerprint: row.dirty ? "__dirty__" : "",
  };

  if (status) expanded.uploadStatus = status;
  return expanded;
}

function normalizePendingDeleteRef(ref) {
  const locationId = typeof ref === "string" ? clean(ref) : clean(ref?.locationId);

  return locationId ? { locationId } : null;
}

function expandCompactLocationRef(ref, defaults = {}) {
  if (!ref || typeof ref !== "object") return null;

  const locationId = clean(ref.id);
  const contactIdType = normalizeContactIdType(ref.contactIDType);
  const contactIdentifier = clean(ref.contactID);
  const timeZone = normalizeTimeZone(ref.tz, defaults.timeZone || currentScheduleTimeZone());
  if (!locationId || !contactIdentifier) return null;

  return {
    locationId,
    contactIdType,
    contactIdentifier,
    timeZone,
    lastKnown: expandCompactRow(ref, {
      expectedLocationId: locationId,
      contactIdType,
      contactIdentifier,
      timeZone,
    }),
  };
}

function compactLocationRefForStorage(ref, defaults = {}) {
  const normalized = normalizeLocationRef(ref, defaults);
  if (!normalized) return null;
  const compactRow = compactRowForStorage(normalized.lastKnown, false, { timeZone: normalized.timeZone }) || {};

  return compactObject({
    id: normalized.locationId,
    contactIDType: normalizeContactIdType(normalized.contactIdType),
    contactID: clean(normalized.contactIdentifier),
    tz: normalizeTimeZone(normalized.timeZone, currentScheduleTimeZone()),
    ...compactRow,
  });
}

function compactSessionForStorage(session) {
  const timeZone = normalizeTimeZone(session.timeZone, browserTimeZone());
  return compactObject({
    id: clean(session.id),
    name: clean(session.name),
    note: clean(session.description),
    tz: timeZone,
    locations: (session.locationRefs ?? []).map((ref) => compactLocationRefForStorage(ref, { timeZone })).filter(Boolean),
    deleteIds: (session.pendingDeleteRefs ?? []).map(refKey).filter(Boolean),
    drafts: (session.draftRows ?? []).map((row) => compactRowForStorage(row, true, { timeZone })).filter(Boolean),
  });
}

function exportFileNameForSchedule(session) {
  const scheduleName = clean(session?.name) || "schedule";
  const safeName = scheduleName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || "schedule";
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, "");
  return `${safeName}-${timestamp}.json`;
}

function downloadJsonFile(fileName, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function scheduleExportPayload(session) {
  return {
    type: SCHEDULE_EXPORT_TYPE,
    version: SESSION_STORAGE_VERSION,
    exportedAt: nowIso(),
    schedule: compactSessionForStorage(session),
  };
}

function setupTimeZoneOptions() {
  renderScheduleTimeZoneOptions();
}

function renderComboEmpty(message) {
  return `<div class="combo-empty" role="option" aria-disabled="true">${escapeHtml(message)}</div>`;
}

function renderScheduleTimeZoneOptions(selectedValue = "", query = "") {
  if (!els.timeZoneOptions) return;

  const selectedTimeZone = canonicalTimeZoneValue(selectedValue);
  const options = timeZoneOptionsForQuery(selectedTimeZone, query);
  els.timeZoneOptions.innerHTML = options.length
    ? options
      .map(([value, label]) => `<button type="button" role="option" data-schedule-time-zone-option data-value="${escapeAttr(value)}" aria-selected="${value === selectedTimeZone ? "true" : "false"}">${escapeHtml(label)}</button>`)
      .join("")
    : renderComboEmpty("No matching time zones");
}

function extractScheduleFromImportPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("The selected file is not a schedule export. Choose a JSON file exported from this tool.");
  }

  if (payload.type === SCHEDULE_EXPORT_TYPE) {
    if (payload.version !== SESSION_STORAGE_VERSION) {
      throw new Error("This schedule export uses an unsupported version. Ask the sender to export it again from the current tool.");
    }
    return payload.schedule;
  }

  if (payload.version === SESSION_STORAGE_VERSION && Array.isArray(payload.schedules)) {
    if (payload.schedules.length !== 1) {
      throw new Error("This file contains multiple schedules. Import one exported schedule at a time.");
    }
    return payload.schedules[0];
  }

  return payload;
}

function validateCompactRowForImport(row, label, requireSavedLocationFields = false) {
  const errors = [];
  if (!row || typeof row !== "object" || Array.isArray(row)) {
    return [`${label} is not a valid row object.`];
  }

  if (requireSavedLocationFields && !clean(row.id)) errors.push(`${label} is missing a location ID.`);
  if (requireSavedLocationFields && !clean(row.contactID)) errors.push(`${label} is missing a contact ID.`);

  const contactIDType = clean(row.contactIDType);
  if (contactIDType && !["id", "externalId"].includes(contactIDType)) {
    errors.push(`${label} has an unsupported contact ID type.`);
  }

  const type = clean(row.type);
  if (type && !["address", "asset", "iata"].includes(type)) {
    errors.push(`${label} has an unsupported location type.`);
  }

  if (row.status !== undefined && (!Array.isArray(row.status) || row.status.length > 2)) {
    errors.push(`${label} has an invalid status value.`);
  }

  if (clean(row.tz) && !isValidTimeZone(row.tz)) {
    errors.push(`${label} has an invalid time zone.`);
  }

  return errors;
}

function validateScheduleForImport(schedule) {
  const errors = [];
  if (!schedule || typeof schedule !== "object" || Array.isArray(schedule)) {
    return ["The import file does not contain a valid schedule."];
  }

  const hasScheduleFields = ["id", "name", "note", "locations", "drafts", "deleteIds"]
    .some((field) => Object.prototype.hasOwnProperty.call(schedule, field));
  if (!hasScheduleFields) {
    return ["The import file does not contain a current schedule export."];
  }

  if (clean(schedule.tz) && !isValidTimeZone(schedule.tz)) {
    errors.push("The schedule default time zone is invalid.");
  }

  const locations = schedule.locations ?? [];
  const drafts = schedule.drafts ?? [];
  const deleteIds = schedule.deleteIds ?? [];
  if (!Array.isArray(locations)) errors.push("The schedule locations field must be an array.");
  if (!Array.isArray(drafts)) errors.push("The schedule drafts field must be an array.");
  if (!Array.isArray(deleteIds)) errors.push("The schedule deleteIds field must be an array.");
  if (errors.length) return errors;

  if (locations.length + drafts.length > 2000) {
    errors.push("The schedule has more than 2,000 rows. Split it into smaller schedules before importing.");
  }

  const locationIds = new Set();
  locations.forEach((row, index) => {
    errors.push(...validateCompactRowForImport(row, `Location ${index + 1}`, true));
    const locationId = clean(row?.id);
    if (locationId) {
      if (locationIds.has(locationId)) errors.push(`Location ${index + 1} duplicates location ID ${locationId}.`);
      locationIds.add(locationId);
    }
  });

  drafts.forEach((row, index) => {
    errors.push(...validateCompactRowForImport(row, `Draft ${index + 1}`));
  });

  deleteIds.forEach((locationId, index) => {
    if (!clean(locationId)) errors.push(`Delete ID ${index + 1} is blank.`);
  });

  return errors;
}

function uniqueImportedScheduleName(name) {
  const baseName = clean(name) || defaultSessionName();
  const existingNames = new Set(state.sessions.map((session) => clean(session.name)));
  if (!existingNames.has(baseName)) return baseName;

  const importedBase = `${baseName} (Imported)`;
  if (!existingNames.has(importedBase)) return importedBase;

  let index = 2;
  while (existingNames.has(`${importedBase} ${index}`)) index += 1;
  return `${importedBase} ${index}`;
}

function prepareImportedSchedule(schedule) {
  const errors = validateScheduleForImport(schedule);
  if (errors.length) {
    throw new Error(`Schedule import failed. ${errors.slice(0, 4).join(" ")}${errors.length > 4 ? " Fix these issues and try again." : ""}`);
  }

  const imported = normalizeSession(schedule);
  if (!imported) {
    throw new Error("Schedule import failed. The file did not contain a usable schedule.");
  }

  if (state.sessions.some((session) => session.id === imported.id)) {
    imported.id = newId();
  }
  imported.name = uniqueImportedScheduleName(imported.name);
  return imported;
}

function pendingLocalItemFromRef(ref) {
  if (!ref?.lastKnown || typeof ref.lastKnown !== "object") return null;

  const item = restoreDraftItem(ref.lastKnown);
  if (!hasUnsyncedLocalItem(item)) return null;

  if (!["error", "warn"].includes(item.uploadStatus?.state)) {
    setRowUploadStatus(item, "pending", "Edited, pending update");
  }
  return item;
}

function restoreLocationItemFromRef(ref) {
  const pendingLocalItem = pendingLocalItemFromRef(ref);
  if (pendingLocalItem) return pendingLocalItem;

  const lastKnown = ref?.lastKnown && typeof ref.lastKnown === "object" ? ref.lastKnown : null;
  const timeZone = normalizeTimeZone(ref?.timeZone || lastKnown?.timeZone, currentScheduleTimeZone());
  const row = lastKnown
    ? {
        ...lastKnown,
        expectedLocationId: ref.locationId,
        contactIdType: ref.contactIdType,
        contactIdentifier: ref.contactIdentifier,
        timeZone: clean(lastKnown.timeZone) || timeZone,
        sourceContactIdType: ref.contactIdType,
        sourceContactIdentifier: ref.contactIdentifier,
      }
    : {
        expectedLocationId: ref.locationId,
        contactIdType: ref.contactIdType,
        contactIdentifier: ref.contactIdentifier,
        timeZone,
        sourceContactIdType: ref.contactIdType,
        sourceContactIdentifier: ref.contactIdentifier,
      };
  const item = restoreDraftItem(row);

  item.expectedLocationId = clean(ref.locationId);
  item.contactIdType = ref.contactIdType;
  item.contactIdentifier = clean(ref.contactIdentifier);
  item.sourceContactIdType = ref.contactIdType;
  item.sourceContactIdentifier = clean(ref.contactIdentifier);
  if (shouldRecreateLocation(item)) {
    item.recreateFromLocationId = clean(item.recreateFromLocationId) || clean(ref.locationId);
    if (item.uploadStatus?.state !== "error") {
      markLocationForRecreate(item, ref);
    }
    return item;
  }

  item.syncedFingerprint ||= itemFingerprint(item);
  setRowUploadStatus(item, "success", `Location ID: ${item.expectedLocationId}`);
  return item;
}

function markLocationForRecreate(item, ref, message = "") {
  const staleLocationId = refKey(ref);
  item.expectedLocationId = clean(item.expectedLocationId) || staleLocationId;
  item.recreateFromLocationId = staleLocationId;
  item.sourceContactIdType = ref.contactIdType || item.sourceContactIdType || item.contactIdType;
  item.sourceContactIdentifier = clean(ref.contactIdentifier || item.sourceContactIdentifier || item.contactIdentifier);
  setRowUploadStatus(
    item,
    "error",
    message || `Could not refresh saved location ${staleLocationId}. Apply Changes to recreate it from the saved details.`,
  );
  return item;
}

function normalizeLocationRef(ref, defaults = {}) {
  if (!ref || typeof ref !== "object") return null;

  const locationId = clean(ref.locationId);
  const contactIdType = normalizeContactIdType(ref.contactIdType);
  const contactIdentifier = clean(ref.contactIdentifier);
  const timeZone = normalizeTimeZone(ref.timeZone || ref.lastKnown?.timeZone, defaults.timeZone || currentScheduleTimeZone());

  if (!locationId || !contactIdentifier) return null;

  const lastKnown = ref.lastKnown && typeof ref.lastKnown === "object" ? ref.lastKnown : null;
  let lastKnownRow = lastKnown ? restoreDraftItem({
    ...lastKnown,
    expectedLocationId: locationId,
    contactIdType,
    contactIdentifier,
    timeZone: clean(lastKnown.timeZone) || timeZone,
    sourceContactIdType: contactIdType,
    sourceContactIdentifier: contactIdentifier,
  }) : null;
  if (lastKnownRow) {
    lastKnownRow.expectedLocationId = clean(locationId);
    lastKnownRow.contactIdType = contactIdType;
    lastKnownRow.contactIdentifier = contactIdentifier;
    lastKnownRow.timeZone = itemTimeZone(lastKnownRow);
    lastKnownRow.sourceContactIdType = contactIdType;
    lastKnownRow.sourceContactIdentifier = contactIdentifier;
  }

  return {
    locationId,
    contactIdType,
    contactIdentifier,
    timeZone,
    lastKnown: lastKnownRow ? serializeItem(lastKnownRow) : null,
  };
}

function refKey(ref) {
  return clean(ref?.locationId);
}

function locationRefFromItem(item) {
  const locationId = clean(item.expectedLocationId);
  if (!locationId) return null;

  repairStaleSourceContact(item);

  return {
    locationId,
    contactIdType: item.sourceContactIdType || item.contactIdType,
    contactIdentifier: clean(item.sourceContactIdentifier || item.contactIdentifier),
    timeZone: itemTimeZone(item),
    lastKnown: serializeItem(item),
  };
}

function removeStoredLocationRef(locationId) {
  const key = clean(locationId);
  if (!key) return;

  const session = currentSession();
  if (session) {
    session.locationRefs = (session.locationRefs ?? []).filter((ref) => refKey(ref) !== key);
    session.pendingDeleteRefs = (session.pendingDeleteRefs ?? []).filter((ref) => refKey(ref) !== key);
  }

  state.pendingDeletes = state.pendingDeletes.filter((ref) => refKey(ref) !== key);
}

function normalizeSession(session) {
  if (!session || typeof session !== "object") return null;

  const id = clean(session.id) || newId();
  const timeZone = normalizeTimeZone(session.tz, browserTimeZone());
  const locationRefs = (Array.isArray(session.locations) ? session.locations : [])
    .map((ref) => expandCompactLocationRef(ref, { timeZone }))
    .map((ref) => normalizeLocationRef(ref, { timeZone }))
    .filter(Boolean);
  const pendingDeleteRefs = (Array.isArray(session.deleteIds) ? session.deleteIds : [])
    .map(normalizePendingDeleteRef)
    .filter(Boolean);
  const draftRows = (Array.isArray(session.drafts) ? session.drafts : [])
    .filter((row) => row && typeof row === "object")
    .map((row) => expandCompactRow(row, { timeZone }))
    .filter(Boolean)
    .map((row) => serializeItem(restoreDraftItem(row)));
  return {
    id,
    name: clean(session.name) || defaultSessionName(),
    description: clean(session.note),
    timeZone,
    locationRefs,
    pendingDeleteRefs,
    draftRows,
  };
}

function loadStoredSessions() {
  let saved;
  try {
    saved = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) || "null");
  } catch {
    saved = null;
  }

  const sessions = saved?.version === SESSION_STORAGE_VERSION ? saved.schedules : [];
  state.sessions = (Array.isArray(sessions) ? sessions : [])
    .map(normalizeSession)
    .filter(Boolean);

  const activeSessionId = clean(saved?.activeSessionId);
  state.activeSessionId = state.sessions.some((session) => session.id === activeSessionId) ? activeSessionId : "";
}

function saveStoredSessions() {
  const store = {
    version: SESSION_STORAGE_VERSION,
    activeSessionId: state.activeSessionId,
    schedules: state.sessions.map(compactSessionForStorage),
  };

  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(store));
  } catch {
    setToast("Schedule storage is unavailable in this browser context.", "warn");
  }
}

function currentSession() {
  return state.sessions.find((session) => session.id === state.activeSessionId) ?? null;
}

function sessionRefsToRefresh(session = currentSession()) {
  if (!session) return [];

  const pendingDeleteKeys = new Set((session.pendingDeleteRefs ?? []).map(refKey));
  return (session.locationRefs ?? []).filter((ref) => !pendingDeleteKeys.has(refKey(ref)));
}

function isAuthReady() {
  return Boolean(
    clean(els.apiBaseUrl.value)
      && clean(els.organizationId.value)
      && clean(els.username.value)
      && els.password.value,
  );
}

function scheduleRefreshAuthMessage(session = currentSession()) {
  const scheduleName = session?.name ? ` "${session.name}"` : "";
  return `Enter your Everbridge password to refresh schedule${scheduleName} from Everbridge. Local saved details are shown until the refresh completes.`;
}

function showScheduleRefreshAuthPrompt(session = currentSession(), highlightMissing = false, showToast = true) {
  if (!session) return false;

  state.pendingAuthRefreshSessionId = session.id;
  setImportStatus(scheduleRefreshAuthMessage(session), "warn");
  if (showToast) {
    setToast("Authentication required to refresh this schedule.", "warn");
  }
  if (highlightMissing) {
    const missing = [els.apiBaseUrl, els.organizationId, els.username, els.password].filter((input) => !clean(input.value));
    if (missing.length) markInvalid(missing);
  }
  renderSessionControls();
  return true;
}

function updatePendingScheduleRefreshPrompt() {
  const session = currentSession();
  if (!session || state.pendingAuthRefreshSessionId !== session.id) return;

  renderSessionControls();
  if (isAuthReady()) {
    setImportStatus(`Authentication complete. Click Refresh to update schedule "${session.name}" from Everbridge.`, "idle");
  } else {
    setImportStatus(scheduleRefreshAuthMessage(session), "warn");
  }
}

function showRestoredScheduleStatus() {
  const session = currentSession();
  if (!session) return;

  if (sessionRefsToRefresh(session).length && !isAuthReady()) {
    showScheduleRefreshAuthPrompt(session, false, false);
    return;
  }

  const refreshHint = sessionRefsToRefresh(session).length
    ? " Click Refresh to update it from Everbridge."
    : "";
  setImportStatus(`Loaded schedule "${session.name}" from this browser.${refreshHint}`, "idle");
}

function restoreActiveSessionLocally() {
  const session = currentSession();
  if (!session) {
    state.queue = [];
    state.pendingDeletes = [];
    state.expandedId = null;
    return false;
  }

  const pendingDeleteKeys = new Set((session.pendingDeleteRefs ?? []).map(refKey));
  const persistedRows = (session.locationRefs ?? [])
    .filter((ref) => !pendingDeleteKeys.has(refKey(ref)))
    .map(restoreLocationItemFromRef);
  const draftRows = (session.draftRows ?? []).map(restoreDraftItem);

  state.queue = [...persistedRows, ...draftRows];
  state.pendingDeletes = (session.pendingDeleteRefs ?? []).map(normalizePendingDeleteRef).filter(Boolean);
  state.selectedRowIds.clear();
  state.expandedId = null;
  return true;
}

function queueIndexForLocationRef(ref) {
  return state.queue.findIndex((item) => clean(item.expectedLocationId) === clean(ref?.locationId));
}

function replaceQueueLocationRef(ref, item) {
  const index = queueIndexForLocationRef(ref);
  if (index >= 0) {
    state.queue[index] = item;
  } else {
    state.queue.push(item);
  }
}

function createSession(name = defaultSessionName(), description = "") {
  const session = {
    id: newId(),
    name: clean(name) || defaultSessionName(),
    description: clean(description),
    timeZone: currentScheduleTimeZone(),
    locationRefs: [],
    pendingDeleteRefs: [],
    draftRows: [],
  };

  state.sessions.unshift(session);
  state.activeSessionId = session.id;
  state.pendingDeletes = [];
  saveStoredSessions();
  renderSessionControls();
  return session;
}

function sessionSummary(session) {
  if (!session) return "No schedule selected";

  const activeRefs = session.locationRefs?.length ?? 0;
  const pendingUpdates = (session.locationRefs ?? []).filter(pendingLocalItemFromRef).length;
  const draftRows = (session.draftRows?.length ?? 0) + pendingUpdates;
  const pendingDeletes = session.pendingDeleteRefs?.length ?? state.pendingDeletes.length;
  const parts = [
    `${activeRefs} Location${activeRefs === 1 ? "" : "s"}`,
    `${draftRows} Draft${draftRows === 1 ? "" : "s"}`,
  ];
  if (pendingDeletes) parts.push(`${pendingDeletes} Pending Delete${pendingDeletes === 1 ? "" : "s"}`);
  return parts.join(" · ");
}

function scheduleSelectLabel(session) {
  return session ? `${session.name} (${sessionSummary(session)})` : "No schedule selected";
}

function renderScheduleSelectOptions() {
  const options = [
    `<button type="button" role="option" data-schedule-select-option data-value="" aria-selected="${state.activeSessionId ? "false" : "true"}">No schedule selected</button>`,
  ].concat(state.sessions.map((storedSession) => {
    const selected = storedSession.id === state.activeSessionId;
    return `<button type="button" role="option" data-schedule-select-option data-value="${escapeAttr(storedSession.id)}" aria-selected="${selected ? "true" : "false"}">${escapeHtml(scheduleSelectLabel(storedSession))}</button>`;
  }));

  els.sessionSelectOptions.innerHTML = options.join("");
}

function renderSessionControls() {
  const session = currentSession();

  els.sessionSelect.value = scheduleSelectLabel(session);
  els.sessionSelect.dataset.value = session?.id ?? "";
  renderScheduleSelectOptions();
  els.sessionName.value = session?.name ?? "";
  els.sessionDescription.value = session?.description ?? "";
  els.sessionTimeZone.value = session?.timeZone ?? browserTimeZone();
  els.sessionTimeZone.classList.toggle("invalid", Boolean(session) && !isValidTimeZone(els.sessionTimeZone.value));
  renderScheduleTimeZoneOptions(els.sessionTimeZone.value);
  els.sessionMeta.textContent = sessionSummary(session);

  const disabled = state.isSending || state.isLoadingSession;
  const canRefresh = Boolean(session && sessionRefsToRefresh(session).length && isAuthReady());
  els.sessionSelect.disabled = disabled;
  els.sessionSelectToggle.disabled = disabled;
  els.sessionName.disabled = !session || disabled;
  els.sessionDescription.disabled = !session || disabled;
  els.sessionTimeZone.disabled = !session || disabled;
  els.sessionTimeZoneToggle.disabled = !session || disabled;
  if (disabled) setFieldComboMenu(els.sessionSelect.closest(".field-combo"), false);
  if (!session || disabled) setFieldComboMenu(els.sessionTimeZone.closest(".field-combo"), false);
  els.refreshSession.disabled = !canRefresh || disabled;
  els.scheduleMoreToggle.disabled = disabled;
  if (disabled) setScheduleMoreMenu(false);
  els.exportSession.disabled = !session || disabled;
  els.importSession.disabled = disabled;
  els.deleteSession.disabled = !session || disabled;
  els.newSession.disabled = disabled;
}

function saveActiveSessionFromQueue() {
  const session = currentSession();
  if (!session) return null;

  session.name = clean(els.sessionName.value) || session.name || defaultSessionName();
  session.description = clean(els.sessionDescription.value);
  session.timeZone = clean(els.sessionTimeZone.value) || session.timeZone || browserTimeZone();

  const pendingDeleteKeys = new Set(state.pendingDeletes.map(refKey));
  const refsById = new Map(
    (session.locationRefs ?? [])
      .filter((ref) => refKey(ref) && !pendingDeleteKeys.has(refKey(ref)))
      .map((ref) => [refKey(ref), ref]),
  );

  state.queue.forEach((item) => {
    const ref = locationRefFromItem(item);
    if (ref && !pendingDeleteKeys.has(refKey(ref))) {
      refsById.set(refKey(ref), ref);
    }
  });

  session.locationRefs = [...refsById.values()];
  session.pendingDeleteRefs = state.pendingDeletes.map(normalizePendingDeleteRef).filter(Boolean);
  session.draftRows = state.queue
    .filter((item) => !clean(item.expectedLocationId))
    .map(serializeItem);

  saveStoredSessions();
  renderSessionControls();
  return session;
}

function autoSaveActiveSession(description = "Created from local draft.") {
  if (!currentSession() && (state.queue.length || state.pendingDeletes.length)) {
    createSession(defaultSessionName(), description);
  }

  return saveActiveSessionFromQueue();
}

function setApiBaseUrlMenu(open) {
  els.apiBaseUrlMenu.hidden = !open;
  els.apiBaseUrlToggle.setAttribute("aria-expanded", String(open));
}

function setScheduleMoreMenu(open) {
  els.scheduleMoreMenu.hidden = !open;
  els.scheduleMoreToggle.setAttribute("aria-expanded", String(open));
}

function selectApiBaseUrl(value) {
  els.apiBaseUrl.value = value;
  els.apiBaseUrl.classList.remove("invalid");
  saveStoredConnection();
  refreshEndpointPreview();
}

function setFieldComboMenu(combo, open) {
  if (!combo) return;

  const menu = combo.querySelector(".combo-menu");
  const toggle = combo.querySelector("[data-field-combo-toggle]");
  if (!menu || !toggle) return;

  menu.hidden = !open;
  toggle.setAttribute("aria-expanded", String(open));
  if (open) {
    activateInitialComboOption(combo);
  } else {
    clearActiveComboOption(combo);
  }
}

function closeFieldCombos(exceptCombo = null) {
  document.querySelectorAll(".field-combo").forEach((combo) => {
    if (combo !== exceptCombo) setFieldComboMenu(combo, false);
  });
}

function comboOptionButtons(combo) {
  if (!combo) return [];

  return [...combo.querySelectorAll("[data-field-combo-option], [data-schedule-time-zone-option], [data-schedule-select-option]")]
    .filter((option) => !option.disabled && option.getAttribute("aria-disabled") !== "true");
}

function clearActiveComboOption(combo) {
  comboOptionButtons(combo).forEach((option) => {
    option.classList.remove("active");
    delete option.dataset.active;
  });
}

function activeComboOption(combo) {
  return comboOptionButtons(combo).find((option) => option.dataset.active === "true") ?? null;
}

function selectedComboOption(combo) {
  return comboOptionButtons(combo).find((option) => option.getAttribute("aria-selected") === "true") ?? null;
}

function setActiveComboOption(combo, option) {
  clearActiveComboOption(combo);
  if (!option) return;

  option.dataset.active = "true";
  option.classList.add("active");
  option.scrollIntoView({ block: "nearest" });
}

function activateInitialComboOption(combo) {
  const option = selectedComboOption(combo) ?? comboOptionButtons(combo)[0] ?? null;
  setActiveComboOption(combo, option);
}

function activateLastComboOption(combo) {
  const options = comboOptionButtons(combo);
  setActiveComboOption(combo, options.at(-1) ?? null);
}

function moveActiveComboOption(combo, direction) {
  const options = comboOptionButtons(combo);
  if (!options.length) return;

  const current = activeComboOption(combo);
  const currentIndex = current ? options.indexOf(current) : -1;
  const nextIndex = currentIndex < 0
    ? direction > 0 ? 0 : options.length - 1
    : (currentIndex + direction + options.length) % options.length;
  setActiveComboOption(combo, options[nextIndex]);
}

function refreshTimeZoneFieldCombo(input, query = "") {
  if (!input || input.dataset.field !== "timeZone") return;

  const menu = input.closest(".field-combo")?.querySelector(".combo-menu");
  if (!menu) return;

  menu.innerHTML = renderTimeZoneFieldOptions(input.dataset.id, input.dataset.field, input.value, query);
}

function refreshCountryFieldCombo(input, query = "") {
  if (!input || input.dataset.field !== "country") return;

  const menu = input.closest(".field-combo")?.querySelector(".combo-menu");
  if (!menu) return;

  menu.innerHTML = renderCountryFieldOptions(input.dataset.id, input.dataset.field, input.value, query);
}

function refreshStateFieldCombo(input, query = "") {
  if (!input || input.dataset.field !== "region") return;

  const menu = input.closest(".field-combo")?.querySelector(".combo-menu");
  if (!menu) return;

  menu.innerHTML = renderStateFieldOptions(input.dataset.id, input.dataset.field, input.value, query);
}

function refreshSearchableFieldCombo(input, query = input?.value ?? "") {
  if (input?.dataset.field === "timeZone") {
    refreshTimeZoneFieldCombo(input, query);
  } else if (input?.dataset.field === "country") {
    refreshCountryFieldCombo(input, query);
  } else if (input?.dataset.field === "region") {
    refreshStateFieldCombo(input, query);
  }
}

function showFilteredTimeZoneFieldCombo(input, query = input.value) {
  if (!input || input.dataset.field !== "timeZone") return;

  const combo = input.closest(".field-combo");
  refreshTimeZoneFieldCombo(input, query);
  closeFieldCombos(combo);
  setFieldComboMenu(combo, true);
}

function showFilteredCountryFieldCombo(input, query = input.value) {
  if (!input || input.dataset.field !== "country") return;

  const combo = input.closest(".field-combo");
  refreshCountryFieldCombo(input, query);
  closeFieldCombos(combo);
  setFieldComboMenu(combo, true);
}

function showFilteredStateFieldCombo(input, query = input.value) {
  if (!input || input.dataset.field !== "region") return;

  const combo = input.closest(".field-combo");
  refreshStateFieldCombo(input, query);
  closeFieldCombos(combo);
  setFieldComboMenu(combo, true);
}

function selectFieldComboOption(option) {
  const item = state.queue.find((row) => row.id === option.dataset.id);
  if (!item) return;

  const input = option.closest(".field-combo")?.querySelector("[data-field]");
  if (!input) return;

  input.value = option.dataset.value ?? "";
  applyInputValueToItem(input, item);
  autoSaveActiveSession();
  renderQueue();
}

function selectScheduleTimeZoneOption(option) {
  if (!option) return;

  setSessionTimeZoneValue(option.dataset.value, true);
  setFieldComboMenu(els.sessionTimeZone.closest(".field-combo"), false);
}

async function selectScheduleOption(option) {
  if (!option) return;

  const selectedSessionId = clean(option.dataset.value);
  setFieldComboMenu(els.sessionSelect.closest(".field-combo"), false);
  if (selectedSessionId === state.activeSessionId) return;

  autoSaveActiveSession("Created from local draft before schedule switch.");
  state.activeSessionId = selectedSessionId;
  const session = currentSession();
  restoreActiveSessionLocally();
  saveStoredSessions();
  renderSessionControls();
  renderQueue();

  if (session) {
    await loadSelectedSessionFromEverbridge();
  } else {
    state.pendingAuthRefreshSessionId = "";
    setImportStatus("No schedule selected. Add a row or load a CSV, then send reviewed rows to Everbridge.", "idle");
  }
}

function hasPageContentToLose() {
  return state.queue.length > 0 || state.pendingDeletes.length > 0 || Boolean(els.password.value);
}

function requestContactIdType() {
  return state.queue.find((item) => !clean(item.expectedLocationId))?.contactIdType
    ?? state.queue[0]?.contactIdType
    ?? "id";
}

function normalizedRestBaseUrl() {
  const base = clean(els.apiBaseUrl.value).replace(/\/+$/, "");
  return base.endsWith("/rest") ? base : `${base}/rest`;
}

function createEndpointUrl(contactIdType = requestContactIdType()) {
  const base = normalizedRestBaseUrl();
  const orgId = encodeURIComponent(clean(els.organizationId.value));
  const params = new URLSearchParams({
    contactIdType,
    returnIds: "true",
  });

  return `${base}/expectedLocations/${orgId}?${params.toString()}`;
}

function expectedLocationItemUrl(refOrItem) {
  const base = normalizedRestBaseUrl();
  const orgId = encodeURIComponent(clean(els.organizationId.value));
  const contactIdType = refOrItem.sourceContactIdType || refOrItem.contactIdType || "id";
  const contactIdentifier = clean(refOrItem.sourceContactIdentifier || refOrItem.contactIdentifier);
  const expectedLocationId = clean(refOrItem.expectedLocationId || refOrItem.locationId);
  const params = new URLSearchParams({ contactIdType });

  return `${base}/expectedLocations/${orgId}/${encodeURIComponent(contactIdentifier)}/${encodeURIComponent(expectedLocationId)}?${params.toString()}`;
}

function contactExpectedLocationsUrl(refOrItem) {
  const base = normalizedRestBaseUrl();
  const orgId = encodeURIComponent(clean(els.organizationId.value));
  const contactIdType = refOrItem.sourceContactIdType || refOrItem.contactIdType || "id";
  const contactIdentifier = clean(refOrItem.sourceContactIdentifier || refOrItem.contactIdentifier);
  const params = new URLSearchParams({ contactIdType });

  return `${base}/expectedLocations/${orgId}/${encodeURIComponent(contactIdentifier)}?${params.toString()}`;
}

function deleteBatchUrl() {
  const base = normalizedRestBaseUrl();
  const orgId = encodeURIComponent(clean(els.organizationId.value));
  return `${base}/expectedLocations/${orgId}/batch`;
}

function authHeaders(includeJson = true) {
  const headers = {
    Accept: "application/json",
    Authorization: `Basic ${basicAuth(clean(els.username.value), els.password.value)}`,
  };

  if (includeJson) headers["Content-Type"] = "application/json";
  return headers;
}

function refreshEndpointPreview() {
  if (!els.endpointPreview) return;

  const org = clean(els.organizationId.value) || "{organizationId}";
  const params = new URLSearchParams({
    contactIdType: requestContactIdType(),
    returnIds: "true",
  });

  els.endpointPreview.textContent = `POST /expectedLocations/${org}?${params.toString()}`;
}

function setToast(message, type = "") {
  window.clearTimeout(state.toastTimer);
  els.toast.textContent = message;
  els.toast.className = `toast visible ${type}`.trim();
  state.toastTimer = window.setTimeout(() => {
    els.toast.className = "toast";
  }, 3600);
}

function setImportStatus(message, type = "idle") {
  els.importStatus.textContent = message;
  els.importStatus.className = `import-status ${type}`;
}

function markInvalid(inputs) {
  document.querySelectorAll(".invalid").forEach((input) => input.classList.remove("invalid"));
  inputs.forEach((input) => input.classList.add("invalid"));
  inputs[0]?.focus();
}

function optionalText(target, key, value) {
  const trimmed = clean(value);
  if (trimmed) target[key] = trimmed;
}

function validateConnection() {
  const missing = [];
  [els.apiBaseUrl, els.organizationId, els.username, els.password].forEach((input) => {
    if (!clean(input.value)) missing.push(input);
  });

  if (missing.length) {
    markInvalid(missing);
    throw new Error("Authentication fields are required.");
  }

  try {
    new URL(clean(els.apiBaseUrl.value));
  } catch {
    markInvalid([els.apiBaseUrl]);
    throw new Error("API Base URL is invalid.");
  }
}

function parseCoordinate(value, label, errors) {
  const trimmed = clean(value);
  if (!trimmed) return null;

  const number = Number(trimmed);
  if (!Number.isFinite(number)) {
    errors.push(`${label} must be a number.`);
    return null;
  }

  return number;
}

function hasAssetLocation(item) {
  return Boolean(clean(item.assetExternalId));
}

function hasIataLocation(item) {
  return Boolean(clean(item.iata));
}

function hasCompleteAddressLocation(item) {
  return Boolean(
    clean(item.locationName)
      && clean(item.streetAddress)
      && clean(item.city)
      && clean(item.region)
      && clean(item.country),
  );
}

function locationSummary(item) {
  const mode = locationEntryMode(item);
  if (mode === "assetExternalId") {
    return {
      title: locationEntryModeLabel(mode),
    };
  }

  if (mode === "iata") {
    return {
      title: locationEntryModeLabel(mode),
    };
  }

  return {
    title: clean(item.locationName) || "Missing location",
  };
}

function addressLookupSummary(item) {
  const mode = locationEntryMode(item);
  if (mode === "assetExternalId") {
    return {
      title: clean(item.assetExternalId) || "Missing Asset External ID",
      subtitle: "",
    };
  }

  if (mode === "iata") {
    return {
      title: clean(item.iata).toUpperCase() || "Missing IATA",
      subtitle: "",
    };
  }

  const streetAddress = clean(item.streetAddress);
  const region = regionValueForItem(item);
  const country = countryDisplayValue(item.country);
  const addressParts = [item.city, region, item.postalCode, country].map(clean).filter(Boolean);

  if (streetAddress || addressParts.length) {
    return {
      title: streetAddress || "Missing street address",
      subtitle: addressParts.join(", "),
    };
  }

  return {
    title: "Missing Address",
    subtitle: "",
  };
}

function contactIdPayloadValue(value) {
  const trimmed = clean(value);
  if (/^\d+$/.test(trimmed)) {
    const numericId = Number(trimmed);
    if (Number.isSafeInteger(numericId)) return numericId;
  }

  return trimmed;
}

function contactIdTypeLabel(value) {
  return value === "externalId" ? "External ID" : "Contact ID";
}

function isFailedItem(item) {
  return item.uploadStatus?.state === "error";
}

function isContactFieldKey(fieldKey) {
  return CONTACT_FIELD_KEYS.has(fieldKey);
}

function contactChangedFromRef(item, ref) {
  return item.contactIdType !== ref.contactIdType
    || clean(item.contactIdentifier) !== clean(ref.contactIdentifier);
}

function isContactLocked(item, fieldKey) {
  if (!isContactFieldKey(fieldKey) || isFailedItem(item) || shouldRecreateLocation(item)) return false;
  return Boolean(clean(item.expectedLocationId));
}

function showLockedContactMessage(itemId = "") {
  state.lockedContactNoticeId = clean(itemId);
  renderQueue();
}

function repairStaleSourceContact(item) {
  if (!clean(item.expectedLocationId) || isFailedItem(item) || shouldRecreateLocation(item)) return false;

  const sourceType = item.sourceContactIdType || item.contactIdType;
  const sourceContact = clean(item.sourceContactIdentifier || item.contactIdentifier);
  const contactChanged = item.contactIdType !== sourceType || clean(item.contactIdentifier) !== sourceContact;
  if (!contactChanged) return false;

  const unchangedSinceSync = item.uploadStatus?.state === "success"
    && itemMatchesSyncedFingerprint(item);
  if (!unchangedSinceSync) return false;

  item.sourceContactIdType = item.contactIdType;
  item.sourceContactIdentifier = clean(item.contactIdentifier);
  return true;
}

function detachFailedExpectedLocationForContactChange(item, previousRef) {
  if (!previousRef) return;

  const previousKey = refKey(previousRef);
  removeStoredLocationRef(previousKey);
  item.expectedLocationId = "";
  item.recreateFromLocationId = "";
  item.sourceContactIdType = "";
  item.sourceContactIdentifier = "";
  item.syncedFingerprint = "";
  setRowUploadStatus(item, "pending", "Edited, not sent");
}

function applyInputValueToItem(input, item) {
  const fieldKey = input.dataset.field;
  const previousRef = isFailedItem(item) && clean(item.expectedLocationId) && isContactFieldKey(fieldKey)
    ? locationRefFromItem(item)
    : null;

  item[fieldKey] = normalizedInputValue(input, item);

  if (!clean(item.expectedLocationId) && isContactFieldKey(fieldKey)) {
    item.sourceContactIdType = "";
    item.sourceContactIdentifier = "";
  }

  if (previousRef && contactChangedFromRef(item, previousRef)) {
    detachFailedExpectedLocationForContactChange(item, previousRef);
    return;
  }

  markRowEdited(item);
}

function validateItem(item) {
  const errors = [];

  if (!["id", "externalId"].includes(item.contactIdType)) {
    errors.push("Contact ID Type must be Contact ID or External ID.");
  }

  if (!clean(item.contactIdentifier)) errors.push("Contact ID is required.");
  if (clean(item.expectedLocationId) && !isFailedItem(item)) {
    repairStaleSourceContact(item);
    const sourceType = item.sourceContactIdType || item.contactIdType;
    const sourceContact = clean(item.sourceContactIdentifier || item.contactIdentifier);
    if (item.contactIdType !== sourceType || clean(item.contactIdentifier) !== sourceContact) {
      errors.push("Existing Expected Locations cannot change contact. Delete the row and add a new row for another contact.");
    }
  }
  if (!clean(item.arriveDate)) errors.push("Start Time is required.");
  if (!clean(item.expireDate)) errors.push("End Time is required.");
  if (!isValidTimeZone(item.timeZone)) errors.push("Time Zone must be a valid IANA time zone, such as America/New_York.");
  const mode = locationEntryMode(item);
  if (mode === "assetExternalId" && !hasAssetLocation(item)) {
    errors.push("Asset External ID is required for this location entry method.");
  } else if (mode === "iata" && !hasIataLocation(item)) {
    errors.push("IATA is required for this location entry method.");
  } else if (mode === "address" && !hasCompleteAddressLocation(item)) {
    errors.push("Address entry requires Location Name, Street Address, City, State/Province, and Country.");
  }
  if (mode === "address" && clean(item.country) && !countryValueFromInput(item.country)) {
    errors.push("Country must be selected from the list.");
  }
  if (mode === "address" && countryCodeValue(item.country) === "US" && clean(item.region) && !stateValueFromInput(item.region)) {
    errors.push("State/Province must be selected from the list for US addresses.");
  }

  const timeZone = itemTimeZone(item);
  const arriveIso = toIsoFromLocal(item.arriveDate, timeZone);
  const expireIso = toIsoFromLocal(item.expireDate, timeZone);

  if (clean(item.arriveDate) && !arriveIso) errors.push("Start Time is invalid.");
  if (clean(item.expireDate) && !expireIso) errors.push("End Time is invalid.");

  if (arriveIso && expireIso && new Date(expireIso).getTime() <= new Date(arriveIso).getTime()) {
    errors.push("End Time must be after Start Time.");
  }

  const lat = mode === "address" ? parseCoordinate(item.lat, "Latitude", errors) : null;
  const lon = mode === "address" ? parseCoordinate(item.lon, "Longitude", errors) : null;

  if ((lat === null) !== (lon === null)) {
    errors.push("Latitude and Longitude must be entered together.");
  }

  if (lat !== null && (lat < -90 || lat > 90)) {
    errors.push("Latitude must be between -90 and 90.");
  }

  if (lon !== null && (lon < -180 || lon > 180)) {
    errors.push("Longitude must be between -180 and 180.");
  }

  return errors;
}

function buildWrapper(item) {
  const countryCode = countryCodeValue(item.country);
  const country = countryDisplayValue(countryCode);
  const region = regionValueForItem(item);
  const mode = locationEntryMode(item);
  const timeZone = itemTimeZone(item);
  const address = {
    arriveDate: toIsoFromLocal(item.arriveDate, timeZone),
    expireDate: toIsoFromLocal(item.expireDate, timeZone),
  };

  if (mode === "assetExternalId") {
    optionalText(address, "assetExternalId", item.assetExternalId);
  } else if (mode === "iata") {
    optionalText(address, "iata", item.iata.toUpperCase());
  } else {
    optionalText(address, "locationName", item.locationName);
    optionalText(address, "streetAddress", item.streetAddress);
    optionalText(address, "suite", item.suite);
    optionalText(address, "city", item.city);
    optionalText(address, "state", region);
    optionalText(address, "country", country);
    optionalText(address, "postalCode", item.postalCode);
  }

  if (mode === "address" && clean(item.lat) && clean(item.lon)) {
    address.gisLocation = {
      lat: Number(clean(item.lat)),
      lon: Number(clean(item.lon)),
    };
  }

  const wrapper = { address };
  if (item.contactIdType === "externalId") {
    wrapper.contactExternalId = clean(item.contactIdentifier);
  } else {
    wrapper.contactId = contactIdPayloadValue(item.contactIdentifier);
  }

  return wrapper;
}

function payload(items = state.queue) {
  return items.map(buildWrapper);
}

function setRowUploadStatus(item, status, message) {
  item.uploadStatus = normalizeUploadStatus({ state: status, message }, item);
}

function setAllUploadStatuses(status, message, items = state.queue) {
  items.forEach((item) => setRowUploadStatus(item, status, message));
}

function markRowEdited(item) {
  if (state.isSending && item.uploadStatus?.state === "sending") return;
  const message = shouldRecreateLocation(item)
    ? "Edited, pending recreate"
    : clean(item.expectedLocationId)
      ? "Edited, pending update"
      : "Edited, not sent";
  setRowUploadStatus(item, "pending", message);
}

function responseEntries(body) {
  if (!body) return [];
  if (Array.isArray(body)) return body;
  if (typeof body !== "object") return [];

  const keys = [
    "rowResults",
    "results",
    "result",
    "items",
    "records",
    "failedRecords",
    "errors",
    "errorMessages",
    "messages",
    "data",
  ];

  for (const key of keys) {
    const value = body[key];
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") {
      return Object.entries(value).map(([entryKey, entryValue]) => ({
        key: entryKey,
        value: entryValue,
      }));
    }
  }

  return [];
}

function normalizeResponseIndex(value, isLineNumber = false, items = state.queue) {
  const match = String(value ?? "").match(/\d+/);
  if (!match) return null;

  const number = Number(match[0]);
  if (!Number.isInteger(number)) return null;

  if (isLineNumber && number >= 2 && number <= items.length + 1) {
    return number - 2;
  }

  if (number >= 0 && number < items.length) {
    return number;
  }

  if (number >= 1 && number <= items.length) {
    return number - 1;
  }

  return null;
}

function rowIndexFromText(text, items = state.queue) {
  const value = clean(text);
  if (!value) return null;

  const lineMatch = value.match(/\bline\D{0,12}(\d+)\b/i);
  if (lineMatch) {
    const index = normalizeResponseIndex(lineMatch[1], true, items);
    if (index !== null) return index;
  }

  const rowMatch = value.match(/\b(?:row|record|item|index)\D{0,12}(\d+)\b/i);
  if (rowMatch) {
    const index = normalizeResponseIndex(rowMatch[1], false, items);
    if (index !== null) return index;
  }

  const matches = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => {
      const contact = clean(item.contactIdentifier);
      return contact && value.includes(contact);
    });

  return matches.length === 1 ? matches[0].index : null;
}

function entryText(entry) {
  if (entry === null || entry === undefined) return "";
  if (typeof entry !== "object") return clean(entry);

  if ("value" in entry && Object.keys(entry).length === 2 && "key" in entry) {
    return entryText(entry.value) || clean(entry.key);
  }

  const fields = ["message", "errorMessage", "error", "description", "detail", "details", "reason", "statusMessage"];
  for (const field of fields) {
    const value = entry[field];
    if (Array.isArray(value)) return value.map(entryText).filter(Boolean).join(" ");
    if (value && typeof value === "object") return entryText(value);
    if (clean(value)) return clean(value);
  }

  return JSON.stringify(entry);
}

function isCreatedIdMessage(message) {
  return /^\d+$/.test(clean(message));
}

function isErrorLikeMessage(message) {
  const value = clean(message).toLowerCase();
  return /\b(error|failed|failure|invalid|missing|rejected|unable)\b/.test(value)
    || value.includes("not found")
    || value.includes("not exist")
    || value.includes("does not exist")
    || value.includes("cannot");
}

function rowIndexFromEntry(entry, fallbackIndex = null, items = state.queue) {
  if (entry && typeof entry === "object") {
    if ("key" in entry && "value" in entry) {
      const keyIndex = normalizeResponseIndex(entry.key, false, items);
      if (keyIndex !== null) return keyIndex;
    }

    const source = "value" in entry && Object.keys(entry).length === 2 && "key" in entry ? entry.value : entry;
    if (!source || typeof source !== "object") {
      const textIndex = rowIndexFromText(entryText(entry), items);
      return textIndex !== null ? textIndex : fallbackIndex;
    }

    const directFields = ["rowIndex", "index", "recordIndex", "itemIndex", "position", "requestIndex", "key"];
    const oneBasedFields = ["row", "rowNumber", "record", "recordNumber", "item", "itemNumber"];
    const lineFields = ["line", "lineNumber"];

    for (const field of directFields) {
      if (source[field] !== undefined) {
        const index = normalizeResponseIndex(source[field], false, items);
        if (index !== null) return index;
      }
    }

    for (const field of oneBasedFields) {
      if (source[field] !== undefined) {
        const index = normalizeResponseIndex(source[field], false, items);
        if (index !== null) return index;
      }
    }

    for (const field of lineFields) {
      if (source[field] !== undefined) {
        const index = normalizeResponseIndex(source[field], true, items);
        if (index !== null) return index;
      }
    }

    const contactFields = ["contactIdentifier", "contactExternalId", "contactId"];
    for (const field of contactFields) {
      const contact = clean(source[field]);
      if (!contact) continue;
      const matchIndex = items.findIndex((item) => clean(item.contactIdentifier) === contact);
      if (matchIndex >= 0) return matchIndex;
    }
  }

  const textIndex = rowIndexFromText(entryText(entry), items);
  if (textIndex !== null) return textIndex;

  return fallbackIndex;
}

function statusFromEntry(entry, result, fallbackStatus) {
  const message = entryText(entry);

  if (isCreatedIdMessage(message)) {
    return { state: "success", message: `Location ID: ${message}` };
  }

  if (entry && typeof entry === "object") {
    const source = "value" in entry && Object.keys(entry).length === 2 && "key" in entry ? entry.value : entry;
    const statusTextValue = source && typeof source === "object" ? clean(source.status ?? source.state ?? source.result).toLowerCase() : "";
    const code = source && typeof source === "object" ? Number(source.code ?? source.statusCode) : NaN;
    const success = source && typeof source === "object" ? source.success : undefined;
    const createdId = source && typeof source === "object" ? source.expectedLocationId ?? source.locationId ?? source.id ?? source.createdId : "";

    if (success === true || statusTextValue.includes("success") || statusTextValue === "ok" || code === 100) {
      return {
        state: "success",
        message: clean(createdId) ? `Location ID: ${createdId}` : message || "Sent",
      };
    }

    if (success === false || statusTextValue.includes("fail") || statusTextValue.includes("error") || statusTextValue.includes("invalid") || code >= 300) {
      return { state: "error", message: message || "Failed" };
    }

    if (statusTextValue.includes("warn") || code === 200) {
      return { state: "warn", message: message || "Review response" };
    }

    if (clean(createdId)) {
      return { state: "success", message: `Location ID: ${createdId}` };
    }
  }

  if (isErrorLikeMessage(message)) {
    return { state: "error", message: message || "Failed" };
  }

  if (result.ok) {
    return { state: "success", message: message || "Sent" };
  }

  return { state: fallbackStatus, message: message || result.toast };
}

function expectedLocationIdFromEntry(entry) {
  const message = entryText(entry);
  if (isCreatedIdMessage(message)) return clean(message);

  if (entry && typeof entry === "object") {
    const source = "value" in entry && Object.keys(entry).length === 2 && "key" in entry ? entry.value : entry;
    if (source && typeof source === "object") {
      const id = source.expectedLocationId ?? source.locationId ?? source.id ?? source.createdId;
      if (clean(id)) return clean(id);
    }
  }

  return "";
}

function markItemSynced(item, message = "", resetSourceContact = false) {
  const replacedLocationId = clean(item.recreateFromLocationId);
  if (replacedLocationId && clean(item.expectedLocationId) !== replacedLocationId) {
    removeStoredLocationRef(replacedLocationId);
    item.recreateFromLocationId = "";
  }

  if (clean(item.expectedLocationId)) {
    item.sourceContactIdType = resetSourceContact ? item.contactIdType : item.sourceContactIdType || item.contactIdType;
    item.sourceContactIdentifier = resetSourceContact
      ? clean(item.contactIdentifier)
      : clean(item.sourceContactIdentifier || item.contactIdentifier);
  }

  item.syncedFingerprint = itemFingerprint(item);
  setRowUploadStatus(
    item,
    "success",
    message || (clean(item.expectedLocationId) ? `Location ID: ${clean(item.expectedLocationId)}` : "Sent"),
  );
}

function isItemDirty(item) {
  if (shouldRecreateLocation(item)) return true;
  if (!clean(item.expectedLocationId)) return true;
  if (item.uploadStatus?.state === "pending") return true;
  return Boolean(item.syncedFingerprint) && !itemMatchesSyncedFingerprint(item);
}

function applyResponseToRows(result, items = state.queue) {
  const entries = responseEntries(result.body);
  const message = clean(responseDetails(result.body)) || result.toast;

  if (result.ok) {
    if (entries.length === items.length) {
      entries.forEach((entry, index) => {
        const status = statusFromEntry(entry, result, "success");
        const item = items[index];
        const locationId = expectedLocationIdFromEntry(entry);
        const wasUnsent = !clean(item.expectedLocationId) || shouldRecreateLocation(item);
        if (status.state === "success" && locationId) item.expectedLocationId = locationId;
        if (status.state === "success") {
          markItemSynced(item, status.message, wasUnsent);
        } else {
          setRowUploadStatus(item, status.state, status.message);
        }
      });
      return;
    }

    items.forEach((item) => setRowUploadStatus(item, "warn", message || "Sent, but no Expected Location ID was returned."));
    return;
  }

  const fallbackStatus = result.type === "warn" ? "warn" : "error";
  const positional = entries.length === items.length;
  const mappedRows = new Set();

  if (result.type === "warn" && entries.length) {
    items.forEach((item) => markItemSynced(item, "Sent"));
  } else {
    setAllUploadStatuses(fallbackStatus, message, items);
  }

  entries.forEach((entry, index) => {
    const rowIndex = rowIndexFromEntry(entry, positional ? index : null, items);
    if (rowIndex === null || !items[rowIndex]) return;

    const status = statusFromEntry(entry, result, fallbackStatus);
    const item = items[rowIndex];
    const locationId = expectedLocationIdFromEntry(entry);
    const wasUnsent = !clean(item.expectedLocationId) || shouldRecreateLocation(item);
    if (status.state === "success" && locationId) item.expectedLocationId = locationId;
    if (status.state === "success") {
      markItemSynced(item, status.message || message, wasUnsent);
    } else {
      setRowUploadStatus(item, status.state, status.message || message);
    }
    mappedRows.add(rowIndex);
  });

  if (!mappedRows.size && result.type === "warn") {
    setAllUploadStatuses("warn", message, items);
  }
}

function hasChangesToApply() {
  return state.pendingDeletes.length > 0 || state.queue.some(isItemDirty);
}

function pruneSelectedRows() {
  const currentIds = new Set(state.queue.map((item) => item.id));
  state.selectedRowIds.forEach((id) => {
    if (!currentIds.has(id)) state.selectedRowIds.delete(id);
  });
}

function selectedQueueItems() {
  pruneSelectedRows();
  return state.queue.filter((item) => state.selectedRowIds.has(item.id));
}

function refreshSelectionControls() {
  pruneSelectedRows();
  const selectedCount = state.selectedRowIds.size;
  const rowCount = state.queue.length;
  const disabled = state.isSending || state.isLoadingSession;

  if (els.selectAllRows) {
    els.selectAllRows.checked = rowCount > 0 && selectedCount === rowCount;
    els.selectAllRows.indeterminate = selectedCount > 0 && selectedCount < rowCount;
    els.selectAllRows.disabled = rowCount === 0 || disabled;
  }

  if (els.deleteSelected) {
    els.deleteSelected.hidden = selectedCount === 0;
    els.deleteSelected.disabled = selectedCount === 0 || disabled;
  }
}

function refreshQueueActions() {
  const pendingDeleteCount = state.pendingDeletes.length;
  pruneSelectedRows();
  const selectedCount = state.selectedRowIds.size;
  els.queueCount.textContent = `${state.queue.length} Record${state.queue.length === 1 ? "" : "s"}${selectedCount ? ` · ${selectedCount} Selected` : ""}${pendingDeleteCount ? ` · ${pendingDeleteCount} Delete${pendingDeleteCount === 1 ? "" : "s"}` : ""}`;
  els.sendImport.textContent = state.queue.some((item) => clean(item.expectedLocationId)) || pendingDeleteCount
    ? "Apply Changes"
    : "Send to Everbridge";
  els.sendImport.disabled = !hasChangesToApply() || state.isSending || state.isLoadingSession;
  refreshSelectionControls();
}

function renderQueue() {
  refreshQueueActions();
  refreshEndpointPreview();
  renderSessionControls();

  if (!state.queue.length) {
    els.queueBody.innerHTML = '<tr class="empty-row"><td colspan="8">No rows loaded</td></tr>';
    return;
  }

  els.queueBody.innerHTML = "";
  state.queue.forEach((item, index) => {
    const errors = validateItem(item);
    const location = locationSummary(item);
    const addressLookup = addressLookupSummary(item);
    const expanded = state.expandedId === item.id;
    const selected = state.selectedRowIds.has(item.id);
    const disabled = state.isSending ? " disabled" : "";
    const row = document.createElement("tr");
    row.className = `summary-row ${selected ? "selected" : ""} ${expanded ? "expanded" : ""} ${errors.length ? "invalid" : ""}`.trim();
    row.innerHTML = `
      <td class="select-cell"><input class="row-select-checkbox" type="checkbox" data-row-select="${escapeAttr(item.id)}" aria-label="Select row ${index + 1}"${selected ? " checked" : ""}${disabled}></td>
      <td class="expand-cell"><button class="icon-button expand-button" type="button" data-toggle="${item.id}" aria-label="${expanded ? "Collapse" : "Expand"} row ${index + 1}" title="${expanded ? "Collapse" : "Expand"}"${disabled}>${expanded ? ICONS.chevronDown : ICONS.chevronRight}</button></td>
      <td class="contact-cell">
        <span class="row-title">${escapeHtml(clean(item.contactIdentifier) || "Missing contact")}</span>
        <span class="row-subtitle">${contactIdTypeLabel(item.contactIdType)}${errors.length ? ` · ${errors.length} issue${errors.length === 1 ? "" : "s"}` : ""}</span>
      </td>
      <td class="timeframe-cell">
        <span class="row-title">${escapeHtml(formatDateForTable(item.arriveDate, itemTimeZone(item)) || "Missing Start Time")}</span>
        <span class="row-title">${escapeHtml(formatDateForTable(item.expireDate, itemTimeZone(item)) || "Missing End Time")}</span>
      </td>
      <td>
        <span class="row-title">${escapeHtml(location.title)}</span>
      </td>
      <td>
        <span class="row-title">${escapeHtml(addressLookup.title)}</span>
        ${addressLookup.subtitle ? `<span class="row-subtitle">${escapeHtml(addressLookup.subtitle)}</span>` : ""}
      </td>
      <td class="status-cell">
        ${renderUploadStatus(item)}
      </td>
      <td class="actions-cell">
        <div class="row-actions">
          <button class="icon-button row-action-button" type="button" data-toggle="${item.id}" aria-label="${expanded ? "Done Editing Row" : "Edit Row"}" title="${expanded ? "Done" : "Edit"}"${disabled}>${expanded ? ICONS.check : ICONS.edit}</button>
          <button class="icon-button row-action-button danger" type="button" data-remove="${item.id}" aria-label="Remove Row" title="${clean(item.expectedLocationId) ? "Delete" : "Remove"}"${disabled}>${ICONS.trash}</button>
        </div>
      </td>
    `;
    els.queueBody.append(row);

    if (expanded) {
      const detail = document.createElement("tr");
      detail.className = "detail-row";
      detail.innerHTML = `<td colspan="8">${renderEditor(item, errors)}</td>`;
      els.queueBody.append(detail);
    }
  });
}

function renderUploadStatus(item) {
  const status = item.uploadStatus ?? { state: "pending", message: "Not sent" };
  const labels = {
    pending: "Draft",
    refreshing: "Checking",
    sending: "Applying Changes",
    success: "Created",
    warn: "Needs Review",
    error: "Failed",
  };
  return `
    <span class="status-badge ${escapeAttr(status.state)}">${labels[status.state] ?? "Status"}</span>
    <span class="row-subtitle">${escapeHtml(status.message || "")}</span>
  `;
}

function renderEditor(item, errors) {
  const errorHtml = errors.map((error) => `<div>${escapeHtml(error)}</div>`).join("");
  const visibleFields = visibleFieldDefsForItem(item);
  const editorFields = visibleFields
    .map((field) => renderField(item, field))
    .join("");
  const lockedContactNotice = state.lockedContactNoticeId === item.id
    ? `<div class="editor-inline-notice" role="status">${escapeHtml(LOCKED_CONTACT_MESSAGE)}</div>`
    : "";
  return `
    <div class="row-editor">
      <div class="editor-errors">${errorHtml}</div>
      ${lockedContactNotice}
      <div class="field-grid editor-grid">${editorFields}</div>
    </div>
  `;
}

function visibleFieldDefsForItem(item) {
  const mode = locationEntryMode(item);
  return FIELD_DEFS.filter((field) => !field.locationModes || field.locationModes.includes(mode));
}

function optionsInclude(options, value) {
  return options.some(([optionValue]) => optionValue === value);
}

function optionsWithCurrent(options, value) {
  if (!value || optionsInclude(options, value)) return options;

  const currentOption = [value, `${value} - Current Value`];
  if (options[0]?.[0] === "") {
    const [emptyOption, ...rest] = options;
    return [emptyOption, currentOption, ...rest];
  }

  return [currentOption, ...options];
}

function selectOptionsForField(item, field, value) {
  if (field.options === "countries") {
    return countryOptionsForQuery(value);
  }

  if (field.options === "timeZones") {
    return timeZoneOptionsForQuery(value);
  }

  if (field.options === "usStates" && countryCodeValue(item.country) === "US") {
    return stateOptionsForQuery(value);
  }

  return Array.isArray(field.options) ? field.options : null;
}

function fieldValue(item, field) {
  const value = item[field.key] ?? "";
  if (field.key === "contactIdType") return normalizeContactIdType(value);
  if (field.key === "locationEntryMode") return locationEntryMode(item);
  if (field.key === "timeZone") return clean(value) || currentScheduleTimeZone();
  if (field.key === "country") return countryCodeValue(value);
  if (field.key === "region" && countryCodeValue(item.country) === "US") return stateDisplayValue(value);
  return value;
}

function isEditableComboField(field) {
  return field.key === "contactIdType" || field.key === "locationEntryMode" || field.options === "countries" || field.options === "usStates" || field.options === "timeZones";
}

function comboInputValue(field, value) {
  if (field.key === "contactIdType") return contactIdTypeLabel(value);
  if (field.key === "locationEntryMode") return locationEntryModeLabel(value);
  if (field.key === "country") return countryDisplayValue(value);
  if (field.key === "region") return stateInputDisplayValue(value);
  return value;
}

function renderTimeZoneFieldOptions(itemId, fieldKey, selectedValue = "", query = "") {
  const selectedTimeZone = canonicalTimeZoneValue(selectedValue);
  const options = timeZoneOptionsForQuery(selectedTimeZone, query);

  if (!options.length) return renderComboEmpty("No matching time zones");

  return options
    .map(([optionValue, label]) => `<button type="button" role="option" data-field-combo-option data-id="${escapeAttr(itemId)}" data-field="${escapeAttr(fieldKey)}" data-value="${escapeAttr(optionValue)}" aria-selected="${optionValue === selectedTimeZone ? "true" : "false"}">${escapeHtml(label)}</button>`)
    .join("");
}

function renderCountryFieldOptions(itemId, fieldKey, selectedValue = "", query = "") {
  const selectedCountry = countryValueFromInput(selectedValue) || upperClean(selectedValue);
  const options = countryOptionsForQuery(selectedCountry, query);

  if (!options.length) return renderComboEmpty("No matching countries");

  return options
    .map(([optionValue, label]) => `<button type="button" role="option" data-field-combo-option data-id="${escapeAttr(itemId)}" data-field="${escapeAttr(fieldKey)}" data-value="${escapeAttr(optionValue)}" aria-selected="${optionValue === selectedCountry ? "true" : "false"}">${escapeHtml(label)}</button>`)
    .join("");
}

function renderStateFieldOptions(itemId, fieldKey, selectedValue = "", query = "") {
  const selectedState = stateValueFromInput(selectedValue) || clean(selectedValue);
  const options = stateOptionsForQuery(selectedState, query);

  if (!options.length) return renderComboEmpty("No matching states or provinces");

  return options
    .map((option) => {
      const optionValue = stateOptionValue(option);
      const label = stateOptionLabel(option);
      return `<button type="button" role="option" data-field-combo-option data-id="${escapeAttr(itemId)}" data-field="${escapeAttr(fieldKey)}" data-value="${escapeAttr(optionValue)}" aria-selected="${optionValue === selectedState ? "true" : "false"}">${escapeHtml(label)}</button>`;
    })
    .join("");
}

function renderEditableComboField(item, field, value, options, common, required, disabled, wide) {
  const menuId = `combo-${item.id}-${field.key}`;
  const fieldClass = `field-${field.key}`;
  const selectedValue = field.key === "contactIdType"
    ? normalizeContactIdType(value)
    : field.key === "locationEntryMode"
      ? normalizeLocationEntryMode(value)
    : field.key === "country"
      ? countryValueFromInput(value) || upperClean(value)
      : field.key === "region"
        ? stateDisplayValue(value)
        : value;
  const inputValue = comboInputValue(field, selectedValue);
  const readonly = field.key === "contactIdType" || field.key === "locationEntryMode" ? " readonly" : "";
  const optionButtons = field.options === "timeZones"
    ? renderTimeZoneFieldOptions(item.id, field.key, value)
    : field.options === "countries"
      ? renderCountryFieldOptions(item.id, field.key, value)
      : field.options === "usStates"
        ? renderStateFieldOptions(item.id, field.key, value)
      : options
        .map(([optionValue, label]) => `<button type="button" role="option" data-field-combo-option data-id="${escapeAttr(item.id)}" data-field="${escapeAttr(field.key)}" data-value="${escapeAttr(optionValue)}" aria-selected="${selectedValue === optionValue ? "true" : "false"}">${escapeHtml(label)}</button>`)
        .join("");

  return `
    <div class="field-block ${fieldClass}${wide}">
      <label for="${escapeAttr(`${item.id}-${field.key}`)}">${escapeHtml(field.label)}</label>
      <div class="editable-combo field-combo">
        <input id="${escapeAttr(`${item.id}-${field.key}`)}" ${common} type="text" value="${escapeAttr(inputValue)}" autocomplete="off"${required}${readonly}${disabled}>
        <button class="combo-toggle" type="button" data-field-combo-toggle aria-label="Show ${escapeAttr(field.label)} Options" aria-expanded="false" aria-controls="${escapeAttr(menuId)}"${disabled}></button>
        <div class="combo-menu" id="${escapeAttr(menuId)}" role="listbox" hidden>
          ${optionButtons}
        </div>
      </div>
    </div>
  `;
}

function renderLockedContactField(item, field, value, options, common, required, wide) {
  const lockedCommon = `${common} aria-disabled="true" tabindex="-1"`;
  const fieldClass = `field-${field.key}`;
  const lockedAttrs = `class="field-block ${fieldClass}${wide} locked-contact-field" data-contact-locked="true" data-id="${escapeAttr(item.id)}" title="${escapeAttr(LOCKED_CONTACT_MESSAGE)}"`;

  if (field.key === "contactIdType" && options) {
    const menuId = `combo-${item.id}-${field.key}`;
    const selectedValue = normalizeContactIdType(value);
    const optionButtons = options
      .map(([optionValue, label]) => `<button type="button" role="option" data-field-combo-option data-id="${escapeAttr(item.id)}" data-field="${escapeAttr(field.key)}" data-value="${escapeAttr(optionValue)}" aria-selected="${selectedValue === optionValue ? "true" : "false"}" disabled>${escapeHtml(label)}</button>`)
      .join("");

    return `
      <div ${lockedAttrs}>
        <label for="${escapeAttr(`${item.id}-${field.key}`)}">${escapeHtml(field.label)}</label>
        <div class="editable-combo field-combo">
          <input id="${escapeAttr(`${item.id}-${field.key}`)}" ${lockedCommon} type="text" value="${escapeAttr(contactIdTypeLabel(value))}" autocomplete="off"${required} readonly disabled>
          <button class="combo-toggle" type="button" data-field-combo-toggle aria-label="Show ${escapeAttr(field.label)} Options" aria-expanded="false" aria-controls="${escapeAttr(menuId)}" disabled></button>
          <div class="combo-menu" id="${escapeAttr(menuId)}" role="listbox" hidden>
            ${optionButtons}
          </div>
        </div>
      </div>
    `;
  }

  if (field.type === "select" || options) {
    const selectOptions = options
      .map(([optionValue, label]) => `<option value="${optionValue}"${value === optionValue ? " selected" : ""}>${escapeHtml(label)}</option>`)
      .join("");
    return `<label ${lockedAttrs}>${escapeHtml(field.label)}<select ${lockedCommon}${required}>${selectOptions}</select></label>`;
  }

  const type = field.type ?? "text";
  const placeholder = field.placeholder ? ` placeholder="${escapeAttr(field.placeholder)}"` : "";
  const maxLength = field.maxLength ? ` maxlength="${field.maxLength}"` : "";
  const inputmode = field.inputmode ? ` inputmode="${field.inputmode}"` : "";
  return `<label ${lockedAttrs}>${escapeHtml(field.label)}<input ${lockedCommon} type="${type}" value="${escapeAttr(value)}"${placeholder}${maxLength}${inputmode}${required} readonly></label>`;
}

function renderField(item, field) {
  const value = fieldValue(item, field);
  const common = `data-id="${item.id}" data-field="${field.key}"`;
  const required = field.required ? " required" : "";
  const contactLocked = isContactLocked(item, field.key);
  const disabled = state.isSending ? " disabled" : "";
  const fieldClass = `field-${field.key}`;
  const wide = field.wide ? " wide" : "";
  const selectOptions = selectOptionsForField(item, field, value);

  if (contactLocked) {
    return renderLockedContactField(item, field, value, selectOptions, common, required, wide);
  }

  if (selectOptions && isEditableComboField(field)) {
    return renderEditableComboField(item, field, value, selectOptions, common, required, disabled, wide);
  }

  if (field.type === "select" || selectOptions) {
    const options = selectOptions
      .map(([optionValue, label]) => `<option value="${optionValue}"${value === optionValue ? " selected" : ""}>${escapeHtml(label)}</option>`)
      .join("");
    return `<label class="${fieldClass}${wide}">${escapeHtml(field.label)}<select ${common}${required}${disabled}>${options}</select></label>`;
  }

  const type = field.type ?? "text";
  const placeholder = field.placeholder ? ` placeholder="${escapeAttr(field.placeholder)}"` : "";
  const maxLength = field.maxLength ? ` maxlength="${field.maxLength}"` : "";
  const inputmode = field.inputmode ? ` inputmode="${field.inputmode}"` : "";
  return `<label class="${fieldClass}${wide}">${escapeHtml(field.label)}<input ${common} type="${type}" value="${escapeAttr(value)}"${placeholder}${maxLength}${inputmode}${required}${disabled}></label>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("\n", "&#10;");
}

function normalizedInputValue(input, item) {
  if (input.dataset.field === "contactIdType") {
    return normalizeContactIdType(input.value);
  }

  if (input.dataset.field === "locationEntryMode") {
    return normalizeLocationEntryMode(input.value);
  }

  if (input.dataset.field === "timeZone") {
    return canonicalTimeZoneValue(input.value) || clean(input.value);
  }

  if (input.dataset.field === "country") {
    return countryValueFromInput(input.value) || upperClean(input.value);
  }

  if (input.dataset.field === "iata") {
    return upperClean(input.value);
  }

  if (input.dataset.field === "region" && countryCodeValue(item.country) === "US") {
    return stateDisplayValue(input.value);
  }

  return input.value;
}

function fieldChangeNeedsRender(input) {
  return input.tagName === "SELECT" || input.dataset.field === "locationEntryMode" || input.dataset.field === "country" || input.dataset.field === "region";
}

function normalizeHeader(header) {
  return clean(header).replace(/^\uFEFF/, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function canonicalHeader(header) {
  return HEADER_ALIASES[normalizeHeader(header)] ?? null;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  row.push(field);
  rows.push(row);
  return rows.filter((csvRow) => csvRow.some((cell) => clean(cell)));
}

function itemFromCsvRow(headers, row) {
  const raw = {};
  headers.forEach((header, index) => {
    if (header) raw[header] = row[index] ?? "";
  });

  let contactIdType = clean(raw.contactIdType);
  let contactIdentifier = clean(raw.contactIdentifier);

  if (clean(raw.contactExternalId)) {
    contactIdType = "externalId";
    contactIdentifier = clean(raw.contactExternalId);
  }

  if (clean(raw.contactId)) {
    contactIdType = "id";
    contactIdentifier = clean(raw.contactId);
  }

  const country = countryCodeValue(raw.country);
  const region = country === "US"
    ? stateDisplayValue(raw.region)
    : clean(raw.region);
  const timeZone = clean(raw.timeZone) || currentScheduleTimeZone();

  const itemData = {
    contactIdType: normalizeContactIdType(contactIdType),
    contactIdentifier,
    locationName: clean(raw.locationName),
    country,
    arriveDate: toLocalInputFromCsv(raw.arriveDate, normalizeTimeZone(timeZone, currentScheduleTimeZone())),
    expireDate: toLocalInputFromCsv(raw.expireDate, normalizeTimeZone(timeZone, currentScheduleTimeZone())),
    timeZone,
    streetAddress: clean(raw.streetAddress),
    suite: clean(raw.suite),
    city: clean(raw.city),
    region,
    postalCode: clean(raw.postalCode),
    iata: clean(raw.iata).toUpperCase(),
    assetExternalId: clean(raw.assetExternalId),
    lat: clean(raw.lat),
    lon: clean(raw.lon),
  };
  itemData.locationEntryMode = clean(raw.locationEntryMode)
    ? normalizeLocationEntryMode(raw.locationEntryMode)
    : locationEntryMode(itemData);

  return createItem(itemData, false);
}

async function loadCsvFile(file) {
  const text = await file.text();
  const rows = parseCsv(text);

  if (rows.length < 2) {
    throw new Error("CSV must include a header row and at least one data row.");
  }

  const headers = rows[0].map(canonicalHeader);
  if (!headers.some(Boolean)) {
    throw new Error("CSV headers did not match the expected template.");
  }

  const items = rows.slice(1).map((row) => itemFromCsvRow(headers, row));

  if (!items.length) {
    throw new Error("CSV did not contain any rows to load.");
  }

  autoSaveActiveSession("Created from local draft before CSV import.");
  let session = currentSession();
  const appendedToExisting = Boolean(session);

  if (session) {
    state.queue = [...state.queue, ...items];
  } else {
    session = createSession(defaultSessionName(), file?.name ? `CSV import: ${file.name}` : "");
    state.queue = items;
    state.pendingDeletes = [];
  }

  state.expandedId = null;
  saveActiveSessionFromQueue();
  renderQueue();

  const invalidCount = state.queue.filter((item) => validateItem(item).length).length;
  const action = appendedToExisting ? "Added" : "Loaded";
  const target = appendedToExisting ? "to the current schedule" : "from CSV";
  if (invalidCount) {
    setImportStatus(`${action} ${items.length} row${items.length === 1 ? "" : "s"} ${target}. ${invalidCount} row${invalidCount === 1 ? "" : "s"} need review before sending.`, "warn");
  } else {
    setImportStatus(`${action} ${items.length} row${items.length === 1 ? "" : "s"} ${target}. Review the table, then send to Everbridge.`, "success");
  }
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function buildTemplateCsv() {
  const rows = [
    CSV_COLUMNS.map((column) => CSV_TEMPLATE_HEADERS[column] ?? column),
    [
      "External ID",
      "EMP-1001",
      "2026-06-01T09:00",
      "2026-06-01T17:00",
      "America/New_York",
      "Address",
      "",
      "",
      "Normal Day Shift - HQ",
      "25 Corporate Dr",
      "Burlington",
      "Massachusetts",
      "United States",
      "Floor 2",
      "01803",
      "",
      "",
    ],
    [
      "External ID",
      "EMP-1002",
      "2026-06-01T22:00",
      "2026-06-02T06:00",
      "America/Los_Angeles",
      "IATA",
      "",
      "SFO",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ],
    [
      "External ID",
      "EMP-1003",
      "2026-06-03T13:00",
      "2026-06-03T15:30",
      "America/Los_Angeles",
      "Asset External ID",
      "SEA-OFFICE-12",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ],
  ];

  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

function setupTemplateDownload() {
  const csv = buildTemplateCsv();
  els.downloadTemplate.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
}

function classifyEverbridgeResponse(response, body) {
  const apiCode = body && typeof body === "object" ? Number(body.code) : NaN;
  const statusText = Number.isFinite(apiCode)
    ? `${response.status} ${response.statusText} (code ${apiCode})`.trim()
    : `${response.status} ${response.statusText}`.trim();

  if (!response.ok) {
    return { ok: false, toast: "Everbridge rejected the request.", type: "error", statusText, body };
  }

  if (apiCode === 200) {
    return { ok: false, toast: "Everbridge reported partial row errors.", type: "warn", statusText, body };
  }

  if (apiCode >= 300) {
    return { ok: false, toast: "Everbridge rejected one or more rows.", type: "error", statusText, body };
  }

  return { ok: true, toast: "Rows sent to Everbridge.", type: "success", statusText, body };
}

function responseDetails(body) {
  if (!body) return "";
  if (typeof body === "string") return ` ${body}`;
  if (Array.isArray(body.data)) return ` ${body.data.join(" ")}`;
  if (body.message) return ` ${body.message}`;
  return "";
}

function statusText(result) {
  return `${result.statusText}: ${result.toast}${responseDetails(result.body)}`;
}

async function readResponse(response) {
  const text = await response.text();
  if (!text) return "";

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function apiErrorMessage(response, body, fallback = "Everbridge request failed.") {
  const detail = responseDetails(body).trim();
  const status = `${response.status} ${response.statusText}`.trim();
  return detail ? `${status}: ${detail}` : `${status}: ${fallback}`;
}

function isMissingExpectedLocationResponse(response, body) {
  const details = `${response.status} ${response.statusText} ${responseDetails(body)}`.toLowerCase();
  return response.status === 404
    && details.includes("expected location")
    && details.includes("not found");
}

function toLocalInputFromApiDate(value, timeZone = currentScheduleTimeZone()) {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "number" && Number.isFinite(value)) return toLocalInput(value, timeZone);

  const trimmed = clean(value);
  if (/^\d+$/.test(trimmed) && trimmed.length >= 11) {
    return toLocalInput(Number(trimmed), timeZone);
  }

  return toLocalInputFromCsv(trimmed, timeZone);
}

function itemFromApiExpectedLocation(result, ref) {
  const source = result?.result && typeof result.result === "object" ? result.result : result;
  const address = source?.address && typeof source.address === "object" ? source.address : {};
  const locationId = clean(source?.id ?? ref.locationId);
  const contactIdType = ref.contactIdType || normalizeContactIdType(source?.contactExternalId ? "externalId" : "id");
  const contactIdentifier = clean(ref.contactIdentifier)
    || (contactIdType === "externalId" ? clean(source?.contactExternalId) : clean(source?.contactId));
  const gisLocation = address.gisLocation && typeof address.gisLocation === "object" ? address.gisLocation : {};
  const timeZone = normalizeTimeZone(ref?.timeZone || ref?.lastKnown?.timeZone, currentScheduleTimeZone());

  const item = createItem({
    expectedLocationId: locationId,
    contactIdType,
    contactIdentifier,
    sourceContactIdType: contactIdType,
    sourceContactIdentifier: contactIdentifier,
    locationEntryMode: locationEntryMode(address),
    locationName: clean(address.locationName),
    country: clean(address.country),
    arriveDate: toLocalInputFromApiDate(address.arriveDate, timeZone),
    expireDate: toLocalInputFromApiDate(address.expireDate, timeZone),
    timeZone,
    streetAddress: clean(address.streetAddress),
    suite: clean(address.suite),
    city: clean(address.city),
    region: clean(address.state),
    postalCode: clean(address.postalCode),
    iata: clean(address.iata).toUpperCase(),
    assetExternalId: clean(address.assetExternalId),
    lat: clean(gisLocation.lat),
    lon: clean(gisLocation.lon),
    uploadStatus: {
      state: "success",
      message: locationId ? `Location ID: ${locationId}` : "Loaded from Everbridge",
    },
  }, false);

  item.syncedFingerprint = itemFingerprint(item);
  return item;
}

async function fetchExpectedLocation(ref) {
  const response = await fetch(expectedLocationItemUrl(ref), {
    method: "GET",
    headers: authHeaders(false),
  });
  const body = await readResponse(response);

  if (response.ok) {
    return itemFromApiExpectedLocation(body, ref);
  }

  if (response.status === 404) {
    return fetchExpectedLocationFromContactList(ref);
  }

  throw new Error(apiErrorMessage(response, body, `Could not load Expected Location ${ref.locationId}.`));
}

async function fetchExpectedLocationFromContactList(ref) {
  const response = await fetch(contactExpectedLocationsUrl(ref), {
    method: "GET",
    headers: authHeaders(false),
  });
  const body = await readResponse(response);

  if (!response.ok) {
    throw new Error(apiErrorMessage(response, body, `Could not list Expected Locations for contact ${ref.contactIdentifier}.`));
  }

  const locations = Array.isArray(body?.result) ? body.result : [];
  const match = locations.find((entry) => clean(entry?.id) === clean(ref.locationId));
  if (!match) {
    throw new Error(`Expected Location ${ref.locationId} was not found for contact ${ref.contactIdentifier}.`);
  }

  return itemFromApiExpectedLocation(match, ref);
}

async function loadSelectedSessionFromEverbridge() {
  const session = currentSession();
  if (!session) {
    setToast("Select a schedule to load.", "warn");
    return;
  }

  const refsToLoad = sessionRefsToRefresh(session);
  if (refsToLoad.length && !isAuthReady()) {
    showScheduleRefreshAuthPrompt(session, true);
    return;
  }

  try {
    state.isLoadingSession = true;
    state.pendingAuthRefreshSessionId = "";
    renderSessionControls();

    if (refsToLoad.length) validateConnection();
    setImportStatus(`Loading ${refsToLoad.length} saved Expected Location${refsToLoad.length === 1 ? "" : "s"} from Everbridge...`, "sending");

    const loadedRows = [];
    const failures = [];
    for (const ref of refsToLoad) {
      const localIndex = queueIndexForLocationRef(ref);
      const localItem = localIndex >= 0 ? state.queue[localIndex] : null;
      if (localItem) {
        setRowUploadStatus(localItem, "refreshing", "Refreshing from Everbridge...");
        autoSaveActiveSession();
        renderQueue();
      }

      try {
        const loadedItem = await fetchExpectedLocation(ref);
        loadedRows.push(loadedItem);
        replaceQueueLocationRef(ref, loadedItem);
        autoSaveActiveSession();
        renderQueue();
      } catch (error) {
        const pendingLocalItem = pendingLocalItemFromRef(ref);
        if (pendingLocalItem) {
          loadedRows.push(pendingLocalItem);
          replaceQueueLocationRef(ref, pendingLocalItem);
          autoSaveActiveSession();
          renderQueue();
          failures.push(`${error.message} Local unsent changes were restored.`);
        } else {
          const failureItem = localItem ?? restoreLocationItemFromRef(ref);
          markLocationForRecreate(failureItem, ref);
          loadedRows.push(failureItem);
          replaceQueueLocationRef(ref, failureItem);
          autoSaveActiveSession();
          renderQueue();
          failures.push(error.message);
        }
      }
    }

    const draftRows = (session.draftRows ?? []).map(restoreDraftItem);
    state.queue = [...loadedRows, ...draftRows];
    state.pendingDeletes = (session.pendingDeleteRefs ?? []).map(normalizePendingDeleteRef).filter(Boolean);
    state.selectedRowIds.clear();
    state.expandedId = null;
    saveActiveSessionFromQueue();
    renderQueue();

    if (failures.length) {
      setImportStatus(`Loaded ${loadedRows.length} rows. ${failures.length} saved location${failures.length === 1 ? "" : "s"} could not be retrieved: ${failures.join(" ")}`, "warn");
      setToast("Schedule loaded with retrieval warnings.", "warn");
    } else {
      const source = refsToLoad.length ? " from Everbridge" : "";
      setImportStatus(`Loaded schedule "${session.name}"${source}. Edit rows or remove rows, then apply changes.`, "success");
      setToast("Schedule loaded.", "success");
    }
  } catch (error) {
    const message = error instanceof TypeError
      ? "Request blocked or network unavailable. Check CORS, VPN, and API Base URL."
      : error.message;
    setImportStatus(`Schedule load failed: ${message}`, "error");
    setToast(message, "error");
  } finally {
    state.isLoadingSession = false;
    renderQueue();
  }
}

async function createExpectedLocations(items) {
  if (!items.length) return null;

  const contactType = items[0].contactIdType;
  setAllUploadStatuses("sending", "Creating...", items);
  autoSaveActiveSession();
  renderQueue();

  const response = await fetch(createEndpointUrl(contactType), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload(items)),
  });

  const body = await readResponse(response);
  const result = classifyEverbridgeResponse(response, body);
  applyResponseToRows(result, items);
  autoSaveActiveSession();
  return result;
}

async function updateExpectedLocation(item) {
  setRowUploadStatus(item, "sending", "Updating...");
  autoSaveActiveSession();
  renderQueue();

  const response = await fetch(expectedLocationItemUrl(item), {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(buildWrapper(item).address),
  });

  const body = await readResponse(response);
  const result = classifyEverbridgeResponse(response, body);
  if (!result.ok) {
    if (isMissingExpectedLocationResponse(response, body)) {
      const staleRef = locationRefFromItem(item);
      if (staleRef) {
        markLocationForRecreate(
          item,
          staleRef,
          `Expected Location ${staleRef.locationId} was not found in Everbridge. Recreating it from the saved details...`,
        );
        autoSaveActiveSession();
        renderQueue();
        const recreateResult = await createExpectedLocations([item]);
        return { ...recreateResult, recreated: true, originalResult: result };
      }
    }

    setRowUploadStatus(item, result.type === "warn" ? "warn" : "error", statusText(result));
    autoSaveActiveSession();
    return result;
  }

  const id = clean(body?.id ?? item.expectedLocationId);
  if (id) item.expectedLocationId = id;
  markItemSynced(item, id ? `Location ID: ${id}` : "Updated");
  autoSaveActiveSession();
  return result;
}

function deleteGenuineFailureIds(body) {
  return responseEntries(body)
    .map(entryText)
    .filter(Boolean)
    .filter((message) => isErrorLikeMessage(message) && !message.toLowerCase().includes("not found"))
    .map((message) => clean(message.match(/\d+/)?.[0]))
    .filter(Boolean);
}

async function deleteExpectedLocations(refs) {
  if (!refs.length) return null;

  const locationIds = refs.map(refKey).filter(Boolean);
  const response = await fetch(deleteBatchUrl(), {
    method: "DELETE",
    headers: authHeaders(),
    body: JSON.stringify(locationIds),
  });

  const body = await readResponse(response);
  const result = classifyEverbridgeResponse(response, body);
  const entries = responseEntries(body);
  const failedIds = result.ok ? [] : (entries.length ? deleteGenuineFailureIds(body) : locationIds);
  const failedIdSet = new Set(failedIds);
  const removedIdSet = new Set(locationIds.filter((locationId) => !failedIdSet.has(locationId)));

  state.pendingDeletes = refs.filter((ref) => failedIdSet.has(refKey(ref)));
  const session = currentSession();
  if (session && removedIdSet.size) {
    session.locationRefs = (session.locationRefs ?? []).filter((ref) => !removedIdSet.has(refKey(ref)));
    session.pendingDeleteRefs = state.pendingDeletes.map(normalizePendingDeleteRef).filter(Boolean);
  }

  return {
    ...result,
    removedIds: [...removedIdSet],
    failedIds,
  };
}

async function deleteExpectedLocationNow(item) {
  const ref = locationRefFromItem(item);
  if (!ref) return;

  try {
    validateConnection();
    state.isSending = true;
    setRowUploadStatus(item, "sending", "Deleting...");
    autoSaveActiveSession();
    renderQueue();

    const result = await deleteExpectedLocations([ref]);
    const removed = result?.removedIds?.includes(refKey(ref));

    if (!removed) {
      const message = result ? statusText(result) : "Delete failed.";
      state.pendingDeletes = state.pendingDeletes.filter((pendingRef) => refKey(pendingRef) !== refKey(ref));
      setRowUploadStatus(item, result?.type === "warn" ? "warn" : "error", message);
      autoSaveActiveSession();
      setImportStatus(`Delete failed: ${message}`, "error");
      setToast("Delete failed.", "error");
      return;
    }

    state.queue = state.queue.filter((row) => row.id !== item.id);
    state.selectedRowIds.delete(item.id);
    state.pendingDeletes = state.pendingDeletes.filter((pendingRef) => refKey(pendingRef) !== refKey(ref));
    if (state.expandedId === item.id) state.expandedId = null;
    autoSaveActiveSession();
    setImportStatus(`Expected Location ${ref.locationId} deleted from Everbridge.`, "success");
    setToast("Expected Location deleted.", "success");
  } catch (error) {
    const message = error instanceof TypeError
      ? "Request blocked or network unavailable. Check CORS, VPN, and API Base URL."
      : error.message;
    setRowUploadStatus(item, "error", message);
    autoSaveActiveSession();
    setImportStatus(`Delete failed: ${message}`, "error");
    setToast(message, "error");
  } finally {
    state.isSending = false;
    autoSaveActiveSession();
    renderQueue();
  }
}

async function deleteSelectedExpectedLocationsNow() {
  const selectedItems = selectedQueueItems();
  if (!selectedItems.length) {
    setToast("Select rows to delete.", "warn");
    return;
  }

  const selectedIdSet = new Set(selectedItems.map((item) => item.id));
  const persistedEntries = selectedItems
    .map((item) => ({
      item,
      ref: locationRefFromItem(item) || { locationId: clean(item.expectedLocationId) },
    }))
    .filter(({ ref }) => refKey(ref));
  const persistedRefs = persistedEntries.map(({ ref }) => ref);
  const draftCount = selectedItems.length - persistedEntries.length;
  const expectedLocationCount = persistedEntries.length;
  const confirmMessage = expectedLocationCount
    ? `Delete ${selectedItems.length} selected row${selectedItems.length === 1 ? "" : "s"}? ${expectedLocationCount} Expected Location${expectedLocationCount === 1 ? "" : "s"} will be deleted from Everbridge immediately. ${draftCount ? `${draftCount} draft row${draftCount === 1 ? "" : "s"} will be removed locally. ` : ""}Rows that fail to delete will stay visible.`
    : `Remove ${draftCount} selected draft row${draftCount === 1 ? "" : "s"} from this schedule?`;

  if (!window.confirm(confirmMessage)) return;

  try {
    if (persistedRefs.length) validateConnection();

    state.isSending = true;
    persistedEntries.forEach(({ item }) => setRowUploadStatus(item, "sending", "Deleting..."));
    autoSaveActiveSession();
    renderQueue();

    const result = persistedRefs.length ? await deleteExpectedLocations(persistedRefs) : null;
    const removedIdSet = new Set(result?.removedIds ?? []);
    const failedIdSet = new Set(result?.failedIds ?? []);
    const attemptedIdSet = new Set(persistedRefs.map(refKey));

    state.pendingDeletes = state.pendingDeletes.filter((ref) => !attemptedIdSet.has(refKey(ref)));
    state.queue = state.queue.filter((item) => {
      if (!selectedIdSet.has(item.id)) return true;
      const locationId = clean(item.expectedLocationId);
      if (!locationId) return false;
      return !removedIdSet.has(locationId);
    });

    if (failedIdSet.size) {
      const message = result ? statusText(result) : "Delete failed.";
      state.queue
        .filter((item) => failedIdSet.has(clean(item.expectedLocationId)))
        .forEach((item) => setRowUploadStatus(item, result?.type === "warn" ? "warn" : "error", message));
    }

    if (state.expandedId && !state.queue.some((item) => item.id === state.expandedId)) {
      state.expandedId = null;
    }
    state.selectedRowIds.clear();

    autoSaveActiveSession();

    const removedCount = removedIdSet.size;
    if (failedIdSet.size) {
      const deletedPart = removedCount ? `${removedCount} Expected Location${removedCount === 1 ? "" : "s"} deleted. ` : "";
      setImportStatus(`${deletedPart}${failedIdSet.size} Expected Location${failedIdSet.size === 1 ? "" : "s"} could not be deleted and remain visible.`, "warn");
      setToast("Delete Selected completed with warnings.", "warn");
    } else if (expectedLocationCount) {
      const draftPart = draftCount ? ` ${draftCount} draft row${draftCount === 1 ? "" : "s"} removed locally.` : "";
      setImportStatus(`Deleted ${removedCount} Expected Location${removedCount === 1 ? "" : "s"} from Everbridge.${draftPart}`, "success");
      setToast("Selected rows deleted.", "success");
    } else {
      setImportStatus("Selected draft rows removed.", "success");
      setToast("Selected drafts removed.", "success");
    }
  } catch (error) {
    const message = error instanceof TypeError
      ? "Request blocked or network unavailable. Check CORS, VPN, and API Base URL."
      : error.message;
    persistedEntries.forEach(({ item }) => setRowUploadStatus(item, "error", message));
    autoSaveActiveSession();
    setImportStatus(`Delete Selected failed: ${message}`, "error");
    setToast(message, "error");
  } finally {
    state.isSending = false;
    autoSaveActiveSession();
    renderQueue();
  }
}

async function sendImport() {
  try {
    if (!state.queue.length && !state.pendingDeletes.length) {
      setToast("No changes to apply.", "warn");
      return;
    }

    autoSaveActiveSession("Created from manual row entry.");
    validateConnection();

    const invalidIndex = state.queue.findIndex((item) => validateItem(item).length);
    if (invalidIndex >= 0) {
      const errors = validateItem(state.queue[invalidIndex]);
      setRowUploadStatus(state.queue[invalidIndex], "error", errors[0]);
      autoSaveActiveSession();
      renderQueue();
      setImportStatus(`Fix row ${invalidIndex + 1}: ${errors[0]}`, "error");
      setToast("Fix row issues before sending.", "error");
      return;
    }

    const createRows = state.queue.filter((item) => !clean(item.expectedLocationId) || shouldRecreateLocation(item));
    const updateRows = state.queue.filter((item) => clean(item.expectedLocationId) && !shouldRecreateLocation(item) && isItemDirty(item));
    const deleteRefs = [...state.pendingDeletes];

    if (!createRows.length && !updateRows.length && !deleteRefs.length) {
      autoSaveActiveSession();
      setImportStatus("No schedule changes to apply.", "idle");
      setToast("No changes to apply.", "warn");
      return;
    }

    autoSaveActiveSession();
    state.isSending = true;
    els.sendImport.textContent = "Sending";
    renderQueue();
    setImportStatus(`Applying ${createRows.length} create, ${updateRows.length} update, and ${deleteRefs.length} delete operation${createRows.length + updateRows.length + deleteRefs.length === 1 ? "" : "s"}...`, "sending");

    const createTypes = [...new Set(createRows.map((item) => item.contactIdType))];
    for (const contactIdType of createTypes) {
      const group = createRows.filter((item) => item.contactIdType === contactIdType);
      await createExpectedLocations(group);
      autoSaveActiveSession();
    }

    let recreatedUpdateCount = 0;
    for (const item of updateRows) {
      const result = await updateExpectedLocation(item);
      if (result?.recreated) recreatedUpdateCount += 1;
      autoSaveActiveSession();
    }

    if (deleteRefs.length) {
      await deleteExpectedLocations(deleteRefs);
      autoSaveActiveSession();
    }

    autoSaveActiveSession();

    const issueCount = state.queue.filter((item) => ["warn", "error"].includes(item.uploadStatus?.state)).length + state.pendingDeletes.length;
    if (issueCount) {
      setImportStatus(`Sync completed with ${issueCount} item${issueCount === 1 ? "" : "s"} needing review.`, "warn");
      setToast("Sync completed with warnings.", "warn");
    } else {
      setImportStatus("Schedule changes applied to Everbridge.", "success");
      setToast("Schedule changes applied.", "success");
    }
  } catch (error) {
    const message = error instanceof TypeError
      ? "Request blocked or network unavailable. Check CORS, VPN, and API Base URL."
      : error.message;
    state.queue
      .filter((item) => item.uploadStatus?.state === "sending")
      .forEach((item) => setRowUploadStatus(item, "error", message));
    autoSaveActiveSession();
    setImportStatus(`Error: ${message}`, "error");
    setToast(message, "error");
  } finally {
    state.isSending = false;
    autoSaveActiveSession();
    renderQueue();
  }
}

function exportCurrentSchedule() {
  const session = saveActiveSessionFromQueue();
  if (!session) {
    setToast("Select a schedule to export.", "warn");
    return;
  }

  const payload = scheduleExportPayload(session);
  downloadJsonFile(exportFileNameForSchedule(session), payload);
  setImportStatus(`Exported schedule "${session.name}". Share the JSON file only with people who should work from these saved location details.`, "success");
  setToast("Schedule exported.", "success");
}

async function importScheduleFile(file) {
  if (!file) return;
  if (file.size > SCHEDULE_IMPORT_MAX_BYTES) {
    throw new Error("The schedule file is too large. Ask the sender to split the work into smaller schedules.");
  }

  let payload;
  try {
    payload = JSON.parse(await file.text());
  } catch {
    throw new Error("The selected file is not valid JSON. Choose a schedule export file from this tool.");
  }

  const schedule = extractScheduleFromImportPayload(payload);
  const importedSession = prepareImportedSchedule(schedule);

  autoSaveActiveSession("Created from local draft before schedule import.");
  state.sessions.unshift(importedSession);
  state.activeSessionId = importedSession.id;
  state.pendingDeletes = [];
  state.selectedRowIds.clear();
  restoreActiveSessionLocally();
  saveStoredSessions();
  renderQueue();

  const reviewCount = state.queue.filter((item) => validateItem(item).length).length;
  const reviewText = reviewCount ? ` ${reviewCount} row${reviewCount === 1 ? "" : "s"} need review before applying changes.` : "";
  const refreshText = sessionRefsToRefresh(importedSession).length ? " Authenticate and use Refresh when you need to verify the latest Everbridge details." : "";
  setImportStatus(`Imported schedule "${importedSession.name}" from ${file.name}.${reviewText}${refreshText}`, reviewCount ? "warn" : "success");
  setToast("Schedule imported.", reviewCount ? "warn" : "success");
}

els.addRow.addEventListener("click", () => {
  const item = createItem();
  state.queue.push(item);
  state.expandedId = item.id;
  autoSaveActiveSession("Created from manual row entry.");
  renderQueue();
  setImportStatus("New row added. Fill required fields before sending.", "idle");
});

els.loadCsv.addEventListener("click", () => {
  els.csvFile.click();
});

els.scheduleMoreToggle.addEventListener("click", () => {
  setScheduleMoreMenu(els.scheduleMoreMenu.hidden);
});

els.exportSession.addEventListener("click", () => {
  setScheduleMoreMenu(false);
  exportCurrentSchedule();
});

els.importSession.addEventListener("click", () => {
  setScheduleMoreMenu(false);
  els.scheduleImportFile.click();
});

els.scheduleImportFile.addEventListener("change", async () => {
  const file = els.scheduleImportFile.files?.[0];
  if (!file) return;

  try {
    await importScheduleFile(file);
  } catch (error) {
    setImportStatus(error.message, "error");
    setToast("Schedule import failed.", "error");
  } finally {
    els.scheduleImportFile.value = "";
  }
});

els.csvFile.addEventListener("change", async () => {
  const file = els.csvFile.files?.[0];
  if (!file) return;

  try {
    await loadCsvFile(file);
    setToast("CSV loaded.", "success");
  } catch (error) {
    setImportStatus(`CSV load failed: ${error.message}`, "error");
    setToast(error.message, "error");
  } finally {
    els.csvFile.value = "";
  }
});

els.sessionSelectToggle.addEventListener("click", () => {
  const combo = els.sessionSelect.closest(".field-combo");
  renderScheduleSelectOptions();
  closeFieldCombos(combo);
  setFieldComboMenu(combo, els.sessionSelectOptions?.hidden ?? true);
  els.sessionSelect.focus();
});

els.sessionSelect.addEventListener("click", () => {
  if (els.sessionSelect.disabled) return;

  const combo = els.sessionSelect.closest(".field-combo");
  renderScheduleSelectOptions();
  closeFieldCombos(combo);
  setFieldComboMenu(combo, els.sessionSelectOptions?.hidden ?? true);
});

els.sessionSelectOptions.addEventListener("click", async (event) => {
  const option = event.target.closest("[data-schedule-select-option]");
  if (!option) return;

  await selectScheduleOption(option);
});

els.sessionSelectOptions.addEventListener("pointerdown", (event) => {
  if (event.target.closest("[data-schedule-select-option]")) {
    event.preventDefault();
  }
});

els.sessionSelect.addEventListener("keydown", async (event) => {
  const combo = els.sessionSelect.closest(".field-combo");
  const menu = combo?.querySelector(".combo-menu");
  if (event.key === "Escape") {
    setFieldComboMenu(combo, false);
    return;
  }

  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    const wasOpen = Boolean(menu && !menu.hidden);
    if (wasOpen) {
      moveActiveComboOption(combo, event.key === "ArrowDown" ? 1 : -1);
    } else if (event.key === "ArrowUp") {
      renderScheduleSelectOptions();
      closeFieldCombos(combo);
      setFieldComboMenu(combo, true);
      activateLastComboOption(combo);
    } else {
      renderScheduleSelectOptions();
      closeFieldCombos(combo);
      setFieldComboMenu(combo, true);
    }
    return;
  }

  if (event.key === "Enter" && menu && !menu.hidden) {
    const option = activeComboOption(combo) ?? comboOptionButtons(combo)[0] ?? null;
    if (!option) return;

    event.preventDefault();
    await selectScheduleOption(option);
  }
});

els.refreshSession.addEventListener("click", async () => {
  const session = currentSession();
  if (!session) return;

  if (!sessionRefsToRefresh(session).length) {
    setImportStatus(`Schedule "${session.name}" has no saved Everbridge locations to refresh.`, "idle");
    return;
  }

  await loadSelectedSessionFromEverbridge();
});

els.newSession.addEventListener("click", () => {
  if ((state.queue.length || state.pendingDeletes.length) && !window.confirm("Start a new empty schedule? Current schedule changes are saved locally before switching.")) {
    return;
  }

  autoSaveActiveSession("Created from local draft before schedule switch.");
  createSession();
  state.queue = [];
  state.pendingDeletes = [];
  state.selectedRowIds.clear();
  state.expandedId = null;
  state.pendingAuthRefreshSessionId = "";
  saveActiveSessionFromQueue();
  renderQueue();
  setImportStatus("New schedule created. Add rows or load a CSV, then apply changes.", "idle");
});

els.deleteSession.addEventListener("click", () => {
  setScheduleMoreMenu(false);
  const session = currentSession();
  if (!session) return;

  const confirmed = window.confirm("Delete the currently selected local schedule? This does not delete Expected Locations from Everbridge.");
  if (!confirmed) return;

  state.sessions = state.sessions.filter((storedSession) => storedSession.id !== session.id);
  state.activeSessionId = "";
  state.queue = [];
  state.pendingDeletes = [];
  state.selectedRowIds.clear();
  state.expandedId = null;
  state.pendingAuthRefreshSessionId = "";
  saveStoredSessions();
  renderSessionControls();
  renderQueue();
  setImportStatus("Current local schedule deleted. Expected Locations in Everbridge were not changed.", "warn");
  setToast("Current schedule deleted.", "warn");
});

els.selectAllRows.addEventListener("change", () => {
  if (els.selectAllRows.checked) {
    state.queue.forEach((item) => state.selectedRowIds.add(item.id));
  } else {
    state.selectedRowIds.clear();
  }
  renderQueue();
});

[els.sessionName, els.sessionDescription].forEach((input) => {
  input.addEventListener("input", () => {
    const session = currentSession();
    if (!session) return;

    session.name = clean(els.sessionName.value) || session.name;
    session.description = clean(els.sessionDescription.value);
    saveStoredSessions();
  });

  input.addEventListener("change", () => {
    saveActiveSessionFromQueue();
  });
});

function setSessionTimeZoneValue(value, applyChange = false) {
  const session = currentSession();
  if (!session) return;

  const rawValue = clean(value);
  const canonicalTimeZone = canonicalTimeZoneValue(rawValue);
  els.sessionTimeZone.value = rawValue;
  session.timeZone = canonicalTimeZone || rawValue;
  els.sessionTimeZone.classList.toggle("invalid", !canonicalTimeZone);
  renderScheduleTimeZoneOptions(session.timeZone, rawValue);

  if (applyChange) {
    saveActiveSessionFromQueue();
    renderQueue();
  } else {
    saveStoredSessions();
  }
}

els.sessionTimeZone.addEventListener("input", () => {
  setSessionTimeZoneValue(els.sessionTimeZone.value);
  const combo = els.sessionTimeZone.closest(".field-combo");
  closeFieldCombos(combo);
  setFieldComboMenu(combo, true);
});

els.sessionTimeZone.addEventListener("change", () => {
  const session = currentSession();
  if (!session) return;

  const timeZone = canonicalTimeZoneValue(els.sessionTimeZone.value);
  if (!timeZone) {
    els.sessionTimeZone.classList.add("invalid");
    setImportStatus("Use a valid IANA time zone such as America/New_York. This schedule default is used for new rows and CSV rows without a time zone.", "warn");
    setToast("Schedule time zone needs review.", "warn");
    return;
  }

  els.sessionTimeZone.value = timeZone;
  session.timeZone = timeZone;
  renderScheduleTimeZoneOptions(timeZone);
  saveActiveSessionFromQueue();
  renderQueue();
});

els.sessionTimeZoneToggle.addEventListener("click", () => {
  const combo = els.sessionTimeZone.closest(".field-combo");
  renderScheduleTimeZoneOptions(els.sessionTimeZone.value);
  closeFieldCombos(combo);
  setFieldComboMenu(combo, els.timeZoneOptions?.hidden ?? true);
  els.sessionTimeZone.focus();
});

els.timeZoneOptions.addEventListener("click", (event) => {
  const option = event.target.closest("[data-schedule-time-zone-option]");
  if (!option) return;

  selectScheduleTimeZoneOption(option);
});

els.timeZoneOptions.addEventListener("pointerdown", (event) => {
  if (event.target.closest("[data-schedule-time-zone-option]")) {
    event.preventDefault();
  }
});

els.sessionTimeZone.addEventListener("keydown", (event) => {
  const combo = els.sessionTimeZone.closest(".field-combo");
  const menu = combo?.querySelector(".combo-menu");
  if (event.key === "Escape") {
    setFieldComboMenu(combo, false);
    return;
  }

  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    const wasOpen = Boolean(menu && !menu.hidden);
    if (wasOpen) {
      moveActiveComboOption(combo, event.key === "ArrowDown" ? 1 : -1);
    } else if (event.key === "ArrowUp") {
      renderScheduleTimeZoneOptions(els.sessionTimeZone.value, els.sessionTimeZone.value);
      closeFieldCombos(combo);
      setFieldComboMenu(combo, true);
      activateLastComboOption(combo);
    } else {
      renderScheduleTimeZoneOptions(els.sessionTimeZone.value, els.sessionTimeZone.value);
      closeFieldCombos(combo);
      setFieldComboMenu(combo, true);
    }
    return;
  }

  if (event.key === "Enter" && menu && !menu.hidden) {
    const option = activeComboOption(combo) ?? comboOptionButtons(combo)[0] ?? null;
    if (!option) return;

    event.preventDefault();
    selectScheduleTimeZoneOption(option);
  }
});

els.queueBody.addEventListener("pointerdown", (event) => {
  if (event.target.closest("[data-field-combo-option]")) {
    event.preventDefault();
  }
});

els.queueBody.addEventListener("click", async (event) => {
  if (state.isSending) return;

  const lockedContactField = event.target.closest("[data-contact-locked]");
  if (lockedContactField) {
    event.preventDefault();
    showLockedContactMessage(lockedContactField.dataset.id);
    return;
  }

  const fieldOption = event.target.closest("[data-field-combo-option]");
  if (fieldOption) {
    selectFieldComboOption(fieldOption);
    return;
  }

  const fieldComboToggle = event.target.closest("[data-field-combo-toggle]");
  if (fieldComboToggle) {
    const combo = fieldComboToggle.closest(".field-combo");
    const input = combo?.querySelector("[data-field]");
    refreshSearchableFieldCombo(input);
    closeFieldCombos(combo);
    setFieldComboMenu(combo, combo.querySelector(".combo-menu")?.hidden ?? true);
    input?.focus();
    return;
  }

  const fieldComboInput = event.target.closest(".field-combo [data-field]");
  if (["contactIdType", "locationEntryMode"].includes(fieldComboInput?.dataset.field)) {
    const combo = fieldComboInput.closest(".field-combo");
    closeFieldCombos(combo);
    setFieldComboMenu(combo, combo.querySelector(".combo-menu")?.hidden ?? true);
    return;
  }

  const toggle = event.target.closest("[data-toggle]");
  if (toggle) {
    state.expandedId = state.expandedId === toggle.dataset.toggle ? null : toggle.dataset.toggle;
    state.lockedContactNoticeId = null;
    renderQueue();
    return;
  }

  const remove = event.target.closest("[data-remove]");
  if (!remove) return;

  const item = state.queue.find((row) => row.id === remove.dataset.remove);
  if (!item) return;

  if (clean(item.expectedLocationId)) {
    const confirmed = window.confirm("Delete this Expected Location from Everbridge now? The row will stay visible if the delete fails.");
    if (!confirmed) return;

    await deleteExpectedLocationNow(item);
    return;
  }

  state.queue = state.queue.filter((item) => item.id !== remove.dataset.remove);
  state.selectedRowIds.delete(remove.dataset.remove);
  if (state.expandedId === remove.dataset.remove) state.expandedId = null;
  autoSaveActiveSession();
  renderQueue();
});

els.queueBody.addEventListener("keydown", (event) => {
  const input = event.target.closest(".field-combo [data-field]");
  if (!input) return;

  const combo = input.closest(".field-combo");
  const menu = combo?.querySelector(".combo-menu");
  if (event.key === "Escape") {
    setFieldComboMenu(combo, false);
    return;
  }

  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    const wasOpen = Boolean(menu && !menu.hidden);
    if (wasOpen) {
      moveActiveComboOption(combo, event.key === "ArrowDown" ? 1 : -1);
    } else if (event.key === "ArrowUp") {
      refreshSearchableFieldCombo(input, input.value);
      closeFieldCombos(combo);
      setFieldComboMenu(combo, true);
      activateLastComboOption(combo);
    } else {
      refreshSearchableFieldCombo(input, input.value);
      closeFieldCombos(combo);
      setFieldComboMenu(combo, true);
    }
    return;
  }

  if (event.key === "Enter" && menu && !menu.hidden) {
    const option = activeComboOption(combo) ?? comboOptionButtons(combo)[0] ?? null;
    if (!option) return;

    event.preventDefault();
    selectFieldComboOption(option);
  }
});

els.queueBody.addEventListener("input", (event) => {
  const input = event.target.closest("[data-field]");
  if (!input) return;

  const item = state.queue.find((row) => row.id === input.dataset.id);
  if (!item) return;

  if (isContactLocked(item, input.dataset.field)) {
    showLockedContactMessage(item.id);
    return;
  }

  applyInputValueToItem(input, item);
  if (input.dataset.field === "timeZone") {
    showFilteredTimeZoneFieldCombo(input);
  } else if (input.dataset.field === "country") {
    showFilteredCountryFieldCombo(input);
  } else if (input.dataset.field === "region" && countryCodeValue(item.country) === "US") {
    showFilteredStateFieldCombo(input);
  }
  autoSaveActiveSession();
  refreshQueueActions();
  refreshEndpointPreview();
});

els.queueBody.addEventListener("change", (event) => {
  const rowSelect = event.target.closest("[data-row-select]");
  if (rowSelect) {
    if (rowSelect.checked) {
      state.selectedRowIds.add(rowSelect.dataset.rowSelect);
    } else {
      state.selectedRowIds.delete(rowSelect.dataset.rowSelect);
    }
    renderQueue();
    return;
  }

  const input = event.target.closest("[data-field]");
  if (!input) return;

  const item = state.queue.find((row) => row.id === input.dataset.id);
  if (!item) return;

  if (isContactLocked(item, input.dataset.field)) {
    showLockedContactMessage(item.id);
    return;
  }

  applyInputValueToItem(input, item);
  if (input.dataset.field === "timeZone") {
    const canonicalTimeZone = canonicalTimeZoneValue(input.value);
    if (canonicalTimeZone) {
      item.timeZone = canonicalTimeZone;
      input.value = canonicalTimeZone;
    }
    refreshTimeZoneFieldCombo(input);
  } else if (input.dataset.field === "country") {
    const country = countryValueFromInput(input.value);
    if (country) {
      item.country = country;
      input.value = country;
    }
    refreshCountryFieldCombo(input);
  } else if (input.dataset.field === "region" && countryCodeValue(item.country) === "US") {
    const region = stateValueFromInput(input.value);
    if (region) {
      item.region = region;
      input.value = region;
    }
    refreshStateFieldCombo(input);
  }
  autoSaveActiveSession();
  if (fieldChangeNeedsRender(input)) {
    renderQueue();
  } else {
    refreshQueueActions();
    refreshEndpointPreview();
  }
});

els.deleteSelected.addEventListener("click", deleteSelectedExpectedLocationsNow);

els.sendImport.addEventListener("click", sendImport);

els.apiBaseUrlToggle.addEventListener("click", () => {
  setApiBaseUrlMenu(els.apiBaseUrlMenu.hidden);
  els.apiBaseUrl.focus();
});

els.apiBaseUrlMenu.addEventListener("click", (event) => {
  const option = event.target.closest("[data-api-base-url]");
  if (!option) return;

  selectApiBaseUrl(option.dataset.apiBaseUrl);
  setApiBaseUrlMenu(false);
});

els.apiBaseUrl.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setApiBaseUrlMenu(false);
  }

  if (event.key === "ArrowDown" && event.altKey) {
    event.preventDefault();
    setApiBaseUrlMenu(true);
  }
});

document.addEventListener("click", (event) => {
  if (!els.apiBaseUrlCombo.contains(event.target)) {
    setApiBaseUrlMenu(false);
  }
  if (!event.target.closest(".action-menu")) {
    setScheduleMoreMenu(false);
  }
  if (!event.target.closest(".field-combo")) {
    closeFieldCombos();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setScheduleMoreMenu(false);
  }
});

[els.apiBaseUrl, els.organizationId, els.username].forEach((input) => {
  input.addEventListener("input", () => {
    saveStoredConnection();
    refreshEndpointPreview();
    renderSessionControls();
    updatePendingScheduleRefreshPrompt();
  });
  input.addEventListener("change", () => {
    saveStoredConnection();
    refreshEndpointPreview();
    renderSessionControls();
    updatePendingScheduleRefreshPrompt();
  });
});

els.password.addEventListener("input", () => {
  refreshEndpointPreview();
  renderSessionControls();
  updatePendingScheduleRefreshPrompt();
});
els.password.addEventListener("change", () => {
  refreshEndpointPreview();
  renderSessionControls();
  updatePendingScheduleRefreshPrompt();
});

document.querySelectorAll("input, select, textarea").forEach((input) => {
  input.addEventListener("input", () => input.classList.remove("invalid"));
});

window.addEventListener("beforeunload", (event) => {
  if (!hasPageContentToLose()) return;

  event.preventDefault();
  event.returnValue = "";
});

loadStoredConnection();
loadStoredSessions();
restoreActiveSessionLocally();
setupTimeZoneOptions();
setupTemplateDownload();
refreshEndpointPreview();
renderSessionControls();
renderQueue();
showRestoredScheduleStatus();
