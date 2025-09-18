import { NextResponse } from "next/server";
import { isAdminEmail, transactionsToCSV } from "@/lib/admin/auth";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/admin/actions/export-transactions - Export transactions to CSV
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email || !isAdminEmail(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const transactions = await prisma.betaling.findMany({
      select: {
        id: true,
        createdAt: true,
        bedrag: true,
        status: true,
        type: true,
        betalerId: true,
      },
      orderBy: { createdAt: "desc" },
      take: 1000, // Limit to last 1000 transactions
    });

    const csv = transactionsToCSV(transactions);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="transactions-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export transactions error:", error);
    return NextResponse.json(
      { error: "Failed to export transactions" },
      { status: 500 },
    );
  }
}
