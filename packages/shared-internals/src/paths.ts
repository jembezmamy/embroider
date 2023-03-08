import { relative, isAbsolute, dirname, join, basename, resolve } from 'path';
import type Package from './package';

// by "explicit", I mean that we want "./local/thing" instead of "local/thing"
// because
//     import "./local/thing"
// has a different meaning than
//     import "local/thing"
//
export function explicitRelative(fromDir: string, toFile: string) {
  let result = join(relative(fromDir, dirname(toFile)), basename(toFile));
  if (!isAbsolute(result) && !result.startsWith('.')) {
    result = './' + result;
  }
  if (isAbsolute(toFile) && result.endsWith(toFile)) {
    // this prevents silly "relative" paths like
    // "../../../../../Users/you/projects/your/stuff" when we could have just
    // said "/Users/you/projects/your/stuff". The silly path isn't incorrect,
    // but it's unnecessarily verbose.
    return toFile;
  }

  // windows supports both kinds of path separators but webpack wants relative
  // paths to use forward slashes.
  return result.replace(/\\/g, '/');
}

// given a list like ['.js', '.ts'], return a regular expression for files ending
// in those extensions.
export function extensionsPattern(extensions: string[]): RegExp {
  return new RegExp(`(${extensions.map(e => `${e.replace('.', '\\.')}`).join('|')})$`, 'i');
}

export function unrelativize(pkg: Package, specifier: string, fromFile: string) {
  if (pkg.packageJSON.exports) {
    throw new Error(`unsupported: classic ember packages cannot use package.json exports`);
  }
  return resolve(dirname(fromFile), specifier).replace(pkg.root, pkg.name);
}
