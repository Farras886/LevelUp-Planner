import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/user/stats — Ambil UserStats user yang login
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stats = await prisma.userStats.findUnique({
      where: { user_id: session.user.id },
    });

    if (!stats) {
      return NextResponse.json({ error: "Stats tidak ditemukan" }, { status: 404 });
    }

    // Hitung jumlah task selesai hari ini
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const completedToday = await prisma.task.count({
      where: {
        user_id: session.user.id,
        status: "DONE",
        completed_at: { gte: todayStart, lte: todayEnd },
      },
    });

    return NextResponse.json({
      data: {
        ...stats,
        completed_today: completedToday,
      },
    });
  } catch (error) {
    console.error("GET /api/user/stats error:", error);
    return NextResponse.json({ error: "Gagal mengambil stats" }, { status: 500 });
  }
}
