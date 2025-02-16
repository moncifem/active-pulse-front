export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(new URL('/configuration', new URL(req.url).origin));
  }
} 