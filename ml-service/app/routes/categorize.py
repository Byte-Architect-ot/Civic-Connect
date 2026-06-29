from fastapi import APIRouter
from pydantic import BaseModel
from app.models.nlp import IssueClassifier

router = APIRouter()
classifier = IssueClassifier()

class IssueText(BaseModel):
    title: str
    description: str

@router.post("/analyze")
async def analyze_issue(data: IssueText):
    """
    Auto-categorize and detect severity from text
    """
    result = classifier.analyze_full(data.title, data.description)
    return result

@router.post("/category-only")
async def categorize_only(data: IssueText):
    """
    Just predict category
    """
    text = f"{data.title}. {data.description}"
    result = classifier.categorize(text)
    return result

@router.post("/severity-only")
async def severity_only(data: IssueText):
    """
    Just predict severity/priority
    """
    text = f"{data.title}. {data.description}"
    result = classifier.detect_severity(text)
    return result