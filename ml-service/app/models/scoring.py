from datetime import datetime, timezone
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
        upvotes = issue.get('upvotes', 0) or 0
        try:
            upvotes = int(upvotes)
        except (ValueError, TypeError):
            upvotes = 0
        scores['upvotes'] = min(max(0, upvotes) * 5, 100)  # 20 upvotes = max score
        
        # 3. Age Score (older = more urgent if unresolved)
        raw_date = issue.get('reportedAt') or issue.get('createdAt')
        days_old = 0
        if raw_date:
            try:
                date_str = str(raw_date).replace('Z', '+00:00')
                reported_at = datetime.fromisoformat(date_str)
                now = datetime.now(reported_at.tzinfo) if reported_at.tzinfo else datetime.now()
                days_old = max(0, (now - reported_at).days)
            except Exception:
                days_old = 0
        scores['age'] = min(days_old * 10, 100)  # 10 days = max score
        
        # 4. Cluster Size Score (more duplicates = more urgent)
        cluster_size = issue.get('clusterSize', 0) or 0
        try:
            cluster_size = int(cluster_size)
        except (ValueError, TypeError):
            cluster_size = 0
        scores['cluster_size'] = min(max(0, cluster_size) * 15, 100)
        
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
