const TitleParser = require('./parser.js');

const tests = [
  "Tu Meri Main Tera Main Tera Tu Meri (2025) WEB-DL Hindi Full Movie 480p [500MB] | 720p [1.2GB] | 1080p [2.8GB] | 2160p 4K [15.5GB]",
  "The Raja Saab (2026) WEB-DL Multi Audio [Hindi (LiNE) + Tamil + Telugu + Malayalam + Kannada] Full Movie 480p [900MB] | 720p [2GB] | 1080p [4GB] | 2160p 4K [18.3GB]",
  "Unfamiliar (2026) Season 1 Multi Audio [Hindi ORG. + English + Korean + Tamil] Netflix Original WEB Series 480p | 720p | 1080p WEB-DL",
  "Mardaani 3 (2026) [Hindi (LiNE)] Full Movie HQ-HDTC 480p [450MB] | 720p [1GB] | 1080p [2.4GB]",
  "The Great Indian Kapil Show (Season 4) Hindi TV Show [S04Ep08 – 07th February Added] 480p | 720p | 1080p WEB-DL",
  "The 50 (2026) Season 1 Hindi Reality Show [Ep-09 Added] 480p | 720p | 1080p WEB-DL",
  "Panchayat (2025) Season 4 Hindi Complete Amazon Original WEB Series 480p | 720p | 1080p | 2160p 4K WEB-DL",
  "Wednesday – Netflix Original (Season 1-2) [S02 PART-2] [Hindi + Multi Audio] Complete WEB Series 480p | 720p | 1080p WEB-DL.",
  "Stranger Things (Season 1-5) [Ep08 Added] Multi Audio [Hindi ORG. + English + Tamil + Telugu] Netflix Web Series 480p | 720p | 1080p WEB-DL",
  "Superman (2025) IMAX WEB-DL Multi Audio [Hindi ORG. + English + Tamil + Telugu] Full Movie 480p [600MB] | 720p [1.3GB] | 1080p [3.1GB] | 2160p 4K [24.8GB]",
  "The Great Indian Kapil Show (Season 4) 2025 [Hindi (DD5.1)] (Ep08 Added) NETFLIX Series 480p 720p 1080p – WEB-DL",
  "The 50 (2026) Season 1 [Hindi ] (S01 Ep08 Added) 480p | 720p | 1080p WEB-DL [x264/ESubs]",
  "Download Wednesday – Netflix Original (2022) Season 1 Dual Audio {Hindi-English} 480p | 720p | 1080p WEB-DL",
  "Wednesday (Season 2) 2025 Dual Audio [Hindi (DD5.1) - English] [Part 1 & 2 Added] NETFLIX Series 480p 720p 1080p - 4K 2160p WEB-DL",
  "Stranger Things (Season 5) Dual Audio [Hindi (DD5.1) - English] (S05 Vol3 Ep08 Added) NETFLIX Series 480p 720p 1080p 4K 2160p SDR-HDR - WEB-DL",
  "Stranger Things: Season 4 – Vol. 1 (2022) Netflix Original Dual Audio {Hindi-English} 480p | 720p | 1080p WEB-DL",
  "Gangs of Wasseypur Part – 2 (2012) Hindi Full Movie BluRay 480p [400MB] | 720p [1.3GB] | 1080p [4.6GB]",
  "Chabak Night of Murder and Romance (2023) WEB-DL [Hindi (DD2.0) & Korea] 1080p 720p & 480p Dual Audio [x264 | Full Movie",
  "Stranger Things (Season 5) WEB-DL [Hindi (DD5.1) & English] 4K 1080p 720p & 480p [x264/10Bit-HEVC] | NF Series | [VOL-1 Added]",
  "Stranger Things (Season 5) WEB-DL [Hindi (DD5.1) & English] 4K 1080p 720p & 480p [x264/10Bit-HEVC] | NF Series | [VOL-3 | EP-08 Added]",
  "Stranger Things (S04-VOL 1 & 2) WEB-DL [Hindi DD5.1 & English] 1080p 720p 480p & 10Bit HEVC [ALL Episodes] | NF Series"
];

const parser = new TitleParser();

console.log("Running Tests...\n");

tests.forEach((title, index) => {
  try {
    const result = parser.parse(title);
    console.log(`Test ${index + 1}:`);
    console.log(`Input: ${title}`);
    console.log(`Display Title: "${result.display_title}"`);
    console.log(`Machine Title: "${result.machine_title}"`);
    console.log(`Canonical Key: "${result.canonical_key}"`);
    console.log(`Type: ${result.type}, Year: ${result.year}`);
    if (result.type === 'series') console.log(`Season: ${JSON.stringify(result.season)}`);
    console.log(`Update Info:`, JSON.stringify(result.update_info));
    console.log("--------------------------------------------------");
  } catch (e) {
    console.error(`Test ${index + 1} FAILED:`, e);
  }
});
