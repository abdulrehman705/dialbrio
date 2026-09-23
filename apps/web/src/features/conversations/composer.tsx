"use client";

import * as React from "react";
import { CircleAlert, Mail, MessageSquare, Send } from "lucide-react";
import type { Conversation } from "@dialbrio/types";
import { useSendMessage } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Mono } from "@/components/ui/mono";
import { Tooltip } from "@/components/ui/tooltip";
import { cn, formatPhone } from "@/lib/utils";
import { smsSegments } from "./channels";

export function Composer({ conversation }: { conversation: Conversation }) {
  const [body, setBody] = React.useState("");
  const send = useSendMessage(conversation.id);
  React.useEffect(() => {
    setBody("");
    send.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id]);

  const segments = smsSegments(body);
  const trimmed = body.trim();

  const submit = () => {
    if (!trimmed || send.isPending) return;
    send.mutate(trimmed, {
      onSuccess: () => {
        setBody("");
        document.getElementById("sms-composer")?.focus();
      },
    });
  };

  return (
    <form
      className="border-t border-border bg-surface p-3"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      {send.isError && (
        <p role="alert" className="mb-2 flex items-center gap-1.5 text-xs text-danger-text">
          <CircleAlert className="size-3.5" aria-hidden /> Message not sent. Your text is still here, try again.
        </p>
      )}
      <div role="radiogroup" aria-label="Channel" className="mb-2 flex items-center gap-1">
        <button type="button" role="radio" aria-checked className="inline-flex h-7 items-center gap-1.5 rounded-[5px] bg-surface-sunken px-2.5 text-xs font-medium text-fg max-lg:h-10">
          <MessageSquare className="size-3.5" aria-hidden /> SMS
        </button>
        <Tooltip content="Email from the inbox is planned. Replies will thread here next to SMS and calls.">
          <span tabIndex={0} className="rounded-[5px]">
            <button type="button" role="radio" aria-checked={false} disabled className="inline-flex h-7 items-center gap-1.5 rounded-[5px] px-2.5 text-xs text-fg-muted max-lg:h-10">
              <Mail className="size-3.5" aria-hidden /> Email <span className="font-mono text-[10px]">planned</span>
            </button>
          </span>
        </Tooltip>
      </div>
      <label htmlFor="sms-composer" className="sr-only">
        Message {conversation.contactName}
      </label>
      <Textarea
        id="sms-composer"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
          }
        }}
        rows={2}
        placeholder={`Text ${conversation.contactName.split(" ")[0]}…`}
        className="max-h-40 min-h-16 resize-none border-border bg-surface-sunken"
        aria-describedby="sms-composer-meta"
      />
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <p id="sms-composer-meta" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-muted">
          <span>
            Sending from <Mono className="text-fg-secondary">{formatPhone(conversation.numberUsed)}</Mono>
          </span>
          <span className={cn("tabular", segments > 2 && "text-warning-text")}>
            {body.length} chars · {segments} {segments === 1 ? "segment" : "segments"}
          </span>
          <span className="max-md:hidden">Enter to send · Shift+Enter for a new line</span>
        </p>
        <Button type="submit" variant="primary" size="sm" className="ml-auto max-lg:h-11" disabled={!trimmed} loading={send.isPending}>
          {!send.isPending && <Send />} {send.isPending ? "Sending" : "Send"}
        </Button>
      </div>
    </form>
  );
}
