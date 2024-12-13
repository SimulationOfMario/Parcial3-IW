"use client";
import { signOut, signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

interface Event {
  _id: string;
  nombre: string;
  timestamp: string;
  lugar: string;
  lat: number;
  lon: number;
  organizador: string;
  imagen: string;
}

interface Visit {
  timestamp: string;
  visitorEmail: string;
  token: string;
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lon: number }>({ lat: 0, lon: 0 });
  const [searchEmail, setSearchEmail] = useState("");
  const [visits, setVisits] = useState<Visit[]>([]);
  const [searchedEmail, setSearchedEmail] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      fetchEvents();
      fetchVisits();
    }
  }, [status]);

  const fetchEvents = async (email?: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/eventos?email=${email || session?.user?.email}`);
      if (!response.ok) throw new Error('Error al cargar los eventos');
      
      const data = await response.json();
      setEvents(data);
      setSearchedEmail(email || session?.user?.email || "");

      // Registrar la visita
      await fetch('/api/visitas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visitedEmail: email || session?.user?.email }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVisits = async () => {
    try {
      const response = await fetch('/api/visitas');
      if (!response.ok) throw new Error('Error al cargar las visitas');
      
      const data = await response.json();
      setVisits(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchEvents(searchEmail);
    await registerVisit(searchEmail);
  };

  const registerVisit = async (email: string) => {
    try {
      await fetch('/api/visitas', {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      console.error('Error al registrar la visita', err);
    }
  };

  const handleBackToProfile = async () => {
    await fetchEvents();
    setSearchEmail("");
    setSearchedEmail("");
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-7xl mb-8">
        <Map location={location} eventos={events} />
      </div>

      {status === "unauthenticated" && (
        <div className="flex flex-col items-center gap-4 mb-8">
          <h2 className="text-2xl font-bold text-center">Bienvenido! Inicia sesión para ver y crear viajes!</h2>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => signIn()}
          >
            Iniciar sesión
          </button>
        </div>
      )}

      {status === "authenticated" && (
        <>
          <div className="flex flex-col items-center gap-4 mb-8">
            <h2>Bienvenido {session?.user?.name}</h2>
            <img src={session?.user?.image ?? undefined} alt={session?.user?.name ?? ""} className="w-20 h-20 rounded-full" />
          </div>

          <div className="flex justify-between w-full max-w-7xl mb-4">
            <form onSubmit={handleSearch} className="flex items-center">
              <input
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="Buscar por email"
                className="border border-gray-300 rounded px-4 py-2 mr-2"
                required
              />
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Buscar
              </button>
            </form>
            {searchedEmail && (
              <div className="flex items-center gap-4">
                <p className="ml-4">Mostrando viajes de {searchedEmail}</p>
                <button onClick={handleBackToProfile} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                  Volver a mi perfil
                </button>
              </div>
            )}
            <div className="flex items-center gap-4">
              <Link href="/crear">
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  Crear Nuevo Viaje
                </button>
              </Link>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                onClick={() => signOut()}
              >
                Cerrar sesión
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl">
            {events.map((event) => (
              <Link href={`/eventos/${event._id}`} key={event._id}>
                <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <img 
                    src={event.imagen} 
                    alt={event.nombre}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h2 className="font-bold text-xl mb-2">Nombre del Viaje: {event.nombre}</h2>
                    <p className="text-gray-600">
                      Visitado: {new Date(event.timestamp).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">{event.lugar}</p>
                    <p className="text-gray-600">Creado por: {event.organizador}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="w-full max-w-7xl mt-8">
            <h2 className="text-2xl font-bold mb-4">Visitas Recibidas</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">Fecha y Hora</th>
                    <th className="border p-2">Email del Visitante</th>
                    <th className="border p-2">Token de Identificación</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.map((visit, index) => (
                    <tr key={index}>
                      <td className="border p-2">{new Date(visit.timestamp).toLocaleString()}</td>
                      <td className="border p-2">{visit.visitorEmail}</td>
                      <td className="border p-2">{visit.token}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </main>
  );
}