import fs from "node:fs";
import { promises as fsp } from "node:fs";
import { Readable } from "node:stream";

import { mimeForFile, resolveWithinOutputDir } from "@/lib/assets";
import { auth } from "@/auth";

type RouteContext = { params: Promise<{ path?: string[] }> };

function notFound() {
  return new Response("Arquivo não encontrado", { status: 404 });
}

export async function GET(request: Request, context: RouteContext) {
  if (!(await auth())?.user) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { path: segments = [] } = await context.params;
  const filePath = resolveWithinOutputDir(segments);
  if (!filePath) {
    return new Response("Caminho inválido", { status: 400 });
  }

  let stat;
  try {
    stat = await fsp.stat(filePath);
  } catch {
    return notFound();
  }
  if (!stat.isFile()) return notFound();

  const mime = mimeForFile(filePath) ?? "application/octet-stream";
  const fileName = segments[segments.length - 1] ?? "arquivo";
  const download = new URL(request.url).searchParams.get("download");
  const baseHeaders: Record<string, string> = {
    "Content-Type": mime,
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, max-age=3600",
    ...(download
      ? {
          "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
        }
      : {}),
  };

  // Range: essencial para seek em players de vídeo/áudio
  const rangeHeader = request.headers.get("range");
  if (rangeHeader) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
    let start: number | undefined;
    let end: number | undefined;

    if (match) {
      const [, rawStart, rawEnd] = match;
      if (rawStart === "" && rawEnd !== "") {
        // sufixo: últimos N bytes
        start = Math.max(0, stat.size - Number(rawEnd));
        end = stat.size - 1;
      } else {
        start = Number(rawStart || 0);
        end = rawEnd ? Math.min(Number(rawEnd), stat.size - 1) : stat.size - 1;
      }
    }

    if (!match || start === undefined || start >= stat.size || start > (end ?? 0)) {
      return new Response(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${stat.size}` },
      });
    }

    const stream = Readable.toWeb(
      fs.createReadStream(filePath, { start, end }),
    ) as unknown as ReadableStream<Uint8Array>;
    return new Response(stream, {
      status: 206,
      headers: {
        ...baseHeaders,
        "Content-Range": `bytes ${start}-${end}/${stat.size}`,
        "Content-Length": String(end! - start! + 1),
      },
    });
  }

  const stream = Readable.toWeb(
    fs.createReadStream(filePath),
  ) as unknown as ReadableStream<Uint8Array>;
  return new Response(stream, {
    headers: { ...baseHeaders, "Content-Length": String(stat.size) },
  });
}

export async function HEAD(request: Request, context: RouteContext) {
  const response = await GET(request, context);
  return new Response(null, {
    status: response.status,
    headers: response.headers,
  });
}
