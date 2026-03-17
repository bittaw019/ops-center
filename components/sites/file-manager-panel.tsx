"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { RemoteFileNode } from "@/lib/services/adapters/contracts/file-adapter";

function toBase64(content: string) {
  return btoa(unescape(encodeURIComponent(content)));
}

function fromBase64(base64: string) {
  return decodeURIComponent(escape(atob(base64)));
}

function fileNameFromPath(targetPath: string) {
  return targetPath.split("/").filter(Boolean).pop() ?? "download.bin";
}

function joinPath(basePath: string, name: string) {
  const cleanBase = basePath === "/" ? "" : basePath.replace(/\/+$/, "");
  return `${cleanBase}/${name}`.replace(/\/+/g, "/");
}

function parentPath(currentPath: string) {
  const parts = currentPath.split("/").filter(Boolean);
  if (parts.length === 0) return "/";
  return `/${parts.slice(0, -1).join("/")}` || "/";
}

function breadcrumbParts(currentPath: string) {
  const parts = currentPath.split("/").filter(Boolean);
  const items: { label: string; path: string }[] = [{ label: "root", path: "/" }];

  parts.forEach((part, index) => {
    items.push({
      label: part,
      path: `/${parts.slice(0, index + 1).join("/")}`
    });
  });

  return items;
}

