class TitleParser {
  constructor() {
    this.stopwords = ['the', 'a', 'an'];
    this.romanMap = {
      'i': 1, 'ii': 2, 'iii': 3, 'iv': 4, 'v': 5,
      'vi': 6, 'vii': 7, 'viii': 8, 'ix': 9, 'x': 10
    };
    this.platformKeywords = [
      'netflix', 'amazon', 'hulu', 'disney', 'hotstar', 'zee5', 'sony', 
      'appletv', 'hbo', 'prime', 'original', 'series'
    ];
  }

  parse(rawTitle) {
    if (!rawTitle) return null;

    let title = rawTitle.trim();
    
    // 1. Content Classification
    const type = this.classifyType(title);

    // 2. Year Extraction
    const year = this.extractYear(title);

    // 3. Display Title Extraction
    const displayTitle = this.extractDisplayTitle(title, type);

    // 4. Machine Title Construction
    const machineTitle = this.constructMachineTitle(displayTitle);

    // 5. Metadata Extraction
    const metadata = this.extractMetadata(title, type);

    // 6. Update Info
    const updateInfo = this.extractUpdateInfo(title);

    // 7. Canonical Key
    const canonicalKey = `${machineTitle}|${year}|${type}`;

    // 8. Confidence Scoring
    const confidence = this.calculateConfidence(displayTitle, year, type, metadata);

    return {
      display_title: displayTitle,
      machine_title: machineTitle,
      canonical_key: canonicalKey,
      type: type,
      year: year === 'unknown' ? 'unknown' : parseInt(year),
      season: metadata.season,
      part: metadata.part,
      volume: metadata.volume,
      episode: metadata.episode,
      update_info: updateInfo,
      languages: metadata.languages,
      qualities: metadata.qualities,
      platform: metadata.platform,
      confidence: confidence
    };
  }

  classifyType(title) {
    // If title contains Season, Sxx, Ep, Episode, or Series → type = "series"
    // Else → type = "movie"
    const seriesKeywords = /\b(season|s\d+|ep|episode|series)\b/i;
    if (seriesKeywords.test(title)) {
      return 'series';
    }
    return 'movie';
  }

  extractYear(title) {
    // Extract 4-digit year if present (1900-2099)
    // Avoid mismatches like 1080p
    const yearRegex = /\b(19|20)\d{2}\b/g;
    const matches = title.match(yearRegex);
    if (matches && matches.length > 0) {
      // Return the first valid year found
      return matches[0];
    }
    return 'unknown';
  }

