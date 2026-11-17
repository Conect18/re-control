// src/components/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-400 text-[10px] sm:text-xs text-center p-4 mt-auto w-full">
      <p className="mb-1 font-semibold text-gray-300">
        Soporte Técnico: WhatsApp (+598) 96708797 | ideasdelsuruy@gmail.com
      </p>
      <p className="mb-1">
        Licencia de uso válida hasta: <strong>01/03/2027</strong>
      </p>
      <p className="mb-1">
        &copy; {new Date().getFullYear()} RE.Control - Residencia Tacuarembó. Todos los derechos reservados.
      </p>
      <p className="text-gray-500">
        Política de Privacidad: Los datos personales de los huéspedes son tratados de forma estrictamente confidencial y almacenados bajo protocolos de seguridad en la nube,Segun Ley de proteccion de datos N° 18.331
      </p>
    </footer>
  );
}