export function FileManagerPanel({ siteId }: { siteId: string }) {
  const [currentPath, setCurrentPath] = useState("/");
  const [nodes, setNodes] = useState<RemoteFileNode[]>([]);
  const [selectedPath, setSelectedPath] = useState<string>("");
  const [renameTarget, setRenameTarget] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [search, setSearch] = useState("");

  const [editorPath, setEditorPath] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const filteredNodes = useMemo(() => {
    if (!search.trim()) return nodes;
    const q = search.toLowerCase();
    return nodes.filter((node) => node.name.toLowerCase().includes(q));
  }, [nodes, search]);

  async function execute(action: string, payload: Record<string, unknown>) {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/sites/${siteId}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage(data?.message ?? "Operazione fallita");
        return null;
      }

      setMessage(data?.result?.message ?? "Operazione completata");
      return data?.result ?? null;
    } catch {
      setMessage("Errore di rete durante operazione file");
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function loadDirectory(path: string) {
    const result = await execute("LIST", { path });
    if (!result) return;

    setCurrentPath(path);
    setNodes(result.nodes ?? []);
    setSelectedPath("");
  }

  useEffect(() => {
    if (!loading && nodes.length === 0) {
      void loadDirectory(currentPath);
    }
  }, []);

  async function openEditor(path: string) {
    const result = await execute("DOWNLOAD", { path });
    if (!result?.downloadContentBase64) return;

    try {
      const content = fromBase64(result.downloadContentBase64);
      setEditorPath(path);
      setEditorContent(content);
      setEditorOpen(true);
    } catch {
      setMessage("File non testuale o encoding non supportato");
    }
  }

  async function saveEditor() {
    if (!editorPath) return;

    const result = await execute("UPLOAD", {
      path: editorPath,
      contentBase64: toBase64(editorContent)
    });

    if (result) {
      await loadDirectory(currentPath);
    }
  }

  async function downloadFile(path: string) {
    const result = await execute("DOWNLOAD", { path });
    if (!result?.downloadContentBase64) return;

    const fileName = fileNameFromPath(path);
    const link = document.createElement("a");
    link.href = `data:application/octet-stream;base64,${result.downloadContentBase64}`;
    link.download = fileName;
    link.click();
  }

  async function uploadFile(file: File) {
    const targetPath = joinPath(currentPath, file.name);
    const reader = new FileReader();

    reader.onload = async () => {
      const raw = String(reader.result ?? "");
      const base64 = raw.split(",")[1];
      if (!base64) {
        setMessage("Errore lettura file locale");
        return;
      }

      const result = await execute("UPLOAD", {
        path: targetPath,
        contentBase64: base64
      });

      if (result) {
        await loadDirectory(currentPath);
      }
    };

    reader.onerror = () => {
      setMessage("Errore lettura file locale");
    };

    reader.readAsDataURL(file);
  }

  async function createFolder() {
    const name = newFolderName.trim();
    if (!name) return;

    const result = await execute("MKDIR", { path: joinPath(currentPath, name) });
    if (result) {
      setNewFolderName("");
      await loadDirectory(currentPath);
    }
  }

  async function deleteSelected() {
    if (!selectedPath) return;

    const confirmed = window.confirm(`Confermi eliminazione di ${selectedPath}?`);
    if (!confirmed) return;

    const result = await execute("DELETE", { path: selectedPath });
    if (result) {
      setSelectedPath("");
      await loadDirectory(currentPath);
    }
  }

  async function renameSelected() {
    if (!selectedPath || !renameTarget.trim()) return;

    const result = await execute("RENAME", { path: selectedPath, targetPath: renameTarget.trim() });
    if (result) {
      setRenameTarget("");
      setSelectedPath("");
      await loadDirectory(currentPath);
    }
  }

  return (
    <div className="space-y-4">
      <div className="panel space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {breadcrumbParts(currentPath).map((item) => (
            <button
              key={item.path}
              type="button"
              className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800"
              onClick={() => loadDirectory(item.path)}
              disabled={loading}
            >
              {item.label}
            </button>
          ))}
          <Button type="button" variant="secondary" onClick={() => loadDirectory(parentPath(currentPath))} disabled={loading || currentPath === "/"}>
            Su
          </Button>
          <Button type="button" onClick={() => loadDirectory(currentPath)} disabled={loading}>
            {loading ? "Caricamento..." : "Aggiorna"}
          </Button>
        </div>

        <div className="grid gap-2 md:grid-cols-3">
          <Input placeholder="Cerca file/cartella" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Input placeholder="Nuova cartella" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} />
          <Button type="button" variant="secondary" onClick={createFolder} disabled={loading || !newFolderName.trim()}>
            Crea cartella
          </Button>
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          <Input
            placeholder="Rinomina: nuovo path completo (es: /dir/nuovo.txt)"
            value={renameTarget}
            onChange={(e) => setRenameTarget(e.target.value)}
          />
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={renameSelected} disabled={loading || !selectedPath || !renameTarget.trim()}>
              Rinomina selezionato
            </Button>
            <Button type="button" variant="danger" onClick={deleteSelected} disabled={loading || !selectedPath}>
              Elimina selezionato
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="rounded border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800">
            Carica file
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadFile(file);
                e.currentTarget.value = "";
              }}
              disabled={loading}
            />
          </label>
          <span className="text-xs text-slate-500">Upload su cartella corrente: {currentPath}</span>
        </div>
      </div>

      <div className="panel p-4">
        <h3 className="mb-2 text-sm font-semibold">Contenuto cartella</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-400">
              <tr>
                <th className="py-2">Nome</th>
                <th className="py-2">Tipo</th>
                <th className="py-2">Permessi</th>
                <th className="py-2">Size</th>
                <th className="py-2">Modificato</th>
                <th className="py-2">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredNodes.map((node) => {
                const fullPath = joinPath(currentPath, node.name);
                const selected = selectedPath === fullPath;

                return (
                  <tr
                    key={`${node.path}-${node.name}`}
                    className={`border-t border-slate-800 ${selected ? "bg-slate-800/40" : ""}`}
                    onClick={() => setSelectedPath(fullPath)}
                  >
                    <td className="py-2 font-medium text-slate-200">{node.name}</td>
                    <td className="py-2">{node.kind}</td>
                    <td className="py-2">{node.permissions}</td>
                    <td className="py-2">{node.size}</td>
                    <td className="py-2">{new Date(node.modifiedAt).toLocaleString("it-IT")}</td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-1">
                        {node.kind === "dir" ? (
                          <Button type="button" variant="ghost" onClick={() => loadDirectory(fullPath)} disabled={loading}>Apri</Button>
                        ) : (
                          <>
                            <Button type="button" variant="ghost" onClick={() => openEditor(fullPath)} disabled={loading}>Modifica</Button>
                            <Button type="button" variant="ghost" onClick={() => downloadFile(fullPath)} disabled={loading}>Download</Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredNodes.length === 0 ? <p className="pt-3 text-sm text-slate-500">Nessun elemento trovato.</p> : null}
      </div>

      {editorOpen ? (
        <div className="panel space-y-2 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Editor file: {editorPath}</h3>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => setEditorOpen(false)} disabled={loading}>Chiudi</Button>
              <Button type="button" onClick={saveEditor} disabled={loading}>Salva file</Button>
            </div>
          </div>
          <Textarea value={editorContent} onChange={(e) => setEditorContent(e.target.value)} rows={18} className="font-mono text-xs" />
        </div>
      ) : null}

      {message ? <p className="text-sm text-slate-300">{message}</p> : null}
    </div>
  );
}
