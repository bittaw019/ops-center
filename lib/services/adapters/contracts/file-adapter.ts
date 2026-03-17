export type FileConnectionInput = {
  connectionProtocol: "SFTP" | "FTP" | "FTPS";
  host: string;
  port: number;
  username: string;
  authType: "password" | "ssh_key";
  encryptedSecret: string;
  encryptedSshKey?: string | null;
  rootPath: string;
};

export type RemoteFileNode = {
  path: string;
  name: string;
  kind: "file" | "dir";
  size: number;
  modifiedAt: string;
  permissions: string;
};

export type FileActionInput = {
  connection: FileConnectionInput;
  action: "LIST" | "UPLOAD" | "DOWNLOAD" | "RENAME" | "DELETE" | "MKDIR";
  path: string;
  targetPath?: string;
  contentBase64?: string;
};

export type FileActionResult = {
  success: boolean;
  message: string;
  nodes?: RemoteFileNode[];
  downloadContentBase64?: string;
};

export interface FileManagerAdapter {
  perform(input: FileActionInput): Promise<FileActionResult>;
}
