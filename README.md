# High-Accuracy Movie & Series Title Parser

A deterministic, rule-based title parser designed for movie and web-series aggregation platforms. It converts raw, marketing-heavy titles into structured, normalized metadata suitable for grouping and identification.

## Features

- **Frontend Only**: Built with Vanilla JS (ES6+), HTML5, and CSS3. No external libraries or backend required.
- **Deterministic Parsing**: Uses strict rules to ensure consistent output for the same input.
- **Canonical Grouping**: Generates a `canonical_key` (`machine_title|year|type`) to group releases across different sources.
- **Metadata Extraction**: Extracts quality, language, season, episode, part/volume, and platform info.
- **Update Detection**: Identifies "Added" context (e.g., "Ep 8 Added", "Vol 3 Added").

## Parsing Pipeline

The parser follows a strict pipeline to process raw titles:

1.  **Normalization**: The input string is trimmed and cleaned of initial noise.
2.  **Type Classification**: Detects if the content is a `series` or `movie` based on keywords like "Season", "S01", "Episode", "Series".
3.  **Year Extraction**: Extracts the 4-digit year (19xx-20xx). Defaults to `unknown` if missing.
4.  **Display Title Extraction**:
    *   Identifies the "cutoff" point based on the first occurrence of Year, Season, or Episode markers.
    *   Extracts everything before this cutoff as the `display_title`.
    *   Cleans trailing separators (`-`, `|`, `:`) and specific platform keywords if they appear at the end.
5.  **Machine Title Construction** (Strict Identification):
    *   Converts to lowercase.
    *   Normalizes Roman numerals (e.g., "II" -> "2").
    *   Removes stopwords ("the", "a", "an").
    *   Removes all non-alphanumeric characters.
    *   This results in a `machine_title` used for grouping (e.g., "Gangs of Wasseypur Part - 2" -> `gangsofwasseypurpart2`).
6.  **Metadata Extraction**:
    *   **Season**: Parses specific season numbers or ranges (e.g., "Season 1-5").
    *   **Part/Volume**: Extracts part numbers, ensuring correct association for movies vs series.
    *   **Qualities**: Detects 480p, 720p, 1080p, 4K, etc.
    *   **Languages**: Detects Hindi, English, Dual Audio, etc.
7.  **Update Info**: Scans for "Added" context to determine if specific episodes or volumes were just added.
8.  **Canonical Key**: Combines `machine_title`, `year`, and `type` to form a unique ID.

## Usage

Open `index.html` in any modern web browser.

1.  **Enter Title**: Paste a raw title string into the textarea.
2.  **Parse**: Click "Parse Title" to see the JSON output and debug analysis.
3.  **Run Tests**: Click "Run Test Suite" to validate the parser against a set of real-world examples.

## Output Format

```json
{
  "display_title": "Stranger Things",
  "machine_title": "strangerthings",
  "canonical_key": "strangerthings|unknown|series",
  "type": "series",
  "year": "unknown",
  "season": [1, 2, 3, 4, 5],
  "update_info": {
    "episode_added": 8,
    "volume_added": null,
    "part_added": false,
    "complete": null
  },
  "languages": ["Hindi", "English", "Tamil", "Telugu"],
  "qualities": ["480p", "720p", "1080p"],
  "platform": "Netflix",
  "confidence": 0.9
}
```

## Development

- `parser.js`: Contains the core `TitleParser` class.
- `ui.js`: Handles DOM interaction and event listeners.
- `test_runner.js`: Node.js script for running tests via CLI (`node test_runner.js`).
