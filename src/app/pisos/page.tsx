// src/app/pisos/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowLeft, Home, User, BedDouble } from "lucide-react";

interface Huesped {
  id: string;
  nombre: string;
  piso: string;
  habitacion: string;
  cama?: string;
  estado?: string;
}

export default function VistaPisos() {
  const [huespedes, setHuespedes] = useState<Huesped[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "huespedes"), (snapshot) => {
      const lista: Huesped[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.estado !== "Inactivo") {
          lista.push({ id: doc.id, ...data } as Huesped);
        }
      });
      setHuespedes(lista);
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  // Agrupar huéspedes por Piso y Habitación
  const pisosAgrupados: Record<string, Record<string, Huesped[]>> = {};
  
  huespedes.forEach((h) => {
    const piso = h.piso || "Sin Piso";
    const habitacion = h.habitacion || "Sin Habitación";
    
    if (!pisosAgrupados[piso]) pisosAgrupados[piso] = {};
    if (!pisosAgrupados[piso][habitacion]) pisosAgrupados[piso][habitacion] = [];
    
    pisosAgrupados[piso][habitacion].push(h);
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800 font-semibold mr-6">
            <ArrowLeft size={20} className="mr-2" /> Volver
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Vista de Pisos y Habitaciones</h1>
        </div>

        {cargando ? (
          <div className="text-center py-10 text-xl text-gray-500">Cargando mapa...</div>
        ) : Object.keys(pisosAgrupados).length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow text-center">
            <Home size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No hay habitaciones ocupadas</h2>
            <p className="text-gray-500">Registra un huésped para verlo aquí.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(pisosAgrupados).map(([piso, habitaciones]) => (
              <div key={piso} className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-600">
                <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
                  <Home size={28} /> Piso {piso}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(habitaciones).map(([habitacion, listaHuespedes]) => (
                    <div key={habitacion} className="border-2 border-red-200 bg-red-50 rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between items-center mb-3 border-b border-red-200 pb-2">
                        <h3 className="text-xl font-bold text-red-800">Habitación {habitacion}</h3>
                        <span className="bg-red-200 text-red-800 text-xs font-bold px-2 py-1 rounded">
                          Ocupada
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        {listaHuespedes.map((h) => (
                          <div key={h.id} className="flex items-start gap-2 text-gray-800">
                            <User size={18} className="mt-1 text-red-600 shrink-0" />
                            <div>
                              <p className="font-semibold">{h.nombre}</p>
                              {h.cama && (
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  <BedDouble size={14} /> Cama {h.cama}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}