"use client";

import Image from "next/image";
import { ChatWindow } from "../components/chat/chat-window";
import { CsvDropzone } from "../components/sidebar/csv-dropzone";
import { QRCodeBox } from "../components/sidebar/qrcode-box";

export default function Home() {
  return (
    <main className="flex h-screen overflow-hidden bg-background">
      <aside className="w-72 p-4 border-r bg-[#1d293d] flex flex-col gap-6 items-center">
        <div className="w-full flex justify-center">
          <Image
            src="/ezap-bulk.png"
            alt="EZap Bulk Logo"
            width={60}
            height={60}
            className="object-contain"
            priority
          />
        </div>

        <QRCodeBox />

        <CsvDropzone />
      </aside>

      <section className="flex-1 overflow-hidden">
        <ChatWindow />
      </section>
    </main>
  );
}
