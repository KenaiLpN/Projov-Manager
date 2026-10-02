/** Only explicitly authored business messages may be returned to the client. */
export class BusinessError extends Error {
  constructor(message: string, public readonly statusCode = 400) {
    super(message);
    this.name = "BusinessError";
  }
}
