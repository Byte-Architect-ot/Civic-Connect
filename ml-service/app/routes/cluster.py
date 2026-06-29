from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from app.models.clustering import DuplicateDetector

router = APIRouter()
detector = DuplicateDetector(eps_km=0.5, min_samples=2)

class Issue(BaseModel):
    id: str
    lat: float
    lng: float
    title: str

class NewIssueCheck(BaseModel):
    lat: float
    lng: float
    existingIssues: List[Issue]

@router.post("/detect-duplicates")
async def detect_duplicates(data: NewIssueCheck):
    """
    Check if a new issue is near existing ones
    """
    duplicates = detector.find_duplicates_for_new_issue(
        new_lat=data.lat,
        new_lng=data.lng,
        existing_issues=[issue.dict() for issue in data.existingIssues],
        max_distance_km=0.5
    )
    
    return {
        'hasDuplicates': len(duplicates) > 0,
        'duplicates': duplicates,
        'count': len(duplicates)
    }

@router.post("/cluster-all")
async def cluster_all_issues(issues: List[Issue]):
    """
    Group all issues into spatial clusters
    """
    if len(issues) < 2:
        return {'clusters': {}, 'totalClusters': 0}
    
    clusters = detector.find_clusters([issue.dict() for issue in issues])
    
    return {
        'clusters': clusters,
        'totalClusters': len(clusters),
        'clusteredIssues': sum(len(v) for v in clusters.values())
    }