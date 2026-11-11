from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from app.models.scoring import DynamicScorer

router = APIRouter()
scorer = DynamicScorer()

class IssueForScoring(BaseModel):
    id: Optional[str] = "temp"
    priority: Optional[str] = "Medium"
    upvotes: Optional[int] = 0
    reportedAt: Optional[str] = None
    status: Optional[str] = "Pending"
    clusterSize: Optional[int] = 0

def dump_model(model: BaseModel) -> dict:
    if hasattr(model, 'model_dump'):
        return model.model_dump()
    return model.dict()

@router.post("/calculate-urgency")
async def calculate_urgency(issue: IssueForScoring):
    """
    Calculate dynamic urgency score for a single issue
    """
    data = dump_model(issue)
    result = scorer.calculate_urgency_score(data)
    return result

@router.post("/rank-issues")
async def rank_issues(issues: List[IssueForScoring]):
    """
    Rank multiple issues by urgency
    """
    scored_issues = []
    
    for issue in issues:
        data = dump_model(issue)
        score_data = scorer.calculate_urgency_score(data)
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
