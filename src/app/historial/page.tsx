// src/app/historial/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowLeft, User, Calendar } from "lucide-react";

interface Huesped {
  id: string;
  nombre: string;
  documento: string;
  habitacion: string;
  piso: string;
  fechaIngreso: string;
  fechaSalida: string;
  montoPagado: number;
  estado: string;
}

export default function Historial() {
  const [historial, setHistorial] = useState<Huesped[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "huespedes"), (snapshot) => {
      const lista: Huesped[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Solo mostramos los que están INACTIVOS (los que se fueron)
        if (data.estado === "Inactivo") {
          lista.push({ id: doc.id, ...data } as Huesped);
        }
      });
      // Ordenar por fecha de salida (los más recientes primero)
      lista.sort((a, b) => new Date(b.fechaSalida).getTime() - new Date(a.fechaSalida).getTime());
      setHistorial(lista);
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800 font-semibold mr-6">
            <ArrowLeft size={20} className="mr-2" /> Volver
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Historial de Salidas</h1>
        </div>

        {cargando ? (
          <div className="text-center py-10 text-xl text-gray-500">Cargando historial...</div>
        ) : historial.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow text-center">
            <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No hay historial aún</h2>
            <p className="text-gray-500">Aquí aparecerán los huéspedes cuando se les dé salida.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-blue-900 text-white">
                    <th className="p-4 font-semibold">Huésped</th>
                    <th className="p-4 font-semibold">Documento</th>
                    <th className="p-4 font-semibold">Habitación</th>
                    <th className="p-4 font-semibold">Ingreso</th>
                    <th className="p-4 font-semibold">Salida</th>
                    <th className="p-4 font-semibold">Total Pagado</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((h) => (
                    <tr key={h.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                      <td className="p-4 font-medium text-gray-800 flex items-center gap-2">
                        <User size={18} className="text-gray-400"/> {h.nombre}
                      </td>
                      <td className="p-4 text-gray-600">{h.documento}</td>
                      <td className="p-4 text-gray-600">Piso {h.piso} - Hab. {h.habitacion}</td>
                      <td className="p-4 text-gray-600">{new Date(h.fechaIngreso).toLocaleDateString()}</td>
                      <td className="p-4 text-gray-600">{new Date(h.fechaSalida).toLocaleDateString()}</td>
                      <td className="p-4 text-green-600 font-bold">${h.montoPagado || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}