Tungsten uses Cloudflare R2 for scalable, S3-compatible object storage. Based on your setup, here are the specific details for the `tungsten` bucket.

## 📁 1. Your Bucket Details
- **Bucket Name:** `tungsten`
- **Account ID:** `68c99f145ed0a247deda2665ff96e558`
- **S3 API Endpoint:** `https://68c99f145ed0a247deda2665ff96e558.r2.cloudflarestorage.com`
- **Public Dev URL:** `https://pub-06227780e70b4432aa8077acdf6ff173.r2.dev`

## 🛠️ 1. Create your R2 Bucket
1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **R2** in the sidebar.
3. Click **Create bucket**.
4. Name your bucket (e.g., `tungsten-storage`).
5. Choose **Standard** storage class and your preferred location.
6. Click **Create bucket**.

## 🔑 2. Generate API Credentials
To allow Tungsten to interact with your bucket, you need an API token with appropriate permissions.
1. In the R2 dashboard, click **Manage R2 API Tokens**.
2. Click **Create API token**.
3. Name your token (e.g., `Tungsten Backend Token`).
4. **Permissions:** Choose `Object Read & Write` or `Admin Read & Write`.
5. **TTL:** Set to `Forever` or your preferred duration.
6. Click **Create API Token**.

### What you need to save:
- **Access Key ID:** Used as `S3_ACCESS_KEY`
- **Secret Access Key:** Used as `S3_SECRET_KEY`
- **Account ID:** Found in the R2 dashboard overview.
- **S3 Endpoint URL:** Usually follows the format `https://<account_id>.r2.cloudflarestorage.com`.

## 🌐 3. Configure CORS (Cross-Origin Resource Sharing)
For frontend direct uploads (Uppy/Presigned URLs), you must set a CORS policy on your bucket.
1. Navigate to your bucket settings.
2. Find the **CORS Policy** section.
3. Add the following JSON:
```json
[
  {
    "AllowedOrigins": ["http://localhost:4000", "https://yourdomain.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposedHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

## 🔒 4. Environment Variables
Add these to your `backend/fastapi/.env`:

```env
S3_BUCKET="tungsten"
S3_ACCESS_KEY="your-access-key-id"
S3_SECRET_KEY="your-secret-access-key"
S3_ENDPOINT="https://68c99f145ed0a247deda2665ff96e558.r2.cloudflarestorage.com"
S3_REGION="auto"
S3_PUBLIC_URL="https://pub-06227780e70b4432aa8077acdf6ff173.r2.dev"
```

## 📎 Common Operations
- **PDF Uploads:** Handled via presigned URLs in the FastAPI backend.
- **CDN Access:** Use a Cloudflare worker or public R2 domain for asset delivery.
