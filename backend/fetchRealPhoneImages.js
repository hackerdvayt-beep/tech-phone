import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDir, "..");
const imageRoot = path.join(
  repositoryRoot,
  "frontend",
  "public",
  "images"
);
const apiUrl = "https://commons.wikimedia.org/w/api.php";
const openverseApiUrl = "https://api.openverse.org/v1/images/";
const userAgent =
  "TECH-PHONE-catalog-image-fetcher/1.0 (Wikimedia Commons license-checked downloader)";
const minimumFileSize = 10 * 1024;
const minimumImageSide = 500;
const delayMs = 1800;
const rejectedTitleTerms = [
  "render",
  "mockup",
  "mock",
  "wallpaper",
  "icon",
  "logo",
  "illustration",
  "screenshot",
  "diagram",
  "box",
  "packaging",
  "photography",
  "photo with",
  "photo-with",
  "taken using",
  "taken with",
  "shot on",
  "app",
  "app von",
  "sample photo",
  "cable",
  "bus",
  "station",
  "socket",
];

const targets = [
  {
    key: "iphone-18-pro-max",
    category: "phones",
    query: "iPhone 18 Pro Max",
    matchGroups: [["iphone", "18", "pro", "max"]],
  },
  {
    key: "iphone-18-pro",
    category: "phones",
    query: "iPhone 18 Pro",
    matchGroups: [["iphone", "18", "pro"]],
    excludeTitleTerms: ["max"],
  },
  {
    key: "iphone-air",
    category: "phones",
    query: "iPhone Air",
    matchGroups: [["iphone", "air"]],
  },
  {
    key: "iphone-17",
    category: "phones",
    query: "iPhone 17",
    matchGroups: [["iphone", "17"]],
    excludeTitleTerms: ["pro", "max", "air", "17e"],
  },
  {
    key: "iphone-17e",
    category: "phones",
    query: "iPhone 17e",
    matchGroups: [["iphone", "17e"], ["iphone", "17", "e"]],
  },
  {
    key: "iphone-duo",
    category: "phones",
    query: "iPhone Duo",
    matchGroups: [["iphone", "duo"]],
    fallbackSearches: [
      {
        query: "iPhone 18 Pro Max",
        matchGroups: [["iphone", "18", "pro", "max"]],
      },
    ],
  },
  {
    key: "samsung-galaxy-s26-ultra",
    category: "phones",
    query: "Samsung Galaxy S26 Ultra",
    matchGroups: [["samsung", "galaxy", "s26", "ultra"], ["galaxy", "s26", "ultra"]],
  },
  {
    key: "samsung-galaxy-s26-plus",
    category: "phones",
    query: "Samsung Galaxy S26 Plus",
    matchGroups: [["samsung", "galaxy", "s26", "plus"], ["galaxy", "s26", "plus"]],
    fallbackSearches: [
      {
        query: "Samsung Galaxy S26 Ultra",
        matchGroups: [["samsung", "galaxy", "s26", "ultra"], ["galaxy", "s26", "ultra"]],
      },
    ],
  },
  {
    key: "samsung-galaxy-z-fold8",
    category: "phones",
    query: "Samsung Galaxy Z Fold8",
    matchGroups: [["samsung", "galaxy", "z", "fold8"], ["galaxy", "z", "fold8"]],
    excludeTitleTerms: ["ultra"],
    fallbackSearches: [
      {
        query: "Samsung Galaxy Z Fold7",
        matchGroups: [["samsung", "galaxy", "z", "fold7"], ["galaxy", "z", "fold7"]],
      },
      {
        query: "Samsung Galaxy Z Fold6",
        matchGroups: [["samsung", "galaxy", "z", "fold6"], ["galaxy", "z", "fold6"]],
      },
    ],
  },
  {
    key: "samsung-galaxy-z-flip8",
    category: "phones",
    query: "Samsung Galaxy Z Flip8",
    matchGroups: [["samsung", "galaxy", "z", "flip8"], ["galaxy", "z", "flip8"]],
    fallbackSearches: [
      {
        query: "Samsung Galaxy Z Flip7",
        matchGroups: [["samsung", "galaxy", "z", "flip7"], ["galaxy", "z", "flip7"]],
      },
      {
        query: "Samsung Galaxy Z Flip6",
        matchGroups: [["samsung", "galaxy", "z", "flip6"], ["galaxy", "z", "flip6"]],
      },
      {
        query: "Samsung Galaxy Z Flip5",
        matchGroups: [["samsung", "galaxy", "z", "flip5"], ["galaxy", "z", "flip5"]],
      },
    ],
  },
  {
    key: "samsung-galaxy-a57-5g",
    category: "phones",
    query: "Samsung Galaxy A57 5G",
    matchGroups: [["samsung", "galaxy", "a57", "5g"], ["galaxy", "a57", "5g"]],
    fallbackSearches: [
      {
        query: "Samsung Galaxy A56 5G",
        matchGroups: [["samsung", "galaxy", "a56", "5g"], ["galaxy", "a56", "5g"]],
      },
      {
        query: "Samsung Galaxy A55 5G",
        matchGroups: [["samsung", "galaxy", "a55", "5g"], ["galaxy", "a55", "5g"]],
      },
    ],
  },
  {
    key: "xiaomi-17-ultra",
    category: "phones",
    query: "Xiaomi 17 Ultra",
    matchGroups: [["xiaomi", "17", "ultra"]],
    fallbackSearches: [
      {
        query: "Xiaomi 15 Ultra",
        matchGroups: [["xiaomi", "15", "ultra"]],
      },
      {
        query: "Xiaomi 14 Ultra",
        matchGroups: [["xiaomi", "14", "ultra"]],
      },
      {
        query: "Xiaomi 17 Pro",
        matchGroups: [["xiaomi", "17", "pro"]],
        excludeTitleTerms: ["max", "ultra"],
      },
    ],
  },
  {
    key: "xiaomi-17-pro",
    category: "phones",
    query: "Xiaomi 17 Pro",
    matchGroups: [["xiaomi", "17", "pro"]],
    excludeTitleTerms: ["max", "ultra"],
  },
  {
    key: "redmi-note-15-pro-plus",
    category: "phones",
    query: "Redmi Note 15 Pro Plus",
    matchGroups: [
      ["redmi", "note", "15", "pro", "plus"],
      ["redmi", "note", "15", "pro+"],
    ],
    fallbackSearches: [
      {
        query: "Redmi Note 14 Pro Plus",
        matchGroups: [["redmi", "note", "14", "pro", "plus"], ["redmi", "note", "14", "pro+"]],
      },
      {
        query: "Redmi Note 13 Pro Plus",
        matchGroups: [["redmi", "note", "13", "pro", "plus"], ["redmi", "note", "13", "pro+"]],
      },
      {
        query: "Redmi Note 13 Pro",
        matchGroups: [["redmi", "note", "13", "pro"]],
      },
      {
        query: "Redmi Note 12 Pro Plus",
        matchGroups: [["redmi", "note", "12", "pro", "plus"], ["redmi", "note", "12", "pro+"]],
      },
    ],
  },
  {
    key: "oppo-find-x9-pro",
    category: "phones",
    query: "OPPO Find X9 Pro",
    matchGroups: [["oppo", "find", "x9", "pro"]],
    excludeTitleTerms: ["ultra"],
    fallbackSearches: [
      {
        query: "OPPO Find X8 Pro",
        matchGroups: [["oppo", "find", "x8", "pro"]],
        excludeTitleTerms: ["ultra"],
      },
      {
        query: "OPPO Find X7 Pro",
        matchGroups: [["oppo", "find", "x7", "pro"]],
        excludeTitleTerms: ["ultra"],
      },
      {
        query: "OPPO Find X9 Ultra",
        matchGroups: [["oppo", "find", "x9", "ultra"]],
      },
      {
        query: "OPPO Find X8 Ultra",
        matchGroups: [["oppo", "find", "x8", "ultra"]],
      },
      {
        query: "OPPO Find X7 Ultra",
        matchGroups: [["oppo", "find", "x7", "ultra"]],
      },
      {
        query: "OPPO Find X9",
        matchGroups: [["oppo", "find", "x9"]],
      },
      {
        query: "OPPO Reno15",
        matchGroups: [["oppo", "reno15"]],
      },
      {
        query: "OPPO Reno15 Pro Max",
        matchGroups: [["oppo", "reno15", "pro", "max"]],
      },
      {
        query: "OPPO smartphone",
        matchGroups: [["oppo", "smartphone"], ["oppo", "phone"]],
      },
    ],
  },
  {
    key: "oppo-reno15",
    category: "phones",
    query: "OPPO Reno15",
    matchGroups: [["oppo", "reno15"], ["oppo", "reno", "15"]],
    fallbackSearches: [
      {
        query: "OPPO Find X9",
        matchGroups: [["oppo", "find", "x9"]],
      },
      {
        query: "OPPO Reno15 Pro Max",
        matchGroups: [["oppo", "reno15", "pro", "max"]],
      },
      {
        query: "OPPO Reno14 Pro",
        matchGroups: [["oppo", "reno14", "pro"], ["oppo", "reno", "14", "pro"]],
      },
      {
        query: "OPPO Reno13 Pro",
        matchGroups: [["oppo", "reno13", "pro"], ["oppo", "reno", "13", "pro"]],
      },
      {
        query: "OPPO Find X8 Pro",
        matchGroups: [["oppo", "find", "x8", "pro"]],
      },
      {
        query: "OPPO Find X9",
        matchGroups: [["oppo", "find", "x9"]],
      },
      {
        query: "OPPO smartphone",
        matchGroups: [["oppo", "smartphone"], ["oppo", "phone"]],
      },
      {
        query: "OPPO Reno 14",
        matchGroups: [["oppo", "reno", "14"]],
      },
      {
        query: "OPPO Reno 13",
        matchGroups: [["oppo", "reno", "13"]],
      },
      {
        query: "OPPO Reno 12",
        matchGroups: [["oppo", "reno", "12"]],
      },
      {
        query: "OPPO Reno 11",
        matchGroups: [["oppo", "reno", "11"]],
      },
    ],
  },
  {
    key: "google-pixel-11-pro-xl",
    category: "phones",
    query: "Google Pixel 11 Pro XL",
    matchGroups: [["google", "pixel", "11", "pro", "xl"], ["pixel", "11", "pro", "xl"]],
    fallbackSearches: [
      {
        query: "Google Pixel 10 Pro XL",
        matchGroups: [["google", "pixel", "10", "pro", "xl"], ["pixel", "10", "pro", "xl"]],
      },
      {
        query: "Google Pixel 9 Pro XL",
        matchGroups: [["google", "pixel", "9", "pro", "xl"], ["pixel", "9", "pro", "xl"]],
      },
      {
        query: "Google Pixel 10 Pro",
        matchGroups: [["google", "pixel", "10", "pro"], ["pixel", "10", "pro"]],
        excludeTitleTerms: ["xl"],
      },
      {
        query: "Google Pixel 9 Pro",
        matchGroups: [["google", "pixel", "9", "pro"], ["pixel", "9", "pro"]],
        excludeTitleTerms: ["xl"],
      },
      {
        query: "Google Pixel 8 Pro",
        matchGroups: [["google", "pixel", "8", "pro"], ["pixel", "8", "pro"]],
      },
    ],
  },
  {
    key: "airpods-pro-3",
    category: "accessories",
    query: "AirPods Pro 3",
    matchGroups: [
      ["airpods", "pro", "3"],
      ["airpods", "pro", "3rd"],
      ["airpods", "pro", "third"],
    ],
    fallbackSearches: [
      {
        query: "AirPods Pro 2",
        matchGroups: [["airpods", "pro", "2"]],
      },
    ],
  },
  {
    key: "apple-watch-series-12",
    category: "accessories",
    query: "Apple Watch Series 12",
    matchGroups: [
      ["apple", "watch", "series", "12"],
      ["applewatch", "series", "12"],
      ["applewatchseries12"],
    ],
    fallbackSearches: [
      {
        query: "Apple Watch Series 11",
        matchGroups: [["apple", "watch", "series", "11"], ["applewatch", "series", "11"]],
      },
      {
        query: "Apple Watch Series 10",
        matchGroups: [["apple", "watch", "series", "10"], ["applewatch", "series", "10"]],
      },
    ],
  },
  {
    key: "samsung-galaxy-watch9",
    category: "accessories",
    query: "Samsung Galaxy Watch 9",
    matchGroups: [
      ["samsung", "galaxy", "watch", "9"],
      ["samsung", "galaxy", "watch9"],
      ["galaxy", "watch", "9"],
      ["galaxy", "watch9"],
    ],
    excludeTitleTerms: ["ultra2", "ultra 2"],
    fallbackSearches: [
      {
        query: "Samsung Galaxy Watch8",
        matchGroups: [
          ["samsung", "galaxy", "watch8"],
          ["samsung", "galaxy", "watch", "8"],
          ["galaxy", "watch8"],
          ["galaxy", "watch", "8"],
        ],
      },
      {
        query: "Samsung Galaxy Watch7",
        matchGroups: [
          ["samsung", "galaxy", "watch7"],
          ["samsung", "galaxy", "watch", "7"],
          ["galaxy", "watch7"],
          ["galaxy", "watch", "7"],
        ],
      },
    ],
  },
  {
    key: "gan-65w-charger",
    category: "accessories",
    query: "GaN 65W charger",
    matchGroups: [
      ["gan", "65w", "charger"],
      ["gan", "65w", "charger"],
    ],
    fallbackSearches: [
      {
        query: "65W charger",
        matchGroups: [["65w", "charger"], ["65w", "chargers"]],
      },
      {
        query: "GaN charger",
        matchGroups: [["gan", "charger"], ["gan", "chargers"]],
      },
      {
        query: "Silicon vs GaN 30W USB-C chargers",
        matchGroups: [["gan", "30w", "usb", "c", "chargers"]],
      },
      {
        query: "Baseus USB charger",
        matchGroups: [["baseus", "cccp20ue"]],
      },
      {
        query: "Pisen USB charger",
        matchGroups: [["pisen", "mf", "08eu"]],
      },
      {
        query: "Orico USB charger",
        matchGroups: [["orico", "yc", "pe0508000h"]],
      },
      {
        query: "OnePlus Dash charger",
        matchGroups: [["oneplus", "dash", "charger"]],
      },
    ],
  },
  {
    key: "magsafe-case",
    category: "accessories",
    query: "MagSafe iPhone case",
    matchGroups: [["magsafe", "case"], ["magsafe", "iphone"]],
    excludeTitleTerms: ["adapter", "charger"],
    fallbackSearches: [
      {
        query: "MagSafe case",
        matchGroups: [["magsafe", "case"]],
        excludeTitleTerms: ["adapter", "charger"],
      },
      {
        query: "iPhone 15 MagSafe case",
        matchGroups: [["iphone", "15", "magsafe", "case"]],
        excludeTitleTerms: ["adapter", "charger"],
      },
      {
        query: "iPhone case with MagSafe",
        matchGroups: [["iphone", "case", "magsafe"]],
        excludeTitleTerms: ["adapter", "charger"],
      },
    ],
  },
];

