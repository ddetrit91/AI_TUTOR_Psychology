import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { auth } from "@/lib/auth/server";
import {
  createJournalAttachment,
  listJournalAttachments,
  deleteJournalAttachment,
} from "@/lib/db";
import {
  uploadJournalObject,
  getJournalObjectUrl,
  deleteJournalObject,
} from "@/lib/storage";

export async function GET() {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const rows = await listJournalAttachments(userId);

    const attachments = await Promise.all(
      rows.map(async (row) => {
        const url = await getJournalObjectUrl(row.object_key, 3600);
        return {
          id: row.id,
          title: row.title,
          notes: row.notes,
          fileName: row.file_name,
          mimeType: row.mime_type,
          sizeBytes: row.size_bytes,
          objectKey: row.object_key,
          url,
          createdAt: row.created_at,
        };
      })
    );

    return NextResponse.json({ attachments });
  } catch (error: any) {
    console.error("GET /api/journal error:", error);
    return NextResponse.json(
      { error: "Failed to load journal attachments", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = String(formData.get("title") || "Заметка состояния");
    const notes = formData.get("notes") ? String(formData.get("notes")) : undefined;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const id = randomUUID();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const objectKey = `journal/${userId}/${id}-${safeName}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || "application/octet-stream";

    await uploadJournalObject(objectKey, buffer, contentType);

    const row = await createJournalAttachment(userId, {
      id,
      title,
      notes,
      objectKey,
      fileName: file.name,
      mimeType: contentType,
      sizeBytes: buffer.length,
    });

    const url = await getJournalObjectUrl(objectKey, 3600);

    return NextResponse.json({
      attachment: {
        id: row.id,
        title: row.title,
        notes: row.notes,
        fileName: row.file_name,
        mimeType: row.mime_type,
        sizeBytes: row.size_bytes,
        objectKey: row.object_key,
        url,
        createdAt: row.created_at,
      },
    });
  } catch (error: any) {
    console.error("POST /api/journal error:", error);
    return NextResponse.json(
      { error: "Failed to upload journal attachment", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const objectKey = await deleteJournalAttachment(userId, id);
    if (objectKey) {
      await deleteJournalObject(objectKey);
    }

    return NextResponse.json({ deleted: Boolean(objectKey), id });
  } catch (error: any) {
    console.error("DELETE /api/journal error:", error);
    return NextResponse.json(
      { error: "Failed to delete journal attachment", details: error.message },
      { status: 500 }
    );
  }
}
