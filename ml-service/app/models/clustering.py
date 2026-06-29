from sklearn.cluster import DBSCAN
import numpy as np
from typing import List, Dict, Tuple

class DuplicateDetector:
    def __init__(self, eps_km: float = 0.5, min_samples: int = 2):
        """
        eps_km: Maximum distance in kilometers between two samples
        min_samples: Minimum number of samples in a neighborhood
        """
        # Convert km to approximate degrees (1 degree ≈ 111 km)
        self.eps = eps_km / 111.0
        self.min_samples = min_samples
    
    def find_clusters(self, issues: List[Dict]) -> Dict[str, List[str]]:
        """
        Group issues by spatial proximity
        Returns: {cluster_id: [issue_ids]}
        """
        if len(issues) < 2:
            return {}
        
        # Extract coordinates
        coords = np.array([[issue['lat'], issue['lng']] for issue in issues])
        issue_ids = [issue['id'] for issue in issues]
        
        # Apply DBSCAN
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
    
    def find_duplicates_for_new_issue(
        self, 
        new_lat: float, 
        new_lng: float, 
        existing_issues: List[Dict],
        max_distance_km: float = 0.5
    ) -> List[str]:
        """
        Find existing issues within radius of new issue
        Returns: List of potentially duplicate issue IDs
        """
        from math import radians, sin, cos, sqrt, atan2
        
        duplicates = []
        
        for issue in existing_issues:
            # Haversine distance
            R = 6371  # Earth radius in km
            
            lat1, lon1 = radians(new_lat), radians(new_lng)
            lat2, lon2 = radians(issue['lat']), radians(issue['lng'])
            
            dlat = lat2 - lat1
            dlon = lon2 - lon1
            
            a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
            c = 2 * atan2(sqrt(a), sqrt(1-a))
            distance = R * c
            
            if distance <= max_distance_km:
                duplicates.append({
                    'id': issue['id'],
                    'distance_km': round(distance, 3),
                    'title': issue.get('title', '')
                })
        
        return duplicates