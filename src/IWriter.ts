export interface IWriter {
    write(fileContents: string): void;
    finish(): void;
}