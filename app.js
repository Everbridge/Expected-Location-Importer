const CSV_COLUMNS = [
  "contactIdType",
  "contactIdentifier",
  "arriveDate",
  "expireDate",
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

const FIELD_DEFS = [
  {
    key: "contactIdType",
    label: "Contact ID Type",
    type: "select",
    options: [
      ["id", "Contact ID"],
      ["externalId", "External ID"],
    ],
  },
  { key: "contactIdentifier", label: "Contact Identifier", required: true },
  { key: "arriveDate", label: "Arrival", type: "datetime-local", required: true },
  { key: "expireDate", label: "Expiration", type: "datetime-local", required: true },
  { key: "assetExternalId", label: "Asset External ID" },
  { key: "iata", label: "IATA", maxLength: 8 },
  { key: "locationName", label: "Location Name" },
  { key: "country", label: "Country", type: "select", options: "countries" },
  { key: "streetAddress", label: "Street Address", wide: true },
  { key: "city", label: "City" },
  { key: "region", label: "State/Province", options: "usStates" },
  { key: "suite", label: "Suite" },
  { key: "postalCode", label: "Postal Code" },
  { key: "lat", label: "Latitude", inputmode: "decimal" },
  { key: "lon", label: "Longitude", inputmode: "decimal" },
];

const HEADER_ALIASES = {
  arrivaltime: "arriveDate",
  arrival: "arriveDate",
  arrivedate: "arriveDate",
  assetexternalid: "assetExternalId",
  city: "city",
  contactexternalid: "contactExternalId",
  contactid: "contactId",
  contactidentifier: "contactIdentifier",
  contactidtype: "contactIdType",
  country: "country",
  end: "expireDate",
  enddate: "expireDate",
  expiration: "expireDate",
  expirationdate: "expireDate",
  expiredate: "expireDate",
  iata: "iata",
  lat: "lat",
  latitude: "lat",
  locationname: "locationName",
  lon: "lon",
  longitude: "lon",
  postalcode: "postalCode",
  region: "region",
  start: "arriveDate",
  startdate: "arriveDate",
  state: "region",
  stateorregion: "region",
  stateorprovince: "region",
  stateprovince: "region",
  street: "streetAddress",
  streetaddress: "streetAddress",
  suite: "suite",
};

const CONNECTION_STORAGE_KEY = "expected-location-importer.connection";

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
  expandedId: null,
  isSending: false,
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
  authStatus: document.querySelector("#authStatus"),
  endpointPreview: document.querySelector("#endpointPreview"),
  downloadTemplate: document.querySelector("#downloadTemplate"),
  loadCsv: document.querySelector("#loadCsv"),
  csvFile: document.querySelector("#csvFile"),
  addRow: document.querySelector("#addRow"),
  queueCount: document.querySelector("#queueCount"),
  queueBody: document.querySelector("#queueBody"),
  clearQueue: document.querySelector("#clearQueue"),
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

function toLocalInput(date) {
  const localDate = new Date(date);
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
  return localDate.toISOString().slice(0, 16);
}

function defaultWindow() {
  const start = new Date();
  start.setSeconds(0, 0);

  const end = new Date(start);
  end.setHours(end.getHours() + 8);

  return {
    arriveDate: toLocalInput(start),
    expireDate: toLocalInput(end),
  };
}

function createItem(overrides = {}, useDefaults = true) {
  const windowDefaults = useDefaults ? defaultWindow() : { arriveDate: "", expireDate: "" };
  return {
    id: newId(),
    contactIdType: "id",
    contactIdentifier: "",
    locationName: "",
    country: useDefaults ? "US" : "",
    arriveDate: windowDefaults.arriveDate,
    expireDate: windowDefaults.expireDate,
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
}

function normalizeContactIdType(value) {
  const normalized = clean(value).toLowerCase().replace(/[^a-z0-9]/g, "");
  if (["external", "externalid", "contactexternalid"].includes(normalized)) return "externalId";
  return "id";
}

function toIsoFromLocal(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function toLocalInputFromCsv(value) {
  const trimmed = clean(value);
  if (!trimmed) return "";

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const normalized = trimmed.includes(" ") ? trimmed.replace(" ", "T") : trimmed;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? trimmed : toLocalInput(date);
}

function formatDateForTable(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
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

function setApiBaseUrlMenu(open) {
  els.apiBaseUrlMenu.hidden = !open;
  els.apiBaseUrlToggle.setAttribute("aria-expanded", String(open));
}

function selectApiBaseUrl(value) {
  els.apiBaseUrl.value = value;
  els.apiBaseUrl.classList.remove("invalid");
  saveStoredConnection();
  refreshEndpointPreview();
  refreshAuthStatus();
}

function setFieldComboMenu(combo, open) {
  const menu = combo.querySelector(".combo-menu");
  const toggle = combo.querySelector("[data-field-combo-toggle]");
  if (!menu || !toggle) return;

  menu.hidden = !open;
  toggle.setAttribute("aria-expanded", String(open));
}

function closeFieldCombos(exceptCombo = null) {
  els.queueBody.querySelectorAll(".field-combo").forEach((combo) => {
    if (combo !== exceptCombo) setFieldComboMenu(combo, false);
  });
}

function selectFieldComboOption(option) {
  const item = state.queue.find((row) => row.id === option.dataset.id);
  if (!item) return;

  const input = option.closest(".field-combo")?.querySelector("[data-field]");
  if (!input) return;

  input.value = option.dataset.value ?? "";
  item[input.dataset.field] = normalizedInputValue(input, item);
  markRowEdited(item);
  renderQueue();
}

function hasPageContentToLose() {
  return state.queue.length > 0 || Boolean(els.password.value);
}

function requestContactIdType() {
  return state.queue[0]?.contactIdType ?? "id";
}

function normalizedRestBaseUrl() {
  const base = clean(els.apiBaseUrl.value).replace(/\/+$/, "");
  return base.endsWith("/rest") ? base : `${base}/rest`;
}

function endpointUrl() {
  const base = normalizedRestBaseUrl();
  const orgId = encodeURIComponent(clean(els.organizationId.value));
  const params = new URLSearchParams({
    contactIdType: requestContactIdType(),
    returnIds: "true",
  });

  return `${base}/expectedLocations/${orgId}?${params.toString()}`;
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

function refreshAuthStatus() {
  const ready = clean(els.apiBaseUrl.value) && clean(els.organizationId.value) && clean(els.username.value) && els.password.value;
  els.authStatus.classList.toggle("ready", Boolean(ready));
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
  const assetExternalId = clean(item.assetExternalId);
  if (assetExternalId) {
    return {
      title: assetExternalId,
      subtitle: "Asset External ID",
    };
  }

  const iata = clean(item.iata).toUpperCase();
  if (iata) {
    return {
      title: iata,
      subtitle: "IATA",
    };
  }

  return {
    title: clean(item.locationName) || "Missing location",
    subtitle: clean(item.country) || "Missing country",
  };
}

function addressLookupSummary(item) {
  if (hasAssetLocation(item)) {
    return {
      title: "Asset Lookup",
      subtitle: clean(item.assetExternalId),
    };
  }

  if (hasIataLocation(item)) {
    return {
      title: "IATA Lookup",
      subtitle: clean(item.iata).toUpperCase(),
    };
  }

  const streetAddress = clean(item.streetAddress);
  const addressParts = [item.city, item.region, item.postalCode, item.country].map(clean).filter(Boolean);

  if (streetAddress || addressParts.length) {
    return {
      title: streetAddress || "Missing street address",
      subtitle: addressParts.join(", "),
    };
  }

  return {
    title: "Missing Address or Lookup",
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

function validateItem(item) {
  const errors = [];

  if (!["id", "externalId"].includes(item.contactIdType)) {
    errors.push("Contact ID Type must be Contact ID or External ID.");
  }

  if (!clean(item.contactIdentifier)) errors.push("Contact Identifier is required.");
  if (!clean(item.arriveDate)) errors.push("Arrival is required.");
  if (!clean(item.expireDate)) errors.push("Expiration is required.");
  if (!hasAssetLocation(item) && !hasIataLocation(item) && !hasCompleteAddressLocation(item)) {
    errors.push("Location requires Asset External ID, IATA, or Location Name with Street Address, City, State/Province, and Country.");
  }

  const arriveIso = toIsoFromLocal(item.arriveDate);
  const expireIso = toIsoFromLocal(item.expireDate);

  if (clean(item.arriveDate) && !arriveIso) errors.push("Arrival is invalid.");
  if (clean(item.expireDate) && !expireIso) errors.push("Expiration is invalid.");

  if (arriveIso && expireIso && new Date(expireIso).getTime() <= new Date(arriveIso).getTime()) {
    errors.push("Expiration must be after arrival.");
  }

  const lat = parseCoordinate(item.lat, "Latitude", errors);
  const lon = parseCoordinate(item.lon, "Longitude", errors);

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
  const country = upperClean(item.country);
  const region = country === "US" ? upperClean(item.region) : clean(item.region);
  const address = {
    arriveDate: toIsoFromLocal(item.arriveDate),
    expireDate: toIsoFromLocal(item.expireDate),
  };

  optionalText(address, "assetExternalId", item.assetExternalId);
  optionalText(address, "iata", item.iata.toUpperCase());
  optionalText(address, "locationName", item.locationName);
  optionalText(address, "streetAddress", item.streetAddress);
  optionalText(address, "suite", item.suite);
  optionalText(address, "city", item.city);
  optionalText(address, "state", region);
  optionalText(address, "country", country);
  optionalText(address, "postalCode", item.postalCode);

  if (clean(item.lat) && clean(item.lon)) {
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

function payload() {
  return state.queue.map(buildWrapper);
}

function sameContactIdType() {
  const types = new Set(state.queue.map((item) => item.contactIdType));
  return types.size <= 1;
}

function setRowUploadStatus(item, status, message) {
  item.uploadStatus = {
    state: status,
    message: clean(message),
  };
}

function setAllUploadStatuses(status, message) {
  state.queue.forEach((item) => setRowUploadStatus(item, status, message));
}

function markRowEdited(item) {
  if (item.uploadStatus?.state === "sending") return;
  setRowUploadStatus(item, "pending", "Edited, not sent");
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

function normalizeResponseIndex(value, isLineNumber = false) {
  const match = String(value ?? "").match(/\d+/);
  if (!match) return null;

  const number = Number(match[0]);
  if (!Number.isInteger(number)) return null;

  if (isLineNumber && number >= 2 && number <= state.queue.length + 1) {
    return number - 2;
  }

  if (number >= 0 && number < state.queue.length) {
    return number;
  }

  if (number >= 1 && number <= state.queue.length) {
    return number - 1;
  }

  return null;
}

function rowIndexFromText(text) {
  const value = clean(text);
  if (!value) return null;

  const lineMatch = value.match(/\bline\D{0,12}(\d+)\b/i);
  if (lineMatch) {
    const index = normalizeResponseIndex(lineMatch[1], true);
    if (index !== null) return index;
  }

  const rowMatch = value.match(/\b(?:row|record|item|index)\D{0,12}(\d+)\b/i);
  if (rowMatch) {
    const index = normalizeResponseIndex(rowMatch[1]);
    if (index !== null) return index;
  }

  const matches = state.queue
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

function rowIndexFromEntry(entry, fallbackIndex = null) {
  if (entry && typeof entry === "object") {
    if ("key" in entry && "value" in entry) {
      const keyIndex = normalizeResponseIndex(entry.key);
      if (keyIndex !== null) return keyIndex;
    }

    const source = "value" in entry && Object.keys(entry).length === 2 && "key" in entry ? entry.value : entry;
    if (!source || typeof source !== "object") {
      const textIndex = rowIndexFromText(entryText(entry));
      return textIndex !== null ? textIndex : fallbackIndex;
    }

    const directFields = ["rowIndex", "index", "recordIndex", "itemIndex", "position", "requestIndex", "key"];
    const oneBasedFields = ["row", "rowNumber", "record", "recordNumber", "item", "itemNumber"];
    const lineFields = ["line", "lineNumber"];

    for (const field of directFields) {
      if (source[field] !== undefined) {
        const index = normalizeResponseIndex(source[field]);
        if (index !== null) return index;
      }
    }

    for (const field of oneBasedFields) {
      if (source[field] !== undefined) {
        const index = normalizeResponseIndex(source[field]);
        if (index !== null) return index;
      }
    }

    for (const field of lineFields) {
      if (source[field] !== undefined) {
        const index = normalizeResponseIndex(source[field], true);
        if (index !== null) return index;
      }
    }

    const contactFields = ["contactIdentifier", "contactExternalId", "contactId"];
    for (const field of contactFields) {
      const contact = clean(source[field]);
      if (!contact) continue;
      const matchIndex = state.queue.findIndex((item) => clean(item.contactIdentifier) === contact);
      if (matchIndex >= 0) return matchIndex;
    }
  }

  const textIndex = rowIndexFromText(entryText(entry));
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
    const createdId = source && typeof source === "object" ? source.id ?? source.expectedLocationId ?? source.createdId : "";

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

function applyResponseToRows(result) {
  const entries = responseEntries(result.body);
  const message = clean(responseDetails(result.body)) || result.toast;

  if (result.ok) {
    if (entries.length === state.queue.length) {
      entries.forEach((entry, index) => {
        const status = statusFromEntry(entry, result, "success");
        setRowUploadStatus(state.queue[index], status.state, status.message);
      });
      return;
    }

    setAllUploadStatuses("success", message || "Sent");
    return;
  }

  const fallbackStatus = result.type === "warn" ? "warn" : "error";
  const positional = entries.length === state.queue.length;
  const mappedRows = new Set();

  if (result.type === "warn" && entries.length) {
    setAllUploadStatuses("success", "Sent");
  } else {
    setAllUploadStatuses(fallbackStatus, message);
  }

  entries.forEach((entry, index) => {
    const rowIndex = rowIndexFromEntry(entry, positional ? index : null);
    if (rowIndex === null || !state.queue[rowIndex]) return;

    const status = statusFromEntry(entry, result, fallbackStatus);
    setRowUploadStatus(state.queue[rowIndex], status.state, status.message || message);
    mappedRows.add(rowIndex);
  });

  if (!mappedRows.size && result.type === "warn") {
    setAllUploadStatuses("warn", message);
  }
}

function renderQueue() {
  els.queueCount.textContent = `${state.queue.length} row${state.queue.length === 1 ? "" : "s"}`;
  els.sendImport.disabled = state.queue.length === 0 || state.isSending;
  els.clearQueue.disabled = state.queue.length === 0 || state.isSending;
  refreshEndpointPreview();

  if (!state.queue.length) {
    els.queueBody.innerHTML = '<tr class="empty-row"><td colspan="7">No rows loaded</td></tr>';
    return;
  }

  els.queueBody.innerHTML = "";
  state.queue.forEach((item, index) => {
    const errors = validateItem(item);
    const location = locationSummary(item);
    const addressLookup = addressLookupSummary(item);
    const expanded = state.expandedId === item.id;
    const disabled = state.isSending ? " disabled" : "";
    const row = document.createElement("tr");
    row.className = `summary-row ${expanded ? "expanded" : ""} ${errors.length ? "invalid" : ""}`.trim();
    row.innerHTML = `
      <td><button class="icon-button expand-button" type="button" data-toggle="${item.id}" aria-label="${expanded ? "Collapse" : "Expand"} row ${index + 1}" title="${expanded ? "Collapse" : "Expand"}"${disabled}>${expanded ? ICONS.chevronDown : ICONS.chevronRight}</button></td>
      <td>
        <span class="row-title">${escapeHtml(clean(item.contactIdentifier) || "Missing contact")}</span>
        <span class="row-subtitle">${contactIdTypeLabel(item.contactIdType)}${errors.length ? ` · ${errors.length} issue${errors.length === 1 ? "" : "s"}` : ""}</span>
      </td>
      <td>
        <span class="row-title">${escapeHtml(formatDateForTable(item.arriveDate) || "Missing arrival")}</span>
        <span class="row-title">${escapeHtml(formatDateForTable(item.expireDate) || "Missing expiration")}</span>
      </td>
      <td>
        <span class="row-title">${escapeHtml(location.title)}</span>
        <span class="row-subtitle">${escapeHtml(location.subtitle)}</span>
      </td>
      <td>
        <span class="row-title">${escapeHtml(addressLookup.title)}</span>
        <span class="row-subtitle">${escapeHtml(addressLookup.subtitle)}</span>
      </td>
      <td>
        ${renderUploadStatus(item)}
      </td>
      <td class="actions-cell">
        <div class="row-actions">
          <button class="icon-button row-action-button" type="button" data-toggle="${item.id}" aria-label="${expanded ? "Done Editing Row" : "Edit Row"}" title="${expanded ? "Done" : "Edit"}"${disabled}>${expanded ? ICONS.check : ICONS.edit}</button>
          <button class="icon-button row-action-button danger" type="button" data-remove="${item.id}" aria-label="Remove Row" title="Remove"${disabled}>${ICONS.trash}</button>
        </div>
      </td>
    `;
    els.queueBody.append(row);

    if (expanded) {
      const detail = document.createElement("tr");
      detail.className = "detail-row";
      detail.innerHTML = `<td colspan="7">${renderEditor(item, errors)}</td>`;
      els.queueBody.append(detail);
    }
  });
}

function renderUploadStatus(item) {
  const status = item.uploadStatus ?? { state: "pending", message: "Not sent" };
  const labels = {
    pending: "Not sent",
    sending: "Sending",
    success: "Sent",
    warn: "Review",
    error: "Failed",
  };
  return `
    <span class="status-badge ${escapeAttr(status.state)}">${labels[status.state] ?? "Status"}</span>
    <span class="row-subtitle">${escapeHtml(status.message || "")}</span>
  `;
}

function renderEditor(item, errors) {
  const errorHtml = errors.map((error) => `<div>${escapeHtml(error)}</div>`).join("");
  const fields = FIELD_DEFS.map((field) => renderField(item, field)).join("");
  return `
    <div class="row-editor">
      <div class="editor-errors">${errorHtml}</div>
      <div class="field-grid">${fields}</div>
      <div class="editor-actions">
        <button class="primary" type="button" data-toggle="${item.id}"${state.isSending ? " disabled" : ""}>Done</button>
      </div>
    </div>
  `;
}

function optionsInclude(options, value) {
  return options.some(([optionValue]) => optionValue === value);
}

function optionsWithCurrent(options, value) {
  if (!value || optionsInclude(options, value)) return options;

  const [emptyOption, ...rest] = options;
  return [emptyOption, [value, `${value} - Current Value`], ...rest];
}

function selectOptionsForField(item, field, value) {
  if (field.options === "countries") {
    return optionsWithCurrent(COUNTRY_OPTIONS, upperClean(value));
  }

  if (field.options === "usStates" && upperClean(item.country) === "US") {
    return optionsWithCurrent(US_STATE_OPTIONS, upperClean(value));
  }

  return Array.isArray(field.options) ? field.options : null;
}

function fieldValue(item, field) {
  const value = item[field.key] ?? "";
  if (field.key === "country") return upperClean(value);
  if (field.key === "region" && upperClean(item.country) === "US") return upperClean(value);
  return value;
}

function isEditableComboField(field) {
  return field.options === "countries" || field.options === "usStates";
}

function renderEditableComboField(item, field, value, options, common, required, disabled, wide) {
  const menuId = `combo-${item.id}-${field.key}`;
  const optionButtons = options
    .map(([optionValue, label]) => `<button type="button" role="option" data-field-combo-option data-id="${escapeAttr(item.id)}" data-field="${escapeAttr(field.key)}" data-value="${escapeAttr(optionValue)}" aria-selected="${value === optionValue ? "true" : "false"}">${escapeHtml(label)}</button>`)
    .join("");

  return `
    <div class="field-block ${wide}">
      <label for="${escapeAttr(`${item.id}-${field.key}`)}">${escapeHtml(field.label)}</label>
      <div class="editable-combo field-combo">
        <input id="${escapeAttr(`${item.id}-${field.key}`)}" ${common} type="text" value="${escapeAttr(value)}" autocomplete="off"${required}${disabled}>
        <button class="combo-toggle" type="button" data-field-combo-toggle aria-label="Show ${escapeAttr(field.label)} Options" aria-expanded="false" aria-controls="${escapeAttr(menuId)}"${disabled}></button>
        <div class="combo-menu" id="${escapeAttr(menuId)}" role="listbox" hidden>
          ${optionButtons}
        </div>
      </div>
    </div>
  `;
}

function renderField(item, field) {
  const value = fieldValue(item, field);
  const common = `data-id="${item.id}" data-field="${field.key}"`;
  const required = field.required ? " required" : "";
  const disabled = state.isSending ? " disabled" : "";
  const wide = field.wide ? " wide" : "";
  const selectOptions = selectOptionsForField(item, field, value);

  if (selectOptions && isEditableComboField(field)) {
    return renderEditableComboField(item, field, value, selectOptions, common, required, disabled, wide);
  }

  if (field.type === "select" || selectOptions) {
    const options = selectOptions
      .map(([optionValue, label]) => `<option value="${optionValue}"${value === optionValue ? " selected" : ""}>${escapeHtml(label)}</option>`)
      .join("");
    return `<label class="${wide}">${escapeHtml(field.label)}<select ${common}${required}${disabled}>${options}</select></label>`;
  }

  const type = field.type ?? "text";
  const placeholder = field.placeholder ? ` placeholder="${escapeAttr(field.placeholder)}"` : "";
  const maxLength = field.maxLength ? ` maxlength="${field.maxLength}"` : "";
  const inputmode = field.inputmode ? ` inputmode="${field.inputmode}"` : "";
  return `<label class="${wide}">${escapeHtml(field.label)}<input ${common} type="${type}" value="${escapeAttr(value)}"${placeholder}${maxLength}${inputmode}${required}${disabled}></label>`;
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
  if (input.dataset.field === "iata" || input.dataset.field === "country") {
    return upperClean(input.value);
  }

  if (input.dataset.field === "region" && upperClean(item.country) === "US") {
    return upperClean(input.value);
  }

  return input.value;
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

  const country = upperClean(raw.country);

  return createItem({
    contactIdType: normalizeContactIdType(contactIdType),
    contactIdentifier,
    locationName: clean(raw.locationName),
    country,
    arriveDate: toLocalInputFromCsv(raw.arriveDate),
    expireDate: toLocalInputFromCsv(raw.expireDate),
    streetAddress: clean(raw.streetAddress),
    suite: clean(raw.suite),
    city: clean(raw.city),
    region: country === "US" ? upperClean(raw.region) : clean(raw.region),
    postalCode: clean(raw.postalCode),
    iata: clean(raw.iata).toUpperCase(),
    assetExternalId: clean(raw.assetExternalId),
    lat: clean(raw.lat),
    lon: clean(raw.lon),
  }, false);
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

  state.queue.push(...items);
  state.expandedId = items.find((item) => validateItem(item).length)?.id ?? null;
  renderQueue();

  const invalidCount = items.filter((item) => validateItem(item).length).length;
  if (invalidCount) {
    setImportStatus(`Loaded ${items.length} rows from CSV. ${invalidCount} row${invalidCount === 1 ? "" : "s"} need review before sending.`, "warn");
  } else {
    setImportStatus(`Loaded ${items.length} rows from CSV. Review the table, then send to Everbridge.`, "success");
  }
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function buildTemplateCsv() {
  const rows = [
    CSV_COLUMNS,
    [
      "externalId",
      "EMP-1001",
      "2026-06-01T09:00",
      "2026-06-01T17:00",
      "",
      "",
      "Normal Day Shift - HQ",
      "25 Corporate Dr",
      "Burlington",
      "MA",
      "US",
      "Floor 2",
      "01803",
      "",
      "",
    ],
    [
      "externalId",
      "EMP-1002",
      "2026-06-01T22:00",
      "2026-06-02T06:00",
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
      "externalId",
      "EMP-1003",
      "2026-06-03T13:00",
      "2026-06-03T15:30",
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

async function sendImport() {
  try {
    validateConnection();

    if (!state.queue.length) {
      setToast("No rows to send.", "warn");
      return;
    }

    const invalidIndex = state.queue.findIndex((item) => validateItem(item).length);
    if (invalidIndex >= 0) {
      const errors = validateItem(state.queue[invalidIndex]);
      setRowUploadStatus(state.queue[invalidIndex], "error", errors[0]);
      state.expandedId = state.queue[invalidIndex].id;
      renderQueue();
      setImportStatus(`Fix row ${invalidIndex + 1}: ${errors[0]}`, "error");
      setToast("Fix row issues before sending.", "error");
      return;
    }

    if (!sameContactIdType()) {
      setAllUploadStatuses("warn", "Split Contact ID and External ID rows into separate sends.");
      renderQueue();
      setImportStatus("Rows must use one contact ID type per Everbridge request. Split Contact ID and External ID rows into separate sends.", "error");
      setToast("Rows use mixed contact ID types.", "error");
      return;
    }

    state.isSending = true;
    els.sendImport.textContent = "Sending";
    setAllUploadStatuses("sending", "Sending...");
    renderQueue();
    setImportStatus(`Sending ${state.queue.length} row${state.queue.length === 1 ? "" : "s"} to Everbridge...`, "sending");

    const response = await fetch(endpointUrl(), {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${basicAuth(clean(els.username.value), els.password.value)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload()),
    });

    const body = await readResponse(response);
    const result = classifyEverbridgeResponse(response, body);
    applyResponseToRows(result);
    setImportStatus(statusText(result), result.type);
    setToast(result.toast, result.type);
  } catch (error) {
    const message = error instanceof TypeError
      ? "Request blocked or network unavailable. Check CORS, VPN, and API Base URL."
      : error.message;
    setAllUploadStatuses("error", message);
    setImportStatus(`Error: ${message}`, "error");
    setToast(message, "error");
  } finally {
    state.isSending = false;
    els.sendImport.textContent = "Send to Everbridge";
    renderQueue();
  }
}

els.addRow.addEventListener("click", () => {
  const item = createItem();
  state.queue.push(item);
  state.expandedId = item.id;
  renderQueue();
  setImportStatus("New row added. Fill required fields before sending.", "idle");
});

els.loadCsv.addEventListener("click", () => {
  els.csvFile.click();
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

els.queueBody.addEventListener("click", (event) => {
  if (state.isSending) return;

  const fieldOption = event.target.closest("[data-field-combo-option]");
  if (fieldOption) {
    selectFieldComboOption(fieldOption);
    return;
  }

  const fieldComboToggle = event.target.closest("[data-field-combo-toggle]");
  if (fieldComboToggle) {
    const combo = fieldComboToggle.closest(".field-combo");
    closeFieldCombos(combo);
    setFieldComboMenu(combo, combo.querySelector(".combo-menu")?.hidden ?? true);
    combo.querySelector("[data-field]")?.focus();
    return;
  }

  const toggle = event.target.closest("[data-toggle]");
  if (toggle) {
    state.expandedId = state.expandedId === toggle.dataset.toggle ? null : toggle.dataset.toggle;
    renderQueue();
    return;
  }

  const remove = event.target.closest("[data-remove]");
  if (!remove) return;

  state.queue = state.queue.filter((item) => item.id !== remove.dataset.remove);
  if (state.expandedId === remove.dataset.remove) state.expandedId = null;
  renderQueue();
});

els.queueBody.addEventListener("keydown", (event) => {
  const input = event.target.closest(".field-combo [data-field]");
  if (!input) return;

  const combo = input.closest(".field-combo");
  if (event.key === "Escape") {
    setFieldComboMenu(combo, false);
  }

  if (event.key === "ArrowDown" && event.altKey) {
    event.preventDefault();
    closeFieldCombos(combo);
    setFieldComboMenu(combo, true);
  }
});

els.queueBody.addEventListener("input", (event) => {
  const input = event.target.closest("[data-field]");
  if (!input) return;

  const item = state.queue.find((row) => row.id === input.dataset.id);
  if (!item) return;

  item[input.dataset.field] = normalizedInputValue(input, item);
  markRowEdited(item);
  refreshEndpointPreview();
});

els.queueBody.addEventListener("change", (event) => {
  const input = event.target.closest("[data-field]");
  if (!input) return;

  const item = state.queue.find((row) => row.id === input.dataset.id);
  if (!item) return;

  item[input.dataset.field] = normalizedInputValue(input, item);
  markRowEdited(item);
  renderQueue();
});

els.clearQueue.addEventListener("click", () => {
  if (state.queue.length && !window.confirm("Clear Rows? The current table content will be lost.")) {
    return;
  }

  state.queue = [];
  state.expandedId = null;
  renderQueue();
  setImportStatus("Rows cleared. Add a row or load a CSV, then send reviewed rows to Everbridge.");
  setToast("Rows cleared.");
});

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
  if (!event.target.closest(".field-combo")) {
    closeFieldCombos();
  }
});

[els.apiBaseUrl, els.organizationId, els.username].forEach((input) => {
  input.addEventListener("input", () => {
    saveStoredConnection();
    refreshEndpointPreview();
    refreshAuthStatus();
  });
  input.addEventListener("change", () => {
    saveStoredConnection();
    refreshEndpointPreview();
    refreshAuthStatus();
  });
});

els.password.addEventListener("input", () => {
  refreshEndpointPreview();
  refreshAuthStatus();
});
els.password.addEventListener("change", () => {
  refreshEndpointPreview();
  refreshAuthStatus();
});

document.querySelectorAll("input, select").forEach((input) => {
  input.addEventListener("input", () => input.classList.remove("invalid"));
});

window.addEventListener("beforeunload", (event) => {
  if (!hasPageContentToLose()) return;

  event.preventDefault();
  event.returnValue = "";
});

loadStoredConnection();
setupTemplateDownload();
refreshEndpointPreview();
refreshAuthStatus();
renderQueue();
