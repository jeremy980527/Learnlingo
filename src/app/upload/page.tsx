import { Dropzone } from "@/components/upload/dropzone";

export default function UploadPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-ink-900">上傳你的教材</h1>
        <p className="mt-2 text-base font-medium text-ink-500">
          講義、筆記、截圖都可以，AI 會自動幫你拆解成遊戲化的學習地圖
        </p>
      </div>

      <Dropzone />
    </div>
  );
}
