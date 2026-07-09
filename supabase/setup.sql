-- 在 Supabase 專案的 SQL Editor 貼上並執行這份腳本。
-- 用途：建立教材上傳用的 Storage bucket，並設定 RLS 政策，
-- 讓每個使用者只能存取自己資料夾（{user_id}/...）底下的檔案。
-- 注意：資料庫的資料表本身（users/materials/units/...）是由 Prisma migrate 建立，
--      應用程式一律透過 Prisma 的直連連線存取，不經過 PostgREST，因此不需要在資料表上開 RLS。

-- 1. 建立 private bucket
insert into storage.buckets (id, name, public)
values ('materials', 'materials', false)
on conflict (id) do nothing;

-- 2. 允許登入使用者上傳檔案到「自己的資料夾」
create policy "Users can upload to their own folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'materials'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. 允許登入使用者讀取/下載自己資料夾裡的檔案（後端背景處理流程需要）
create policy "Users can read their own files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'materials'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. 允許登入使用者刪除自己的檔案（之後若要加「刪除教材」功能會用到）
create policy "Users can delete their own files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'materials'
  and (storage.foldername(name))[1] = auth.uid()::text
);
