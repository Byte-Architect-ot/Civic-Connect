from typing import List, Dict
import math

class DuplicateDetector:
    def __init__(self, eps_km: float = 0.5, min_samples: int = 2):
        """
        eps_km: Maximum distance in kilometers between two samples
        min_samples: Minimum number of samples in a neighborhood
        """
        self.eps_km = eps_km
        self.earth_radius_km = 6371.0
        # Haversine metric in scikit-learn expects distance in radians: radians = km / earth_radius_km
        self.eps = eps_km / self.earth_radius_km
        self.min_samples = min_samples
    
    def find_clusters(self, issues: List[Dict]) -> Dict[str, List[str]]:
        """
        Group issues by spatial proximity
        Returns: {cluster_id: [issue_ids]}
        """
        if len(issues) < 2:
            return {}
        
        issue_ids = [str(issue.get('id', '')) for issue in issues]

        try:
            from sklearn.cluster import DBSCAN
            import numpy as np

            # Extract coordinates
            coords = np.array([[float(issue['lat']), float(issue['lng'])] for issue in issues])
            
            # Apply DBSCAN with haversine metric on radian coordinates
            clustering = DBSCAN(
                eps=self.eps,
                min_samples=self.min_samples,
                metric='haversine',
                algorithm='ball_tree'
            ).fit(np.radians(coords))
            
            # Group by cluster
            clusters = {}
            for idx, label in enumerate(clustering.labels_):
                if label == -1:  # Noise point
                    continue
                
                cluster_key = f"cluster_{label}"
                if cluster_key not in clusters:
                    clusters[cluster_key] = []
                clusters[cluster_key].append(issue_ids[idx])
            
            return clusters
        except Exception:
            # Fallback pure-Python clustering if scikit-learn is not available
            clusters = {}
            visited = set()
            cluster_idx = 0
            for i, issue in enumerate(issues):
                iid = str(issue.get('id', ''))
                if iid in visited:
                    continue
                group = [iid]
                for j, other in enumerate(issues):
                    oid = str(other.get('id', ''))
                    if i != j and oid not in visited:
                        dups = self.find_duplicates_for_new_issue(
                            float(issue['lat']), float(issue['lng']), [other], max_distance_km=self.eps_km
                        )
                        if dups:
                            group.append(oid)
                if len(group) >= self.min_samples:
                    clusters[f"cluster_{cluster_idx}"] = group
                    visited.update(group)
                    cluster_idx += 1
            return clusters
    
    def find_duplicates_for_new_issue(
        self, 
        new_lat: float, 
        new_lng: float, 
        existing_issues: List[Dict],
        max_distance_km: float = 0.5
    ) -> List[Dict]:
        """
        Find existing issues within radius of new issue
        Returns: List of potentially duplicate issue dicts
        """
        from math import radians, sin, cos, sqrt, atan2
        
        duplicates = []
        
        for issue in existing_issues:
            # Haversine distance
            R = self.earth_radius_km
            
            try:
                lat1, lon1 = radians(float(new_lat)), radians(float(new_lng))
                lat2, lon2 = radians(float(issue['lat'])), radians(float(issue['lng']))
                
                dlat = lat2 - lat1
                dlon = lon2 - lon1
                
                a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
                c = 2 * atan2(sqrt(a), sqrt(1-a))
                distance = R * c
                
                if distance <= max_distance_km:
                    duplicates.append({
                        'id': str(issue.get('id', '')),
                        'distance_km': round(distance, 3),
                        'title': issue.get('title', '')
                    })
            except (ValueError, TypeError, KeyError):
                continue
        
        return duplicates
