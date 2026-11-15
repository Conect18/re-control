// src/app/checkin/page.tsx
"use client";

import { useAuth } from "@/components/AuthProvider";
import { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Save, Eraser, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CheckIn() {
  const [isSaving, setIsSaving] = useState(false);
  const sigCanvas = useRef<SignatureCanvas>(null);
  const { user } = useAuth();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const firmaBase64 = sigCanvas.current?.isEmpty() 
      ? "" 
      : sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png");

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const nuevoHuesped = {
      nombre: formData.get("nombre"),
      documento: formData.get("documento"),
      telefono: formData.get("telefono"),
      habitacion: formData.get("habitacion"),
      montoPagar: Number(formData.get("montoPagar")),
      estadoPago: "Pendiente",
      firma: firmaBase64,
      fechaIngreso: new Date().toISOString(),
      creadoPor: user?.email || "Desconocido", 
    };

    try {
      await addDoc(collection(db, "huespedes"), nuevoHuesped);
      alert("¡Huésped registrado con éxito!");
      form.reset();
      sigCanvas.current?.clear();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al conectar con Firebase.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center items-start">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-8 mt-4">
        <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800 mb-4 font-semibold">
          <ArrowLeft size={20} className="mr-2" /> Volver al Panel
        </Link>

        <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">Registro de Nuevo Huésped</h1>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-1">Nombre y Apellido</label>
              <input name="nombre" required className="w-full p-4 text-lg border-2 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Ej: Marcelo Lemos" />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-1">Documento (C.I.)</label>
              <input name="documento" required className="w-full p-4 text-lg border-2 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Ej: 5.828.431-9" />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-1">Teléfono</label>
              <input name="telefono" required className="w-full p-4 text-lg border-2 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Ej: 097 988 203" />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-1">Nº de Habitación</label>
              <input name="habitacion" required className="w-full p-4 text-lg border-2 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Ej: 1" />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-1">Monto a Pagar ($)</label>
              <input name="montoPagar" type="number" required className="w-full p-4 text-lg border-2 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Ej: 10000" />
            </div>
          </div>

          <div className="border-t pt-6">
            <label className="block text-xl font-bold text-gray-800 mb-2">Firma del Huésped</label>
            
            {/* AQUI ESTA EL TRUCO: touch-none en el contenedor */}
            <div className="border-4 border-dashed border-gray-300 rounded-lg bg-gray-50 overflow-hidden relative touch-none">
              <SignatureCanvas 
                ref={sigCanvas} 
                penColor="#1e3a8a" 
                canvasProps={{ 
                  className: "w-full h-64 cursor-crosshair",
                  style: { touchAction: "none" } 
                }} 
              />
              <button 
                type="button" 
                onClick={() => sigCanvas.current?.clear()}
                className="absolute top-3 right-3 bg-red-100 text-red-600 p-3 rounded-full hover:bg-red-200 transition shadow z-10"
              >
                <Eraser size={28} />
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
            <button 
              type="submit" 
              disabled={isSaving}
              className="flex-1 bg-blue-600 text-white text-xl font-bold py-5 rounded-lg hover:bg-blue-700 flex justify-center items-center gap-3 transition disabled:opacity-50 shadow-md"
            >
              <Save size={28} /> {isSaving ? "Guardando..." : "Guardar Ingreso"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}