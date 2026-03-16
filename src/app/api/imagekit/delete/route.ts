import { NextRequest, NextResponse } from "next/server";
import imagekit from "@/lib/imagkit-server";

export async function DELETE(req: NextRequest) {
  try {
    let fileId: string | undefined;

    // Try to parse JSON body
    try {
      const body = await req.json();
      fileId = body.fileId;
    } catch {
      fileId = req.nextUrl.searchParams.get("fileId") || undefined;
    }

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 },
      );
    }

    await imagekit.deleteFile(fileId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting image from ImageKit:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 },
    );
  }
}
