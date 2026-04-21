import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Info, Layers } from 'lucide-react';
import { CivicIssue, IssueStatus, IssueCategory } from '../types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

export const MapView: React.FC<MapViewProps> = ({ issues, onIssueClick }) => {
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | 'All'>('All');

  const filteredIssues = selectedCategory === 'All' 
    ? issues 
    : issues.filter(i => i.category === selectedCategory);

  const defaultCenter: [number, number] = [28.6139, 77.2090]; // New Delhi
  
  let center = defaultCenter;
  if (filteredIssues.length > 0) {
    const lats = filteredIssues.map(i => i.lat);
    const lngs = filteredIssues.map(i => i.lng);
    center = [
      (Math.min(...lats) + Math.max(...lats)) / 2,
      (Math.min(...lngs) + Math.max(...lngs)) / 2
    ];
  }

  return (
    <div className="h-[calc(100vh-240px)] bg-slate-900 rounded-3xl relative overflow-hidden border border-slate-700 shadow-2xl z-0">
      <MapContainer 
        center={center} 
        zoom={4} 
        scrollWheelZoom={true} 
        className="w-full h-full z-0"
      >
        {/* Using a nice, modern basemap from CartoDB */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {filteredIssues.map((issue) => (
          <Marker 
            key={issue.id} 
            position={[issue.lat, issue.lng]}
            icon={createCustomIcon(issue.status)}
            eventHandlers={{
              click: () => onIssueClick(issue)
            }}
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
      </MapContainer>

      {/* Category Filter Overlay */}
      <div className="absolute top-6 left-6 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-2xl p-4 space-y-3 max-w-xs z-[1000] shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <Layers size={16} className="text-white" />
          <h4 className="text-xs font-bold text-white uppercase tracking-widest">Filter by Category</h4>
        </div>
        <div className="space-y-2">
          {['All', 'Roads', 'Garbage', 'Water', 'Electricity', 'Public Health', 'Others'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as any)}
              className={`w-full px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 left-6 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-2xl space-y-3 z-[1000] shadow-xl">
        <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-3 flex items-center gap-2">
          <Info size={14} />
          Status
        </h4>
        <LegendItem color="bg-amber-500" label="Pending" count={issues.filter(i => i.status === 'Pending').length} />
        <LegendItem color="bg-blue-500" label="In Progress" count={issues.filter(i => i.status === 'In Progress').length} />
        <LegendItem color="bg-emerald-500" label="Resolved" count={issues.filter(i => i.status === 'Resolved').length} />
        <LegendItem color="bg-rose-500" label="Rejected" count={issues.filter(i => i.status === 'Rejected').length} />
      </div>

      {/* Info Overlay */}
      <div className="absolute top-6 right-6 bg-blue-600 text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-lg flex items-center gap-2 z-[1000] pointer-events-none">
        <MapPin size={16} />
        {filteredIssues.length} Active Issue{filteredIssues.length !== 1 ? 's' : ''}
      </div>
      
      {/* Global styles for leaflet overrides */}
      <style>{`
        .leaflet-popup-content-wrapper {
          border-radius: 0.75rem;
          padding: 0;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        }
        .leaflet-popup-content {
          margin: 12px;
        }
        .leaflet-popup-tip-container {
          display: none;
        }
        .leaflet-container {
          font-family: inherit;
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
      <span className="text-xs font-black text-white bg-slate-800 px-2 py-0.5 rounded-full min-w-[24px] text-center">
        {count}
      </span>
    </div>
  );
}