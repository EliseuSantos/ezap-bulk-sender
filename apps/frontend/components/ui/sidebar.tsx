"use client";

import { Button } from "@/components/ui/button";
import { Plus, Settings, Users, MessageCircle } from "lucide-react";
import Link from "next/link";

export function Sidebar() {
  return (
    <div className="h-screen w-64 bg-muted/40 border-r flex flex-col justify-between p-4 fixed left-0 top-0 z-10">
      <div>
        <Button variant="outline" className="w-full mb-4 justify-start gap-2">
          <Plus className="w-4 h-4" />
          Nova conversa
        </Button>

        <nav className="space-y-1">
          <Link href="/chat">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <MessageCircle className="w-4 h-4" />
              Chat
            </Button>
          </Link>

          <Link href="/contacts">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Users className="w-4 h-4" />
              Contatos
            </Button>
          </Link>

          <Link href="/settings">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Settings className="w-4 h-4" />
              Configurações
            </Button>
          </Link>
        </nav>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Powered by shadcn/ui
      </p>
    </div>
  );
}