const normalize = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const hasTerm = (normalizedText, term) =>
  ` ${normalizedText} `.includes(` ${normalize(term)} `);

const hasGroup = (normalizedText, terms) =>
  hasTerm(normalizedText, terms.join(" "));

const readMetadata = (metadata, key) =>
  String(metadata?.[key]?.value || "").replace(/<[^>]*>/g, " ");

const isAllowedLicense = (license) =>
  /^(cc0|public domain|cc by(?:-sa)? 2\.0|cc by(?:-sa)? 3\.0|cc by(?:-sa)? 4\.0)$/i.test(
    license.trim()
  );

const hasPhotoFileType = (info, url) => {
  const mime = String(info.mime || "").toLowerCase();
  const extension = path.extname(new URL(url).pathname).toLowerCase();
  return (
    (mime === "image/jpeg" || mime === "image/png") &&
    [".jpg", ".jpeg", ".png"].includes(extension)
  );
};

const hasRasterSignature = (buffer) => {
  const jpeg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const png =
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    );
  return jpeg || png;
};

const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const searchCommons = async (target) => {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: `filetype:bitmap ${target.query}`,
    gsrnamespace: "6",
    gsrlimit: "50",
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: "1280",
    format: "json",
  });
  let response;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    response = await fetch(`${apiUrl}?${params}`, {
      headers: { "User-Agent": userAgent },
      signal: AbortSignal.timeout(30000),
    });
    if (response.status === 200) break;

    if (response.status !== 429 && response.status < 500) {
      throw new Error(`Commons search returned HTTP ${response.status}`);
    }
    if (attempt === 3) {
      throw new Error(`Commons search returned HTTP ${response.status} after retries`);
    }

    const retryAfter = Number(response.headers.get("retry-after"));
    await delay(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 5000 * (attempt + 1));
  }

  const data = await response.json();
  return Object.values(data.query?.pages || {})
    .map((page) => {
      const info = page.imageinfo?.[0];
      if (!info) return null;
      const metadata = info.extmetadata || {};
      const license = readMetadata(metadata, "LicenseShortName");
      const rawTitle = page.title.replace(/^File:/i, "");
      const title = normalize(rawTitle);
      const description = normalize(readMetadata(metadata, "ImageDescription"));
      const excludedTerms = target.excludeTitleTerms || [];
      const titleMatches = target.matchGroups.some((group) =>
        hasGroup(title, group)
      );
      const hasExcludedTitleTerm = excludedTerms.some((term) =>
        hasTerm(title, term)
      );
      const titleLooksIllustrative = rejectedTitleTerms.some((term) =>
        hasTerm(`${title} ${description}`, term)
      ) || /\u30e2\u30c3\u30af/.test(rawTitle);
      const url = info.thumburl || info.url;

      if (
        !titleMatches ||
        hasExcludedTitleTerm ||
        titleLooksIllustrative ||
        !isAllowedLicense(license) ||
        !hasPhotoFileType(info, url) ||
        Math.min(Number(info.width || 0), Number(info.height || 0)) <
          minimumImageSide
      ) {
        return null;
      }

      return {
        pageId: page.pageid,
        title: page.title.replace(/^File:/i, ""),
        url,
        sourcePage: info.descriptionurl,
        width: info.width,
        height: info.height,
        author: readMetadata(metadata, "Artist") || "Not credited",
        license,
        licenseUrl: readMetadata(metadata, "LicenseUrl"),
        description,
        sourceFileSize: info.size,
      };
    })
    .filter(Boolean);
};

