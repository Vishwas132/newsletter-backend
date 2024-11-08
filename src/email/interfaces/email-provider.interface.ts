export interface EmailProvider {
  send(to: string, subject: string, content: string): Promise<void>;
}
