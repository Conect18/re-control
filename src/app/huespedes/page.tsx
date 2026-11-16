// src/app/huespedes/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowLeft, User, CreditCard, LogOut, Printer, X } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface Huesped {
  id: string;
  nombre: string;
  documento: string;
  habitacion: string;
  piso: string;
  cama?: string;
  telefono: string;
  montoPagar: number;
  montoPagado: number;
  saldoPendiente: number;
  estadoPago: string;
  fechaIngreso: string;
  fechaVencimiento: string;
  firmaHuesped: string;
  firmaResponsable: string;
}

export default function ListaHuespedes() {
  const [huespedes, setHuespedes] = useState<Huesped[]>([]);
  const [cargando, setCargando] = useState(true);
  
  // Estados para modales
  const [pagoModalAbierto, setPagoModalAbierto] = useState(false);
  const [salidaModalAbierto, setSalidaModalAbierto] = useState(false);
  const [huespedSeleccionado, setHuespedSeleccionado] = useState<Huesped | null>(null);
  const [montoPago, setMontoPago] = useState("");

  useEffect(() => {
    // Escuchamos TODA la colección, sin filtros de Firebase
    const unsubscribe = onSnapshot(collection(db, "huespedes"), (snapshot) => {
      const lista: Huesped[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Filtramos en el frontend: solo mostramos si NO es Inactivo
        if (data.estado !== "Inactivo") {
          lista.push({ id: doc.id, ...data } as Huesped);
        }
      });
      // Ordenar por los que tienen saldo pendiente primero
      lista.sort((a, b) => (b.saldoPendiente || 0) - (a.saldoPendiente || 0));
      setHuespedes(lista);
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  // Función para registrar un pago
  const handleRegistrarPago = async () => {
    if (!huespedSeleccionado) return;
    
    const pago = Number(montoPago);
    if (pago <= 0) {
      alert("Ingrese un monto válido.");
      return;
    }

    const nuevoMontoPagado = (huespedSeleccionado.montoPagado || 0) + pago;
    const nuevoSaldo = huespedSeleccionado.montoPagar - nuevoMontoPagado;
    
    let nuevoEstado = "Pendiente";
    if (nuevoSaldo <= 0) nuevoEstado = "Pagado";
    else if (nuevoMontoPagado > 0) nuevoEstado = "Parcial";

    try {
      const huespedRef = doc(db, "huespedes", huespedSeleccionado.id);
      await updateDoc(huespedRef, {
        montoPagado: nuevoMontoPagado,
        saldoPendiente: nuevoSaldo,
        estadoPago: nuevoEstado,
        fechaUltimoPago: new Date().toISOString()
      });
      setPagoModalAbierto(false);
      setMontoPago("");
      alert("Pago registrado con éxito.");
    } catch (error) {
      console.error("Error al registrar pago:", error);
      alert("Error al registrar el pago.");
    }
  };

  // Función para dar salida al huésped
  const handleDarSalida = async () => {
    if (!huespedSeleccionado) return;

    try {
      const huespedRef = doc(db, "huespedes", huespedSeleccionado.id);
      await updateDoc(huespedRef, {
        estado: "Inactivo",
        fechaSalida: new Date().toISOString()
      });
      setSalidaModalAbierto(false);
      alert("Huésped dado de salida con éxito. La habitación quedó libre.");
    } catch (error) {
      console.error("Error al dar salida:", error);
      alert("Error al dar salida.");
    }
  };

  const handlePrint = async (huesped: Huesped) => {
    const printElement = document.createElement("div");
    printElement.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 40px; color: #333; background: white; width: 800px;">
        <h1 style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; font-size: 24px;">CONTROL DE HUÉSPEDES - RESIDENCIA TACUAREMBÓ</h1>
        <h2 style="text-align: center; font-size: 18px; margin-bottom: 30px;">FICHA INDIVIDUAL DEL HUÉSPED</h2>
        <h3 style="background: #eee; padding: 8px; font-size: 16px; margin-top: 20px;">Datos del Alojamiento</h3>
        <p><strong>Piso:</strong> ${huesped.piso || '-'} | <strong>Habitación:</strong> ${huesped.habitacion} | <strong>Cama:</strong> ${huesped.cama || '-'}</p>
        <p><strong>Monto Total:</strong> $${huesped.montoPagar} | <strong>Pagado:</strong> $${huesped.montoPagado || 0} | <strong>Saldo:</strong> $${huesped.saldoPendiente}</p>
        <p><strong>Estado:</strong> ${huesped.estadoPago}</p>
        <p><strong>Fecha Vencimiento:</strong> ${huesped.fechaVencimiento || '-'}</p>
        <h3 style="background: #eee; padding: 8px; font-size: 16px; margin-top: 20px;">Datos Personales</h3>
        <p><strong>Nombre:</strong> ${huesped.nombre} | <strong>Documento:</strong> ${huesped.documento}</p>
        <p><strong>Teléfono:</strong> ${huesped.telefono}</p>
        <div style="margin-top: 50px; display: flex; justify-content: space-between;">
          <div style="text-align: center; width: 45%;">
            <p>Firma del Huésped:</p>
            ${huesped.firmaHuesped ? `<img src="${huesped.firmaHuesped}" style="max-width: 100%; border-bottom: 1px solid #333;" />` : '<p>Sin firma</p>'}
          </div>
          <div style="text-align: center; width: 45%;">
            <p>Firma del Responsable:</p>
            ${huesped.firmaResponsable ? `<img src="${huesped.firmaResponsable}" style="max-width: 100%; border-bottom: 1px solid #333;" />` : '<p>Sin firma</p>'}
          </div>
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
        ) : huespedes.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow text-center">
            <User size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No hay huéspedes registrados</h2>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {huespedes.map((huesped) => (
              <div key={huesped.id} className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${huesped.saldoPendiente > 0 ? 'border-red-500' : 'border-green-500'} flex flex-col justify-between`}>
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-gray-800">{huesped.nombre}</h2>
                    <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">
                      Hab. {huesped.habitacion} {huesped.cama ? `- Cama ${huesped.cama}` : ''}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1"><strong>Doc:</strong> {huesped.documento}</p>
                  <p className="text-gray-600 text-sm mb-3"><strong>Tel:</strong> {huesped.telefono}</p>
                </div>
                
                <div className="border-t pt-4 mt-2 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Saldo Pendiente:</p>
                    <p className={`text-lg font-bold ${huesped.saldoPendiente > 0 ? 'text-red-600' : 'text-green-600'}`}>${huesped.saldoPendiente}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handlePrint(huesped)} className="bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition" title="Imprimir Ficha">
                      <Printer size={20} />
                    </button>
                    <button 
                      onClick={() => { setHuespedSeleccionado(huesped); setPagoModalAbierto(true); }} 
                      className="bg-green-100 text-green-700 p-2 rounded-lg hover:bg-green-200 transition" 
                      title="Registrar Pago"
                    >
                      <CreditCard size={20} />
                    </button>
                    <button 
                      onClick={() => { setHuespedSeleccionado(huesped); setSalidaModalAbierto(true); }} 
                      className="bg-red-100 text-red-700 p-2 rounded-lg hover:bg-red-200 transition" 
                      title="Dar Salida"
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL PARA REGISTRAR PAGO */}
      {pagoModalAbierto && huespedSeleccionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Registrar Pago</h2>
              <button onClick={() => setPagoModalAbierto(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-600 mb-4">Huésped: <strong>{huespedSeleccionado.nombre}</strong></p>
            <p className="text-gray-600 mb-4">Saldo actual: <strong className="text-red-600">${huespedSeleccionado.saldoPendiente}</strong></p>
            
            <label className="block text-gray-700 font-medium mb-2">Monto a pagar ($)</label>
            <input 
              type="number" 
              value={montoPago}
              onChange={(e) => setMontoPago(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg text-xl font-bold mb-4"
              placeholder="Ej: 5000"
              autoFocus
            />
            
            <button 
              onClick={handleRegistrarPago}
              className="w-full bg-green-600 text-white text-lg font-bold py-3 rounded-lg hover:bg-green-700 transition"
            >
              Confirmar Pago
            </button>
          </div>
        </div>
      )}

      {/* MODAL PARA DAR SALIDA */}
      {salidaModalAbierto && huespedSeleccionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Dar Salida</h2>
              <button onClick={() => setSalidaModalAbierto(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro que deseas dar salida a <strong>{huespedSeleccionado.nombre}</strong> de la habitación <strong>{huespedSeleccionado.habitacion}</strong>?
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setSalidaModalAbierto(false)}
                className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDarSalida}
                className="flex-1 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition"
              >
                Confirmar Salida
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}