const downloadImage = async (asset, destination) => {
  const response = await fetch(asset.url, {
    headers: { "User-Agent": userAgent },
    signal: AbortSignal.timeout(45000),
  });
  if (response.status !== 200) {
    throw new Error(`Download returned HTTP ${response.status}`);
  }

  const contentType = String(response.headers.get("content-type") || "")
    .split(";")[0]
    .toLowerCase();
  if (contentType !== "image/jpeg" && contentType !== "image/png") {
    throw new Error(`Downloaded content has unsupported type ${contentType || "(missing)"}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length <= minimumFileSize) {
    throw new Error(`Downloaded file is only ${buffer.length} bytes`);
  }
  if (!hasRasterSignature(buffer)) {
    throw new Error("Downloaded content is not a JPEG/PNG photo");
  }

  await fs.writeFile(destination, buffer);
  return buffer.length;
};

const searchOpenverse = async (target) => {
  const params = new URLSearchParams({
    q: target.query,
    license: "cc0,by,by-sa",
    category: "photograph",
    page_size: "20",
  });
  const response = await fetch(`${openverseApiUrl}?${params}`, {
    headers: { "User-Agent": userAgent },
    signal: AbortSignal.timeout(30000),
  });
  if (response.status !== 200) {
    throw new Error(`Openverse search returned HTTP ${response.status}`);
  }

  const data = await response.json();
  return (data.results || [])
    .map((result) => {
      const title = normalize(result.title);
      const description = normalize(result.description || "");
      const extension = String(result.filetype || path.extname(new URL(result.url).pathname))
        .replace(/^\./, "")
        .toLowerCase();
      const license = result.license === "cc0"
        ? "CC0"
        : `CC ${result.license.toUpperCase()} ${result.license_version}`;
      const excludedTerms = target.excludeTitleTerms || [];
      const titleMatches = target.matchGroups.some((group) =>
        hasGroup(title, group)
      );
      const hasExcludedTitleTerm = excludedTerms.some((term) =>
        hasTerm(title, term)
      );
      const titleLooksIllustrative = rejectedTitleTerms.some((term) =>
        hasTerm(`${title} ${description}`, term)
      );
      const mime =
        extension === "jpg" || extension === "jpeg"
          ? "image/jpeg"
          : extension === "png"
            ? "image/png"
            : "";
      const info = {
        mime,
        width: result.width,
        height: result.height,
      };

      if (
        !titleMatches ||
        hasExcludedTitleTerm ||
        titleLooksIllustrative ||
        !isAllowedLicense(license) ||
        !hasPhotoFileType(info, result.url) ||
        Math.min(Number(result.width || 0), Number(result.height || 0)) <
          minimumImageSide
      ) {
        return null;
      }

      return {
        pageId: `openverse-${result.id}`,
        title: result.title,
        url: result.url,
        sourcePage: result.foreign_landing_url,
        width: result.width,
        height: result.height,
        author: result.creator || "Not credited",
        license,
        licenseUrl: result.license_url,
        description,
        sourceFileSize: result.filesize,
        provider: "Openverse",
      };
    })
    .filter(Boolean);
};

const main = async () => {
  const dryRun = process.argv.includes("--dry-run");
  const onlyArgument = process.argv.find((argument) =>
    argument.startsWith("--only=")
  );
  const requestedKeys = onlyArgument
    ? onlyArgument
        .slice("--only=".length)
        .split(",")
        .map((key) => key.trim())
        .filter(Boolean)
    : [];
  const selectedTargets = requestedKeys.length
    ? targets.filter((target) => requestedKeys.includes(target.key))
    : targets;
  const unknownKeys = requestedKeys.filter(
    (key) => !targets.some((target) => target.key === key)
  );
  if (unknownKeys.length) {
    throw new Error(`Unknown target key(s): ${unknownKeys.join(", ")}`);
  }

  const maxImages = Number(
    process.argv.find((argument) => argument.startsWith("--max-images="))?.split("=")[1] || 4
  );
  if (!Number.isInteger(maxImages) || maxImages < 3 || maxImages > 4) {
    throw new Error("--max-images must be 3 or 4");
  }

  const manifest = [];
  let incompleteTargets = 0;
  for (const target of selectedTargets) {
    const selected = [];
    const seenPageIds = new Set();
    const seenTitles = new Set();
    const searchProfiles = [
      { ...target, exactModel: true },
      ...(target.fallbackSearches || []).map((profile) => ({
        ...target,
        ...profile,
        exactModel: false,
      })),
    ];

    for (const profile of searchProfiles) {
      if (selected.length >= maxImages) break;
      const candidates = await searchCommons(profile);
      for (const candidate of candidates) {
        const titleKey = normalize(candidate.title);
        if (seenPageIds.has(candidate.pageId) || seenTitles.has(titleKey)) continue;
        selected.push({
          ...candidate,
          exactModel: profile.exactModel,
          matchedQuery: profile.query,
        });
        seenPageIds.add(candidate.pageId);
        seenTitles.add(titleKey);
        if (selected.length >= maxImages) break;
      }
      await delay(delayMs);
    }

    if (selected.length < maxImages) {
      const candidates = await searchOpenverse(target);
      for (const candidate of candidates) {
        const titleKey = normalize(candidate.title);
        if (seenPageIds.has(candidate.pageId) || seenTitles.has(titleKey)) continue;
        selected.push({
          ...candidate,
          exactModel: target.exactModel !== false,
          matchedQuery: target.query,
        });
        seenPageIds.add(candidate.pageId);
        seenTitles.add(titleKey);
        if (selected.length >= maxImages) break;
      }
    }

    const saved = [];
    const exactCount = selected.filter((asset) => asset.exactModel).length;
    console.log(
      `${target.key}: ${selected.length}/${maxImages} photos found (${exactCount} exact, ${selected.length - exactCount} related)`
    );
    if (!selected.length) {
      incompleteTargets += 1;
      continue;
    }

    for (let index = 0; index < selected.length; index += 1) {
      const asset = selected[index];
      const extension = path.extname(new URL(asset.url).pathname).toLowerCase();
      const destinationDirectory = path.join(imageRoot, target.category);
      const fileName = `${target.key}-${index + 1}${extension}`;
      const destination = path.join(destinationDirectory, fileName);

      console.log(`  - ${asset.title}`);
      if (dryRun) {
        saved.push({ ...asset, localPath: `/images/${target.category}/${fileName}` });
        continue;
      }

      try {
        await fs.mkdir(destinationDirectory, { recursive: true });
        const bytes = await downloadImage(asset, destination);
        console.log(`    HTTP 200; ${bytes} bytes; ${asset.license}`);
        saved.push({
          ...asset,
          bytes,
          localPath: `/images/${target.category}/${fileName}`,
        });
      } catch (error) {
        console.error(`    Failed: ${error.message}`);
      }
      await delay(delayMs);
    }

    if (saved.length < 3) incompleteTargets += 1;
    manifest.push({
      key: target.key,
      category: target.category,
      query: target.query,
      relatedModelsUsed: selected.some((asset) => !asset.exactModel),
      images: saved,
    });
    await delay(delayMs);
  }

  if (!dryRun) {
    const manifestPath = path.join(
      imageRoot,
      "WIKIMEDIA-REAL-PHOTOS.json"
    );
    let outputManifest = manifest;
    if (requestedKeys.length) {
      try {
        const existing = JSON.parse(await fs.readFile(manifestPath, "utf8"));
        const merged = new Map(
          existing.map((entry) => [entry.key, entry])
        );
        for (const entry of manifest) merged.set(entry.key, entry);
        outputManifest = targets
          .map((target) => merged.get(target.key))
          .filter(Boolean);
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
    await fs.writeFile(
      manifestPath,
      `${JSON.stringify(outputManifest, null, 2)}\n`
    );
    console.log(`Manifest written: ${manifestPath}`);
  }

  console.log(
    `${dryRun ? "Dry run" : "Download"} complete: ${manifest.length} targets processed; ${incompleteTargets} target(s) have fewer than 3 photos.`
  );
  if (!dryRun && incompleteTargets > 0) {
    process.exitCode = 1;
  }
};

main().catch((error) => {
  console.error(`Image fetch failed: ${error.message}`);
  process.exitCode = 1;
});
