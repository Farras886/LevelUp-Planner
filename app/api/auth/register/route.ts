import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/services/user.service";
import { registerSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validasi input dengan Zod
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validasi gagal",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, username, password } = parsed.data;

    const user = await createUser(email, username, password);

    return NextResponse.json(
      {
        message: "Registrasi berhasil",
        user: { id: user.id, email: user.email, username: user.username },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Email sudah terdaftar") {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    console.error("[REGISTER ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
