// make.fun's frontend dossier library for Node 22: one file, the Node standard library only, erasable TypeScript, so
// it runs as-is under `node main.ts` with no flags, no build and no install. Copy it to vendor/makefun-frontend.ts in
// your repository (a copy anywhere else counts as lines you wrote) and import it:
//
//   import { buildDossier } from './vendor/makefun-frontend.ts';
//   writeFileSync('/output/dossier.json', buildDossier('/output', {
//     text_max_bytes: 163840,
//     screenshots: { max: 3, max_bytes: 262144 },
//     app_max_files: 993,
//     app_max_bytes: 16777216,
//   }));
//
// The bounty's scorer runs this same file, byte for byte, on what you hand in, and requires your dossier.json to
// equal what buildDossier writes from your app/ and screenshots/.
//
// An entry hands in app/ (the frontend as static files a browser opens at app/index.html: the page, its ES modules or
// scripts, CSS, images and fonts, third-party code vendored under a directory named vendor, no build step at serve
// time) and screenshots/ (3 PNG or JPEG captures of the running app, the first by name the cover). Nothing of
// either is read over the network: buildDossier only reads files.
//
//   readAppTree(dir, caps)      every file and directory under app/, by path with its bytes and its class (source,
//                               vendored or asset) and the totals; caps (each optional) bound how many entries it
//                               holds, how many bytes and how long a path may be
//   classifyAppPath(path)       'source', 'vendored' or 'asset', by the bounty's source rule: a file under app/ with
//                               extension .html, .js, .mjs, .css or .json, not under a directory named vendor and not
//                               named *.min.js/*.min.mjs/*.min.css
//   htmlFacts(html)             a page's <script>, <link>, <base>, <style>, <img>, <source>, <video>, <audio> and
//                               <iframe> tags and its <script type="importmap"> blocks, in document order
//   importMapOf(facts)          the page's one import map, parsed (imports and scopes, a null value allowed), or why
//                               it has none
//   cleanRef(ref)               a reference as a browser's URL parser reads it: spaces and C0 controls trimmed, tabs
//                               and newlines dropped, a backslash a slash
//   isLocalRef(ref)             whether a reference names a path of the app's own server: no scheme and no leading //
//                               (relative like `main.js` or `../x`, or root-relative like `/x`)
//   refOrigin(ref)              an absolute reference's origin (`https://make.fun`), `data:` for a data URL, the scheme
//                               for any other; null for a local reference
//   isPathSpecifier(name)       whether a module specifier is a path in JavaScript's sense (/, ./ or ../): a bare name
//                               such as "preact" is not, whatever the import map then makes of it
//   resolveAppPath(ref, from)   the path under app/ a local reference names from the referring file's path ('' for
//                               app/ itself); null when it is not local, names nothing or climbs out of app/
//   pageBaseFrom(facts, page)   the path a page's relative references resolve from: its first <base href>, when that
//                               is local, else the page's own path
//   importMapMatch(map, name, from)
//                               what an import map says for a bare specifier imported from `from`: the scoped or
//                               top-level entry, found false when neither maps it, value null when a null entry blocks it
//   resolveModule(name, from, map, base)
//                               the path under app/ a module specifier names: a path specifier from the importer, a bare
//                               one through the import map (its value from the page's base); null for none
//   sourceImports(text)         a module's static import and export-from specifiers, in source order, by a lexical scan
//   dynamicImports(text)        a script's import() calls, in source order: each literal specifier, or null for a
//                               computed one, by the same scan
//   cssReferences(css)          a stylesheet's @import references, its url()s inside @font-face (fonts) and every other
//                               url(), in source order, by a lexical scan
//   importOrder(sources, facts) the source JS files in the order a depth-first walk of static imports reaches them from
//                               index.html's scripts
//   cssOrder(sources, facts)    the source CSS files in the order index.html's stylesheets and their @imports reach them
//   firstLoadOf(tree, facts, textOf)
//                               the files a first load of index.html fetches (see the Load block below), the files its
//                               literal import() calls fetch later, and the references of each naming no file of app/
//   sourceUrls(sources)         every absolute http(s)/ws(s) URL the source files name, each with the files naming it
//   canonicalJson(value)        JSON with sorted keys and no spaces: one spelling per value
//   buildDossier(dir, caps)     the dossier (makefun/dossier/v1) of an entry directory, as canonical JSON bytes
//
// The bounty's scorer gives buildDossier { text_max_bytes, screenshots: { max, max_bytes }, app_max_files,
// app_max_bytes, app_path_max_bytes } from its gate.json. Only text_max_bytes shapes the bytes; the other caps only
// refuse, so passing them too makes your program fail where the scorer would.
//
// THE TEXT. A "## Load" block, then "## Sources".
//
// The Load block, every figure computed from the files alone:
//   Totals: first load N files, G bytes gzip-9 (R raw); later by import() N files, G bytes gzip-9; whole app F files,
//   B bytes                                            the totals below on one line, first (a judge's outline of the
//                                                     text keeps a `Totals:` line and drops the per-file lines)
//   First load: N files, R bytes raw, G bytes gzip-9
//     app/<path>: r bytes raw, g bytes gzip-9          one line a file, in the order the walk reaches it (48 listed,
//                                                     the rest summed on one line)
//     not in app/: <reference> (<where>)               a first-load reference naming no file of app/: another origin's
//                                                     URL or a missing file (16 listed, the rest counted)
//   Loaded later by import(): N files, R bytes raw, G bytes gzip-9
//     app/<path>: r bytes raw, g bytes gzip-9          each file a dynamic import() of a literal path fetches after the
//                                                     first load, in the order reached (48 listed, the rest summed)
//     not in app/: <reference> (<where>)               such an import(), or a later module's import, naming no file of
//                                                     app/ (16 listed, the rest counted)
//     and n import() calls of a computed specifier, not followed (the first in app/<path>)    when there are any
//   Whole app: F files, B bytes; D directories
//   Source files: n (b bytes)
//   Vendored files: n (b bytes)                        then up to 24 of them by path and bytes
//   Assets: <ext> n (b bytes), ...                     by extension
//   URLs in the source: n                              then each distinct absolute URL (64 listed, each cut at 200
//                                                     characters) with the first source file naming it
// The first load is index.html; then, in document order, each <link> whose rel is stylesheet (not alternate) and the
// stylesheets its @imports reach, depth first, with the font files their @font-face url()s name (a data: URL is no
// file); each modulepreload and the modules its static imports reach; each preload; then the @imports and @font-face
// fonts of each inline <style>; then each <script src> of a JavaScript type (a module's static imports walked depth
// first) and each inline module script's static imports. A file counts once, where first reached. Relative references
// resolve from the page's base (pageBaseFrom), CSS url()s from their stylesheet, module specifiers from the importing
// module or through the import map. Raw bytes are the file's size; gzip-9 bytes are node:zlib gzipSync at level 9 of
// its bytes. Loaded later is what dynamic import() fetches after the first load: each import() call whose specifier is
// a string literal or a template literal with no substitution (dynamicImports), in each first-load .js or .mjs file in
// first-load order and then each inline script of a JavaScript type, resolved as a static import is, walked depth
// first (the module, its static imports, then its own import() calls), a file of the first load never counted again;
// an import() of any other specifier is counted, not followed. A URL is any http://, https://, ws:// or wss:// run in a
// source file up to a space, quote, bracket, brace, backslash, `$`, comma or semicolon, trailing . : ! ? dropped; URLs
// in vendored files and assets are not read.
//
// The sources: index.html first, then the source JS files importOrder reaches, then the source CSS files cssOrder
// reaches, then every other source file by path. A source file is one under app/ with extension .html, .js, .mjs,
// .css or .json, not under a directory named vendor and not named *.min.js, *.min.mjs or *.min.css; every other file is
// counted in the Load block, never shown. Each source follows a header line naming its path and bytes (`### app/<path>
// (<b> bytes)`: no line count, so a judge's outline of a many-file app fits every file's heading) and then its text in
// a fence. The text holds at most caps.text_max_bytes UTF-8 bytes: every source that fits goes in whole,
// in that order; the first that does not goes in up to its last complete line that fits (its fence closed, then a line
// naming how many of its lines are not shown), or not at all when not one line fits; nothing follows it but a last
// line naming how many whole files and how many bytes of source were left out. The text is deterministic: the same
// directory writes the same bytes.
//
// buildDossier throws DossierError on input it refuses: no app/ directory (or not a directory), an entry of app/ that
// is a symbolic link or other special file, app/ past app_max_files entries or app_max_bytes bytes or a path past
// app_path_max_bytes, no app/index.html (or one over 1 MiB), screenshots/ holding no image or more than the count cap,
// an image over its byte cap or neither PNG nor JPEG, and a text cap too small for the Load block and the cut line.
// Its error's `limit` names the cap that refused, when a cap did.
//
// The scorer's references row parses every module with acorn (its vendored copy), so the scans here are lexical only:
// they follow what a file says it loads for the dossier's figures and order, and their refusals are the gate's
// business, not this file's.

