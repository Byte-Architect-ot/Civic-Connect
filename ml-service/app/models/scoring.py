from datetime import datetime, timedelta
from typing import Dict
import math

class DynamicScorer:
    def __init__(self):
        self.weights = {
            'priority': 0.35,
            'upvotes': 0.25,
            'age': 0.20,
            'cluster_size': 0.15,
            'status': 0.05
        }
    
    def calculate_urgency_score(self, issue: Dict) -> Dict[str, any]:
        """
        Calculate dynamic urgency score (0-100)
        Higher score = more urgent
        """
        scores = {}
        
        # 1. Priority Score
        priority_map = {'Critical': 100, 'High': 75, 'Medium': 50, 'Low': 25}
        scores['priority'] = priority_map.get(issue.get('priority', 'Medium'), 50)
        
        # 2. Upvote Score (normalized)
        upvotes = issue.get('upvotes', 0)
        scores['upvotes'] = min(upvotes * 5, 100)  # 20 upvotes = max score
        
        # 3. Age Score (older = more urgent if unresolved)
        reported_at = datetime.fromisoformat(issue['reportedAt'].replace('Z', '+00:00'))
        days_old = (datetime.now(reported_at.tzinfo) - reported_at).days
        scores['age'] = min(days_old * 10, 100)  # 10 days = max score
        
        # 4. Cluster Size Score (more duplicates = more urgent)
        cluster_size = issue.get('clusterSize', 0)
        scores['cluster_size'] = min(cluster_size * 15, 100)
        
        # 5. Status Score
        status_map = {
            'Pending': 100,
            'In Progress': 60,
            'Resolved': 0,
            'Rejected': 0
        }
        scores['status'] = status_map.get(issue.get('status', 'Pending'), 100)
        
        # Calculate weighted total
        total_score = sum(
            scores[key] * self.weights[key] 
            for key in scores.keys()
        )
        
        return {
            'urgency_score': round(total_score, 2),
            'breakdown': scores,
            'level': self._get_urgency_level(total_score)
        }
    
    def _get_urgency_level(self, score: float) -> str:
        if score >= 80:
            return 'Immediate'
        elif score >= 60:
            return 'High'
        elif score >= 40:
            return 'Medium'
        else:
            return 'Low'