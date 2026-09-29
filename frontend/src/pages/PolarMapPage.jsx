import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Compass, MapPin, ArrowRight, ExternalLink, ShieldCheck, Layers } from 'lucide-react';
import api from '../services/api';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

// Custom Leaflet Pin Icon
const createCustomMarker = (name, color = '#0284c7') => {
  return L.divIcon({
    className: 'custom-polar-pin',
    html: `
      <div style="
        background-color: ${color};
        color: white;
        border: 2px solid white;
        border-radius: 9999px;
        padding: 4px 8px;
        font-size: 11px;
        font-weight: 700;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
      ">
        <span style="display:inline-block; width:6px; height:6px; border-radius:9999px; background:white;"></span>
        ${name}
      </div>
    `,
    iconSize: [80, 26],
    iconAnchor: [40, 13]
  });
};

// Component to handle map view transitions
const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const PolarMapPage = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStation, setActiveStation] = useState(null);
  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [mapZoom, setMapZoom] = useState(2);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await api.get('/stations');
        setStations(response.data.data || []);
        if (response.data.data.length > 0) {
          setActiveStation(response.data.data[0]);
        }
      } catch (err) {
        console.error('Failed to load stations for map:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, []);

  const handleStationSelect = (st) => {
    setActiveStation(st);
    setMapCenter([st.coordinates.lat, st.coordinates.lng]);
    setMapZoom(st.region === 'Antarctica' ? 4 : 5);
  };

  const handleResetWorldView = () => {
    setMapCenter([20, 0]);
    setMapZoom(2);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-104px)]">
      {/* Top Map Control Bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4 z-20 shadow-xs">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-blue-600" />
          <h1 className="text-base font-bold text-slate-900 font-heading">
            Polar Explorer — India's High-Latitude Scientific Stations
          </h1>
        </div>

        {/* Station Quick Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          <Button variant="outline" size="sm" onClick={handleResetWorldView}>
            Global View
          </Button>

          {stations.map((st) => (
            <button
              key={st.stationId}
              onClick={() => handleStationSelect(st)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors border ${
                activeStation?.stationId === st.stationId
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              📍 {st.name} ({st.region})
            </button>
          ))}
        </div>
      </div>

      {/* Main Map + Sidebar Grid */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        {/* Leaflet Map Area */}
        <div className="flex-1 h-full relative z-10">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%' }}
          >
            <MapController center={mapCenter} zoom={mapZoom} />

            {/* Standard OpenStreetMap Tiles */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Station Markers */}
            {stations.map((st) => (
              <Marker
                key={st.stationId}
                position={[st.coordinates.lat, st.coordinates.lng]}
                icon={createCustomMarker(
                  st.name,
                  st.region === 'Antarctica' ? '#0284c7' : st.region === 'Arctic' ? '#0d9488' : '#475569'
                )}
                eventHandlers={{
                  click: () => setActiveStation(st)
                }}
              >
                <Popup>
                  <div className="p-1 space-y-2 max-w-xs text-left">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-slate-900">{st.name} Station</span>
                      <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                        {st.region}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {st.description}
                    </p>

                    <div className="text-[11px] font-mono text-slate-500">
                      Coordinates: {st.coordinates.lat}°, {st.coordinates.lng}°
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <Link to={`/stations/${st.stationId}`}>
                        <Button variant="polar" size="sm" className="w-full text-xs">
                          Explore Station Details →
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Station Floating Detail Drawer / Sidebar */}
        {activeStation && (
          <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 p-5 overflow-y-auto z-20 space-y-4 shadow-lg">
            <div className="relative h-44 rounded-lg overflow-hidden bg-slate-100">
              <img
                src={activeStation.heroImage}
                alt={activeStation.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2">
                <Badge variant={activeStation.region.toLowerCase()}>{activeStation.region}</Badge>
              </div>
              <div className="absolute bottom-2 right-2 text-xs bg-slate-900/80 text-white px-2 py-0.5 rounded font-mono">
                Est. {activeStation.establishedYear}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-slate-900 font-heading">
                {activeStation.name} Station
              </h2>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                {activeStation.location}
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {activeStation.description}
              </p>
            </div>

            {/* Coordinates & Altitude */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Coordinates</span>
                <span className="font-mono font-medium text-slate-800">
                  {activeStation.coordinates.lat}°, {activeStation.coordinates.lng}°
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Altitude</span>
                <span className="font-mono font-medium text-slate-800">
                  {activeStation.altitude || 'Sea level'}
                </span>
              </div>
            </div>

            {/* Connected Knowledge Counts */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Connected Knowledge Ecosystem
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-blue-50 border border-blue-100 p-2 rounded-lg">
                  <div className="text-base font-bold text-blue-700">
                    {activeStation.stats?.researchCount || 0}
                  </div>
                  <div className="text-[10px] text-blue-600 font-medium">Projects</div>
                </div>
                <div className="bg-sky-50 border border-sky-100 p-2 rounded-lg">
                  <div className="text-base font-bold text-sky-700">
                    {activeStation.stats?.datasetCount || 0}
                  </div>
                  <div className="text-[10px] text-sky-600 font-medium">Datasets</div>
                </div>
                <div className="bg-teal-50 border border-teal-100 p-2 rounded-lg">
                  <div className="text-base font-bold text-teal-700">
                    {activeStation.stats?.pubCount || 0}
                  </div>
                  <div className="text-[10px] text-teal-600 font-medium">Papers</div>
                </div>
              </div>
            </div>

            {/* Science Focus */}
            {activeStation.scienceFocus && activeStation.scienceFocus.length > 0 && (
              <div className="space-y-1 pt-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Key Scientific Focus
                </span>
                <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc">
                  {activeStation.scienceFocus.slice(0, 3).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action */}
            <div className="pt-2">
              <Link to={`/stations/${activeStation.stationId}`} className="w-full">
                <Button variant="polar" size="md" className="w-full text-xs">
                  Open Full Station Knowledge Hub
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PolarMapPage;
