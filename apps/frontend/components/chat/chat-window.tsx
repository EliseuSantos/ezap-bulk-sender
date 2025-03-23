"use client";

import { Button } from "@/components/ui/button";
import { CornerDownLeft, RefreshCcw } from "lucide-react";
import { useRef, useState } from "react";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
  // ChatBubbleAction,
} from "./chat-bubble";
import { ChatInput } from "./chat-input";
import { ChatMessageList } from "./chat-message-list";
import { useMutation } from "@tanstack/react-query";
import { useContacts } from "@/context/contacts-context";

// const ChatIcons = [
// 	{ icon: RefreshCcw, label: "Refresh" },
// ];

export function ChatWindow() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const { contacts } = useContacts();
  const messagesRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const sendMessageMutation = useMutation({
    mutationFn: async ({
      phone,
      message,
    }: { phone: string; message: string }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/send-message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
          },
          body: JSON.stringify({ phone, message }),
        },
      );

      if (!res.ok) {
        throw new Error("Erro ao enviar mensagem");
      }

      return res.json();
    },
  });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsGenerating(true);

    await sendMessageMutation.mutateAsync({
      phone: process.env.NEXT_DEFAULT_NUMBER as string,
      message: input,
    });

    try {
      for (const contact of contacts) {
        await new Promise((res) => setTimeout(res, 300));
      }
    } catch (err) {
      console.error("Erro ao enviar mensagens:", err);
    }

    setIsGenerating(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isGenerating || !input) return;
      setIsGenerating(true);
      onSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const handleActionClick = async (action: string, messageIndex: number) => {
    if (action === "Refresh") {
      setIsGenerating(true);
      try {
        // await reload();
      // biome-ignore lint/correctness/noUnreachable: <explanation>
              } catch (error) {
        console.error("Error reloading:", error);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div ref={messagesRef} className="flex-1 overflow-y-auto px-4 py-6">
        <ChatMessageList>
          {messages.length === 0 && (
            <div className="w-full bg-background shadow-sm border rounded-lg p-8 flex flex-col gap-2">
              <h1 className="font-bold">Welcome to EZ Zap Bulk 👋</h1>
              <p className="text-muted-foreground text-sm">
                You can upload contacts using the sidebar and start sending
                messages.
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <ChatBubble
              key={index}
              variant={message?.["role"] === "user" ? "sent" : "received"}
            >
              <ChatBubbleAvatar
                src=""
                fallback={message?.["role"] === "user" ? "👤" : "🤖"}
              />
              <ChatBubbleMessage>
                {/* {message?.['role'] === "api" &&
									messages.length - 1 === index && (
										<div className="flex items-center mt-1.5 gap-1">
											{!isGenerating &&
												ChatIcons.map((icon, i) => {
													const Icon = icon.icon;
													return (
														<ChatBubbleAction
															key={i}
															variant="outline"
															className="size-5"
															icon={<Icon className="size-3" />}
															onClick={() =>
																handleActionClick(icon.label, index)
															}
														/>
													);
												})}
										</div>
									)} */}
              </ChatBubbleMessage>
            </ChatBubble>
          ))}

          {isGenerating && (
            <ChatBubble variant="received">
              <ChatBubbleAvatar src="" fallback="🤖" />
              <ChatBubbleMessage isLoading />
            </ChatBubble>
          )}
        </ChatMessageList>
      </div>

      <div className="w-full px-4 pb-4">
        <form
          ref={formRef}
          onSubmit={onSubmit}
          className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
        >
          <ChatInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type your message here..."
            className="rounded-lg bg-background border-0 shadow-none focus-visible:ring-0"
          />
          <div className="flex items-center p-3 pt-0">
            <Button
              disabled={!input}
              type="submit"
              size="sm"
              className="ml-auto gap-1.5"
            >
              Send Message
              <CornerDownLeft className="size-3.5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
