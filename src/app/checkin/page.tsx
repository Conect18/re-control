// src/app/checkin/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Save, Eraser, ArrowLeft, User, Calendar, CreditCard, Phone, Users } from "lucide-react";
import Link from "next/link";

export default function CheckIn() {
  const [isSaving, setIsSaving] = useState(false);
  const [montoPagar, setMontoPagar] = useState<number>(0);
  const [montoPagado, setMontoPagado] = useState<number>(0);
  const [estadoPago, setEstadoPago] = useState("Pendiente");
  
  const sigCanvasHuesped = useRef<SignatureCanvas>(null);
  const sigCanvasResponsable = useRef<SignatureCanvas>(null);

  // Calcular saldo automáticamente
  const saldoPendiente = montoPagar - montoPagado;

  // Actualizar estado de pago según montos
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
    };

    try {
      await addDoc(collection(db, "huespedes"), nuevoHuesped);
      
      // Éxito: limpiamos el formulario PRIMERO
      form.reset();
      sigCanvasHuesped.current?.clear();
      sigCanvasResponsable.current?.clear();
      setMontoPagar(0);
      setMontoPagado(0);
      setEstadoPago("Pendiente");

      // Usamos setTimeout para mostrar el alert DESPUÉS de que el navegador respire
      setTimeout(() => {
        alert("¡Huésped registrado con éxito!");
        setIsSaving(false); // Liberamos el botón DESPUÉS del alert
      }, 100);

    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar. Revisa tu conexión.");
      setIsSaving(false);
    }
  };