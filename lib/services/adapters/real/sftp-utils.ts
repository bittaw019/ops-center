import path from "path";

export function resolveRemotePath(rootPath: string, requestedPath: string) {
  const normalizedRoot = path.posix.normalize(rootPath);
  const relativeInput = requestedPath.replace(/^\/+/, "");
  const joined = path.posix.normalize(path.posix.join(normalizedRoot, relativeInput));

  if (!joined.startsWith(normalizedRoot)) {
    throw new Error("Path non valido: traversal non consentito");
  }

  return joined;
}

export function toUnixPermissions(mode?: number) {
  if (typeof mode !== "number") return "---------";
  const perms = [6, 3, 0].map((shift) => {
    const val = (mode >> shift) & 0b111;
    return `${val & 4 ? "r" : "-"}${val & 2 ? "w" : "-"}${val & 1 ? "x" : "-"}`;
  });

  return `-${perms.join("")}`;
}
