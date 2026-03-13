import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system/legacy";
import * as VideoThumbnails from "expo-video-thumbnails";
import { useEffect, useState } from "react";

type Status = "idle" | "loading" | "ready" | "error";

type Options = {
  downloadHeaders?: Record<string, string>;
  timeoutMs?: number;
};

const DEFAULT_TIMES = [0, 500, 1000, 2000];

const withTimeout = async <T>(p: Promise<T>, timeoutMs: number) => {
  return await Promise.race<T>([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("THUMB_TIMEOUT")), timeoutMs)
    ),
  ]);
};

const getCachedVideoPath = async (url: string) => {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    url
  );

  return `${FileSystem.cacheDirectory}video_${hash}.mp4`;
};

const ensureLocalVideo = async (
  url: string,
  headers?: Record<string, string>
) => {
  if (url.startsWith("file://")) return url;

  const dest = await getCachedVideoPath(url);
  const info = await FileSystem.getInfoAsync(dest);

  if (info.exists && info.isDirectory === false) {
    return dest;
  }

  const res = await FileSystem.downloadAsync(
    url,
    dest,
    headers ? { headers } : undefined
  );
  return res.uri; // file://...
};

export const useVideoThumbnail = (
  videoUrl: string | null,
  options?: Options
) => {
  const [thumbUri, setThumbUri] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!videoUrl) {
        setThumbUri(null);
        setStatus("idle");
        return;
      }

      setStatus("loading");
      setThumbUri(null);

      try {
        const localUri = await withTimeout(
          ensureLocalVideo(videoUrl, options?.downloadHeaders),
          options?.timeoutMs ?? 12_000
        );

        if (cancelled) return;

        let lastError: unknown = null;

        for (const time of DEFAULT_TIMES) {
          try {
            const { uri } = await withTimeout(
              VideoThumbnails.getThumbnailAsync(localUri, { time }),
              options?.timeoutMs ?? 12_000
            );

            if (cancelled) return;

            setThumbUri(uri);
            setStatus("ready");
            return;
          } catch (e) {
            lastError = e;
          }
        }

        throw lastError ?? new Error("THUMB_FAILED");
      } catch (e: any) {
        if (cancelled) return;

        console.log("[useVideoThumbnail] error", {
          videoUrl,
          message: e?.message,
          code: e?.code,
        });

        setThumbUri(null);
        setStatus("error");
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [videoUrl, options?.downloadHeaders, options?.timeoutMs]);

  return { thumbUri, status };
};