import { createHash } from 'node:crypto';
import { lstatSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

/** The dossier schema buildDossier writes (contracts/dossier.ts DOSSIER_SCHEMA). */
export const DOSSIER_SCHEMA = 'makefun/dossier/v1';
/** The most bytes a dossier holds (contracts/dossier.ts DOSSIER_MAX_BYTES): 4 MiB. */
export const DOSSIER_MAX_BYTES = 4 * 1024 * 1024;
/** The most images a dossier holds (contracts/dossier.ts DOSSIER_MAX_IMAGES). */
export const DOSSIER_MAX_IMAGES = 8;
/** The app's page: the one file app/ must hold. */
export const INDEX_HTML = 'index.html';
/** The most bytes app/index.html may be. */
export const INDEX_HTML_MAX_BYTES = 1024 * 1024;
/** The longest path an app file may have by default, in UTF-8 bytes relative to app/. */
export const APP_PATH_MAX_BYTES = 1000;
/** The gzip level the Load block's compressed sizes are taken at. */
export const GZIP_LEVEL = 9;
/** How many first-load files the Load block lists before it sums the rest. */
const FIRST_LOAD_LISTED = 48;
/** How many first-load references naming no file of app/ the Load block lists before it counts the rest. */
const MISSING_LISTED = 16;
/** How many vendored files the Load block lists by path before it counts the rest. */
const VENDORED_LISTED = 24;
/** How many distinct URLs the Load block lists before it counts the rest, and how much of each it shows. */
const URLS_LISTED = 64;
const URL_SHOWN_CHARS = 200;

/** The extensions a source file has (lowercase; matched case-insensitively). */
export const SOURCE_EXTENSIONS = ['html', 'js', 'mjs', 'css', 'json'] as const;
/** The names a generated file has: not source, whatever its extension. */
const GENERATED_NAME = /\.min\.(?:js|mjs|css)$/i;
/** A source file's extension. */
const SOURCE_NAME = new RegExp(`\\.(?:${SOURCE_EXTENSIONS.join('|')})$`, 'i');
/** A JavaScript file the import walks read. */
const MODULE_NAME = /\.(?:js|mjs)$/i;
/** A stylesheet the @import walks read. */
const CSS_NAME = /\.css$/i;
/** The <script type> values a browser runs as JavaScript ('' is no type attribute); 'module' runs as a module. */
const JS_TYPE = /^(?:|module|(?:text|application)\/(?:x-)?(?:javascript|ecmascript)(?:1\.[0-5])?|text\/jscript|text\/livescript)$/;

/** What a file under app/ is to the dossier: a source it shows, a vendored file or an asset it only counts. */
export type AppFileClass = 'source' | 'vendored' | 'asset';

/** A cap buildDossier or readAppTree refuses on, named in DossierError.limit. */
export type DossierLimit = 'text_max_bytes' | 'screenshots.max' | 'screenshots.max_bytes' | 'app_max_files' | 'app_max_bytes' | 'app_path_max_bytes';

/** Why buildDossier writes no dossier for a directory: its caps, its app/ or its screenshots. */
export class DossierError extends Error {
  /** The caller's cap the input is past (a key of DossierCaps or AppCaps), or null when the input itself is at fault. */
  readonly limit: DossierLimit | null;
  constructor(message: string, limit: DossierLimit | null = null) {
    super(message);
    this.name = 'DossierError';
    this.limit = limit;
  }
}

/**
 * What readAppTree is held to, each cap absent for none.
 *   app_max_files        the files and directories under app/, summed (one entry each, as the platform counts them).
 *   app_max_bytes        the files' sizes, summed (the bytes app/ costs, its directories costing none).
 *   app_path_max_bytes   each path's length in UTF-8 bytes, relative to app/ (APP_PATH_MAX_BYTES when absent).
 */
export interface AppCaps {
  app_max_files?: number;
  app_max_bytes?: number;
  app_path_max_bytes?: number;
}

/** One file under app/. */
export interface AppFile {
  /** POSIX path relative to app/, like `src/main.js`. */
  path: string;
  /** Its size in bytes. */
  bytes: number;
  cls: AppFileClass;
}

/** Every entry under app/, walked once. */
export interface AppTree {
  /** The files, in code-unit path order. */
  files: AppFile[];
  /** The directories' paths, in code-unit order (app/ itself is '' and not listed). */
  directories: string[];
  /** How many entries app/ holds: files and directories, the platform's own count. */
  count: number;
  /** The files' sizes, summed. */
  totalBytes: number;
}

/**
 * What buildDossier is held to: the text's cap in UTF-8 bytes, the screenshot caps (at most `max` images, each at
 * most `max_bytes` bytes; the dossier's own DOSSIER_MAX_IMAGES and DOSSIER_MAX_BYTES hold either way) and
 * readAppTree's caps. A bounty's gate.json may be passed whole: buildDossier reads only these keys.
 */
export interface DossierCaps {
  text_max_bytes: number;
  screenshots?: { max: number; max_bytes: number };
  app_max_files?: number;
  app_max_bytes?: number;
  app_path_max_bytes?: number;
}

// ---------------------------------------------------------------- bytes

const utf8 = new TextDecoder('utf-8');

/** Code-unit order, the same on every machine (localeCompare is not). */
const byCodeUnit = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

const sha256Hex = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');

const byteLength = (s: string): number => Buffer.byteLength(s, 'utf8');

/** A string's bytes as text, for display only (invalid UTF-8 becomes U+FFFD). */
const text = (bytes: Uint8Array): string => utf8.decode(bytes);

/** The size of `bytes` gzipped at GZIP_LEVEL by node:zlib. */
export function gzipBytes(bytes: Uint8Array): number {
  return gzipSync(bytes, { level: GZIP_LEVEL }).length;
}

/** Lines of a source: 0 when empty, else its newlines plus one for a last line with none. */
function lineCount(bytes: Uint8Array): number {
  if (bytes.length === 0) return 0;
  let n = 0;
  for (const b of bytes) if (b === 0x0a) n++;
  return bytes[bytes.length - 1] === 0x0a ? n : n + 1;
}

/** A Markdown fence one backtick longer than the longest run in `body`, three at least. */
function fenceFor(body: string): string {
  let longest = 0;
  for (const run of body.match(/`+/g) ?? []) longest = Math.max(longest, run.length);
  return '`'.repeat(Math.max(3, longest + 1));
}

/** The fence's language tag for a source path. */
function languageOf(path: string): string {
  const ext = /\.([A-Za-z0-9]+)$/.exec(path)?.[1]?.toLowerCase() ?? '';
  if (ext === 'mjs' || ext === 'js') return 'js';
  if (ext === 'html') return 'html';
  if (ext === 'css') return 'css';
  if (ext === 'json') return 'json';
  return 'text';
}

// ---------------------------------------------------------------- the app tree

/** A caller's AppCaps checked: each given cap a whole number, each missing one Infinity (the path cap its default). */
function appCapsOf(caps: AppCaps, who: string): Record<keyof AppCaps, number> {
  const out = { app_max_files: Infinity, app_max_bytes: Infinity, app_path_max_bytes: APP_PATH_MAX_BYTES };
  for (const k of ['app_max_files', 'app_max_bytes', 'app_path_max_bytes'] as const) {
    const v = caps[k] as unknown;
    if (v === undefined) continue;
    if (typeof v !== 'number' || !Number.isSafeInteger(v) || v < 0) throw new TypeError(`${who}: caps.${k} must be a whole number, not ${String(v)}`);
    out[k] = v;
  }
  return out;
}

/**
 * What a path under app/ is to the dossier: a source it shows, or a vendored file or an asset it only counts. A
 * generated name (*.min.js, *.min.mjs, *.min.css) and any path under a directory named vendor are vendored, a source
 * extension outside them is source, and everything else is an asset.
 */
export function classifyAppPath(path: string): AppFileClass {
  const segs = path.split('/');
  const base = segs[segs.length - 1] ?? '';
  const dirs = segs.slice(0, -1);
  if (dirs.includes('vendor') || GENERATED_NAME.test(base)) return 'vendored';
  return SOURCE_NAME.test(base) ? 'source' : 'asset';
}

/**
 * Every file and directory under app/, by path, with each file's bytes and class and the totals. Symbolic links and
 * other special files are refused, as are more than caps.app_max_files entries, more than caps.app_max_bytes bytes in
 * the files, and a path longer than caps.app_path_max_bytes. Nothing is read but the directory listing. Throws
 * DossierError.
 */
export function readAppTree(appDir: string, caps: AppCaps = {}): AppTree {
  const c = appCapsOf(caps, 'readAppTree');
  let root;
  try {
    root = lstatSync(appDir);
  } catch {
    throw new DossierError('app/: no such directory: an app is a directory of static files, its index.html at its root');
  }
  if (!root.isDirectory()) throw new DossierError('app/: not a directory (an app is a directory of static files)');
  const files: AppFile[] = [];
  const directories: string[] = [];
  const stack: string[] = [''];
  let count = 0;
  let totalBytes = 0;
  while (stack.length > 0) {
    const rel = stack.pop()!;
    let entries;
    try {
      entries = readdirSync(rel === '' ? appDir : join(appDir, rel), { withFileTypes: true });
    } catch (err) {
      throw new DossierError(`app/${rel === '' ? '' : `${rel}/`}: cannot be read (${(err as Error).message})`);
    }
    for (const e of entries) {
      const path = rel === '' ? e.name : `${rel}/${e.name}`;
      const pathBytes = byteLength(path);
      if (pathBytes > c.app_path_max_bytes) {
        throw new DossierError(`app/${path}: a path of ${pathBytes} bytes, over the ${c.app_path_max_bytes} allowed (app_path_max_bytes)`, 'app_path_max_bytes');
      }
      const shown = `app/${path}`;
      let st;
      try {
        st = lstatSync(join(appDir, path));
      } catch {
        throw new DossierError(`${shown}: cannot be read`);
      }
      count++;
      if (count > c.app_max_files) {
        throw new DossierError(`app/: holds more than the ${c.app_max_files} files and directories allowed (app_max_files)`, 'app_max_files');
      }
      if (st.isDirectory()) {
        directories.push(path);
        stack.push(path);
      } else if (st.isFile()) {
        totalBytes += st.size;
        if (totalBytes > c.app_max_bytes) {
          throw new DossierError(`app/: its files come to more than the ${c.app_max_bytes} bytes allowed (app_max_bytes)`, 'app_max_bytes');
        }
        files.push({ path, bytes: st.size, cls: classifyAppPath(path) });
      } else {
        throw new DossierError(`${shown}: a symbolic link or special file (app/ holds plain files and directories only)`);
      }
    }
  }
  files.sort((a, b) => byCodeUnit(a.path, b.path));
  directories.sort(byCodeUnit);
  return { files, directories, count, totalBytes };
}

/** app/index.html's bytes from the tree, or why there is none: refused when missing, a directory or over the cap. */
function readIndexHtml(appDir: string, tree: AppTree): Uint8Array {
  const file = tree.files.find((f) => f.path === INDEX_HTML);
  if (file === undefined) {
    if (tree.directories.includes(INDEX_HTML)) throw new DossierError('buildDossier: app/index.html: a directory, not the page');
    throw new DossierError('buildDossier: app/index.html: no such file: an app is a directory of static files, its index.html at its root');
  }
  if (file.bytes > INDEX_HTML_MAX_BYTES) throw new DossierError(`buildDossier: app/index.html: ${file.bytes} bytes, over the ${INDEX_HTML_MAX_BYTES} a page may be`);
  try {
    return new Uint8Array(readFileSync(join(appDir, INDEX_HTML)));
  } catch (err) {
    throw new DossierError(`buildDossier: app/index.html: cannot be read (${(err as Error).message})`);
  }
}

// ---------------------------------------------------------------- the page

/** One <script> of a page. */
export interface HtmlScript {
  /** Its src attribute, or null when the script is inline. */
  src: string | null;
  /** Its type attribute, lowercased and trimmed ('' when absent). */
  type: string;
  /** An inline script's text ('' for one with src or no body). */
  text: string;
}

/** One <link> of a page. */
export interface HtmlLink {
  href: string;
  /** Its rel attribute, lowercased and trimmed. */
  rel: string;
  /** Its as attribute, lowercased and trimmed ('' when absent). */
  as: string;
}

/** One element of a page that loads a file through its src attribute: <img>, <source>, <video>, <audio> or <iframe>. */
export interface HtmlResource {
  /** Its tag name, lowercased. */
  tag: string;
  /** Its src attribute. */
  src: string;
}

/** The tags whose src is a resource the page loads. */
const RESOURCE_TAGS = ['img', 'source', 'video', 'audio', 'iframe'] as const;

/** One <script type="importmap"> block. */
export interface HtmlImportMap {
  /** Its JSON, when it parsed. */
  value: unknown;
  /** Why its text is not JSON, or null. */
  error: string | null;
}

/** What a page's markup says about the files it loads. */
export interface HtmlFacts {
  /** Every <script> but import maps, in document order. */
  scripts: HtmlScript[];
  /** Every <link> with an href, in document order. */
  links: HtmlLink[];
  /** Every <img>, <source>, <video>, <audio> and <iframe> with a src, in document order. */
  resources: HtmlResource[];
  /** Every <script type="importmap">, in document order. */
  importMaps: HtmlImportMap[];
  /** Every <base href>'s href, in document order (a browser uses the first). */
  bases: string[];
  /** Every inline <style>'s text, in document order. */
  styles: string[];
}

/** HTML's whitespace (a CR is one too: the parser reads CR LF and a lone CR as LF). */
const HTML_SPACE = /[\t\n\f\r ]/;

/**
 * The index of `>` ending a tag whose name starts at `from` (or whose name was read up to `from`), as a browser's
 * tokenizer finds it: the rest of the name, then attributes, a quote quoting only where an attribute's value starts
 * (`<p class=a'b>` ends at its first `>`); -1 when the tag never ends.
 */
function tagEnd(html: string, from: number): number {
  const n = html.length;
  const space = (k: number): boolean => k < n && HTML_SPACE.test(html[k]!);
  let i = from;
  while (i < n && !HTML_SPACE.test(html[i]!) && html[i] !== '/' && html[i] !== '>') i++;