  extractDisplayTitle(title, type) {
    // Everything BEFORE the first occurrence of: (YYYY), Season, Sxx
    // Also consider [YYYY] or other delimiters often seen before metadata
    
    // Regex for cutoffs:
    // 1. Year: (19xx|20xx) or [19xx|20xx]
    // 2. Season: Season X, SXX
    // 3. Episode: Ep X, Episode X
    // 4. Square brackets often start metadata: [
    
    // We need to find the *earliest* index of any of these.
    
    const patterns = [
      /\(\s*(19|20)\d{2}\s*\)/,  // (2025)
      /\[\s*(19|20)\d{2}\s*\]/,  // [2025]
      /\b(season|s\d+)\b/i,      // Season 5, S05
      /\b(episode|ep\s*\d+)\b/i, // Episode 5, Ep 5
    ];

    let cutoffIndex = title.length;

    patterns.forEach(regex => {
      const match = title.match(regex);
      if (match && match.index < cutoffIndex) {
        cutoffIndex = match.index;
      }
    });

    // Substring
    let cleanTitle = title.substring(0, cutoffIndex).trim();

    // Cleanup: Remove trailing separators like " - ", " | ", " : ", "–" (en dash), "—" (em dash)
    // Also remove "Download" prefix if present
    // Also remove platform names if they appear at the end (e.g. "Wednesday – Netflix Original")
    // Repeat cleanup until stable
    
    // Remove "Download" prefix first
    cleanTitle = cleanTitle.replace(/^download\s+/i, '');

    let prev = '';
    while (cleanTitle !== prev) {
      prev = cleanTitle;
      cleanTitle = cleanTitle.replace(/[-|:–—]\s*$/, '').trim();
      
      // Remove trailing "Netflix Original", "Netflix Series", etc if present
      // Only if they are at the end
      const platformRegex = /\s*[-|]?\s*\b(netflix|amazon|hulu|disney|hotstar|zee5|sony|appletv|hbo|prime)\s*(original|series|web series|tv show)?\s*$/i;
      cleanTitle = cleanTitle.replace(platformRegex, '').trim();
      
      // Remove trailing "Season" or "S" if it was cut off weirdly?
      // No, cutoff logic handles that.
      
      // Remove trailing " (" or " ["
      cleanTitle = cleanTitle.replace(/[\(\[]$/, '').trim();
    }
    
    return cleanTitle;
  }

  constructMachineTitle(displayTitle) {
    let text = displayTitle.toLowerCase();

    // b. Convert roman numerals to numbers (ii -> 2, iii -> 3, iv -> 4, etc)
    // We do this word by word to avoid replacing inside words
    text = text.replace(/\b(i|ii|iii|iv|v|vi|vii|viii|ix|x)\b/g, (match) => {
      return this.romanMap[match];
    });

    // c. Remove safe stopwords: "the", "a", "an"
    text = text.replace(/\b(the|a|an)\b/g, '');

    // d. Remove ALL non-alphanumeric characters (keep a-z and 0-9 only)
    text = text.replace(/[^a-z0-9]/g, '');

    // e. Remove ALL spaces (already done by step d if spaces are non-alphanumeric, but explicit removal is safer if regex was different)
    // \s is non-alphanumeric so handled.

    return text;
  }

  extractMetadata(title, type) {
    const metadata = {
      season: null,
      episode: null,
      part: null,
      volume: null,
      qualities: [],
      languages: [],
      platform: 'Unknown'
    };

    // Season
    // Patterns: "Season 1-5", "Season 4", "S04", "S01-05"
    const seasonRangeRegex = /\b(?:season|s)\s*(\d+)\s*-\s*(\d+)\b/i;
    const seasonSingleRegex = /\b(?:season|s)\s*(\d+)\b/i;

    const rangeMatch = title.match(seasonRangeRegex);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1]);
      const end = parseInt(rangeMatch[2]);
      metadata.season = [];
      for (let i = start; i <= end; i++) metadata.season.push(i);
    } else {
      const singleMatch = title.match(seasonSingleRegex);
      if (singleMatch) {
        // If type is series, this is likely the season
        metadata.season = parseInt(singleMatch[1]);
      }
    }
    
    // Episode (Availability)
    // Usually "Ep 8" or "Episode 8"
    // Note: "Ep 8 Added" is parsed in update_info, but generic episode info might be present
    // If "Episode 8" is in title, it might be the only episode available?
    // We treat this as metadata.
    const epRegex = /\b(?:episode|ep)\s*[-.]?\s*(\d+)\b/i;
    const epMatch = title.match(epRegex);
    if (epMatch) {
      metadata.episode = parseInt(epMatch[1]);
    }

    // Part / Volume
    // For Movies: Part is often in title (handled by machine_title), but if we can extract it, good.
    // For Series: "Vol 2", "Part 2" usually inside Season context.
    
    const partRegex = /\bpart\s*[-.]?\s*(\d+)\b/i;
    const volRegex = /\b(?:volume|vol)\s*[-.]?\s*(\d+)\b/i;
    
    const partMatch = title.match(partRegex);
    if (partMatch) {
      metadata.part = parseInt(partMatch[1]);
    }
    
    const volMatch = title.match(volRegex);
    if (volMatch) {
      metadata.volume = parseInt(volMatch[1]);
    }

