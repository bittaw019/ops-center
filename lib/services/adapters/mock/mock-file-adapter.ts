import type { FileActionInput, FileActionResult, FileManagerAdapter, RemoteFileNode } from "@/lib/services/adapters/contracts/file-adapter";

const demoNodes: RemoteFileNode[] = [
  {
    path: "/",
    name: "public",
    kind: "dir",
    size: 0,
    modifiedAt: new Date().toISOString(),
    permissions: "drwxr-xr-x"
  },
  {
    path: "/",
    name: "releases",
    kind: "dir",
    size: 0,
    modifiedAt: new Date().toISOString(),
    permissions: "drwxr-xr-x"
  },
  {
    path: "/",
    name: "README.md",
    kind: "file",
    size: 4096,
    modifiedAt: new Date().toISOString(),
    permissions: "-rw-r--r--"
  }
];

export class MockFileManagerAdapter implements FileManagerAdapter {
  async perform(input: FileActionInput): Promise<FileActionResult> {
    await new Promise((resolve) => setTimeout(resolve, 180));

    if (input.action === "LIST") {
      return {
        success: true,
        message: `Directory ${input.path} letta con successo`,
        nodes: demoNodes
      };
    }

    if (input.action === "DOWNLOAD") {
      return {
        success: true,
        message: "File pronto per download",
        downloadContentBase64: Buffer.from("File demo dal mock adapter").toString("base64")
      };
    }

    return {
      success: true,
      message: `Operazione ${input.action} completata su ${input.path}`
    };
  }
}
