import aioboto3
from core.config import settings
from contextlib import asynccontextmanager

class S3Storage:
    def __init__(self):
        self.session = aioboto3.Session()
        self.bucket = settings.S3_BUCKET
        self.endpoint_url = settings.S3_ENDPOINT
        self.access_key = settings.S3_ACCESS_KEY
        self.secret_key = settings.S3_SECRET_KEY
        self.region = settings.S3_REGION

    @asynccontextmanager
    async def get_client(self):
        async with self.session.client(
            "s3",
            endpoint_url=self.endpoint_url,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            region_name=self.region,
        ) as client:
            yield client

    async def generate_presigned_url(self, file_key: str, content_type: str, expires_in: int = 300):
        async with self.get_client() as client:
            url = await client.generate_presigned_url(
                "put_object",
                Params={
                    "Bucket": self.bucket,
                    "Key": file_key,
                    "ContentType": content_type,
                },
                ExpiresIn=expires_in,
            )
            return url

    async def get_public_url(self, file_key: str):
        if settings.S3_PUBLIC_URL:
            return f"{settings.S3_PUBLIC_URL}/{file_key}"
        return f"{self.endpoint_url}/{self.bucket}/{file_key}"

s3_storage = S3Storage()
