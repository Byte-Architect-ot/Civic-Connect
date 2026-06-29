from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from app.models.scoring import DynamicScorer

router = APIRouter()
scorer = DynamicScorer()

class IssueForScoring(BaseModel):
    id: str
    priority: str
    upvotes: int
    reportedAt: str
    status: str
    clusterSize: Optional[int] = 0

@router.post("/calculate-urgency")
async def calculate_urgency(issue: IssueForScoring):
    """
    Calculate dynamic urgency score for a single issue
    """
    result = scorer.calculate_urgency_score(issue.dict())
    return result

@router.post("/rank-issues")
async def rank_issues(issues: List[IssueForScoring]):
    """
    Rank multiple issues by urgency
    """
    scored_issues = []
    
    for issue in issues:
        score_data = scorer.calculate_urgency_score(issue.dict())
        scored_issues.append({
            'id': issue.id,
            'urgencyScore': score_data['urgency_score'],
            'urgencyLevel': score_data['level']
        })
    
    # Sort by score descending
    scored_issues.sort(key=lambda x: x['urgencyScore'], reverse=True)
    
    return {
        'rankedIssues': scored_issues,
        'total': len(scored_issues)
    }