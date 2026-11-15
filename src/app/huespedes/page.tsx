// src/app/huespedes/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowLeft, User, CreditCard, LogOut, Printer } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface Huesped {
  id: string;
  nombre: string;
  documento: string;
  habitacion: string;
  telefono: string;
  montoPagar: number;
  estadoPago: string;
  fechaIngreso: string;
  firma: string;
}

export default function ListaHuespedes() {
  const [huespedes, setHuespedes] = useState<Huesped[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Temporizador de seguridad: si en 5 segundos no cargó, mostramos error
    const timer = setTimeout(() => {
      if (cargando) {
        setCargando(false);
        setError(true);
      }
    }, 5000);

    const unsubscribe = onSnapshot(
      collection(db, "huespedes"), 
      (snapshot) => {
        clearTimeout(timer);
        const lista: Huesped[] = [];
        snapshot.forEach((doc) => {
          lista.push({ id: doc.id, ...doc.data() } as Huesped);
        });
        lista.sort((a, b) => new Date(b.fechaIngreso).getTime() - new Date(a.fechaIngreso).getTime());
        setHuespedes(lista);
        setCargando(false);
        setError(false);
      },
      (err) => {
        clearTimeout(timer);
        console.error("Error Firebase:", err);
        setCargando(false);
        setError(true);
      }
    );

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []); // Quitamos la dependencia de 'cargando' para evitar bucles

  const handlePrint = async (huesped: Huesped) => {
    const printElement = document.createElement("div");
    printElement.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 40px; color: #333; background: white; width: 800px;">
        <h1 style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; font-size: 24px;">
          CONTROL DE HUÉSPEDES - RESIDENCIA TACUAREMBÓ
        </h1>
        <h2 style="text-align: center; font-size: 18px; margin-bottom: 30px;">FICHA INDIVIDUAL DEL HUÉSPED</h2>
        
        <h3 style="background: #eee; padding: 8px; font-size: 16px; margin-top: 20px;">Datos del Alojamiento</h3>
        <p><strong>Nº de Habitación:</strong> ${huesped.habitacion}</p>
        <p><strong>Monto a Pagar:</strong> $${huesped.montoPagar}</p>
        <p><strong>Estado del pago:</strong> ${huesped.estadoPago}</p>
        <p><strong>Fecha de Ingreso:</strong> ${new Date(huesped.fechaIngreso).toLocaleDateString()}</p>

        <h3 style="background: #eee; padding: 8px; font-size: 16px; margin-top: 20px;">Datos Personales</h3>
        <p><strong>Nombre y Apellidos:</strong> ${huesped.nombre}</p>
        <p><strong>Documento:</strong> ${huesped.documento}</p>
        <p><strong>Teléfono:</strong> ${huesped.telefono}</p>

        <div style="margin-top: 50px; text-align: center;">
          <p style="margin-bottom: 5px;">Firma del Huésped:</p>
          ${huesped.firma ? `<img src="${huesped.firma}" style="max-width: 300px; border-bottom: 1px solid #333;" />` : '<p>Sin firma registrada</p>'}
        </div>
      </div>
    `;
    document.body.appendChild(printElement);

    try {
      const canvas = await html2canvas(printElement, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      window.open(pdf.output("bloburl"), "_blank");
    } catch (error) {
      console.error("Error al generar PDF", error);
      alert("Hubo un error al generar el PDF.");
    } finally {
      document.body.removeChild(printElement);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800 font-semibold mr-6">
            <ArrowLeft size={20} className="mr-2" /> Volver
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Huéspedes Actuales</h1>
        </div>

        {cargando ? (
          <div className="text-center py-10 text-xl text-gray-500">Cargando lista...</div>
        ) : error ? (
          <div className="bg-red-50 p-10 rounded-xl shadow text-center border border-red-200">
            <User size={64} className="mx-auto text-red-300 mb-4" />
            <h2 className="text-2xl font-bold text-red-700 mb-2">Error de conexión</h2>
            <p className="text-red-500">No se pudo conectar con la base de datos. Revisa tu internet.</p>
            <button onClick={() => window.location.reload()} className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg">Reintentar</button>
          </div>
        ) : huespedes.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow text-center">
            <User size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No hay huéspedes registrados</h2>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {huespedes.map((huesped) => (
              <div key={huesped.id} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-gray-800">{huesped.nombre}</h2>
                    <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">
                      Hab. {huesped.habitacion}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1"><strong>Doc:</strong> {huesped.documento}</p>
                  <p className="text-gray-600 text-sm mb-3"><strong>Tel:</strong> {huesped.telefono}</p>
                </div>
                
                <div className="border-t pt-4 mt-2 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Monto:</p>
                    <p className="text-lg font-bold text-gray-800">${huesped.montoPagar}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handlePrint(huesped)} className="bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition" title="Imprimir Ficha">
                      <Printer size={20} />
                    </button>
                    <button className="bg-green-100 text-green-700 p-2 rounded-lg hover:bg-green-200 transition" title="Registrar Pago">
                      <CreditCard size={20} />
                    </button>
                    <button className="bg-red-100 text-red-700 p-2 rounded-lg hover:bg-red-200 transition" title="Dar Salida">
                      <LogOut size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}