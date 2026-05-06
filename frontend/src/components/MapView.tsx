import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Info, Layers, Search as SearchIcon, Navigation, Maximize, X, Camera, ExternalLink, Image as ImageIcon, Map as MapIcon } from 'lucide-react';
import { CivicIssue, IssueStatus, IssueCategory } from '../types';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Replace this with your actual Mapillary Client Token from mapillary.com/dashboard/developers
const MAPILLARY_TOKEN = 'MLY|26292047430478386|9654cbe92bc0bddb3ca622559b4f7fea'; // Placeholder, replace with actual token

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

const createCustomIcon = (status: IssueStatus) => {
  let hexColor = '#3b82f6';
  if (status === 'Pending') hexColor = '#f59e0b';
  else if (status === 'In Progress') hexColor = '#3b82f6';
  else if (status === 'Resolved') hexColor = '#10b981';
  else if (status === 'Rejected') hexColor = '#f43f5e';

  const markerHtml = `
    <div style="background-color: ${hexColor}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>
  `;

  return L.divIcon({
    html: markerHtml,
    className: 'custom-leaflet-icon bg-transparent',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
};

// Map Control Helper Components
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
      <button onClick={() => map.zoomIn()} className="w-10 h-10 bg-slate-900/90 backdrop-blur text-white rounded-xl shadow-lg flex items-center justify-center hover:bg-blue-600 transition font-bold text-xl">+</button>
      <button onClick={() => map.zoomOut()} className="w-10 h-10 bg-slate-900/90 backdrop-blur text-white rounded-xl shadow-lg flex items-center justify-center hover:bg-blue-600 transition font-bold text-xl">−</button>
      <button onClick={() => {
        if (!document.fullscreenElement) {
          map.getContainer().requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
          });
        } else {
          document.exitFullscreen();
        }
      }} className="w-10 h-10 bg-slate-900/90 backdrop-blur text-white rounded-xl shadow-lg flex items-center justify-center hover:bg-blue-600 transition mt-2">
        <Maximize size={18} />
      </button>
      <button onClick={() => {
        navigator.geolocation.getCurrentPosition((pos) => {
          map.flyTo([pos.coords.latitude, pos.coords.longitude], 15);
        }, () => alert("Location access denied"));
      }} className="w-10 h-10 bg-blue-600 backdrop-blur text-white rounded-xl shadow-lg flex items-center justify-center hover:bg-blue-700 transition mt-2">
        <Navigation size={18} />
      </button>
    </div>
  );
};

