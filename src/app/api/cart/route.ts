import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { cartItems } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/server/utils/jwt';

/**
 * GET /api/cart
 * Get user's cart
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
        // Invalid token, try session
      }
    }

    let items: typeof cartItems.$inferSelect[] = [];

    if (userId) {
      items = await db.query.cartItems.findMany({
        where: eq(cartItems.userId, userId),
      });
    } else if (sessionId) {
      items = await db.query.cartItems.findMany({
        where: eq(cartItems.sessionId, sessionId),
      });
    }

    return NextResponse.json({
      items: items.map((item) => ({
        productId: item.productId,
        name: item.productName,
        price: parseFloat(String(item.productPrice)),
        image: item.productImage,
        quantity: item.quantity,
      })),
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ items: [] });
  }
}

/**
 * POST /api/cart
 * Add item to cart
 */
export async function POST(request: NextRequest) {
  let sessionId: string | null = null;
  let userId: string | null = null;
  let shouldSetCookie = false;

  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access-token')?.value;
    sessionId = cookieStore.get('cart-session')?.value ?? null;

    // Create session ID for guest users if not exists
    if (!sessionId && !accessToken) {
      sessionId = crypto.randomUUID();
      shouldSetCookie = true;
    }

    if (accessToken) {
      try {
        const payload = verifyJwt(accessToken);
        userId = payload.userId;
      } catch {
        // Invalid token - continue with guest
      }
    }

    const body = await request.json();
    const { productId, name, price, image, quantity = 1 } = body;

    // Check if item already exists (for logged in user or guest)
    let existingItem = null;

    if (userId) {
      existingItem = await db.query.cartItems.findFirst({
        where: and(
          eq(cartItems.userId, userId),
          eq(cartItems.productId, productId)
        ),
      });
    } else if (sessionId) {
      existingItem = await db.query.cartItems.findFirst({
        where: and(
          eq(cartItems.sessionId, sessionId),
          eq(cartItems.productId, productId)
        ),
      });
    }

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      await db.update(cartItems)
        .set({ quantity: newQuantity, updatedAt: new Date() })
        .where(eq(cartItems.id, existingItem.id));
    } else {
      // Insert new item
      await db.insert(cartItems).values({
        userId,
        sessionId,
        productId,
        productName: name,
        productPrice: String(price),
        productImage: image,
        quantity,
      });
    }

    // Set session cookie for guest users
    const response = NextResponse.json({ success: true });
    if (shouldSetCookie && sessionId) {
      response.cookies.set('cart-session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart
 * Remove item from cart
 */
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID required' },
        { status: 400 }
      );
    }

    if (userId) {
      await db.delete(cartItems)
        .where(
          and(
            eq(cartItems.userId, userId),
            eq(cartItems.productId, productId)
          )
        );
    } else if (sessionId) {
      await db.delete(cartItems)
        .where(
          and(
            eq(cartItems.sessionId, sessionId),
            eq(cartItems.productId, productId)
          )
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json(
      { error: 'Failed to remove from cart' },
      { status: 500 }
    );
  }
}
