from transformers import pipeline
from typing import Dict, Tuple
import re

class IssueClassifier:
    def __init__(self):
        import torch
        # Limit threads to save memory in constrained environments
        torch.set_num_threads(1)
        
        # Using zero-shot classification with a smaller model to fit in 512MB RAM limit
        self.classifier = pipeline(
            "zero-shot-classification",
            model="typeform/distilbert-base-uncased-mnli"
        )
        
        self.categories = [
            'Roads', 'Garbage', 'Water', 
            'Electricity', 'Public Health', 'Others'
        ]
        
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
        Classify issue category using NLP
        """
        result = self.classifier(text, self.categories)
        
        return {
            'category': result['labels'][0],
            'confidence': round(result['scores'][0], 3),
            'all_scores': dict(zip(result['labels'], 
                                 [round(s, 3) for s in result['scores']]))
        }
    
    def detect_severity(self, text: str) -> Dict[str, any]:
        """
        Detect severity/priority based on keywords and context
        """
        text_lower = text.lower()
        scores = {'Critical': 0, 'High': 0, 'Medium': 0, 'Low': 0}
        
        # Keyword matching
        for priority, keywords in self.severity_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    scores[priority] += 1
        
        # Determine priority
        max_score = max(scores.values())
        if max_score == 0:
            priority = 'Medium'  # Default
        else:
            priority = max(scores, key=scores.get)
        
        return {
            'priority': priority,
            'confidence': round(scores[priority] / (max_score + 1), 3),
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