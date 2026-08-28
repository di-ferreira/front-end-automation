"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/loading-spinner";

interface Channel {
  id: number;
  name: string;
  slug: string;
  color: string | null;
}

interface ChannelSelectorProps {
  channels: Channel[];
  value: number | null;
  onChange: (channelId: number) => void;
  disabled?: boolean;
  loading?: boolean;
}

function getChannelColor(color: string | null): string {
  if (!color) return "bg-muted";
  return color;
}

export function ChannelSelector({
  channels,
  value,
  onChange,
  disabled,
  loading,
}: ChannelSelectorProps) {
  if (loading) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <LoadingSpinner label="Carregando canais..." />
      </div>
    );
  }

  return (
    <Select
      value={value?.toString() ?? ""}
      onValueChange={(val) => onChange(Number(val))}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Selecione um canal" />
      </SelectTrigger>
      <SelectContent>
        {channels.map((ch) => (
          <SelectItem key={ch.id} value={ch.id.toString()}>
            <span className="flex items-center gap-2">
              <span
                className="inline-block size-2.5 rounded-full"
                style={{ backgroundColor: getChannelColor(ch.color) }}
                aria-hidden="true"
              />
              {ch.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
