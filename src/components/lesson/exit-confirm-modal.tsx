"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export function ExitConfirmModal({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="要離開這個關卡嗎？"
      description="目前的進度不會被保留，你需要重新開始這一關。"
    >
      <div className="flex gap-3">
        <Button variant="outline" fullWidth onClick={() => onOpenChange(false)}>
          繼續學習
        </Button>
        <Button variant="danger" fullWidth onClick={onConfirm}>
          離開關卡
        </Button>
      </div>
    </Modal>
  );
}
