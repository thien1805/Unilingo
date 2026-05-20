"""
Audio storage helpers for local files and S3-compatible providers.
"""
import asyncio
import os
import tempfile
from contextlib import contextmanager
from pathlib import Path
from urllib.parse import quote


def use_s3_storage(settings) -> bool:
    return settings.AUDIO_STORAGE_BACKEND.strip().lower() == "s3"


def _local_upload_root(settings) -> Path:
    root = Path(settings.LOCAL_UPLOAD_DIR)
    if not root.is_absolute():
        root = Path.cwd() / root
    root.mkdir(parents=True, exist_ok=True)
    return root


def _s3_client(settings):
    import boto3
    from botocore.config import Config

    endpoint_url = settings.S3_ENDPOINT_URL.strip() or None
    addressing_style = settings.S3_ADDRESSING_STYLE.strip().lower() or "auto"
    client_config = Config(
        signature_version="s3v4",
        s3={"addressing_style": addressing_style},
    )
    return boto3.client(
        "s3",
        endpoint_url=endpoint_url,
        aws_access_key_id=settings.S3_ACCESS_KEY,
        aws_secret_access_key=settings.S3_SECRET_KEY,
        region_name=settings.S3_REGION or "auto",
        config=client_config,
    )


def _s3_uri(bucket: str, key: str) -> str:
    return f"s3://{bucket}/{quote(key, safe='/')}"


def _parse_s3_uri(uri: str) -> tuple[str, str]:
    raw = uri.removeprefix("s3://")
    bucket, key = raw.split("/", 1)
    return bucket, key


async def save_upload_file(file, filename: str, settings, subdir: str = "") -> str:
    """Persist an UploadFile and return a local path or s3:// URI."""
    safe_filename = filename.replace("/", "_").replace("\\", "_")

    if use_s3_storage(settings):
        prefix = settings.S3_AUDIO_PREFIX.strip("/")
        parts = [prefix]
        if subdir:
            parts.append(subdir.strip("/"))
        parts.append(safe_filename)
        key = "/".join(part for part in parts if part)

        client = _s3_client(settings)
        content_type = file.content_type or "audio/mp4"
        await file.seek(0)

        def upload():
            file.file.seek(0)
            client.upload_fileobj(
                file.file,
                settings.S3_BUCKET_NAME,
                key,
                ExtraArgs={"ContentType": content_type},
            )

        await asyncio.to_thread(upload)
        return _s3_uri(settings.S3_BUCKET_NAME, key)

    upload_dir = _local_upload_root(settings)
    if subdir:
        upload_dir = upload_dir / subdir
        upload_dir.mkdir(parents=True, exist_ok=True)

    local_path = upload_dir / safe_filename
    await file.seek(0)
    import aiofiles

    async with aiofiles.open(local_path, "wb") as buffer:
        while chunk := await file.read(1024 * 1024):
            await buffer.write(chunk)
    return str(local_path)


@contextmanager
def materialize_audio_file(audio_ref: str, settings):
    """
    Yield a local file path for either local audio or s3:// audio.

    Azure Speech and Groq's file upload both need a local file handle, so workers
    download S3 objects into an isolated temp directory for the scoring call.
    """
    if not audio_ref.startswith("s3://"):
        yield audio_ref
        return

    bucket, key = _parse_s3_uri(audio_ref)
    suffix = Path(key).suffix or ".m4a"
    client = _s3_client(settings)

    with tempfile.TemporaryDirectory(prefix="unilingo-audio-") as temp_dir:
        local_path = os.path.join(temp_dir, f"answer{suffix}")
        client.download_file(bucket, key, local_path)
        yield local_path
