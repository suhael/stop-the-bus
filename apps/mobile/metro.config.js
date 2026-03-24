const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const fs = require("fs");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch all files within the monorepo so Metro picks up changes in packages/*
config.watchFolders = [monorepoRoot];

// Let Metro know where to resolve packages and node_modules from
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

/**
 * Custom resolver for monorepo workspace packages.
 *
 * Metro can struggle with symlinks created by npm/yarn workspaces.  Instead of
 * relying on the symlink at node_modules/@stop-the-bus/*, we resolve every
 * import that starts with "@stop-the-bus/" directly to the TypeScript source
 * files inside packages/*.
 *
 * Examples:
 *   @stop-the-bus/shared            → packages/shared/index.ts
 *   @stop-the-bus/shared/validators → packages/shared/validators.ts
 *   @stop-the-bus/shared/errors     → packages/shared/errors.ts
 */
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith("@stop-the-bus/")) {
    const parts = moduleName.split("/");
    // parts[0] = '@stop-the-bus', parts[1] = package name, parts[2..] = subpath
    const pkgName = parts[1]; // e.g. 'shared'
    const subpath = parts.slice(2).join("/"); // e.g. 'validators' or ''
    const pkgDir = path.resolve(monorepoRoot, "packages", pkgName);

    if (subpath) {
      // Try resolving the subpath as a TS/TSX file or index inside a folder
      const candidates = [
        path.resolve(pkgDir, `${subpath}.ts`),
        path.resolve(pkgDir, `${subpath}.tsx`),
        path.resolve(pkgDir, subpath, "index.ts"),
        path.resolve(pkgDir, subpath, "index.tsx"),
      ];
      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          return { filePath: candidate, type: "sourceFile" };
        }
      }
    }

    // Fall back to the package root (index.ts)
    const rootCandidates = [
      path.resolve(pkgDir, "index.ts"),
      path.resolve(pkgDir, "index.tsx"),
      path.resolve(pkgDir, "index.js"),
    ];
    for (const candidate of rootCandidates) {
      if (fs.existsSync(candidate)) {
        return { filePath: candidate, type: "sourceFile" };
      }
    }
  }

  // Default resolution for everything else
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
