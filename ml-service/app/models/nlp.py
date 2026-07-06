import re
from typing import Dict

class IssueClassifier:
    def __init__(self):
        self.categories = [
            'Roads', 'Garbage', 'Water', 
            'Electricity', 'Public Health', 'Others'
        ]
        
        # Keyword mappings for zero-shot simulated categorization
        self.category_keywords = {
            'Roads': ['road', 'pothole', 'street', 'traffic', 'signal', 'bridge', 'pavement', 'asphalt'],
            'Garbage': ['garbage', 'trash', 'waste', 'dump', 'bin', 'litter', 'smell', 'sweep'],
            'Water': ['water', 'pipe', 'leak', 'drainage', 'sewage', 'flood', 'supply', 'plumbing'],
            'Electricity': ['electricity', 'power', 'wire', 'pole', 'light', 'outage', 'spark', 'voltage'],
            'Public Health': ['health', 'mosquito', 'disease', 'stray', 'dog', 'animal', 'hospital', 'clinic', 'hygiene']
        }
        
        self.severity_keywords = {
            'Critical': [
                'dangerous', 'urgent', 'emergency', 'severe', 'collapsed',
                'exposed wire', 'live wire', 'explosion', 'fire', 'flood',
                'sewage overflow', 'toxic', 'hazardous', 'life threatening'
            ],
            'High': [
                'broken', 'damaged', 'leaking', 'major', 'serious',
                'no water', 'power outage', 'traffic jam', 'accident'
            ],
            'Medium': [
                'pothole', 'streetlight', 'minor', 'regular', 'normal',
                'maintenance', 'repair needed'
            ],
            'Low': [
                'cosmetic', 'small', 'aesthetic', 'paint', 'sign',
                'suggestion', 'improvement'
            ]
        }
    
    def categorize(self, text: str) -> Dict[str, any]:
        """
        Classify issue category using lightweight keyword NLP
        """
        text_lower = text.lower()
        scores = {cat: 0 for cat in self.categories}
        
        for category, keywords in self.category_keywords.items():
            for keyword in keywords:
                if re.search(r'\b' + re.escape(keyword) + r'\b', text_lower):
                    scores[category] += 1
                    
        max_score = max(scores.values())
        if max_score == 0:
            best_cat = 'Others'
        else:
            best_cat = max(scores, key=scores.get)
            
        # Normalize scores to look like probabilities
        total = sum(scores.values()) or 1
        normalized_scores = {k: round(v / total, 3) for k, v in scores.items()}
        
        # Boost the winning score to seem more confident if we have matches
        confidence = 0.45 if max_score == 0 else round(0.5 + (0.1 * max_score), 3)
        confidence = min(confidence, 0.98) # max 98%
        
        return {
            'category': best_cat,
            'confidence': confidence,
            'all_scores': normalized_scores
        }
    
    def detect_severity(self, text: str) -> Dict[str, any]:
        """
        Detect severity/priority based on keywords and context
        """
        text_lower = text.lower()
        scores = {'Critical': 0, 'High': 0, 'Medium': 0, 'Low': 0}
        
        for priority, keywords in self.severity_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    scores[priority] += 1
        
        max_score = max(scores.values())
        if max_score == 0:
            priority = 'Medium'
        else:
            priority = max(scores, key=scores.get)
        
        return {
            'priority': priority,
            'confidence': round((scores[priority] + 1) / (max_score + 2), 3),
            'keyword_matches': scores
        }
    
    def analyze_full(self, title: str, description: str) -> Dict:
        """
        Complete analysis: category + severity
        """
        combined_text = f"{title}. {description}"
        
        category_result = self.categorize(combined_text)
        severity_result = self.detect_severity(combined_text)
        
        return {
            'category': category_result['category'],
            'category_confidence': category_result['confidence'],
            'priority': severity_result['priority'],
            'priority_confidence': severity_result['confidence'],
            'analysis': {
                'category_breakdown': category_result['all_scores'],
                'severity_indicators': severity_result['keyword_matches']
            }
        }