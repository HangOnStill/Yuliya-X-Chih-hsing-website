declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    PUBLIC_READ?: string;
    EDITOR_EMAILS?: string;
  }
}
