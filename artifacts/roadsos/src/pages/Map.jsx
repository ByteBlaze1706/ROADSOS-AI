import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Search, Navigation, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import {
  useGetNearbyServices,
  getGetNearbyServicesQueryKey,
} from "@workspace/api-client-react";

let googleMapsPromise = null;
function loadGoogleMapsScript(apiKey) {
  if (googleMapsPromise) return googleMapsPromise;
  googleMapsPromise = new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve(window.google.maps);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
  return googleMapsPromise;
}

const cyberMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#0b0f19" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0b0f19" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#0095ff" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#0095ff" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#0f1626" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca3af" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#1f2937" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#111827" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#e5e7eb" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#0095ff" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#05070a" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#0095ff" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#05070a" }],
  },
];

export default function MapPage() {
  const [filter, setFilter] = useState("ALL");
  const filters = ["ALL", "HOSPITALS", "POLICE", "TOWING", "PUNCTURE"];
  const { location } = useAuth();

  const userLat = location?.lat || 28.6139;
  const userLng = location?.lng || 77.2090;

  const { data: services, isLoading } = useGetNearbyServices(
    {
      lat: userLat,
      lng: userLng,
      type: filter === "ALL" ? undefined : filter.toLowerCase(),
    },
    {
      query: {
        queryKey: getGetNearbyServicesQueryKey({
          lat: userLat,
          lng: userLng,
          type: filter === "ALL" ? undefined : filter.toLowerCase(),
        }),
      },
    },
  );

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapContainerRef = useRef(null);
  const gMapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/config/maps-key");
        const data = await res.json();
        const key = data.apiKey;
        if (!key) {
          console.warn("No Google Maps API Key provided by server.");
          // Enable flag so fallback mock marker setup can run if needed
          setIsMapLoaded(true);
          return;
        }
        await loadGoogleMapsScript(key);
        setIsMapLoaded(true);
      } catch (err) {
        console.error("Failed to load Google Maps script:", err);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (!isMapLoaded || !mapContainerRef.current || !window.google) return;

    if (!gMapRef.current) {
      gMapRef.current = new window.google.maps.Map(mapContainerRef.current, {
        center: { lat: userLat, lng: userLng },
        zoom: 14,
        styles: cyberMapStyles,
        disableDefaultUI: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
    } else {
      gMapRef.current.setCenter({ lat: userLat, lng: userLng });
    }
  }, [isMapLoaded, userLat, userLng]);

  useEffect(() => {
    if (!isMapLoaded || !gMapRef.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const mapInstance = gMapRef.current;

    // User Location Marker
    const userMarker = new window.google.maps.Marker({
      position: { lat: userLat, lng: userLng },
      map: mapInstance,
      title: "YOUR LOCATION",
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#0095ff",
        fillOpacity: 1.0,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      },
    });

    markersRef.current.push(userMarker);

    const userInfoWindow = new window.google.maps.InfoWindow({
      content: `<div style="color:black;font-family:sans-serif;padding:4px;"><strong>Your Current Live Location</strong><br/>Lat: ${userLat.toFixed(5)}<br/>Lng: ${userLng.toFixed(5)}</div>`,
    });

    userMarker.addListener("click", () => {
      userInfoWindow.open(mapInstance, userMarker);
    });

    // POI Markers
    if (services && services.length) {
      services.forEach((service) => {
        const color = service.type === "hospital" ? "#ff0033" : 
                      service.type === "police" ? "#0055ff" : 
                      service.type === "towing" ? "#ffcc00" : "#888888";
        const marker = new window.google.maps.Marker({
          position: { lat: service.latitude, lng: service.longitude },
          map: mapInstance,
          title: service.name,
          icon: {
            path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale: 7,
            fillColor: color,
            fillOpacity: 0.9,
            strokeColor: "#ffffff",
            strokeWeight: 1,
          },
        });

        const phoneHtml = service.phone ? `<br/><strong>Phone:</strong> ${service.phone}` : "";
        const addressHtml = service.vicinity ? `<br/><strong>Address:</strong> ${service.vicinity}` : "";
        const infoContent = `
          <div style="color:black;font-family:sans-serif;padding:6px;max-width:200px;font-size:12px;">
            <strong style="font-size:14px;color:#0b0f19;">${service.name}</strong>
            <br/><span style="text-transform:uppercase;font-size:10px;font-weight:bold;color:#666;">${service.type}</span>
            ${addressHtml}
            ${phoneHtml}
            <br/><strong>Distance:</strong> ${service.distance} KM
            <br/><strong>ETA:</strong> ${service.eta} Min
          </div>
        `;

        const infoWindow = new window.google.maps.InfoWindow({
          content: infoContent,
        });

        marker.addListener("click", () => {
          infoWindow.open(mapInstance, marker);
        });

        markersRef.current.push(marker);
      });
    }
  }, [isMapLoaded, services, userLat, userLng]);

  const displayServices = services || [];

  return (
    <div className="h-screen bg-background flex flex-col relative overflow-hidden pb-20">
      {/* Search Header */}
      <div className="absolute top-0 left-0 w-full z-20 p-4 bg-gradient-to-b from-background via-background/80 to-transparent">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search sector..."
            className="pl-10 bg-black/50 border-white/20 text-white backdrop-blur-md h-12 rounded-xl focus:border-accent"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider whitespace-nowrap transition-colors ${
                filter === f
                  ? "bg-accent text-accent-foreground border border-accent neon-box-blue"
                  : "bg-black/50 text-muted-foreground border border-white/10 hover:border-white/30 backdrop-blur-md"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Google Maps Container */}
      <div ref={mapContainerRef} className="flex-1 w-full h-full relative bg-[#0a0f18]" />

      {/* Bottom Sheet - Service List */}
      <div className="absolute bottom-20 left-0 w-full z-20 px-4 pb-4 h-[40vh] flex flex-col">
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-3" />
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-4">
          {displayServices.map((service, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={service.id}
              className="glass-card p-4 border-white/10"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-white tracking-wide">
                    {service.name}
                  </h3>
                  <p className="text-xs text-muted-foreground uppercase">
                    {service.type}
                  </p>
                  {service.vicinity && (
                    <p className="text-[10px] text-white/40 mt-1 max-w-[250px] truncate">
                      {service.vicinity}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-accent font-orbitron font-bold">
                    {service.distance} KM
                  </div>
                  <div className="text-xs text-white/50">
                    {service.eta} min ETA
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-white/10 hover:bg-white/5 h-10"
                  disabled={!service.phone}
                  onClick={() => {
                    if (service.phone) {
                      window.location.href = `tel:${service.phone}`;
                    }
                  }}
                >
                  <Phone className="w-4 h-4 mr-2" /> CALL
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${service.latitude},${service.longitude}`;
                    window.open(navUrl, "_blank");
                  }}
                  className="flex-1 bg-accent/20 text-accent hover:bg-accent/30 border border-accent/30 h-10"
                >
                  <Navigation className="w-4 h-4 mr-2" /> NAVIGATE
                </Button>
              </div>
            </motion.div>
          ))}
          {displayServices.length === 0 && !isLoading && (
            <div className="text-center p-8 text-muted-foreground">
              No assets located in current sector.
            </div>
          )}
          {isLoading && (
            <div className="text-center p-8 text-accent animate-pulse font-orbitron uppercase tracking-wider text-xs">
              SCANNING SECTOR COGNITIVE RADAR...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
