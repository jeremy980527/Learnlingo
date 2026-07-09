"use client";

import { motion } from "framer-motion";
import { HeartCrack } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export function OutOfHeartsModal({
  open,
  onBackToMap,
}: {
  open: boolean;
  onBackToMap: () => void;
}) {
  return (
    <Modal
      open={open}
      onOpenChange={() => {}}
      title="生命值用完了！"
      description="休息一下，生命值會隨時間慢慢恢復，或明天再回來挑戰。"
      showCloseButton={false}
    >
      <div className="flex flex-col items-center gap-4 py-2">
        <motion.div
          animate={{ rotate: [0, -10, 10, -6, 0] }}
          transition={{ duration: 0.6 }}
        >
          <HeartCrack size={56} className="text-red-500" />
        </motion.div>
        <Button fullWidth onClick={onBackToMap}>
          返回學習地圖
        </Button>
      </div>
    </Modal>
  );
}