export const MapView: React.FC<MapViewProps> = ({ issues, onIssueClick }) => {
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | 'All'>('All');
  const [activeTab, setActiveTab] = useState<'issues' | 'street'>('issues');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.2090]); // Default: New Delhi
  const [mapZoom, setMapZoom] = useState(5);

  // Mapillary state
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [mapillaryPoints, setMapillaryPoints] = useState<any[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  // Auto center based on issues if available (only on initial load)
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

  // Search logic (Nominatim API)
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`);
        const data = await res.json();
        setSearchResults(data);
      } catch (err) {
        console.error('Geocoding error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectLocation = (loc: any) => {
    setMapCenter([parseFloat(loc.lat), parseFloat(loc.lon)]);
    // Zoom differently based on location type
    let zoom = 12;
    if (loc.type === 'city') zoom = 12;
    else if (loc.type === 'administrative') zoom = 10;
    else if (loc.type === 'village' || loc.type === 'neighbourhood') zoom = 15;
    else zoom = 14;
    setMapZoom(zoom);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Mapillary click logic
  const handleMapClick = async (e: L.LeafletMouseEvent) => {
    if (activeTab !== 'street') return;
    
    setIsLoadingImages(true);
    try {
      // Calculate a bounding box around the click (approx 400m x 400m)
      const offset = 0.002;
      const minLon = e.latlng.lng - offset;
      const maxLon = e.latlng.lng + offset;
      const minLat = e.latlng.lat - offset;
      const maxLat = e.latlng.lat + offset;

      // Fetch nearest images using Mapillary Graph API within bbox
      const res = await fetch(
        `https://graph.mapillary.com/images?bbox=${minLon},${minLat},${maxLon},${maxLat}&fields=id,geometry,captured_at,compass_angle&limit=20`,
        {
          headers: {
            'Authorization': `OAuth ${MAPILLARY_TOKEN}`
          }
        }
      );
      
      if (!res.ok) {
        throw new Error('Mapillary API returned an error');
      }
      
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        // Sort by distance to the clicked point
        const sorted = data.data.sort((a: any, b: any) => {
          const distA = Math.pow(a.geometry.coordinates[0] - e.latlng.lng, 2) + Math.pow(a.geometry.coordinates[1] - e.latlng.lat, 2);
          const distB = Math.pow(b.geometry.coordinates[0] - e.latlng.lng, 2) + Math.pow(b.geometry.coordinates[1] - e.latlng.lat, 2);
          return distA - distB;
        });

        setMapillaryPoints(sorted);
        setSelectedImage(sorted[0]); // Select nearest
      } else {
        alert("No street view images found at this location. Try clicking closer to a road.");
      }
    } catch (err) {
      console.error('Mapillary error:', err);
      alert("Failed to load street view. Please verify the Mapillary Access Token in MapView.tsx.");
    } finally {
      setIsLoadingImages(false);
    }
  };

  return (
    <div className="h-[calc(100vh-240px)] bg-slate-900 rounded-3xl relative overflow-hidden border border-slate-700 shadow-2xl z-0 flex flex-col md:flex-row">
      
      {/* Map Area */}
      <div className="flex-1 relative z-0 h-full">
        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          scrollWheelZoom={true} 
          className="w-full h-full z-0"
          zoomControl={false} // We provide custom zoom controls
        >
          <MapController center={mapCenter} zoom={mapZoom} />
          <ZoomControl />
          <ClickHandler onClick={handleMapClick} />
          
          <LayersControl position="bottomright">
            <LayersControl.BaseLayer checked name="CartoDB Voyager (Light)">
              <TileLayer
                attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="CartoDB Dark Matter">
              <TileLayer
                attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Satellite">
              <TileLayer
                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          {/* Issue Markers (Only shown on 'issues' tab) */}
          {activeTab === 'issues' && filteredIssues.map((issue) => (
            <Marker 
              key={issue.id} 
              position={[issue.lat, issue.lng]}
              icon={createCustomIcon(issue.status)}
              eventHandlers={{ click: () => onIssueClick(issue) }}
            >
              <Popup className="rounded-xl overflow-hidden p-0 border-0" closeButton={false}>
                  <div className="flex flex-col gap-2 min-w-[200px] p-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-black text-slate-900 line-clamp-2 flex-1 m-0">
                        {issue.title}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center w-full">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${statusColors[issue.status]} text-white shrink-0`}>
                          {issue.status}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        issue.priority === 'Critical' ? 'bg-rose-100 text-rose-600' :
                        issue.priority === 'High' ? 'bg-orange-100 text-orange-600' :
                        issue.priority === 'Medium' ? 'bg-blue-100 text-blue-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {issue.priority}
                      </span>
                    </div>
                    
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 m-0 mb-1">
                      <MapPin size={12} /> {issue.location}
                    </p>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onIssueClick(issue);
                      }} 
                      className="w-full bg-blue-600 text-white rounded-lg py-2 px-3 text-xs font-bold hover:bg-blue-700 transition shadow-sm mt-1"
                    >
                      View Details
                    </button>
                  </div>
              </Popup>
            </Marker>
          ))}

          {/* Mapillary Coverage Tiles & Points (Only shown on 'street' tab) */}
          {activeTab === 'street' && (
            <>
              {/* Note: In a full prod app we would use Leaflet.VectorGrid for the PBF tiles.
                  Since VectorGrid requires extra setup, we use the computed coverage raster layer fallback here, 
                  or rely on user clicks to fetch points as implemented. */}
              <TileLayer 
                url={`https://tiles.mapillary.com/maps/vtp/mly1_computed_public/2/{z}/{x}/{y}?access_token=${MAPILLARY_TOKEN}`}
                opacity={0.6}
                maxZoom={14}
              />
              
              {/* Fetched Points on click */}
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
                  eventHandlers={{
                    click: () => setSelectedImage(pt)
                  }}
                />
              ))}
            </>
          )}
        </MapContainer>

        {/* Top Overlay UI */}
        <div className="absolute top-4 left-4 right-20 z-[1000] flex flex-col gap-4 pointer-events-none">
          
          {/* Top Bar (Tabs & Search) */}
          <div className="flex flex-col md:flex-row gap-4 pointer-events-auto">
            {/* Tabs */}
            <div className="bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl flex border border-slate-700 shadow-xl shrink-0">
              <button 
                onClick={() => { setActiveTab('issues'); setSelectedImage(null); }}
                className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'issues' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                <MapIcon size={16} /> Issues
              </button>
              <button 
                onClick={() => setActiveTab('street')}
                className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'street' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                <Camera size={16} /> Street View
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative w-full max-w-sm">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <SearchIcon size={18} className="text-slate-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search district, city or place..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white rounded-2xl pl-12 pr-4 py-3 shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
              {/* Search Results Dropdown */}
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full mt-2 left-0 right-0 bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto"
                  >
                    {searchResults.map((res: any, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleSelectLocation(res)}
                        className="w-full text-left px-4 py-3 hover:bg-slate-700 border-b border-slate-700/50 last:border-0 flex flex-col transition-colors"
                      >
                        <span className="text-sm font-bold text-white line-clamp-1">{res.display_name.split(',')[0]}</span>
                        <span className="text-xs text-slate-400 line-clamp-1">{res.display_name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Filters (Only for issues) */}
          <AnimatePresence>
            {activeTab === 'issues' && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-2xl p-4 max-w-[200px] pointer-events-auto shadow-xl"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Layers size={14} className="text-blue-400" />
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter by Category</h4>
                </div>
                <div className="space-y-1.5">
                  {['All', 'Roads', 'Garbage', 'Water', 'Electricity', 'Public Health', 'Others'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat as any)}
                      className={`w-full px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-left ${
                        selectedCategory === cat
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800'
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
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="bg-emerald-900/90 backdrop-blur-md border border-emerald-700/50 rounded-2xl p-4 max-w-xs pointer-events-auto shadow-xl"
              >
                <h4 className="text-sm font-bold text-emerald-400 mb-1 flex items-center gap-2">
                  <Camera size={16} /> Explore Streets
                </h4>
                <p className="text-xs text-emerald-100/70">
                  Green tiles show areas with Mapillary coverage. <strong className="text-white">Click anywhere on the map</strong> to fetch and view the nearest street-level photos.
                </p>
                {isLoadingImages && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-emerald-300">
                    <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    Loading nearest images...
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Legend (Issues Tab) */}
        <AnimatePresence>
          {activeTab === 'issues' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-6 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-2xl space-y-3 z-[1000] shadow-xl pointer-events-auto"
            >
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                <Info size={14} /> Status
              </h4>
              <LegendItem color="bg-amber-500" label="Pending" count={issues.filter(i => i.status === 'Pending').length} />
              <LegendItem color="bg-blue-500" label="In Progress" count={issues.filter(i => i.status === 'In Progress').length} />
              <LegendItem color="bg-emerald-500" label="Resolved" count={issues.filter(i => i.status === 'Resolved').length} />
              <LegendItem color="bg-rose-500" label="Rejected" count={issues.filter(i => i.status === 'Rejected').length} />
            </motion.div>
          )}
        </AnimatePresence>
        
      </div>

      {/* Mapillary Street Photo Viewer Panel */}
      <AnimatePresence>
        {activeTab === 'street' && selectedImage && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 400, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full bg-slate-900 border-l border-slate-700 flex flex-col overflow-hidden shrink-0 z-10"
          >
            <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-slate-800">
              <h3 className="font-bold text-white flex items-center gap-2">
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
            
            <div className="flex-1 w-full bg-black relative">
              {/* Mapillary iFrame Embed */}
              <iframe
                title="Mapillary View"
                src={`https://www.mapillary.com/embed?image_key=${selectedImage.id}&style=split`}
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
            
            <div className="p-4 bg-slate-800 border-t border-slate-700 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Captured on</span>
                <span className="font-medium text-white">
                  {new Date(selectedImage.captured_at).toLocaleDateString(undefined, { 
                    year: 'numeric', month: 'short', day: 'numeric' 
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Heading</span>
                <span className="font-medium text-white">{Math.round(selectedImage.compass_angle)}°</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Image ID</span>
                <span className="font-mono text-slate-300">{selectedImage.id}</span>
              </div>
              <a 
                href={`https://www.mapillary.com/app/?pKey=${selectedImage.id}`}
                target="_blank" rel="noopener noreferrer"
                className="mt-2 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition"
              >
                View on Mapillary <ExternalLink size={14} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .leaflet-popup-content-wrapper {
          border-radius: 0.75rem;
          padding: 0;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        }
        .leaflet-popup-content { margin: 12px; }
        .leaflet-popup-tip-container { display: none; }
        .leaflet-container { font-family: inherit; }
        .leaflet-control-layers { 
          border-radius: 1rem !important;
          border: 1px solid #334155 !important;
          background: rgba(15, 23, 42, 0.9) !important;
          backdrop-filter: blur(8px);
          color: white;
          overflow: hidden;
        }
        .leaflet-control-layers-list { margin: 0 !important; padding: 8px !important; }
        .leaflet-control-layers-toggle {
          background-color: #1e293b !important;
          border-radius: 1rem !important;
        }
      `}</style>
    </div>
  );
};

function LegendItem({ color, label, count }: { color: string, label: string, count: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${color} shadow-md`} />
        <span className="text-xs font-bold text-slate-300">{label}</span>
      </div>
      <span className="text-xs font-black text-white bg-slate-800 px-2 py-0.5 rounded-full min-w-[24px] text-center border border-slate-700">
        {count}
      </span>
    </div>
  );
}