export class AppError extends Error {
  title: string;

  constructor(title = "Error", message: string) {
    super(message);
    this.title = title;
    this.name = "AppError";
  }
}
