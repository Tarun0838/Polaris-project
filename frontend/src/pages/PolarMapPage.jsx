import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Compass,
  MapPin,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Layers,
  Globe2,
  Key,
  Info,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import api from '../services/api';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import PolarGlobeView from '../components/PolarGlobeView';

// Custom Leaflet Pin Icon for Primary Stations
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

// Custom Leaflet Pin Icon for In-Situ Field Assets
const createAssetMarker = (title, category) => {
  const isDataset = category === 'dataset';
  const color = isDataset ? '#0f766e' : '#b45309';
  return L.divIcon({
    className: 'custom-asset-pin',
    html: `
      <div style="
        background-color: ${color};
        color: white;
        border: 2px solid white;
        border-radius: 9999px;
        padding: 2.5px 7px;
        font-size: 10px;
        font-weight: 700;
        box-shadow: 0 3px 6px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        gap: 3px;
        white-space: nowrap;
      ">
        <span>${isDataset ? '📊' : '📄'}</span>
        <span>${title.length > 20 ? title.substring(0, 20) + '…' : title}</span>
      </div>
    `,
    iconSize: [110, 22],
    iconAnchor: [55, 11]
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

const DEFAULT_POLAR_STATIONS = [
  {
    stationId: 'maitri',
    name: 'Maitri',
    region: 'Antarctica',
    location: 'Schirmacher Oasis, Queen Maud Land, East Antarctica',
    coordinates: { lat: -70.767, lng: 11.733 },
    establishedYear: 1989,
    altitude: '117 m above sea level',
    heroImage: '/stations/maitri.jpg',
    description: "Maitri is India's second permanent research station in Antarctica, commissioned in 1989 in the ice-free rocky terrain of the Schirmacher Oasis.",
    scienceFocus: ['Atmospheric Science', 'Geomagnetism & Space Weather', 'Glaciology', 'Extremophile Microbiology']
  },
  {
    stationId: 'bharati',
    name: 'Bharati',
    region: 'Antarctica',
    location: 'Larsemann Hills, East Antarctica',
    coordinates: { lat: -69.407, lng: 76.187 },
    establishedYear: 2012,
    altitude: '35 m above sea level',
    heroImage: '/stations/bharati.jpg',
    description: "Bharati is India's state-of-the-art third Antarctic research station, commissioned in 2012 in the Larsemann Hills.",
    scienceFocus: ['Oceanography & Coastal Marine Ecosystems', 'Satellite Data Acquisition', 'Aerosol-Cloud Interactions']
  },
  {
    stationId: 'himadri',
    name: 'Himadri',
    region: 'Arctic',
    location: 'Ny-Ålesund, Spitsbergen, Svalbard, Norway',
    coordinates: { lat: 78.923, lng: 11.928 },
    establishedYear: 2008,
    altitude: 'Sea level',
    heroImage: '/stations/himadri.jpg',
    description: "Himadri is India's premier Arctic research station situated at Ny-Ålesund, Svalbard.",
    scienceFocus: ['Fjord Oceanography & Kongsfjorden Mooring', 'Cryosphere Dynamics', 'Atmospheric Boundary Layer']
  },
  {
    stationId: 'himansh',
    name: 'Himansh',
    region: 'Himalaya',
    location: 'Chandra Basin, Spiti Valley, Himachal Pradesh',
    coordinates: { lat: 32.404, lng: 77.608 },
    establishedYear: 2016,
    altitude: '4,080 m above sea level',
    heroImage: '/stations/himansh.jpg',
    description: "Himansh is India's high-altitude cryosphere research station in the Spiti Valley, Himalayas.",
    scienceFocus: ['Glacier Mass Balance', 'Hydrological Modeling', 'Snow Chemistry']
  },
  {
    stationId: 'dakshin-gangotri',
    name: 'Dakshin Gangotri',
    region: 'Antarctica',
    location: 'Princess Astrid Coast, Queen Maud Land, Antarctica',
    coordinates: { lat: -70.083, lng: 12.0 },
    establishedYear: 1983,
    altitude: 'Sea level ice shelf',
    heroImage: '/stations/dakshin-gangotri.jpg',
    description: "India's historic first permanent scientific station in Antarctica, set up during 1983-84.",
    scienceFocus: ['Polar Meteorology', 'Ice Shelf Physics', 'Magnetic Surveys']
  }
];

export const PolarMapPage = () => {
  const [stations, setStations] = useState([]);
  const [assets, setAssets] = useState([]);
  const [showAssets, setShowAssets] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeStation, setActiveStation] = useState(DEFAULT_POLAR_STATIONS[0]);
  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [mapZoom, setMapZoom] = useState(2);

  // Guarantee stations are always populated for both 2D and 3D map views
  const displayStations = useMemo(() => {
    if (stations && stations.length > 0) return stations;
    return DEFAULT_POLAR_STATIONS;
  }, [stations]);

  // View mode: '2d' (Google Earth / Leaflet) or '3d' (Interactive 3D Earth Globe)
  const [viewMode, setViewMode] = useState('2d');

  // Map layer options: Default to Google Earth Hybrid Satellite!
  const [mapLayer, setMapLayer] = useState('google_hybrid');

  // API Key Guide Modal state
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [customKey, setCustomKey] = useState(
    () => localStorage.getItem('polaris_google_maps_key') || ''
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const [stationRes, assetRes] = await Promise.all([
          api.get('/stations'),
          api.get('/assets')
        ]);
        setStations(stationRes.data.data || []);
        setAssets(assetRes.data.data || []);
        if (stationRes.data.data && stationRes.data.data.length > 0) {
          setActiveStation(stationRes.data.data[0]);
        }
      } catch (err) {
        console.error('Failed to load map data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMapData();
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

  const handleSaveCustomKey = () => {
    localStorage.setItem('polaris_google_maps_key', customKey.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCopyConsoleUrl = () => {
    navigator.clipboard.writeText('https://console.cloud.google.com/google/maps-apis/credentials');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-104px)]">
      {/* Top Map Control Bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 z-20 shadow-xs">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-teal-700 shrink-0" />
          <h1 className="text-sm sm:text-base font-bold text-slate-900 font-heading">
            Polar Explorer — High-Latitude Earth Map & Scientific Stations
          </h1>
        </div>

        {/* View Mode, Layer Switchers & Controls */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs py-0.5">
          {/* View Mode Toggle: 2D Google Earth vs 3D Earth Globe */}
          <div className="flex items-center rounded-lg border border-slate-300 bg-slate-100 p-0.5 shrink-0 shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode('2d')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === '2d'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
              title="2D Google Maps & Google Earth satellite view"
            >
              <span>🗺️</span>
              <span>2D Earth Map</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === '3d'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
              title="Interactive 3D Earth Globe (spin in 3D, inspect South Pole and North Pole)"
            >
              <span>🌐</span>
              <span>3D Globe</span>
            </button>
          </div>

          {/* 2D Map Layer Switcher (Visible in 2D Mode) */}
          {viewMode === '2d' && (
            <div className="flex items-center rounded-md border border-slate-200 overflow-hidden bg-slate-50 p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setMapLayer('google_hybrid')}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                  mapLayer === 'google_hybrid'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
                title="Google Earth Satellite imagery with English geographic labels — No API key needed!"
              >
                🌍 Google Earth
              </button>
              <button
                type="button"
                onClick={() => setMapLayer('google_satellite')}
                className={`px-2 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                  mapLayer === 'google_satellite'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
                title="Google Satellite imagery without labels"
              >
                🛰️ Satellite
              </button>
              <button
                type="button"
                onClick={() => setMapLayer('google_streets')}
                className={`px-2 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                  mapLayer === 'google_streets'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
                title="Google Maps standard streets & cartography"
              >
                🗺️ Streets
              </button>
              <button
                type="button"
                onClick={() => setMapLayer('google_terrain')}
                className={`px-2 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                  mapLayer === 'google_terrain'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
                title="Google Maps physical terrain with elevation relief"
              >
                ⛰️ Terrain
              </button>
              <button
                type="button"
                onClick={() => setMapLayer('esri_ocean')}
                className={`px-2 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                  mapLayer === 'esri_ocean'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
                title="Esri Ocean Bathymetry & Seabed depth mapping"
              >
                🌊 Ocean
              </button>
              <button
                type="button"
                onClick={() => setMapLayer('esri_topo')}
                className={`px-2 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                  mapLayer === 'esri_topo'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
                title="Esri Topographic Contour Map"
              >
                🧭 Topo
              </button>
            </div>
          )}

          {/* Reset World View */}
          {viewMode === '2d' && (
            <Button variant="outline" size="sm" onClick={handleResetWorldView}>
              Global View
            </Button>
          )}

          {/* Toggle In-Situ Field Sites */}
          <button
            type="button"
            onClick={() => setShowAssets(!showAssets)}
            className={`px-2.5 py-1.5 rounded-md font-semibold text-xs transition-colors border flex items-center gap-1.5 cursor-pointer shrink-0 ${
              showAssets
                ? 'bg-teal-700 text-white border-teal-700'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
            title="Toggle authentic in-situ field sites layer"
          >
            <span>{showAssets ? '✓' : '+'} Field Sites ({assets.length})</span>
          </button>

          {/* Station Quick Focus Buttons */}
          {displayStations.map((st) => (
            <button
              key={st.stationId}
              onClick={() => handleStationSelect(st)}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors border cursor-pointer shrink-0 ${
                activeStation?.stationId === st.stationId
                  ? 'bg-teal-800 text-white border-teal-800 font-semibold shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              📍 {st.name} ({st.region})
            </button>
          ))}

          {/* Free API Key Info Button */}
          <button
            type="button"
            onClick={() => setIsApiKeyModalOpen(true)}
            className="px-2.5 py-1.5 rounded-md font-semibold text-xs transition-colors border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 flex items-center gap-1.5 cursor-pointer shrink-0"
            title="Learn how Polaris connects Google Earth without an API key, or grab your own free key"
          >
            <Key className="w-3.5 h-3.5 text-amber-700" />
            <span>API Key Info</span>
          </button>
        </div>
      </div>

      {/* Main Map + Sidebar Grid */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        {/* Map Viewport Area */}
        <div className="flex-1 h-full relative z-10">
          {viewMode === '3d' ? (
            /* 3D Interactive Earth Globe View */
            <PolarGlobeView
              stations={displayStations}
              assets={assets}
              showAssets={showAssets}
              activeStation={activeStation}
              onSelectStation={(st) => setActiveStation(st)}
            />
          ) : (
            /* 2D Leaflet Map with Google Earth & Maps Tile Layers (0 API Key Required) */
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              scrollWheelZoom={true}
              style={{ width: '100%', height: '100%' }}
            >
              <MapController center={mapCenter} zoom={mapZoom} />

              {/* 100% Free Google Earth & Maps Tile Layers — No API Key Required */}
              {mapLayer === 'google_hybrid' ? (
                <TileLayer
                  attribution='&copy; Google Maps &mdash; Earth Satellite & Geographic Labels'
                  url="https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                  subdomains={['0', '1', '2', '3']}
                  maxZoom={20}
                />
              ) : mapLayer === 'google_satellite' ? (
                <TileLayer
                  attribution='&copy; Google Maps &mdash; Satellite Imagery'
                  url="https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                  subdomains={['0', '1', '2', '3']}
                  maxZoom={20}
                />
              ) : mapLayer === 'google_streets' ? (
                <TileLayer
                  attribution='&copy; Google Maps &mdash; Street View'
                  url="https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                  subdomains={['0', '1', '2', '3']}
                  maxZoom={20}
                />
              ) : mapLayer === 'google_terrain' ? (
                <TileLayer
                  attribution='&copy; Google Maps &mdash; Physical Terrain & Elevation'
                  url="https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
                  subdomains={['0', '1', '2', '3']}
                  maxZoom={20}
                />
              ) : mapLayer === 'esri_satellite' ? (
                <TileLayer
                  attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  maxZoom={18}
                />
              ) : mapLayer === 'esri_ocean' ? (
                <TileLayer
                  attribution='Tiles &copy; Esri &mdash; GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
                  maxZoom={13}
                />
              ) : (
                <TileLayer
                  attribution='Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
                  maxZoom={18}
                />
              )}

              {/* Primary Station Markers */}
              {displayStations.map((st) => (
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
                        <span className="text-[10px] font-semibold bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded">
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

              {/* Real Field In-Situ Asset Markers */}
              {showAssets &&
                assets.map((asset) => {
                  const lat = asset.coordinates?.lat;
                  const lng = asset.coordinates?.long || asset.coordinates?.lng;
                  if (lat === undefined || lng === undefined) return null;
                  return (
                    <Marker
                      key={asset._id || asset.title}
                      position={[lat, lng]}
                      icon={createAssetMarker(asset.title, asset.category)}
                    >
                      <Popup>
                        <div className="p-2 space-y-2 max-w-sm text-left">
                          {asset.imageUrl && (
                            <div className="h-28 w-full rounded overflow-hidden bg-slate-100 mb-1">
                              <img
                                src={asset.imageUrl}
                                alt={asset.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-xs text-slate-900 leading-tight">
                              {asset.title}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                asset.category === 'dataset'
                                  ? 'bg-teal-100 text-teal-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {asset.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug">
                            {asset.summary}
                          </p>
                          <div className="text-[10px] text-slate-500 font-mono">
                            📍 {asset.station} • {asset.region} ({asset.year})
                          </div>
                          {asset.scientificMetrics && (
                            <div className="bg-slate-50 border border-slate-200 rounded p-1.5 text-[10px] space-y-0.5 font-mono">
                              {Object.entries(asset.scientificMetrics).map(([k, v]) => (
                                <div key={k} className="flex justify-between gap-2">
                                  <span className="text-slate-500 capitalize">{k}:</span>
                                  <span className="font-semibold text-slate-800 truncate">{v}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
                            <a
                              href={asset.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-teal-700 hover:text-teal-900 font-bold underline"
                            >
                              Source Record ↗
                            </a>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
            </MapContainer>
          )}
        </div>

        {/* Station Floating Detail Drawer / Sidebar */}
        {activeStation && (
          <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 p-5 overflow-y-auto z-20 space-y-4 shadow-lg shrink-0">
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

      {/* Free Google Maps API Key Guide Modal */}
      <Modal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        title="Google Maps & Earth Integration Guide"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-5 text-slate-700 text-xs sm:text-sm">
          {/* Active Status Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-emerald-950 text-sm">
                No API Key Required — Active & Working Out-of-the-Box!
              </h4>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                Polaris is currently pulling high-resolution <strong>Google Earth Satellite (Hybrid)</strong>, 
                <strong>Google Streets</strong>, and <strong>Google Terrain</strong> tiles directly from Google's 
                open tile network. You do <strong>not</strong> need to pay or configure an API key for live map exploration.
              </p>
            </div>
          </div>

          {/* How to Grab a Free Official Google Maps API Key */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span>🔑</span>
              <span>Need an Official Google Maps Platform Key? (100% Free Tier)</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              If your organization or hackathon jury requires an official <strong>Google Maps Platform API Key</strong> (e.g. for Google Maps JavaScript SDK, Street View, or Places Autocomplete), Google gives every account a <strong>$200 monthly free credit</strong>. That is equivalent to <strong>~28,000 free map loads every month</strong> forever.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2 text-xs">
              <div className="font-semibold text-slate-800">Quick 4-Step Setup:</div>
              <ol className="list-decimal pl-5 space-y-1.5 text-slate-600">
                <li>
                  Sign in to the{' '}
                  <a
                    href="https://console.cloud.google.com/google/maps-apis/credentials"
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-700 hover:text-teal-900 font-semibold underline inline-flex items-center gap-0.5"
                  >
                    Google Cloud Console Credentials Page <ExternalLink className="w-3 h-3 inline" />
                  </a>
                </li>
                <li>
                  Click <strong>Create Project</strong> (e.g. <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">Polaris-MoES</code>).
                </li>
                <li>
                  In <strong>APIs & Services &gt; Library</strong>, search for <strong>Maps JavaScript API</strong> and click <strong>Enable</strong>.
                </li>
                <li>
                  Go to <strong>Credentials &gt; Create Credentials &gt; API Key</strong>. Copy your generated key!
                </li>
              </ol>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyConsoleUrl}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Console URL'}</span>
                </button>
                <a
                  href="https://console.cloud.google.com/google/maps-apis/credentials"
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded text-xs font-medium inline-flex items-center gap-1"
                >
                  Open Google Cloud Console ↗
                </a>
              </div>
            </div>
          </div>

          {/* Optional Key Storer */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Optional: Save Your Google Maps API Key Locally
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
              <button
                type="button"
                onClick={handleSaveCustomKey}
                className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                {savedSuccess ? 'Saved! ✓' : 'Save Key'}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Saved securely to your browser's local storage for your sessions.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PolarMapPage;
