"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type BannerItem,
  type S3BannerConfig,
  MOCK_S3_BANNERS,
  fetchS3Banners,
} from "@/lib/s3-banners";

export interface UseBannerImagesResult {
  banners: BannerItem[];
  isLoading: boolean;
  isMockData: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook that decouples S3 banner fetching & state management from UI components.
 * Starts with initial mock data for instant SSR/hydration without layout shift,
 * and automatically syncs with S3/API when configured.
 */
export function useBannerImages(
  customConfig?: S3BannerConfig,
): UseBannerImagesResult {
  const [banners, setBanners] = useState<BannerItem[]>(MOCK_S3_BANNERS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMockData, setIsMockData] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadBanners = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchS3Banners(customConfig, signal);
        if (!signal?.aborted) {
          setBanners(result.items);
          setIsMockData(result.isMock);
        }
      } catch (err) {
        if (!signal?.aborted) {
          const message =
            err instanceof Error ? err.message : "Unable to load S3 banners";
          setError(message);
          // Graceful fallback to local mock banners
          setBanners(MOCK_S3_BANNERS);
          setIsMockData(true);
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [customConfig],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadBanners(controller.signal);
    return () => controller.abort();
  }, [loadBanners]);

  const refetch = useCallback(async () => {
    await loadBanners();
  }, [loadBanners]);

  return {
    banners,
    isLoading,
    isMockData,
    error,
    refetch,
  };
}
