import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, Info, Layers, Search as SearchIcon, Navigation, 
  Maximize, X, Camera, ExternalLink, Image as ImageIcon, 
  Map as MapIcon 
} from 'lucide-react';
import { CivicIssue, IssueStatus, IssueCategory } from '../types';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/* Fix default Leaflet marker icons */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: import.meta.env.VITE_LEAFLET_MARKER_ICON_2X || 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: import.meta.env.VITE_LEAFLET_MARKER_ICON || 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: import.meta.env.VITE_LEAFLET_MARKER_SHADOW || 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MAPILLARY_TOKEN = import.meta.env.VITE_MAPILLARY_TOKEN;

interface MapViewProps {
  issues: CivicIssue[];
  onIssueClick: (issue: CivicIssue) => void;
}

const statusColors: Record<IssueStatus, string> = {
  'Pending': 'bg-amber-500',
  'In Progress': 'bg-blue-500',
  'Resolved': 'bg-emerald-500',
  'Rejected': 'bg-rose-500',
};

/* Create custom colored markers based on status */
const createCustomIcon = (status: IssueStatus) => {
  const colorMap = {
    'Pending': '#f59e0b',
    'In Progress': '#3b82f6',
    'Resolved': '#10b981',
    'Rejected': '#f43f5e',
  };

  const markerHtml = `
    <div style="background-color: ${colorMap[status]}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>
  `;

  return L.divIcon({
    html: markerHtml,
    className: 'custom-leaflet-icon bg-transparent',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
};

/* Map control components */
const MapController = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
};

const ClickHandler = ({ onClick }: { onClick: (e: L.LeafletMouseEvent) => void }) => {
  const map = useMap();
  useEffect(() => {
    map.on('click', onClick);
    return () => { map.off('click', onClick); };
  }, [map, onClick]);
  return null;
};

const ZoomControl = () => {
  const map = useMap();
  
  return (
    <div className="absolute right-6 top-6 flex flex-col gap-2 z-[1000]">
      <button 
        onClick={() => map.zoomIn()} 
        className="w-10 h-10 bg-slate-900/90 backdrop-blur text-white rounded-2xl shadow-soft-lg flex items-center justify-center hover:bg-slate-800 transition font-bold text-xl"
      >
        +
      </button>
      <button 
        onClick={() => map.zoomOut()} 
        className="w-10 h-10 bg-slate-900/90 backdrop-blur text-white rounded-2xl shadow-soft-lg flex items-center justify-center hover:bg-slate-800 transition font-bold text-xl"
      >
        −
      </button>
      <button 
        onClick={() => {
          if (!document.fullscreenElement) {
            map.getContainer().requestFullscreen();
          } else {
            document.exitFullscreen();
          }
        }} 
        className="w-10 h-10 bg-slate-900/90 backdrop-blur text-white rounded-2xl shadow-soft-lg flex items-center justify-center hover:bg-slate-800 transition mt-2"
      >
        <Maximize size={18} />
      </button>
      <button 
        onClick={() => {
          navigator.geolocation.getCurrentPosition(
            (pos) => map.flyTo([pos.coords.latitude, pos.coords.longitude], 15),
            () => alert("Location access denied")
          );
        }} 
        className="w-10 h-10 bg-slate-900/90 backdrop-blur text-white rounded-2xl shadow-soft-lg flex items-center justify-center hover:bg-slate-800 transition"
      >
        <Navigation size={18} />
      </button>
    </div>
  );
};

export const MapView: React.FC<MapViewProps> = ({ issues, onIssueClick }) => {
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | 'All'>('All');
  const [activeTab, setActiveTab] = useState<'issues' | 'street'>('issues');
  
  /* Search state */
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.2090]);
  const [mapZoom, setMapZoom] = useState(5);

  /* Street view state */
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [mapillaryPoints, setMapillaryPoints] = useState<any[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  /* Auto-center map on issues */
  useEffect(() => {
    if (issues.length > 0 && mapCenter[0] === 28.6139) {
      const lats = issues.map(i => i.lat);
      const lngs = issues.map(i => i.lng);
      setMapCenter([
        (Math.min(...lats) + Math.max(...lats)) / 2,
        (Math.min(...lngs) + Math.max(...lngs)) / 2
      ]);
    }
  }, [issues]);

  const filteredIssues = selectedCategory === 'All' 
    ? issues 
    : issues.filter(i => i.category === selectedCategory);

  /* Location search with Nominatim */
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }
    
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_NOMINATIM_API_URL || 'https://nominatim.openstreetmap.org/search'}?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
        );
        const data = await res.json();
        setSearchResults(data);
      } catch (err) {
        console.error('Geocoding error:', err);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectLocation = (loc: any) => {
    setMapCenter([parseFloat(loc.lat), parseFloat(loc.lon)]);
    setMapZoom(loc.type === 'city' ? 12 : 14);
    setSearchQuery('');
    setSearchResults([]);
  };

  /* Handle map click for street view */
  const handleMapClick = async (e: L.LeafletMouseEvent) => {
    if (activeTab !== 'street') return;
    
    setIsLoadingImages(true);
    try {
      const offset = 0.002;
      const res = await fetch(
        `${import.meta.env.VITE_MAPILLARY_GRAPH_URL || 'https://graph.mapillary.com'}/images?bbox=${e.latlng.lng - offset},${e.latlng.lat - offset},${e.latlng.lng + offset},${e.latlng.lat + offset}&fields=id,geometry,captured_at,compass_angle&limit=20`,
        { headers: { 'Authorization': `OAuth ${MAPILLARY_TOKEN}` } }
      );
      
      if (!res.ok) throw new Error('Mapillary API error');
      
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        const sorted = data.data.sort((a: any, b: any) => {
          const distA = Math.pow(a.geometry.coordinates[0] - e.latlng.lng, 2) + Math.pow(a.geometry.coordinates[1] - e.latlng.lat, 2);
          const distB = Math.pow(b.geometry.coordinates[0] - e.latlng.lng, 2) + Math.pow(b.geometry.coordinates[1] - e.latlng.lat, 2);
          return distA - distB;
        });
        setMapillaryPoints(sorted);
        setSelectedImage(sorted[0]);
      } else {
        alert("No street view images found. Try clicking closer to a road.");
      }
    } catch (err) {
      console.error('Mapillary error:', err);
      alert("Failed to load street view.");
    } finally {
      setIsLoadingImages(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-240px)] bg-slate-900 rounded-4xl relative overflow-hidden border-2 border-slate-700 shadow-soft-xl z-0 flex flex-col md:flex-row">
      {/* Map Container */}
      <div className="flex-1 relative z-0 h-full">
        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          scrollWheelZoom={true} 
          className="w-full h-full z-0"
          zoomControl={false}
        >
          <MapController center={mapCenter} zoom={mapZoom} />
          <ZoomControl />
          <ClickHandler onClick={handleMapClick} />
          
          <LayersControl position="bottomright">
            <LayersControl.BaseLayer checked name="Light Map">
              <TileLayer
                attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                url={import.meta.env.VITE_CARTO_VOYAGER_URL || "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Dark Map">
              <TileLayer
                attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                url={import.meta.env.VITE_CARTO_DARK_URL || "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Satellite">
              <TileLayer
                attribution='&copy; Esri'
                url={import.meta.env.VITE_ARCGIS_SATELLITE_URL || "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"}
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          {/* Issue markers */}
          {activeTab === 'issues' && filteredIssues.map((issue) => (
            <Marker 
              key={issue.id} 
              position={[issue.lat, issue.lng]}
              icon={createCustomIcon(issue.status)}
              eventHandlers={{ click: () => onIssueClick(issue) }}
            >
              <Popup className="rounded-2xl overflow-hidden" closeButton={false}>
                <div className="flex flex-col gap-2 min-w-[200px] p-2">
                  <p className="text-sm font-bold text-slate-900 line-clamp-2">
                    {issue.title}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${statusColors[issue.status]} text-white`}>
                      {issue.status}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      {issue.priority}
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin size={12} /> {issue.location}
                  </p>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onIssueClick(issue);
                    }} 
                    className="w-full bg-slate-900 text-white rounded-xl py-2 text-xs font-semibold hover:bg-slate-800 transition"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Street view overlay */}
          {activeTab === 'street' && (
            <>
              <TileLayer 
                url={`${import.meta.env.VITE_MAPILLARY_TILES_URL || 'https://tiles.mapillary.com/maps/vtp/mly1_computed_public/2'}/{z}/{x}/{y}?access_token=${MAPILLARY_TOKEN}`}
                opacity={0.6}
                maxZoom={14}
              />
              
              {mapillaryPoints.map(pt => (
                <CircleMarker
                  key={pt.id}
                  center={[pt.geometry.coordinates[1], pt.geometry.coordinates[0]]}
                  radius={6}
                  pathOptions={{
                    color: selectedImage?.id === pt.id ? '#ffffff' : '#059669',
                    fillColor: selectedImage?.id === pt.id ? '#3b82f6' : '#10b981',
                    fillOpacity: 1,
                    weight: 2
                  }}
                  eventHandlers={{ click: () => setSelectedImage(pt) }}
                />
              ))}
            </>
          )}
        </MapContainer>

        {/* UI Overlay */}
        <div className="absolute top-4 left-4 right-20 z-[1000] flex flex-col gap-4 pointer-events-none">
          {/* Tabs and Search */}
          <div className="flex flex-col md:flex-row gap-4 pointer-events-auto">
            <div className="bg-slate-900/90 backdrop-blur-xl p-1 rounded-2xl flex border border-slate-700">
              <button 
                onClick={() => { setActiveTab('issues'); setSelectedImage(null); }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
                  activeTab === 'issues' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <MapIcon size={16} /> Issues
              </button>
              <button 
                onClick={() => setActiveTab('street')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
                  activeTab === 'street' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Camera size={16} /> Street View
              </button>
            </div>

            <div className="relative w-full max-w-sm">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search location..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 backdrop-blur-xl border border-slate-700 text-white rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-600"
              />
              
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full mt-2 left-0 right-0 bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-soft-xl max-h-60 overflow-y-auto"
                  >
                    {searchResults.map((res: any, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleSelectLocation(res)}
                        className="w-full text-left px-4 py-3 hover:bg-slate-700 border-b border-slate-700/50 last:border-0 transition-colors"
                      >
                        <span className="text-sm font-semibold text-white line-clamp-1">
                          {res.display_name.split(',')[0]}
                        </span>
                        <span className="text-xs text-slate-400 line-clamp-1">
                          {res.display_name}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Category Filter */}
          <AnimatePresence>
            {activeTab === 'issues' && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-2xl p-4 max-w-[200px] pointer-events-auto"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Layers size={14} className="text-slate-400" />
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Category</h4>
                </div>
                <div className="space-y-1.5">
                  {['All', 'Roads', 'Garbage', 'Water', 'Electricity', 'Public Health', 'Others'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat as any)}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                        selectedCategory === cat ? 'bg-slate-900 text-white' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Street View Instructions */}
          <AnimatePresence>
            {activeTab === 'street' && !selectedImage && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="bg-emerald-900/90 backdrop-blur-xl border border-emerald-700 rounded-2xl p-4 max-w-xs pointer-events-auto"
              >
                <h4 className="text-sm font-semibold text-emerald-300 mb-2 flex items-center gap-2">
                  <Camera size={16} /> Explore Streets
                </h4>
                <p className="text-xs text-emerald-100">
                  Click anywhere on the map to view street-level photos
                </p>
                {isLoadingImages && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-emerald-300">
                    <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    Loading images...
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Legend */}
        <AnimatePresence>
          {activeTab === 'issues' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-6 left-4 bg-slate-900/90 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl space-y-3 z-[1000] pointer-events-auto"
            >
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-2">
                <Info size={14} /> Legend
              </h4>
              <LegendItem color="bg-amber-500" label="Pending" count={issues.filter(i => i.status === 'Pending').length} />
              <LegendItem color="bg-blue-500" label="In Progress" count={issues.filter(i => i.status === 'In Progress').length} />
              <LegendItem color="bg-emerald-500" label="Resolved" count={issues.filter(i => i.status === 'Resolved').length} />
              <LegendItem color="bg-rose-500" label="Rejected" count={issues.filter(i => i.status === 'Rejected').length} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Street View Panel */}
      <AnimatePresence>
        {activeTab === 'street' && selectedImage && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-full md:w-[400px] h-[40vh] md:h-full bg-slate-900 md:border-l border-t md:border-t-0 border-slate-700 flex flex-col overflow-hidden shrink-0 z-10"
          >
            <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-slate-800">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <ImageIcon size={18} className="text-emerald-400" />
                Street View
              </h3>
              <button 
                onClick={() => setSelectedImage(null)}
                className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300 transition"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="flex-1 w-full bg-black">
              <iframe
                title="Mapillary View"
                src={`${import.meta.env.VITE_MAPILLARY_EMBED_URL || 'https://www.mapillary.com/embed'}?image_key=${selectedImage.id}&style=split`}
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>
            
            <div className="p-4 bg-slate-800 border-t border-slate-700 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Captured</span>
                <span className="text-white">
                  {new Date(selectedImage.captured_at).toLocaleDateString()}
                </span>
              </div>
              <a 
                href={`${import.meta.env.VITE_MAPILLARY_APP_URL || 'https://www.mapillary.com/app'}/?pKey=${selectedImage.id}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition"
              >
                View on Mapillary <ExternalLink size={14} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .leaflet-popup-content-wrapper {
          border-radius: 1rem;
          padding: 0;
        }
        .leaflet-popup-content { margin: 0; }
        .leaflet-popup-tip-container { display: none; }
        .leaflet-control-layers { 
          border-radius: 1rem !important;
          border: 1px solid #475569 !important;
          background: rgba(15, 23, 42, 0.9) !important;
          backdrop-filter: blur(12px);
          color: white;
        }
      `}</style>
    </div>
  );
};

/* Legend item component */
function LegendItem({ color, label, count }: { color: string, label: string, count: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <span className="text-xs font-semibold text-slate-300">{label}</span>
      </div>
      <span className="text-xs font-bold text-white bg-slate-800 px-2 py-1 rounded-full min-w-[24px] text-center">
        {count}
      </span>
    </div>
  );
}