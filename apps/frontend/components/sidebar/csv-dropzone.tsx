"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Badge } from "@/components/ui/badge";
import { type Contact, useContacts } from "@/context/contacts-context";

export function CsvDropzone() {
  const { contacts, setContacts, clearContacts } = useContacts();
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      const reader = new FileReader();

      setError(null);
      clearContacts();

      reader.onload = () => {
        const text = reader.result as string;

        const lines = text
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line !== "");

        const header = lines[0]?.toLowerCase();
        if (header !== "name,phone") {
          setError("Cabeçalho inválido. Esperado: name,phone");
          return;
        }

        const parsedContacts: Contact[] = lines.slice(1).map((line) => {
          const [name, phone] = line.split(",");
          return {
            name: name?.trim(),
            phone: phone?.trim(),
            status: "pending" as const, // Default status
          };
        });

        setContacts(parsedContacts);
      };

      reader.onerror = () => {
        setError("Erro ao ler o arquivo CSV.");
      };

      reader.readAsText(file);
    },
    [setContacts, clearContacts],
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
  });

  return (
    <div className="space-y-4 p-4">
      <div
        {...getRootProps()}
        className="border-dashed border-2 border-gray-300 rounded-md p-6 text-center cursor-pointer bg-white hover:bg-muted/20 transition"
      >
        <input {...getInputProps()} />
        <p className="text-sm text-muted-foreground font-mono">
          Clique ou arraste um CSV aqui
        </p>
      </div>

      {contacts.length > 0 && (
        <Badge className="bg-blue-100 text-blue-800">
          {contacts.length} contato(s) carregado(s)
        </Badge>
      )}

      {error && <p className="text-sm text-red-500 font-mono">⚠️ {error}</p>}
    </div>
  );
}
