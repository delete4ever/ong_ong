import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const auditPath = path.join(process.cwd(), 'public', 'data', 'film-stills.audit-v1.json');
const outputDirectory = path.join(process.cwd(), 'public', 'images', 'film-stills');
const importedDate = new Date().toISOString().slice(0, 10);
const audit = JSON.parse(await readFile(auditPath, 'utf8'));
const cache = new Map();
const execFileAsync = promisify(execFile);

function inspectImage(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { extension: 'jpg', mimeType: 'image/jpeg' };
  }
  if (
    buffer.length >= 8
    && buffer[0] === 0x89
    && buffer[1] === 0x50
    && buffer[2] === 0x4e
    && buffer[3] === 0x47
  ) {
    return { extension: 'png', mimeType: 'image/png' };
  }
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    return { extension: 'webp', mimeType: 'image/webp' };
  }
  throw new Error('The response is not a supported JPEG, PNG, or WebP image.');
}

async function readExistingImage(locationId) {
  for (const extension of ['jpg', 'png', 'webp']) {
    const candidatePath = path.join(outputDirectory, `${locationId}.${extension}`);
    try {
      const buffer = await readFile(candidatePath);
      if (buffer.length < 5_000) continue;
      return { buffer, ...inspectImage(buffer) };
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  return null;
}

async function fetchWithCurl(record) {
  const temporaryPath = path.join(outputDirectory, `.${record.location_id}.download`);
  try {
    await execFileAsync('curl.exe', [
      '--location',
      '--fail',
      '--silent',
      '--show-error',
      '--ipv4',
      '--connect-timeout', '20',
      '--max-time', '90',
      '--user-agent', 'Mozilla/5.0 (compatible; HongKongThroughFilm/1.0; coursework asset import)',
      '--referer', record.candidate_image.source_page_url,
      '--output', temporaryPath,
      record.candidate_image.image_url,
    ], { maxBuffer: 1024 * 1024 });
    return await readFile(temporaryPath);
  } finally {
    await rm(temporaryPath, { force: true });
  }
}

async function fetchImage(record) {
  const imageUrl = record.candidate_image.image_url;
  if (!imageUrl) throw new Error(`${record.location_id} has no candidate image URL.`);
  if (cache.has(imageUrl)) return cache.get(imageUrl);

  let buffer;
  try {
    const response = await fetch(imageUrl, {
      redirect: 'follow',
      headers: {
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        Referer: record.candidate_image.source_page_url,
        'User-Agent': 'Mozilla/5.0 (compatible; HongKongThroughFilm/1.0; coursework asset import)',
      },
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    buffer = Buffer.from(await response.arrayBuffer());
  } catch (error) {
    console.warn(`Primary download failed for ${record.location_id}; trying the IPv4 fallback.`);
    buffer = await fetchWithCurl(record);
  }

  if (buffer.length < 5_000) throw new Error(`Image response is unexpectedly small (${buffer.length} bytes).`);
  const format = inspectImage(buffer);
  const result = { buffer, ...format };
  cache.set(imageUrl, result);
  return result;
}

await mkdir(outputDirectory, { recursive: true });
const failures = [];

for (const record of audit.records) {
  try {
    const existingImage = await readExistingImage(record.location_id);
    const { buffer, extension, mimeType } = existingImage ?? await fetchImage(record);
    const filename = `${record.location_id}.${extension}`;
    const outputPath = path.join(outputDirectory, filename);
    const sha256 = createHash('sha256').update(buffer).digest('hex');

    await writeFile(outputPath, buffer);
    record.candidate_image.local_asset = {
      url: `/images/film-stills/${filename}`,
      mime_type: mimeType,
      bytes: buffer.length,
      sha256,
      imported_date: importedDate,
    };
    console.log(`Imported ${record.location_id}: ${buffer.length} bytes`);
  } catch (error) {
    failures.push({ locationId: record.location_id, message: error.message });
    console.error(`Could not import ${record.location_id}: ${error.message}`);
  }
}

await writeFile(auditPath, `${JSON.stringify(audit, null, 2)}\n`, 'utf8');
console.log(`Updated ${audit.records.length - failures.length} audit records with local asset metadata.`);
if (failures.length) {
  console.error(`Import incomplete: ${failures.map((failure) => failure.locationId).join(', ')}`);
  process.exitCode = 1;
}
