"use client";

import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { LoadingSpinner } from "../loading-spinner";

export function QRCodeBox() {
  const { data: qrCode, isLoading } = useQuery({
    queryKey: ["whatsapp-qr-code"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/qrcode`);
      const { data } = await res.json();
      return data?.qrCode ?? null;
    },
    refetchInterval: (data) => {
      return data.state.data === null ? false : 3000;
    },
    retry: false,
  });

  return (
    <div className="w-full h-[250px] border rounded-md p-4 bg-background flex flex-col items-center justify-center">
      <h2 className="text-sm font-semibold mb-2">QR Code</h2>

      {isLoading ? (
        <div className="flex items-center justify-center h-[calc(100%-20px)] w-full">
          <LoadingSpinner size={50} />
        </div>
      ) : qrCode ? (
        <QRCodeSVG value={qrCode} size={190} level="H" bgColor="transparent" />
      ) : (
        <p className="text-sm text-green-600 font-medium">
          WhatsApp conectado ✅
        </p>
      )}
    </div>
  );
}
