// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { UserPlus, Users, LogOut, Home, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [deudores, setDeudores] = useState(0);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "huespedes"), (snapshot) => {
      let count = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.estado !== "Inactivo" && data.saldoPendiente > 0) {
          count++;
        }
      });
      setDeudores(count);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-start mb-6">
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

        {/* ALERTA DE DEUDORES */}
        {deudores > 0 && (
          <Link href="/huespedes" className="block bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-8 shadow-sm hover:bg-red-200 transition">
            <div className="flex items-center gap-3">
              <AlertCircle size={28} />
              <div>
                <p className="font-bold text-lg">¡Atención! Hay {deudores} huésped(es) con saldo pendiente.</p>
                <p className="text-sm">Haz clic aquí para ir a la lista y registrar pagos.</p>
              </div>
            </div>
          </Link>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/checkin" className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition border-t-4 border-blue-500 flex flex-col items-center justify-center text-center group">
            <div className="bg-blue-100 p-4 rounded-full mb-4 group-hover:bg-blue-200 transition">
              <UserPlus size={40} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Nuevo Huésped</h2>
            <p className="text-gray-500 mt-2 text-sm">Ingresar datos, firmar y guardar ficha.</p>
          </Link>

          <Link href="/huespedes" className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition border-t-4 border-green-500 flex flex-col items-center justify-center text-center group">
            <div className="bg-green-100 p-4 rounded-full mb-4 group-hover:bg-green-200 transition">
              <Users size={40} className="text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Huéspedes</h2>
            <p className="text-gray-500 mt-2 text-sm">Ver lista, pagos y salidas.</p>
          </Link>

          <Link href="/pisos" className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition border-t-4 border-purple-500 flex flex-col items-center justify-center text-center group">
            <div className="bg-purple-100 p-4 rounded-full mb-4 group-hover:bg-purple-200 transition">
              <Home size={40} className="text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Ver Pisos</h2>
            <p className="text-gray-500 mt-2 text-sm">Mapa visual de habitaciones y camas.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}