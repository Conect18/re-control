// src/app/page.tsx
"use client"; // Ahora es un componente de cliente

import Link from "next/link";
import { UserPlus, Users, LogOut } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-4xl font-bold text-blue-900 mb-2">Residencia Tacuarembó</h1>
            <p className="text-gray-600 text-lg">Panel de Control - RE.Control</p>
            <p className="text-sm text-blue-600 font-semibold mt-1">Usuario: {user?.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition font-semibold"
          >
            <LogOut size={20} /> Cerrar Sesión
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/checkin" className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition border-t-4 border-blue-500 flex flex-col items-center justify-center text-center group">
            <div className="bg-blue-100 p-4 rounded-full mb-4 group-hover:bg-blue-200 transition">
              <UserPlus size={48} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Registrar Nuevo Huésped</h2>
            <p className="text-gray-500 mt-2">Ingresar datos, firmar y guardar ficha.</p>
          </Link>

          <Link href="/huespedes" className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition border-t-4 border-green-500 flex flex-col items-center justify-center text-center group">
            <div className="bg-green-100 p-4 rounded-full mb-4 group-hover:bg-green-200 transition">
              <Users size={48} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Huéspedes Actuales</h2>
            <p className="text-gray-500 mt-2">Ver lista, registrar pagos y salidas.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}