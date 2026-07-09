"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProcessingAnimation } from "@/components/upload/processing-animation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  fetchMaterialStatus,
  retryMaterialProcessing,
} from "@/lib/api/upload-material";

export default function MaterialProcessingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);

  const { data, error, refetch } = useQuery({
    queryKey: ["material-status", params.id],
    queryFn: () => fetchMaterialStatus(params.id),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "READY" || status === "FAILED") return false;
      return 2000;
    },
  });

  useEffect(() => {
    if (data?.status === "READY") {
      const timeout = setTimeout(() => {
        router.push(`/materials/${params.id}/map`);
      }, 900);
      return () => clearTimeout(timeout);
    }
  }, [data?.status, params.id, router]);

  async function handleRetry() {
    setIsRetrying(true);
    try {
      await retryMaterialProcessing(params.id);
      await refetch();
    } finally {
      setIsRetrying(false);
    }
  }

  if (error) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full text-center">
          <AlertTriangle className="mx-auto text-red-500" size={40} />
          <p className="mt-3 font-bold text-ink-700">
            {error instanceof Error ? error.message : "無法取得處理狀態"}
          </p>
          <Button className="mt-4" fullWidth onClick={() => refetch()}>
            重新整理
          </Button>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <motion.div
          className="h-10 w-10 rounded-full border-4 border-ink-200 border-t-primary-500"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
        />
      </div>
    );
  }

  if (data.status === "FAILED") {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full text-center">
          <AlertTriangle className="mx-auto text-red-500" size={40} />
          <h2 className="mt-3 text-xl font-extrabold text-ink-900">
            處理教材時發生錯誤
          </h2>
          <p className="mt-2 text-sm font-medium text-ink-500">
            {data.errorMessage ?? "未知錯誤，請重新嘗試。"}
          </p>
          <div className="mt-5 flex gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={() => router.push("/upload")}
            >
              重新上傳
            </Button>
            <Button fullWidth isLoading={isRetrying} onClick={handleRetry}>
              再試一次
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 items-center justify-center px-4">
      <ProcessingAnimation key={data.status} status={data.status} />
    </div>
  );
}