    // Languages
    const langKeywords = ['Hindi', 'English', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Korean', 'Japanese', 'Chinese', 'Spanish', 'French', 'Dual Audio', 'Multi Audio'];
    const titleLower = title.toLowerCase();
    langKeywords.forEach(lang => {
      if (titleLower.includes(lang.toLowerCase())) {
        metadata.languages.push(lang);
      }
    });

    // Qualities
    const qualityKeywords = ['480p', '720p', '1080p', '2160p', '4K', 'HDR', 'SDR', 'WEB-DL', 'BluRay', 'HDTC', 'CAM'];
    qualityKeywords.forEach(q => {
      // Use word boundary for some, but 480p is usually distinct
      if (new RegExp(`\\b${q}\\b`, 'i').test(title)) {
        metadata.qualities.push(q);
      }
    });

    // Platform
    // Look for platform keywords
    for (const p of this.platformKeywords) {
      if (titleLower.includes(p)) {
        // Capitalize first letter
        metadata.platform = p.charAt(0).toUpperCase() + p.slice(1);
        if (metadata.platform === 'Appletv') metadata.platform = 'AppleTV';
        if (metadata.platform === 'Hbo') metadata.platform = 'HBO';
        if (metadata.platform === 'Zee5') metadata.platform = 'Zee5';
        break; // Assume primary platform
      }
    }

    return metadata;
  }

  extractUpdateInfo(title) {
    const info = {
      episode_added: null,
      volume_added: null,
      part_added: false,
      complete: null
    };

    // Helper to find numbers inside an "Added" context
    // We look for brackets or segments containing "Added"
    const addedBlockRegex = /[\[\(]?[^\]\)]*added[^\]\)]*[\]\)]?/gi;
    const addedBlocks = title.match(addedBlockRegex) || [];

    // Also consider the whole title if "Added" is just there without brackets (rare but possible)
    if (addedBlocks.length === 0 && /added/i.test(title)) {
        addedBlocks.push(title);
    }

    addedBlocks.forEach(block => {
        // Ep Added
        const epRegex = /\b(?:ep|episode)\s*[-.]?\s*(\d+)/i;
        const epMatch = block.match(epRegex);
        if (epMatch) info.episode_added = parseInt(epMatch[1]);

        // Vol Added
        const volRegex = /\b(?:vol|volume)\s*[-.]?\s*(\d+)/i;
        const volMatch = block.match(volRegex);
        if (volMatch) info.volume_added = parseInt(volMatch[1]);

        // Part Added
        const partRegex = /\bpart\s*[-.]?\s*(\d+)/i;
        const partMatch = block.match(partRegex);
        if (partMatch) {
            info.part_added = parseInt(partMatch[1]);
        } else if (/\bpart\b/i.test(block)) {
             // Check if it says "Part 1 & 2"
             if (/\bpart\s*\d+\s*&\s*\d+/i.test(block)) {
                 info.part_added = true; // Complex range/list
             } else if (/\bpart\s*added\b/i.test(block)) {
                 // "Part Added" generic
                 // Only set if not already set
                 if (info.part_added === false) info.part_added = true;
             }
        }
    });
    
    // "Complete"
    if (/\bcomplete\b/i.test(title) || /\ball episodes\b/i.test(title)) {
        info.complete = true;
    }

    return info;
  }

  calculateConfidence(displayTitle, year, type, metadata) {
    let score = 0.0;
    
    if (displayTitle && displayTitle.length > 0) score += 0.4;
    if (year !== 'unknown') score += 0.3;
    if (type) score += 0.1;
    
    // Metadata presence
    if (metadata.qualities.length > 0) score += 0.1;
    if (metadata.languages.length > 0) score += 0.1;
    
    return Math.min(score, 1.0);
  }
}

if (typeof module !== 'undefined') {
  module.exports = TitleParser;
}
