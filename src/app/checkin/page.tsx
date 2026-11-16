// src/app/checkin/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Save, Eraser, ArrowLeft, User, Calendar, Phone, Users } from "lucide-react";
import Link from "next/link";

export default function CheckIn() {
  const [isSaving, setIsSaving] = useState(false);
  const [montoPagar, setMontoPagar] = useState<number>(0);
  const [montoPagado, setMontoPagado] = useState<number>(0);
  const [estadoPago, setEstadoPago] = useState("Pendiente");
  
  const sigCanvasHuesped = useRef<SignatureCanvas>(null);
  const sigCanvasResponsable = useRef<SignatureCanvas>(null);

  const saldoPendiente = montoPagar - montoPagado;

  useEffect(() => {
    if (montoPagado === 0) setEstadoPago("Pendiente");
    else if (montoPagado >= montoPagar && montoPagar > 0) setEstadoPago("Pagado");
    else if (montoPagado > 0 && montoPagado < montoPagar) setEstadoPago("Parcial");
  }, [montoPagado, montoPagar]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const firmaHuesped = sigCanvasHuesped.current?.isEmpty() ? "" : sigCanvasHuesped.current?.getTrimmedCanvas().toDataURL("image/png");
    const firmaResponsable = sigCanvasResponsable.current?.isEmpty() ? "" : sigCanvasResponsable.current?.getTrimmedCanvas().toDataURL("image/png");

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const nuevoHuesped = {
      piso: formData.get("piso"),
      habitacion: formData.get("habitacion"),
      cama: formData.get("cama"),
      fechaIngreso: new Date().toISOString(),
      fechaVencimiento: formData.get("fechaVencimiento"),
      montoPagar: Number(montoPagar),
      montoPagado: Number(montoPagado),
      saldoPendiente: saldoPendiente,
      estadoPago: estadoPago,
      fechaUltimoPago: montoPagado > 0 ? new Date().toISOString() : "",
      nombre: formData.get("nombre"),
      documento: formData.get("documento"),
      nacionalidad: formData.get("nacionalidad"),
      fechaNacimiento: formData.get("fechaNacimiento"),
      telefono: formData.get("telefono"),
      email: formData.get("email"),
      direccion: formData.get("direccion"),
      emergenciaNombre: formData.get("emergenciaNombre"),
      emergenciaParentesco: formData.get("emergenciaParentesco"),
      emergenciaTelefono: formData.get("emergenciaTelefono"),
      emergenciaTelefonoAlt: formData.get("emergenciaTelefonoAlt"),
      observaciones: formData.get("observaciones"),
      firmaHuesped: firmaHuesped,
      firmaResponsable: firmaResponsable,
      creadoPor: "Encargado", 
      estado: "Activo",
    };

    try {
      await addDoc(collection(db, "huespedes"), nuevoHuesped);
      form.reset();
      sigCanvasHuesped.current?.clear();
      sigCanvasResponsable.current?.clear();
      setMontoPagar(0);
      setMontoPagado(0);
      setEstadoPago("Pendiente");

      setTimeout(() => {
        alert("¡Huésped registrado con éxito!");
        setIsSaving(false);
      }, 100);

    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar. Revisa tu conexión.");
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 flex justify-center items-start">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6 md:p-8 my-4">
        <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800 mb-4 font-semibold">
          <ArrowLeft size={20} className="mr-2" /> Volver al Panel
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 border-b pb-4">Ficha de Ingreso - Residencia Tacuarembó</h1>

        <form onSubmit={handleSave} className="space-y-8">
          
          <div>
            <h2 className="text-xl font-semibold text-blue-800 mb-4 flex items-center gap-2"><Calendar size={24}/> Datos del Alojamiento</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Piso</label>
                <input name="piso" required className="w-full p-3 border rounded-lg" placeholder="Ej: 1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nº Habitación</label>
                <input name="habitacion" required className="w-full p-3 border rounded-lg" placeholder="Ej: 4" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nº Cama (Opcional)</label>
                <input name="cama" className="w-full p-3 border rounded-lg" placeholder="Ej: 1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Vencimiento Alquiler</label>
                <input name="fechaVencimiento" type="date" required className="w-full p-3 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto Total a Pagar ($)</label>
                <input name="montoPagar" type="number" value={montoPagar || ""} onChange={(e) => setMontoPagar(Number(e.target.value))} required className="w-full p-3 border rounded-lg" placeholder="Ej: 10000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto Pagado ($)</label>
                <input name="montoPagado" type="number" value={montoPagado || ""} onChange={(e) => setMontoPagado(Number(e.target.value))} className="w-full p-3 border rounded-lg" placeholder="Ej: 5000" />
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <p className="text-gray-600">Saldo Pendiente:</p>
                <p className={`text-2xl font-bold ${saldoPendiente > 0 ? 'text-red-600' : 'text-green-600'}`}>${saldoPendiente}</p>
              </div>
              <div className="text-center md:text-right">
                <p className="text-gray-600">Estado del Pago:</p>
                <p className={`text-xl font-bold ${estadoPago === 'Pagado' ? 'text-green-600' : estadoPago === 'Parcial' ? 'text-yellow-600' : 'text-red-600'}`}>{estadoPago}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-blue-800 mb-4 flex items-center gap-2"><User size={24}/> Datos Personales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre y Apellidos</label>
                <input name="nombre" required className="w-full p-3 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Documento (C.I.)</label>
                <input name="documento" required className="w-full p-3 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nacionalidad</label>
                <input name="nacionalidad" required className="w-full p-3 border rounded-lg" placeholder="Ej: Uruguaya" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                <input name="fechaNacimiento" type="date" required className="w-full p-3 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input name="telefono" required className="w-full p-3 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                <input name="email" type="email" className="w-full p-3 border rounded-lg" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input name="direccion" className="w-full p-3 border rounded-lg" />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-blue-800 mb-4 flex items-center gap-2"><Phone size={24}/> Contacto de Emergencia</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre y Apellidos</label>
                <input name="emergenciaNombre" required className="w-full p-3 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parentesco / Relación</label>
                <input name="emergenciaParentesco" required className="w-full p-3 border rounded-lg" placeholder="Ej: Madre, Hermano, Amigo" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono Principal</label>
                <input name="emergenciaTelefono" required className="w-full p-3 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono Alternativo</label>
                <input name="emergenciaTelefonoAlt" className="w-full p-3 border rounded-lg" />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-blue-800 mb-4 flex items-center gap-2"><Users size={24}/> Observaciones y Firmas</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
              <textarea name="observaciones" rows={3} className="w-full p-3 border rounded-lg" placeholder="Cualquier detalle adicional..."></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-2">Firma del Huésped</label>
                <div className="border-4 border-dashed border-gray-300 rounded-lg bg-gray-50 overflow-hidden relative touch-none">
                  <SignatureCanvas ref={sigCanvasHuesped} penColor="#1e3a8a" canvasProps={{ className: "w-full h-48", style: { touchAction: "none" } }} />
                  <button type="button" onClick={() => sigCanvasHuesped.current?.clear()} className="absolute top-2 right-2 bg-red-100 text-red-600 p-2 rounded-full"><Eraser size={20} /></button>
                </div>
              </div>
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-2">Firma del Responsable</label>
                <div className="border-4 border-dashed border-gray-300 rounded-lg bg-gray-50 overflow-hidden relative touch-none">
                  <SignatureCanvas ref={sigCanvasResponsable} penColor="#1e3a8a" canvasProps={{ className: "w-full h-48", style: { touchAction: "none" } }} />
                  <button type="button" onClick={() => sigCanvasResponsable.current?.clear()} className="absolute top-2 right-2 bg-red-100 text-red-600 p-2 rounded-full"><Eraser size={20} /></button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <button type="submit" disabled={isSaving} className="w-full bg-blue-600 text-white text-xl font-bold py-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex justify-center items-center gap-2">
              <Save size={24} /> {isSaving ? "Guardando..." : "Guardar Ingreso"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}