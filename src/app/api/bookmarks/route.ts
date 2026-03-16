import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { bookmarks } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/server/utils/jwt';

/**
 * GET /api/bookmarks
 * Get user's bookmarks
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access-token')?.value;
    const sessionId = cookieStore.get('cart-session')?.value;

    let userId: string | null = null;

    if (accessToken) {
      try {
        const payload = verifyJwt(accessToken);
        userId = payload.userId;
      } catch {
        // Invalid token
      }
    }

    let items: typeof bookmarks.$inferSelect[] = [];

    // For logged in users, get their bookmarks
    if (userId) {
      items = await db.query.bookmarks.findMany({
        where: eq(bookmarks.userId, userId),
      });
    }
    // Note: Guest bookmarks stored in localStorage on client side

    return NextResponse.json({
      items: items.map((item) => ({
        productId: item.productId,
        name: item.productName,
        price: parseFloat(String(item.productPrice) || '0'),
        image: item.productImage,
        addedAt: new Date(item.addedAt).getTime(),
      })),
    });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json({ items: [] });
  }
}

/**
 * POST /api/bookmarks
 * Add bookmark
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access-token')?.value;

    // For guest users, bookmarks are handled on client side via localStorage
    // Only logged in users can bookmark via API
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Please login to bookmark items', needsLogin: true },
        { status: 401 }
      );
    }

    let userId: string | null = null;
    try {
      const payload = verifyJwt(accessToken);
      userId = payload.userId;
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, name, price, image } = body;

    // Check if already bookmarked
    const existing = await db.query.bookmarks.findFirst({
      where: and(
        eq(bookmarks.userId, userId!),
        eq(bookmarks.productId, productId)
      ),
    });

    if (existing) {
      return NextResponse.json({ success: true, message: 'Already bookmarked' });
    }

    // Insert new bookmark
    await db.insert(bookmarks).values({
      userId: userId!,
      productId,
      productName: name,
      productPrice: String(price),
      productImage: image,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to add bookmark' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/bookmarks
 * Remove bookmark
 */
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access-token')?.value;

    // Guest users handle bookmarks via localStorage on client
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Please login' },
        { status: 401 }
      );
    }

    let userId: string | null = null;
    try {
      const payload = verifyJwt(accessToken);
      userId = payload.userId;
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID required' },
        { status: 400 }
      );
    }

    await db.delete(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, userId!),
          eq(bookmarks.productId, productId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to remove bookmark' },
      { status: 500 }
    );
  }
}
